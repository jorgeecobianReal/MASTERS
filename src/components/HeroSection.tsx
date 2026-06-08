import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BrainCircuit, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-900 text-white">
      <div className="absolute inset-0 opacity-25">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
        <div className="max-w-3xl animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-brand-50">
            <BrainCircuit className="h-4 w-4 text-mint-100" aria-hidden="true" />
            IA para decidir tu siguiente paso académico
          </div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Encuentra el máster perfecto para tu futuro
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-50">
            Compara universidades, países y programas según tu perfil académico, objetivos profesionales y
            preferencias personales.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/perfil"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-mint-500 px-5 py-3 text-sm font-bold text-brand-900 transition hover:bg-mint-100"
            >
              Empezar análisis
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/comparar"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Comparar programas
            </Link>
          </div>
        </div>

        <div className="relative animate-fade-up lg:justify-self-end" style={{ animationDelay: '120ms' }}>
          <div className="rounded-lg border border-white/15 bg-white/95 p-4 text-slate-950 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Top match</p>
                <h2 className="text-xl font-bold">MSc in Artificial Intelligence</h2>
              </div>
              <div className="rounded-lg bg-mint-100 px-3 py-2 text-center">
                <span className="block text-2xl font-bold text-mint-600">91%</span>
                <span className="text-xs font-medium text-slate-500">encaje</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Ranking', '89/100'],
                ['Empleo', '92/100'],
                ['Internacional', '94/100'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {[
                'Encaja con tu interés en IA',
                'Buena empleabilidad internacional',
                'Programa impartido en inglés',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-mint-500" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg bg-brand-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-700">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                Prioridades analizadas
              </div>
              <div className="space-y-2">
                {[
                  ['Empleabilidad', '88%'],
                  ['Prestigio', '78%'],
                  ['Coste', '63%'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs text-slate-600">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white">
                      <div className="h-2 rounded-full bg-brand-600" style={{ width: value }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
