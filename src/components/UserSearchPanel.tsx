import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchUsers } from '../services/api'
import type { User } from '../types/social'

export function UserSearchPanel() {
  const { currentUser } = useAuth()

  const [searchText, setSearchText] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  async function handleSearch() {
    const normalizedSearch = searchText.trim().toLowerCase()

    if (!normalizedSearch) {
      setResults([])
      setHasSearched(false)
      setError('')
      return
    }

    try {
      setIsSearching(true)
      setError('')
      setHasSearched(true)

      const users = await fetchUsers()

      const matchedUsers = users.filter(
        (user) =>
          user.id !== currentUser?.id &&
          user.nickname.toLowerCase().includes(normalizedSearch),
      )

      setResults(matchedUsers)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos buscar usuarios.',
      )
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <section className="panel user-search-panel">
      <div>
        <p className="eyebrow">Buscar usuarios</p>
        <h2 className="card-title">Encontrá gente para seguir</h2>
      </div>

      <div className="user-search-form">
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Buscar por nickName"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSearch()
            }
          }}
        />

        <button type="button" className="primary-button" onClick={handleSearch}>
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      {hasSearched && !isSearching && !results.length ? (
        <p className="empty-text">No encontramos usuarios con ese nickName.</p>
      ) : null}

      {results.length > 0 ? (
        <div className="user-result-list">
          {results.map((user) => (
            <article key={user.id} className="user-result-card">
              <div className="post-avatar">
                {user.nickname.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>@{user.nickname}</strong>
                <Link className="post-more-link" to={`/profile/${user.id}`}>
                  Ver perfil →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}