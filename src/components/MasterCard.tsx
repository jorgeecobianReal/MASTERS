import { Bookmark, CheckCircle2, ExternalLink, GitCompare, MapPin, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RecommendationItem } from '../types';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';
import { admissionDifficultyLabels, modalityLabels } from '../utils/labels';
import { MatchScoreBadge } from './MatchScoreBadge';

interface MasterCardProps {
  recommendation: RecommendationItem;
  isSaved?: boolean;
  isCompared?: boolean;
  disableCompare?: boolean;
  onSave?: (masterId: string) => void;
  onCompare?: (masterId: string) => void;
}

export function MasterCard({
  recommendation,
  isSaved = false,
  isCompared = false,
  disableCompare = false,
  onSave,
  onCompare,
}: MasterCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-700">{recommendation.university}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{recommendation.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {recommendation.city}, {recommendation.country}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{recommendation.duration}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{modalityLabels[recommendation.modality]}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{recommendation.language}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <MatchScoreBadge score={recommendation.matchScore} size="lg" />
          <span className="text-xs font-medium text-slate-500">Puntuación de encaje</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <div>
          <h3 className="text-sm font-bold text-slate-950">Razones por las que encaja</h3>
          <ul className="mt-3 space-y-2">
            {recommendation.reasons.map((reason) => (
              <li key={reason} className="flex gap-2 text-sm leading-6 text-slate-600">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-mint-500" aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
            <WalletCards className="h-4 w-4 text-brand-600" aria-hidden="true" />
            {formatCurrency(recommendation.price)}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Dificultad de admisión: {admissionDifficultyLabels[recommendation.admissionDifficulty]}
          </p>
          <p className="mt-2 text-sm text-slate-600">{recommendation.careerFit}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold text-slate-950">Pros</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {recommendation.pros.map((pro) => (
              <li key={pro}>• {pro}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-950">Contras</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {recommendation.cons.map((con) => (
              <li key={con}>• {con}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
        <Link
          to={`/masters/${recommendation.masterId}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Ver detalles
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => onSave?.(recommendation.masterId)}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition',
            isSaved
              ? 'border-mint-200 bg-mint-50 text-mint-600'
              : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700',
          )}
        >
          <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} aria-hidden="true" />
          {isSaved ? 'Máster guardado' : 'Guardar máster'}
        </button>
        <button
          type="button"
          onClick={() => onCompare?.(recommendation.masterId)}
          disabled={disableCompare && !isCompared}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
            isCompared
              ? 'border-brand-200 bg-brand-50 text-brand-700'
              : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700',
          )}
        >
          <GitCompare className="h-4 w-4" aria-hidden="true" />
          {isCompared ? 'En comparación' : 'Comparar'}
        </button>
      </div>
    </article>
  );
}
