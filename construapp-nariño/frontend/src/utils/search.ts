const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es');

/** Búsqueda de texto independiente de mayúsculas y tildes. */
export function matchesSearch(value: string, query: string): boolean {
  return normalize(value).includes(normalize(query.trim()));
}
