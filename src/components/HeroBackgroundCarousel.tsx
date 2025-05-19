import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Mover para fora do componente para evitar recriação
const backgroundImages = [
  {
    url: "/img_1.png",
    alt: "Imagem Corporativa 1"
  },
  {
    url: "/img_2.png",
    alt: "Imagem Corporativa 2"
  },
  {
    url: "/img_3.png",
    alt: "Imagem Corporativa 3"
  }
] as const;

// Constantes para evitar "magic numbers"
const TRANSITION_DURATION = 1000;
const INTERVAL_DURATION = 7000;

interface HeroBackgroundCarouselProps {
  calculateParallax: (intensity?: number, depth?: number) => any;
}

const HeroBackgroundCarousel: React.FC<HeroBackgroundCarouselProps> = ({ calculateParallax }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([false, false, false]);

  // Otimizar a função de transição usando useCallback
  const handleTransition = useCallback(() => {
    if (!imagesLoaded.every(loaded => loaded)) {
      console.log('Aguardando carregamento de todas as imagens...');
      return;
    }

    setIsTransitioning(true);
    const next = (currentImageIndex + 1) % backgroundImages.length;
    setNextImageIndex(next);
    
    const timeoutId = setTimeout(() => {
      setCurrentImageIndex(next);
      setNextImageIndex((next + 1) % backgroundImages.length);
      setIsTransitioning(false);
    }, TRANSITION_DURATION);

    return () => clearTimeout(timeoutId);
  }, [currentImageIndex, imagesLoaded]);

  // Pré-carregamento das imagens otimizado
  useEffect(() => {
    const imagePromises = backgroundImages.map((image, index) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = image.url;
        img.onload = () => {
          setImagesLoaded(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
          console.log(`Imagem ${image.url} carregada com sucesso`);
          resolve();
        };
        img.onerror = () => {
          console.error(`Erro ao carregar a imagem ${image.url}`);
          reject();
        };
      });
    });

    Promise.all(imagePromises).catch(console.error);
  }, []);

  // Intervalo de transição otimizado
  useEffect(() => {
    const intervalId = setInterval(handleTransition, INTERVAL_DURATION);
    return () => clearInterval(intervalId);
  }, [handleTransition]);

  // Memoizar os estilos de parallax para evitar recálculos
  const parallaxStyles = useMemo(() => ({
    current: calculateParallax(0.5, -20),
    next: calculateParallax(0.5, -20),
    overlay: calculateParallax(0.2, -10)
  }), [calculateParallax]);

  // Memoizar as classes CSS para evitar recálculos
  const transitionClasses = useMemo(() => ({
    current: `absolute inset-0 transform transition-all duration-1000 ease-in-out will-change-transform will-change-opacity ${
      isTransitioning ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
    }`,
    next: `absolute inset-0 transform transition-all duration-1000 ease-in-out will-change-transform will-change-opacity ${
      isTransitioning ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
    }`
  }), [isTransitioning]);

  if (!imagesLoaded.some(loaded => loaded)) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Carregando imagens...</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Imagem atual */}
      <div
        className={transitionClasses.current}
        style={{
          backgroundImage: `url('${backgroundImages[currentImageIndex].url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          ...parallaxStyles.current
        }}
        role="img"
        aria-label={backgroundImages[currentImageIndex].alt}
      />

      {/* Próxima imagem */}
      <div
        className={transitionClasses.next}
        style={{
          backgroundImage: `url('${backgroundImages[nextImageIndex].url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          ...parallaxStyles.next
        }}
        role="img"
        aria-label={backgroundImages[nextImageIndex].alt}
      />

      {/* Overlay gradiente otimizado */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 will-change-transform"
        style={parallaxStyles.overlay}
      />

      {/* Indicadores de navegação */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {backgroundImages.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Memoizar o componente inteiro para evitar re-renderizações desnecessárias
export default React.memo(HeroBackgroundCarousel); 