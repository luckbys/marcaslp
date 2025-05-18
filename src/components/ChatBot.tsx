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

interface QuickAction {
  id: string;
  text: string;
  action: () => void;
}

interface ChatBotProps {
  webhookUrl?: string;
  botName?: string;
  initialMessage?: string;
  primaryColor?: string;
  botAvatar?: string;
  userAvatar?: string;
}

// Limite de caracteres por card
const CARD_CHAR_LIMIT = 200;

const ChatBot: React.FC<ChatBotProps> = ({ 
  webhookUrl, 
  botName = "Legado Assistente", 
  initialMessage = "Olá! Sou o assistente virtual da Legado Marcas. Como posso ajudar você com o registro da sua marca hoje?",
  primaryColor = "#1E40AF", // Azul escuro por padrão (bg-blue-800)
  botAvatar = "",
  userAvatar = ""
}) => {
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

  // Função para lidar com ações rápidas
  const handleQuickAction = (text: string) => {
    setInputValue(text);
    // Opcional: enviar automaticamente após selecionar
    setTimeout(() => {
      sendMessage(text);
    }, 100);
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

  const sendMessage = async (overrideText?: string) => {
    const messageText = overrideText || inputValue;
    
    if (!messageText.trim()) return;
    if (!webhookUrl) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Desculpe, não foi possível processar sua mensagem. O sistema não está configurado corretamente.",
        sender: 'bot',
        timestamp: new Date(),
        isRead: true
      }]);
      return;
    }
    
    // Se for a primeira interação, ocultar o conjunto de ações rápidas
    if (isFirstInteraction) {
      setIsFirstInteraction(false);
    }
    
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
      // Enviar a mensagem para o webhook do n8n
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          userId: 'visitor', // Pode ser substituído por um ID de usuário real se disponível
          timestamp: userMessage.timestamp
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor');
      }
      
      const data = await response.json();
      
      // Debug para ver o formato exato da resposta
      console.log('Resposta recebida do webhook:', JSON.stringify(data));
      
      // Processar a resposta do servidor que pode vir em diferentes formatos
      let responseText = "";
      
      // Formato 1: { output: "texto" }
      if (data && data.output) {
        responseText = data.output;
      }
      // Formato 2: { response: "texto" }
      else if (data && data.response) {
        responseText = data.response;
      } 
      // Formato 3: [{ resposta: "texto" }]
      else if (Array.isArray(data) && data.length > 0 && data[0].resposta) {
        responseText = data[0].resposta;
      } 
      // Formato 4: { resposta: "texto" } (sem array)
      else if (data && data.resposta) {
        responseText = data.resposta;
      }
      // Outros formatos desconhecidos
      else {
        console.warn('Formato de resposta desconhecido:', data);
        responseText = "Desculpe, houve um erro ao processar sua mensagem. Por favor, tente novamente.";
      }
      
      // Tratar markdown básico
      responseText = responseText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrito
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Itálico
        .replace(/\n\s*\n/g, '</p><p>') // Parágrafos
        .replace(/\n/g, '<br>'); // Quebras de linha simples
      
      console.log('Texto extraído para exibição:', responseText);
      
      // Dividir resposta longa em múltiplos cards
      const messageParts = splitLongMessage(responseText);
      const seriesId = Date.now().toString();
      
      const botResponses: Message[] = messageParts.map((part, index) => ({
        id: `${seriesId}-${index}`,
        text: part,
        sender: 'bot',
        timestamp: new Date(Date.now() + index * 100), // Pequena diferença para ordenação
        isRead: isOpen, // Só marcamos como lida se o chat estiver aberto
        isPartOfSeries: messageParts.length > 1,
        seriesId: messageParts.length > 1 ? seriesId : undefined
      }));
      
      // Adicionar as respostas ao estado
      setMessages(prev => [...prev, ...botResponses]);
      
      // Tocar som de notificação se o chat não estiver aberto (apenas uma vez)
      if (!isOpen) {
        playNotificationSound();
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Feedback de erro para o usuário
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Ocorreu um erro na comunicação. Por favor, tente novamente mais tarde ou entre em contato por telefone.",
        sender: 'bot',
        timestamp: new Date(),
        isRead: isOpen
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão para abrir/fechar o chat - Maior em mobile */}
      <button
        onClick={toggleChat}
        className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 w-16 h-16 md:w-12 md:h-12"
        style={{ backgroundColor: primaryColor }}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? <X size={isMobile ? 32 : 24} /> : <MessageSquare size={isMobile ? 32 : 24} />}
        
        {/* Badge de notificação - Maior em mobile */}
        {!isOpen && unreadMessages > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-7 h-7 md:w-5 md:h-5 flex items-center justify-center animate-pulse">
            {unreadMessages > 9 ? '9+' : unreadMessages}
          </span>
        )}
      </button>

      {/* Janela do chat - Tela cheia em mobile */}
      {isOpen && (
        <div 
          className={`fixed md:absolute ${isMobile ? 'inset-0' : 'bottom-16 right-0'} w-full md:w-96 bg-white md:rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 animate-fadeIn z-50`}
          style={{ 
            animation: 'fadeIn 0.3s ease-out',
            height: isMobile ? '100vh' : 'auto',
            maxHeight: isMobile ? '100vh' : '600px'
          }}
        >
          {/* Cabeçalho do chat - Maior em mobile */}
          <div 
            className="p-4 flex justify-between items-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center">
              <BotAvatar />
              <h3 className="font-medium text-xl md:text-base">{botName}</h3>
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
            </div>
          </div>

          {/* Container de mensagens - Ajustado para mobile */}
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: ${isMobile ? 'translateY(100%)' : 'translateY(10px)'} }
          to { opacity: 1; transform: translateY(0) }
        }
        
        ${messageSlideAnimation}
        
        /* Estilos para mensagens */
        .text-base p, .text-sm p {
          margin-bottom: ${isMobile ? '1rem' : '0.75rem'};
          line-height: 1.5;
        }
        
        .text-base p:last-child, .text-sm p:last-child {
          margin-bottom: 0;
        }
        
        /* Estilos para listas */
        .text-base ul, .text-sm ul {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        
        .text-base li, .text-sm li {
          margin-bottom: 0.5rem;
          position: relative;
        }

        /* Ajustes para mobile */
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
        }
      `}</style>
    </div>
  );
};

export default ChatBot; 