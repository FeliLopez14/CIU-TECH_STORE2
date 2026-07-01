// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { createPost } from '../services/api'

// export function CreatePostPage() {
//   const navigate = useNavigate()
//   const { currentUser, refreshFullUser } = useAuth()
//   const [description, setDescription] = useState('')
//   const [images, setImages] = useState<File[]>([])
//   const [tags, setTags] = useState('')
//   const [error, setError] = useState('')
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault()

//     if (!description.trim() || !currentUser) {
//       setError('La descripción es obligatoria para crear la publicación.')
//       return
//     }

//     setIsSubmitting(true)
//     setError('')

//     try {
//       const createdPost = await createPost(
//         {
//           description: description.trim(),
//           images,
//           tags: tags
//             .split(',')
//             .map((tag) => tag.trim())
//             .filter(Boolean),
//         },
//         currentUser,
//       )
//       await refreshFullUser()

//       navigate(`/post/${createdPost.id}`, { replace: true })
//     } catch (requestError) {
//       setError(
//         requestError instanceof Error
//           ? requestError.message
//           : 'No pudimos publicar el contenido.',
//       )
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <section className="composer">
//       <div>
//         <p className="eyebrow">Nueva publicación</p>
//         <h2 className="section-title">Contá qué está pasando</h2>
//         <p className="muted">La API crea el post primero y luego asocia etiquetas e imagen por URL.</p>
//       </div>

//       <form className="form-grid" onSubmit={handleSubmit}>
//         <div className="field">
//           <label htmlFor="post-description">Descripción</label>
//           <textarea
//             id="post-description"
//             rows={6}
//             value={description}
//             onChange={(event) => setDescription(event.target.value)}
//             placeholder="Escribí tu publicación"
//           />
//         </div>

//         <div className="field">
//           <label>Imágenes</label>

//           <label htmlFor="post-images" className="secondary-button">
//             Seleccionar imágenes
//           </label>

//           <input
//             id="post-images"
//             type="file"
//             accept="image/*"
//             multiple
//             hidden
//             onChange={(event) => {
//               const selectedFiles = Array.from(event.target.files ?? [])
//               setImages((prevImages) => [...prevImages, ...selectedFiles])
//               event.target.value = ''
//             }}
//           />

//           {images.length > 0 ? (
//             <p className="muted">
//               {images.length} imagen{images.length > 1 ? 'es seleccionadas' : ' seleccionada'}
//             </p>
//           ) : null}
//         {images.length > 0 ? (
//           <div className="image-preview-grid">
//             {images.map((image, index) => (
//               <div className="image-preview-card" key={`${image.name}-${index}`}>
//                 <img src={URL.createObjectURL(image)} alt={`Vista previa ${index + 1}`} />
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setImages((currentImages) =>
//                       currentImages.filter((_, imageIndex) => imageIndex !== index),
//                   )
//                 }}
//                 >
//                   Quitar
//                 </button>
//               </div>
//             ))}
//           </div>
//         ) : null}
//         </div>

//         <div className="field">
//           <label htmlFor="post-tags">Etiquetas</label>
//           <input
//             id="post-tags"
//             value={tags}
//             onChange={(event) => setTags(event.target.value)}
//             placeholder="unahur, retro, comunidad"
//           />
//         </div>

//         {error ? <div className="error-banner">{error}</div> : null}

//         <div className="form-actions">
//           <button type="submit" className="primary-button" disabled={isSubmitting}>
//             {isSubmitting ? 'Publicando...' : 'Publicar'}
//           </button>
//         </div>
//       </form>
//     </section>
//   )
// }
import { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createPost } from '../services/api'

const MAX_DESCRIPTION_LENGTH = 500

export function CreatePostPage() {
  const navigate = useNavigate()
  const { currentUser, refreshFullUser } = useAuth()

  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const imagePreviews = useMemo(
    () =>
      images.map((image) => ({
        file: image,
        url: URL.createObjectURL(image),
      })),
    [images],
  )

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [imagePreviews])

  function handleAddTag() {
    const newTag = tagInput.trim()

    if (!newTag || tags.includes(newTag)) {
      setTagInput('')
      return
    }

    setTags((currentTags) => [...currentTags, newTag])
    setTagInput('')
  }

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
          images,
          tags,
        },
        currentUser,
      )

      await refreshFullUser()

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
        <p className="eyebrow">Crear publicación</p>
        <h2 className="section-title">¿Qué querés compartir hoy?</h2>
        {/* <p className="muted">
          Escribí una descripción, agregá imágenes si querés y sumá etiquetas separadas por coma.
        </p> */}
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="post-description">Descripción</label>
          <textarea
            id="post-description"
            rows={6}
            value={description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Escribí tu publicación"
          />
          <p className="character-counter">
            {description.length} / {MAX_DESCRIPTION_LENGTH}
          </p>
        </div>

        <div className="field">
          <label>Imágenes</label>

          <label htmlFor="post-images" className="secondary-button file-button">
            Seleccionar imágenes
          </label>

          <input
            id="post-images"
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              const selectedFiles = Array.from(event.target.files ?? [])
              setImages((prevImages) => [...prevImages, ...selectedFiles])
              event.target.value = ''
            }}
          />

          {images.length > 0 ? (
            <p className="muted">
              {images.length} imagen{images.length > 1 ? 'es seleccionadas' : ' seleccionada'}
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
                      setImages((currentImages) =>
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
          <label htmlFor="post-tags">Etiquetas</label>

          <div className="tag-composer">
            <input
              id="post-tags"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="unahur, retro, comunidad"
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

          {tags.length > 0 ? (
            <div className="tag-row">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="tag-chip removable-tag"
                  onClick={() => setTags((currentTags) => currentTags.filter((item) => item !== tag))}
                >
                  #{tag} ×
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="form-actions">
          <button type="submit" className="primary-button publish-button" disabled={isSubmitting}>
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </section>
  )
}