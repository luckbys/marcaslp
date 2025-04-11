# Use a imagem base do Node.js
FROM node:22-alpine as builder

# Instalar dependências necessárias
RUN apk add --no-cache python3 make g++ git

# Configurar variáveis de ambiente para o build
ENV NODE_ENV=production
ENV VITE_BUILD_MODE=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar todas as dependências (incluindo dev para build)
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Construir a aplicação
RUN npm run build

# Imagem de produção
FROM node:22-alpine

WORKDIR /app

# Copiar apenas os arquivos necessários
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# Expor a porta que o servidor vai usar
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"] 