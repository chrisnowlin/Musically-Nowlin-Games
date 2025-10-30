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

function drawStaffLines(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, clef: Clef) {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  // Draw 5 staff lines with increased spacing
  const lineSpacing = 22;
  for (let i = 0; i < 5; i++) {
    const lineY = y + i * lineSpacing;
    ctx.beginPath();
    ctx.moveTo(x, lineY);
    ctx.lineTo(x + width, lineY);
    ctx.stroke();
  }

  // Draw clef symbol (larger size for better visibility)
  ctx.fillStyle = '#ffffff';
  ctx.font = '152px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const clefSymbol = clef === 'treble' ? '𝄞' : clef === 'bass' ? '𝄢' : '𝄡';

  // Position clef on correct staff line
  // For treble clef: the curl wraps around G line (2nd from bottom = line 3)
  // The baseline of the character should align so the curl is on that line
  // Staff lines: line 0=y, line 1=y+22, line 2=y+44, line 3=y+66, line 4=y+88
  // Treble clef: position baseline at y+95 so the curl sits on line 3 (y+66)
  const clefY = clef === 'treble' ? y + 95 : clef === 'bass' ? y + 95 : y + 70;
  ctx.fillText(clefSymbol, x + 10, clefY);
}

function drawSpaceship(ctx: CanvasRenderingContext2D, x: number, y: number, flash: boolean = false) {
  ctx.save();

  // Flash effect for incorrect answers
  if (flash) {
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
  }

  // Main body (triangle pointing upward)
  ctx.fillStyle = flash ? '#ef4444' : '#60a5fa';
  ctx.beginPath();
  ctx.moveTo(x, y - 40); // Top point
  ctx.lineTo(x - 15, y); // Bottom left
  ctx.lineTo(x + 15, y); // Bottom right
  ctx.closePath();
  ctx.fill();

  // Cockpit window
  ctx.fillStyle = flash ? '#fca5a5' : '#93c5fd';
  ctx.beginPath();
  ctx.arc(x, y - 15, 6, 0, Math.PI * 2);
  ctx.fill();

  // Wings (horizontal)
  ctx.fillStyle = flash ? '#dc2626' : '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 10);
  ctx.lineTo(x - 25, y - 5);
  ctx.lineTo(x - 15, y - 5);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + 15, y - 10);
  ctx.lineTo(x + 25, y - 5);
  ctx.lineTo(x + 15, y - 5);
  ctx.closePath();
  ctx.fill();

  // Engine glow (at the bottom)
  ctx.fillStyle = flash ? '#fca5a5' : '#fbbf24';
  ctx.beginPath();
  ctx.arc(x, y + 5, 4, 0, Math.PI * 2);
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

function drawStarfield(ctx: CanvasRenderingContext2D, width: number, height: number, stars: Array<{x: number, y: number, size: number, brightness: number}>) {
  stars.forEach(star => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
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
    const starsRef = useRef<Array<{x: number, y: number, size: number, brightness: number}>>([]);
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
            startY: spaceshipY - 40, // From the tip of the spaceship
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
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
          starsRef.current.push({
            x: Math.random() * canvas.offsetWidth,
            y: Math.random() * canvas.offsetHeight,
            size: Math.random() * 2,
            brightness: 0.3 + Math.random() * 0.7,
          });
        }
      }

      let lastTime = 0;

      const gameLoop = (currentTime: number) => {
        if (!lastTime) lastTime = currentTime;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Clear canvas with space background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        // Draw starfield
        drawStarfield(ctx, canvas.offsetWidth, canvas.offsetHeight, starsRef.current);

        // Redraw staff on every frame
        if (staffData) {
          drawStaffLines(ctx, staffData.staffX, staffData.staffY, staffData.staffWidth, staffData.clef);
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

        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };

      gameLoopRef.current = requestAnimationFrame(gameLoop);

      return () => {
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
        }
      };
    }, [config, speed, isPaused, gameLoopRef]);

    return (
      <div className="w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-slate-950 rounded-lg border-2 border-blue-900 shadow-lg shadow-blue-900/50"
          style={{ display: 'block' }}
        />
      </div>
    );
  }
);

StaffCanvas.displayName = 'StaffCanvas';

export default StaffCanvas;

