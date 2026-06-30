import { useEffect, useState } from 'react'
import { PostCard } from '../components/PostCard'
import { useAuth } from '../hooks/useAuth'
import { fetchComments, fetchFeed } from '../services/api'
import type { Post } from '../types/social'

export function HomePage() {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadFeed() {
      if (!currentUser) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const [postList, commentList] = await Promise.all([
          fetchFeed(currentUser.id),
          fetchComments(),
        ])

        const commentsByPost = commentList.reduce<Record<string, number>>((accumulator, comment) => {
          accumulator[comment.postId] = (accumulator[comment.postId] ?? 0) + 1
          return accumulator
        }, {})

        const hydratedPosts = postList
          .map((post) => ({
            ...post,
            commentsCount: commentsByPost[post.id] ?? post.commentsCount,
          }))
          .sort((left, right) => (right.createdAt ?? '').localeCompare(left.createdAt ?? ''))

        setPosts(hydratedPosts)
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No pudimos cargar el feed en este momento.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadFeed()
  }, [currentUser])

  return (
    <div className="feed-layout">
      <aside className="feed-side">
        <section className="auth-hero">
          <div>
            <p className="eyebrow">Inicio</p>
            <h2 className="hero-title">El feed con onda retro de UNAHUR.</h2>
          </div>

          <p className="hero-copy">
            Esta vista consume el feed personalizado del backend y muestra publicaciones de los
            usuarios que seguís.
          </p>

          <div className="hero-chip-row">
            <span className="hero-chip">Feed por seguidos</span>
            <span className="hero-chip">Comentarios visibles</span>
            <span className="hero-chip">Detalle por post</span>
          </div>
        </section>

        <section className="panel">
          <div>
            <p className="eyebrow">Sobre nosotros</p>
            <h3 className="card-title">Una anti-red más humana</h3>
          </div>
          <p className="body-copy">
            Unahur ANti-social Net propone una experiencia simple para leer publicaciones,
            comentar sin fricción y crear contenido propio sin sobrecargar la interfaz.
          </p>
          <div className="tag-row">
            <span className="tag-chip">Minimalista</span>
            <span className="tag-chip">Sobria</span>
            <span className="tag-chip">Retro</span>
          </div>
        </section>
      </aside>

      <section className="feed-main">
        <div className="section-row">
          <div className="info-strip">
            <p className="eyebrow">Feed</p>
            <h2 className="section-title">Publicaciones de gente que seguís</h2>
            <p className="muted">Si todavía no seguís a nadie, este feed puede aparecer vacío.</p>
          </div>
        </div>

        {isLoading ? <div className="loader">Cargando publicaciones...</div> : null}
        {error ? <div className="error-banner">{error}</div> : null}

        {!isLoading && !error && !posts.length ? (
          <div className="empty-card">
            <h3 className="card-title">Tu feed todavía está vacío</h3>
            <p className="empty-text">El backend solo devuelve publicaciones de usuarios seguidos.</p>
          </div>
        ) : null}

        <div className="post-list">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLikeUpdated={(updatedPost) => {
                setPosts((currentPosts) =>
                  currentPosts.map((currentPost) =>
                    currentPost.id === updatedPost.id
                      ? { ...currentPost, likes: updatedPost.likes }
                      : currentPost,
                  ),
                )
              }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}