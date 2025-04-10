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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão para abrir/fechar o chat */}
      <button
        onClick={toggleChat}
        className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105"
        style={{ backgroundColor: primaryColor }}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {/* Badge de notificação */}
        {!isOpen && unreadMessages > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadMessages > 9 ? '9+' : unreadMessages}
          </span>
        )}
      </button>

      {/* Janela do chat - com animação de fade in/out */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 animate-fadeIn"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          {/* Cabeçalho do chat */}
          <div 
            className="p-3 flex justify-between items-center text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center">
              <BotAvatar />
              <h3 className="font-medium">{botName}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={clearConversation} 
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Limpar conversa"
                title="Limpar conversa"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={toggleChat} 
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Fechar chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div 
            className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-50"
            onScroll={handleScroll}
            ref={chatContainerRef}
          >
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-3 text-sm">
                {error}
              </div>
            )}
            
            {messages.map((msg, index) => {
              const showAvatarAndTime = shouldShowAvatarAndTime(msg, index);
              const isSeriesContinuation = msg.isPartOfSeries && index > 0 && 
                messages[index - 1].seriesId === msg.seriesId;
              
              // Ajustar o layout das mensagens para melhor espaçamento e legibilidade
              const messageSpacing = isSeriesContinuation ? "mb-2" : "mb-4";
              
              // Estilo de borda para mensagens em série
              const borderStyle = isSeriesContinuation
                ? msg.sender === 'user' 
                  ? 'rounded-tr-sm' 
                  : 'rounded-tl-sm'
                : msg.sender === 'user'
                  ? 'rounded-tr-none'
                  : 'rounded-tl-none';
              
              return (
                <div
                  key={msg.id}
                  className={`${messageSpacing} flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-messageSlide`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    animation: 'messageSlide 0.3s ease-out forwards'
                  }}
                >
                  {msg.sender === 'bot' && (!isSeriesContinuation || showAvatarAndTime) && <BotAvatar />}
                  {msg.sender === 'bot' && isSeriesContinuation && !showAvatarAndTime && <div className="w-8 mr-2" />} {/* Espaçador */}
                  
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white ' + borderStyle
                        : 'bg-white text-gray-800 border border-gray-200 ' + borderStyle
                    }`}
                  >
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} className="text-sm whitespace-pre-wrap break-words" />
                    
                    {showAvatarAndTime && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs opacity-75">
                          {formatTime(msg.timestamp)}
                        </span>
                        
                        {/* Feedback de mensagem para o bot - só na última mensagem */}
                        {msg.sender === 'bot' && index === messages.length - 1 && !isLoading && (
                          <div className="flex space-x-1 ml-2">
                            <button 
                              className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                              title="Resposta útil"
                            >
                              <ThumbsUp size={12} />
                            </button>
                            <button 
                              className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                              title="Resposta não útil"
                            >
                              <ThumbsDown size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {msg.sender === 'user' && (!isSeriesContinuation || showAvatarAndTime) && <UserAvatar />}
                  {msg.sender === 'user' && isSeriesContinuation && !showAvatarAndTime && <div className="w-8 ml-2" />} {/* Espaçador */}
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start mb-3 items-start">
                <BotAvatar />
                <div className="bg-white text-gray-800 rounded-lg px-4 py-3 border border-gray-200 rounded-tl-none shadow-sm">
                  <div className="flex space-x-1 items-center">
                    <div className="text-xs text-gray-500 mr-1">Digitando</div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Botão de rolagem para baixo */}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="fixed bottom-24 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 z-50"
                aria-label="Rolar para baixo"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Botões de ação rápida, visíveis apenas no início da conversa */}
          {isFirstInteraction && messages.length < 2 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Perguntas frequentes:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs px-3 py-1 rounded-full transition-colors"
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formulário de entrada */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex">
              <input
                ref={inputRef}
                type="text"
                placeholder="Digite sua mensagem..."
                className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="text-white px-3 rounded-r-lg flex items-center justify-center disabled:opacity-50 transition-all"
                style={{ backgroundColor: isLoading || !inputValue.trim() ? '#9CA3AF' : primaryColor }}
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          
          {/* Rodapé com créditos */}
          <div className="px-3 py-1 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              Powered by Legado Marcas e Patentes
            </p>
          </div>
        </div>
      )}
      
      {/* Estilos para animações */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        ${messageSlideAnimation}
        
        /* Melhorias para formatação de texto */
        .text-sm p {
          margin-bottom: 0.75rem;
        }
        
        .text-sm p:last-child {
          margin-bottom: 0;
        }
        
        .text-sm ul {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
        }
        
        .text-sm li {
          margin-bottom: 0.375rem;
          position: relative;
        }

        .text-sm li.list-disc::before {
          content: "•";
          position: absolute;
          left: -1rem;
          color: currentColor;
        }

        .text-sm li.list-decimal {
          list-style-type: decimal;
          margin-left: 0.5rem;
        }

        .text-sm strong {
          font-weight: 600;
        }

        .text-sm em {
          font-style: italic;
        }

        /* Ajustes para mensagens do bot */
        .bg-white .text-sm ul {
          color: #374151;
        }

        /* Ajustes para mensagens do usuário */
        .bg-blue-500 .text-sm ul {
          color: white;
        }

        /* Estilo para o botão de rolagem */
        .scroll-button {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatBot; 