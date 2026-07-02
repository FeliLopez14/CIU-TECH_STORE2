import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PostCard } from '../components/PostCard'
import { useAuth } from '../hooks/useAuth'
import {
  fetchComments,
  fetchPosts,
  fetchUserById,
  followUser,
  unfollowUser,
} from '../services/api'
import type { Post, User } from '../types/social'

export function ProfilePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { currentUser, fullUser, logout, refreshFullUser } = useAuth()

  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const isOwnProfile = !id || id === currentUser?.id

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return

      setIsLoading(true)
      setError('')

      try {
        const userToShow = isOwnProfile ? fullUser ?? currentUser : await fetchUserById(id)

        setProfileUser(userToShow)
        if (!isOwnProfile) {
          setIsFollowing(
            fullUser?.seguidos?.some((user) => user.id === userToShow.id) ?? false,
          )
        }

        const [postList, commentList] = await Promise.all([fetchPosts(), fetchComments()])

        const commentsByPost = commentList.reduce<Record<string, number>>((accumulator, comment) => {
          accumulator[comment.postId] = (accumulator[comment.postId] ?? 0) + 1
          return accumulator
        }, {})

        const userPosts = postList
          .filter(
            (post) =>
              post.userId === userToShow.id ||
              post.nickname.toLowerCase() === userToShow.nickname.toLowerCase(),
          )
          .map((post) => ({
            ...post,
            commentsCount: commentsByPost[post.id] ?? post.commentsCount,
          }))

        setPosts(userPosts)
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No pudimos cargar el perfil.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [currentUser, fullUser, id, isOwnProfile])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  async function handleFollowToggle() {
    if (!currentUser || !profileUser) return

    try {
      if (isFollowing) {
        const updatedProfileUser = await unfollowUser(currentUser.id, profileUser.id)

        setProfileUser(updatedProfileUser)
        setIsFollowing(false)
      } else {
        const updatedProfileUser = await followUser(currentUser.id, profileUser.id)

        setProfileUser(updatedProfileUser)
        setIsFollowing(true)
      }

      await refreshFullUser()
    } catch (error) {
      console.error(error)
    }
  }

  if (!currentUser) return null

  return (
    <div className="profile-layout">
      <aside className="feed-side">
        <section className="panel">
          <p className="eyebrow">{isOwnProfile ? 'Perfil' : 'Perfil de usuario'}</p>
          <h2 className="section-title">{profileUser?.nickname ?? 'Usuario'}</h2>

          <div className="profile-stats">
            <div>
              <span>{posts.length}</span>
              <p>Posts</p>
            </div>

            <div>
              <span>{profileUser?.seguidores?.length ?? 0}</span>
              <p>Seguidores</p>
            </div>

            <div>
              <span>{profileUser?.seguidos?.length ?? 0}</span>
              <p>Seguidos</p>
            </div>
          </div>

          {isOwnProfile ? (
            <div className="profile-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => navigate('/create')}
              >
                Crear publicación
              </button>

              <button
                type="button"
                className="ghost-button"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="profile-actions">
              <button
                type="button"
                className={isFollowing ? 'ghost-button' : 'primary-button'}
                onClick={handleFollowToggle}
              >
                {isFollowing ? 'Dejar de seguir' : 'Seguir'}
              </button>
            </div>
          )}
        </section>
      </aside>

      <section className="feed-main">
        <div className="info-strip">
          <p className="eyebrow">{isOwnProfile ? 'Tu contenido' : 'Contenido'}</p>
          <h3 className="card-title">
            {isOwnProfile ? 'Tus publicaciones' : `Publicaciones de ${profileUser?.nickname ?? ''}`}
          </h3>
        </div>

        {isLoading ? <div className="loader">Cargando publicaciones...</div> : null}
        {error ? <div className="error-banner">{error}</div> : null}

        {!isLoading && !error && !posts.length ? (
          <div className="empty-card">
            <h3 className="card-title">
              {isOwnProfile ? 'Todavía no publicaste nada' : 'Este usuario todavía no publicó nada'}
            </h3>
          </div>
        ) : null}

        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}