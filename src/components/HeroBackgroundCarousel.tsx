import React, { useState, useEffect } from 'react';

interface HeroBackgroundProps {
  calculateParallax: (intensity?: number, depth?: number) => any;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({ calculateParallax }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/img_1.png';
    img.onload = () => {
      setImageLoaded(true);
      console.log('Imagem carregada com sucesso');
    };
    img.onerror = () => {
      console.error('Erro ao carregar a imagem');
    };
  }, []);

  if (!imageLoaded) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Carregando imagem...</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Imagem de fundo */}
      <div
        className="absolute inset-0 transform will-change-transform"
        style={{
          backgroundImage: "url('/img_1.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          ...calculateParallax(0.5, -20)
        }}
        role="img"
        aria-label="Imagem Corporativa"
      />

      {/* Overlay gradiente otimizado */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 will-change-transform"
        style={calculateParallax(0.2, -10)}
      />
    </div>
  );
};

export default React.memo(HeroBackground); 