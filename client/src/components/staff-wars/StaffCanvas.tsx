import React, { useEffect, useRef } from 'react';
import { Clef, GameConfig } from '../StaffWarsGame';
import { NoteState } from './GameplayScreen';
import { initializeStaff, renderNote, getNotePosition, StaffData } from '@/lib/notation/vexflowUtils';

interface StaffCanvasProps {
  config: GameConfig;
  noteState: NoteState;  // Single source of truth for note state
  isPaused: boolean;
  gameLoopRef: React.MutableRefObject<number | null>;
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
  ctx.save();
  const emitterGlow = (Math.sin(time * 0.003) + 1) / 2;
  ctx.fillStyle = `rgba(59, 130, 246, ${0.1 + emitterGlow * 0.1})`;
  ctx.beginPath();
  ctx.ellipse(stationX + 70, stationY, 10, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Rotating Radar Dish (Background) ---
  ctx.save();
  ctx.translate(stationX - 35, stationY - 65);
  ctx.rotate(time * 0.0005);

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -12);
  ctx.stroke();

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(0, -12, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Solar Panels ---
  const drawPanel = (offsetX: number, offsetY: number, rotation: number) => {
    ctx.save();
    ctx.translate(stationX + offsetX, stationY + offsetY);
    ctx.rotate(rotation);

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-25, -40, 50, 40);
    ctx.fill();
    ctx.stroke();

    const cellGrad = ctx.createLinearGradient(-20, -38, 20, -2);
    cellGrad.addColorStop(0, '#1e3a8a');
    cellGrad.addColorStop(0.5, '#3b82f6');
    cellGrad.addColorStop(1, '#1e3a8a');

    ctx.fillStyle = cellGrad;
    ctx.beginPath();
    ctx.rect(-22, -38, 44, 36);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = -10; i <= 10; i += 10) {
      ctx.moveTo(i, -38); ctx.lineTo(i, -2);
    }
    for (let i = -26; i <= -14; i += 12) {
      ctx.moveTo(-22, i); ctx.lineTo(22, i);
    }
    ctx.stroke();

    ctx.restore();
  };

  drawPanel(0, -80, 0);
  drawPanel(0, 120, 0);

  // --- Connecting Struts ---
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.rect(stationX - 8, stationY - 90, 16, 180);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(stationX - 4, stationY - 90, 4, 180);

  // --- Main Hub ---
  const sphereGrad = ctx.createRadialGradient(
    stationX - 15, stationY - 15, 5,
    stationX, stationY, 55
  );
  sphereGrad.addColorStop(0, '#64748b');
  sphereGrad.addColorStop(0.3, '#334155');
  sphereGrad.addColorStop(1, '#0f172a');

  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(stationX, stationY, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- Equatorial Ring ---
  ctx.save();
  ctx.translate(stationX, stationY);
  ctx.rotate(-Math.PI / 12);

  ctx.beginPath();
  ctx.ellipse(0, 0, 60, 15, 0, Math.PI, 0);
  ctx.fillStyle = '#1e293b';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, 0, 60, 15, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#0ea5e9';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#e0f2fe';
  for(let i = -50; i <= 50; i+=20) {
     if (Math.abs(i) > 55) continue;
     ctx.beginPath();
     ctx.rect(i, -2, 8, 4);
     ctx.fill();
  }
  ctx.restore();

  // --- Pulsing Beacon Lights ---
  const pulse = (Math.sin(time * 0.005) + 1) / 2;

  ctx.fillStyle = `rgba(239, 68, 68, ${0.6 + pulse * 0.4})`;
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 15 * pulse;
  ctx.beginPath();
  ctx.arc(stationX, stationY - 125, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(stationX, stationY + 125, 4, 0, Math.PI * 2);
  ctx.fill();

  // --- Clef Symbol Hologram ---
  ctx.save();
  ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 20;
  ctx.font = '140px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const clefSymbol = clef === 'treble' ? '𝄞' : clef === 'bass' ? '𝄢' : '𝄡';
  const clefYOffset = clef === 'treble' ? 20 : clef === 'bass' ? 0 : 5;

  ctx.fillText(clefSymbol, stationX, stationY + clefYOffset);

  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
  for(let i = stationY - 50; i < stationY + 50; i += 4) {
    ctx.fillRect(stationX - 30, i, 60, 2);
  }
  ctx.restore();

  ctx.restore();
}

function drawStaffLines(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, clef: Clef, time: number) {
  // Draw Danger Zone
  const dangerZoneWidth = 150;
  const gradient = ctx.createLinearGradient(x, 0, x + dangerZoneWidth, 0);
  gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
  gradient.addColorStop(0.8, 'rgba(239, 68, 68, 0.05)');
  gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y - 20, dangerZoneWidth, 130);

  // Force Field Pattern
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

  // Danger Line
  const barrierX = x + 120;
  const barrierYTop = y - 30;
  const barrierYBot = y + 120;

  ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(barrierX, barrierYTop);
  ctx.lineTo(barrierX, barrierYBot);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(barrierX, barrierYTop);
  ctx.lineTo(barrierX, barrierYBot);
  ctx.stroke();

  const scanY = (time * 0.08) % 150;
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(barrierX - 10, y - 30 + scanY);
  ctx.lineTo(barrierX + 10, y - 30 + scanY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Staff Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1;
  const lineSpacing = 22;
  for (let i = 0; i < 5; i++) {
    const lineY = y + i * lineSpacing;
    ctx.beginPath();
    ctx.moveTo(x, lineY);
    ctx.lineTo(x + width, lineY);
    ctx.stroke();
  }

  drawSpaceStation(ctx, x, y, clef, time);
}

function drawSpaceship(ctx: CanvasRenderingContext2D, x: number, y: number, flash: boolean = false) {
  ctx.save();

  if (flash) {
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 30;
  } else {
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
  }

  const bodyColor = flash ? '#ef4444' : '#e2e8f0';
  const darkBodyColor = flash ? '#b91c1c' : '#64748b';
  const accentColor = flash ? '#dc2626' : '#3b82f6';
  const cockpitColor = flash ? '#fecaca' : '#0ea5e9';
  const engineColor = flash ? '#fecaca' : '#f59e0b';

  // Wings
  ctx.fillStyle = darkBodyColor;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 5);
  ctx.lineTo(x - 35, y + 25);
  ctx.lineTo(x - 8, y + 15);
  ctx.moveTo(x + 8, y + 5);
  ctx.lineTo(x + 35, y + 25);
  ctx.lineTo(x + 8, y + 15);
  ctx.fill();

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 10);
  ctx.lineTo(x - 30, y + 20);
  ctx.lineTo(x - 5, y + 10);
  ctx.moveTo(x + 5, y - 10);
  ctx.lineTo(x + 30, y + 20);
  ctx.lineTo(x + 5, y + 10);
  ctx.fill();

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(x - 15, y + 5);
  ctx.lineTo(x - 25, y + 17);
  ctx.lineTo(x - 18, y + 10);
  ctx.moveTo(x + 15, y + 5);
  ctx.lineTo(x + 25, y + 17);
  ctx.lineTo(x + 18, y + 10);
  ctx.fill();

  // Fuselage
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - 45);
  ctx.bezierCurveTo(x - 8, y - 10, x - 10, y + 10, x - 8, y + 20);
  ctx.lineTo(x + 8, y + 20);
  ctx.bezierCurveTo(x + 10, y + 10, x + 8, y - 10, x, y - 45);
  ctx.fill();

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

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.ellipse(x - 1, y - 17, 1, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Engine Thrusters
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.rect(x - 6, y + 18, 4, 4);
  ctx.rect(x + 2, y + 18, 4, 4);
  ctx.fill();

  // Engine Glow
  ctx.fillStyle = engineColor;
  ctx.shadowColor = engineColor;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  const flicker = Math.random() * 5;
  ctx.moveTo(x - 6, y + 22);
  ctx.lineTo(x - 4, y + 35 + flicker);
  ctx.lineTo(x - 2, y + 22);
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
  _width: number,
  _height: number,
  stars: Array<{x: number, y: number, size: number, brightness: number, twinkleSpeed: number, twinklePhase: number}>,
  currentTime: number,
  staffY?: number
) {
  const staffTop = staffY ? staffY - 20 : -1;
  const staffBottom = staffY ? staffY + 110 : -1;

  stars.forEach(star => {
    if (staffY && star.y >= staffTop && star.y <= staffBottom) {
      return;
    }

    const sine = Math.sin((currentTime * star.twinkleSpeed) + star.twinklePhase);
    const normalizedSine = (sine + 1) / 2;
    const easedAlpha = normalizedSine * normalizedSine * normalizedSine;
    const currentBrightness = easedAlpha * star.brightness;

    if (currentBrightness < 0.01) return;

    ctx.fillStyle = `rgba(255, 255, 255, ${currentBrightness})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

export default function StaffCanvas({
  config,
  noteState,
  isPaused,
  gameLoopRef,
}: StaffCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staffDataRef = useRef<StaffData | null>(null);

  // Visual effects refs (these stay - they're render-only)
  const particlesRef = useRef<Particle[]>([]);
  const laserRef = useRef<LaserBeam | null>(null);
  const spaceshipFlashRef = useRef<number>(0);
  const starsRef = useRef<Array<{x: number, y: number, size: number, brightness: number, twinkleSpeed: number, twinklePhase: number}>>([]);

  // Track previous feedback for triggering effects
  const lastFeedbackRef = useRef<'correct' | 'incorrect' | null>(null);
  const lastNoteXRef = useRef<number>(0);

  // Trigger visual effects when feedback changes
  useEffect(() => {
    if (noteState.feedback && noteState.feedback !== lastFeedbackRef.current && staffDataRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const staffData = staffDataRef.current;

      // Use noteState position or last known position
      const noteX = noteState.noteX > 0 ? noteState.noteX : lastNoteXRef.current;
      const noteY = noteState.note ? getNotePosition(staffData, noteState.note) : staffData.staffY + 44;

      const spaceshipX = canvas.offsetWidth / 2;
      const distanceToBottom = canvas.offsetHeight - staffData.staffY;
      const spaceshipY = staffData.staffY + (distanceToBottom * 0.6);

      if (noteState.feedback === 'correct') {
        // Create laser beam
        laserRef.current = {
          startX: spaceshipX,
          startY: spaceshipY - 45,
          endX: noteX,
          endY: noteY,
          startTime: performance.now(),
          duration: 150,
        };

        // Create explosion particles after laser
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
      } else if (noteState.feedback === 'incorrect') {
        // Flash spaceship
        spaceshipFlashRef.current = performance.now();
      }
    }
    lastFeedbackRef.current = noteState.feedback;

    // Track note position for effects
    if (noteState.noteX > 0) {
      lastNoteXRef.current = noteState.noteX;
    }
  }, [noteState.feedback, noteState.noteX, noteState.note]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Initialize or re-initialize staff when canvas size or clef changes
    // Re-initialization is needed to recalculate staffX for centering when canvas resizes
    if (!staffDataRef.current || 
        staffDataRef.current.canvas.offsetWidth !== width || 
        staffDataRef.current.canvas.offsetHeight !== height ||
        staffDataRef.current.clef !== config.clef) {
      staffDataRef.current = initializeStaff(canvas, config.clef);
    }
    const staffData = staffDataRef.current;

    // Initialize starfield
    if (starsRef.current.length === 0) {
      const starCount = 400;
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          size: 0.5 + Math.random() * 1.5,
          brightness: 0.5 + Math.random() * 0.5,
          twinkleSpeed: 0.0002 + Math.random() * 0.0005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    let lastTime = 0;

    const renderLoop = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw starfield
      drawStarfield(ctx, canvas.offsetWidth, canvas.offsetHeight, starsRef.current, currentTime, staffData?.staffY);

      // Draw staff
      if (staffData) {
        drawStaffLines(ctx, staffData.staffX, staffData.staffY, staffData.staffWidth, staffData.clef, currentTime);
      }

      // Draw spaceship
      const spaceshipFlashing = currentTime - spaceshipFlashRef.current < 300;
      if (staffData) {
        const spaceshipX = canvas.offsetWidth / 2;
        const distanceToBottom = canvas.offsetHeight - staffData.staffY;
        const spaceshipY = staffData.staffY + (distanceToBottom * 0.6);
        drawSpaceship(ctx, spaceshipX, spaceshipY, spaceshipFlashing);
      }

      // Draw note (position comes from noteState prop)
      if (noteState.note && noteState.noteX > 0 && staffData) {
        const yPos = getNotePosition(staffData, noteState.note);
        renderNote(ctx, noteState.noteX, yPos, noteState.note, noteState.feedback, staffData);
      }

      // Update and draw particles (visual effect only)
      if (!isPaused) {
        particlesRef.current = particlesRef.current.filter(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= deltaTime / 500;
          return particle.life > 0;
        });
      }

      // Draw laser beam
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

      // Draw correct answer display
      if (noteState.correctAnswerToShow && staffData) {
        const spaceshipX = canvas.offsetWidth / 2;
        const distanceToBottom = canvas.offsetHeight - staffData.staffY;
        const spaceshipY = staffData.staffY + (distanceToBottom * 0.6);
        drawCorrectAnswerDisplay(ctx, spaceshipX, spaceshipY, noteState.correctAnswerToShow, currentTime);
      }

      gameLoopRef.current = requestAnimationFrame(renderLoop);
    };

    gameLoopRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [config, isPaused, gameLoopRef, noteState]);

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
