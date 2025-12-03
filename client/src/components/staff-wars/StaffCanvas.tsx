import React, { useEffect, useRef, forwardRef, useState } from 'react';
import { Clef, GameConfig } from '../StaffWarsGame';
import { initializeStaff, renderNote, getNotePosition, StaffData } from '@/lib/notation/vexflowUtils';

interface StaffCanvasProps {
  config: GameConfig;
  currentNote: string | null;
  onNoteSpawned: (note: string) => void;
  onNoteTimeout: () => void;
  speed: number;
  isPaused: boolean;
  feedback: 'correct' | 'incorrect' | null;
  correctAnswerDisplay: string | null;
  gameLoopRef: React.MutableRefObject<number | null>;
}

interface MovingNote {
  name: string;
  x: number;
  spawnTime: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface LaserBeam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  duration: number;
}

function drawCorrectAnswerDisplay(ctx: CanvasRenderingContext2D, spaceshipX: number, spaceshipY: number, noteName: string, currentTime: number) {
  ctx.save();
  
  // Fixed position above the spaceship - consistent location for student feedback
  const displayX = spaceshipX;
  const displayY = spaceshipY - 100; // Position well above the spaceship
  
  // Animated glow effect
  const pulse = (Math.sin(currentTime * 0.008) + 1) / 2;
  const glowSize = 35 + pulse * 15;
  
  // Draw glowing background circle
  const gradient = ctx.createRadialGradient(displayX, displayY, 0, displayX, displayY, glowSize);
  gradient.addColorStop(0, 'rgba(6, 182, 212, 0.9)'); // Cyan-500
  gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.5)');
  gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(displayX, displayY, glowSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw outer ring
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.9)';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(displayX, displayY, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Draw "CORRECT ANSWER" label above
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#06b6d4';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 10;
  ctx.fillText('CORRECT ANSWER', displayX, displayY - 55);
  
  // Draw note name text (larger for visibility)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 20;
  ctx.fillText(noteName, displayX, displayY);
  
  // Draw arrow pointing down toward spaceship
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(displayX, displayY + 45);
  ctx.lineTo(displayX - 10, displayY + 55);
  ctx.lineTo(displayX - 4, displayY + 55);
  ctx.lineTo(displayX - 4, displayY + 70);
  ctx.lineTo(displayX + 4, displayY + 70);
  ctx.lineTo(displayX + 4, displayY + 55);
  ctx.lineTo(displayX + 10, displayY + 55);
  ctx.closePath();
  ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 10;
  ctx.fill();
  
  ctx.restore();
}

function drawSpaceStation(ctx: CanvasRenderingContext2D, x: number, y: number, clef: Clef, time: number) {
  ctx.save();
  
  const stationX = x + 50;
  const stationY = y + 44; // Center of staff

  // --- Force Field Emitter (Base) ---
  // Draw this first so it's behind the station
  ctx.save();
  const emitterGlow = (Math.sin(time * 0.003) + 1) / 2;
  ctx.fillStyle = `rgba(59, 130, 246, ${0.1 + emitterGlow * 0.1})`; // Faint blue
  ctx.beginPath();
  ctx.ellipse(stationX + 70, stationY, 10, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Rotating Radar Dish (Background) ---
  ctx.save();
  ctx.translate(stationX - 35, stationY - 65);
  // Slower rotation for radar
  ctx.rotate(time * 0.0005); 
  
  // Dish structure
  ctx.fillStyle = '#334155'; // Slate-700
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b'; // Slate-500
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Antenna spike
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -12);
  ctx.stroke();
  
  // Red tip light
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(0, -12, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Solar Panels (Photovoltaic Arrays) ---
  // Function to draw a detailed panel
  const drawPanel = (offsetX: number, offsetY: number, rotation: number) => {
    ctx.save();
    ctx.translate(stationX + offsetX, stationY + offsetY);
    ctx.rotate(rotation);
    
    // Panel frame
    ctx.fillStyle = '#1e293b'; // Slate-800
    ctx.strokeStyle = '#475569'; // Slate-600
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-25, -40, 50, 40);
    ctx.fill();
    ctx.stroke();
    
    // Photovoltaic cells (Gradient)
    const cellGrad = ctx.createLinearGradient(-20, -38, 20, -2);
    cellGrad.addColorStop(0, '#1e3a8a'); // Dark Blue
    cellGrad.addColorStop(0.5, '#3b82f6'); // Blue-500
    cellGrad.addColorStop(1, '#1e3a8a'); // Dark Blue
    
    ctx.fillStyle = cellGrad;
    ctx.beginPath();
    ctx.rect(-22, -38, 44, 36);
    ctx.fill();
    
    // Grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Vertical lines
    for (let i = -10; i <= 10; i += 10) {
      ctx.moveTo(i, -38); ctx.lineTo(i, -2);
    }
    // Horizontal lines
    for (let i = -26; i <= -14; i += 12) {
      ctx.moveTo(-22, i); ctx.lineTo(22, i);
    }
    ctx.stroke();
    
    ctx.restore();
  };

  // Draw rotated panels
  drawPanel(0, -80, 0);
  drawPanel(0, 120, 0); // Bottom panel (offset by height)

  // --- Connecting Struts ---
  ctx.fillStyle = '#475569'; // Slate-600
  // Vertical strut
  ctx.beginPath();
  ctx.rect(stationX - 8, stationY - 90, 16, 180);
  ctx.fill();
  
  // Metallic shading on strut
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(stationX - 4, stationY - 90, 4, 180);

  // --- Main Hub (Spherical Core) ---
  // 3D Sphere Effect
  const sphereGrad = ctx.createRadialGradient(
    stationX - 15, stationY - 15, 5,  // Highlight offset
    stationX, stationY, 55            // Outer radius
  );
  sphereGrad.addColorStop(0, '#64748b'); // Highlight (Slate-500)
  sphereGrad.addColorStop(0.3, '#334155'); // Midtone (Slate-700)
  sphereGrad.addColorStop(1, '#0f172a'); // Shadow (Slate-900)

  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(stationX, stationY, 50, 0, Math.PI * 2);
  ctx.fill();
  
  // Rim/Edge Light
  ctx.strokeStyle = '#475569'; // Slate-600
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- Equatorial Ring (Docking/Observation) ---
  ctx.save();
  ctx.translate(stationX, stationY);
  ctx.rotate(-Math.PI / 12); // Slight tilt
  
  // Back part of ring
  ctx.beginPath();
  ctx.ellipse(0, 0, 60, 15, 0, Math.PI, 0); // Bottom half roughly
  ctx.fillStyle = '#1e293b';
  ctx.fill();
  
  // Front part of ring (Tech glowing)
  ctx.beginPath();
  ctx.ellipse(0, 0, 60, 15, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#0ea5e9'; // Sky-500
  ctx.lineWidth = 3;
  ctx.shadowColor = '#0ea5e9';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Windows on ring
  ctx.fillStyle = '#e0f2fe'; // Sky-100 (Lights)
  for(let i = -50; i <= 50; i+=20) {
     if (Math.abs(i) > 55) continue;
     ctx.beginPath();
     ctx.rect(i, -2, 8, 4);
     ctx.fill();
  }
  ctx.restore();

  // --- Pulsing Beacon Lights ---
  const pulse = (Math.sin(time * 0.005) + 1) / 2; // 0 to 1
  
  // Top Antenna Beacon
  ctx.fillStyle = `rgba(239, 68, 68, ${0.6 + pulse * 0.4})`; 
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 15 * pulse;
  ctx.beginPath();
  ctx.arc(stationX, stationY - 125, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Bottom Antenna Beacon
  ctx.beginPath();
  ctx.arc(stationX, stationY + 125, 4, 0, Math.PI * 2);
  ctx.fill();

  // --- Clef Symbol Hologram ---
  ctx.save();
  // Hologram visual effects (faint scanlines, blue tint)
  ctx.fillStyle = 'rgba(224, 242, 254, 0.9)'; // Sky-100
  ctx.shadowColor = '#38bdf8'; // Sky-400
  ctx.shadowBlur = 20;
  ctx.font = '140px Arial'; // Increased size for better staff alignment
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const clefSymbol = clef === 'treble' ? '𝄞' : clef === 'bass' ? '𝄢' : '𝄡';
  const clefYOffset = clef === 'treble' ? 20 : clef === 'bass' ? 0 : 5; 
  
  ctx.fillText(clefSymbol, stationX, stationY + clefYOffset);
  
  // Scanline overlay for hologram
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
  for(let i = stationY - 50; i < stationY + 50; i += 4) {
    ctx.fillRect(stationX - 30, i, 60, 2);
  }
  ctx.restore();

  ctx.restore();
}

function drawStaffLines(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, clef: Clef, time: number) {
  // Draw Danger Zone (Force Field Area)
  const dangerZoneWidth = 150;
  const gradient = ctx.createLinearGradient(x, 0, x + dangerZoneWidth, 0);
  gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)'); // Very faint red
  gradient.addColorStop(0.8, 'rgba(239, 68, 68, 0.05)');
  gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');   

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y - 20, dangerZoneWidth, 130); // Cover staff height + padding

  // Force Field Pattern (Hexagon-ish interference)
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y - 20, dangerZoneWidth, 130);
  ctx.clip();
  
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.1)';
  ctx.lineWidth = 1;
  const hexSize = 30;
  const offset = (time * 0.02) % hexSize;
  
  for (let hx = x; hx < x + dangerZoneWidth; hx += hexSize) {
    for (let hy = y - 20 - offset; hy < y + 150; hy += hexSize) {
       ctx.beginPath();
       ctx.moveTo(hx, hy);
       ctx.lineTo(hx + hexSize, hy + hexSize);
       ctx.stroke();
    }
  }
  ctx.restore();

  // Draw Danger Line (Holographic barrier)
  // Multiple lines for energy effect
  const barrierX = x + 120;
  const barrierYTop = y - 30;
  const barrierYBot = y + 120;
  
  // Inner core
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(barrierX, barrierYTop);
  ctx.lineTo(barrierX, barrierYBot);
  ctx.stroke();
  
  // Outer glow
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(barrierX, barrierYTop);
  ctx.lineTo(barrierX, barrierYBot);
  ctx.stroke();
  
  // Animated Scan line on barrier
  const scanY = (time * 0.08) % 150;
  ctx.strokeStyle = '#fca5a5'; // Red-300 (Bright)
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(barrierX - 10, y - 30 + scanY);
  ctx.lineTo(barrierX + 10, y - 30 + scanY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw Staff Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // Slightly more transparent
  ctx.lineWidth = 1;
  const lineSpacing = 22;
  for (let i = 0; i < 5; i++) {
    const lineY = y + i * lineSpacing;
    ctx.beginPath();
    ctx.moveTo(x, lineY);
    ctx.lineTo(x + width, lineY);
    ctx.stroke();
  }

  // Render the complex space station
  drawSpaceStation(ctx, x, y, clef, time);
}

function drawSpaceship(ctx: CanvasRenderingContext2D, x: number, y: number, flash: boolean = false) {
  ctx.save();

  // Flash effect for incorrect answers
  if (flash) {
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 30;
  } else {
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
  }

  // Colors
  const bodyColor = flash ? '#ef4444' : '#e2e8f0'; // Slate-200
  const darkBodyColor = flash ? '#b91c1c' : '#64748b'; // Slate-500
  const accentColor = flash ? '#dc2626' : '#3b82f6'; // Blue-500
  const cockpitColor = flash ? '#fecaca' : '#0ea5e9'; // Sky-500
  const engineColor = flash ? '#fecaca' : '#f59e0b'; // Amber-500

  // Wings (Back layer)
  ctx.fillStyle = darkBodyColor;
  ctx.beginPath();
  // Left Wing Tip
  ctx.moveTo(x - 8, y + 5);
  ctx.lineTo(x - 35, y + 25);
  ctx.lineTo(x - 8, y + 15);
  // Right Wing Tip
  ctx.moveTo(x + 8, y + 5);
  ctx.lineTo(x + 35, y + 25);
  ctx.lineTo(x + 8, y + 15);
  ctx.fill();

  // Main Wings
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  // Left Wing
  ctx.moveTo(x - 5, y - 10);
  ctx.lineTo(x - 30, y + 20);
  ctx.lineTo(x - 5, y + 10);
  // Right Wing
  ctx.moveTo(x + 5, y - 10);
  ctx.lineTo(x + 30, y + 20);
  ctx.lineTo(x + 5, y + 10);
  ctx.fill();

  // Accent stripes on wings
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(x - 15, y + 5);
  ctx.lineTo(x - 25, y + 17);
  ctx.lineTo(x - 18, y + 10);
  ctx.moveTo(x + 15, y + 5);
  ctx.lineTo(x + 25, y + 17);
  ctx.lineTo(x + 18, y + 10);
  ctx.fill();

  // Main Fuselage
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - 45); // Nose
  ctx.bezierCurveTo(x - 8, y - 10, x - 10, y + 10, x - 8, y + 20); // Left side
  ctx.lineTo(x + 8, y + 20); // Bottom
  ctx.bezierCurveTo(x + 10, y + 10, x + 8, y - 10, x, y - 45); // Right side
  ctx.fill();

  // Fuselage Detail (Central ridge)
  ctx.fillStyle = darkBodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - 40);
  ctx.lineTo(x - 2, y + 15);
  ctx.lineTo(x + 2, y + 15);
  ctx.fill();

  // Cockpit
  ctx.fillStyle = cockpitColor;
  ctx.beginPath();
  ctx.ellipse(x, y - 15, 3, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit Glint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.ellipse(x - 1, y - 17, 1, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Engine Thrusters
  ctx.fillStyle = '#334155'; // Slate-700
  ctx.beginPath();
  ctx.rect(x - 6, y + 18, 4, 4);
  ctx.rect(x + 2, y + 18, 4, 4);
  ctx.fill();

  // Engine Glow (Animated with random fluctuation)
  ctx.fillStyle = engineColor;
  ctx.shadowColor = engineColor;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  const flicker = Math.random() * 5;
  // Left Engine Flame
  ctx.moveTo(x - 6, y + 22);
  ctx.lineTo(x - 4, y + 35 + flicker);
  ctx.lineTo(x - 2, y + 22);
  // Right Engine Flame
  ctx.moveTo(x + 2, y + 22);
  ctx.lineTo(x + 4, y + 35 + flicker);
  ctx.lineTo(x + 6, y + 22);
  ctx.fill();

  ctx.restore();
}

function drawLaser(ctx: CanvasRenderingContext2D, laser: LaserBeam, currentTime: number) {
  const elapsed = currentTime - laser.startTime;
  const progress = Math.min(elapsed / laser.duration, 1);

  if (progress >= 1) return;

  ctx.save();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(laser.startX, laser.startY);
  ctx.lineTo(
    laser.startX + (laser.endX - laser.startX) * progress,
    laser.startY + (laser.endY - laser.startY) * progress
  );
  ctx.stroke();

  ctx.restore();
}

function drawExplosion(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(particle => {
    const alpha = particle.life / particle.maxLife;
    ctx.save();
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawStarfield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stars: Array<{x: number, y: number, size: number, brightness: number, twinkleSpeed: number, twinklePhase: number}>,
  currentTime: number,
  staffY?: number
) {
  // Define staff exclusion zone (roughly 150px height centered on staffY)
  // Standard staff is drawn starting at staffY with 88px height (4 * 22px spacing)
  // We'll add some padding above and below
  const staffTop = staffY ? staffY - 20 : -1;
  const staffBottom = staffY ? staffY + 110 : -1;

  stars.forEach(star => {
    // Skip stars that are behind the staff area to avoid distraction
    if (staffY && star.y >= staffTop && star.y <= staffBottom) {
      return;
    }

    // Calculate twinkling brightness using sine wave mapped to 0-1 range
    // This allows stars to fade completely to black
    const sine = Math.sin((currentTime * star.twinkleSpeed) + star.twinklePhase);
    const normalizedSine = (sine + 1) / 2; // 0 to 1
    
    // Apply cubic easing to make them stay dim/bright longer (more natural sparkle)
    const easedAlpha = normalizedSine * normalizedSine * normalizedSine;
    
    const currentBrightness = easedAlpha * star.brightness;
    
    if (currentBrightness < 0.01) return; // Skip invisible stars

    ctx.fillStyle = `rgba(255, 255, 255, ${currentBrightness})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

const StaffCanvas = forwardRef<HTMLCanvasElement, StaffCanvasProps>(
  (
    {
      config,
      currentNote,
      onNoteSpawned,
      onNoteTimeout,
      speed,
      isPaused,
      feedback,
      correctAnswerDisplay,
      gameLoopRef,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const movingNoteRef = useRef<MovingNote | null>(null);
    const lastNoteRef = useRef<string | null>(null);
    const gameStateRef = useRef({
      lastSpawnTime: 0,
      spawnInterval: 2000, // ms between note spawns
      lastFrameTime: 0,
    });
    const staffDataRef = useRef<StaffData | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const laserRef = useRef<LaserBeam | null>(null);
    const spaceshipFlashRef = useRef<number>(0);
    const starsRef = useRef<Array<{x: number, y: number, size: number, brightness: number, twinkleSpeed: number, twinklePhase: number}>>([]);
    const lastFeedbackRef = useRef<'correct' | 'incorrect' | null>(null);
    const feedbackRef = useRef<'correct' | 'incorrect' | null>(null);
    const lastNotePositionRef = useRef<{ x: number; y: number } | null>(null);
    const onNoteSpawnedRef = useRef(onNoteSpawned);
    const onNoteTimeoutRef = useRef(onNoteTimeout);

    // Update callback refs when props change
    useEffect(() => {
      onNoteSpawnedRef.current = onNoteSpawned;
      onNoteTimeoutRef.current = onNoteTimeout;
    }, [onNoteSpawned, onNoteTimeout]);

    // Generate note range based on config
    const getNoteRange = (): string[] => {
      const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const allNotes: string[] = [];

      // Parse min and max notes
      const minNoteName = config.minNote.charAt(0);
      const minOctave = parseInt(config.minNote.charAt(1));
      const maxNoteName = config.maxNote.charAt(0);
      const maxOctave = parseInt(config.maxNote.charAt(1));

      // Generate all notes in range
      for (let octave = minOctave; octave <= maxOctave; octave++) {
        for (const noteName of noteNames) {
          const note = `${noteName}${octave}`;

          // Check if note is within range
          const noteIndex = noteNames.indexOf(noteName);
          const minIndex = noteNames.indexOf(minNoteName);
          const maxIndex = noteNames.indexOf(maxNoteName);

          if (octave === minOctave && noteIndex < minIndex) continue;
          if (octave === maxOctave && noteIndex > maxIndex) continue;

          allNotes.push(note);
        }
      }

      return allNotes;
    };

    const generateNote = (): string => {
      const range = getNoteRange();
      let note: string;
      let attempts = 0;
      do {
        note = range[Math.floor(Math.random() * range.length)];
        attempts++;
      } while (note === lastNoteRef.current && attempts < 10);
      lastNoteRef.current = note;
      return note;
    };

    // Clear the moving note when currentNote becomes null (note was answered)
    // Clear immediately to allow new note spawning, but store position for feedback
    useEffect(() => {
      if (currentNote === null && movingNoteRef.current) {
        // Store the current position for feedback effects before clearing
        if (staffDataRef.current && canvasRef.current) {
          const noteX = movingNoteRef.current.x;
          const noteY = getNotePosition(staffDataRef.current, movingNoteRef.current.name);
          lastNotePositionRef.current = { x: noteX, y: noteY };
        }
        
        // Clear the note immediately to allow spawning new notes
        movingNoteRef.current = null;
        // Also clear the last note reference to allow the same note to spawn again
        lastNoteRef.current = null;
      }
    }, [currentNote]);

    // Update feedback ref whenever feedback prop changes
    useEffect(() => {
      feedbackRef.current = feedback;
    }, [feedback]);

    // Trigger effects when feedback changes
    useEffect(() => {
      if (feedback && feedback !== lastFeedbackRef.current && staffDataRef.current && canvasRef.current) {
        // Get note position from current note or last stored position
        let noteX: number;
        let noteY: number;

        if (movingNoteRef.current) {
          noteX = movingNoteRef.current.x;
          noteY = getNotePosition(staffDataRef.current, movingNoteRef.current.name);
          // Store position for use even after note is cleared
          lastNotePositionRef.current = { x: noteX, y: noteY };
        } else if (lastNotePositionRef.current) {
          // Use stored position if note was already cleared
          noteX = lastNotePositionRef.current.x;
          noteY = lastNotePositionRef.current.y;
        } else {
          // No position available, skip effects
          lastFeedbackRef.current = feedback;
          return;
        }

        const spaceshipX = canvasRef.current.offsetWidth / 2; // Center horizontally
        // Position spaceship dynamically: 60% of the way between staff and bottom of canvas
        const distanceToBottom = canvasRef.current.offsetHeight - staffDataRef.current.staffY;
        const spaceshipY = staffDataRef.current.staffY + (distanceToBottom * 0.6);

        if (feedback === 'correct') {
          // Create laser beam (from top of spaceship pointing upward)
          laserRef.current = {
            startX: spaceshipX,
            startY: spaceshipY - 45, // From the tip of the spaceship
            endX: noteX,
            endY: noteY,
            startTime: performance.now(),
            duration: 150,
          };

          // Create explosion particles after a short delay
          setTimeout(() => {
            const particleCount = 20;
            const newParticles: Particle[] = [];
            for (let i = 0; i < particleCount; i++) {
              const angle = (Math.PI * 2 * i) / particleCount;
              const speed = 2 + Math.random() * 3;
              newParticles.push({
                x: noteX,
                y: noteY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 1,
                color: ['#fbbf24', '#f59e0b', '#ef4444', '#22c55e'][Math.floor(Math.random() * 4)],
              });
            }
            particlesRef.current = newParticles;
          }, 150);
        } else if (feedback === 'incorrect') {
          // Flash spaceship
          spaceshipFlashRef.current = performance.now();
        }
      }
      lastFeedbackRef.current = feedback;
    }, [feedback]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size once at initialization
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Initialize staff once
      if (!staffDataRef.current) {
        staffDataRef.current = initializeStaff(canvas, config.clef);
      }
      const staffData = staffDataRef.current;

      // Initialize starfield
      if (starsRef.current.length === 0) {
        const starCount = 400; // Increased star count
        for (let i = 0; i < starCount; i++) {
          starsRef.current.push({
            x: Math.random() * canvas.offsetWidth,
            y: Math.random() * canvas.offsetHeight,
            size: 0.5 + Math.random() * 1.5, // Varied sizes
            brightness: 0.5 + Math.random() * 0.5, // Brighter max brightness
            twinkleSpeed: 0.0002 + Math.random() * 0.0005, // Very slow twinkling (0.2x previous speed)
            twinklePhase: Math.random() * Math.PI * 2,
          });
        }
      }

      let lastTime = 0;

      const gameLoop = (currentTime: number) => {
        if (!lastTime) lastTime = currentTime;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Clear canvas (transparent background)
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        // Draw starfield
        drawStarfield(ctx, canvas.offsetWidth, canvas.offsetHeight, starsRef.current, currentTime, staffData?.staffY);

        // Redraw staff on every frame
        if (staffData) {
          drawStaffLines(ctx, staffData.staffX, staffData.staffY, staffData.staffWidth, staffData.clef, currentTime);
        }

        // Draw spaceship (centered horizontally, positioned below the staff)
        const spaceshipFlashing = currentTime - spaceshipFlashRef.current < 300;
        if (staffData) {
          const spaceshipX = canvas.offsetWidth / 2; // Center horizontally
          // Position spaceship dynamically: 60% of the way between staff and bottom of canvas
          const distanceToBottom = canvas.offsetHeight - staffData.staffY;
          const spaceshipY = staffData.staffY + (distanceToBottom * 0.6);
          drawSpaceship(ctx, spaceshipX, spaceshipY, spaceshipFlashing);
        }

        if (!isPaused) {
          // Spawn new note if needed
          if (
            !movingNoteRef.current &&
            currentTime - gameStateRef.current.lastSpawnTime >
              gameStateRef.current.spawnInterval
          ) {
            const newNote = generateNote();
            movingNoteRef.current = {
              name: newNote,
              x: canvas.offsetWidth,
              spawnTime: currentTime,
            };
            onNoteSpawnedRef.current(newNote);
            gameStateRef.current.lastSpawnTime = currentTime;
          }

          // Update and render moving note
          if (movingNoteRef.current) {
            const pxPerMs = speed / 1000;
            const newX = movingNoteRef.current.x - pxPerMs * deltaTime;

            if (newX < 150) {
              // Note reached clef - timeout
              movingNoteRef.current = null;
              onNoteTimeoutRef.current();
            } else {
              movingNoteRef.current.x = newX;

              // Render the moving note
              if (staffData) {
                const yPos = getNotePosition(staffData, movingNoteRef.current.name);
                renderNote(ctx, newX, yPos, movingNoteRef.current.name, feedbackRef.current, staffData);
              }
            }
          }

          // Update particles
          particlesRef.current = particlesRef.current.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime / 500; // Fade over 500ms
            return particle.life > 0;
          });
        } else if (movingNoteRef.current && staffData) {
          // Render paused note
          const yPos = getNotePosition(staffData, movingNoteRef.current.name);
          renderNote(ctx, movingNoteRef.current.x, yPos, movingNoteRef.current.name, feedbackRef.current, staffData);
        }

        // Draw laser beam (even when paused to show the shot)
        if (laserRef.current) {
          drawLaser(ctx, laserRef.current, currentTime);
          if (currentTime - laserRef.current.startTime > laserRef.current.duration) {
            laserRef.current = null;
          }
        }

        // Draw explosion particles
        if (particlesRef.current.length > 0) {
          drawExplosion(ctx, particlesRef.current);
        }

        // Draw correct answer display if active - positioned above spaceship for consistent feedback location
        if (correctAnswerDisplay && staffData) {
          const spaceshipX = canvas.offsetWidth / 2;
          const distanceToBottom = canvas.offsetHeight - staffData.staffY;
          const spaceshipY = staffData.staffY + (distanceToBottom * 0.6);
          drawCorrectAnswerDisplay(
            ctx, 
            spaceshipX, 
            spaceshipY, 
            correctAnswerDisplay, 
            currentTime
          );
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };

      gameLoopRef.current = requestAnimationFrame(gameLoop);

      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
        }
      };
    }, [config, speed, isPaused, gameLoopRef, correctAnswerDisplay]);

    return (
      <div className="w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
      </div>
    );
  }
);

StaffCanvas.displayName = 'StaffCanvas';

export default StaffCanvas;
