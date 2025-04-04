import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';

// Importar estilos do Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

interface VideoItem {
  thumbnailUrl: string;
  videoUrl: string;
  title?: string;
}

interface Testimonial {
  text: string;
  name?: string;
  company: string;
  imageUrl?: string;
}

const VideoTestimonialSection: React.FC = () => {
  // Estado para controlar o modal do vídeo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string>('');

  // Dados dos vídeos extraídos do HTML fornecido
  const videos: VideoItem[] = [
    { 
      thumbnailUrl: "https://i3.ytimg.com/vi/UlAIE5PbROU/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/embed/UlAIE5PbROU?feature=oembed&autoplay=1&rel=0&controls=1"
    },
    { 
      thumbnailUrl: "https://i3.ytimg.com/vi/GiE8L665uYg/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/embed/GiE8L665uYg?feature=oembed&autoplay=1&rel=0&controls=1"
    },
    { 
      thumbnailUrl: "https://i3.ytimg.com/vi/I1X13x9n6jA/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/embed/I1X13x9n6jA?feature=oembed&autoplay=1&rel=0&controls=1"
    },
    { 
      thumbnailUrl: "https://i3.ytimg.com/vi/DyJElREXFGE/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/embed/DyJElREXFGE?feature=oembed&autoplay=1&rel=0&controls=1"
    },
    { 
      thumbnailUrl: "https://i3.ytimg.com/vi/oeWQoiNrJf4/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/embed/oeWQoiNrJf4?feature=oembed&autoplay=1&rel=0&controls=1"
    }
  ];

  // Dados dos depoimentos extraídos do HTML fornecido
  const testimonials: Testimonial[] = [
    {
      text: "Quando abrimos nosso negócio, uma das preocupações dos sócios era com a questão do uso do nome e da marca. Após a indicação de amigos, chegamos a \"Legado Marcas\". Com muita objetividade, eles foram essenciais na orientação e execução de todo o processo de registro da nossa marca. Com certeza valeu a pena acreditar na empresa. O nosso muito obrigado a Legado Marcas.",
      name: "Fernando Aragão",
      company: "CASTELO DAS LUMINÁRIAS",
      imageUrl: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Depoimento_Legado_Marcas.jpg"
    },
    {
      text: "Nosso objetivo era ter nossa marca e logotipo registrados, pois nosso nome tem uma história familiar. Narcizza é o nome de nossa Avó! A Legado com todo carinho nos atendeu e viabilizou esse sonho. Narcizza Jóias é marca protegida graças a Legado Marcas. Somos gratos a toda equipe da Legado Marcas",
      name: "Thatiane",
      company: "Narcizza Jóias",
      imageUrl: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Depoimento_Legado_Marcas_2.jpg"
    },
    {
      text: "Procuramos a Legado Marcas para fazer o processo de registro de nossa marca antes da inauguração, para ter a certeza da proteção e garantia de sucesso. Hoje, temos a segurança de nossa marca estar protegida em todo Brasil. Nós da UP ENERGIA SOLAR somos gratos pelos serviços prestados e pelo atendimento oferecido sempre que precisamos. Confio e indico!!",
      company: "UP ENERGIA SOLAR",
      imageUrl: "https://legadomarcas.com.br/wp-content/uploads/2021/01/Depoimento_Legado_Marcas_3.jpg"
    }
  ];

  // Função para abrir o vídeo no lightbox
  const openVideoLightbox = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
    setIsModalOpen(true);
    // Previne o scroll da página enquanto o modal está aberto
    document.body.style.overflow = 'hidden';
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentVideo('');
    // Restaura o scroll da página
    document.body.style.overflow = 'auto';
  };

  return (
    <section className="py-16 bg-white" id="depoimentos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Carrossel de Vídeos */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-900">
            Veja Nossa Expertise em Ação
          </h2>
          
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay, EffectCoverflow]}
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView="auto"
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              className="pb-16"
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 20
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 20
                }
              }}
            >
              {videos.map((video, index) => (
                <SwiperSlide key={index} className="w-full md:w-[320px] h-[180px] md:h-[220px]">
                  <div 
                    className="relative w-full h-full bg-cover bg-center rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-xl"
                    style={{ backgroundImage: `url('${video.thumbnailUrl}')` }}
                    onClick={() => openVideoLightbox(video.videoUrl)}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-10 transition-all flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
              
              <div className="swiper-button-next after:content-[''] w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="swiper-button-prev after:content-[''] w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </Swiper>
          </div>
        </div>

        {/* Texto do Meio */}
        <div className="text-center mb-16">
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Nosso principal objetivo é levar proteção à sua marca.
          </p>
        </div>

        {/* Carrossel de Depoimentos */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-900">
            O Que Nossos Clientes Dizem
          </h2>
          
          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: '.testimonial-pagination',
            }}
            className="pb-16"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className="bg-gray-50 rounded-xl p-8 md:p-10 shadow-sm max-w-3xl mx-auto">
                  <div className="flex flex-col items-center">
                    {testimonial.imageUrl && (
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-6">
                        <img 
                          src={testimonial.imageUrl} 
                          alt={testimonial.name || testimonial.company} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-gray-700 text-lg mb-6 italic">
                        "{testimonial.text}"
                      </p>
                      <div>
                        {testimonial.name && (
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        )}
                        <p className="text-blue-600 font-medium">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <div className="testimonial-pagination flex justify-center mt-4"></div>
        </div>

        {/* Botão de CTA */}
        <div className="text-center mt-12">
          <a 
            href="#contato" 
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-4 px-8 rounded-lg transition-all shadow-md text-lg"
          >
            FALE COM UM ESPECIALISTA
          </a>
        </div>
      </div>

      {/* Modal para exibição de vídeo */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 md:p-10 transition-opacity duration-300"
          onClick={closeModal}
        >
          <div 
            className="relative bg-white rounded-xl overflow-hidden w-full max-w-5xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white rounded-full p-2 z-10 shadow-md hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative pt-[56.25%] w-full">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={currentVideo}
                title="YouTube Video Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoTestimonialSection; 