import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LoadingAnalysis } from '../components/LoadingAnalysis';
import { MasterDetailPanel } from '../components/MasterDetailPanel';
import { getMasterById, getMasters } from '../services/api';
import type { MasterProgram } from '../types';

export function MasterDetailPage() {
  const { id } = useParams();
  const [master, setMaster] = useState<MasterProgram | undefined>();
  const [similarMasters, setSimilarMasters] = useState<MasterProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadMaster() {
      if (!id) return;
      setIsLoading(true);
      const [selected, allMasters] = await Promise.all([getMasterById(id), getMasters()]);

      if (!mounted) return;
      setMaster(selected);
      setSimilarMasters(
        allMasters
          .filter((candidate) => candidate.id !== id && (!selected || candidate.area === selected.area || candidate.country === selected.country))
          .slice(0, 3),
      );
      setIsLoading(false);
    }

    loadMaster();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) return <LoadingAnalysis />;

  if (!master) {
    return (
      <main className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-950">No encontramos este máster</h1>
          <p className="mt-3 text-slate-600">Puede que el catálogo haya cambiado o que el enlace no sea válido.</p>
          <Link
            to="/resultados"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Volver a resultados
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/resultados"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a resultados
        </Link>
        <MasterDetailPanel master={master} similarMasters={similarMasters} />
      </div>
    </main>
  );
}
