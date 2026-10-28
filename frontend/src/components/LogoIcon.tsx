import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({
  className = '',
  size = 24,
  alt = 'Aegis Shield',
}) => {
  return (
    <img
      src="/aegis-shield.png"
      alt={alt}
      width={size}
      height={Math.round(size * (162 / 137))}
      className={`inline-block object-contain flex-shrink-0 select-none ${className}`}
      style={{
        width: `${size}px`,
        height: 'auto',
        aspectRatio: '137 / 162',
      }}
      draggable={false}
    />
  );
};

interface AegisLogoProps {
  className?: string;
  height?: number;
  alt?: string;
}

export const AegisLogo: React.FC<AegisLogoProps> = ({
  className = '',
  height = 32,
  alt = 'Aegis',
}) => {
  return (
    <img
      src="/aegis-logo.png"
      alt={alt}
      height={height}
      className={`inline-block object-contain select-none ${className}`}
      style={{
        height: `${height}px`,
        width: 'auto',
        aspectRatio: '497 / 162',
      }}
      draggable={false}
    />
  );
};

