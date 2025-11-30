interface FrontendConfig {
  apiBaseUrl: string;
  appName: string;
  enableMocks: boolean;
}

function parseBoolean(value: string | boolean | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  return value.toLowerCase() !== 'false' && value !== '0';
}

export function loadConfig(): FrontendConfig {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const appName = import.meta.env.VITE_APP_NAME ?? 'AutoMechanica';

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL is required. Set it in your frontend .env file.');
  }

  return {
    apiBaseUrl,
    appName,
    enableMocks: parseBoolean(import.meta.env.VITE_ENABLE_MOCKS, false),
  };
}

export const frontendConfig = loadConfig();
