/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_ENABLE_MOCKS?: string | boolean;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
