import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, Bot, Trash2, Volume2, RefreshCw, ThumbsUp, ThumbsDown, Loader2, ArrowDown } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isRead?: boolean;
  isPartOfSeries?: boolean; // Para identificar mensagens que são parte de uma série
  seriesId?: string; // ID da série de mensagens relacionadas
}

interface WebhookMessage {
  messageId: string;
  message: string;
  timestamp?: string;
}

interface UserInfo {
  name: string;
  email: string;
}

interface QuickAction {
  id: string;
  text: string;
  action: () => void;
}

// Interfaces para a Evolution API
interface EvolutionApiPart {
  type: 'text';
  text: string;
}

interface EvolutionApiMessage {
  role: 'user' | 'agent';
  parts: EvolutionApiPart[];
}

interface EvolutionApiStatus {
  state: string;
  message: EvolutionApiMessage;
  timestamp: string;
}

interface EvolutionApiArtifact {
  parts: EvolutionApiPart[];
  index: number;
}

interface EvolutionApiResult {
  id: string;
  sessionId: string;
  status: EvolutionApiStatus;
  artifacts: EvolutionApiArtifact[];
  history: EvolutionApiMessage[];
}

interface EvolutionApiResponse {
  jsonrpc: string;
  id: string;
  result: EvolutionApiResult;
}

interface ChatBotProps {
  webhookUrl?: string;
  botWebhookUrl?: string;
  botName?: string;
  initialMessage?: string;
  primaryColor?: string;
  botAvatar?: string;
  userAvatar?: string;
  evolutionApiUrl?: string;  // URL da Evolution API
  evolutionApiKey?: string;  // API Key da Evolution API
  evolutionApiInstance?: string;  // Instance ID da Evolution API
}

// Limite de caracteres por card
const CARD_CHAR_LIMIT = 200;

const ChatBot: React.FC<ChatBotProps> = ({ 
  webhookUrl = "https://press-n8n.jhkbgs.easypanel.host/webhook/notifica",
  botWebhookUrl = "https://press-n8n.jhkbgs.easypanel.host/webhook/con-chat",
  botName = "Legado Assistente", 
  initialMessage = "Olá! Para iniciarmos nosso atendimento, poderia me informar seu nome e email?",
  primaryColor = "#1E40AF",
  botAvatar = "",
  userAvatar = "",
  evolutionApiUrl = "",
  evolutionApiKey = "",
  evolutionApiInstance = ""
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [isFirstInteraction, setIsFirstInteraction] = useState<boolean>(true);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showUserForm, setShowUserForm] = useState<boolean>(true);
  const [isHumanAttendance, setIsHumanAttendance] = useState<boolean>(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState<boolean>(true);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ações rápidas - perguntas frequentes
  const quickActions: QuickAction[] = [
    {
      id: 'q1',
      text: 'Como registrar minha marca?',
      action: () => handleQuickAction('Como faço para registrar minha marca?')
    },
    {
      id: 'q2',
      text: 'Quanto custa?',
      action: () => handleQuickAction('Quanto custa o registro de marca?')
    },
    {
      id: 'q3',
      text: 'Quanto tempo demora?',
      action: () => handleQuickAction('Quanto tempo demora o processo de registro?')
    },
    {
      id: 'q4',
      text: 'Falar com humano',
      action: () => handleQuickAction('Gostaria de falar com um atendente humano.')
    }
  ];

  // Verificar se a URL do webhook está definida
  useEffect(() => {
    if (!webhookUrl) {
      console.error('VITE_WEBHOOK_URL não está definida nas variáveis de ambiente');
      setError('Configuração do chat não está completa. Por favor, entre em contato por outros meios.');
    } else {
      setError(null);
    }
  }, [webhookUrl]);

  // Inicializar chat com mensagem de boas-vindas
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          text: initialMessage,
          sender: 'bot',
          timestamp: new Date(),
          isRead: true
        }
      ]);
    }
  }, [initialMessage]);

  // Auto-scroll para a mensagem mais recente
  useEffect(() => {
    chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Atualizar contagem de mensagens não lidas
    if (!isOpen && messages.length > 0) {
      const newUnreadCount = messages.filter(msg => msg.sender === 'bot' && !msg.isRead).length;
      setUnreadMessages(newUnreadCount);
    }
  }, [messages, isOpen]);

  // Focar no input quando o chat é aberto
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      
      // Marcar todas as mensagens como lidas quando o chat é aberto
      if (unreadMessages > 0) {
        setMessages(prev => 
          prev.map(msg => ({...msg, isRead: true}))
        );
        setUnreadMessages(0);
      }
    }
  }, [isOpen]);

  // Função para verificar se o usuário está no final do chat
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
      setIsScrolledToBottom(isAtBottom);
      setShowScrollButton(!isAtBottom);
    }
  };

  // Função para rolar suavemente até o final (apenas quando o botão é clicado)
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setIsScrolledToBottom(true);
      setShowScrollButton(false);
    }
  };

  // Adicionar listener de scroll
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Função para formatar o texto com quebras de linha, parágrafos e listas
  const formatMessage = (text: string) => {
    if (!text) return '';

    // Tratar markdown
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrito
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Itálico
      .replace(/\n\s*\n/g, '</p><p>') // Parágrafos
      .replace(/\n/g, '<br>'); // Quebras de linha simples

    // Identificar e formatar listas numeradas e com marcadores
    formattedText = formattedText
      .replace(/(\d+\.\s+)(.*?)(?=<br>|<\/p>|$)/g, '<li class="list-decimal">$2</li>') // Lista numerada
      .replace(/(\•|\-|\*)\s+(.*?)(?=<br>|<\/p>|$)/g, '<li class="list-disc">$2</li>'); // Lista com marcadores

    // Agrupar itens de lista
    if (formattedText.includes('<li')) {
      formattedText = '<ul class="pl-4 space-y-1">' + formattedText + '</ul>';
      formattedText = formattedText
        .replace(/<\/ul><br><ul[^>]*>/g, '') // Remover quebras entre itens de lista
        .replace(/<br><li/g, '<li'); // Remover quebras antes de itens
    }

    // Garantir que o texto esteja envolvido em parágrafos
    if (!formattedText.startsWith('<p>') && !formattedText.startsWith('<ul>')) {
      formattedText = '<p>' + formattedText;
    }
    if (!formattedText.endsWith('</p>') && !formattedText.endsWith('</ul>')) {
      formattedText = formattedText + '</p>';
    }

    return formattedText;
  };

  // Função para dividir texto longo em múltiplos cards
  const splitLongMessage = (text: string): string[] => {
    // Se o texto for curto, retornar como está
    if (text.length <= CARD_CHAR_LIMIT) {
      return [text];
    }

    const messageParts: string[] = [];
    
    // Dividir o texto por parágrafos
    const paragraphs = text.split(/\n\n+/);
    
    let currentPart = '';
    
    for (const paragraph of paragraphs) {
      // Se adicionar este parágrafo exceder o limite
      if (currentPart.length + paragraph.length > CARD_CHAR_LIMIT && currentPart.length > 0) {
        messageParts.push(currentPart);
        currentPart = paragraph;
      } 
      // Se o próprio parágrafo for maior que o limite
      else if (paragraph.length > CARD_CHAR_LIMIT) {
        // Se já tivermos algo no currentPart, adicionar primeiro
        if (currentPart.length > 0) {
          messageParts.push(currentPart);
          currentPart = '';
        }
        
        // Dividir o parágrafo longo em frases
        const sentences = paragraph.split(/(?<=\.|\?|\!) /);
        let sentencePart = '';
        
        for (const sentence of sentences) {
          if (sentencePart.length + sentence.length > CARD_CHAR_LIMIT && sentencePart.length > 0) {
            messageParts.push(sentencePart);
            sentencePart = sentence;
          } else {
            sentencePart += (sentencePart ? ' ' : '') + sentence;
          }
        }
        
        if (sentencePart.length > 0) {
          currentPart = sentencePart;
        }
      } 
      // Caso contrário, adicionar ao pedaço atual
      else {
        if (currentPart.length > 0) {
          currentPart += '\n\n';
        }
        currentPart += paragraph;
      }
    }
    
    // Adicionar o último pedaço se existir
    if (currentPart.length > 0) {
      messageParts.push(currentPart);
    }
    
    return messageParts;
  };

  // Função para enviar mensagem via Evolution API
  const sendEvolutionApiMessage = async (phoneNumber: string, message: string) => {
    try {
      console.log('Iniciando envio de mensagem via Evolution API');
      
      // Garantir que temos todas as configurações necessárias
      if (!evolutionApiUrl || !evolutionApiKey || !evolutionApiInstance) {
        throw new Error('Configurações da Evolution API não encontradas');
      }

      // Remover barras extras da URL e garantir formato correto
      const baseUrl = evolutionApiUrl.replace(/\/+$/, '');
      
      // Usar a instância fornecida nas props
      const instanceId = evolutionApiInstance;
      
      // Formatar o número do telefone
      const formattedNumber = phoneNumber.includes('@s.whatsapp.net') ? 
        phoneNumber : `${phoneNumber}@s.whatsapp.net`;
      
      console.log('Número formatado:', formattedNumber);
      console.log('Usando instância:', instanceId);

      const payload = {
        number: formattedNumber,
        options: {
          delay: 1200,
          presence: "composing"
        },
        textMessage: {
          text: message
        }
      };

      console.log('Payload da requisição:', payload);

      // Construir URL corretamente
      const url = `${baseUrl}/message/sendText/${instanceId}`;
      console.log('URL da requisição:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey
        },
        body: JSON.stringify(payload)
      });

      console.log('Status da resposta:', response.status);
      const responseData = await response.json();
      console.log('Dados da resposta:', responseData);

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${response.status} - ${JSON.stringify(responseData)}`);
      }

      return responseData;
    } catch (error) {
      console.error('Erro detalhado ao enviar mensagem:', error);
      throw error;
    }
  };

  // Função para enviar notificação para o webhook apropriado
  const sendWebhookNotification = async (type: string, message: string, additionalData = {}) => {
    try {
      // Determinar qual webhook usar baseado no modo de atendimento
      const currentWebhook = isHumanAttendance ? 
        "https://press-n8n.jhkbgs.easypanel.host/webhook/notifica" : 
        botWebhookUrl;
      
      console.log('Enviando para webhook:', currentWebhook, 'Modo:', isHumanAttendance ? 'Humano' : 'Bot');
      
      const response = await fetch(currentWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          message,
          userId: userInfo?.email || 'visitor',
          userName: userInfo?.name || 'Visitante',
          userEmail: userInfo?.email,
        timestamp: new Date(),
          isHumanAttendance,
          ...additionalData
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar notificação: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      throw error;
    }
  };

  // Modificar a função handleQuickAction
  const handleQuickAction = async (text: string) => {
    setInputValue(text);
    setShowQuickActions(false);
    
    if (text === 'Gostaria de falar com um atendente humano.') {
      try {
        // Primeiro ativar modo de atendimento humano
        setIsHumanAttendance(true);

        // Adicionar mensagem do usuário ao chat
        setMessages(prev => [...prev, {
      id: Date.now().toString(),
          text: text,
      sender: 'user',
      timestamp: new Date(),
      isRead: true
        }]);

        // Enviar notificação para o webhook humano
        await fetch("https://press-n8n.jhkbgs.easypanel.host/webhook/notifica", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'HUMAN_REQUESTED',
            message: text,
          userId: userInfo?.email || 'visitor',
          userName: userInfo?.name || 'Visitante',
          userEmail: userInfo?.email,
            timestamp: new Date(),
            isHumanAttendance: true,
            status: 'pending',
            requestType: 'human_attendance'
        }),
      });
      
        // Adicionar mensagem de confirmação
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "Você foi transferido para um atendente humano. Em breve alguém irá te atender.",
          sender: 'bot',
          timestamp: new Date(),
          isRead: true
        }]);

      } catch (error) {
        console.error('Erro ao solicitar atendimento humano:', error);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "Desculpe, não foi possível conectar com um atendente no momento. Por favor, tente novamente mais tarde.",
          sender: 'bot',
          timestamp: new Date(),
          isRead: true
        }]);
        setIsHumanAttendance(false);
      }
    } else {
      // Para outras ações rápidas
      setTimeout(() => {
        sendMessage(text);
      }, 100);
    }
  };

  // Modificar função para verificar novas mensagens do webhook de resposta
  const checkForNewMessages = async () => {
    if (!isHumanAttendance || !userInfo?.email) return;

    try {
      // Usar POST com os dados no body
      const response = await fetch("https://press-n8n.jhkbgs.easypanel.host/webhook/msgrecebe", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'mode': 'cors'
        },
        body: JSON.stringify({
          userId: userInfo.email,
          lastMessageId: lastMessageId || '',
          type: 'CHECK_MESSAGES'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Verificar se há novas mensagens
        if (data.messages && Array.isArray(data.messages)) {
          // Processar múltiplas mensagens se disponível
          data.messages.forEach((msg: WebhookMessage) => {
            if (msg.messageId && msg.messageId !== lastMessageId) {
              setLastMessageId(msg.messageId);
              setMessages(prev => [...prev, {
                id: msg.messageId,
                text: msg.message,
                sender: 'bot',
                timestamp: new Date(msg.timestamp || Date.now()),
                isRead: isOpen
              }]);

              // Reproduzir som de notificação se o chat estiver minimizado
              if (!isOpen) {
                playNotificationSound();
                setUnreadMessages(prev => prev + 1);
              }
            }
          });
        }
        // Fallback para formato de mensagem única
        else if (data.message && data.messageId && data.messageId !== lastMessageId) {
          setLastMessageId(data.messageId);
          setMessages(prev => [...prev, {
            id: data.messageId,
            text: data.message,
            sender: 'bot',
            timestamp: new Date(data.timestamp || Date.now()),
            isRead: isOpen
          }]);

          // Reproduzir som de notificação se o chat estiver minimizado
          if (!isOpen) {
            playNotificationSound();
            setUnreadMessages(prev => prev + 1);
          }
        }
      } else {
        console.warn('Resposta não ok do servidor:', response.status);
      }
    } catch (error) {
      console.error('Erro ao verificar novas mensagens:', error);
    }
  };

  // Modificar useEffect para polling de novas mensagens
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (isHumanAttendance && userInfo?.email) {
      // Enviar informações do usuário apenas uma vez ao iniciar o modo humano
      fetch("https://press-n8n.jhkbgs.easypanel.host/webhook/msgrecebe", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'mode': 'cors'
        },
        body: JSON.stringify({
          userId: userInfo.email,
          userName: userInfo.name,
          userEmail: userInfo.email,
          timestamp: new Date(),
          type: 'INIT_HUMAN_CHAT'
        }),
      }).catch(error => console.error('Erro ao inicializar chat humano:', error));

      // Iniciar polling apenas para verificar novas mensagens
      pollInterval = setInterval(checkForNewMessages, 3000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isHumanAttendance, userInfo]);

  // Modificar a função sendMessage para processar a resposta do bot
  const sendMessage = async (overrideText?: string) => {
    const messageText = overrideText || inputValue;
    
    if (!messageText.trim()) return;
    
    // Esconder perguntas frequentes após primeira mensagem
    setShowQuickActions(false);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      isRead: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    if (!overrideText) setInputValue('');
    setIsLoading(true);
    
    try {
      // Enviar mensagem para o webhook com tipo apropriado
      console.log('Enviando mensagem para webhook:', isHumanAttendance ? 'humano' : 'bot');
      const response = await sendWebhookNotification(
        isHumanAttendance ? 'HUMAN_MESSAGE' : 'BOT_MESSAGE',
        messageText,
        {
          conversationId: userInfo?.email || 'anonymous',
          messageId: userMessage.id
        }
      );

      console.log('Resposta recebida do webhook:', response);

      // Processar resposta
      let botResponse = "";
      
      if (isHumanAttendance) {
        // Se for atendimento humano, apenas confirmar o recebimento
        botResponse = "Mensagem enviada para o atendente.";
      } else {
        // Se for bot, processar a resposta da Evolution API
        try {
          console.log('Processando resposta do bot...');
          
          // Verificar se temos uma resposta válida da Evolution API
          if (response?.result) {
            const result = response.result;
            console.log('Result:', result);
            
            // Tentar obter o texto da mensagem da status
            if (result.status?.message?.parts?.[0]?.text) {
              botResponse = result.status.message.parts[0].text;
              console.log('Texto encontrado em status.message:', botResponse);
            }
            // Se não encontrar no status, tentar nos artifacts
            else if (result.artifacts?.[0]?.parts?.[0]?.text) {
              botResponse = result.artifacts[0].parts[0].text;
              console.log('Texto encontrado em artifacts:', botResponse);
            }
            // Se não encontrar em nenhum lugar específico, procurar no histórico
            else if (result.history?.length > 0) {
              const lastMessage = result.history[result.history.length - 1];
              if (lastMessage.role === 'agent' && lastMessage.parts?.[0]?.text) {
                botResponse = lastMessage.parts[0].text;
                console.log('Texto encontrado no histórico:', botResponse);
              }
            }
            
            // Se ainda não encontrou, fazer uma busca genérica
            if (!botResponse) {
              console.log('Tentando busca genérica por texto na resposta');
              const responseStr = JSON.stringify(result);
              const matches = responseStr.match(/"text":"([^"]+)"/);
              if (matches && matches[1]) {
                botResponse = matches[1];
                console.log('Texto encontrado em busca genérica:', botResponse);
              }
            }
          }
          
          // Se ainda não temos uma resposta, usar mensagem padrão
        if (!botResponse) {
            console.warn('Não foi possível encontrar o texto da resposta:', response);
            botResponse = "Desculpe, não consegui processar a resposta corretamente.";
          }
        } catch (error) {
          console.error('Erro ao processar resposta do bot:', error);
          botResponse = "Desculpe, ocorreu um erro ao processar a resposta.";
        }
      }

      // Adicionar a resposta às mensagens apenas se não for modo humano
      if (!isHumanAttendance) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date(),
          isRead: isOpen
        }]);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        sender: 'bot',
        timestamp: new Date(),
        isRead: isOpen
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Modificar a função toggleAttendanceMode
  const toggleAttendanceMode = async () => {
    const newMode = !isHumanAttendance;
    setIsHumanAttendance(newMode);
    
    try {
      // Notificar mudança de modo para ambos os webhooks
      const notification = {
        newMode: newMode ? 'human' : 'bot',
        previousMode: newMode ? 'bot' : 'human'
      };

      // Notificar o webhook humano
      await sendWebhookNotification('MODE_CHANGED', '', {
        ...notification,
        webhook: 'human'
      });

      // Notificar o webhook do bot
      const currentWebhook = botWebhookUrl;
      await fetch(currentWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'MODE_CHANGED',
          message: '',
          userId: userInfo?.email || 'visitor',
          userName: userInfo?.name || 'Visitante',
          userEmail: userInfo?.email,
          timestamp: new Date(),
          isHumanAttendance: newMode,
          ...notification,
          webhook: 'bot'
        }),
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `Modo de atendimento alterado para: ${newMode ? 'Humano' : 'Bot'}`,
        sender: 'bot',
        timestamp: new Date(),
        isRead: true
      }]);
    } catch (error) {
      console.error('Erro ao mudar modo de atendimento:', error);
    }
  };

  // Função para tocar som de notificação
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3'); // Certifique-se de adicionar este arquivo
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.warn('Não foi possível reproduzir o som de notificação', e);
    }
  };

  // Limpar histórico de conversa
  const clearConversation = () => {
    if (confirm('Deseja limpar o histórico de conversa?')) {
      setMessages([
        {
        id: Date.now().toString(),
          text: initialMessage,
        sender: 'bot',
        timestamp: new Date(),
          isRead: true
        }
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Componentes de Avatar para bot e usuário
  const BotAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
      {botAvatar ? (
        <img src={botAvatar} alt={botName} className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <Bot size={16} className="text-blue-600" />
      )}
    </div>
  );

  const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-2 flex-shrink-0">
      {userAvatar ? (
        <img src={userAvatar} alt="Você" className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <User size={16} className="text-white" />
      )}
    </div>
  );

  // Função para determinar se deve mostrar avatar e timestamp
  // Só mostra em mensagens que não são parte de série ou na última parte da série
  const shouldShowAvatarAndTime = (msg: Message, index: number) => {
    if (!msg.isPartOfSeries) return true;
    
    // Se for parte de uma série, verificar se é a última mensagem dessa série
    const isLastInSeries = index === messages.length - 1 || 
      messages[index + 1].seriesId !== msg.seriesId;
    
    return isLastInSeries;
  };

  // Detectar se é um dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Adicionar logs para debug
  useEffect(() => {
    console.log('ChatBot Props:', {
      evolutionApiUrl,
      evolutionApiKey,
      evolutionApiInstance,
      webhookUrl,
      botWebhookUrl
    });
  }, [evolutionApiUrl, evolutionApiKey, evolutionApiInstance, webhookUrl, botWebhookUrl]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão para abrir/fechar o chat */}
      <button
        onClick={toggleChat}
        className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 w-16 h-16 md:w-12 md:h-12"
        style={{ backgroundColor: primaryColor }}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? <X size={isMobile ? 32 : 24} /> : <MessageSquare size={isMobile ? 32 : 24} />}
        
        {!isOpen && unreadMessages > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-7 h-7 md:w-5 md:h-5 flex items-center justify-center animate-pulse">
            {unreadMessages > 9 ? '9+' : unreadMessages}
          </span>
        )}
      </button>

      {/* Janela do chat */}
      {isOpen && (
        <div 
          className={`fixed md:absolute ${isMobile ? 'inset-0' : 'bottom-16 right-0'} w-full md:w-96 bg-white md:rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 animate-fadeIn z-50`}
          style={{ 
            animation: 'fadeIn 0.3s ease-out',
            height: isMobile ? '100vh' : 'auto',
            maxHeight: isMobile ? '100vh' : '600px'
          }}
        >
          {/* Cabeçalho do chat */}
          <div 
            className="p-4 flex justify-between items-center text-white relative"
            style={{ 
              backgroundColor: primaryColor,
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="flex items-center">
              <div className="relative">
                <BotAvatar />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-semibold text-xl md:text-base">{botName}</h3>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  <span className="text-xs opacity-90">
                    {isHumanAttendance ? 'Atendimento Humano' : 'Online'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={clearConversation} 
                className="hover:bg-white/10 rounded-full p-2 transition-all duration-200"
                aria-label="Limpar conversa"
                title="Limpar conversa"
              >
                <Trash2 size={isMobile ? 22 : 16} />
              </button>
              <button 
                onClick={toggleAttendanceMode} 
                className="hover:bg-white/10 rounded-full p-2 transition-all duration-200"
                aria-label="Alternar modo de atendimento"
                title="Alternar modo de atendimento"
              >
                {isHumanAttendance ? <Bot size={isMobile ? 22 : 16} /> : <User size={isMobile ? 22 : 16} />}
              </button>
              <button 
                onClick={toggleChat} 
                className="hover:bg-white/10 rounded-full p-2 transition-all duration-200"
                aria-label="Fechar chat"
              >
                <X size={isMobile ? 24 : 18} />
              </button>
            </div>
          </div>

          {/* Container de mensagens */}
          <div 
            className="flex-1 p-4 overflow-y-auto bg-gray-50"
            style={{ 
              height: isMobile ? 'calc(100vh - 180px)' : 'auto',
              maxHeight: isMobile ? 'calc(100vh - 180px)' : '400px',
              backgroundImage: 'linear-gradient(to right, rgba(229, 231, 235, 0.2) 0%, rgba(229, 231, 235, 0.1) 100%)'
            }}
            onScroll={handleScroll}
            ref={chatContainerRef}
          >
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-3 text-base md:text-sm">
                {error}
              </div>
            )}
            
            {/* Formulário inicial do usuário */}
            {showUserForm && !userInfo && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get('name') as string;
                  const email = formData.get('email') as string;
                  
                  if (name && email) {
                    setUserInfo({ name, email });
                    setShowUserForm(false);
                    // Adicionar mensagem de boas-vindas personalizada
                    setMessages([
                      {
                        id: Date.now().toString(),
                        text: `Olá ${name}! Como posso ajudar você com o registro da sua marca hoje?`,
                        sender: 'bot',
                        timestamp: new Date(),
                        isRead: true
                      }
                    ]);
                  }
                }}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Digite seu nome"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Digite seu email"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Iniciar Conversa
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Mensagens do chat */}
            {messages.map((msg, index) => {
              const showAvatarAndTime = shouldShowAvatarAndTime(msg, index);
              const isSeriesContinuation = msg.isPartOfSeries && index > 0 && 
                messages[index - 1].seriesId === msg.seriesId;
              
              return (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-messageSlide group`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                  }}
                  data-sender={msg.sender}
                >
                  {msg.sender === 'bot' && (!isSeriesContinuation || showAvatarAndTime) && (
                    <div className="relative">
                      <BotAvatar />
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border-2 border-white rounded-full"></span>
                    </div>
                  )}
                  {msg.sender === 'bot' && isSeriesContinuation && !showAvatarAndTime && <div className="w-8 mr-2" />}
                  
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-md'
                        : 'bg-white text-gray-800 border border-gray-100 hover:border-gray-200 hover:shadow-md'
                    } ${isSeriesContinuation ? 'mt-1' : 'mt-0'}`}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} 
                      className="text-base md:text-sm whitespace-pre-wrap break-words leading-relaxed"
                    />
                    <div className={`text-xs mt-1 opacity-0 group-hover:opacity-70 transition-opacity ${
                      msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                  
                  {msg.sender === 'user' && (!isSeriesContinuation || showAvatarAndTime) && (
                    <div className="relative">
                      <UserAvatar />
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border-2 border-white rounded-full"></span>
                    </div>
                  )}
                  {msg.sender === 'user' && isSeriesContinuation && !showAvatarAndTime && <div className="w-8 ml-2" />}
                </div>
              );
            })}
            
            {/* Botões de ação rápida - Layout grid em mobile */}
            {isFirstInteraction && showQuickActions && (
              <div className="px-4 py-3 bg-white border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-3 font-medium">Perguntas frequentes:</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {quickActions.map(action => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm px-4 py-2.5 rounded-xl transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {action.id === 'q1' && <MessageSquare size={16} className="text-blue-500" />}
                      {action.id === 'q2' && <RefreshCw size={16} className="text-green-500" />}
                      {action.id === 'q3' && <Volume2 size={16} className="text-purple-500" />}
                      {action.id === 'q4' && <User size={16} className="text-orange-500" />}
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Indicador de digitação */}
            {isLoading && (
              <div className="flex justify-start mb-3 items-start animate-fadeIn">
                <div className="relative">
                  <BotAvatar />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <div className="bg-white text-gray-800 rounded-2xl px-4 py-3 border border-gray-100 shadow-sm ml-2 max-w-[85%] md:max-w-[75%]">
                  <div className="flex space-x-2 items-center">
                    <div className="text-sm text-gray-500">Digitando</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Área de input - Otimizada para mobile */}
          <div className="p-4 bg-white border-t border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Digite sua mensagem..."
                  className="w-full px-4 py-3 md:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
              <button
                className="text-white p-3 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                style={{ 
                  backgroundColor: isLoading || !inputValue.trim() ? '#9CA3AF' : primaryColor,
                  boxShadow: isLoading || !inputValue.trim() ? 'none' : '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
              >
                <Send size={isMobile ? 22 : 18} className={isLoading ? 'opacity-0' : 'opacity-100'} />
              </button>
            </div>
          </div>
          
          {/* Rodapé */}
          <div className="px-4 py-2.5 bg-white border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
              Powered by <span className="font-medium text-gray-500">Legado Marcas e Patentes</span>
            </p>
          </div>
        </div>
      )}
      
      {/* Botão de rolagem para baixo - Ajustado para mobile */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 right-6 bg-white hover:bg-gray-50 text-gray-600 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-50 border border-gray-100 group"
          aria-label="Rolar para baixo"
        >
          <ArrowDown size={isMobile ? 22 : 18} className="group-hover:text-blue-500 transition-colors" />
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: ${isMobile ? 'translateY(100%)' : 'scale(0.95) translateY(10px)'};
          }
          to {
            opacity: 1;
            transform: ${isMobile ? 'translateY(0)' : 'scale(1) translateY(0)'};
          }
        }

        @keyframes messageSlideUser {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes messageSlideBot {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-messageSlide[data-sender='user'] {
          animation: messageSlideUser 0.3s ease-out forwards;
        }

        .animate-messageSlide[data-sender='bot'] {
          animation: messageSlideBot 0.3s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .text-base p, .text-sm p {
          margin-bottom: ${isMobile ? '0.75rem' : '0.5rem'};
          line-height: 1.6;
        }
        
        .text-base p:last-child, .text-sm p:last-child {
          margin-bottom: 0;
        }
        
        .text-base ul, .text-sm ul {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        
        .text-base li, .text-sm li {
          margin-bottom: 0.5rem;
          position: relative;
        }

        .form-container {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .message-bubble {
            font-size: 1rem;
            line-height: 1.5;
            padding: 12px 16px;
          }

          .input-area {
            padding: 16px;
          }

          .quick-actions button {
            padding: 12px;
            font-size: 0.9375rem;
          }

          .form-container {
            padding: 16px;
          }

          .form-container input {
            font-size: 16px;
            padding: 12px;
          }
        }

        /* Animações suaves para hover */
        .hover-scale {
          transition: transform 0.2s ease-out;
        }

        .hover-scale:hover {
          transform: scale(1.02);
        }

        .hover-scale:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default ChatBot; 
