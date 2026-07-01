import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from '../components/ThemeToggle'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(nickname, password)
      const from = (location.state as { from?: string } | null)?.from ?? '/feed'
      navigate(from, { replace: true })
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No pudimos iniciar la sesión.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-grid">
        <section className="auth-hero">
          <div className="panel-header">
            <div>
              <p className="eyebrow">UNAHUR ANTI-SOCIAL NET</p>
              <h1 className="hero-title">Menos filtro. Más publicación.</h1>
            </div>
            
            <ThemeToggle />
          </div>

          <p className="hero-copy">
            Tu espacio para postear, comentar y seguir el pulso de la comunidad desde una
            estética más sobria, cálida y retro.
          </p>

          {/* <div className="hero-chip-row">
            <span className="hero-chip">Feed con detalle</span>
            <span className="hero-chip">Comentarios visibles</span>
            <span className="hero-chip">Likes y perfil propio</span>
          </div> */}

          <div className="info-strip">
            <p className="eyebrow">Acceso simulado</p>
            <p className="body-copy">
              Usá tu nickName registrado y la contraseña fija 123456 para entrar.
            </p>
          </div>
        </section>

        <section className="panel">
          <div>
            <p className="eyebrow">Ingreso</p>
            <h2 className="section-title">Entrá a tu cuenta</h2>
            <p className="muted">
              Validamos el nickName contra la API y la contraseña de forma local.
            </p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="nickname">nickName</label>
              <input
                id="nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="por ejemplo: maru.una"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña simulada</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="123456"
              />
            </div>

            {error ? <div className="error-banner">{error}</div> : null}

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
              <Link className="secondary-button" to="/register">
                Crear usuario
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}