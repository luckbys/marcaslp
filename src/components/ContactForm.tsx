import React, { useState, useRef, useEffect } from 'react';
import { FileCheck, Loader2, Mail, Check, AlertTriangle } from 'lucide-react';

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
  const webhookUrl = import.meta.env.VITE_CONTACT_WEBHOOK_URL;

  useEffect(() => {
    if (!webhookUrl) {
      console.error('VITE_CONTACT_WEBHOOK_URL não está definida nas variáveis de ambiente');
      setStatusEnvio({
        sucesso: false,
        mensagem: 'O formulário de contato não está configurado corretamente. Por favor, entre em contato por telefone.'
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };
  
  const formatTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    
    setFormData(prevData => ({
      ...prevData,
      telefone: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current || !webhookUrl) {
      setStatusEnvio({
        sucesso: false,
        mensagem: 'O formulário de contato não está configurado corretamente. Por favor, entre em contato por telefone.'
      });
      return;
    }
    
    try {
      setEnviando(true);
      setStatusEnvio(null);
      
      // Dados simplificados para o webhook
      const dadosContato = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        assunto: formData.assunto === 'outro' ? formData.assuntoPersonalizado : formData.assunto,
        mensagem: formData.mensagem
      };
      
      console.log('Enviando dados para o webhook:', dadosContato);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosContato)
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

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

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setStatusEnvio({
        sucesso: false,
        mensagem: 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente ou entre em contato por telefone.'
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-blue-800/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-blue-700/50">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FileCheck className="w-5 h-5 text-yellow-400" /> Formulário de Contato
      </h3>
      
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
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
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
        
        <div className="relative">
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
        
        <div>
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