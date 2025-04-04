// Este é um simulador de webhook para testes locais
// Seria implementado em um servidor Express ou similar

// Exemplo de como implementar em Express.js:
/*
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Respostas pré-definidas para simular o comportamento do chatbot
const respostas = {
  "saudacao": ["Olá!", "Oi, tudo bem?", "Olá, como posso ajudar?"],
  "registro_marca": ["Para registrar sua marca, precisamos fazer uma análise de viabilidade primeiro. Podemos iniciar esse processo agora mesmo.", "O registro de marca é um processo importante para proteger seu negócio. Qual é o nome da sua marca?"],
  "preco": ["O preço do registro varia conforme a classe e o escopo da proteção. Podemos fazer um orçamento personalizado para você. Qual é o seu ramo de atividade?"],
  "tempo": ["O processo de registro no INPI leva em média 12 a 18 meses para ser concluído. Durante esse período, sua marca já recebe proteção provisória."],
  "contato": ["Você pode falar conosco pelo telefone (12) 3341-0600 ou pelo WhatsApp. Deseja que entremos em contato com você?"],
  "default": ["Entendi. Poderia nos fornecer mais detalhes para ajudarmos melhor?", "Interessante. Como posso ajudar com isso?", "Compreendo sua necessidade. Temos especialistas que podem auxiliar nesse processo."]
};

// Função simples para identificar a intenção da mensagem
function identificarIntencao(mensagem) {
  mensagem = mensagem.toLowerCase();
  
  if (/ol[aá]|oi|bom dia|boa tarde|boa noite/.test(mensagem)) return "saudacao";
  if (/registr|protect|marca/.test(mensagem)) return "registro_marca";
  if (/pre[çc]o|valor|custo|quanto custa/.test(mensagem)) return "preco";
  if (/tempo|prazo|demora|dura[çc][aã]o/.test(mensagem)) return "tempo";
  if (/contato|telefone|email|whatsapp/.test(mensagem)) return "contato";
  
  return "default";
}

app.post('/webhook', (req, res) => {
  try {
    const { message } = req.body;
    console.log('Mensagem recebida:', message);
    
    // Identificar intenção e selecionar resposta
    const intencao = identificarIntencao(message);
    const possiveisRespostas = respostas[intencao] || respostas.default;
    const resposta = possiveisRespostas[Math.floor(Math.random() * possiveisRespostas.length)];
    
    // Simular uma pequena latência para parecer mais natural
    setTimeout(() => {
      res.json({ response: resposta });
    }, 1000);
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de simulação rodando em http://localhost:${PORT}`);
});
*/

// Este arquivo serve apenas como referência para implementação.
// Para usar em produção:
// 1. Configure um endpoint no n8n que aceite requisições POST
// 2. Configure seu fluxo no n8n para processar a mensagem e retornar uma resposta
// 3. Substitua a URL do webhook no componente ChatBot pela URL do seu endpoint n8n 