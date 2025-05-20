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
  webhookUrl = "https://press-n8n.jhkbgs.easypanel.host/webhook-test/notifica",
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
      const currentWebhook = isHumanAttendance ? webhookUrl : botWebhookUrl;
      
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
    
    if (text === 'Gostaria de falar com um atendente humano.') {
      try {
        // Adicionar mensagem do usuário ao chat
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: text,
          sender: 'user',
          timestamp: new Date(),
          isRead: true
        }]);

        // Ativar modo de atendimento humano
        setIsHumanAttendance(true);

        // Enviar notificação de solicitação de atendimento humano
        await sendWebhookNotification('HUMAN_REQUESTED', text, {
          status: 'pending',
          requestType: 'human_attendance'
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

  // Modificar a função sendMessage
  const sendMessage = async (overrideText?: string) => {
    const messageText = overrideText || inputValue;
    
    if (!messageText.trim()) return;
    
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
      const response = await sendWebhookNotification(
        isHumanAttendance ? 'HUMAN_MESSAGE' : 'BOT_MESSAGE',
        messageText,
        {
          conversationId: userInfo?.email || 'anonymous',
          messageId: userMessage.id
        }
      );

      // Processar resposta
      let botResponse = "";
      
      if (isHumanAttendance) {
        // Se for atendimento humano, usar a resposta direta
        botResponse = response.message || response.response || "Mensagem recebida";
      } else {
        // Se for bot, processar a resposta da Evolution API
        try {
          if (Array.isArray(response) && response.length > 0) {
            const botData = response[0];
            if (botData.result?.status?.message?.parts?.[0]?.text) {
              botResponse = botData.result.status.message.parts[0].text;
            } else if (botData.result?.artifacts?.[0]?.parts?.[0]?.text) {
              botResponse = botData.result.artifacts[0].parts[0].text;
            } else {
              console.warn('Estrutura da resposta do bot não reconhecida:', botData);
              botResponse = "Desculpe, não consegui processar a resposta corretamente.";
            }
          } else {
            // Fallback para o formato antigo
            botResponse = response.message || response.answer || "Desculpe, não entendi. Pode reformular?";
          }
        } catch (error) {
          console.error('Erro ao processar resposta do bot:', error);
          botResponse = "Desculpe, ocorreu um erro ao processar a resposta.";
        }
      }

      // Adicionar a resposta às mensagens
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        isRead: isOpen
      }]);

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

  // Ajustar a animação de entrada das mensagens para uma transição mais suave
  const messageSlideAnimation = `
    @keyframes messageSlide {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

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
            className="p-4 flex justify-between items-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center">
              <BotAvatar />
              <div>
                <h3 className="font-medium text-xl md:text-base">{botName}</h3>
                <span className="text-xs opacity-75">
                  {isHumanAttendance ? 'Atendimento Humano' : 'Atendimento Bot'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={clearConversation} 
                className="text-white hover:text-gray-200 transition-colors p-2"
                aria-label="Limpar conversa"
                title="Limpar conversa"
              >
                <Trash2 size={isMobile ? 24 : 16} />
              </button>
              <button 
                onClick={toggleChat} 
                className="text-white hover:text-gray-200 transition-colors p-2"
                aria-label="Fechar chat"
              >
                <X size={isMobile ? 28 : 20} />
              </button>
              <button 
                onClick={toggleAttendanceMode} 
                className="text-white hover:text-gray-200 transition-colors p-2"
                aria-label="Alternar modo de atendimento"
                title="Alternar modo de atendimento"
              >
                {isHumanAttendance ? <Bot size={isMobile ? 24 : 16} /> : <User size={isMobile ? 24 : 16} />}
              </button>
            </div>
          </div>

          {/* Container de mensagens */}
          <div 
            className="flex-1 p-4 overflow-y-auto bg-gray-50"
            style={{ 
              height: isMobile ? 'calc(100vh - 180px)' : 'auto',
              maxHeight: isMobile ? 'calc(100vh - 180px)' : '400px'
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
                  className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-messageSlide`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    animation: 'messageSlide 0.3s ease-out forwards'
                  }}
                >
                  {msg.sender === 'bot' && (!isSeriesContinuation || showAvatarAndTime) && <BotAvatar />}
                  {msg.sender === 'bot' && isSeriesContinuation && !showAvatarAndTime && <div className="w-8 mr-2" />}
                  
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} 
                      className="text-base md:text-sm whitespace-pre-wrap break-words leading-relaxed"
                    />
                  </div>
                  
                  {msg.sender === 'user' && (!isSeriesContinuation || showAvatarAndTime) && <UserAvatar />}
                  {msg.sender === 'user' && isSeriesContinuation && !showAvatarAndTime && <div className="w-8 ml-2" />}
                </div>
              );
            })}
            
            {/* Indicador de digitação */}
            {isLoading && (
              <div className="flex justify-start mb-3 items-start">
                <BotAvatar />
                <div className="bg-white text-gray-800 rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
                  <div className="flex space-x-2 items-center">
                    <div className="text-sm text-gray-500 mr-2">Digitando</div>
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões de ação rápida - Layout grid em mobile */}
          {isFirstInteraction && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-base md:text-sm text-gray-500 mb-3">Perguntas frequentes:</p>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-base md:text-sm px-4 py-3 md:py-2 rounded-xl transition-colors w-full text-center"
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Área de input - Otimizada para mobile */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 md:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="text-white p-3 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all h-12 w-12 md:h-10 md:w-10"
                style={{ backgroundColor: isLoading || !inputValue.trim() ? '#9CA3AF' : primaryColor }}
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
              >
                <Send size={isMobile ? 24 : 18} />
              </button>
            </div>
          </div>
          
          {/* Rodapé */}
          <div className="px-4 py-3 md:py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-400 text-center">
              Powered by Legado Marcas e Patentes
            </p>
          </div>
        </div>
      )}
      
      {/* Botão de rolagem para baixo - Ajustado para mobile */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Rolar para baixo"
        >
          <ArrowDown size={isMobile ? 24 : 20} />
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: ${isMobile ? 'translateY(100%)' : 'translateY(10px)'};
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        ${messageSlideAnimation}
        
        .text-base p, .text-sm p {
          margin-bottom: ${isMobile ? '1rem' : '0.75rem'};
          line-height: 1.5;
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
            padding: 12px 16px;
            font-size: 1rem;
          }

          .form-container {
            padding: 16px;
          }

          .form-container input {
            font-size: 16px;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBot; 