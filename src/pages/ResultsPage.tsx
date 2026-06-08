import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, GitCompare, RotateCcw } from 'lucide-react';
import { MasterCard } from '../components/MasterCard';
import { useCompareMasters } from '../hooks/useCompareMasters';
import { useSavedMasters } from '../hooks/useSavedMasters';
import type { RecommendationItem } from '../types';
import { buildMockRecommendations } from '../utils/masterRanking';
import { defaultProfileValues } from '../utils/profileSchema';

interface ResultsState {
  profileId?: string;
  recommendations?: RecommendationItem[];
}

export function ResultsPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as ResultsState;
  const [notice, setNotice] = useState<string | null>(null);

  const recommendations = useMemo(
    () => state.recommendations ?? buildMockRecommendations(defaultProfileValues),
    [state.recommendations],
  );

  const profileId = state.profileId ?? 'demo-profile';
  const savedMasters = useSavedMasters(profileId);
  const comparison = useCompareMasters(3);

  function handleCompare(masterId: string) {
    const wasSelected = comparison.isSelected(masterId);
    comparison.toggleCompare(masterId);
    setNotice(wasSelected ? 'Máster retirado de la comparación.' : 'Máster añadido a la comparación.');
  }

  async function handleSave(masterId: string) {
    await savedMasters.toggleSaved(masterId);
    setNotice(savedMasters.isSaved(masterId) ? 'Máster retirado de guardados.' : 'Máster guardado correctamente.');
  }

  return (
    <main className="bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-brand-700">Página de resultados</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Másteres recomendados para tu perfil</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Ordenados por encaje estimado. Cada tarjeta explica razones, pros, contras y próximos pasos.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/perfil"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Repetir análisis
            </Link>
            <Link
              to="/comparar"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Comparar seleccionados
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {notice ? (
          <div className="mb-5 rounded-lg border border-mint-200 bg-mint-50 px-4 py-3 text-sm font-semibold text-mint-600">
            {notice}
          </div>
        ) : null}

        {comparison.compareMasterIds.length ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            <span className="inline-flex items-center gap-2 font-semibold">
              <GitCompare className="h-4 w-4" aria-hidden="true" />
              {comparison.compareMasterIds.length}/3 másteres seleccionados para comparar
            </span>
            <button type="button" onClick={comparison.clearCompare} className="font-bold transition hover:text-brand-900">
              Vaciar selección
            </button>
          </div>
        ) : null}

        <div className="grid gap-5">
          {recommendations.map((recommendation) => (
            <MasterCard
              key={recommendation.masterId}
              recommendation={recommendation}
              isSaved={savedMasters.isSaved(recommendation.masterId)}
              isCompared={comparison.isSelected(recommendation.masterId)}
              disableCompare={comparison.isFull}
              onSave={handleSave}
              onCompare={handleCompare}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
