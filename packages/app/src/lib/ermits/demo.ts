/**
 * Anonymous demo mode — no auth, no DB, in-memory only.
 * Resets on page refresh.
 */
export const ERMITS_DEMO_LIMITS: Record<
  string,
  {
    maxAssessments: number;
    canExport: boolean;
    canSave: boolean;
    watermarked: boolean;
  }
> = {
  cybercaution: { maxAssessments: 1, canExport: false, canSave: false, watermarked: true },
  cybercorrect: { maxAssessments: 1, canExport: false, canSave: false, watermarked: true },
  vendorsoluce: { maxAssessments: 1, canExport: false, canSave: false, watermarked: true },
  cybersoluce: { maxAssessments: 1, canExport: false, canSave: false, watermarked: true },
  technosoluce: { maxAssessments: 1, canExport: false, canSave: false, watermarked: true },
  'ermits-advisory': { maxAssessments: 1, canExport: false, canSave: false, watermarked: true },
  cybercertitude: { maxAssessments: 1, canExport: false, canSave: false, watermarked: true },
};

const _demoUsage: Record<string, number> = {};

export const ermitsDemo = {
  getUsage: (slug: string) => _demoUsage[slug] ?? 0,
  increment: (slug: string) => {
    _demoUsage[slug] = (_demoUsage[slug] ?? 0) + 1;
  },
  isLimitReached: (slug: string) =>
    ermitsDemo.getUsage(slug) >= (ERMITS_DEMO_LIMITS[slug]?.maxAssessments ?? 1),
  getLimits: (slug: string) => ERMITS_DEMO_LIMITS[slug],
};
