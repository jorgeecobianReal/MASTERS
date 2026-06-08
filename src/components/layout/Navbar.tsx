import { Link, NavLink } from 'react-router-dom';
import { GraduationCap, Menu } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Análisis', href: '/perfil' },
  { label: 'Resultados', href: '/resultados' },
  { label: 'Comparar', href: '/comparar' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-950">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-900 text-white">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-bold">MasterMatch AI</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950',
                  isActive && 'bg-brand-50 text-brand-700',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <Link
          to="/perfil"
          className="hidden rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 md:inline-flex"
        >
          Empezar análisis
        </Link>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </nav>
    </header>
  );
}
