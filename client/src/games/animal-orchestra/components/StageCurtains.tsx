export default function StageCurtains() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Curtain fabric gradient */}
        <linearGradient id="curtainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B0000" />
          <stop offset="15%" stopColor="#DC143C" />
          <stop offset="30%" stopColor="#8B0000" />
          <stop offset="45%" stopColor="#DC143C" />
          <stop offset="60%" stopColor="#8B0000" />
          <stop offset="75%" stopColor="#DC143C" />
          <stop offset="100%" stopColor="#8B0000" />
        </linearGradient>

        {/* Gold trim gradient */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        {/* Stage floor gradient */}
        <linearGradient id="stageFloor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#5D3A1A" />
        </linearGradient>

        {/* Background gradient */}
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#16213e" />
        </linearGradient>

        {/* Curtain fold pattern for left curtain */}
        <linearGradient id="leftCurtainFolds" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6B0000" />
          <stop offset="20%" stopColor="#B22222" />
          <stop offset="40%" stopColor="#6B0000" />
          <stop offset="60%" stopColor="#B22222" />
          <stop offset="80%" stopColor="#6B0000" />
          <stop offset="100%" stopColor="#4A0000" />
        </linearGradient>

        {/* Curtain fold pattern for right curtain */}
        <linearGradient id="rightCurtainFolds" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4A0000" />
          <stop offset="20%" stopColor="#6B0000" />
          <stop offset="40%" stopColor="#B22222" />
          <stop offset="60%" stopColor="#6B0000" />
          <stop offset="80%" stopColor="#B22222" />
          <stop offset="100%" stopColor="#6B0000" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="800" height="600" fill="url(#bgGradient)" />

      {/* Stage back wall */}
      <rect x="50" y="80" width="700" height="420" fill="#0f0f23" rx="5" />

      {/* Stage floor */}
      <path
        d="M 0 500 L 50 450 L 750 450 L 800 500 L 800 600 L 0 600 Z"
        fill="url(#stageFloor)"
      />

      {/* Floor boards lines */}
      <g stroke="#4A2810" strokeWidth="1" opacity="0.5">
        <line x1="100" y1="500" x2="150" y2="450" />
        <line x1="200" y1="500" x2="250" y2="450" />
        <line x1="300" y1="500" x2="350" y2="450" />
        <line x1="400" y1="500" x2="400" y2="450" />
        <line x1="500" y1="500" x2="450" y2="450" />
        <line x1="600" y1="500" x2="550" y2="450" />
        <line x1="700" y1="500" x2="650" y2="450" />
      </g>

      {/* Left curtain */}
      <path
        d="M 0 0 L 0 520 Q 30 510 60 520 Q 90 530 120 515 Q 140 505 150 520 L 150 0 Z"
        fill="url(#leftCurtainFolds)"
      />

      {/* Right curtain */}
      <path
        d="M 800 0 L 800 520 Q 770 510 740 520 Q 710 530 680 515 Q 660 505 650 520 L 650 0 Z"
        fill="url(#rightCurtainFolds)"
      />

      {/* Top valance/pelmet */}
      <path
        d="M 0 0 L 0 100 Q 100 130 200 100 Q 300 70 400 100 Q 500 130 600 100 Q 700 70 800 100 L 800 0 Z"
        fill="url(#curtainGradient)"
      />

      {/* Gold trim on valance */}
      <path
        d="M 0 95 Q 100 125 200 95 Q 300 65 400 95 Q 500 125 600 95 Q 700 65 800 95"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="8"
      />

      {/* Gold fringe dots */}
      <g fill="#DAA520">
        {[...Array(20)].map((_, i) => (
          <circle
            key={i}
            cx={40 + i * 38}
            cy={105 + Math.sin(i * 0.8) * 15}
            r="4"
          />
        ))}
      </g>

      {/* Gold tassels on sides */}
      <g fill="url(#goldGradient)">
        {/* Left tassel */}
        <ellipse cx="140" cy="130" rx="8" ry="12" />
        <rect x="136" y="130" width="8" height="25" />
        <ellipse cx="140" cy="160" rx="10" ry="6" />

        {/* Right tassel */}
        <ellipse cx="660" cy="130" rx="8" ry="12" />
        <rect x="656" y="130" width="8" height="25" />
        <ellipse cx="660" cy="160" rx="10" ry="6" />
      </g>

      {/* Spotlight glow effect */}
      <ellipse
        cx="400"
        cy="400"
        rx="200"
        ry="80"
        fill="rgba(255, 255, 200, 0.1)"
      />
    </svg>
  );
}

