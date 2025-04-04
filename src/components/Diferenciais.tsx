import React from 'react';
import { Check, Globe, Phone, MapPin, Shield, Award, Scale } from 'lucide-react';

const Diferenciais: React.FC = () => {
  const diferenciais = [
    {
      icon: <Award className="w-12 h-12 text-yellow-600" />,
      title: "Somos uma empresa sólida e experiente.",
      description: "Já ajudamos inúmeras empresas a registrarem suas marcas e garantirem proteção e exclusividade em todo território nacional."
    },
    {
      icon: <Phone className="w-12 h-12 text-yellow-600" />,
      title: "Atendimento 100% online.",
      description: "Você não precisa sair de casa ou da empresa para vir até nosso escritório. Nosso trabalho é realizado 100% online e em contato por telefone."
    },
    {
      icon: <MapPin className="w-12 h-12 text-yellow-600" />,
      title: "Atendemos em todo Brasil.",
      description: "O registro é para todos os nichos e segmentos de mercado. Válido em todo território nacional."
    },
    {
      icon: <Check className="w-12 h-12 text-yellow-600" />,
      title: "Consultoria Completa.",
      description: "Oferecemos suporte total do início ao final do processo de registro, além de termos meios para viabilizar tudo o que for necessário para facilitar a vida do cliente, e viabilizando desde a entrada de seu processo, até a entrega do certificado."
    },
    {
      icon: <Shield className="w-12 h-12 text-yellow-600" />,
      title: "Assessoria gratuita em caso de indeferimento",
      description: "Em caso de indeferimento, oferecemos uma assessoria 100% gratuita para o registro de uma nova marca."
    },
    {
      icon: <Scale className="w-12 h-12 text-yellow-600" />,
      title: "Ética e Transparência.",
      description: "Nosso trabalho é realizado 100% dentro da lei, e prezando pela clareza e lealdade aos nossos clientes. Com a Legado não tem \"pegadinha\"! Todos os detalhes serão esclarecidos desde o início, sem surpresas com despesas extras e altos custos no final do processo."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50" id="diferenciais">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Nossos Diferenciais</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Conheça os motivos que fazem da Legado Marcas e Patentes a escolha certa para o registro da sua marca
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {diferenciais.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-50 flex flex-col hover:-translate-y-1 highlight-hover">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white p-3 rounded-xl mr-4 shadow-md">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-900">{item.title}</h3>
              </div>
              <p className="text-gray-600 mt-2 flex-grow">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Diferenciais; 