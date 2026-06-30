import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createPost } from '../services/api'

export function CreatePostPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!description.trim() || !currentUser) {
      setError('La descripción es obligatoria para crear la publicación.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const createdPost = await createPost(
        {
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
        currentUser,
      )

      navigate(`/post/${createdPost.id}`, { replace: true })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos publicar el contenido.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="composer">
      <div>
        <p className="eyebrow">Nueva publicación</p>
        <h2 className="section-title">Contá qué está pasando</h2>
        <p className="muted">La API crea el post primero y luego asocia etiquetas e imagen por URL.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="post-description">Descripción</label>
          <textarea
            id="post-description"
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Escribí tu publicación"
          />
        </div>

        <div className="field">
          <label htmlFor="post-image">Imagen por URL</label>
          <input
            id="post-image"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="field">
          <label htmlFor="post-tags">Etiquetas</label>
          <input
            id="post-tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="unahur, retro, comunidad"
          />
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </section>
  )
}