import '@testing-library/jest-dom/vitest';

process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL ?? 'http://localhost:3001';
process.env.VITE_APP_NAME = process.env.VITE_APP_NAME ?? 'AutoMechanica';
process.env.VITE_ENABLE_MOCKS = process.env.VITE_ENABLE_MOCKS ?? 'false';
