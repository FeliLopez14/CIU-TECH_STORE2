const STORAGE_KEY = 'unahur-anti-social-net:likes'

interface LikeStore {
  counts: Record<string, number>
  liked: Record<string, boolean>
}

function getStore(): LikeStore {
  const fallback: LikeStore = { counts: {}, liked: {} }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return fallback
  }

  try {
    return { ...fallback, ...(JSON.parse(raw) as LikeStore) }
  } catch {
    return fallback
  }
}

function setStore(store: LikeStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getPostLikes(postId: string, fallback = 0) {
  const store = getStore()
  return store.counts[postId] ?? fallback
}

export function hasLikedPost(postId: string) {
  const store = getStore()
  return Boolean(store.liked[postId])
}

export function registerPostLike(postId: string, nextLikes: number) {
  const store = getStore()
  store.counts[postId] = nextLikes
  store.liked[postId] = true
  setStore(store)
}