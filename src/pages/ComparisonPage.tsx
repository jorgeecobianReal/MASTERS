import { useEffect, useMemo, useState } from 'react';
import { Check, GitCompare, Trash2 } from 'lucide-react';
import { ComparisonTable } from '../components/ComparisonTable';
import { useCompareMasters } from '../hooks/useCompareMasters';
import { compareMasters, getMasters } from '../services/api';
import type { MasterComparison, MasterProgram } from '../types';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';
import { modalityLabels } from '../utils/labels';

export function ComparisonPage() {
  const [masters, setMasters] = useState<MasterProgram[]>([]);
  const [comparison, setComparison] = useState<MasterComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const compare = useCompareMasters(3);

  useEffect(() => {
    let mounted = true;

    async function loadMasters() {
      const catalog = await getMasters();
      if (!mounted) return;
      setMasters(catalog);
      setIsLoading(false);
    }

    loadMasters();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadComparison() {
      if (!compare.compareMasterIds.length) {
        setComparison(null);
        return;
      }

      const result = await compareMasters(compare.compareMasterIds);
      if (mounted) setComparison(result);
    }

    loadComparison();

    return () => {
      mounted = false;
    };
  }, [compare.compareMasterIds]);

  const emptyComparison = useMemo<MasterComparison>(
    () => ({
      masters: [],
      matrix: [],
      highlights: {
        cheapest: null,
        bestRanking: null,
        bestEmployability: null,
        bestNetworking: null,
        shortest: null,
      },
    }),
    [],
  );

  return (
    <main className="bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-brand-700">Página de comparación</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Compara hasta 3 másteres</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Selecciona programas para revisar precio, duración, idioma, ranking, empleabilidad, dificultad y encaje.
            </p>
          </div>
          <button
            type="button"
            onClick={compare.clearCompare}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Vaciar comparación
          </button>
        </div>

        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-950">
            <GitCompare className="h-4 w-4 text-brand-600" aria-hidden="true" />
            {compare.compareMasterIds.length}/3 seleccionados
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {masters.map((master) => {
              const selected = compare.isSelected(master.id);
              const disabled = compare.isFull && !selected;

              return (
                <button
                  key={master.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => compare.toggleCompare(master.id)}
                  className={cn(
                    'rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50',
                    selected ? 'border-brand-500 ring-4 ring-brand-100' : 'border-slate-200',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-brand-700">{master.university}</p>
                      <h2 className="mt-1 font-bold text-slate-950">{master.name}</h2>
                    </div>
                    <span
                      className={cn(
                        'inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg border',
                        selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-300',
                      )}
                    >
                      {selected ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {master.city}, {master.country} · {modalityLabels[master.modality]}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-950">{formatCurrency(master.price)}</p>
                </button>
              );
            })}
          </div>
          {isLoading ? <p className="mt-4 text-sm text-slate-500">Cargando catálogo...</p> : null}
        </section>

        <ComparisonTable comparison={comparison ?? emptyComparison} />
      </div>
    </main>
  );
}
