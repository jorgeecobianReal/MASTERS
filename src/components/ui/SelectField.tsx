import type { SelectHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '../../utils/cn';

type SelectOption = string | { value: string; label: string };

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  registration?: UseFormRegisterReturn;
}

export function SelectField({ label, options, error, registration, className, ...props }: SelectFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <select
        className={cn(
          'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
          error && 'border-red-300 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        {...registration}
        {...props}
      >
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;

          return (
          <option key={value} value={value}>
            {label}
          </option>
          );
        })}
      </select>
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
