import { useEffect, useState } from 'react'
import { PostCard } from '../components/PostCard'
import { useAuth } from '../hooks/useAuth'
import { fetchFeed } from '../services/api'
import type { Post } from '../types/social'
import { UserSearchPanel } from '../components/UserSearchPanel'

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
        const postList = await fetchFeed(currentUser.id)
        setPosts(postList)
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
        <UserSearchPanel />
      </aside>

      <section className="feed-main">

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