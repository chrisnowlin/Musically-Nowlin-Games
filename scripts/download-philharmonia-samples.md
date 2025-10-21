# Downloading Philharmonia Orchestra Samples

## Step 1: Visit the Philharmonia Website

Go to: https://philharmonia.co.uk/resources/sound-samples/

## Step 2: Select Instruments

For the Animal Orchestra Conductor POC, download these specific samples:

### Percussion (Elephant 🐘)
**Bass Drum:**
1. Navigate to: Percussion > Bass Drum
2. Download: `bass-drum_A0_very-long_forte_normal.mp3`
3. Save to: `client/public/sounds/percussion/bass-drum.mp3`

**Timpani:**
1. Navigate to: Percussion > Timpani
2. Download: `timpani_C2_forte_hits_normal.mp3`
3. Save to: `client/public/sounds/percussion/timpani-c.mp3`

**Snare Drum:**
1. Navigate to: Percussion > Snare Drum
2. Download: `snare-drum_A1_forte_hits_normal.mp3`
3. Save to: `client/public/sounds/percussion/snare-drum.mp3`

### Melody (Bird 🐦)
**Flute:**
1. Navigate to: Woodwind > Flute
2. Download these notes:
   - `flute_C5_1_forte_normal.mp3` → save as `flute-c5.mp3`
   - `flute_D5_1_forte_normal.mp3` → save as `flute-d5.mp3`
   - `flute_E5_1_forte_normal.mp3` → save as `flute-e5.mp3`
3. Save to: `client/public/sounds/melody/`

**Violin (alternative):**
1. Navigate to: Strings > Violin
2. Download:
   - `violin_C5_1_forte_arco-normal.mp3` → save as `violin-c5.mp3`
3. Save to: `client/public/sounds/melody/`

### Harmony (Bear 🐻)
**Cello:**
1. Navigate to: Strings > Cello
2. Download these notes:
   - `cello_C3_1_forte_arco-normal.mp3` → save as `cello-c3.mp3`
   - `cello_E3_1_forte_arco-normal.mp3` → save as `cello-e3.mp3`
   - `cello_G3_1_forte_arco-normal.mp3` → save as `cello-g3.mp3`
3. Save to: `client/public/sounds/harmony/`

## Step 3: Organize Files

Your directory structure should look like:

```
client/public/sounds/
├── percussion/
│   ├── bass-drum.mp3
│   ├── timpani-c.mp3
│   └── snare-drum.mp3
├── melody/
│   ├── flute-c5.mp3
│   ├── flute-d5.mp3
│   ├── flute-e5.mp3
│   └── violin-c5.mp3
└── harmony/
    ├── cello-c3.mp3
    ├── cello-e3.mp3
    └── cello-g3.mp3
```

## Step 4: Test

Once files are in place, restart the dev server:
```bash
npm run dev
```

Navigate to the Animal Orchestra Conductor game and you should hear real orchestra instruments!

## Alternative: Automated Download Script

If you prefer automation, you can use this bash script (requires `curl`):

```bash
#!/bin/bash
# Note: This is a template - you'll need actual URLs from Philharmonia

# Create directories
mkdir -p client/public/sounds/{percussion,melody,harmony}

# Download percussion (replace URLs with actual Philharmonia URLs)
curl -L "URL_TO_BASS_DRUM" -o client/public/sounds/percussion/bass-drum.mp3
curl -L "URL_TO_TIMPANI" -o client/public/sounds/percussion/timpani-c.mp3
curl -L "URL_TO_SNARE" -o client/public/sounds/percussion/snare-drum.mp3

# Download melody
curl -L "URL_TO_FLUTE_C5" -o client/public/sounds/melody/flute-c5.mp3
curl -L "URL_TO_FLUTE_D5" -o client/public/sounds/melody/flute-d5.mp3
curl -L "URL_TO_FLUTE_E5" -o client/public/sounds/melody/flute-e5.mp3

# Download harmony
curl -L "URL_TO_CELLO_C3" -o client/public/sounds/harmony/cello-c3.mp3
curl -L "URL_TO_CELLO_E3" -o client/public/sounds/harmony/cello-e3.mp3
curl -L "URL_TO_CELLO_G3" -o client/public/sounds/harmony/cello-g3.mp3

echo "✅ Samples downloaded!"
```

## Troubleshooting

**Files not loading:**
- Check browser console for 404 errors
- Verify file paths are correct
- Ensure files are in `client/public/sounds/` not `client/src/`

**No sound playing:**
- Check browser console for decoding errors
- Try converting files to different format (MP3, OGG)
- Verify audio context is initialized (click Start button)

**Large file sizes:**
- Consider compressing audio (128kbps MP3 is sufficient)
- Use tools like `ffmpeg` to optimize:
  ```bash
  ffmpeg -i input.mp3 -b:a 128k output.mp3
  ```
