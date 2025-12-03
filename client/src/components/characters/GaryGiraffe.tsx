import React from 'react';

interface CharacterProps extends React.SVGProps<SVGSVGElement> {
  isPlaying?: boolean;
}

export const GaryGiraffe: React.FC<CharacterProps> = ({ isPlaying, className, ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 300 400" 
      className={`${className} ${isPlaying ? 'animate-bounce-subtle' : ''}`}
      {...props}
    >
      <defs>
        <linearGradient id="giraffeFur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFCA28" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>
        <linearGradient id="giraffeSpots" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="100%" stopColor="#5D4037" />
        </linearGradient>
      </defs>

      {/* Legs (long and slender) */}
      <rect x="115" y="280" width="18" height="90" rx="8" fill="#FFA000" />
      <rect x="167" y="280" width="18" height="90" rx="8" fill="#FFA000" />
      
      {/* Hooves */}
      <rect x="112" y="360" width="24" height="12" rx="4" fill="#5D4037" />
      <rect x="164" y="360" width="24" height="12" rx="4" fill="#5D4037" />

      {/* Tail */}
      <path d="M 175 270 Q 210 260 215 285" stroke="#FFA000" strokeWidth="6" fill="none" strokeLinecap="round" className={isPlaying ? 'animate-sway' : ''} />
      <path d="M 212 280 Q 205 295 220 300 M 212 280 Q 225 290 220 300" stroke="#8D6E63" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Body */}
      <ellipse cx="150" cy="250" rx="55" ry="50" fill="url(#giraffeFur)" />
      {/* Body spots */}
      <ellipse cx="125" cy="235" rx="12" ry="10" fill="#8D6E63" opacity="0.7" />
      <ellipse cx="165" cy="255" rx="14" ry="11" fill="#8D6E63" opacity="0.7" />
      <ellipse cx="145" cy="270" rx="10" ry="8" fill="#8D6E63" opacity="0.7" />
      <ellipse cx="180" cy="235" rx="10" ry="12" fill="#8D6E63" opacity="0.7" />

      {/* Neck (long!) */}
      <path d="M 150 200 L 150 100" stroke="url(#giraffeFur)" strokeWidth="40" strokeLinecap="round" />
      <path d="M 150 200 L 150 100" stroke="#FFCA28" strokeWidth="30" strokeLinecap="round" />
      {/* Neck spots */}
      <ellipse cx="140" cy="180" rx="8" ry="10" fill="#8D6E63" opacity="0.7" />
      <ellipse cx="160" cy="150" rx="10" ry="8" fill="#8D6E63" opacity="0.7" />
      <ellipse cx="145" cy="120" rx="9" ry="7" fill="#8D6E63" opacity="0.7" />

      {/* Arms */}
      <path d="M 100 220 Q 60 240 75 270" stroke="#FFA000" strokeWidth="18" strokeLinecap="round" />
      <path d="M 200 220 Q 240 240 225 270" stroke="#FFA000" strokeWidth="18" strokeLinecap="round" />
      
      {/* Hooves (hands) */}
      <ellipse cx="75" cy="275" rx="12" ry="8" fill="#5D4037" />
      <ellipse cx="225" cy="275" rx="12" ry="8" fill="#5D4037" />

      {/* Violin in left hand */}
      <g transform={isPlaying ? "rotate(-5 40 250)" : ""}>
        <g transform="translate(40, 250) rotate(-15)">
          <ellipse cx="20" cy="15" rx="18" ry="12" fill="#8D6E63" />
          <ellipse cx="20" cy="15" rx="12" ry="8" fill="#A1887F" />
          <rect x="16" y="-25" width="8" height="40" fill="#5D4037" />
          <rect x="12" y="-30" width="16" height="8" fill="#3E2723" rx="2" />
          {/* Strings */}
          <line x1="18" y1="-22" x2="18" y2="20" stroke="#CFD8DC" strokeWidth="1" />
          <line x1="22" y1="-22" x2="22" y2="20" stroke="#CFD8DC" strokeWidth="1" />
          {/* F-holes */}
          <path d="M 12 12 Q 14 18 12 22" stroke="#3E2723" strokeWidth="2" fill="none" />
          <path d="M 28 12 Q 26 18 28 22" stroke="#3E2723" strokeWidth="2" fill="none" />
        </g>
      </g>

      {/* Head */}
      <ellipse cx="150" cy="60" rx="35" ry="30" fill="url(#giraffeFur)" />
      
      {/* Head spots */}
      <ellipse cx="135" cy="50" rx="8" ry="6" fill="#8D6E63" opacity="0.7" />
      <ellipse cx="168" cy="55" rx="6" ry="8" fill="#8D6E63" opacity="0.7" />

      {/* Ossicones (horns) */}
      <rect x="130" y="25" width="8" height="25" rx="4" fill="#FFA000" />
      <circle cx="134" cy="22" r="6" fill="#8D6E63" />
      <rect x="162" y="25" width="8" height="25" rx="4" fill="#FFA000" />
      <circle cx="166" cy="22" r="6" fill="#8D6E63" />

      {/* Ears */}
      <ellipse cx="115" cy="50" rx="12" ry="8" fill="#FFCA28" transform="rotate(-30 115 50)" />
      <ellipse cx="185" cy="50" rx="12" ry="8" fill="#FFCA28" transform="rotate(30 185 50)" />

      {/* Eyes */}
      <circle cx="135" cy="55" r="8" fill="#FFF" />
      <circle cx="135" cy="55" r="4" fill="#3E2723" />
      <circle cx="137" cy="53" r="1.5" fill="#FFF" />
      <circle cx="165" cy="55" r="8" fill="#FFF" />
      <circle cx="165" cy="55" r="4" fill="#3E2723" />
      <circle cx="167" cy="53" r="1.5" fill="#FFF" />

      {/* Eyelashes */}
      <path d="M 128 50 L 125 46" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      <path d="M 132 48 L 130 44" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      <path d="M 168 48 L 170 44" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
      <path d="M 172 50 L 175 46" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />

      {/* Snout */}
      <ellipse cx="150" cy="75" rx="20" ry="12" fill="#FFE082" />
      
      {/* Nostrils */}
      <ellipse cx="143" cy="75" rx="3" ry="2" fill="#8D6E63" />
      <ellipse cx="157" cy="75" rx="3" ry="2" fill="#8D6E63" />

      {/* Smile */}
      <path d="M 140 82 Q 150 90 160 82" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Bow tie */}
      <path d="M 130 95 L 150 102 L 170 95 L 150 88 Z" fill="#9C27B0" />
      <circle cx="150" cy="95" r="5" fill="#7B1FA2" />

      {/* Musical notes */}
      {isPlaying && (
        <>
          <text x="60" y="45" fontFamily="Arial" fontSize="28" fill="#9C27B0" className="animate-float-note-1">♫</text>
          <text x="220" y="60" fontFamily="Arial" fontSize="22" fill="#E91E63" className="animate-float-note-2">♪</text>
        </>
      )}
    </svg>
  );
};
