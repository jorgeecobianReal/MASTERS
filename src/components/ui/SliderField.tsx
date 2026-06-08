import { cn } from '../../utils/cn';

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  error?: string;
  leftLabel?: string;
  rightLabel?: string;
}

export function SliderField({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  error,
  leftLabel = 'Baja',
  rightLabel = 'Alta',
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn('w-full accent-brand-600', error && 'accent-red-500')}
      />
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </div>
  );
}
