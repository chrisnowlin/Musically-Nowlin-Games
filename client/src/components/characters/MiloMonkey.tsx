import React from 'react';

interface CharacterProps extends React.SVGProps<SVGSVGElement> {
  isPlaying?: boolean;
}

export const MiloMonkey: React.FC<CharacterProps> = ({ isPlaying, className, ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 300 400" 
      className={`${className} ${isPlaying ? 'animate-bounce-subtle' : ''}`}
      {...props}
    >
      <defs>
        <linearGradient id="monkeyFur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="100%" stopColor="#5D4037" />
        </linearGradient>
        <linearGradient id="monkeySkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE0B2" />
          <stop offset="100%" stopColor="#FFCC80" />
        </linearGradient>
      </defs>

      {/* Tail */}
      <path d="M 150 280 Q 250 250 240 150 Q 230 100 200 120" fill="none" stroke="#5D4037" strokeWidth="15" strokeLinecap="round" className={isPlaying ? 'animate-sway' : ''} />

      {/* Legs */}
      <path d="M 110 280 L 110 360" stroke="#5D4037" strokeWidth="25" strokeLinecap="round" />
      <path d="M 190 280 L 190 360" stroke="#5D4037" strokeWidth="25" strokeLinecap="round" />
      
      {/* Feet */}
      <ellipse cx="110" cy="365" rx="20" ry="10" fill="#5D4037" />
      <ellipse cx="190" cy="365" rx="20" ry="10" fill="#5D4037" />

      {/* Body */}
      <ellipse cx="150" cy="220" rx="60" ry="80" fill="url(#monkeyFur)" />
      <ellipse cx="150" cy="220" rx="40" ry="60" fill="#FFE0B2" opacity="0.3" />

      {/* Arms */}
      <path d="M 95 180 Q 70 220 80 240" stroke="#5D4037" strokeWidth="20" strokeLinecap="round" />
      <path d="M 205 180 Q 230 220 220 240" stroke="#5D4037" strokeWidth="20" strokeLinecap="round" />

      {/* Hands */}
      <circle cx="80" cy="240" r="12" fill="#FFE0B2" />
      <circle cx="220" cy="240" r="12" fill="#FFE0B2" />

      {/* Bongo Drum under left arm */}
      <g transform={isPlaying ? "translate(0, -5)" : ""}>
        <path d="M 55 240 L 55 280 Q 80 290 105 280 L 105 240" fill="#D84315" />
        <ellipse cx="80" cy="240" rx="25" ry="10" fill="#FFAB91" />
      </g>

      {/* Head */}
      <circle cx="150" cy="110" r="50" fill="url(#monkeyFur)" />
      {/* Ears */}
      <circle cx="95" cy="110" r="15" fill="#5D4037" />
      <circle cx="95" cy="110" r="10" fill="#FFE0B2" />
      <circle cx="205" cy="110" r="15" fill="#5D4037" />
      <circle cx="205" cy="110" r="10" fill="#FFE0B2" />

      {/* Face */}
      <path d="M 120 90 Q 150 70 180 90 Q 190 110 180 130 Q 150 150 120 130 Q 110 110 120 90" fill="#FFE0B2" />
      
      {/* Face Details */}
      <circle cx="135" cy="105" r="5" fill="#3E2723" /> {/* Eye L */}
      <circle cx="165" cy="105" r="5" fill="#3E2723" /> {/* Eye R */}
      <circle cx="137" cy="103" r="2" fill="#FFF" />
      <circle cx="167" cy="103" r="2" fill="#FFF" />
      
      <ellipse cx="150" cy="115" rx="5" ry="3" fill="#3E2723" opacity="0.6" /> {/* Nose */}
      <path d="M 140 125 Q 150 135 160 125" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" /> {/* Smile */}
    </svg>
  );
};
