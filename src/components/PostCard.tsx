import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPostLikes, hasLikedPost, registerPostLike, removePostLike } from '../services/likes'
import { useAuth } from '../hooks/useAuth'

import type { Post } from '../types/social'

interface PostCardProps {
  post: Post
  onLikeUpdated?: (updatedPost: Post) => void
}

function getExcerpt(text: string) {
  if (text.length <= 180) {
    return text
  }

  return `${text.slice(0, 177)}...`
}

export function PostCard({ post, onLikeUpdated }: PostCardProps) {
  // 1. Traemos al usuario actual logueado
  const { currentUser } = useAuth()
  // Usamos un fallback vacío "" por si acaso currentUser tarda en cargar
  const currentUserId = currentUser?.id || ""

  // 2. Le pasamos el id del usuario a los estados iniciales
  // getPostLikes ya no lleva el id del usuario, usa el total global de la app
  const [likes, setLikes] = useState(() => getPostLikes(post.id, post.likes))
  // hasLikedPost SÍ lleva el id del usuario para saber si este usuario pintó el corazón
  const [liked, setLiked] = useState(() => hasLikedPost(post.id, currentUserId))

  function handleLike() {
    if (liked) {
      const nextLikes = likes - 1
      setLikes(nextLikes)
      setLiked(false)
      
      // Le pasamos el currentUserId a la función de borrado
      removePostLike(post.id, currentUserId, nextLikes)
      onLikeUpdated?.({ ...post, likes: nextLikes })
      return 
    }

    const nextLikes = likes + 1
    setLikes(nextLikes)
    setLiked(true)
    
    // Le pasamos el currentUserId a la función de guardado
    registerPostLike(post.id, currentUserId, nextLikes)
    onLikeUpdated?.({ ...post, likes: nextLikes })
  }

  return (
    <article className="post-card social-post-card">
      <header className="social-post-header">
        <div className="post-avatar">
          {(post.nickname || '?').charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="post-author">@{post.nickname || 'sin-apodo'}</p>
          <p className="post-subtitle">Buenos aires, Argentina</p>
        </div>
      </header>

      {post.imageUrl ? (
        <img className="post-card-image social-post-image" src={post.imageUrl} alt={post.description} />
      ) : null}

      <div className="social-post-body">
        <p className="body-copy">{getExcerpt(post.description)}</p>

        {post.tags.length ? (
          <div className="tag-row">
            {post.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="social-post-meta">
          <button
            type="button"
            className={`like-button${liked ? ' is-liked' : ''}`}
            onClick={handleLike}
          >
            {liked ? '♥' : '♡'} {likes}
          </button>

          {/* <span className="meta-text">{post.commentsCount} comentarios</span> */}

          <Link className="post-more-link" to={`/post/${post.id}`}>
            Ver más →
          </Link>
        </div>
      </div>
    </article>
  )
}