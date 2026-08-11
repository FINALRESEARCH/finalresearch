/**
 * Display form of a project code, e.g. "fr-24-c-hidden" -> "FR_24_C_HIDDEN".
 * Hyphens are the URL form only — everywhere else (page titles, Studio
 * previews, emails) uses underscores, matching the file-naming convention.
 */
export function formatProjectTitle(code: string): string {
  return code.toUpperCase().replace(/-/g, '_')
}
