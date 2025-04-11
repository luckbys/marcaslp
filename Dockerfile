# Use a imagem base do Node.js
FROM node:22-alpine

# Instalar dependências necessárias para compilação
RUN apk add --no-cache python3 make g++ git

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci --include=dev

# Copiar o resto dos arquivos
COPY . .

# Construir a aplicação
RUN npm run build

# Limpar dependências de desenvolvimento
RUN npm prune --omit=dev

# Expor a porta que o servidor vai usar
ENV PORT=3000
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"] 