import { BrainCircuit } from 'lucide-react';

export function LoadingAnalysis() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-5 flex h-16 w-16 animate-pulse-soft items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <BrainCircuit className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-slate-950">Analizando tu perfil académico y profesional...</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Estamos cruzando tus prioridades, presupuesto, modalidad y objetivos con el catálogo de programas.
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-2/3 animate-[loadingBar_1.3s_ease-in-out_infinite] rounded-full bg-brand-600" />
        </div>
      </div>
    </div>
  );
}
