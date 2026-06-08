// Utilidades de normalización y comparación de texto/números.
// Centralizan la lógica que usan el scoring y los filtros para que
// "Inteligencia Artificial" y "inteligencia artificial " encajen.

/** Normaliza un texto: minúsculas, sin acentos, sin espacios sobrantes. */
export function normalizeText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // elimina diacríticos combinantes
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** Compara dos textos de forma laxa (normalizados). */
export function textEquals(a: string | null | undefined, b: string | null | undefined): boolean {
  return normalizeText(a) === normalizeText(b) && normalizeText(a) !== '';
}

/** ¿`value` está contenido en la lista (comparación normalizada)? */
export function includesText(list: string[] | null | undefined, value: string | null | undefined): boolean {
  if (!list || list.length === 0) return false;
  const target = normalizeText(value);
  if (!target) return false;
  return list.some((item) => normalizeText(item) === target);
}

/** ¿Alguna palabra clave de `needle` aparece en `haystack`? Útil para áreas/temas. */
export function hasOverlap(haystack: string | null | undefined, needle: string | null | undefined): boolean {
  const h = normalizeText(haystack);
  const n = normalizeText(needle);
  if (!h || !n) return false;
  if (h.includes(n) || n.includes(h)) return true;
  const words = n.split(' ').filter((w) => w.length > 2);
  return words.some((w) => h.includes(w));
}

/** ¿Alguno de los elementos de la lista solapa con `value`? */
export function listOverlaps(list: string[] | null | undefined, value: string | null | undefined): boolean {
  if (!list || list.length === 0) return false;
  return list.some((item) => hasOverlap(item, value) || hasOverlap(value, item));
}

/** Restringe un número al rango [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** Redondea a `decimals` decimales de forma estable. */
export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

// Escala estándar de niveles de inglés (MCER + equivalencias frecuentes).
const ENGLISH_LEVELS: Record<string, number> = {
  none: 0,
  a1: 1,
  a2: 2,
  b1: 3,
  b2: 4,
  c1: 5,
  c2: 6,
  native: 6,
  nativo: 6,
  fluent: 5,
  fluido: 5,
  advanced: 5,
  avanzado: 5,
  intermediate: 3,
  intermedio: 3,
  basic: 2,
  basico: 2,
};

/** Convierte un nivel de inglés textual a un valor ordinal 0-6. */
export function englishLevelRank(level: string | null | undefined): number {
  const key = normalizeText(level).replace(/\s+/g, '');
  return ENGLISH_LEVELS[key] ?? 3; // por defecto B1 si es desconocido
}
