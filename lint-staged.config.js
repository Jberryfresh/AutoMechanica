export default {
  'packages/backend/**/*.{ts,tsx}': [
    'pnpm --filter @automechanica/backend exec eslint --fix',
    'pnpm --filter @automechanica/backend exec prettier --write',
    'pnpm --filter @automechanica/backend typecheck'
  ],
  'packages/frontend/**/*.{ts,tsx,css}': [
    'pnpm --filter @automechanica/frontend exec eslint --fix',
    'pnpm --filter @automechanica/frontend exec prettier --write',
    'pnpm --filter @automechanica/frontend typecheck'
  ],
  '*.{json,md}': ['pnpm exec prettier --write']
};
