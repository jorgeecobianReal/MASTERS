import { cn } from '../utils/cn';
import { formatPercent } from '../utils/format';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'lg';
}

export function MatchScoreBadge({ score, size = 'sm' }: MatchScoreBadgeProps) {
  const tone =
    score >= 88
      ? 'bg-mint-100 text-mint-600 ring-mint-200'
      : score >= 78
        ? 'bg-brand-50 text-brand-700 ring-brand-100'
        : 'bg-amber-50 text-amber-700 ring-amber-100';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-bold ring-1',
        tone,
        size === 'lg' ? 'px-4 py-3 text-2xl' : 'px-2.5 py-1.5 text-sm',
      )}
    >
      {formatPercent(score)}
    </span>
  );
}
