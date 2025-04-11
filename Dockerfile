# Use a imagem oficial do Node.js
FROM node:22-alpine

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Expor a porta que o servidor vai usar
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"] 