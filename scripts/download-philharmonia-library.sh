#!/bin/bash

# Download Representative Philharmonia Orchestra Sample Library
# This script downloads a curated set of samples for educational music games

set -e

echo "🎵 Philharmonia Orchestra Sample Downloader"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="client/public/sounds/philharmonia"

# Create directory structure
echo -e "${BLUE}Creating directory structure...${NC}"
mkdir -p "$BASE_DIR"/{strings,woodwinds,brass,percussion,keyboards}
mkdir -p "$BASE_DIR"/strings/{violin,viola,cello,double-bass,harp}
mkdir -p "$BASE_DIR"/woodwinds/{flute,oboe,clarinet,bassoon,saxophone}
mkdir -p "$BASE_DIR"/brass/{trumpet,french-horn,trombone,tuba}
mkdir -p "$BASE_DIR"/percussion/{timpani,bass-drum,snare-drum,cymbals,xylophone,marimba,glockenspiel}
mkdir -p "$BASE_DIR"/keyboards/{piano}

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

echo -e "${YELLOW}Note: This script creates the directory structure.${NC}"
echo -e "${YELLOW}Please download samples manually from:${NC}"
echo -e "${BLUE}https://philharmonia.co.uk/resources/sound-samples/${NC}"
echo ""
echo "Recommended samples for each instrument family:"
echo ""

cat << 'EOF'
┌─────────────────────────────────────────────────────────────────┐
│                    STRINGS FAMILY                                │
├─────────────────────────────────────────────────────────────────┤
│ Violin (client/public/sounds/philharmonia/strings/violin/)     │
│   • violin_C5_1_forte_arco-normal.mp3                          │
│   • violin_D5_1_forte_arco-normal.mp3                          │
│   • violin_E5_1_forte_arco-normal.mp3                          │
│   • violin_G4_1_forte_arco-normal.mp3                          │
│   • violin_A4_1_forte_arco-normal.mp3                          │
│                                                                  │
│ Cello (client/public/sounds/philharmonia/strings/cello/)       │
│   • cello_C3_1_forte_arco-normal.mp3                           │
│   • cello_E3_1_forte_arco-normal.mp3                           │
│   • cello_G3_1_forte_arco-normal.mp3                           │
│   • cello_C4_1_forte_arco-normal.mp3                           │
│                                                                  │
│ Double Bass (client/public/sounds/philharmonia/strings/...)    │
│   • double-bass_E2_forte_arco-normal.mp3                       │
│   • double-bass_G2_forte_arco-normal.mp3                       │
│                                                                  │
│ Harp (client/public/sounds/philharmonia/strings/harp/)         │
│   • harp_C3_forte.mp3                                           │
│   • harp_E3_forte.mp3                                           │
│   • harp_G3_forte.mp3                                           │
├─────────────────────────────────────────────────────────────────┤
│                    WOODWINDS FAMILY                             │
├─────────────────────────────────────────────────────────────────┤
│ Flute (client/public/sounds/philharmonia/woodwinds/flute/)     │
│   • flute_C5_1_forte_normal.mp3                                │
│   • flute_D5_1_forte_normal.mp3                                │
│   • flute_E5_1_forte_normal.mp3                                │
│   • flute_G5_1_forte_normal.mp3                                │
│   • flute_A5_1_forte_normal.mp3                                │
│                                                                  │
│ Clarinet (client/public/sounds/philharmonia/woodwinds/...)     │
│   • clarinet_C4_1_forte_normal.mp3                             │
│   • clarinet_E4_1_forte_normal.mp3                             │
│   • clarinet_G4_1_forte_normal.mp3                             │
│                                                                  │
│ Oboe (client/public/sounds/philharmonia/woodwinds/oboe/)       │
│   • oboe_C4_1_forte_normal.mp3                                 │
│   • oboe_E4_1_forte_normal.mp3                                 │
│   • oboe_G4_1_forte_normal.mp3                                 │
├─────────────────────────────────────────────────────────────────┤
│                     BRASS FAMILY                                │
├─────────────────────────────────────────────────────────────────┤
│ Trumpet (client/public/sounds/philharmonia/brass/trumpet/)     │
│   • trumpet_C4_1_forte_normal.mp3                              │
│   • trumpet_E4_1_forte_normal.mp3                              │
│   • trumpet_G4_1_forte_normal.mp3                              │
│                                                                  │
│ French Horn (client/public/sounds/philharmonia/brass/...)      │
│   • french-horn_C3_forte_normal.mp3                            │
│   • french-horn_E3_forte_normal.mp3                            │
│   • french-horn_G3_forte_normal.mp3                            │
│                                                                  │
│ Trombone (client/public/sounds/philharmonia/brass/trombone/)   │
│   • trombone_C3_forte_normal.mp3                               │
│   • trombone_E3_forte_normal.mp3                               │
├─────────────────────────────────────────────────────────────────┤
│                   PERCUSSION FAMILY                             │
├─────────────────────────────────────────────────────────────────┤
│ Timpani (client/public/sounds/philharmonia/percussion/...)     │
│   • timpani_C2_forte_hits_normal.mp3                           │
│   • timpani_E2_forte_hits_normal.mp3                           │
│   • timpani_G2_forte_hits_normal.mp3                           │
│                                                                  │
│ Bass Drum (client/public/sounds/philharmonia/percussion/...)   │
│   • bass-drum_A0_very-long_forte_normal.mp3                    │
│                                                                  │
│ Snare Drum (client/public/sounds/philharmonia/percussion/...)  │
│   • snare-drum_A1_forte_hits_normal.mp3                        │
│                                                                  │
│ Glockenspiel (client/public/sounds/philharmonia/percussion/...│
│   • glockenspiel_C6_forte.mp3                                  │
│   • glockenspiel_E6_forte.mp3                                  │
│   • glockenspiel_G6_forte.mp3                                  │
│                                                                  │
│ Xylophone (client/public/sounds/philharmonia/percussion/...)   │
│   • xylophone_C5_forte.mp3                                     │
│   • xylophone_E5_forte.mp3                                     │
│   • xylophone_G5_forte.mp3                                     │
└─────────────────────────────────────────────────────────────────┘

Total recommended samples: ~50-60 files (~5-10 MB)

After downloading, your structure should look like:
client/public/sounds/philharmonia/
├── strings/
│   ├── violin/
│   │   ├── violin_C5_1_forte_arco-normal.mp3
│   │   └── ...
│   ├── cello/
│   └── ...
├── woodwinds/
│   ├── flute/
│   ├── clarinet/
│   └── ...
├── brass/
├── percussion/
└── keyboards/

EOF

echo ""
echo -e "${GREEN}✓ Directory structure ready${NC}"
echo -e "${BLUE}→ Visit https://philharmonia.co.uk/resources/sound-samples/ to download${NC}"
echo ""

# Create a checklist file
cat > "$BASE_DIR/DOWNLOAD_CHECKLIST.md" << 'EOF'
# Philharmonia Orchestra Download Checklist

Visit: https://philharmonia.co.uk/resources/sound-samples/

## Strings

### Violin
- [ ] violin_C5_1_forte_arco-normal.mp3
- [ ] violin_D5_1_forte_arco-normal.mp3
- [ ] violin_E5_1_forte_arco-normal.mp3
- [ ] violin_G4_1_forte_arco-normal.mp3
- [ ] violin_A4_1_forte_arco-normal.mp3

### Cello
- [ ] cello_C3_1_forte_arco-normal.mp3
- [ ] cello_E3_1_forte_arco-normal.mp3
- [ ] cello_G3_1_forte_arco-normal.mp3
- [ ] cello_C4_1_forte_arco-normal.mp3

### Harp
- [ ] harp_C3_forte.mp3
- [ ] harp_E3_forte.mp3
- [ ] harp_G3_forte.mp3

## Woodwinds

### Flute
- [ ] flute_C5_1_forte_normal.mp3
- [ ] flute_D5_1_forte_normal.mp3
- [ ] flute_E5_1_forte_normal.mp3
- [ ] flute_G5_1_forte_normal.mp3
- [ ] flute_A5_1_forte_normal.mp3

### Clarinet
- [ ] clarinet_C4_1_forte_normal.mp3
- [ ] clarinet_E4_1_forte_normal.mp3
- [ ] clarinet_G4_1_forte_normal.mp3

### Oboe
- [ ] oboe_C4_1_forte_normal.mp3
- [ ] oboe_E4_1_forte_normal.mp3
- [ ] oboe_G4_1_forte_normal.mp3

## Brass

### Trumpet
- [ ] trumpet_C4_1_forte_normal.mp3
- [ ] trumpet_E4_1_forte_normal.mp3
- [ ] trumpet_G4_1_forte_normal.mp3

### French Horn
- [ ] french-horn_C3_forte_normal.mp3
- [ ] french-horn_E3_forte_normal.mp3
- [ ] french-horn_G3_forte_normal.mp3

## Percussion

### Timpani
- [ ] timpani_C2_forte_hits_normal.mp3
- [ ] timpani_E2_forte_hits_normal.mp3
- [ ] timpani_G2_forte_hits_normal.mp3

### Bass Drum
- [ ] bass-drum_A0_very-long_forte_normal.mp3

### Snare Drum
- [ ] snare-drum_A1_forte_hits_normal.mp3

### Glockenspiel
- [ ] glockenspiel_C6_forte.mp3
- [ ] glockenspiel_E6_forte.mp3
- [ ] glockenspiel_G6_forte.mp3

### Xylophone
- [ ] xylophone_C5_forte.mp3
- [ ] xylophone_E5_forte.mp3
- [ ] xylophone_G5_forte.mp3
EOF

echo -e "${GREEN}✓ Created download checklist: $BASE_DIR/DOWNLOAD_CHECKLIST.md${NC}"
echo ""
echo "Next steps:"
echo "1. Visit Philharmonia Orchestra website"
echo "2. Use the checklist to track your downloads"
echo "3. Place files in the appropriate directories"
echo "4. Run 'npm run dev' to test"
echo ""
