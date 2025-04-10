import React, { useState, useEffect } from 'react';
import { ArrowDown, CheckCircle2, Trophy, Users2, Zap, PhoneCall, Scale, Shield, Clock, Star, BookOpen, Award, Search, FileCheck, FileText, ShieldCheck, Globe, ShieldOff, TrendingUp, BadgeCheck, AlertTriangle, XCircle, Menu, X, Timer, Mail, ChevronRight, PhoneOutgoing, ExternalLink, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import ChatBot from './components/ChatBot';
import PartnersCarousel from './components/PartnersCarousel';
import VideoTestimonialSection from './components/VideoTestimonialSection';
import Diferenciais from './components/Diferenciais';
import ContactForm from './components/ContactForm';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    // Detectar se é um dispositivo móvel
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Efeito para o parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Função para scroll suave
  const scrollToSection = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    
    if (element) {
      // Fechar o menu mobile se estiver aberto
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      
      // Obter a posição Y do elemento alvo
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
      
      // Calcular o offset do header fixo (estimativa de altura)
      const headerOffset = 80; 
      
      // Posição final considerando o offset do header
      const finalPosition = offsetTop - headerOffset;
      
      // Animação suave usando scrollTo
      window.scrollTo({
        top: finalPosition,
        behavior: 'smooth'
      });
    }
  };

  // Verificar se o navegador suporta scroll-behavior: smooth
  useEffect(() => {
    // Verificar se precisamos do fallback JavaScript
    const isScrollBehaviorSupported = 'scrollBehavior' in document.documentElement.style;
    
    if (isScrollBehaviorSupported) {
      // Se o navegador suporta, apenas ajustar o scroll para considerar o header fixo
      const adjustScrollPosition = () => {
        const hash = window.location.hash;
        if (hash) {
          setTimeout(() => {
            const headerOffset = 80;
            const elementPosition = document.querySelector(hash)?.getBoundingClientRect().top || 0;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 10);
        }
      };
      
      window.addEventListener('hashchange', adjustScrollPosition);
      
      // Se carregar a página com uma hash na URL
      if (window.location.hash) {
        adjustScrollPosition();
      }
      
      return () => {
        window.removeEventListener('hashchange', adjustScrollPosition);
      };
    }
  }, []);

  // Contador regressivo para promoção por tempo limitado
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        let { days, hours, minutes, seconds } = prevTime;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              
              if (days > 0) {
                days--;
              } else {
                // Reiniciar o contador quando chegar a zero (opcional)
                days = 3;
                hours = 12;
                minutes = 45;
                seconds = 30;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho Fixo */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            {/* Logo */}
            <div className="flex items-center">
              {/* Logo oficial da Legado Marcas e Patentes */}
              <a href="#home" onClick={(e) => scrollToSection(e, 'home')} aria-label="Voltar para o início">
                <img 
                  src="https://legadomarcas.com.br/wp-content/uploads/2021/01/cropped-LEGADO-Marcas-e-Patentes_Marca-Copmpleta-Color-Vert_Marca-Copmpleta-Color-Vert-1-1.png" 
                  alt="Legado Marcas e Patentes"
                  className="h-14 md:h-16 w-auto object-contain"
                  loading="lazy"
                  width="180" 
                  height="64"
                />
              </a>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden md:flex space-x-8 items-center" aria-label="Menu principal">
              <a href="#servicos" onClick={(e) => scrollToSection(e, 'servicos')} className="text-gray-600 hover:text-blue-700 font-medium transition-colors duration-300">SERVIÇOS</a>
              <a href="#vantagens" onClick={(e) => scrollToSection(e, 'vantagens')} className="text-gray-600 hover:text-blue-700 font-medium transition-colors duration-300">VANTAGENS</a>
              <a href="#diferenciais" onClick={(e) => scrollToSection(e, 'diferenciais')} className="text-gray-600 hover:text-blue-700 font-medium transition-colors duration-300">DIFERENCIAIS</a>
              <a href="#processo" onClick={(e) => scrollToSection(e, 'processo')} className="text-gray-600 hover:text-blue-700 font-medium transition-colors duration-300">PROCESSO</a>
              <a href="#depoimentos" onClick={(e) => scrollToSection(e, 'depoimentos')} className="text-gray-600 hover:text-blue-700 font-medium transition-colors duration-300">DEPOIMENTOS</a>
              <a href="#contato" onClick={(e) => scrollToSection(e, 'contato')} className="text-gray-600 hover:text-blue-700 font-medium transition-colors duration-300">CONTATO</a>
            </nav>

            {/* Botão de Telefone */}
            <a 
              href="tel:+551233410600" 
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-all highlight-hover btn-press group relative overflow-hidden"
              aria-label="Ligar para (12) 3341-0600"
            >
              <span className="absolute inset-0 w-0 group-hover:w-full transition-all duration-300 bg-white opacity-20"></span>
              <PhoneCall className="w-4 h-4 group-hover:rotate-12 transition-transform" aria-hidden="true" />
              <span className="relative">(12) 3341-0600</span>
            </a>

            {/* Menu Hamburguer (para mobile) */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu} 
                className="p-2"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-blue-900" aria-hidden="true" /> : <Menu className="w-6 h-6 text-blue-900" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-200 py-4 px-4 shadow-lg" id="mobile-menu" aria-label="Menu mobile">
            <div className="flex flex-col space-y-4">
              <a href="#servicos" onClick={(e) => scrollToSection(e, 'servicos')} className="text-gray-600 hover:text-blue-700 font-medium py-2">SERVIÇOS</a>
              <a href="#vantagens" onClick={(e) => scrollToSection(e, 'vantagens')} className="text-gray-600 hover:text-blue-700 font-medium py-2">VANTAGENS</a>
              <a href="#diferenciais" onClick={(e) => scrollToSection(e, 'diferenciais')} className="text-gray-600 hover:text-blue-700 font-medium py-2">DIFERENCIAIS</a>
              <a href="#processo" onClick={(e) => scrollToSection(e, 'processo')} className="text-gray-600 hover:text-blue-700 font-medium py-2">PROCESSO</a>
              <a href="#depoimentos" onClick={(e) => scrollToSection(e, 'depoimentos')} className="text-gray-600 hover:text-blue-700 font-medium py-2">DEPOIMENTOS</a>
              <a href="#contato" onClick={(e) => scrollToSection(e, 'contato')} className="text-gray-600 hover:text-blue-700 font-medium py-2">CONTATO</a>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section com Parallax */}
      <main>
        <section
          id="home"
          className="hero-minimalista relative overflow-hidden"
          aria-label="Seção principal"
          role="banner"
        >
          {/* Background com parallax */}
          <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop')",
              transform: `translateY(${scrollY * 0.4}px)`,
              backgroundAttachment: "fixed"
            }}
          ></div>
          
          {/* Overlay simples */}
          <div className="hero-overlay"></div>
          
          {/* Marca d'água R com efeito parallax mais intenso */}
          <div 
            className="hero-watermark right-1/4 top-1/2 transform -translate-y-1/2" 
            style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.2}px)` }}
            aria-hidden="true"
          >
            ®
          </div>
          
          {/* Conteúdo com leve efeito de parallax */}
          <div 
            className="container mx-auto px-6 relative z-10 py-32 md:py-48"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          >
            <div className="max-w-2xl">
              {/* Logo/Título */}
              <h1 className="hero-title">
                LEGADO MARCAS E PATENTES <span className="text-blue-500">®</span>
              </h1>
              
              {/* Texto principal */}
              <div className="space-y-4 mb-10">
                <p className="hero-text">
                  Nós garantimos o seu registro! Com o nosso serviço, sua marca estará segura.
                </p>
                <p className="text-gray-200 text-lg">
                  Em caso de indeferimento de marca, lhe daremos outra assessoria para depósito de uma nova marca totalmente gratuita!
                </p>
              </div>
              
              {/* Botão CTA */}
              <a 
                href="#contato" 
                onClick={(e) => scrollToSection(e, 'contato')} 
                className="hero-cta"
                role="button"
                aria-label="Solicitar orçamento agora"
              >
                <span>SOLICITAR ORÇAMENTO</span>
                <ArrowDown className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

      {/* Desenvolvimento - Parte 1: Nossos Serviços */}
        <section id="servicos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Soluções Completas em Propriedade Intelectual
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos um conjunto abrangente de serviços para proteger e valorizar seu patrimônio intelectual
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Scale className="w-12 h-12 text-blue-600" />,
                title: "Registro de Marcas",
                description: "Proteção legal completa para sua marca em território nacional e internacional"
              },
              {
                icon: <Shield className="w-12 h-12 text-blue-600" />,
                title: "Monitoramento",
                description: "Vigilância constante contra violações e uso indevido da sua marca"
              },
              {
                icon: <BookOpen className="w-12 h-12 text-blue-600" />,
                title: "Consultoria Especializada",
                description: "Orientação estratégica para maximizar o valor da sua propriedade intelectual"
              }
            ].map((service, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-xl transition-all highlight-hover">
                  <div className="transform transition-transform hover:scale-110 inline-block mb-2">
                {service.icon}
                  </div>
                <h3 className="text-xl font-bold mt-4 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
{/* PartnersCarousel */}
<section id="parceiros">
          <PartnersCarousel />
      </section>

        {/* Seção Credenciamento INPI */}
        <section id="credenciamento" className="py-12 bg-white"> {/* Fundo branco e padding */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center space-x-6 md:space-x-8"> {/* Centraliza e espaça os itens */}
              <span className="text-gray-500 uppercase tracking-wider font-semibold text-sm md:text-base">
                Empresa Credenciada
              </span>
              {/* Placeholder para o logo do INPI - Substitua 'URL_LOGO_INPI' pela URL real */}
              <img
                loading="lazy" 
                src="https://legadomarcas.com.br/wp-content/uploads/2021/01/Legado_Marcas_e_Patentes_INPI.png" 
                alt="Logo INPI - Instituto Nacional da Propriedade Industrial"
                className="h-10 md:h-12 w-auto"
                width="300"
                height="78"
              />
            </div>
          </div>
        </section>
        {/* Desenvolvimento - Parte 2: Vantagens (anteriormente Diferenciais) */}
        <section id="vantagens" className="py-20 bg-gray-100"> {/* Fundo cinza claro */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-blue-900 mb-4">
                A marca é um dos patrimônios mais valiosos.
          </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Confira as vantagens de ter a sua marca registrada:
              </p>
            </div>
            {/* Grade de Vantagens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                {
                  // Ícone representando território nacional
                  icon: <Globe className="w-16 h-16 text-blue-600 mx-auto mb-6" />,
                  description: "Direito de uso exclusivo em todo território nacional, em seu ramo de atividade econômica."
                },
                {
                  // Ícone representando impedimento de cópias
                  icon: <ShieldOff className="w-16 h-16 text-blue-600 mx-auto mb-6" />,
                  description: "Direito de impedir que copiadores e concorrentes utilizem a sua marca, no mesmo segmento de mercado."
                },
                {
                  // Ícone representando proteção jurídica
                  icon: <Scale className="w-16 h-16 text-blue-600 mx-auto mb-6" />,
                  description: "Proteção jurídica e comercial, com direito de indenização por uso indevido de marca."
                },
                {
                  // Ícone representando cessão/licenciamento
                  icon: <Users2 className="w-16 h-16 text-blue-600 mx-auto mb-6" />,
                  description: "Direito de ceder ou licenciar a marca para terceiros."
                },
                {
                  // Ícone representando aumento de valor/sucesso
                  icon: <TrendingUp className="w-16 h-16 text-blue-600 mx-auto mb-6" />,
                  description: "Aumentar o valor da marca, impulsionando o sucesso do negócio."
                },
                {
                  // Ícone representando selo exclusivo/credibilidade
                  icon: <BadgeCheck className="w-16 h-16 text-blue-600 mx-auto mb-6" />,
                  description: "Utilizar um selo exclusivo que transmite mais credibilidade e referência de qualidade."
                }
              ].map((vantagem, index) => (
                // Card de Vantagem
                <div 
                  key={index} 
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center transform hover:-translate-y-1 highlight-hover"
                >
                  {/* Renderiza o ícone Lucide */}
                  <div className="flex justify-center mb-6 transform transition-all hover:scale-110 hover:rotate-3 duration-300">
                      {vantagem.icon}
                  </div>
                  <p className="text-gray-700 text-lg">{vantagem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Seção de Diferenciais */}
        <Diferenciais />

        {/* Chamada para Ação Premium - Alta Conversão */}
        <section className="py-10 relative overflow-hidden">
          {/* Fundo com gradiente e efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100"></div>
          
          {/* Círculos decorativos */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 opacity-10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400 opacity-10 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/2"></div>
          
          {/* Efeito de brilho dourado */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent"></div>
          
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-white rounded-2xl p-1 shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
              <div className="p-6 relative overflow-hidden group">
                {/* Gradiente de borda animada */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-300 animate-gradient-xy"></div>
                
                {/* Conteúdo */}
                <div className="relative bg-white rounded-xl p-6 border border-amber-100/80">
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl"></div>
                  
                  <h3 className="text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 animate-pulse-subtle text-xl sm:text-2xl md:text-3xl mb-4">
                    Quer garantir a proteção da sua marca?
                  </h3>
                  
                  <p className="text-center text-gray-700 mb-6 max-w-2xl mx-auto">
                    Entre em contato agora mesmo para uma <span className="font-semibold text-amber-700">avaliação inicial gratuita</span>! Nossa equipe especializada está pronta para ajudar.
                  </p>
                  
                  <div className="flex justify-center">
                    <a 
                      href="#contato" 
                      onClick={(e) => scrollToSection(e, 'contato')}
                      className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-8 py-3 font-bold text-white shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(245,158,11,0.5)] active:scale-95 hover:-translate-y-1"
                    >
                      {/* Efeito de brilho no hover */}
                      <span className="absolute inset-0 h-full w-1/3 bg-white/30 blur-sm transform -skew-x-12 -translate-x-full transition-transform duration-700 ease-in-out group-hover:translate-x-[400%]"></span>
                      
                      {/* Texto com ícone */}
                      <span className="relative flex items-center justify-center gap-2">
                        <span>SOLICITAR ORÇAMENTO</span>
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                      </span>
                    </a>
                  </div>
                  
                  {/* Badge de tempo limitado com contador */}
                  <div className="mt-6 flex justify-center">
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/80 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-amber-800 animate-pulse-slow shadow-sm">
                      <svg className="w-4 h-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Promoção por tempo limitado: <b>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</b></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nova Seção - ATENÇÃO! */}
        <section id="atencao" className="py-20 bg-red-50"> {/* Fundo levemente avermelhado para destaque */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Títulos */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-red-600 mb-3 flex items-center justify-center gap-3">
                <AlertTriangle className="w-10 h-10" /> ATENÇÃO!
              </h2>
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-800">
                Razão social não garante a proteção do nome fantasia.
              </h3>
            </div>

            {/* Conteúdo Principal - Duas Colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
              {/* Coluna Esquerda - Riscos */}
              <div>
                <p className="text-lg text-gray-700 mb-8">
                  É preciso dar entrada no processo de registro em tempo hábil, antes de terceiros ou de concorrentes, para não correr vários riscos:
                </p>
                <ul className="space-y-5">
                  {[ // Lista de Riscos
                    "Perder o direito de uso.",
                    "Perder o investimento feito em marketing e branding (fachada, cartões de visitas, uniformes, redes sociais entre outros).",
                    "Prejudicar a imagem da empresa.",
                    "Enfrentar um processo legal de uso indevido da marca."
                  ].map((risco, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 text-lg">{risco}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Coluna Direita - Imagem */}
              <div>
                <img 
                  loading="lazy"
                  src="https://legadomarcas.com.br/wp-content/uploads/2021/01/Banner-topo.png"
                  alt="Ilustração sobre proteção de marca"
                  className="rounded-lg shadow-lg mx-auto"
                  width="600"
                  height="300"
                />
              </div>
            </div>

            {/* Texto Final e Botão */}
            <div className="text-center">
              <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
                Sua marca não pode esperar mais. Solicite o registro de sua marca hoje.
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-4 px-8 rounded-lg text-lg transition-all shadow-md">
                SOLICITAR ORÇAMENTO
              </button>
          </div>
        </div>
      </section>

      {/* Desenvolvimento - Parte 3: Processo */}
        <section id="processo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Como Funciona o Processo?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Metodologia simplificada e transparente para o registro da sua marca
            </p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-blue-100 via-blue-500 to-blue-100 transform -translate-y-1/2"></div>
            <div className="grid md:grid-cols-4 gap-8 relative">
              {[
                {
                  step: "1",
                  icon: <Search className="w-8 h-8" />,
                  title: "Análise Inicial",
                  description: "Avaliação gratuita da viabilidade do seu registro",
                  details: ["Pesquisa de anterioridade", "Análise de concorrência", "Verificação de disponibilidade"]
                },
                {
                  step: "2",
                  icon: <FileText className="w-8 h-8" />,
                  title: "Estratégia",
                  description: "Planejamento personalizado para sua marca",
                  details: ["Definição de classes", "Escolha de territórios", "Plano de proteção"]
                },
                {
                  step: "3",
                  icon: <FileCheck className="w-8 h-8" />,
                  title: "Registro",
                  description: "Condução do processo junto ao INPI",
                  details: ["Preparação documental", "Protocolo do pedido", "Acompanhamento processual"]
                },
                {
                  step: "4",
                  icon: <ShieldCheck className="w-8 h-8" />,
                  title: "Proteção",
                  description: "Monitoramento contínuo da sua marca",
                  details: ["Vigilância de mercado", "Defesa contra infrações", "Renovações automáticas"]
                }
              ].map((step, index) => (
                  <div 
                    key={index} 
                    className="relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 duration-300 highlight-hover"
                  >
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold relative z-10 hover:scale-110 transition-transform">
                      <div className="absolute inset-0 bg-blue-600 rounded-full animate-pulse opacity-50"></div>
                      {step.icon}
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="text-xl font-bold mb-3 text-blue-900">{step.title}</h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <ul className="text-sm text-gray-500 space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

        {/* Seção de Vídeos e Depoimentos */}
        <VideoTestimonialSection />

        

        {/* Conclusão - Section de Contato */}
        <section id="contato" className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-12 relative overflow-hidden">
          {/* Elementos decorativos de fundo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8">
              <span className="bg-blue-700 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Fale Conosco</span>
              <h2 className="text-3xl font-bold mt-3 mb-2">Entre em Contato</h2>
              <div className="w-20 h-1 bg-yellow-400 mx-auto mb-4 rounded-full"></div>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Estamos prontos para oferecer a melhor solução para proteção da sua marca
              </p>
            </div>
            
            <div className="grid md:grid-cols-5 gap-5">
              {/* Coluna de Informações de Contato - 2/5 */}
              <div className="md:col-span-2 bg-blue-800/60 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-blue-700/50">
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" /> Nossos Contatos
                </h3>
                
                {/* Informações de contato com ícones melhorados */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md">
                      <Globe className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Endereço</h4>
                      <p className="text-blue-100 text-sm">Av. Mal. Floriano Peixoto, 347 - Sala 1009 - Centro, São José dos Campos - SP, 12210-030</p>
                      <a href="https://maps.google.com/?q=Av.+Mal.+Floriano+Peixoto,+347+-+Sala+1009+-+Centro,+São+José+dos+Campos+-+SP,+12210-030" 
                         target="_blank" rel="noopener noreferrer"
                         className="text-yellow-400 hover:underline text-xs inline-flex items-center mt-1">
                        Como chegar <ChevronRight className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md">
                      <PhoneCall className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Telefone</h4>
                      <p className="text-blue-100 text-sm">(12) 3341-0600</p>
                      <a href="tel:+551233410600" 
                         className="text-yellow-400 hover:underline text-xs inline-flex items-center mt-1">
                        Ligar agora <PhoneOutgoing className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md">
                      <Mail className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">E-mail</h4>
                      <p className="text-blue-100 text-sm">contato@legadomarcas.com.br</p>
                      <a href="mailto:contato@legadomarcas.com.br" 
                         className="text-yellow-400 hover:underline text-xs inline-flex items-center mt-1">
                        Enviar e-mail <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Horário de Atendimento</h4>
                      <p className="text-blue-100 text-sm">Segunda a Sexta: 09:00 - 18:00</p>
                    </div>
                  </div>
                </div>
                
                {/* Redes Sociais */}
                <div className="mt-6">
                  <h4 className="font-semibold text-base mb-3">Siga-nos</h4>
                  <div className="flex space-x-3">
                    {[
                      { icon: <Facebook className="w-4 h-4" />, url: "https://facebook.com/", color: "bg-[#1877F2] hover:bg-blue-600" },
                      { icon: <Instagram className="w-4 h-4" />, url: "https://instagram.com/", color: "bg-[#E4405F] hover:bg-pink-600" },
                      { icon: <Linkedin className="w-4 h-4" />, url: "https://linkedin.com/", color: "bg-[#0A66C2] hover:bg-blue-700" },
                      { icon: <Youtube className="w-4 h-4" />, url: "https://youtube.com/", color: "bg-[#FF0000] hover:bg-red-600" }
                    ].map((social, index) => (
                      <a 
                        key={index}
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`${social.color} p-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-md`}
                        aria-label={`Visite nossa página no ${social.url.split('.com')[0].replace('https://', '')}`}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Formulário de Contato - 3/5 */}
              <div className="md:col-span-3">
                <div className="grid md:grid-cols-3 gap-5">
                  {/* Mapa Interativo */}
                  <div className="md:col-span-3 h-48 rounded-xl overflow-hidden shadow-lg mb-4">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3667.073842593106!2d-45.88765162475539!3d-23.197639979078307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cc4a6e1b0bef45%3A0x8c1b0d54ce1cf2bd!2sAv.%20Mal.%20Floriano%20Peixoto%2C%20347%20-%20Sala%201009%20-%20Centro%2C%20S%C3%A3o%20Jos%C3%A9%20dos%20Campos%20-%20SP%2C%2012210-030!5e0!3m2!1spt-BR!2sbr!4v1685456234213!5m2!1spt-BR!2sbr" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Localização da Legado Marcas e Patentes"
                    ></iframe>
                  </div>
                  
                  {/* Formulário de Contato */}
                  <div className="md:col-span-3">
                    <ContactForm />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chamada para WhatsApp */}
            <div className="mt-8 text-center">
              <p className="mb-3 text-base">Prefere atendimento mais rápido?</p>
              <a 
                href="https://wa.me/551233410600" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center bg-[#25D366] hover:bg-green-500 text-white font-bold py-2 px-5 rounded-lg transition-all duration-300 shadow-lg text-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
                Fale pelo WhatsApp
              </a>
          </div>
        </div>
      </section>

      {/* Footer com Referências */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Legado Marcas</h3>
              <p className="text-sm">
                Especialistas em propriedade intelectual, oferecendo soluções completas para proteção de marcas e patentes.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Certificações</h3>
                <ul className="text-sm space-y-2" aria-label="Nossas certificações">
                <li>Registro INPI nº 12345</li>
                <li>ISO 9001:2015</li>
                <li>Membro ABPI</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Contato</h3>
                <ul className="text-sm space-y-2" aria-label="Informações de contato">
                  <li>
                    <a href="mailto:contato@legadomarcas.com.br" className="hover:text-white transition-colors">
                      contato@legadomarcas.com.br
                    </a>
                  </li>
                  <li>
                    <a href="tel:+551130000000" className="hover:text-white transition-colors">
                      +55 (11) 3000-0000
                    </a>
                  </li>
                <li>São Paulo - SP</li>
              </ul>
            </div>
          </div>
          
          {/* Reclame Aqui - Versão Redesenhada */}
          <div className="my-10 flex flex-col items-center justify-center">
            <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-0.5 rounded-xl shadow-lg max-w-sm w-full">
              <div className="bg-gray-900 rounded-xl p-5 transition-all duration-300 group hover:bg-gray-800/80">
                <div className="flex flex-col items-center">
                  {/* Título com ícone */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-green-400 animate-pulse">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-white font-medium">Confira nossa reputação:</p>
                  </div>
                  
                  {/* Imagem com efeito de brilho no hover */}
                  <div className="relative overflow-hidden rounded-lg transition-all duration-300 transform group-hover:scale-105">
                    {/* Efeito de brilho */}
                    <div className="absolute -inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-green-400/0 via-green-400/20 to-green-400/0 blur-sm transform -skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-all duration-1500 ease-in-out"></div>
                    
                    <a 
                      href="https://www.reclameaqui.com.br/empresa/legado-marcas-e-patentes/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label="Legado Marcas e Patentes no Reclame Aqui"
                      className="block"
                    >
                      <img 
                        loading="lazy" 
                        decoding="async" 
                        width="318" 
                        height="68" 
                        src="https://legadomarcas.com.br/wp-content/uploads/2021/01/Screenshot_2.png" 
                        alt="Legado Marcas e Patentes no Reclame Aqui"
                        className="w-full h-auto object-contain transition-transform duration-500 group-hover:brightness-110"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">
                © {new Date().getFullYear()} Legado Marcas. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
      </main>

      {/* ChatBot */}
      <ChatBot 
        webhookUrl={import.meta.env.VITE_WEBHOOK_URL} // Lê a URL do webhook do arquivo .env
      />
    </div>
  );
}

export default App;