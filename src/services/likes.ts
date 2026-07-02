const STORAGE_KEY = 'unahur-anti-social-net:likes'

interface LikeStore {
  counts: Record<string, number> // Global para este navegador
  likedUsers: Record<string, Record<string, boolean>> // Separado por usuario y por post
}

function getStore(): LikeStore {
  const fallback: LikeStore = { counts: {}, likedUsers: {} }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return fallback

  try {
    return { ...fallback, ...(JSON.parse(raw) as LikeStore) }
  } catch {
    return fallback
  }
}

function setStore(store: LikeStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

// 1. El contador busca en el registro global del navegador
export function getPostLikes(postId: string, fallback = 0) {
  const store = getStore()
  return store.counts[postId] ?? fallback
}

// 2. El chequeo de si dio like mira el ID del usuario específico
export function hasLikedPost(postId: string, userId: string) {
  const store = getStore()
  const userLikes = store.likedUsers[userId] || {}
  return Boolean(userLikes[postId])
}

// 3. Registrar el like actualiza el total global y marca al usuario
export function registerPostLike(postId: string, userId: string, nextLikes: number) {
  const store = getStore()
  
  // Guardamos el contador global del post
  store.counts[postId] = nextLikes
  
  // Aseguramos que exista el registro para este usuario y marcamos true
  if (!store.likedUsers[userId]) store.likedUsers[userId] = {}
  store.likedUsers[userId][postId] = true
  
  setStore(store)
}

// 4. Remover el like actualiza el total global y desmarca al usuario
export function removePostLike(postId: string, userId: string, nextLikes: number) {
  const store = getStore()
  
  // Guardamos el contador global del post
  store.counts[postId] = nextLikes
  
  // Desmarcamos el like de este usuario
  if (store.likedUsers[userId]) {
    store.likedUsers[userId][postId] = false
  }
  
  setStore(store)
}