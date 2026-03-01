import React from 'react';

interface CharacterProps extends React.SVGProps<SVGSVGElement> {
  isPlaying?: boolean;
}

export const BellaBird: React.FC<CharacterProps> = ({ isPlaying, className, ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 300 400" 
      className={`${className} ${isPlaying ? 'animate-bounce-subtle' : ''}`}
      {...props}
    >
      <defs>
        <linearGradient id="birdFeathers" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4DD0E1" />
          <stop offset="100%" stopColor="#0097A7" />
        </linearGradient>
      </defs>

      {/* Legs */}
      <path d="M 130 280 L 130 350" stroke="#FBC02D" strokeWidth="8" strokeLinecap="round" />
      <path d="M 170 280 L 170 350" stroke="#FBC02D" strokeWidth="8" strokeLinecap="round" />
      
      {/* Feet */}
      <path d="M 130 350 L 115 365 M 130 350 L 130 370 M 130 350 L 145 365" stroke="#FBC02D" strokeWidth="5" strokeLinecap="round" />
      <path d="M 170 350 L 155 365 M 170 350 L 170 370 M 170 350 L 185 365" stroke="#FBC02D" strokeWidth="5" strokeLinecap="round" />

      {/* Tail Feathers */}
      <path d="M 110 260 L 80 300 L 120 290 Z" fill="#00838F" />

      {/* Body */}
      <ellipse cx="150" cy="200" rx="60" ry="90" fill="url(#birdFeathers)" />
      <ellipse cx="150" cy="210" rx="40" ry="70" fill="#B2EBF2" opacity="0.3" />

      {/* Wings (Arms) */}
      <path d="M 95 180 Q 70 230 90 260 L 110 220" fill="#0097A7" className={isPlaying ? 'animate-flap-left' : ''} />
      <path d="M 205 180 Q 230 230 210 260 L 190 220" fill="#0097A7" className={isPlaying ? 'animate-flap-right' : ''} />

      {/* Head */}
      <circle cx="150" cy="100" r="50" fill="url(#birdFeathers)" />
      
      {/* Tuft */}
      <path d="M 150 55 Q 140 30 150 20 Q 160 30 160 55" fill="#0097A7" />

      {/* Eyes */}
      <circle cx="135" cy="90" r="8" fill="#FFF" />
      <circle cx="135" cy="90" r="4" fill="#000" />
      <circle cx="165" cy="90" r="8" fill="#FFF" />
      <circle cx="165" cy="90" r="4" fill="#000" />

      {/* Beak */}
      <path d="M 140 110 L 160 110 L 150 130 Z" fill="#FBC02D" />

      {/* Bow Tie / Scarf */}
      <path d="M 130 150 L 150 160 L 170 150 L 150 140 Z" fill="#E91E63" />
      
      {/* Musical Notes floating */}
      {isPlaying && (
        <>
          <text x="220" y="80" fontFamily="Arial" fontSize="40" fill="#E91E63" className="animate-float-note-1">♪</text>
          <text x="250" y="60" fontFamily="Arial" fontSize="30" fill="#9C27B0" className="animate-float-note-2">♫</text>
        </>
      )}
    </svg>
  );
};
