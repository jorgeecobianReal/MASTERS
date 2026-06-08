import type { MasterComparison } from '../types';
import { formatCurrency } from '../utils/format';
import { admissionDifficultyLabels, modalityLabels } from '../utils/labels';

interface ComparisonTableProps {
  comparison: MasterComparison;
}

function formatValue(field: string, value: string | number | boolean | null) {
  if (value === null) return 'No disponible';
  if (field === 'price' && typeof value === 'number') return formatCurrency(value);
  if (field === 'matchScore' && typeof value === 'number') return `${value}%`;
  if (field === 'admissionDifficulty' && typeof value === 'string') return admissionDifficultyLabels[value as keyof typeof admissionDifficultyLabels];
  if (field === 'modality' && typeof value === 'string') return modalityLabels[value as keyof typeof modalityLabels];
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return value;
}

export function ComparisonTable({ comparison }: ComparisonTableProps) {
  if (!comparison.masters.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-slate-950">Selecciona hasta 3 másteres</h2>
        <p className="mt-2 text-sm text-slate-600">Cuando elijas programas, la tabla comparativa aparecerá aquí.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-52 px-4 py-4 text-left text-sm font-bold text-slate-950">Criterio</th>
              {comparison.masters.map((master) => (
                <th key={master.id} className="min-w-56 px-4 py-4 text-left text-sm font-bold text-slate-950">
                  {master.name}
                  <span className="mt-1 block text-xs font-medium text-slate-500">{master.university}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparison.matrix.map((row) => (
              <tr key={row.field}>
                <td className="bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700">{row.label}</td>
                {row.values.map((value, index) => (
                  <td key={`${row.field}-${comparison.masters[index]?.id}`} className="px-4 py-4 text-sm text-slate-700">
                    {formatValue(row.field, value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
