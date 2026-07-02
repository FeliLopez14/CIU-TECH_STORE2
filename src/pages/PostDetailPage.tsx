import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createComment, fetchPostDetailById, deletePost, deleteComment } from '../services/api' 
import type { Comment, Post } from '../types/social'
import { ArrowLeft } from 'lucide-react'

export function PostDetailPage() {
  const { id = '' } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
  
  async function handleDelete() {
    const confirmDelete = window.confirm('¿Estás seguro de que querés eliminar esta publicación? Esta acción no se puede deshacer.')
    if (!confirmDelete) return

    setIsDeleting(true)
    setError('')

    try {
      await deletePost(id) 
      navigate('/') 
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos eliminar la publicación.',
      )
      setIsDeleting(false)
    }
  }

  // Función para volver al perfil asegurando que 'post' no sea null
  const handleVolver = () => {
    if (post && post.userId) {
      navigate(`/profile/${post.userId}`);
    } else {
      navigate(-1);
    }
  };

  async function handleDeleteComment(commentId: string) {
    const confirmDelete = window.confirm('¿Estás seguro de que querés eliminar este comentario? Esta acción no se puede deshacer.')
    if (!confirmDelete) return    

    try {
      await deleteComment(commentId)
      
      setComments((currentComments) => currentComments.filter((c) => c.id !== commentId))
      setPost((currentPost) =>
        currentPost ? { ...currentPost, commentsCount: currentPost.commentsCount - 1 } : currentPost,
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos eliminar el comentario.',
      )
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="back-button" onClick={handleVolver} title="Volver">
                <ArrowLeft size={20} />
              </button>

              <div>
                <p className="meta-text"> Publicado por</p>
                <h2 className="section-title">@{post.nickname || 'sin-apodo'}</h2>
              </div>
            </div>

            {isOwner ? (
              <div className="actions-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Link className="secondary-button" to={`/post/${post.id}/edit`}>
                  Editar publicación
                </Link>
                <button 
                  className="danger-button" 
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

        <aside className="panel">
          <div>
            <p className="eyebrow">Comentarios</p>
          </div>

          {!comments.length ? (
            <div className="empty-card">
              <p className="empty-text">Este post todavía no tiene comentarios visibles.</p>
            </div>
          ) : (
            <ul className="comment-list">
              {comments.map((comment) => (
                <li key={comment.id} className="comment-card">
                  <div className="comment-head">
                    <strong>@{comment.nickname || 'anonimo'}</strong>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="meta-text">Comentario</span>
                      
                      {currentUser?.id === comment.userId && (
                        <button 
                          type="button"
                          className="danger-button" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="body-copy">{comment.content}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>

      </section>
    </div>
  )
}