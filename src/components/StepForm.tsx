import { useMemo, useState } from 'react';
import { Controller, type FieldPath, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';
import type { UserProfileInput } from '../types';
import { cn } from '../utils/cn';
import { areaOptions, englishLevelOptions, modalityOptions } from '../utils/labels';
import { defaultProfileValues, profileSchema, type ProfileFormValues } from '../utils/profileSchema';
import { InputField } from './ui/InputField';
import { SelectField } from './ui/SelectField';
import { SliderField } from './ui/SliderField';
import { TagInputField } from './ui/TagInputField';

interface StepFormProps {
  onComplete: (values: UserProfileInput) => Promise<void> | void;
}

interface FormStep {
  title: string;
  eyebrow: string;
  description: string;
  fields: FieldPath<ProfileFormValues>[];
}

const steps: FormStep[] = [
  {
    title: 'Datos personales',
    eyebrow: 'Paso 1 de 4',
    description: 'Cuéntanos tu contexto personal, idiomas y presupuesto máximo.',
    fields: [
      'personalInfo.name',
      'personalInfo.age',
      'personalInfo.residenceCountry',
      'personalInfo.languages',
      'personalInfo.englishLevel',
      'personalInfo.maxBudget',
      'personalInfo.willingToStudyAbroad',
    ],
  },
  {
    title: 'Formación académica',
    eyebrow: 'Paso 2 de 4',
    description: 'Usamos tu trayectoria para ajustar el nivel y los requisitos del máster.',
    fields: [
      'academicInfo.degree',
      'academicInfo.university',
      'academicInfo.gpa',
      'academicInfo.studyCountry',
      'academicInfo.graduationYear',
      'academicInfo.favoriteSubjects',
    ],
  },
  {
    title: 'Preferencias del máster',
    eyebrow: 'Paso 3 de 4',
    description: 'Define países, modalidad, idioma, duración y área de interés.',
    fields: [
      'masterPreferences.preferredCountries',
      'masterPreferences.preferredUniversities',
      'masterPreferences.modality',
      'masterPreferences.desiredDuration',
      'masterPreferences.yearlyBudget',
      'masterPreferences.language',
      'masterPreferences.interestArea',
    ],
  },
  {
    title: 'Objetivos profesionales',
    eyebrow: 'Paso 4 de 4',
    description: 'Prioriza lo que de verdad pesa en tu decisión.',
    fields: [
      'careerGoals.targetSector',
      'careerGoals.targetRole',
      'careerGoals.targetWorkCountry',
      'careerGoals.employabilityImportance',
      'careerGoals.prestigeImportance',
      'careerGoals.costImportance',
      'careerGoals.internationalLifeImportance',
      'careerGoals.networkingImportance',
    ],
  },
];

const priorityFields: Array<{ name: keyof ProfileFormValues['careerGoals']; label: string }> = [
  { name: 'employabilityImportance', label: 'Importancia de empleabilidad' },
  { name: 'prestigeImportance', label: 'Importancia de prestigio' },
  { name: 'costImportance', label: 'Importancia de coste' },
  { name: 'internationalLifeImportance', label: 'Importancia de vida internacional' },
  { name: 'networkingImportance', label: 'Importancia de networking' },
];

export function StepForm({ onComplete }: StepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    trigger,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileValues,
    mode: 'onTouched',
  });

  const step = steps[currentStep];
  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);

  async function goNext() {
    const valid = await trigger(step.fields);
    if (valid) setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
  }

  function goBack() {
    setCurrentStep((value) => Math.max(value - 1, 0));
  }

  async function submit(values: ProfileFormValues) {
    setSubmitError(null);
    try {
      await onComplete(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo analizar el perfil.');
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">{step.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">{step.title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((item, index) => (
              <span
                key={item.title}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold',
                  index < currentStep && 'border-mint-200 bg-mint-50 text-mint-600',
                  index === currentStep && 'border-brand-600 bg-brand-600 text-white',
                  index > currentStep && 'border-slate-200 bg-white text-slate-400',
                )}
              >
                {index < currentStep ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {currentStep === 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Nombre"
              placeholder="Ej. Jorge Cobian"
              registration={register('personalInfo.name')}
              error={errors.personalInfo?.name?.message}
            />
            <InputField
              label="Edad"
              type="number"
              registration={register('personalInfo.age', { valueAsNumber: true })}
              error={errors.personalInfo?.age?.message}
            />
            <InputField
              label="País de residencia"
              placeholder="España"
              registration={register('personalInfo.residenceCountry')}
              error={errors.personalInfo?.residenceCountry?.message}
            />
            <SelectField
              label="Nivel de inglés"
              options={englishLevelOptions}
              registration={register('personalInfo.englishLevel')}
              error={errors.personalInfo?.englishLevel?.message}
            />
            <Controller
              name="personalInfo.languages"
              control={control}
              render={({ field }) => (
                <TagInputField
                  label="Idiomas hablados"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Añade un idioma"
                  suggestions={['Español', 'English', 'Français', 'Deutsch', 'Italiano']}
                  error={errors.personalInfo?.languages?.message}
                />
              )}
            />
            <InputField
              label="Presupuesto máximo"
              type="number"
              helperText="Presupuesto total aproximado"
              registration={register('personalInfo.maxBudget', { valueAsNumber: true })}
              error={errors.personalInfo?.maxBudget?.message}
            />
            <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <span>
                <span className="block text-sm font-bold text-slate-950">Disponibilidad para estudiar fuera</span>
                <span className="mt-1 block text-sm text-slate-600">
                  Actívalo si estás abierto a mudarte a otro país durante el máster.
                </span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                {...register('personalInfo.willingToStudyAbroad')}
              />
            </label>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Carrera estudiada"
              placeholder="Ej. Administración y Dirección de Empresas"
              registration={register('academicInfo.degree')}
              error={errors.academicInfo?.degree?.message}
            />
            <InputField
              label="Universidad actual o anterior"
              placeholder="Ej. Universidad Complutense de Madrid"
              registration={register('academicInfo.university')}
              error={errors.academicInfo?.university?.message}
            />
            <InputField
              label="Nota media"
              type="number"
              step="0.1"
              registration={register('academicInfo.gpa', { valueAsNumber: true })}
              error={errors.academicInfo?.gpa?.message}
            />
            <InputField
              label="País donde estudió"
              placeholder="España"
              registration={register('academicInfo.studyCountry')}
              error={errors.academicInfo?.studyCountry?.message}
            />
            <InputField
              label="Año de graduación"
              type="number"
              registration={register('academicInfo.graduationYear', { valueAsNumber: true })}
              error={errors.academicInfo?.graduationYear?.message}
            />
            <Controller
              name="academicInfo.favoriteSubjects"
              control={control}
              render={({ field }) => (
                <TagInputField
                  label="Asignaturas o áreas favoritas"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Añade un área"
                  suggestions={['Data Science', 'Finanzas', 'IA', 'Marketing', 'Derecho', 'Consultoría']}
                  error={errors.academicInfo?.favoriteSubjects?.message}
                />
              )}
            />
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="grid gap-5 md:grid-cols-2">
            <Controller
              name="masterPreferences.preferredCountries"
              control={control}
              render={({ field }) => (
                <TagInputField
                  label="Países donde te gustaría estudiar"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Añade un país"
                  suggestions={['Spain', 'Netherlands', 'United Kingdom', 'France', 'Italy', 'Germany']}
                  error={errors.masterPreferences?.preferredCountries?.message}
                />
              )}
            />
            <Controller
              name="masterPreferences.preferredUniversities"
              control={control}
              render={({ field }) => (
                <TagInputField
                  label="Universidades preferidas"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Añade una universidad"
                  suggestions={['IE Business School', 'Bocconi University', 'Imperial College Business School']}
                  error={errors.masterPreferences?.preferredUniversities?.message}
                />
              )}
            />
            <SelectField
              label="Modalidad"
              options={[...modalityOptions]}
              registration={register('masterPreferences.modality')}
              error={errors.masterPreferences?.modality?.message}
            />
            <InputField
              label="Duración deseada"
              placeholder="1 year"
              registration={register('masterPreferences.desiredDuration')}
              error={errors.masterPreferences?.desiredDuration?.message}
            />
            <InputField
              label="Presupuesto anual"
              type="number"
              registration={register('masterPreferences.yearlyBudget', { valueAsNumber: true })}
              error={errors.masterPreferences?.yearlyBudget?.message}
            />
            <InputField
              label="Idioma del máster"
              placeholder="English"
              registration={register('masterPreferences.language')}
              error={errors.masterPreferences?.language?.message}
            />
            <SelectField
              label="Área de interés"
              options={areaOptions}
              registration={register('masterPreferences.interestArea')}
              error={errors.masterPreferences?.interestArea?.message}
            />
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Sector donde quiere trabajar"
              placeholder="Ej. Consultoría estratégica"
              registration={register('careerGoals.targetSector')}
              error={errors.careerGoals?.targetSector?.message}
            />
            <InputField
              label="Cargo objetivo"
              placeholder="Ej. Data Consultant"
              registration={register('careerGoals.targetRole')}
              error={errors.careerGoals?.targetRole?.message}
            />
            <InputField
              label="País donde quiere trabajar"
              placeholder="Spain"
              registration={register('careerGoals.targetWorkCountry')}
              error={errors.careerGoals?.targetWorkCountry?.message}
            />
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Prioridades</p>
              <p className="mt-1 text-sm text-slate-600">Valora cada criterio del 1 al 10.</p>
            </div>
            {priorityFields.map((item) => (
              <Controller
                key={item.name}
                name={`careerGoals.${item.name}` as FieldPath<ProfileFormValues>}
                control={control}
                render={({ field }) => (
                  <SliderField
                    label={item.label}
                    value={Number(field.value)}
                    onChange={field.onChange}
                    error={errors.careerGoals?.[item.name]?.message as string | undefined}
                  />
                )}
              />
            ))}
          </div>
        ) : null}

        {submitError ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {submitError}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 0 || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Atrás
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-mint-500 px-5 py-2.5 text-sm font-bold text-brand-900 transition hover:bg-mint-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Analizando...' : 'Recibir recomendaciones'}
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}
