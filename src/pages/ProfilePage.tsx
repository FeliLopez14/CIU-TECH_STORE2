import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PostCard } from '../components/PostCard'
import { useAuth } from '../hooks/useAuth'
import { fetchComments, fetchPosts } from '../services/api'
import type { Post } from '../types/social'

export function ProfilePage() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const [postList, commentList] = await Promise.all([fetchPosts(), fetchComments()])
        const commentsByPost = commentList.reduce<Record<string, number>>((accumulator, comment) => {
          accumulator[comment.postId] = (accumulator[comment.postId] ?? 0) + 1
          return accumulator
        }, {})

        const ownPosts = postList
          .filter(
            (post) =>
              post.userId === currentUser.id ||
              post.nickname.toLowerCase() === currentUser.nickname.toLowerCase(),
          )
          .map((post) => ({
            ...post,
            commentsCount: commentsByPost[post.id] ?? post.commentsCount,
          }))

        setPosts(ownPosts)
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No pudimos cargar tu perfil.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [currentUser])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="profile-layout">
      <aside className="feed-side">
        <section className="panel">
          <p className="eyebrow">Perfil</p>
          <h2 className="section-title">@{currentUser.nickname}</h2>
          <p className="muted">Tus datos quedan guardados en contexto global y localStorage.</p>

          <div className="stat-grid">
            <article className="stat-card">
              <span className="eyebrow">Tus posts</span>
              <p className="stat-value">{posts.length}</p>
            </article>
            <article className="stat-card">
              <span className="eyebrow">Comentarios visibles</span>
              <p className="stat-value">{posts.reduce((sum, post) => sum + post.commentsCount, 0)}</p>
            </article>
          </div>

          <div className="profile-actions">
            <button type="button" className="primary-button" onClick={() => navigate('/create')}>
              Crear publicación
            </button>
            <button type="button" className="ghost-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </section>
      </aside>

      <section className="feed-main">
        <div className="info-strip">
          <p className="eyebrow">Tu contenido</p>
          <h3 className="card-title">Publicaciones del usuario actual</h3>
        </div>

        {isLoading ? <div className="loader">Cargando tus publicaciones...</div> : null}
        {error ? <div className="error-banner">{error}</div> : null}

        {!isLoading && !error && !posts.length ? (
          <div className="empty-card">
            <h3 className="card-title">Todavía no publicaste nada</h3>
            <p className="empty-text">Usá el botón Crear publicación para abrir tu primer post.</p>
          </div>
        ) : null}

        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}