/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_AI_TIMEOUT: string;
  readonly VITE_AI_MAX_RETRIES: string;
  readonly VITE_AI_CACHE_ENABLED: string;
  readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}