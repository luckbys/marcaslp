/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBHOOK_URL: string
  // adicione mais variáveis de ambiente conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 