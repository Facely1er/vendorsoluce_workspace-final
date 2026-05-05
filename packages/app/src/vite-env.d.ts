/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CYBERCAUTION_WORKSPACE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
