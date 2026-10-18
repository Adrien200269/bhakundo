import React from 'react';

interface NepaliFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
}

export const NepaliFlag: React.FC<NepaliFlagProps> = ({
  className = '',
  size = 'md',
  showBorder = true,
}) => {
  const sizeMap = {
    sm: 'w-5 h-6',
    md: 'w-7 h-8',
    lg: 'w-9 h-11',
    xl: 'w-14 h-16',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${showBorder ? 'drop-shadow-sm' : ''} ${sizeMap[size]} ${className}`}
      title="Nepal National Flag - नेपालको झण्डा"
    >
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
      >
        {/* Deep Blue Outer Border of the iconic double pennant */}
        <polygon
          points="6,114 6,6 88,48 42,48 88,114"
          fill="#003893"
          stroke="#002566"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Crimson Red Inner Body */}
        <polygon
          points="12,108 12,14 76,46 36,46 76,108"
          fill="#DC143C"
          strokeLinejoin="round"
        />

        {/* Upper Pennant: White Crescent Moon with 8 stylized rays */}
        <g transform="translate(26, 32)">
          {/* Moon base crescent */}
          <path
            d="M -7,4 A 10,9 0 0,0 7,4 A 9,7 0 0,1 -7,4 Z"
            fill="#FFFFFF"
          />
          {/* Moon central sun/star ray */}
          <circle cx="0" cy="3" r="3" fill="#FFFFFF" />
          <path
            d="M -5,1 L -3,3 L -1,1 L 1,3 L 3,1 L 5,3 L 4,5 L -4,5 Z"
            fill="#FFFFFF"
          />
        </g>

        {/* Lower Pennant: White 12-pointed Sun */}
        <g transform="translate(28, 78)">
          <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
          {/* 12 Sun rays */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12;
            return (
              <polygon
                key={i}
                points="-1.8,-6 1.8,-6 0,-12"
                fill="#FFFFFF"
                transform={`rotate(${angle})`}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default NepaliFlag;
