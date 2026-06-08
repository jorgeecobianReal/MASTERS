import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingAnalysis } from '../components/LoadingAnalysis';
import { StepForm } from '../components/StepForm';
import { analyzeProfile } from '../services/api';
import type { UserProfileInput } from '../types';

export function ProfileFormPage() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleComplete(values: UserProfileInput) {
    setIsAnalyzing(true);
    const response = await analyzeProfile(values);
    navigate('/resultados', {
      state: {
        profileId: response.profileId,
        recommendations: response.recommendations,
      },
    });
  }

  if (isAnalyzing) return <LoadingAnalysis />;

  return (
    <main className="bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-brand-700">Formulario de perfil</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Construye tu análisis personalizado</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Completa las cuatro secciones. El payload final coincide con `UserProfileInput` del backend.
          </p>
        </div>
        <StepForm onComplete={handleComplete} />
      </div>
    </main>
  );
}
