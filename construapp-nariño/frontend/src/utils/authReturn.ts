/** Solo rutas internas; conserva la calculadora y sus parámetros tras autenticarse. */
export function authReturn(state: unknown): string {
  const from = (state as { from?: { pathname?: unknown; search?: unknown } } | null)?.from;
  const pathname = from?.pathname;
  if (
    typeof pathname !== 'string' ||
    !pathname.startsWith('/') ||
    pathname.startsWith('//') ||
    pathname.includes('\\')
  ) {
    return '/dashboard';
  }
  const search = typeof from?.search === 'string' && from.search.startsWith('?') ? from.search : '';
  return pathname + search;
}
