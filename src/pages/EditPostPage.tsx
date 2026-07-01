import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  addPostTag,
  deletePost,
  deletePostImage,
  fetchPostById,
  removePostTag,
  updatePostDescription,
  uploadPostImage,
} from '../services/api'
import type { Post } from '../types/social'

const MAX_DESCRIPTION_LENGTH = 500

export function EditPostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, refreshFullUser } = useAuth()

  const [post, setPost] = useState<Post | null>(null)
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [newImages, setNewImages] = useState<File[]>([])
  const [imageIdsToDelete, setImageIdsToDelete] = useState<string[]>([])
  const imagePreviews = useMemo(
    () =>
      newImages.map((image) => ({
        file: image,
        url: URL.createObjectURL(image),
      })),
    [newImages],
  )

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [imagePreviews])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadPost() {
      if (!id) return

      try {
        setIsLoading(true)
        setError('')

        const postData = await fetchPostById(id)

        setPost(postData)
        setDescription(postData.description)
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No pudimos cargar la publicación.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadPost()
  }, [id])

  async function handleSave() {
    if (!id || !description.trim()) {
      setError('La descripción no puede quedar vacía.')
      return
    }

    try {
      setIsSaving(true)
      setError('')

      let updatedPost = await updatePostDescription(id, description.trim())

      for (const imageId of imageIdsToDelete) {
        updatedPost = await deletePostImage(id, imageId)
      }

      for (const image of newImages) {
        updatedPost = await uploadPostImage(id, image)
      }

      setPost(updatedPost)
      setDescription(updatedPost.description)
      setNewImages([])
      setImageIdsToDelete([])

      await refreshFullUser()

      navigate(`/post/${id}`, { replace: true })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos guardar los cambios.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAddTag() {
    if (!id || !tagInput.trim()) return

    try {
      setError('')
      const updatedPost = await addPostTag(id, tagInput.trim())
      setPost(updatedPost)
      setTagInput('')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos agregar la etiqueta.',
      )
    }
  }

  async function handleRemoveTag(tagId: string) {
    if (!id || !post) return

    const previousPost = post

    setPost({
      ...post,
      tagItems: post.tagItems.filter((tag) => tag.id !== tagId),
      tags: post.tags.filter(
        (tagName) => tagName !== post.tagItems.find((tag) => tag.id === tagId)?.name,
      ),
    })

    try {
      await removePostTag(id, tagId)
    } catch (requestError) {
      setPost(previousPost)

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos eliminar la etiqueta.',
      )
    }
  }

  function handleDeleteImage(imageId: string) {
    setImageIdsToDelete((currentIds) => [...currentIds, imageId])
  }

  async function handleDeletePost() {
    if (!id) return

    const confirmed = window.confirm('¿Seguro que querés eliminar esta publicación?')

    if (!confirmed) return

    try {
      setError('')
      await deletePost(id)
      await refreshFullUser()
      navigate('/profile', { replace: true })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos eliminar la publicación.',
      )
    }
  }

  if (isLoading) {
    return <div className="loader">Cargando publicación...</div>
  }

  if (!post || !currentUser) {
    return <div className="error-banner">No se pudo cargar la publicación.</div>
  }

  const isOwner =
    post.userId === currentUser.id ||
    post.nickname.toLowerCase() === currentUser.nickname.toLowerCase()

  if (!isOwner) {
    return <div className="error-banner">Solo podés editar tus propias publicaciones.</div>
  }

  return (
    <section className="composer">
      <div>
        <p className="eyebrow">Editar publicación</p>
        <h2 className="section-title">Ajustá tu contenido</h2>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="edit-description">Descripción</label>
          <textarea
            id="edit-description"
            rows={6}
            value={description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(event) => setDescription(event.target.value)}
          />
          <p className="character-counter">
            {description.length} / {MAX_DESCRIPTION_LENGTH}
          </p>
        </div>

        <div className="field">
          <label>Imágenes actuales</label>

          {post.imageItems.length ? (
            <div className="image-preview-grid">
              {post.imageItems
                .filter((image) => !imageIdsToDelete.includes(image.id))
                .map((image) => (
                  <div className="image-preview-card" key={image.id}>
                    <img src={image.url} alt="Imagen del post" />

                    <button
                      type="button"
                      className="image-remove-button"
                      aria-label="Eliminar imagen"
                      title="Eliminar imagen"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      X
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="muted">Esta publicación no tiene imágenes.</p>
          )}
        </div>

        <div className="field">
          <label>Agregar nuevas imágenes</label>

          <label htmlFor="edit-images" className="secondary-button file-button">
            Seleccionar imágenes
          </label>

          <input
            id="edit-images"
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              const selectedFiles = Array.from(event.target.files ?? [])
              setNewImages((currentImages) => [...currentImages, ...selectedFiles])
              event.target.value = ''
            }}
          />

          {newImages.length > 0 ? (
            <p className="muted">
              {newImages.length} imagen{newImages.length > 1 ? 'es nuevas' : ' nueva'}
            </p>
          ) : null}

          {imagePreviews.length > 0 ? (
            <div className="image-preview-grid">
              {imagePreviews.map((preview, index) => (
                <div className="image-preview-card" key={`${preview.file.name}-${index}`}>
                  <img src={preview.url} alt={`Vista previa ${index + 1}`} />

                  <button
                    type="button"
                    onClick={() => {
                      setNewImages((currentImages) =>
                        currentImages.filter((_, imageIndex) => imageIndex !== index),
                      )
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="field">
          <label>Etiquetas actuales</label>

          {post.tagItems.length ? (
            <div className="tag-row">
              {post.tagItems.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className="tag-chip removable-tag"
                  onClick={() => handleRemoveTag(tag.id)}
                >
                  #{tag.name} ×
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">Esta publicación no tiene etiquetas.</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="edit-tags">Agregar etiqueta</label>

          <div className="tag-composer">
            <input
              id="edit-tags"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="unahur"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleAddTag()
                }
              }}
            />

            <button type="button" className="secondary-button" onClick={handleAddTag}>
              Agregar
            </button>
          </div>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="form-actions">
          <button type="button" className="primary-button publish-button" onClick={handleSave}>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>

          <button type="button" className="ghost-button publish-button" onClick={handleDeletePost}>
            Eliminar publicación
          </button>
        </div>
      </div>
    </section>
  )
}