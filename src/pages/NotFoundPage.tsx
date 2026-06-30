import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="not-found">
      <section className="panel">
        <p className="eyebrow">404</p>
        <h1 className="section-title">Esta página no existe</h1>
        <p className="muted">Volvé al inicio para retomar la navegación.</p>
        <div className="form-actions">
          <Link className="primary-button" to="/">
            Ir al inicio
          </Link>
        </div>
      </section>
    </div>
  )
}