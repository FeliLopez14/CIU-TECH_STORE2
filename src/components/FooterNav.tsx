import { NavLink } from 'react-router-dom'

const links = [
  { to: '/feed', label: 'Feed' },
  { to: '/create', label: 'Publicar' },
  { to: '/profile', label: 'Perfil' },
]

export function FooterNav() {
  return (
    <nav className="nav-shell" aria-label="Navegación principal">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}