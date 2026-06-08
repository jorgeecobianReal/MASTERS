import type { AdmissionDifficulty, Modality } from '../types';

export const modalityLabels: Record<Modality, string> = {
  onsite: 'Presencial',
  online: 'Online',
  hybrid: 'Híbrido',
};

export const admissionDifficultyLabels: Record<AdmissionDifficulty, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  very_high: 'Muy alta',
};

export const areaOptions = [
  'Finanzas',
  'Derecho',
  'Inteligencia Artificial',
  'Data Science',
  'Marketing',
  'Empresa',
  'Ingeniería',
  'Seguros',
  'Consultoría',
  'Emprendimiento',
  'Otra',
];

export const englishLevelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const modalityOptions = [
  { value: 'onsite', label: 'Presencial' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Híbrido' },
] as const;
