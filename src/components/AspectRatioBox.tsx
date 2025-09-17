import React from 'react';

const AspectRatioBox = ({ children, maxWidth, maxHeight }: {
  maxWidth: number,
  maxHeight: number,
  children: React.ReactNode
}) => {
  // Estilo para o contêiner que define os limites máximos.
  const containerStyle = {
    width: '100%',
    maxWidth: `${maxWidth}px`,
    maxHeight: `${maxHeight}px`,
    overflow: 'hidden',
  };

  // Estilo para a caixa interna que mantém a proporção 16:9.
  const aspectRatioStyle: any = {
    position: 'relative',
    width: '100%',
    aspectRatio: '1920 / 1080', // Proporção 16:9
    backgroundColor: '#f0f0f0',
  };

  // Estilo para o conteúdo, que preenche a caixa de proporção.
  const contentStyle: any = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={aspectRatioStyle}>
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AspectRatioBox;