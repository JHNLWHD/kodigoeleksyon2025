
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POSTHOG_API_KEY: string;
  readonly VITE_POSTHOG_HOST?: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
