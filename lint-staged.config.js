export default {
  'packages/backend/**/*.{ts,tsx}': [
    'npm run lint:fix --workspace @automechanica/backend --',
    'npm run format --workspace @automechanica/backend --',
    () => 'npm run typecheck --workspace @automechanica/backend'
  ],
  'packages/frontend/**/*.{ts,tsx,css}': [
    'npm run lint:fix --workspace @automechanica/frontend --',
    'npm run format --workspace @automechanica/frontend --',
    () => 'npm run typecheck --workspace @automechanica/frontend'
  ],
  '*.{json,md}': ['npm exec prettier --write']
};
