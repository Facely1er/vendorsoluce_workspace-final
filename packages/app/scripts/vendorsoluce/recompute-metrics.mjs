import { createClient } from '@supabase/supabase-js';

const orgId = process.argv[2];
if (!orgId) {
  console.error('Usage: node scripts/vendorsoluce/recompute-metrics.mjs <orgId>');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: response, error } = await supabase.functions.invoke('vendorsoluce-recompute', {
  body: { orgId }
});

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(JSON.stringify(response, null, 2));
