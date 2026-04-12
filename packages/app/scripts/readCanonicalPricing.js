/**
 * Load canonical public pricing (single source with website + stripeProducts + scripts).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function readCanonicalPricing() {
  const file = path.join(__dirname, '..', 'src', 'config', 'canonical-public-pricing.json');
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return {
    starterOneTimeCents: raw.starterOneTimeCents,
    starterUpdatesYearlyCents: raw.starterUpdatesYearlyCents,
    professionalMonthlyCents: raw.professionalMonthlyCents,
    professionalAnnualCents: raw.professionalAnnualCents,
    enterpriseMonthlyCents: raw.enterpriseMonthlyCents,
    enterpriseAnnualCents: raw.enterpriseAnnualCents,
  };
}
