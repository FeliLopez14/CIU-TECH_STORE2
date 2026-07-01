import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom' // 👈 Agregamos useNavigate
import { useAuth } from '../hooks/useAuth'
import { createComment, fetchPostDetailById, deletePost } from '../services/api' // 👈 Agregamos deletePostById
import type { Comment, Post } from '../types/social'

export function PostDetailPage() {
  const { id = '' } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate() // 👈 Inicializamos el navegador
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false) // 👈 Estado para controlar la carga al eliminar

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

  // 👈 Nueva función para manejar la eliminación del posteo
  async function handleDelete() {
  const confirmDelete = window.confirm('¿Estás seguro de que querés eliminar esta publicación? Esta acción no se puede deshacer.')
  if (!confirmDelete) return

  setIsDeleting(true)
  setError('')

  try {
    // 👇 Acá usamos la función que encontraste
    await deletePost(id) 
    navigate('/') // Te manda al inicio después de borrar
  } catch (requestError) {
    setError(
      requestError instanceof Error
        ? requestError.message
        : 'No pudimos eliminar la publicación.',
    )
    setIsDeleting(false)
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

  const isOwner =
    currentUser &&
    (post.userId === currentUser.id ||
      post.nickname.toLowerCase() === currentUser.nickname.toLowerCase())

  return (
    <div className="detail-layout">
      <section className="detail-main">
        <article className="detail-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Detalle</p>
              <h2 className="section-title">@{post.nickname || 'sin-apodo'}</h2>
            </div>

            {/* 👇 Agrupamos los botones de acción para que queden alineados */}
            {isOwner ? (
              <div className="actions-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Link className="secondary-button" to={`/post/${post.id}/edit`}>
                  Editar publicación
                </Link>
                <button 
                  className="danger-button" // Podés definir esta clase en tu CSS para ponerlo en rojo
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{ cursor: 'pointer' }}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            ) : null}
          </div>

          {post.imageUrl ? (
            <img className="detail-image" src={post.imageUrl} alt={post.description} />
          ) : null}

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

        {/* ... El resto del componente de comentarios se mantiene exactamente igual ... */}
        <section className="composer">
          <div>
            <p className="eyebrow">Nuevo comentario</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
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