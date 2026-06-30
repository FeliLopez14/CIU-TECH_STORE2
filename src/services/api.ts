import type { Comment, CreatePostPayload, Post, User } from '../types/social'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getEndpoint(path: string) {
  return `${API_BASE_URL}${path}`
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getEndpoint(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const rawText = await response.text()
  const payload = rawText ? tryParse(rawText) : null

  if (!response.ok) {
    const message = extractMessage(payload) ?? 'No se pudo completar la operación.'
    throw new ApiError(message, response.status)
  }

  return payload as T
}

function tryParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function extractMessage(payload: unknown) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    for (const key of ['message', 'mensaje', 'error', 'detail']) {
      const candidate = (payload as Record<string, unknown>)[key]
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate
      }
    }
  }

  return null
}

function getCollection(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    for (const key of ['data', 'items', 'content', 'results']) {
      const candidate = (payload as Record<string, unknown>)[key]
      if (Array.isArray(candidate)) {
        return candidate
      }
    }
  }

  return [] as unknown[]
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function readBoolean(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') {
      return value
    }
  }

  return true
}

function readNestedString(value: unknown, keys: string[]) {
  if (!value || typeof value !== 'object') {
    return ''
  }

  return readString(value as Record<string, unknown>, keys)
}

function normalizeAssetUrl(url: string) {
  if (!url) {
    return undefined
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url
  }

  return `/${url}`
}

function readTags(record: Record<string, unknown>) {
  const rawTags = record.etiquetas ?? record.tags ?? record.tagList

  if (!Array.isArray(rawTags)) {
    return []
  }

  return rawTags
    .map((tag) => {
      if (typeof tag === 'string') {
        return tag.trim()
      }

      if (tag && typeof tag === 'object') {
        return readString(tag as Record<string, unknown>, ['nombre', 'name'])
      }

      return ''
    })
    .filter(Boolean)
}

function readImageUrl(record: Record<string, unknown>) {
  const direct = readString(record, ['imageUrl', 'image', 'imagen', 'photoUrl', 'url'])
  if (direct) {
    return normalizeAssetUrl(direct)
  }

  const images = record.imagenes
  if (!Array.isArray(images)) {
    return undefined
  }

  for (const image of images) {
    if (image && typeof image === 'object') {
      const url = readString(image as Record<string, unknown>, ['url', 'imageUrl'])
      if (url) {
        return normalizeAssetUrl(url)
      }
    }
  }

  return undefined
}

function normalizeUser(raw: unknown): User {
  const record = (raw ?? {}) as Record<string, unknown>

  return {
    id: readString(record, ['_id', 'id', 'userId']),
    nickname: readString(record, ['nickName', 'nickname']),
  }
}

function normalizePost(raw: unknown): Post {
  const record = (raw ?? {}) as Record<string, unknown>
  const nestedUser = record.usuarioId

  return {
    id: readString(record, ['_id', 'id', 'postId']),
    userId:
      readString(record, ['usuarioId', 'userId']) || readNestedString(nestedUser, ['_id', 'id']),
    nickname:
      readString(record, ['nickName', 'nickname']) || readNestedString(nestedUser, ['nickName']),
    description: readString(record, ['descripcion', 'description', 'content']),
    imageUrl: readImageUrl(record),
    tags: readTags(record),
    likes: 0,
    commentsCount: getCollection(record.comentarios).length,
    createdAt: readString(record, ['fechaCreacion', 'createdAt']) || undefined,
    raw: record,
  }
}

function normalizeComment(raw: unknown): Comment {
  const record = (raw ?? {}) as Record<string, unknown>
  const nestedUser = record.usuarioId
  const nestedPost = record.postId

  return {
    id: readString(record, ['_id', 'id', 'commentId']),
    postId:
      readString(record, ['postId']) || readNestedString(nestedPost, ['_id', 'id']),
    userId:
      readString(record, ['usuarioId', 'userId']) || readNestedString(nestedUser, ['_id', 'id']),
    nickname:
      readString(record, ['nickName', 'nickname']) || readNestedString(nestedUser, ['nickName']),
    content: readString(record, ['contenido', 'content', 'comment']),
    visible: readBoolean(record, ['visible']),
    createdAt: readString(record, ['fechaComentario', 'createdAt']) || undefined,
  }
}

export async function fetchUsers() {
  const response = await apiRequest<unknown>('/usuarios')
  return getCollection(response).map(normalizeUser).filter((user) => user.id && user.nickname)
}

export async function createUser(nickname: string) {
  const response = await apiRequest<unknown>('/usuarios', {
    method: 'POST',
    body: JSON.stringify({ nickName: nickname }),
  })

  return normalizeUser(response)
}

export async function fetchPosts() {
  const response = await apiRequest<unknown>('/posts')

  return getCollection(response)
    .map(normalizePost)
    .filter((post) => post.id && post.description)
}

export async function fetchFeed(userId: string) {
  const response = await apiRequest<unknown>(`/usuarios/${userId}/feed`)

  return getCollection(response)
    .map(normalizePost)
    .filter((post) => post.id && post.description)
}

export async function fetchPostById(id: string) {
  const response = await apiRequest<unknown>(`/posts/${id}`)
  return normalizePost(response)
}

export async function fetchPostDetailById(id: string) {
  const response = await apiRequest<unknown>(`/posts/${id}`)
  const record = (response ?? {}) as Record<string, unknown>

  return {
    post: normalizePost(response),
    comments: getCollection(record.comentarios)
      .map(normalizeComment)
      .filter((comment) => comment.visible),
  }
}

export async function fetchComments(postId?: string) {
  const response = await apiRequest<unknown>('/comentarios')
  const comments = getCollection(response)
    .map(normalizeComment)
    .filter((comment) => comment.visible)

  if (!postId) {
    return comments
  }

  return comments.filter((comment) => comment.postId === postId)
}

export async function createComment(postId: string, content: string, user: User) {
  const response = await apiRequest<unknown>(`/posts/${postId}/comentarios`, {
    method: 'POST',
    body: JSON.stringify({ contenido: content, usuarioId: user.id }),
  })

  return normalizeComment({
    ...((response ?? {}) as Record<string, unknown>),
    usuarioId: { _id: user.id, nickName: user.nickname },
  })
}

export async function createPost(payload: CreatePostPayload, user: User) {
  const createdPostResponse = await apiRequest<unknown>('/posts', {
    method: 'POST',
    body: JSON.stringify({ descripcion: payload.description, usuarioId: user.id }),
  })

  const createdPost = normalizePost({
    ...((createdPostResponse ?? {}) as Record<string, unknown>),
    usuarioId: { _id: user.id, nickName: user.nickname },
  })

  for (const tag of payload.tags) {
    await apiRequest(`/posts/${createdPost.id}/etiquetas`, {
      method: 'POST',
      body: JSON.stringify({ nombre: tag }),
    })
  }

  if (payload.imageUrl) {
    await apiRequest(`/posts/${createdPost.id}/imagenes`, {
      method: 'POST',
      body: JSON.stringify({ url: payload.imageUrl }),
    })
  }

  return fetchPostById(createdPost.id)
}