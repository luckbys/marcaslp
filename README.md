# Legado Marcas - Site Institucional

Landing page institucional para a Legado Marcas, empresa especializada em registro de marcas e patentes.

## Funcionalidades

- Design responsivo e moderno
- Informações sobre os serviços de registro de marcas
- Chatbot integrado com n8n para automação de atendimento

## Configuração do Chatbot

O chatbot utiliza um webhook do n8n para processar mensagens. Siga estas etapas para configurá-lo:

### 1. Configurar o n8n

1. Configure um novo workflow no n8n
2. Adicione um nó "Webhook" como trigger
3. Configure o webhook para aceitar solicitações POST
4. Adicione lógica para processar a mensagem (ex: integração com IA, respostas predefinidas, etc.)
5. Certifique-se de que o webhook retorne uma resposta em um dos formatos suportados:
   - Formato 1: `{ "response": "Texto da resposta" }`
   - Formato 2: `[{ "resposta": "Texto da resposta" }]`
6. Ative o workflow e copie a URL do webhook

### 2. Configurar o ambiente local

1. Copie o arquivo `.env.example` para `.env`:
   ```
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e substitua o valor de `VITE_WEBHOOK_URL` pela URL do seu webhook do n8n:
   ```
   VITE_WEBHOOK_URL=https://seu-n8n-webhook-real.com/hook
   ```

3. Reinicie a aplicação para que as alterações tenham efeito

### 3. Configuração para produção

Ao implantar em produção, certifique-se de configurar a variável de ambiente `VITE_WEBHOOK_URL` no seu provedor de hospedagem.

Por exemplo, no Netlify:
- Vá para Site settings > Build & deploy > Environment
- Adicione a variável `VITE_WEBHOOK_URL` com o valor correto

## Desenvolvimento

### Instalação

```bash
npm install
```

### Executar em modo de desenvolvimento

```bash
npm run dev
```

### Compilar para produção

```bash
npm run build
```

# Legado Marcas e Patentes

Site desenvolvido para a empresa Legado Marcas e Patentes, especializada em registro de marcas e patentes.

## Instruções para Configuração do EmailJS

O formulário de contato utiliza o serviço [EmailJS](https://www.emailjs.com/) para enviar e-mails diretamente do frontend, sem necessidade de backend.

### Passos para Configurar:

1. **Crie uma conta no EmailJS**
   - Acesse [https://www.emailjs.com/](https://www.emailjs.com/) e crie uma conta.
   - O plano gratuito permite até 200 e-mails por mês.

2. **Configure um serviço de e-mail**
   - No painel do EmailJS, vá para "Email Services" e clique em "Add New Service".
   - Escolha o serviço de e-mail que deseja usar (Gmail, Outlook, etc.).
   - Siga as instruções para conectar sua conta de e-mail.

3. **Crie um template de e-mail**
   - No painel do EmailJS, vá para "Email Templates" e clique em "Create New Template".
   - Dê um nome ao template (ex: "formulario_contato").
   - Copie o conteúdo do arquivo `emailjs-template-exemplo.html` e cole no editor.
   - Ajuste conforme necessário e salve.

4. **Obtenha as credenciais**
   - No painel do EmailJS, vá para "Account" > "API Keys" para obter sua Public Key.
   - Anote o Service ID do serviço que você criou.
   - Anote o Template ID do template que você criou.

5. **Configure as variáveis de ambiente**
   - No arquivo `.env` do projeto, atualize as seguintes variáveis:
     ```
     VITE_EMAILJS_SERVICE_ID=seu_service_id
     VITE_EMAILJS_TEMPLATE_ID=seu_template_id
     VITE_EMAILJS_PUBLIC_KEY=sua_public_key
     ```

### Como o formulário funciona:

O componente `ContactForm` utiliza a biblioteca `@emailjs/browser` para enviar os dados do formulário para o EmailJS, que então envia um e-mail formatado conforme o template definido.

Quando o usuário preenche o formulário e clica em "Enviar Mensagem", os seguintes passos ocorrem:

1. Os dados do formulário são validados.
2. Uma solicitação é enviada para o EmailJS com os dados do formulário.
3. O EmailJS processa os dados usando o template configurado.
4. Um e-mail é enviado para o destinatário configurado no serviço de e-mail.
5. Um feedback visual é mostrado ao usuário (sucesso ou erro).

### Personalização do template:

Os campos disponíveis no template são:
- `{{nome}}`: Nome do usuário
- `{{email}}`: E-mail do usuário
- `{{telefone}}`: Telefone do usuário
- `{{assunto}}`: Assunto selecionado pelo usuário
- `{{mensagem}}`: Mensagem digitada pelo usuário
- `{{data}}`: Data do envio (adicionada automaticamente pelo EmailJS)

## Executando o Projeto

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Criar build de produção
npm run build
``` 