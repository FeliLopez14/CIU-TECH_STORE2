import { House, SquarePen, CircleUserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { to: '/feed', label: 'Feed', icon: House },
  { to: '/create', label: 'Publicar', icon: SquarePen },
  { to: '/profile', label: 'Perfil', icon: CircleUserRound },
]

export function FooterNav() {
  return (
    <nav className="nav-shell" aria-label="Navegación principal">
      {links.map((link) => {
        const Icon = link.icon

        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            aria-label={link.label}
            title={link.label}
          >
            <Icon size={22} strokeWidth={2.2} />
          </NavLink>
        )
      })}

      <ThemeToggle />
    </nav>
  )
}