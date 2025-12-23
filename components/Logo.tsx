import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 48, className = "" }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md" 
      >
        <rect x="39.5" y="41" width="121" height="118" rx="28" fill="url(#book_cover_grad)" />
        <rect x="39.5" y="41" width="121" height="118" rx="28" stroke="white" strokeOpacity="0.1" strokeWidth="1" />

        <path
          d="M52.11 59.67C52.11 59.67 72.27 54.63 100 59.67C127.73 54.63 147.89 59.67 147.89 59.67V139.07C147.89 139.07 127.73 134.03 100 139.07C72.27 134.03 52.11 139.07 52.11 139.07V59.67Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path d="M100 59.67V139.07" stroke="#CBD5E1" strokeWidth="1.5" />

        <rect x="69.75" y="69.75" width="60.5" height="60.5" rx="15" fill="#1E40AF" />
        <rect x="74.79" y="74.79" width="50.42" height="50.42" rx="10" fill="#3B82F6" />

        <g stroke="#1E40AF" strokeWidth="2" strokeLinecap="round">
          <path d="M64.71 89.92H69.75" />
          <path d="M64.71 100H69.75" />
          <path d="M64.71 110.08H69.75" />
          <path d="M130.25 89.92H135.29" />
          <path d="M130.25 100H135.29" />
          <path d="M130.25 110.08H135.29" />
          <path d="M89.92 64.71V69.75" />
          <path d="M100 64.71V69.75" />
          <path d="M110.08 64.71V69.75" />
        </g>

        <text
          x="100" y="100"
          fill="white"
          fontSize="25.2" 
          fontWeight="900"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >AI</text>

        <defs>
          <linearGradient id="book_cover_grad" x1="39.5" y1="41" x2="160.5" y2="159" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="0.5" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;