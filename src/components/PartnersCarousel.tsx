import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

// Importar estilos do Swiper
import 'swiper/css';
import 'swiper/css/navigation';

interface PartnerLogo {
  url: string;
  alt: string;
}

const PartnersCarousel: React.FC = () => {
  // Lista de logotipos extraídos do HTML fornecido
  const partnerLogos: PartnerLogo[] = [
    { url: "https://legadomarcas.com.br/wp-content/uploads/2024/03/urbamsjc-removebg-preview.png", alt: "urbamsjc" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/valepet.png", alt: "valepet" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2024/03/vouk-removebg-preview.png", alt: "vouk" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/upenergia-solar.png", alt: "upenergia solar" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2024/03/camarao.png", alt: "camarão" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Tecnoway.png", alt: "Tecnoway" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/SuperNerds.png", alt: "SuperNerds" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Siciliana.png", alt: "Siciliana" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/shs.png", alt: "SHS" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2024/03/Saga-faixa-branca.png", alt: "Saga faixa branca" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/saude-auditiva.png", alt: "saude auditiva" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/preto-e-branco.png", alt: "preto e branco" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Petflix.png", alt: "Petflix" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/oticas-macedo.png", alt: "oticas macedo" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/marcenarialima.png", alt: "marcenaria lima" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Gifjon.png", alt: "Gifjon" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Ferrara.png", alt: "Ferrara" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Etiqueprint.png", alt: "Etiqueprint" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Emersol.png", alt: "Emersol" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Divamodas.png", alt: "Divamodas" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Cimedutra.png", alt: "Cimedutra" },
    { url: "https://legadomarcas.com.br/wp-content/uploads/2021/01/bombeiros-do-aco.png", alt: "bombeiros do aco" },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-10 text-blue-900">
          Empresas que Confiam em Nós
        </h2>
        
        <div className="relative">
          {/* Setas de navegação customizadas */}
          <div className="swiper-button-prev-custom absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          
          <div className="swiper-button-next-custom absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={10}
            slidesPerView={1}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            speed={1000}
            loop={true}
            breakpoints={{
              // when window width is >= 640px
              640: {
                slidesPerView: 2,
              },
              // when window width is >= 768px
              768: {
                slidesPerView: 3,
              },
              // when window width is >= 1024px
              1024: {
                slidesPerView: 5,
              },
            }}
            className="py-8"
          >
            {partnerLogos.map((logo, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center">
                <div className="h-24 flex items-center justify-center px-4">
                  <img 
                    src={logo.url} 
                    alt={logo.alt} 
                    className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default PartnersCarousel; 