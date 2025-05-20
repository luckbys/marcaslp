/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBHOOK_URL: string
  readonly VITE_EVOLUTION_API_URL: string
  readonly VITE_EVOLUTION_API_KEY: string
  readonly VITE_EVOLUTION_INSTANCE_ID: string
  // adicione mais variáveis de ambiente conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 