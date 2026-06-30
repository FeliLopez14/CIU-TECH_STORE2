export type ThemeMode = 'light' | 'dark'

export interface User {
  id: string
  nickname: string
}

export interface Post {
  id: string
  userId: string
  nickname: string
  description: string
  imageUrl?: string
  tags: string[]
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
  imageUrl?: string
  tags: string[]
}

export interface ApiMessageError {
  message: string
}