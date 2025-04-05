import React from 'react';
import { Check, Globe, Phone, MapPin, Shield, Award, Scale } from 'lucide-react';

// Tipo de dados para os diferenciais
interface Diferencial {
  icon: React.ReactNode;
  title: string;
  description: string;
  schemaType: string; // Tipo Schema.org para cada diferencial
}

const Diferenciais: React.FC = () => {
  const diferenciais: Diferencial[] = [
    {
      icon: <Award className="w-12 h-12 text-amber-400" aria-hidden="true" />,
      title: "Somos uma empresa sólida e experiente.",
      description: "Já ajudamos inúmeras empresas a registrarem suas marcas e garantirem proteção e exclusividade em todo território nacional.",
      schemaType: "ExperienceEducation"
    },
    {
      icon: <Phone className="w-12 h-12 text-amber-400" aria-hidden="true" />,
      title: "Atendimento 100% online.",
      description: "Você não precisa sair de casa ou da empresa para vir até nosso escritório. Nosso trabalho é realizado 100% online e em contato por telefone.",
      schemaType: "ServiceChannel"
    },
    {
      icon: <MapPin className="w-12 h-12 text-amber-400" aria-hidden="true" />,
      title: "Atendemos em todo Brasil.",
      description: "O registro é para todos os nichos e segmentos de mercado. Válido em todo território nacional.",
      schemaType: "LocationFeatureSpecification"
    },
    {
      icon: <Check className="w-12 h-12 text-amber-400" aria-hidden="true" />,
      title: "Consultoria Completa.",
      description: "Oferecemos suporte total do início ao final do processo de registro, além de termos meios para viabilizar tudo o que for necessário para facilitar a vida do cliente, e viabilizando desde a entrada de seu processo, até a entrega do certificado.",
      schemaType: "Service"
    },
    {
      icon: <Shield className="w-12 h-12 text-amber-400" aria-hidden="true" />,
      title: "Assessoria gratuita em caso de indeferimento",
      description: "Em caso de indeferimento, oferecemos uma assessoria 100% gratuita para o registro de uma nova marca.",
      schemaType: "Offer"
    },
    {
      icon: <Scale className="w-12 h-12 text-amber-400" aria-hidden="true" />,
      title: "Ética e Transparência.",
      description: "Nosso trabalho é realizado 100% dentro da lei, e prezando pela clareza e lealdade aos nossos clientes. Com a Legado não tem \"pegadinha\"! Todos os detalhes serão esclarecidos desde o início, sem surpresas com despesas extras e altos custos no final do processo.",
      schemaType: "BusinessEthics"
    }
  ];

  return (
    <section 
      className="py-20 bg-gradient-to-b from-white to-blue-50/50" 
      id="diferenciais"
      aria-labelledby="diferenciais-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            id="diferenciais-heading" 
            className="text-3xl font-bold text-blue-700 sm:text-4xl"
          >
            Nossos Diferenciais
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Conheça os motivos que fazem da Legado Marcas e Patentes a escolha certa para o registro da sua marca
          </p>
        </div>
        
        {/* Adicionando microdata com itemScope e itemType para listar diferenciais */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          itemScope 
          itemType="https://schema.org/ItemList"
        >
          {diferenciais.map((item, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-blue-50 flex flex-col hover:-translate-y-1 highlight-hover"
              itemScope
              itemType={`https://schema.org/${item.schemaType}`}
              itemProp="itemListElement"
              itemID={`diferencial-${index+1}`}
            >
              <meta itemProp="position" content={`${index+1}`} />
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-xl mr-4 shadow-sm">
                  {item.icon}
                </div>
                <h3 
                  className="text-xl font-bold text-blue-700"
                  itemProp="name"
                >
                  {item.title}
                </h3>
              </div>
              <p 
                className="text-gray-500 mt-2 flex-grow"
                itemProp="description"
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Markup adicional para SEO - invisível mas bom para mecanismos de busca */}
        <div className="sr-only">
          <h3>Palavras-chave relacionadas</h3>
          <ul>
            <li>Registro de marca no Brasil</li>
            <li>Proteção de propriedade intelectual</li>
            <li>Consultoria especializada em marcas</li>
            <li>Atendimento online para registro de marca</li>
            <li>Como registrar sua marca com segurança</li>
            <li>Empresa de registro de marcas e patentes</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Diferenciais; 