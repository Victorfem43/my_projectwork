'use client';

// Official brand icons from Simple Icons (https://simpleicons.org) via jsDelivr CDN
const BRAND_ICON_URLS: Record<string, string> = {
  Steam: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/steam.svg',
  Amazon: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/amazon.svg',
  'Google Play': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/googleplay.svg',
};

// Brand colors so icons display in color (not black)
const BRAND_COLORS: Record<string, string> = {
  Steam: '#1b2838',      // Steam dark blue
  Amazon: '#FF9900',     // Amazon orange
  'Google Play': '#414141', // fallback (Google Play uses multi-color below)
};

interface GiftCardIconProps {
  brand: string;
  size?: number;
  className?: string;
}

export default function GiftCardIcon({ brand, size = 48, className = '' }: GiftCardIconProps) {
  const logoMap: { [key: string]: JSX.Element } = {
    // Amazon: official icon in brand color (orange)
    Amazon: (
      <div
        role="img"
        aria-label="Amazon"
        className={`rounded-xl ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: BRAND_COLORS.Amazon,
          maskImage: `url(${BRAND_ICON_URLS.Amazon})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url(${BRAND_ICON_URLS.Amazon})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
    ),
    Apple: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <rect width="24" height="24" rx="6" fill="#000000"/>
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#FFFFFF"/>
      </svg>
    ),
    // Google Play: multi-colored play triangle (brand colors)
    'Google Play': (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <rect width="24" height="24" rx="6" fill="#FFFFFF"/>
        <path d="M 5 4 L 11 8 L 17 12 Z" fill="#34A853"/>
        <path d="M 5 4 L 5 20 L 11 16 L 11 8 Z" fill="#4285F4"/>
        <path d="M 5 20 L 11 16 L 17 12 Z" fill="#EA4335"/>
        <path d="M 11 8 L 17 12 L 11 16 Z" fill="#FBBC04"/>
      </svg>
    ),
    // Steam: official icon in brand color (dark blue)
    Steam: (
      <div
        role="img"
        aria-label="Steam"
        className={`rounded-xl ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: BRAND_COLORS.Steam,
          maskImage: `url(${BRAND_ICON_URLS.Steam})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url(${BRAND_ICON_URLS.Steam})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
    ),
    Netflix: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <rect width="24" height="24" rx="6" fill="#000000"/>
        <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.924-.004-15.617 0-22.95zM5.398 0L0 19.615c2.344-.053 4.85-.398 4.854-.398L5.398 0z" fill="#E50914"/>
      </svg>
    ),
    Spotify: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <rect width="24" height="24" rx="6" fill="#1DB954"/>
        <path d="M17.5 10.5c-2.5-1.5-6.5-1.7-9-.9-.3.1-.5-.1-.5-.4s.2-.5.5-.4c2.8-.9 7.1-.7 9.9 1 .3.2.3.6.1.7zm-1.3 2.3c-.2.3-.6.4-.9.2-2.1-1.3-5.3-1.6-7.8-.9-.3.1-.6-.1-.6-.4 0-.3.3-.5.6-.4 2.8-.8 6.3-.5 8.7 1 .3.2.4.6.1.9zm-1.1 2.2c-.2.2-.5.3-.7.1-1.8-1.1-4.1-1.4-5.6-.8-.2.1-.4 0-.5-.2s0-.4.2-.5c1.7-.7 4.3-.4 6.3.8.2.1.3.4.1.6zm-5.1-5.8c-1.1.6-2.7.7-3.8.4-.2-.1-.4.1-.4.3s.2.3.4.3c1.3.3 3.1.2 4.4-.4.2-.1.3-.3.1-.5s-.3-.1-.7-.1z" fill="#FFFFFF"/>
      </svg>
    ),
    // Target: bullseye logo
    Target: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <rect width="24" height="24" rx="6" fill="#CC0000"/>
        <circle cx="12" cy="12" r="9" fill="#FFFFFF"/>
        <circle cx="12" cy="12" r="5.5" fill="#CC0000"/>
        <circle cx="12" cy="12" r="2.5" fill="#FFFFFF"/>
      </svg>
    ),
    // Walmart: blue background + yellow sunburst/spark
    Walmart: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <rect width="24" height="24" rx="6" fill="#0071CE"/>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.53 15.53l2.83 2.83M5.64 18.36l2.83-2.83M15.53 8.47l2.83-2.83" stroke="#FFC220" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3.5" fill="#FFC220"/>
      </svg>
    ),
    // iTunes: Apple music/gift style (Apple brand)
    iTunes: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: size, height: size }}>
        <rect width="24" height="24" rx="6" fill="#000000"/>
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#FFFFFF"/>
      </svg>
    ),
  };

  const normalizedBrand = brand.trim();
  const icon = logoMap[normalizedBrand];

  if (!icon) {
    // Fallback to first letter if logo not found
    return (
      <div 
        className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-lg font-bold text-white">{brand[0]}</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {icon}
    </div>
  );
}
