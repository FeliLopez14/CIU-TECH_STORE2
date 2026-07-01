export type ThemeMode = 'light' | 'dark'

export interface User {
  id: string
  nickname: string
  seguidores?: User[]
  seguidos?: User[]
}

export interface PostImage {
  id: string
  url: string
}

export interface PostTag {
  id: string
  name: string
}

export interface Post {
  id: string
  userId: string
  nickname: string
  description: string
  imageUrl?: string
  imageItems: PostImage[]
  tags: string[]
  tagItems: PostTag[]
  likes: number
  commentsCount: number
  createdAt?: string
  raw?: Record<string, unknown>
}

export interface Comment {
  id: string
  postId: string
  userId: string
  nickname: string
  content: string
  visible: boolean
  createdAt?: string
}

export interface CreatePostPayload {
  description: string
  images: File[]
  tags: string[]
}

export interface ApiMessageError {
  message: string
}