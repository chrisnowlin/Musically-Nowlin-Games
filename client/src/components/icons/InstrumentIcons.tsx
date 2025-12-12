import React from 'react';

interface InstrumentIconProps {
  className?: string;
}

// PNG Image Icons (All instruments now use PNG format)

export const ViolinIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/violin.png`}
      alt="Violin"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const TambourineIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/tambourine.png`}
      alt="Tambourine"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const FrenchHornIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/french-horn.png`}
      alt="French Horn"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const CowbellIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/cowbell.png`}
      alt="Cowbell"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const TubaIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/tuba.png`}
      alt="Tuba"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const CastanetsIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/castanets.png`}
      alt="Castanets"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const ClarinetIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/clarinet.png`}
      alt="Clarinet"
      style={{ objectFit: 'contain', width: '150%', height: '150%', maxWidth: 'none' }}
    />
  </div>
);

export const BassoonIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/bassoon.png`}
      alt="Bassoon"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const TimpaniIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/timpani.png`}
      alt="Timpani"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const WoodblockIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/woodblock.png`}
      alt="Woodblock"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const BassDrumIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/bass-drum.png`}
      alt="Bass Drum"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const TrumpetIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/trumpet.png`}
      alt="Trumpet"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const SaxophoneIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/saxophone.png`}
      alt="Saxophone"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const ViolaIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/viola.png`}
      alt="Viola"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const CelloIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/cello.png`}
      alt="Cello"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const DoubleBassIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/double-bass.png`}
      alt="Double Bass"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const HarpIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/harp.png`}
      alt="Harp"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const FluteIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/flute.png`}
      alt="Flute"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const OboeIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/oboe.png`}
      alt="Oboe"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const TromboneIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/trombone.png`}
      alt="Trombone"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const SnareDrumIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/snare-drum.png`}
      alt="Snare Drum"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const TriangleIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/triangle.png`}
      alt="Triangle"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const SleighBellsIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/sleigh-bells.png`}
      alt="Sleigh Bells"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const CymbalsIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/cymbals.png`}
      alt="Cymbals"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const WindChimesIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/wind-chimes.png`}
      alt="Wind Chimes"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const XylophoneIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/xylophone.png`}
      alt="Xylophone"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

export const GlockenspielIcon: React.FC<InstrumentIconProps> = ({ className }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img 
      src={`${import.meta.env.BASE_URL}images/glockenspiel.png`}
      alt="Glockenspiel"
      style={{ objectFit: 'contain', width: '180%', height: '180%', maxWidth: 'none' }}
    />
  </div>
);

