import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createComment, fetchPostDetailById } from '../services/api'
import type { Comment, Post } from '../types/social'

export function PostDetailPage() {
  const { id = '' } = useParams()
  const { currentUser } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadPostDetail() {
      setIsLoading(true)
      setError('')

      try {
        const { post: postResponse, comments: commentsResponse } = await fetchPostDetailById(id)
        setPost({ ...postResponse, commentsCount: commentsResponse.length })
        setComments(commentsResponse)
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No pudimos cargar el detalle del post.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadPostDetail()
  }, [id])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!content.trim() || !currentUser) {
      setError('Escribí un comentario antes de enviarlo.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const createdComment = await createComment(id, content.trim(), currentUser)
      setComments((currentComments) => [createdComment, ...currentComments])
      setPost((currentPost) =>
        currentPost ? { ...currentPost, commentsCount: currentPost.commentsCount + 1 } : currentPost,
      )
      setContent('')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos agregar el comentario.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="loader">Cargando publicación...</div>
  }

  if (error && !post) {
    return <div className="error-banner">{error}</div>
  }

  if (!post) {
    return (
      <div className="empty-card">
        <h2 className="section-title">No encontramos este post</h2>
      </div>
    )
  }

  return (
    <div className="detail-layout">
      <section className="detail-main">
        <article className="detail-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Detalle</p>
              <h2 className="section-title">@{post.nickname || 'sin-apodo'}</h2>
            </div>
            <span className="meta-chip">{post.commentsCount} comentarios</span>
          </div>

          {post.imageUrl ? <img className="detail-image" src={post.imageUrl} alt={post.description} /> : null}

          <p className="body-copy">{post.description}</p>

          {post.tags.length ? (
            <div className="tag-row">
              {post.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </article>

        <section className="composer">
          <div>
            <p className="eyebrow">Nuevo comentario</p>
            <h3 className="card-title">Sumate a la conversación</h3>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="comment-content">Comentario</label>
              <textarea
                id="comment-content"
                rows={4}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Escribí algo para este post"
              />
            </div>

            {error ? <div className="error-banner">{error}</div> : null}

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Publicando...' : 'Agregar comentario'}
              </button>
            </div>
          </form>
        </section>
      </section>

      <aside className="panel">
        <div>
          <p className="eyebrow">Comentarios</p>
          <h3 className="card-title">Visibles en la API</h3>
        </div>

        {!comments.length ? (
          <div className="empty-card">
            <p className="empty-text">Este post todavía no tiene comentarios visibles.</p>
          </div>
        ) : (
          <div className="comment-list">
            {comments.map((comment) => (
              <article key={comment.id} className="comment-card">
                <div className="comment-head">
                  <strong>@{comment.nickname || 'anonimo'}</strong>
                  <span className="meta-text">Comentario</span>
                </div>
                <p className="body-copy">{comment.content}</p>
              </article>
            ))}
          </div>
        )}
      </aside>
    </div>
  )
}