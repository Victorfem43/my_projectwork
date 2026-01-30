'use client';

interface CryptoIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export default function CryptoIcon({ symbol, size = 56, className = '' }: CryptoIconProps) {
  const logoMap: { [key: string]: JSX.Element } = {
    BTC: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <circle cx="12" cy="12" r="12" fill="#F7931A"/>
        <path d="M17.29 9.28c.14-1-.08-1.78-.6-2.4-.6-.7-1.5-1.05-2.7-1.15l.55-2.2-1.34-.33-.54 2.16c-.35-.09-.73-.17-1.1-.25l.54-2.18-1.34-.33-.55 2.2c-.3-.07-.59-.14-.87-.21l.01-.01-1.85-.46-.36 1.44s1.02.23 1 .24c.55.14.64.5.6.78l-.63 2.52c.04.01.09.02.14.04l-.15-.04-1.01 4.05c-.07.17-.24.42-.62.33.01.02-1-.25-1-.25l-.67 1.51 1.75.44c.33.08.64.17.95.24l-.56 2.24 1.34.33.55-2.2c.37.1.72.19 1.06.27l-.55 2.2 1.34.33.56-2.23c2.28.43 4 .25 4.72-1.82.59-1.68-.03-2.65-1.24-3.28.88-.2 1.55-.78 1.72-1.98zm-2.66 4.19c-.42 1.67-3.22.77-4.13.54l.74-2.96c.91.23 3.83.68 3.39 2.42zm.42-4.24c-.38 1.52-2.72.75-3.48.56l.67-2.68c.76.19 3.21.54 2.81 2.12z" fill="#FFF"/>
      </svg>
    ),
    ETH: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <circle cx="12" cy="12" r="12" fill="#627EEA"/>
        <path d="M12.298 3v6.652l5.297 2.378L12.298 3z" fill="#FFF" fillOpacity=".602"/>
        <path d="M12.298 3L7 12.03l5.298-2.378V3z" fill="#FFF"/>
        <path d="M12.298 16.476v4.52L17.6 13.212l-5.302 3.264z" fill="#FFF" fillOpacity=".602"/>
        <path d="M12.298 20.996v-4.52L7 13.212l5.298 7.784z" fill="#FFF"/>
        <path d="M12.298 15.43l5.297-3.4-5.297-2.381v5.781z" fill="#FFF" fillOpacity=".2"/>
        <path d="M7 12.03l5.298 3.4V9.652L7 12.03z" fill="#FFF" fillOpacity=".602"/>
      </svg>
    ),
    USDT: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <circle cx="12" cy="12" r="12" fill="#26A17B"/>
        <path d="M13.402 8.403v-.955h2.56V6.188H8.038v1.26h2.56v.955c-2.16.134-3.77.98-3.77 2.05 0 1.07 1.61 1.916 3.77 2.05v6.782h2.804v-6.782c2.16-.134 3.77-.98 3.77-2.05 0-1.07-1.61-1.916-3.77-2.05zm0 3.508c-.25.016-.516.024-.8.024-.272 0-.537-.008-.79-.024v.003c-1.9-.09-3.32-.5-3.32-.98 0-.48 1.42-.89 3.32-.98v1.55c.253-.016.518-.024.79-.024.284 0 .55.008.8.024v-1.55c1.9.09 3.32.5 3.32.98 0 .48-1.42.89-3.32.98v-.003z" fill="#FFF"/>
      </svg>
    ),
    BNB: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <circle cx="12" cy="12" r="12" fill="#F3BA2F"/>
        <path d="M12 0L8.4 3.6l3.6 3.6 3.6-3.6L12 0zM12 16.8L8.4 13.2l3.6-3.6 3.6 3.6L12 16.8zM12 9.6L8.4 6l3.6-3.6L15.6 6 12 9.6zM12 24l-3.6-3.6 3.6-3.6 3.6 3.6L12 24zM12 14.4L8.4 10.8l3.6-3.6 3.6 3.6L12 14.4zM6 12l3.6-3.6L12 12l-2.4 2.4L6 12zM18 12l-3.6-3.6L12 12l2.4 2.4L18 12z" fill="#FFF"/>
      </svg>
    ),
    SOL: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <circle cx="12" cy="12" r="12" fill="#14F195"/>
        <path d="M7.5 15.75L12 17.25l4.5-1.5L12 18.75l-4.5-3z" fill="#FFF"/>
        <path d="M7.5 8.25L12 9.75l4.5-1.5L12 11.25l-4.5-3z" fill="#FFF"/>
        <path d="M16.5 6L12 7.5 7.5 6 12 4.5l4.5 1.5z" fill="#FFF"/>
        <path d="M16.5 18L12 19.5 7.5 18l4.5 1.5 4.5-1.5z" fill="#FFF"/>
        <path d="M7.5 12L12 13.5l4.5-1.5L12 15l-4.5-3z" fill="#FFF"/>
      </svg>
    ),
    ADA: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <circle cx="12" cy="12" r="12" fill="#0033AD"/>
        <path d="M12 3L8.4 9.6h7.2L12 3zm-3.6 7.2L12 21l3.6-10.8H8.4z" fill="#FFF"/>
      </svg>
    ),
  };

  const normalizedSymbol = symbol.toUpperCase();
  const icon = logoMap[normalizedSymbol];

  if (!icon) {
    // Fallback to first letter if logo not found
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xl font-bold text-white">{symbol[0]}</span>
      </div>
    );
  }

  return icon;
}
