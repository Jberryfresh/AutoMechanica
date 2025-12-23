# Performance Validation Plan

Targets (from MAIN_PLAN §7.4):
- API p95 < 200ms
- Page load < 2s
- Concurrency: 100+ simultaneous users
- DB queries: common paths < 100ms
- Worker throughput: tasks/min sustained
- LLM latency within budget per task type

## Test Scenarios
1. **API latency**: Load-test critical endpoints (health, parts list/detail, support chat POST, admin metrics) with 100–200 RPS ramp. Capture p50/p95 and error rates.
2. **Frontend load**: Lighthouse/WebPageTest against deployed frontend; validate TTI/CLS/LCP < 2s on mid-tier device/network.
3. **DB queries**: Use slow-query logs and EXPLAIN ANALYZE on hottest queries (parts list, fitment lookups, tasks leasing).
4. **Queue throughput**: Simulate task bursts; measure time to drain with current worker count and MAX_CONCURRENT_TASKS.
5. **LLM calls**: Sample agent flows (support, SEO) to ensure latency and cost within expected bounds; verify retries/backoff.

## Tooling Suggestions
- k6 or Artillery for API load.
- Lighthouse CI or WebPageTest for frontend.
- pg_stat_statements / EXPLAIN ANALYZE for DB profiling.
- Custom scripts to enqueue synthetic tasks and measure drain time.

## Runbook
1. Set test environment and base URLs; warm caches.
2. Execute load tests with controlled ramp (e.g., 10 → 200 RPS over 10m).
3. Capture metrics: latency distribution, errors, saturation (CPU/mem/pool).
4. Profile slow queries; add indexes or optimize code if >100ms p95.
5. Retest after optimizations until targets met.
6. Document results and deltas for each run.
