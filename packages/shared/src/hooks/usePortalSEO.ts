/**
 * Legacy hook: SEO is authored statically in index.html (ERMITS baseline).
 * Kept as a no-op so portal routes do not mutate document head at runtime.
 */
export interface PortalSEOProps {
  title: string;
  description: string;
  path?: string;
}

export function usePortalSEO(_props: PortalSEOProps): void {
  // Intentionally empty — static <head> is the source of truth.
}
