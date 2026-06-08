import { ArrowRight, BarChart3, BrainCircuit, Building2, Gauge, Globe2, LineChart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';

const benefits = [
  {
    title: 'Recomendaciones personalizadas',
    description: 'Ordenamos programas según tu perfil académico, presupuesto y objetivos.',
    icon: Sparkles,
  },
  {
    title: 'Comparación entre universidades',
    description: 'Contrasta precio, ranking, idioma, modalidad, duración y empleabilidad.',
    icon: Building2,
  },
  {
    title: 'Análisis de coste, país y empleabilidad',
    description: 'Detecta oportunidades realistas sin perder de vista el retorno profesional.',
    icon: LineChart,
  },
  {
    title: 'Ranking según encaje con tu perfil',
    description: 'Recibe una puntuación clara y explicable para priorizar tus opciones.',
    icon: Gauge,
  },
];

const steps = [
  ['1', 'Introduces tus datos', 'Perfil académico, idiomas, presupuesto y preferencias.'],
  ['2', 'La IA analiza tu perfil', 'El motor cruza objetivos, prioridades y catálogo de másteres.'],
  ['3', 'Recibes los másteres más adecuados', 'Tarjetas con razones, pros, contras y comparativa.'],
];

export function LandingPage() {
  return (
    <>
      <HeroSection />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-brand-700">Beneficios</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Una decisión académica con más señal y menos ruido</h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:px-8">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-mint-100 text-mint-600">
              <BrainCircuit className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-950">Cómo funciona</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              MasterMatch AI está pensado para convertir un formulario complejo en una recomendación accionable, fácil de
              revisar y preparada para conectarse con el backend.
            </p>
            <Link
              to="/perfil"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Empezar análisis
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-4">
            {steps.map(([number, title, description]) => (
              <article key={number} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand-900 text-sm font-bold text-white">
                  {number}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Globe2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-slate-950">Preparado para catálogo internacional</p>
              <p className="text-sm text-slate-600">Países, universidades y métricas listas para crecer con datos reales.</p>
            </div>
          </div>
          <Link
            to="/perfil"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
          >
            Crear mi perfil
          </Link>
        </div>
      </section>
    </>
  );
}
