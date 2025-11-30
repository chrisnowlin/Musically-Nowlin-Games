#!/usr/bin/env node
// Script to download and extract MIDI.js soundfont samples

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM';

// Instruments we need and their target directories
const instruments = [
  { 
    name: 'timpani', 
    dir: 'client/public/audio/percussion/timpani',
    notes: ['C2', 'E2', 'G2']
  },
  { 
    name: 'xylophone', 
    dir: 'client/public/audio/percussion/xylophone',
    notes: ['C5', 'E5', 'G5']
  },
  { 
    name: 'glockenspiel', 
    dir: 'client/public/audio/percussion/glockenspiel',
    notes: ['C6', 'E6', 'G6']
  },
  { 
    name: 'orchestral_harp', 
    dir: 'client/public/audio/strings/harp',
    notes: ['C3', 'E3', 'G3']
  }
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function extractSamples(instrument) {
  console.log(`\nProcessing ${instrument.name}...`);
  
  // Ensure directory exists
  fs.mkdirSync(instrument.dir, { recursive: true });
  
  // Fetch the soundfont JS file
  const url = `${BASE_URL}/${instrument.name}-mp3.js`;
  console.log(`  Downloading from ${url}`);
  
  const jsContent = await fetchUrl(url);
  
  // Extract requested notes using regex
  for (const note of instrument.notes) {
    // Look for "note": "data:audio/mp3;base64,..."
    // The pattern matches the note key and captures the base64 data
    const noteRegex = new RegExp(`"${note}"\\s*:\\s*"data:audio/mp3;base64,([^"]+)"`, 'i');
    const match = jsContent.match(noteRegex);
    
    if (!match) {
      console.log(`  Note ${note} not found in soundfont`);
      continue;
    }
    
    const base64 = match[1];
    const buffer = Buffer.from(base64, 'base64');
    
    // Generate filename matching instrumentLibrary.ts expectations
    let filename;
    const instName = instrument.name.replace('orchestral_', '');
    if (instName === 'timpani') {
      filename = `timpani_${note}_forte_hits_normal.mp3`;
    } else if (instName === 'xylophone') {
      filename = `xylophone_${note}_forte.mp3`;
    } else if (instName === 'glockenspiel') {
      filename = `glockenspiel_${note}_forte.mp3`;
    } else if (instName === 'harp') {
      filename = `harp_${note}_forte.mp3`;
    } else {
      filename = `${instName}_${note}_forte.mp3`;
    }
    
    const filepath = path.join(instrument.dir, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`  Saved ${filepath}`);
  }
}

async function main() {
  console.log('Extracting soundfont samples for missing instruments...');
  
  for (const instrument of instruments) {
    try {
      await extractSamples(instrument);
    } catch (e) {
      console.error(`Error processing ${instrument.name}: ${e.message}`);
    }
  }
  
  console.log('\nDone!');
}

main();
