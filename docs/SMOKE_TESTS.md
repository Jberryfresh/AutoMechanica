# End-to-End Smoke Tests

Use these checks after deploys (staging/prod) to validate core user flows. Run with feature flags enabled as needed.

## Prereqs
- Backend/Frontend up and reachable (use deployed URLs).
- Test credentials and seeded data (one supplier feed, at least one part with fitment).
- Admin key for workflow/task checks.

## Flows
1. **Vehicle selection & persistence**
   - Go to home, select vehicle (Y/M/M/T/E). Refresh page → vehicle remains active.
2. **Vehicle-aware category browse**
   - Navigate to category; confirm only fitment-matching parts display. Switch vehicle → list updates.
3. **Product detail**
   - Open part page; verify fitment badge, specs, reverse fitment table, description render.
4. **Add to cart / checkout (MVP)**
   - Add item to cart; proceed through checkout path (happy path) and confirm order is created.
5. **Support chat**
   - From product page, open support chat; send message; reply references current part/vehicle.
6. **Supplier ingestion workflow**
   - Trigger/verify `wf_ingest_supplier_catalog` completes; supplier_parts → parts → fitments/pricing/SEO populated.
7. **Part publication workflow**
   - Run `wf_publish_new_part`; verify fitments/pricing/description and ready-to-publish flag.

## Admin/Backend Checks
- **Health**: `GET /api/health` → status ok, dependencies true, pool stats reasonable.
- **Queue/Workflows**: `GET /api/admin/metrics` and `/api/admin/tasks?status=dead` → no buildup; dead tasks cleared.
- **Logs**: Scan for 5xx spikes, LLM/provider errors, slow query warnings.

## Post-Run
- Record results (pass/fail, notes, run timestamp, environment).
- Open bugs for any failures; re-run after fixes.
