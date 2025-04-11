# Use a imagem oficial do Node.js
FROM node:22-alpine

# Criar diretório da aplicação
WORKDIR /app

# Instalar dependências
COPY package.json ./
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Construir a aplicação
RUN npm run build

# Limpar dependências de desenvolvimento e instalar apenas produção
RUN npm prune --production

# Expor a porta que o servidor vai usar
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"] 