import React from 'react';

interface InstrumentIconProps {
  className?: string;
}

export const ViolinIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="violinWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8B4513" />
        <stop offset="50%" stopColor="#CD853F" />
        <stop offset="100%" stopColor="#8B4513" />
      </linearGradient>
      <linearGradient id="fingerboard" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1a1a1a" />
        <stop offset="50%" stopColor="#333" />
        <stop offset="100%" stopColor="#1a1a1a" />
      </linearGradient>
    </defs>
    {/* Body */}
    <path d="M50 15 C65 15 72 28 66 40 C62 48 75 58 75 75 C75 92 65 95 50 95 C35 95 25 92 25 75 C25 58 38 48 34 40 C28 28 35 15 50 15 Z" fill="url(#violinWood)" stroke="#5D4037" strokeWidth="1"/>
    {/* Inner Purfling */}
    <path d="M50 17 C63 17 69 29 64 40 C60 48 72 58 72 75 C72 90 63 93 50 93 C37 93 28 90 28 75 C28 58 40 48 36 40 C31 29 37 17 50 17 Z" stroke="#3E2723" strokeWidth="0.5" fill="none" opacity="0.6"/>
    
    {/* F-holes */}
    <path d="M36 55 C34 58 34 65 32 70 C31 72 36 72 36 68 C36 65 38 60 36 55" fill="#2F1810"/>
    <circle cx="36" cy="55" r="1.5" fill="#2F1810"/>
    <circle cx="32" cy="70" r="1.5" fill="#2F1810"/>
    
    <path d="M64 55 C66 58 66 65 68 70 C69 72 64 72 64 68 C64 65 62 60 64 55" fill="#2F1810"/>
    <circle cx="64" cy="55" r="1.5" fill="#2F1810"/>
    <circle cx="68" cy="70" r="1.5" fill="#2F1810"/>

    {/* Neck & Scroll */}
    <rect x="46" y="5" width="8" height="45" rx="1" fill="url(#fingerboard)"/>
    <path d="M46 5 C44 3 46 1 50 1 C54 1 56 3 54 5" fill="#8B4513"/>
    <path d="M50 3 C49 3 48 4 50 5 C52 4 51 3 50 3" stroke="#3E2723" strokeWidth="0.5"/>

    {/* Tailpiece */}
    <path d="M44 85 L 46 75 L 54 75 L 56 85 C 56 90 44 90 44 85" fill="#1a1a1a"/>
    <circle cx="50" cy="92" r="1.5" fill="#333" /> {/* End button */}

    {/* Bridge */}
    <path d="M42 70 L 58 70 L 56 66 L 44 66 Z" fill="#DEB887" stroke="#8B4513" strokeWidth="0.5"/>

    {/* Strings */}
    <line x1="47" y1="5" x2="44" y2="75" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.8"/>
    <line x1="49" y1="5" x2="48" y2="75" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.8"/>
    <line x1="51" y1="5" x2="52" y2="75" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.8"/>
    <line x1="53" y1="5" x2="56" y2="75" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.8"/>
    
    {/* Chin Rest */}
    <path d="M30 85 Q 35 95 45 92 L 45 88 Q 35 88 30 85" fill="#111" opacity="0.9"/>
  </svg>
);

export const ViolaIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="violaWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#A0522D" />
        <stop offset="50%" stopColor="#D2691E" />
        <stop offset="100%" stopColor="#A0522D" />
      </linearGradient>
    </defs>
    {/* Wider Body */}
    <path d="M50 15 C68 15 75 28 69 40 C65 48 80 58 80 75 C80 92 68 95 50 95 C32 95 20 92 20 75 C20 58 35 48 31 40 C25 28 32 15 50 15 Z" fill="url(#violaWood)" stroke="#5D4037" strokeWidth="1"/>
    {/* Purfling */}
    <path d="M50 17 C66 17 72 29 67 40 C63 48 77 58 77 75 C77 90 66 93 50 93 C34 93 23 90 23 75 C23 58 37 48 33 40 C28 29 34 17 50 17 Z" stroke="#3E2723" strokeWidth="0.5" opacity="0.6"/>

    {/* F-holes */}
    <path d="M34 55 C32 58 32 65 30 70 C29 72 34 72 34 68 C34 65 36 60 34 55" fill="#2F1810"/>
    <circle cx="34" cy="55" r="1.5" fill="#2F1810"/>
    <circle cx="30" cy="70" r="1.5" fill="#2F1810"/>
    
    <path d="M66 55 C68 58 68 65 70 70 C71 72 66 72 66 68 C66 65 64 60 66 55" fill="#2F1810"/>
    <circle cx="66" cy="55" r="1.5" fill="#2F1810"/>
    <circle cx="70" cy="70" r="1.5" fill="#2F1810"/>

    {/* Neck */}
    <rect x="46" y="5" width="8" height="45" rx="1" fill="#1a1a1a"/>
    <path d="M46 5 C44 3 46 1 50 1 C54 1 56 3 54 5" fill="#A0522D"/>

    {/* Tailpiece */}
    <path d="M42 85 L 44 75 L 56 75 L 58 85 C 58 90 42 90 42 85" fill="#1a1a1a"/>
    
    {/* Bridge */}
    <path d="M40 70 L 60 70 L 58 66 L 42 66 Z" fill="#DEB887" stroke="#8B4513" strokeWidth="0.5"/>

    {/* Strings */}
    <line x1="47" y1="5" x2="42" y2="75" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.8"/>
    <line x1="49" y1="5" x2="47" y2="75" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.8"/>
    <line x1="51" y1="5" x2="53" y2="75" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.8"/>
    <line x1="53" y1="5" x2="58" y2="75" stroke="#E0E0E0" strokeWidth="0.5" opacity="0.8"/>
  </svg>
);

export const CelloIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="celloWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#5D4037" />
        <stop offset="50%" stopColor="#8D6E63" />
        <stop offset="100%" stopColor="#5D4037" />
      </linearGradient>
    </defs>
    {/* Endpin */}
    <line x1="50" y1="90" x2="50" y2="100" stroke="#666" strokeWidth="2"/>
    <circle cx="50" cy="100" r="1" fill="#111"/>

    {/* Body */}
    <path d="M50 10 C70 10 78 25 72 35 C68 45 82 55 82 75 C82 90 70 95 50 95 C30 95 18 90 18 75 C18 55 32 45 28 35 C22 25 30 10 50 10 Z" fill="url(#celloWood)" stroke="#3E2723" strokeWidth="1"/>
    
    {/* Fingerboard */}
    <path d="M46 0 L 54 0 L 56 60 L 44 60 Z" fill="#1a1a1a"/>
    
    {/* F-holes */}
    <path d="M32 50 C30 55 30 65 28 70" stroke="#2F1810" strokeWidth="2" fill="none"/>
    <path d="M68 50 C70 55 70 65 72 70" stroke="#2F1810" strokeWidth="2" fill="none"/>

    {/* Tailpiece */}
    <path d="M42 85 L 44 75 L 56 75 L 58 85" fill="#1a1a1a"/>
    <line x1="50" y1="85" x2="50" y2="95" stroke="#111" strokeWidth="2"/>

    {/* Bridge */}
    <path d="M38 72 L 62 72 L 60 68 L 40 68 Z" fill="#DEB887" stroke="#3E2723" strokeWidth="0.5"/>

    {/* Strings */}
    <line x1="47" y1="0" x2="42" y2="75" stroke="#C0C0C0" strokeWidth="0.5"/>
    <line x1="49" y1="0" x2="47" y2="75" stroke="#C0C0C0" strokeWidth="0.5"/>
    <line x1="51" y1="0" x2="53" y2="75" stroke="#C0C0C0" strokeWidth="0.5"/>
    <line x1="53" y1="0" x2="58" y2="75" stroke="#C0C0C0" strokeWidth="0.5"/>
  </svg>
);

export const DoubleBassIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bassWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3E2723" />
        <stop offset="50%" stopColor="#5D4037" />
        <stop offset="100%" stopColor="#3E2723" />
      </linearGradient>
    </defs>
    <line x1="50" y1="90" x2="50" y2="100" stroke="#666" strokeWidth="3"/>
    
    {/* Sloped Body */}
    <path d="M50 10 L 68 25 C 65 35 82 45 82 70 C 82 90 70 95 50 95 C 30 95 18 90 18 70 C 18 45 35 35 32 25 L 50 10 Z" fill="url(#bassWood)" stroke="#2F1810" strokeWidth="1"/>
    
    {/* Fingerboard */}
    <path d="M46 0 L 54 0 L 56 55 L 44 55 Z" fill="#1a1a1a"/>

    {/* F-holes */}
    <path d="M35 50 C33 55 33 65 31 70" stroke="#111" strokeWidth="2" fill="none"/>
    <path d="M65 50 C67 55 67 65 69 70" stroke="#111" strokeWidth="2" fill="none"/>

    {/* Tailpiece */}
    <path d="M40 85 L 42 75 L 58 75 L 60 85" fill="#1a1a1a"/>
    
    {/* Bridge */}
    <path d="M35 70 L 65 70 L 62 65 L 38 65 Z" fill="#DEB887" stroke="#2F1810" strokeWidth="0.5"/>

    {/* Strings */}
    <line x1="47" y1="0" x2="40" y2="75" stroke="#C0C0C0" strokeWidth="0.5"/>
    <line x1="49" y1="0" x2="46" y2="75" stroke="#C0C0C0" strokeWidth="0.5"/>
    <line x1="51" y1="0" x2="54" y2="75" stroke="#C0C0C0" strokeWidth="0.5"/>
    <line x1="53" y1="0" x2="60" y2="75" stroke="#C0C0C0" strokeWidth="0.5"/>
  </svg>
);

export const HarpIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="harpGold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B8860B" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <linearGradient id="harpWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#5D4037" />
        <stop offset="50%" stopColor="#8D6E63" />
        <stop offset="100%" stopColor="#5D4037" />
      </linearGradient>
    </defs>
    
    {/* Soundboard (Bottom/Back) */}
    <path d="M75 20 L 85 20 L 85 95 L 75 95 L 75 20" fill="url(#harpWood)" />
    <path d="M75 95 L 20 95 L 25 85 L 75 85" fill="url(#harpWood)" /> {/* Base */}

    {/* Pillar (Front) */}
    <path d="M25 20 L 35 20 L 30 90 L 20 90 L 25 20" fill="url(#harpGold)" stroke="#B8860B" strokeWidth="0.5"/>
    <rect x="20" y="85" width="15" height="5" fill="#B8860B" /> {/* Pillar Base */}
    <path d="M20 25 L 35 25" stroke="#8B4513" strokeWidth="0.5" opacity="0.5"/> {/* Fluting */}
    <path d="M21 35 L 34 35" stroke="#8B4513" strokeWidth="0.5" opacity="0.5"/>

    {/* Neck (Top) */}
    <path d="M25 20 C 45 10 65 10 80 20 L 80 30 C 65 20 45 20 30 30 L 25 20" fill="url(#harpGold)" stroke="#B8860B" strokeWidth="0.5"/>

    {/* Strings */}
    {[...Array(12)].map((_, i) => {
      const x1 = 35 + (i * 3.5);
      const y1 = 28 - (Math.sin(i * 0.2) * 5); // Curve on neck
      const x2 = 80;
      const y2 = 30 + (i * 5.5);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 7 === 0 ? "#CD5C5C" : (i % 7 === 3 ? "#4682B4" : "#E0E0E0")} strokeWidth="0.5" />
    })}
  </svg>
);

export const FluteIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="silverMetal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E0E0E0" />
        <stop offset="50%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#C0C0C0" />
      </linearGradient>
    </defs>
    {/* Body Joints */}
    <rect x="5" y="45" width="90" height="8" rx="1" fill="url(#silverMetal)" stroke="#9E9E9E" strokeWidth="0.5"/>
    <line x1="25" y1="45" x2="25" y2="53" stroke="#9E9E9E" strokeWidth="0.5"/> {/* Head joint line */}
    <line x1="80" y1="45" x2="80" y2="53" stroke="#9E9E9E" strokeWidth="0.5"/> {/* Foot joint line */}

    {/* Lip Plate */}
    <rect x="15" y="43" width="8" height="12" rx="2" fill="url(#silverMetal)" stroke="#9E9E9E" strokeWidth="0.5"/>
    <ellipse cx="19" cy="49" rx="2" ry="3" fill="#333"/>

    {/* Rod System */}
    <line x1="30" y1="42" x2="75" y2="42" stroke="#C0C0C0" strokeWidth="1"/>

    {/* Keys */}
    {[32, 38, 44, 50, 56, 65, 72, 85].map((cx, i) => (
      <g key={i}>
        <circle cx={cx} cy="49" r="3" fill="url(#silverMetal)" stroke="#9E9E9E" strokeWidth="0.5"/>
        <line x1={cx} y1="46" x2={cx} y2="42" stroke="#C0C0C0" strokeWidth="1"/> {/* Connection to rod */}
      </g>
    ))}
  </svg>
);

export const ClarinetIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="blackWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1a1a1a" />
        <stop offset="40%" stopColor="#333" />
        <stop offset="100%" stopColor="#000" />
      </linearGradient>
    </defs>
    {/* Body */}
    <rect x="46" y="5" width="8" height="75" fill="url(#blackWood)" stroke="#000" strokeWidth="0.5"/>
    
    {/* Bell */}
    <path d="M46 80 L 40 95 L 60 95 L 54 80 Z" fill="url(#blackWood)" stroke="#000" strokeWidth="0.5"/>
    
    {/* Barrel/Mouthpiece */}
    <rect x="45" y="10" width="10" height="2" fill="#C0C0C0"/> {/* Barrel ring */}
    <path d="M46 5 L 47 1 L 53 1 L 54 5 Z" fill="#111"/> {/* Mouthpiece */}
    
    {/* Keys & Rods */}
    <line x1="56" y1="15" x2="56" y2="70" stroke="#C0C0C0" strokeWidth="1"/>
    {[20, 30, 40, 50, 60].map((cy, i) => (
      <g key={i}>
        <circle cx="50" cy={cy} r="2.5" fill="#E0E0E0" stroke="#555" strokeWidth="0.5"/>
        <line x1="52.5" y1={cy} x2="56" y2={cy} stroke="#C0C0C0" strokeWidth="1"/>
      </g>
    ))}
    {/* Side Keys */}
    <rect x="54" y="25" width="4" height="2" fill="#E0E0E0" rx="1"/>
    <rect x="54" y="45" width="4" height="2" fill="#E0E0E0" rx="1"/>
  </svg>
);

export const OboeIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Thinner, conical bore */}
    <path d="M48 10 L 46 80 L 54 80 L 52 10 Z" fill="url(#blackWood)" stroke="#000" strokeWidth="0.5"/>
    
    {/* Bell (smaller flare) */}
    <path d="M46 80 L 44 92 L 56 92 L 54 80 Z" fill="url(#blackWood)" stroke="#000" strokeWidth="0.5"/>
    
    {/* Double Reed */}
    <path d="M49 2 L 50 0 L 51 2 L 50 10 Z" fill="#D2B48C" stroke="#8B4513" strokeWidth="0.5"/>
    
    {/* Complex Keywork */}
    <line x1="55" y1="15" x2="55" y2="75" stroke="#C0C0C0" strokeWidth="0.5"/>
    {[18, 28, 38, 48, 58, 68].map((cy, i) => (
      <circle key={i} cx="50" cy={cy} r="2" fill="#E0E0E0" stroke="#555" strokeWidth="0.5"/>
    ))}
    {/* Plate keys */}
    <circle cx="50" cy="28" r="1" fill="#333" /> {/* Hole in key */}
    <circle cx="50" cy="48" r="1" fill="#333" />
  </svg>
);

export const SaxophoneIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brassGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="40%" stopColor="#F0E68C" />
        <stop offset="60%" stopColor="#DAA520" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
    </defs>
    {/* Main Body Curve */}
    <path d="M35 20 L 35 60 Q 35 90 65 85 L 75 75 L 85 65 L 75 55 L 60 75 Q 45 80 45 60 L 45 20 Z" fill="url(#brassGold)" stroke="#B8860B" strokeWidth="1"/>
    
    {/* Bell Interior */}
    <ellipse cx="80" cy="60" rx="7" ry="5" transform="rotate(-45 80 60)" fill="#333" />
    
    {/* Neck */}
    <path d="M35 20 L 30 10 L 40 15" stroke="#B8860B" strokeWidth="4" fill="none"/>
    <path d="M30 10 L 25 12" fill="#111" stroke="#111" strokeWidth="3"/> {/* Mouthpiece */}

    {/* Keys with Pearl Inlays */}
    {[30, 40, 50, 60].map((cy, i) => (
      <g key={i}>
        <circle cx="40" cy={cy} r="3.5" fill="#DAA520"/>
        <circle cx="40" cy={cy} r="2.5" fill="#FFF8DC"/> {/* Pearl */}
      </g>
    ))}
    <circle cx="55" cy="78" r="3.5" fill="#DAA520"/>
    <circle cx="55" cy="78" r="2.5" fill="#FFF8DC"/>
  </svg>
);

export const BassoonIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bassoonWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3E2723" />
        <stop offset="50%" stopColor="#5D4037" />
        <stop offset="100%" stopColor="#3E2723" />
      </linearGradient>
    </defs>
    {/* Long Joint */}
    <rect x="48" y="5" width="6" height="90" fill="url(#bassoonWood)" stroke="#2F1810" strokeWidth="0.5"/>
    {/* Bell Top */}
    <rect x="47" y="2" width="8" height="3" fill="#111"/> 
    <rect x="47" y="5" width="8" height="15" fill="url(#bassoonWood)" stroke="#2F1810" strokeWidth="0.5"/>

    {/* Wing Joint (thinner, alongside) */}
    <rect x="42" y="25" width="6" height="70" fill="url(#bassoonWood)" stroke="#2F1810" strokeWidth="0.5"/>
    
    {/* Boot Joint (Bottom cap) */}
    <path d="M42 90 L 42 95 Q 48 100 54 95 L 54 90 Z" fill="#C0C0C0"/>

    {/* Bocal (Crook) */}
    <path d="M45 35 Q 35 40 35 50" stroke="#C0C0C0" strokeWidth="1.5" fill="none"/>
    <circle cx="35" cy="50" r="1" fill="#D2B48C"/> {/* Reed */}

    {/* Rods/Keys */}
    <line x1="50" y1="20" x2="50" y2="80" stroke="#C0C0C0" strokeWidth="0.5" strokeDasharray="2 2"/>
  </svg>
);

export const TrumpetIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldBrass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F0E68C" />
        <stop offset="50%" stopColor="#DAA520" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
    </defs>
    {/* Bell Flare */}
    <path d="M10 35 Q 25 40 30 45 L 30 60 Q 25 65 10 70 L 10 35" fill="url(#goldBrass)" stroke="#B8860B" strokeWidth="0.5"/>
    <ellipse cx="10" cy="52.5" rx="3" ry="17.5" fill="#333" opacity="0.8"/> {/* Bell Interior */}

    {/* Main Tube Loop - Thickened */}
    <path d="M30 48 L 75 48 Q 82 48 82 55 L 82 55 Q 82 62 75 62 L 30 62" stroke="url(#goldBrass)" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M30 48 L 75 48 Q 82 48 82 55 L 82 55 Q 82 62 75 62 L 30 62" stroke="#B8860B" strokeWidth="0.5" fill="none"/> {/* Outline */}

    {/* Valve Casing - Adjusted for thicker tube */}
    <rect x="50" y="35" width="16" height="30" fill="url(#goldBrass)" stroke="#B8860B" strokeWidth="0.5"/>
    <line x1="55.3" y1="35" x2="55.3" y2="65" stroke="#B8860B" strokeWidth="0.5"/>
    <line x1="60.6" y1="35" x2="60.6" y2="65" stroke="#B8860B" strokeWidth="0.5"/>

    {/* Valve Buttons */}
    <rect x="51" y="31" width="3" height="4" fill="#C0C0C0"/>
    <rect x="56.3" y="29" width="3" height="6" fill="#C0C0C0"/> {/* Depressed? */}
    <rect x="61.6" y="31" width="3" height="4" fill="#C0C0C0"/>

    {/* Mouthpiece Pipe - Thickened */}
    <path d="M66 52 L 85 52" stroke="url(#goldBrass)" strokeWidth="6"/>
    <path d="M85 52 L 92 52" stroke="#C0C0C0" strokeWidth="6"/> {/* Receiver */}
    <path d="M92 52 L 98 50 L 98 54 L 92 52" fill="#C0C0C0"/> {/* Mouthpiece Cup */}
  </svg>
);

export const FrenchHornIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Complex Coil - Thickened */}
    <circle cx="50" cy="50" r="25" stroke="url(#goldBrass)" strokeWidth="12" fill="none"/>
    <circle cx="50" cy="50" r="25" stroke="#B8860B" strokeWidth="0.5" fill="none"/> {/* Outline */}
    
    <circle cx="50" cy="50" r="16" stroke="url(#goldBrass)" strokeWidth="8" fill="none"/>
    
    {/* Bell */}
    <path d="M25 50 Q 15 50 5 30 L 25 10 Q 35 30 50 25" fill="url(#goldBrass)" stroke="#B8860B" strokeWidth="0.5"/>
    <ellipse cx="15" cy="20" rx="10" ry="15" transform="rotate(-45 15 20)" fill="#333" opacity="0.6"/>

    {/* Valves/Levers */}
    <rect x="45" y="45" width="10" height="10" fill="#C0C0C0"/>
    <circle cx="47" cy="47" r="1" fill="#333"/>
    <circle cx="50" cy="47" r="1" fill="#333"/>
    <circle cx="53" cy="47" r="1" fill="#333"/>

    {/* Mouthpiece pipe - Thickened */}
    <path d="M75 50 L 85 60" stroke="#C0C0C0" strokeWidth="5" fill="none"/>
    <path d="M85 60 L 90 65 L 88 67" fill="#C0C0C0"/>
  </svg>
);

export const TromboneIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Slide (Outer) - Thickened */}
    <path d="M40 45 L 85 45 Q 92 45 92 52 L 92 53 Q 92 60 85 60 L 40 60" stroke="#FFD700" strokeWidth="8" fill="none"/>
    <path d="M40 45 L 85 45 Q 92 45 92 52 L 92 53 Q 92 60 85 60 L 40 60" stroke="#B8860B" strokeWidth="0.5" fill="none"/>
    
    {/* Slide (Inner/Handle) */}
    <line x1="80" y1="45" x2="80" y2="60" stroke="#C0C0C0" strokeWidth="3"/>

    {/* Bell Section - Thickened */}
    <path d="M40 45 L 30 45" stroke="#FFD700" strokeWidth="8"/>
    <path d="M30 45 Q 20 40 10 25 L 10 80 Q 20 65 30 60 L 40 60" fill="url(#goldBrass)" stroke="#B8860B" strokeWidth="0.5"/>
    <ellipse cx="10" cy="52.5" rx="3" ry="27.5" fill="#333" opacity="0.8"/>

    {/* Mouthpiece */}
    <path d="M40 42 L 40 35 L 35 32 L 45 32 L 40 35" fill="#C0C0C0"/> {/* Approximated position */}
  </svg>
);

export const TubaIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Large Body Coils - Massive Thicken */}
    <rect x="25" y="30" width="50" height="60" rx="20" fill="none" stroke="url(#goldBrass)" strokeWidth="14"/>
    <rect x="25" y="30" width="50" height="60" rx="20" fill="none" stroke="#B8860B" strokeWidth="0.5"/>
    
    {/* Inner piping */}
    <path d="M50 30 L 50 90" stroke="url(#goldBrass)" strokeWidth="12"/>
    
    {/* Bell Up top */}
    <path d="M35 30 Q 20 10 5 5 L 95 5 Q 80 10 65 30" fill="url(#goldBrass)" stroke="#B8860B" strokeWidth="0.5"/>
    <ellipse cx="50" cy="5" rx="45" ry="5" fill="#333" opacity="0.8"/>

    {/* Valve Block */}
    <rect x="40" y="55" width="20" height="15" fill="#E0E0E0" stroke="#999" strokeWidth="0.5"/>
    <circle cx="45" cy="62" r="2" fill="#C0C0C0" stroke="#666"/>
    <circle cx="50" cy="62" r="2" fill="#C0C0C0" stroke="#666"/>
    <circle cx="55" cy="62" r="2" fill="#C0C0C0" stroke="#666"/>
    
    {/* Mouthpiece - Thickened */}
    <path d="M65 40 L 80 40 L 85 38" stroke="#C0C0C0" strokeWidth="5" fill="none"/>
  </svg>
);

export const SnareDrumIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shell */}
    <rect x="20" y="40" width="60" height="30" fill="#CD5C5C" stroke="#800000" strokeWidth="1"/>
    
    {/* Top Rim & Head */}
    <ellipse cx="50" cy="40" rx="30" ry="8" fill="#F5F5DC" stroke="#C0C0C0" strokeWidth="2"/>
    <ellipse cx="50" cy="40" rx="28" ry="6" fill="#FFF" opacity="0.5"/> {/* Highlight */}

    {/* Bottom Rim */}
    <path d="M20 70 Q 50 80 80 70" stroke="#C0C0C0" strokeWidth="2" fill="none"/>
    <path d="M20 70 Q 50 80 80 70" stroke="#CD5C5C" strokeWidth="0" fill="#CD5C5C" opacity="0.5"/> {/* Bottom curve fill */}

    {/* Lugs & Tension Rods */}
    {[25, 35, 45, 55, 65, 75].map((x, i) => (
      <line key={i} x1={x} y1={40} x2={x} y2={72} stroke="#C0C0C0" strokeWidth="1"/>
    ))}

    {/* Sticks */}
    <line x1="15" y1="15" x2="45" y2="45" stroke="#DEB887" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="45" cy="45" r="2.5" fill="#DEB887"/>
    <line x1="85" y1="15" x2="55" y2="45" stroke="#DEB887" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="55" cy="45" r="2.5" fill="#DEB887"/>
  </svg>
);

export const BassDrumIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Large Shell (Side View) */}
    <circle cx="50" cy="50" r="40" fill="#FFF8DC" stroke="#8B4513" strokeWidth="1"/>
    <circle cx="50" cy="50" r="35" fill="none" stroke="#E0E0E0" strokeWidth="0.5" strokeDasharray="2 2"/> {/* Texture */}

    {/* Hoops */}
    <circle cx="50" cy="50" r="40" stroke="#8B4513" strokeWidth="4" fill="none"/>
    
    {/* Lugs */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <rect key={i} x="48" y="10" width="4" height="6" fill="#C0C0C0" transform={`rotate(${angle} 50 50)`} />
    ))}

    {/* Mallet */}
    <line x1="85" y1="15" x2="65" y2="35" stroke="#DEB887" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="62" cy="38" r="8" fill="#F0F0F0" stroke="#999" strokeWidth="1"/>
  </svg>
);

export const TimpaniIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="copperBowl" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
        <stop offset="0%" stopColor="#D2691E" />
        <stop offset="100%" stopColor="#8B4513" />
      </radialGradient>
    </defs>
    {/* Bowl */}
    <path d="M15 35 Q 50 95 85 35" fill="url(#copperBowl)" stroke="#8B4513" strokeWidth="1"/>
    
    {/* Head */}
    <ellipse cx="50" cy="35" rx="35" ry="10" fill="#FFF8DC" stroke="#C0C0C0" strokeWidth="2"/>
    <ellipse cx="50" cy="35" rx="30" ry="8" fill="none" stroke="#E0E0E0" strokeWidth="1" opacity="0.5"/>

    {/* Tuning Gauges/Struts */}
    <line x1="20" y1="35" x2="30" y2="80" stroke="#C0C0C0" strokeWidth="1"/>
    <line x1="80" y1="35" x2="70" y2="80" stroke="#C0C0C0" strokeWidth="1"/>
    <line x1="50" y1="35" x2="50" y2="85" stroke="#C0C0C0" strokeWidth="1"/>

    {/* Base/Pedal */}
    <path d="M30 80 L 70 80 L 65 90 L 35 90 Z" fill="#333"/>
    <rect x="45" y="90" width="10" height="5" fill="#111"/> {/* Pedal */}
  </svg>
);

export const XylophoneIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Frame */}
    <path d="M15 20 L 35 90 L 65 90 L 85 20 Z" fill="#5D4037" stroke="#3E2723" strokeWidth="1"/>
    <line x1="35" y1="90" x2="65" y2="90" stroke="#3E2723" strokeWidth="2"/>

    {/* Bars */}
    {[
      {x: 20, h: 65, c: "#DEB887"},
      {x: 30, h: 60, c: "#DEB887"},
      {x: 40, h: 55, c: "#DEB887"},
      {x: 50, h: 50, c: "#DEB887"},
      {x: 60, h: 45, c: "#DEB887"},
      {x: 70, h: 40, c: "#DEB887"}
    ].map((bar, i) => (
      <g key={i} transform={`rotate(-5 ${bar.x + 2.5} 50)`}>
        <rect x={bar.x} y={50 - bar.h/2} width="6" height={bar.h} fill={bar.c} stroke="#8B4513" rx="1"/>
        <circle cx={bar.x + 3} cy={50 - bar.h/2 + 5} r="1" fill="#3E2723" opacity="0.5"/> {/* Bolt */}
        <circle cx={bar.x + 3} cy={50 + bar.h/2 - 5} r="1" fill="#3E2723" opacity="0.5"/> {/* Bolt */}
      </g>
    ))}
  </svg>
);

export const GlockenspielIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Frame */}
    <path d="M15 20 L 35 90 L 65 90 L 85 20 Z" fill="#333" stroke="#111" strokeWidth="1"/>

    {/* Metal Bars */}
    {[
      {x: 20, h: 65},
      {x: 30, h: 60},
      {x: 40, h: 55},
      {x: 50, h: 50},
      {x: 60, h: 45},
      {x: 70, h: 40}
    ].map((bar, i) => (
      <g key={i} transform={`rotate(-5 ${bar.x + 2.5} 50)`}>
        <rect x={bar.x} y={50 - bar.h/2} width="6" height={bar.h} fill="#C0C0C0" stroke="#757575" rx="1"/>
        <rect x={bar.x + 1} y={50 - bar.h/2 + 2} width="4" height={bar.h - 4} fill="#FFF" opacity="0.3"/> {/* Shine */}
        <circle cx={bar.x + 3} cy={50 - bar.h/2 + 5} r="1" fill="#333" opacity="0.5"/>
        <circle cx={bar.x + 3} cy={50 + bar.h/2 - 5} r="1" fill="#333" opacity="0.5"/>
      </g>
    ))}
  </svg>
);

export const TriangleIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Triangle */}
    <path d="M50 15 L 85 80 L 15 80 Z" stroke="#C0C0C0" strokeWidth="6" fill="none" strokeLinejoin="round"/>
    <path d="M50 15 L 85 80 L 15 80 Z" stroke="#999" strokeWidth="1" fill="none" strokeLinejoin="round" opacity="0.5"/> {/* Shadow */}
    
    {/* Opening */}
    <line x1="15" y1="80" x2="25" y2="80" stroke="#FFF" strokeWidth="8"/> {/* Gap */}

    {/* String */}
    <line x1="50" y1="15" x2="50" y2="0" stroke="#333" strokeWidth="1"/>
    
    {/* Beater */}
    <line x1="70" y1="40" x2="40" y2="60" stroke="#C0C0C0" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const TambourineIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Wood Ring */}
    <circle cx="50" cy="50" r="35" stroke="#DEB887" strokeWidth="8" fill="none"/>
    
    {/* Skin */}
    <circle cx="50" cy="50" r="35" fill="#F5F5DC" opacity="0.7"/>
    
    {/* Jingles (Pairs) */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <g key={i} transform={`rotate(${angle} 50 50) translate(0 -35)`}>
        <circle cx="50" cy="0" r="4" fill="#C0C0C0" stroke="#757575" strokeWidth="0.5"/>
        <circle cx="50" cy="0" r="2" fill="#FFF" opacity="0.5"/>
      </g>
    ))}
  </svg>
);
