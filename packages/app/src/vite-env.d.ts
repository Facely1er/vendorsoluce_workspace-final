/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ERMIT_API_URL?: string;
  readonly VITE_ERMIT_API_KEY?: string;
  readonly VITE_CYBERCAUTION_WORKSPACE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
