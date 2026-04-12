# Sample import flow

1. Apply the Supabase migration.
2. Create an organization row and copy the org UUID.
3. Use the workspace import page or POST `/api/vendorsoluce/import` with the CSV contents from `sample-data/`.
4. Recompute metrics.
5. Open the portfolio page.

This starter intentionally leaves auth, route mounting, and repo-specific UI shell integration to the host application.
