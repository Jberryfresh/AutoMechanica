# Operations & Incident Response Runbooks

This guide outlines common operational scenarios and step-by-step actions to restore service safely.

## 1) Database Connection Failures
- **Detect**: Health endpoint degraded, connection errors in logs, `SELECT 1` failures.
- **Immediate actions**:
  - Check DB container/service: `npm run db:logs` (Docker) or cloud console.
  - Verify `DATABASE_URL`, network reachability, and credentials.
  - Restart DB service if safe (`npm run db:restart` for local).
- **Diagnostics**:
  - `npm run db:test --workspace @automechanica/backend`.
  - `psql <DATABASE_URL> -c "select now()"` (if available).
- **Recovery**:
  - Roll back recent DB config changes.
  - If outage persists, place app in maintenance (503) and escalate.

## 2) Task Queue Backed Up
- **Detect**: Large pending tasks count, slow processing, admin metrics show high queue depth.
- **Immediate actions**:
  - Pause new task producers if possible.
  - Scale worker processes horizontally.
  - Increase `MAX_CONCURRENT_TASKS` cautiously.
- **Diagnostics**:
  - Inspect stuck tasks: `GET /api/admin/tasks?status=pending|dead`.
  - Check worker logs for repeated failures/backoff.
- **Recovery**:
  - Requeue dead tasks via admin API after fixing root cause.
  - If payload-specific, quarantine offending tasks.

## 3) Agent Failures / Retries
- **Detect**: Repeated agent errors in logs, agent_events showing frequent failures.
- **Immediate actions**:
  - Identify failing agent type and recent code/config changes.
  - Reduce concurrency for that agent; disable triggering workflows if needed.
- **Diagnostics**:
  - Review recent `agent_events` records for errors/reasoning.
  - Reproduce locally with the same payload in a sandbox.
- **Recovery**:
  - Patch agent logic or prompts; deploy hotfix.
  - Requeue affected tasks/workflows and monitor success rate.

## 4) High Error Rates
- **Detect**: Spikes in 5xx/4xx from logs, monitoring alerts, or user reports.
- **Immediate actions**:
  - Check recent deployments; consider rollback if correlated.
  - Verify upstream dependencies (DB, LLM providers, external APIs).
- **Diagnostics**:
  - Inspect structured logs by route and error message.
  - Check health endpoint and admin metrics for dependencies status.
- **Recovery**:
  - Roll back to last known-good deploy if regression confirmed.
  - Add temporary feature flags or rate limits to failing surfaces.

## 5) Slow Performance
- **Detect**: Elevated latency in logs/health, slow queries logged (>= `SLOW_QUERY_THRESHOLD_MS`).
- **Immediate actions**:
  - Inspect recent slow-query logs and hot paths.
  - Scale application or database vertically/horizontally as a stopgap.
- **Diagnostics**:
  - Run EXPLAIN ANALYZE on slow queries; verify indexes.
  - Check pool saturation (health endpoint exposes pool totals).
- **Recovery**:
  - Add/adjust indexes, optimize queries, tune pool settings.
  - Cache hot reads or reduce payload sizes.

## 6) Deployment Rollback
- **Trigger**: Regression detected after release (errors, failed health checks).
- **Steps**:
  - Stop traffic to the faulty version (per deploy platform).
  - Redeploy previous known-good build.
  - Clear/redo migrations only if compatible; otherwise, restore from backups.
  - Announce rollback and track follow-up fixes before re-release.

## 7) Data Corruption / Integrity Issues
- **Detect**: Missing/invalid records, constraint violations, failed migrations.
- **Immediate actions**:
  - Halt writes to affected subsystems (feature flag or maintenance mode).
  - Capture snapshots/backups before attempting fixes.
- **Diagnostics**:
  - Validate schema constraints; run targeted queries to scope impact.
  - Review recent migrations or scripts that touched the data.
- **Recovery**:
  - Restore from latest good backup if corruption is widespread.
  - Write migration/cleanup scripts for targeted correction; re-enable writes after verification.

## 8) Emergency Contacts & Escalation
- **On-call**: Assign an on-call rotation for production hours.
- **Escalation path**:
  - L1: On-call engineer triages and mitigates.
  - L2: Tech lead/architect for systemic or schema-impacting issues.
  - L3: Stakeholders/PM for user-facing incident comms.
- **Communications**:
  - Use a single incident channel/document with timeline of actions and decisions.
  - Post public status updates if user-facing impact is confirmed.

## 9) Post-Incident Review
- Within 48 hours of resolution, document:
  - Root cause, impact, time to detect/resolve.
  - What went well/poorly; concrete action items with owners and deadlines.
  - Tests/alerts to add to prevent recurrence.
