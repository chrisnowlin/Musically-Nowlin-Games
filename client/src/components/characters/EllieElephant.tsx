import React from 'react';

interface CharacterProps extends React.SVGProps<SVGSVGElement> {
  isPlaying?: boolean;
}

export const EllieElephant: React.FC<CharacterProps> = ({ isPlaying, className, ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 300 400" 
      className={`${className} ${isPlaying ? 'animate-bounce-subtle' : ''}`}
      {...props}
    >
      <defs>
        <linearGradient id="elephantSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#90A4AE" />
          <stop offset="100%" stopColor="#607D8B" />
        </linearGradient>
        <linearGradient id="elephantEars" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78909C" />
          <stop offset="100%" stopColor="#546E7A" />
        </linearGradient>
      </defs>

      {/* Legs */}
      <rect x="100" y="280" width="30" height="80" rx="12" fill="#607D8B" />
      <rect x="170" y="280" width="30" height="80" rx="12" fill="#607D8B" />
      
      {/* Feet */}
      <ellipse cx="115" cy="360" rx="20" ry="10" fill="#546E7A" />
      <ellipse cx="185" cy="360" rx="20" ry="10" fill="#546E7A" />
      {/* Toenails */}
      <circle cx="100" cy="362" r="4" fill="#CFD8DC" />
      <circle cx="110" cy="365" r="4" fill="#CFD8DC" />
      <circle cx="120" cy="365" r="4" fill="#CFD8DC" />
      <circle cx="130" cy="362" r="4" fill="#CFD8DC" />
      <circle cx="170" cy="362" r="4" fill="#CFD8DC" />
      <circle cx="180" cy="365" r="4" fill="#CFD8DC" />
      <circle cx="190" cy="365" r="4" fill="#CFD8DC" />
      <circle cx="200" cy="362" r="4" fill="#CFD8DC" />

      {/* Tail */}
      <path d="M 180 270 Q 220 280 230 310 Q 235 320 225 325" stroke="#607D8B" strokeWidth="8" fill="none" strokeLinecap="round" className={isPlaying ? 'animate-sway' : ''} />
      <path d="M 222 320 Q 215 330 225 335 M 222 320 Q 230 330 225 335" stroke="#546E7A" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Body */}
      <ellipse cx="150" cy="220" rx="70" ry="80" fill="url(#elephantSkin)" />
      <ellipse cx="150" cy="220" rx="45" ry="55" fill="#B0BEC5" opacity="0.3" />

      {/* Arms */}
      <path d="M 85 190 Q 50 230 70 260" stroke="#607D8B" strokeWidth="25" strokeLinecap="round" />
      <path d="M 215 190 Q 250 230 230 260" stroke="#607D8B" strokeWidth="25" strokeLinecap="round" />
      
      {/* Hands */}
      <circle cx="70" cy="260" r="15" fill="#78909C" />
      <circle cx="230" cy="260" r="15" fill="#78909C" />

      {/* Trumpet in right hand */}
      <g transform={isPlaying ? "rotate(-5 220 240)" : ""}>
        <g transform="translate(220, 240) rotate(-30)">
          <rect x="0" y="0" width="8" height="35" fill="#FFD54F" />
          <rect x="-2" y="30" width="12" height="8" fill="#FFC107" rx="2" />
          <ellipse cx="4" cy="42" rx="12" ry="8" fill="#FFD54F" />
          <circle cx="4" cy="8" r="3" fill="#FFC107" />
          <circle cx="4" cy="16" r="3" fill="#FFC107" />
          <circle cx="4" cy="24" r="3" fill="#FFC107" />
        </g>
      </g>

      {/* Ears */}
      <ellipse cx="70" cy="100" rx="40" ry="50" fill="url(#elephantEars)" />
      <ellipse cx="70" cy="100" rx="25" ry="35" fill="#FFAB91" opacity="0.4" />
      <ellipse cx="230" cy="100" rx="40" ry="50" fill="url(#elephantEars)" />
      <ellipse cx="230" cy="100" rx="25" ry="35" fill="#FFAB91" opacity="0.4" />

      {/* Head */}
      <circle cx="150" cy="100" r="55" fill="url(#elephantSkin)" />
      
      {/* Trunk */}
      <path d="M 150 130 Q 150 180 130 220 Q 120 250 140 260" stroke="#607D8B" strokeWidth="20" fill="none" strokeLinecap="round" />
      <path d="M 150 130 Q 150 180 130 220 Q 120 250 140 260" stroke="#90A4AE" strokeWidth="14" fill="none" strokeLinecap="round" />

      {/* Eyes */}
      <circle cx="125" cy="85" r="10" fill="#FFF" />
      <circle cx="125" cy="85" r="5" fill="#3E2723" />
      <circle cx="127" cy="83" r="2" fill="#FFF" />
      <circle cx="175" cy="85" r="10" fill="#FFF" />
      <circle cx="175" cy="85" r="5" fill="#3E2723" />
      <circle cx="177" cy="83" r="2" fill="#FFF" />

      {/* Eyebrows (friendly expression) */}
      <path d="M 112 70 Q 125 65 138 72" stroke="#455A64" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 162 72 Q 175 65 188 70" stroke="#455A64" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Tusks */}
      <path d="M 135 120 Q 120 140 115 130" stroke="#ECEFF1" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 165 120 Q 180 140 185 130" stroke="#ECEFF1" strokeWidth="8" fill="none" strokeLinecap="round" />

      {/* Bow tie */}
      <path d="M 120 155 L 150 165 L 180 155 L 150 145 Z" fill="#E91E63" />
      <circle cx="150" cy="155" r="6" fill="#C2185B" />

      {/* Musical notes */}
      {isPlaying && (
        <>
          <text x="50" y="50" fontFamily="Arial" fontSize="30" fill="#E91E63" className="animate-float-note-1">♪</text>
          <text x="230" y="40" fontFamily="Arial" fontSize="25" fill="#9C27B0" className="animate-float-note-2">♫</text>
        </>
      )}
    </svg>
  );
};
