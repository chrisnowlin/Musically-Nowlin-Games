/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');

const SRC_ASSETS = path.join(repoRoot, 'client', 'src', 'assets', 'aoc');
const PUBLIC_AOC = path.join(repoRoot, 'client', 'public', 'aoc');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, 'utf8');
}

function svgBox({ width, height, label, fill = '#0ea5e9', stroke = '#0b1220', extra = '' }) {
  const safeLabel = String(label).replace(/[<>]/g, '');
  // Adding subtle gradients and cleaner strokes
  const gradId = `grad_${Math.random().toString(36).substr(2, 9)}`;
  const baseColor = fill === 'none' ? 'none' : fill;
  
  let defs = '';
  let mainFill = baseColor;

  if (baseColor !== 'none' && !baseColor.startsWith('rgba')) {
    defs = `
    <defs>
      <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${baseColor}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="${baseColor}" stop-opacity="1" />
      </linearGradient>
    </defs>`;
    mainFill = `url(#${gradId})`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  ${defs}
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="12" fill="${mainFill}" stroke="${stroke}" stroke-width="2" />
  
  <!-- Subtle inner border for depth -->
  <rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="8" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2" />

  <!-- Center label with shadow -->
  <text x="${Math.round(width / 2) + 1}" y="${Math.round(height / 2) + 1}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="${Math.max(12, Math.round(Math.min(width, height) * 0.08))}" fill="rgba(0,0,0,0.3)">${safeLabel}</text>
  <text x="${Math.round(width / 2)}" y="${Math.round(height / 2)}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="${Math.max(12, Math.round(Math.min(width, height) * 0.08))}" fill="rgba(255,255,255,0.95)">${safeLabel}</text>
  
  ${extra}
</svg>
`;
}

function writeSvgPlaceholder({ dir, filename, width, height, label, fill }) {
  const out = path.join(dir, filename);
  writeFile(out, svgBox({ width, height, label, fill }));
}

function magick(argv) {
  execFileSync('magick', argv, { stdio: 'inherit' });
}

function generateStageWebp({ filename, w, h, label, colors }) {
  const out = path.join(PUBLIC_AOC, 'stage', filename);
  ensureDir(path.dirname(out));
  // Gradient + subtle noise + label.
  magick([
    '-size',
    `${w}x${h}`,
    `gradient:${colors[0]}-${colors[1]}`,
    '-noise', '3', // Add noise for texture
    '-blur', '0x1', // Soften noise
    '-gravity',
    'center',
    '-font',
    'Helvetica',
    '-pointsize',
    String(Math.max(24, Math.round(Math.min(w, h) * 0.035))),
    '-fill',
    'rgba(255,255,255,0.90)',
    '-annotate',
    '0',
    label,
    out,
  ]);
}

function generateGlowPng({ filename, size, color }) {
  const out = path.join(PUBLIC_AOC, 'overlays', filename);
  ensureDir(path.dirname(out));
  const c = color || '#fde047';
  magick([
    '-size',
    `${size}x${size}`,
    'xc:none',
    '-fill',
    'none',
    '-stroke',
    c,
    '-strokewidth',
    String(Math.max(6, Math.round(size * 0.03))),
    '-draw',
    `circle ${Math.round(size / 2)},${Math.round(size / 2)} ${Math.round(size / 2)},${Math.round(size * 0.15)}`,
    '-blur',
    `0x${Math.max(6, Math.round(size * 0.02))}`,
    out,
  ]);
}

function main() {
  // Directories
  ensureDir(SRC_ASSETS);
  ensureDir(path.join(SRC_ASSETS, 'seating'));
  ensureDir(path.join(SRC_ASSETS, 'characters'));
  ensureDir(path.join(SRC_ASSETS, 'podium'));
  ensureDir(path.join(SRC_ASSETS, 'overlays'));
  ensureDir(path.join(SRC_ASSETS, 'minimap'));
  ensureDir(path.join(SRC_ASSETS, 'modals'));
  ensureDir(path.join(PUBLIC_AOC, 'stage'));
  ensureDir(path.join(PUBLIC_AOC, 'overlays'));

  // Seating kit - improved colors and details
  for (let i = 1; i <= 4; i++) {
    writeSvgPlaceholder({
      dir: path.join(SRC_ASSETS, 'seating'),
      filename: `aoc_seating_row_${i}.svg`,
      width: 600,
      height: 200,
      label: `Row ${i}`,
      fill: 'none',
      stroke: 'rgba(255,255,255,0.1)',
      extra: '<path d="M 50 150 Q 300 50 550 150" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2" stroke-dasharray="10 10" />'
    });
  }

  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'seating'), filename: 'aoc_chair.svg', width: 300, height: 300, label: 'Chair', fill: '#1f2937', stroke: '#374151' });
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'seating'), filename: 'aoc_chair_selected_overlay.svg', width: 300, height: 300, label: 'Selected', fill: 'rgba(59,130,246,0.2)', stroke: '#3b82f6' });
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'seating'), filename: 'aoc_chair_playing_overlay.svg', width: 300, height: 300, label: 'Playing', fill: 'rgba(234,179,8,0.2)', stroke: '#eab308' });
  
  // Music stand with more detail suggestion
  writeSvgPlaceholder({ 
    dir: path.join(SRC_ASSETS, 'seating'), 
    filename: 'aoc_music_stand.svg', 
    width: 300, 
    height: 300, 
    label: 'Stand', 
    fill: '#0f172a',
    stroke: '#334155',
    extra: '<rect x="100" y="100" width="100" height="80" fill="#cbd5e1" opacity="0.1" />' 
  });
  
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'seating'), filename: 'aoc_music_stand_highlight_overlay.svg', width: 300, height: 300, label: 'Highlight', fill: 'rgba(255,255,255,0.1)', stroke: 'rgba(255,255,255,0.3)' });

  // Overlays
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'overlays'), filename: 'aoc_stage_vignette_overlay.svg', width: 1000, height: 600, label: 'Vignette', fill: 'url(#grad_vignette)', stroke: 'none', extra: `<defs><radialGradient id="grad_vignette"><stop offset="50%" stop-color="black" stop-opacity="0"/><stop offset="100%" stop-color="black" stop-opacity="0.6"/></radialGradient></defs><rect x="0" y="0" width="1000" height="600" fill="url(#grad_vignette)" />` });
  
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'overlays'), filename: 'aoc_stage_spotlight_overlay.svg', width: 1000, height: 600, label: 'Spotlights', fill: 'none', stroke: 'none', extra: '<path d="M 200 0 L 100 600 L 300 600 Z" fill="rgba(255,255,255,0.05)" /> <path d="M 800 0 L 700 600 L 900 600 Z" fill="rgba(255,255,255,0.05)" />' });
  
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'overlays'), filename: 'aoc_spotlight_pool.svg', width: 300, height: 200, label: 'Pool', fill: 'rgba(255,255,255,0.15)', stroke: 'none', extra: '<ellipse cx="150" cy="100" rx="140" ry="90" fill="rgba(255,255,255,0.1)" filter="blur(10px)" />' });
  
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'overlays'), filename: 'aoc_disabled_haze_overlay.svg', width: 300, height: 300, label: 'Disabled', fill: 'rgba(15,23,42,0.6)', stroke: 'none' });

  for (let i = 1; i <= 8; i++) {
    writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'overlays'), filename: `aoc_particle_note_${i}.svg`, width: 64, height: 64, label: `♪`, fill: 'none', stroke: 'white', extra: '<text x="32" y="32" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">♪</text>' });
  }

  // Podium
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: 'aoc_podium_base.svg', width: 1200, height: 260, label: 'PodiumBase', fill: '#111827', stroke: '#1f2937' });
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: 'aoc_podium_trim.svg', width: 1200, height: 260, label: 'PodiumTrim', fill: 'rgba(234,179,8,0.22)', stroke: '#eab308' });
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: 'aoc_podium_shadow.svg', width: 1200, height: 260, label: 'PodiumShadow', fill: 'rgba(0,0,0,0.4)', stroke: 'none' });

  // Optional button skins - using distinct colors for states
  const buttonStates = ['idle', 'hover', 'pressed', 'disabled'];
  const btnColors = { idle: '#2563eb', hover: '#3b82f6', pressed: '#1d4ed8', disabled: '#475569' };
  
  for (const st of buttonStates) {
    writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: `aoc_btn_primary_${st}.svg`, width: 320, height: 96, label: `Primary_${st}`, fill: btnColors[st], stroke: '#1e3a8a' });
    writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: `aoc_btn_secondary_${st}.svg`, width: 320, height: 96, label: `Secondary_${st}`, fill: st === 'disabled' ? '#475569' : '#334155', stroke: '#0f172a' });
  }

  // Slider skins
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: 'aoc_slider_track.svg', width: 420, height: 48, label: 'SliderTrack', fill: '#334155', stroke: '#1e293b' });
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: 'aoc_slider_fill.svg', width: 420, height: 48, label: 'SliderFill', fill: '#22c55e', stroke: '#15803d' });
  
  const thumbColors = { idle: '#e2e8f0', hover: '#f1f5f9', active: '#f59e0b' };
  for (const st of ['idle', 'hover', 'active']) {
    writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: `aoc_slider_thumb_${st}.svg`, width: 64, height: 64, label: `Thumb_${st}`, fill: thumbColors[st], stroke: '#64748b' });
  }

  // Score/inspector - improved colors
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: 'aoc_score_panel_bg.svg', width: 900, height: 320, label: 'ScorePanel', fill: '#0f172a', stroke: '#334155' });
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: 'aoc_part_selector_staff.svg', width: 900, height: 140, label: 'PartStaff', fill: '#1e293b', stroke: '#475569' });
  
  const chipColors = { idle: '#1f2937', hover: '#374151', selected: '#22c55e', disabled: '#475569' };
  for (const st of ['idle', 'hover', 'selected', 'disabled']) {
    writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'podium'), filename: `aoc_part_chip_${st}.svg`, width: 120, height: 80, label: `Part_${st}`, fill: chipColors[st], stroke: st === 'selected' ? '#15803d' : '#374151' });
  }

  // Modals
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'modals'), filename: 'aoc_modal_frame.svg', width: 900, height: 600, label: 'ModalFrame', fill: '#0f172a', stroke: '#334155' });
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'modals'), filename: 'aoc_preset_card_bg.svg', width: 800, height: 140, label: 'Preset', fill: '#1e293b', stroke: '#334155', extra: '<rect x="10" y="10" width="60" height="120" rx="8" fill="#334155" />' });
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'modals'), filename: 'aoc_tip_frame.svg', width: 800, height: 420, label: 'TipFrame', fill: '#0f172a', stroke: '#3b82f6', extra: '<path d="M 0 0 L 50 0 L 0 50 Z" fill="#3b82f6" /> <path d="M 800 420 L 750 420 L 800 370 Z" fill="#3b82f6" />' });

  // Minimap
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'minimap'), filename: 'aoc_minimap_stage_outline.svg', width: 320, height: 220, label: 'MinimapStage', fill: '#0f172a', stroke: '#334155' });
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'minimap'), filename: 'aoc_minimap_seat_dot_idle.svg', width: 40, height: 40, label: '', fill: '#94a3b8', stroke: 'none' }); // No label for dots
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'minimap'), filename: 'aoc_minimap_seat_dot_playing.svg', width: 40, height: 40, label: '', fill: '#facc15', stroke: '#eab308' });
  writeSvgPlaceholder({ dir: path.join(SRC_ASSETS, 'minimap'), filename: 'aoc_minimap_seat_dot_selected.svg', width: 40, height: 40, label: '', fill: '#60a5fa', stroke: '#2563eb' });

  // Characters (18-seat roster) with icons
  const characterFiles = [
    { name: 'aoc_character_violin.svg', icon: '🎻' },
    { name: 'aoc_character_violin_alt.svg', icon: '🎻' },
    { name: 'aoc_character_viola.svg', icon: '🎻' },
    { name: 'aoc_character_cello.svg', icon: '🎻' },
    { name: 'aoc_character_double_bass.svg', icon: '🎻' },
    { name: 'aoc_character_flute.svg', icon: '🪈' },
    { name: 'aoc_character_oboe.svg', icon: '🪈' },
    { name: 'aoc_character_clarinet.svg', icon: '🪈' },
    { name: 'aoc_character_bassoon.svg', icon: '🪈' },
    { name: 'aoc_character_trumpet.svg', icon: '🎺' },
    { name: 'aoc_character_french_horn.svg', icon: '📯' },
    { name: 'aoc_character_trombone.svg', icon: '🎺' },
    { name: 'aoc_character_tuba.svg', icon: '🎺' },
    { name: 'aoc_character_timpani.svg', icon: '🥁' },
    { name: 'aoc_character_snare.svg', icon: '🥁' },
    { name: 'aoc_character_bass_drum.svg', icon: '🥁' },
    { name: 'aoc_character_glockenspiel.svg', icon: '✨' },
    { name: 'aoc_character_xylophone.svg', icon: '✨' },
  ];

  for (const { name, icon } of characterFiles) {
    const label = name.replace(/^aoc_character_/, '').replace(/\.svg$/, '');
    const extra = `<text x="150" y="320" text-anchor="middle" font-size="100">${icon}</text>`;
    writeSvgPlaceholder({ 
      dir: path.join(SRC_ASSETS, 'characters'), 
      filename: name, 
      width: 300, 
      height: 400, 
      label: label, 
      fill: '#1e3a8a',
      extra 
    });
  }

  // Raster placeholders required by manifest
  const stageSizes = [
    { w: 1920, h: 1080 },
    { w: 2560, h: 1440 },
    { w: 1366, h: 1024 },
    { w: 1170, h: 2532 },
  ];

  for (const { w, h } of stageSizes) {
    generateStageWebp({
      filename: `aoc_stage_backwall_${w}x${h}.webp`,
      w,
      h,
      label: `AOC Stage Backwall ${w}x${h}`,
      colors: ['#0f172a', '#1f2937'],
    });

    generateStageWebp({
      filename: `aoc_stage_floor_${w}x${h}.webp`,
      w,
      h,
      label: `AOC Stage Floor ${w}x${h}`,
      colors: ['#3f2d20', '#1f120b'],
    });
  }

  generateGlowPng({ filename: 'aoc_glow_ring_sm.png', size: 256, color: '#fde047' });
  generateGlowPng({ filename: 'aoc_glow_ring_md.png', size: 512, color: '#fde047' });
  generateGlowPng({ filename: 'aoc_glow_ring_lg.png', size: 1024, color: '#fde047' });

  console.log('AOC placeholder assets generated.');
}

main();

