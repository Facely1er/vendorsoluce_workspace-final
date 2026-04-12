import { config } from './config';

/** URL for SBOM tooling on TechnoSoluce™ (set VITE_TECHNOSOLUCE_SBOM_URL or VITE_TECHNOSOLUCE_URL). */
export function getTechnoSoluceSbomUrl(): string | undefined {
  const u = (config.app.technoSoluceSbomUrl || '').trim();
  return u || undefined;
}
