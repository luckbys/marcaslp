import React, { useState, useRef } from 'react';
import { FileCheck, Loader2, Mail, Check, AlertTriangle } from 'lucide-react';
import emailjs from '@emailjs/browser';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'registro',
    assuntoPersonalizado: '',
    mensagem: ''
  });
  
  const [formFocus, setFormFocus] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [statusEnvio, setStatusEnvio] = useState<{
    sucesso: boolean;
    mensagem: string;
  } | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };
  
  // Formatação de telefone enquanto digita
  const formatTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      // Formatar como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX dependendo do comprimento
      if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      } else {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      }
    }
    
    setFormData(prevData => ({
      ...prevData,
      telefone: value
    }));
  };
  
  // Função para enviar o formulário usando EmailJS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    try {
      setEnviando(true);
      setStatusEnvio(null);
      
      // Usar as variáveis de ambiente para as credenciais do EmailJS
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      
      // Verificar se as credenciais estão definidas
      if (!serviceId || !templateId || !publicKey) {
        console.error('Credenciais do EmailJS não configuradas:', { 
          serviceId: serviceId ? 'definido' : 'indefinido', 
          templateId: templateId ? 'definido' : 'indefinido', 
          publicKey: publicKey ? 'definido' : 'indefinido' 
        });
        throw new Error('Credenciais do EmailJS não configuradas corretamente.');
      }
      
      // Log para debug antes do envio (sem mostrar dados sensíveis)
      console.log('Enviando email com os parâmetros:', { 
        serviceId, 
        templateId,
        publicKeyLength: publicKey?.length || 0,
        formDataKeys: Object.keys(formData)
      });
      
      // Preparando os dados - incluindo assunto personalizado se for selecionado "outro"
      const emailData = {
        from_name: formData.nome,
        from_email: formData.email,
        from_phone: formData.telefone,
        subject: formData.assunto === 'outro' ? formData.assuntoPersonalizado : formData.assunto,
        message: formData.mensagem
      };
      
      // Inicialização do EmailJS
      emailjs.init(publicKey);
      
      const result = await emailjs.send(
        serviceId,
        templateId,
        emailData
      );
      
      console.log('Email enviado!', result.text);
      
      // Limpar o formulário após envio bem-sucedido
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: 'registro',
        assuntoPersonalizado: '',
        mensagem: ''
      });
      
      setStatusEnvio({
        sucesso: true,
        mensagem: 'Mensagem enviada com sucesso! Em breve entraremos em contato.'
      });
      
      // Scroll para o topo do form para mostrar a mensagem de sucesso
      formRef.current.scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      
      // Mensagem de erro mais específica
      const errorMessage = error instanceof Error 
        ? `Erro: ${error.message}`
        : 'Ocorreu um erro ao enviar sua mensagem.';
      
      setStatusEnvio({
        sucesso: false,
        mensagem: `${errorMessage} Por favor, verifique seus dados e tente novamente ou entre em contato por telefone.`
      });
    } finally {
      setEnviando(false);
      
      // Remover a mensagem de status após 7 segundos
      setTimeout(() => {
        setStatusEnvio(null);
      }, 7000);
    }
  };

  return (
    <div className="bg-blue-800/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-blue-700/50">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FileCheck className="w-5 h-5 text-yellow-400" /> Formulário de Contato
      </h3>
      
      {/* Alerta de status com animação */}
      {statusEnvio && (
        <div 
          className={`mb-4 p-3 rounded-lg border ${
            statusEnvio.sucesso 
              ? 'bg-green-600/30 border-green-500 text-green-100' 
              : 'bg-red-600/30 border-red-500 text-red-100'
          } flex items-start gap-2 animate-fadeIn text-sm`}
        >
          {statusEnvio.sucesso ? 
            <Check className="w-4 h-4 text-green-300 flex-shrink-0 mt-0.5" /> : 
            <AlertTriangle className="w-4 h-4 text-red-300 flex-shrink-0 mt-0.5" />
          }
          <span>{statusEnvio.mensagem}</span>
        </div>
      )}
      
      <form ref={formRef} className="space-y-3" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-3">
          {/* Nome */}
          <div className="relative md:col-span-1">
            <label 
              htmlFor="nome" 
              className={`block text-xs transition-all duration-200 mb-1 ${
                formFocus === 'nome' ? 'text-yellow-400 font-medium' : 'text-blue-100'
              }`}
            >
              Nome Completo *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              onFocus={() => setFormFocus('nome')}
              onBlur={() => setFormFocus(null)}
              className={`w-full px-3 py-2 rounded-lg transition-all bg-blue-700/50 border placeholder-blue-300 text-white text-sm focus:outline-none ${
                formFocus === 'nome' 
                  ? 'border-yellow-400 ring-1 ring-yellow-400/20' 
                  : 'border-blue-600 focus:border-blue-400'
              }`}
              placeholder="Seu nome completo"
              required
            />
          </div>
          
          {/* Email */}
          <div className="relative md:col-span-1">
            <label 
              htmlFor="email"
              className={`block text-xs transition-all duration-200 mb-1 ${
                formFocus === 'email' ? 'text-yellow-400 font-medium' : 'text-blue-100'
              }`}
            >
              E-mail *
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFormFocus('email')}
                onBlur={() => setFormFocus(null)}
                className={`w-full px-3 py-2 rounded-lg pl-8 transition-all bg-blue-700/50 border placeholder-blue-300 text-white text-sm focus:outline-none ${
                  formFocus === 'email' 
                    ? 'border-yellow-400 ring-1 ring-yellow-400/20' 
                    : 'border-blue-600 focus:border-blue-400'
                }`}
                placeholder="seu@email.com"
                required
              />
              <Mail className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 ${
                formFocus === 'email' ? 'text-yellow-400' : 'text-blue-300'
              } transition-colors`} />
            </div>
          </div>
          
          {/* Telefone */}
          <div className="relative md:col-span-1">
            <label 
              htmlFor="telefone" 
              className={`block text-xs transition-all duration-200 mb-1 ${
                formFocus === 'telefone' ? 'text-yellow-400 font-medium' : 'text-blue-100'
              }`}
            >
              Telefone *
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={formatTelefone}
              onFocus={() => setFormFocus('telefone')}
              onBlur={() => setFormFocus(null)}
              className={`w-full px-3 py-2 rounded-lg transition-all bg-blue-700/50 border placeholder-blue-300 text-white text-sm focus:outline-none ${
                formFocus === 'telefone' 
                  ? 'border-yellow-400 ring-1 ring-yellow-400/20' 
                  : 'border-blue-600 focus:border-blue-400'
              }`}
              placeholder="(00) 00000-0000"
              maxLength={15}
              required
            />
          </div>
        </div>
        
        {/* Assunto */}
        <div className="relative">
          <label 
            htmlFor="assunto" 
            className={`block text-xs transition-all duration-200 mb-1 ${
              formFocus === 'assunto' || formFocus === 'assuntoPersonalizado' 
              ? 'text-yellow-400 font-medium' 
              : 'text-blue-100'
            }`}
          >
            Assunto *
          </label>
          <select
            id="assunto"
            name="assunto"
            value={formData.assunto}
            onChange={handleInputChange}
            onFocus={() => setFormFocus('assunto')}
            onBlur={() => setFormFocus(null)}
            className={`w-full px-3 py-2 rounded-lg transition-all bg-blue-700/50 border placeholder-blue-300 text-white text-sm focus:outline-none ${
              formFocus === 'assunto' 
                ? 'border-yellow-400 ring-1 ring-yellow-400/20' 
                : 'border-blue-600 focus:border-blue-400'
            }`}
            required
          >
            <option value="registro">Registro de Marca</option>
            <option value="consultoria">Consultoria</option>
            <option value="monitoramento">Monitoramento</option>
            <option value="patentes">Patentes</option>
            <option value="internacional">Registro Internacional</option>
            <option value="outro">Outro assunto</option>
          </select>
          
          {/* Campo adicional que aparece se "Outro" for selecionado */}
          {formData.assunto === 'outro' && (
            <div className="mt-2">
              <input
                type="text"
                id="assuntoPersonalizado"
                name="assuntoPersonalizado"
                value={formData.assuntoPersonalizado}
                onChange={handleInputChange}
                onFocus={() => setFormFocus('assuntoPersonalizado')}
                onBlur={() => setFormFocus(null)}
                className={`w-full px-3 py-2 rounded-lg transition-all bg-blue-700/50 border placeholder-blue-300 text-white text-sm focus:outline-none ${
                  formFocus === 'assuntoPersonalizado' 
                    ? 'border-yellow-400 ring-1 ring-yellow-400/20' 
                    : 'border-blue-600 focus:border-blue-400'
                }`}
                placeholder="Especifique o assunto"
                required={formData.assunto === 'outro'}
              />
            </div>
          )}
        </div>
        
        {/* Mensagem */}
        <div>
          <label 
            htmlFor="mensagem" 
            className={`block text-xs transition-all duration-200 mb-1 ${
              formFocus === 'mensagem' ? 'text-yellow-400 font-medium' : 'text-blue-100'
            }`}
          >
            Mensagem
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            value={formData.mensagem}
            onChange={handleInputChange}
            onFocus={() => setFormFocus('mensagem')}
            onBlur={() => setFormFocus(null)}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg transition-all bg-blue-700/50 border placeholder-blue-300 text-white text-sm focus:outline-none ${
              formFocus === 'mensagem' 
                ? 'border-yellow-400 ring-1 ring-yellow-400/20' 
                : 'border-blue-600 focus:border-blue-400'
            }`}
            placeholder="Digite sua mensagem aqui..."
          ></textarea>
        </div>
        
        {/* Consentimento LGPD */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              required 
              className="mt-0.5"
            />
            <span className="text-xs text-blue-200">
              Concordo com o processamento dos meus dados de acordo com a 
              <a href="/privacidade" className="text-yellow-400 hover:underline ml-1">
                Política de Privacidade
              </a>.
            </span>
          </label>
        </div>
        
        {/* Botão de Envio */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-blue-900 font-bold py-2 px-4 text-sm rounded-lg transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
          >
            {enviando ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </span>
            ) : (
              <span className="relative z-10">Enviar Mensagem</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm; 