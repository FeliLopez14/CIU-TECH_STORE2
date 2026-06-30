import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPostLikes, hasLikedPost, registerPostLike } from '../services/likes'
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
  const [likes, setLikes] = useState(() => getPostLikes(post.id, post.likes))
  const [liked, setLiked] = useState(() => hasLikedPost(post.id))

  function handleLike() {
    if (liked) {
      return
    }

    const nextLikes = likes + 1
    setLikes(nextLikes)
    setLiked(true)
    registerPostLike(post.id, nextLikes)
    onLikeUpdated?.({ ...post, likes: nextLikes })
  }

  return (
    <article className="post-card">
      <div className="card-head">
        <div>
          <p className="eyebrow">@{post.nickname || 'sin-apodo'}</p>
          <h3 className="card-title">Post de la comunidad</h3>
        </div>
        <span className="meta-chip">{post.commentsCount} comentarios</span>
      </div>

      {post.imageUrl ? (
        <img className="post-card-image" src={post.imageUrl} alt={post.description} />
      ) : null}

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

      <div className="card-actions">
        <button
          type="button"
          className={`like-button${liked ? ' is-liked' : ''}`}
          onClick={handleLike}
          disabled={liked}
        >
          {liked ? 'Te gusta' : 'Me gusta'} · {likes}
        </button>

        <Link className="primary-button" to={`/post/${post.id}`}>
          Ver más
        </Link>
      </div>
    </article>
  )
}