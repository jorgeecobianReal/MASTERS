import { KeyboardEvent, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TagInputFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  placeholder?: string;
  suggestions?: string[];
}

export function TagInputField({ label, value, onChange, error, placeholder, suggestions = [] }: TagInputFieldProps) {
  const [draft, setDraft] = useState('');

  const normalizedValues = useMemo(() => value.map((item) => item.toLowerCase()), [value]);

  function addTag(tag = draft) {
    const cleanTag = tag.trim();
    if (!cleanTag || normalizedValues.includes(cleanTag.toLowerCase())) return;
    onChange([...value, cleanTag]);
    setDraft('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((item) => item !== tag));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-800">{label}</span>
      <div
        className={cn(
          'min-h-11 rounded-lg border border-slate-200 bg-white p-2 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100',
          error && 'border-red-300 focus-within:border-red-400 focus-within:ring-red-100',
        )}
      >
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
              aria-label={`Eliminar ${tag}`}
            >
              {tag}
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-w-40 flex-1 border-0 bg-transparent px-1 py-1 text-sm text-slate-950 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => addTag()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700"
            aria-label="Añadir"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {suggestions.length ? (
        <div className="flex flex-wrap gap-2">
          {suggestions
            .filter((suggestion) => !normalizedValues.includes(suggestion.toLowerCase()))
            .slice(0, 5)
            .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {suggestion}
              </button>
            ))}
        </div>
      ) : null}
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </div>
  );
}
