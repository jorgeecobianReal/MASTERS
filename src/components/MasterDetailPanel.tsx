import { ArrowUpRight, BriefcaseBusiness, GraduationCap, Languages, ShieldCheck, Trophy } from 'lucide-react';
import type { MasterProgram } from '../types';
import { formatCurrency } from '../utils/format';
import { admissionDifficultyLabels, modalityLabels } from '../utils/labels';

interface MasterDetailPanelProps {
  master: MasterProgram;
  similarMasters: MasterProgram[];
}

export function MasterDetailPanel({ master, similarMasters }: MasterDetailPanelProps) {
  const metrics = [
    { label: 'Ranking', value: master.rankingScore, icon: Trophy },
    { label: 'Empleabilidad', value: master.employabilityScore, icon: BriefcaseBusiness },
    { label: 'Networking', value: master.networkingScore, icon: ShieldCheck },
    { label: 'Internacional', value: master.internationalScore, icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-brand-900 px-5 py-8 text-white sm:px-8">
        <p className="text-sm font-semibold text-mint-100">{master.university}</p>
        <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl">{master.name}</h1>
        <p className="mt-4 max-w-3xl text-brand-50">{master.description}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1.5">{master.city}, {master.country}</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">{master.duration}</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">{modalityLabels[master.modality]}</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">{master.language}</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <p className="mt-3 text-sm text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{metric.value}/100</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Información completa del programa</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-slate-500">Precio</dt>
              <dd className="mt-1 text-lg font-bold text-slate-950">{formatCurrency(master.price)}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">Nivel de dificultad</dt>
              <dd className="mt-1 text-lg font-bold text-slate-950">
                {admissionDifficultyLabels[master.admissionDifficulty]}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">Idioma requerido</dt>
              <dd className="mt-1 text-lg font-bold text-slate-950">{master.requiredEnglishLevel}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">Área</dt>
              <dd className="mt-1 text-lg font-bold text-slate-950">{master.area}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-950">Requisitos de admisión</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {master.requirements.map((requirement) => (
                <li key={requirement}>• {requirement}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-950">Salidas profesionales</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {master.careerOutcomes.map((career) => (
                <span key={career} className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">
                  {career}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Becas posibles</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{master.scholarshipInfo ?? 'No hay becas registradas.'}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Encaje con tu perfil</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Este panel muestra los factores estructurales del programa. Cuando llegues desde un análisis real, el backend
              puede añadir explicación IA, riesgos personalizados y alternativas sugeridas.
            </p>
          </div>

          {master.officialUrl ? (
            <a
              href={master.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Ver web oficial
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
        </aside>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Languages className="h-5 w-5 text-brand-600" aria-hidden="true" />
          <h2 className="text-xl font-bold text-slate-950">Comparación con másteres similares</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {similarMasters.map((similarMaster) => (
            <div key={similarMaster.id} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-brand-700">{similarMaster.university}</p>
              <h3 className="mt-1 font-bold text-slate-950">{similarMaster.name}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {formatCurrency(similarMaster.price)} · {similarMaster.duration} · {similarMaster.country}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
