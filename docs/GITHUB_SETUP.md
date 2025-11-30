# GITHUB_SETUP.md

## Branch Protection for `main`

1. Open **Settings → Branches → Add rule**.
2. Configure rule for `main`:
   - Require a pull request before merging.
   - Require status checks to pass:
     - CI / Lint
     - CI / Format
     - CI / Typecheck
     - CI / Test-backend
     - CI / Test-frontend
     - CI / Build
   - Require branches to be up to date before merging.
   - Require conversation resolution before merging.
   - Include administrators.
3. Save the rule.

## Workflow Reference

- `.github/workflows/ci.yml` — lint, format check, typecheck, backend/frontend tests, and build.
- `.github/workflows/dependency-review.yml` — dependency vulnerability checks on PRs.
- `.github/workflows/codeql.yml` — static analysis and security scanning.

Ensure repository secrets (if any) are scoped to the least privilege required for CI.
