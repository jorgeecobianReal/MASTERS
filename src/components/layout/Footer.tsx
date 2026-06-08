import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>© 2026 MasterMatch AI. Orientación académica basada en datos.</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/perfil" className="transition hover:text-brand-700">
            Analizar perfil
          </Link>
          <Link to="/comparar" className="transition hover:text-brand-700">
            Comparar másteres
          </Link>
        </div>
      </div>
    </footer>
  );
}
