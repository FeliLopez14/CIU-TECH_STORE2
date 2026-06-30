import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!nickname.trim()) {
      setError('Completá el nickName antes de registrarte.')
      return
    }

    setIsSubmitting(true)

    try {
      await register(nickname)
      setSuccess('Registro exitoso. Te estamos redirigiendo al feed.')
      navigate('/feed', { replace: true })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo crear el usuario. Probá de nuevo.',
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
              <p className="eyebrow">Registro</p>
              <h1 className="hero-title">Arrancá con tu nick y publicá.</h1>
            </div>
            <ThemeToggle />
          </div>

          <p className="hero-copy">
            La API guarda usuarios por nickName. Después podés entrar siempre con la contraseña
            simulada 123456.
          </p>

          <div className="hero-chip-row">
            <span className="hero-chip">Alta rápida</span>
            <span className="hero-chip">Persistencia local</span>
            <span className="hero-chip">Tema claro y oscuro</span>
          </div>
        </section>

        <section className="panel">
          <div>
            <p className="eyebrow">Nuevo usuario</p>
            <h2 className="section-title">Creá tu cuenta</h2>
            <p className="muted">Solo necesitás un nickName único.</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="register-nickname">nickName</label>
              <input
                id="register-nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="tu_apodo"
              />
            </div>

            {error ? <div className="error-banner">{error}</div> : null}
            {success ? <div className="success-banner">{success}</div> : null}

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrarme'}
              </button>
              <Link className="secondary-button" to="/login">
                Ya tengo cuenta
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}