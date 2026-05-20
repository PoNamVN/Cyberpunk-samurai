import { useEffect, useRef } from 'react';

interface KanjiParticle {
  id: number;
  char: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  angle: number;
  rotationSpeed: number;
  depth: 'foreground' | 'midground' | 'background';
  opacity: number;
  color: string;
  glowColor: string;
  glowBlur: number;

  // Sliced state
  isSliced: boolean;
  splitAngle: number; // Cut line angle (rad)
  sliceTime: number;  // Ticker for sliced fragment physics
  driftSpeed: number;
}

const KANJI_LIST = ['武', '士', '道', '影', '斬', '剣', '魂', '死', '生', '刃', '闇', '光', '忍', '心'];

export function FallingKanjisAmbient({ 
  burstTrigger = 0 
}: { 
  burstTrigger?: number; 
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<KanjiParticle[]>([]);
  const nextId = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0, active: false });

  // Synthesize physical sword slash sound dynamically using Web Audio API
  const playSlashSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Sharp lowpass filter for cybernetic/metallic slash whoosh
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.18);

      osc.type = 'sawtooth';
      // High pitch sweep down rapidly for sword slash whoosh
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  // Helper to determine depth class based on size
  const getDepthInfo = (size: number): { 
    depth: 'foreground' | 'midground' | 'background'; 
    speed: number;
    opacity: number;
    glowBlur: number;
  } => {
    if (size >= 44) {
      return { 
        depth: 'foreground', 
        speed: 2.2 + Math.random() * 1.5, 
        opacity: 0.95,
        glowBlur: 18
      };
    } else if (size >= 28) {
      return { 
        depth: 'midground', 
        speed: 1.4 + Math.random() * 1.0, 
        opacity: 0.75,
        glowBlur: 10
      };
    } else {
      return { 
        depth: 'background', 
        speed: 0.8 + Math.random() * 0.6, 
        opacity: 0.4,
        glowBlur: 4
      };
    }
  };

  // Add a new particle
  const spawnKanji = (isBurst = false) => {
    const width = window.innerWidth;
    const size = 18 + Math.random() * 44; // 18px to 62px
    const { depth, speed, opacity, glowBlur } = getDepthInfo(size);

    const isRed = Math.random() > 0.4; // 40% red, 60% white
    const pColor = isRed ? '#ff3b30' : '#ffffff';
    const pGlow = isRed ? '#ff0000' : (Math.random() > 0.5 ? '#ff3b30' : '#ffffff');

    const newParticle: KanjiParticle = {
      id: nextId.current++,
      char: KANJI_LIST[Math.floor(Math.random() * KANJI_LIST.length)],
      x: 30 + Math.random() * (width - 60),
      y: -60,
      speed: isBurst ? speed * 1.3 : speed,
      size,
      angle: (Math.random() * 30 - 15) * Math.PI / 180, // -15deg to 15deg
      rotationSpeed: (Math.random() * 0.4 - 0.2) * Math.PI / 180,
      depth,
      opacity,
      color: pColor,
      glowColor: pGlow,
      glowBlur,
      isSliced: false,
      splitAngle: 0,
      sliceTime: 0,
      driftSpeed: 1.5 + Math.random() * 2
    };

    particlesRef.current.push(newParticle);
  };

  // 1. Spawning timer loop
  useEffect(() => {
    // Spawning interval
    const interval = setInterval(() => {
      if (particlesRef.current.filter(p => !p.isSliced).length < 18) {
        spawnKanji();
      }
    }, 1200);

    // Initial set
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnKanji(), i * 350);
    }

    return () => clearInterval(interval);
  }, []);

  // 2. Celebratory bursts of kanjis
  useEffect(() => {
    if (burstTrigger === 0) return;

    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        spawnKanji(true);
      }, Math.random() * 600);
    }
  }, [burstTrigger]);

  // 3. Canvas Resizing and Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.restore(); // reset to clear standard scales
      ctx.save();
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Track mouse events globally
    const handleMouseDown = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseUp = () => {
      lastMousePos.current.active = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const last = lastMousePos.current;
      const currX = e.clientX;
      const currY = e.clientY;

      // Slice check: only if dragging/clicking
      const isDragging = e.buttons === 1 || last.active;

      if (isDragging) {
        const particles = particlesRef.current;

        // Perform linear interpolation collision checking (bulletproof fast slash detection)
        const steps = 6;
        for (let pIndex = 0; pIndex < particles.length; pIndex++) {
          const p = particles[pIndex];
          if (p.isSliced) continue;

          for (let step = 0; step <= steps; step++) {
            const t = step / steps;
            const checkX = last.x + (currX - last.x) * t;
            const checkY = last.y + (currY - last.y) * t;

            const dist = Math.hypot(checkX - p.x, checkY - p.y);

            // Bounding radius collision threshold
            if (dist < p.size * 0.9) {
              p.isSliced = true;
              p.sliceTime = 1;
              // Calculate slash angle based on cursor drag vector
              const dx = currX - last.x;
              const dy = currY - last.y;
              p.splitAngle = dy === 0 && dx === 0 ? (Math.random() * 60 - 30) * Math.PI / 180 : Math.atan2(dy, dx);
              // playSlashSound(); // Disabled per user request to completely silence click/slash sound
              break;
            }
          }
        }
      }

      lastMousePos.current = { x: currX, y: currY, active: isDragging };
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    // --- MAIN RENDER AND PHYSICS UPDATE LOOP ---
    const updateAndRender = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // 1. Particle Physics Update
        if (!p.isSliced) {
          p.y += p.speed;
          p.angle += p.rotationSpeed;

          // Remove off-screen particles
          if (p.y > h + 80) {
            particles.splice(i, 1);
            continue;
          }
        } else {
          // Sliced piece physics (fall with gravity, slide apart)
          p.sliceTime += 1;
          p.y += p.speed + p.sliceTime * 0.18; // accelerated fall

          // If too old or fully faded, remove
          if (p.sliceTime > 28) {
            particles.splice(i, 1);
            continue;
          }
        }

        // 2. Particle Draw
        ctx.save();
        
        // Depth-based blur or shadow configuration
        ctx.globalAlpha = p.isSliced 
          ? Math.max(0, p.opacity * (1 - p.sliceTime / 28)) 
          : p.opacity;

        ctx.font = `bold ${p.size}px "Yu Mincho", "MS Mincho", "Hiragino Mincho Pro", "Noto Serif JP", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glowing Neon Shadow
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = p.glowBlur;
        ctx.fillStyle = p.color;

        if (!p.isSliced) {
          // Draw standard falling intact Kanji
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          // RGB Glitch flickering effect (subtle, red only to preserve red/white color palette)
          if (Math.random() > 0.96) {
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = p.glowBlur * 1.5;
            ctx.translate(Math.random() * 4 - 2, 0);
          }

          ctx.fillText(p.char, 0, 0);
        } else {
          // DRAW SLICED FRAGMENTS DRIFTING APART (GENUINE CUT MASK, NO DUPLICATION)
          const driftOffset = p.sliceTime * p.driftSpeed;
          
          // --- LEFT/TOP HALF SHARD ---
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.splitAngle);
          
          // Translate perpendicular to the cut line
          ctx.translate(0, -driftOffset);
          ctx.rotate(-p.sliceTime * 0.02); // spin slightly
          
          // Clip to show only the top half (relative to cut angle)
          ctx.beginPath();
          ctx.rect(-p.size * 2, -p.size * 2, p.size * 4, p.size * 2);
          ctx.clip();
          
          // Rotate back to draw text in its original orientation
          ctx.rotate(p.angle - p.splitAngle + p.sliceTime * 0.02);
          ctx.fillText(p.char, 0, 0);
          ctx.restore();


          // --- RIGHT/BOTTOM HALF SHARD ---
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.splitAngle);
          
          // Translate in the opposite perpendicular direction
          ctx.translate(0, driftOffset);
          ctx.rotate(p.sliceTime * 0.02); // spin slightly
          
          // Clip to show only the bottom half (relative to cut angle)
          ctx.beginPath();
          ctx.rect(-p.size * 2, 0, p.size * 4, p.size * 2);
          ctx.clip();
          
          // Rotate back to draw text in its original orientation
          ctx.rotate(p.angle - p.splitAngle - p.sliceTime * 0.02);
          ctx.fillText(p.char, 0, 0);
          ctx.restore();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(updateAndRender);
    };

    animId = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[9995] select-none overflow-hidden w-full h-full"
    />
  );
}
