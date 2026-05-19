import { useEffect, useState, useRef } from 'react';

interface FallingKanji {
  id: number;
  char: string;
  x: number; // Percentage width
  speed: number; // CSS Animation speed (seconds)
  size: number; // Font size (px)
  delay: number; // Start delay
  depth: 'foreground' | 'midground' | 'background';
}

interface SlicedKanji {
  id: number;
  char: string;
  x: number; // Pixel coordinate
  y: number; // Pixel coordinate
  size: number;
  angle: number;
  depth: 'foreground' | 'midground' | 'background';
}

const KANJI_LIST = ['武', '士', '道', '影', '斬', '剣', '魂', '死', '生', '刃', '闇', '光', '忍', '心'];

export function FallingKanjisAmbient({ 
  burstTrigger = 0 
}: { 
  burstTrigger?: number; 
}) {
  const [activeKanjis, setActiveKanjis] = useState<FallingKanji[]>([]);
  const [slicedKanjis, setSlicedKanjis] = useState<SlicedKanji[]>([]);
  const nextId = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

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
  const getDepthInfo = (size: number): { depth: 'foreground' | 'midground' | 'background'; speed: number } => {
    if (size >= 48) {
      return { depth: 'foreground', speed: 3.5 + Math.random() * 2 }; // Faster falling
    } else if (size >= 32) {
      return { depth: 'midground', speed: 5.5 + Math.random() * 2.5 };
    } else {
      return { depth: 'background', speed: 8 + Math.random() * 4 }; // Slower falling
    }
  };

  // 1. Spawning Loop: Ambient background fall
  useEffect(() => {
    const spawnKanji = () => {
      setActiveKanjis((prev) => {
        if (prev.length >= 18) return prev; // Performance cap

        const size = 18 + Math.random() * 44; // 18px to 62px
        const { depth, speed } = getDepthInfo(size);

        const newKanji: FallingKanji = {
          id: nextId.current++,
          char: KANJI_LIST[Math.floor(Math.random() * KANJI_LIST.length)],
          x: 4 + Math.random() * 92, // Keep spacing well within screen bounds
          speed,
          size,
          delay: Math.random() * 0.5,
          depth
        };
        return [...prev, newKanji];
      });
    };

    // Ambient spawn rate: every 1.5 seconds
    spawnTimerRef.current = setInterval(spawnKanji, 1500);
    
    // Spawn initial set
    for (let i = 0; i < 4; i++) {
      setTimeout(spawnKanji, i * 400);
    }

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, []);

  // 2. Trigger bursts of Kanjis when user clicks 'PLAY NOW'
  useEffect(() => {
    if (burstTrigger === 0) return;

    // Spawn 10 Kanjis in quick succession as a celebratory visual burst
    const spawnBurst = () => {
      setActiveKanjis((prev) => {
        const newBurst: FallingKanji[] = [];
        for (let i = 0; i < 10; i++) {
          const size = 20 + Math.random() * 42;
          const { depth, speed } = getDepthInfo(size);
          newBurst.push({
            id: nextId.current++,
            char: KANJI_LIST[Math.floor(Math.random() * KANJI_LIST.length)],
            x: 5 + Math.random() * 90,
            speed: speed * 0.75, // Burst kanjis fall a bit faster for dynamic impact
            size,
            delay: Math.random() * 0.8,
            depth
          });
        }
        return [...prev, ...newBurst].slice(0, 25); // Cap to 25 to protect performance
      });
    };

    spawnBurst();
  }, [burstTrigger]);

  // 3. Handle Slashes (MouseDown or Dragging with click)
  const handleKanjiSlash = (id: number, char: string, size: number, depth: 'foreground' | 'midground' | 'background', e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    playSlashSound();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const splitAngle = -30 + Math.random() * 60;

    const newSliced: SlicedKanji = {
      id: Date.now() + Math.random(),
      char,
      x,
      y,
      size,
      angle: splitAngle,
      depth
    };

    setSlicedKanjis((prev) => [...prev, newSliced]);
    setActiveKanjis((prev) => prev.filter((k) => k.id !== id));

    // Clear slice shards after transition
    setTimeout(() => {
      setSlicedKanjis((prev) => prev.filter((s) => s.id !== newSliced.id));
    }, 450);
  };

  const handleAnimationEnd = (id: number) => {
    setActiveKanjis((prev) => prev.filter((k) => k.id !== id));
  };

  const getOpacity = (depth: 'foreground' | 'midground' | 'background') => {
    if (depth === 'foreground') return 0.95;
    if (depth === 'midground') return 0.75;
    return 0.45;
  };

  const getZIndex = (depth: 'foreground' | 'midground' | 'background') => {
    if (depth === 'foreground') return 'z-[40]';
    if (depth === 'midground') return 'z-[20]';
    return 'z-[5]';
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden">
      {/* Glitch styled keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ambient-kanji-fall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(60deg); opacity: 0; }
        }
        @keyframes ambient-slice-left {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; filter: brightness(2) drop-shadow(0 0 10px #00ffff); }
          100% { transform: translate(-60px, -30px) rotate(-45deg); opacity: 0; filter: brightness(1); }
        }
        @keyframes ambient-slice-right {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; filter: brightness(2) drop-shadow(0 0 10px #ff00ff); }
          100% { transform: translate(60px, 30px) rotate(45deg); opacity: 0; filter: brightness(1); }
        }
        @keyframes ambient-kanji-glitch {
          0% { text-shadow: 0 0 12px rgba(255, 0, 0, 0.95), -2px 0 #00ffff, 2px 0 #ff00ff; transform: translate(0, 0) skewX(0deg); }
          10% { text-shadow: 0 0 12px rgba(255, 0, 0, 0.95), 2px -1px #00ffff, -2px 1px #ff00ff; transform: translate(-2px, 1px) skewX(5deg); }
          20% { text-shadow: 0 0 8px rgba(255, 0, 0, 0.8), -1px 2px #00ffff, 1px -2px #ff00ff; transform: translate(1px, -1px) skewX(-5deg); }
          30% { text-shadow: 0 0 12px rgba(255, 0, 0, 0.95), 0 0 0 transparent; transform: translate(0, 0) skewX(0deg); }
          100% { text-shadow: 0 0 12px rgba(255, 0, 0, 0.95), -2px 0 #00ffff, 2px 0 #ff00ff; transform: translate(0, 0) skewX(0deg); }
        }
        .ambient-kanji-glow {
          animation: ambient-kanji-glitch 0.4s infinite steps(2);
        }
      `}} />

      {/* Active Falling Kanjis */}
      {activeKanjis.map((kanji) => {
        const opacity = getOpacity(kanji.depth);
        const zClass = getZIndex(kanji.depth);

        return (
          <div
            key={kanji.id}
            className={`absolute pointer-events-auto cursor-none select-none group flex items-center justify-center ${zClass}`}
            style={{
              left: `${kanji.x}%`,
              top: 0,
              fontSize: `${kanji.size}px`,
              width: `${kanji.size * 1.8}px`,
              height: `${kanji.size * 1.8}px`,
              opacity,
              animation: `ambient-kanji-fall ${kanji.speed}s linear ${kanji.delay}s forwards`,
            }}
            onAnimationEnd={() => handleAnimationEnd(kanji.id)}
            onMouseDown={(e) => handleKanjiSlash(kanji.id, kanji.char, kanji.size, kanji.depth, e)}
            onMouseEnter={(e) => {
              if (e.buttons === 1) {
                handleKanjiSlash(kanji.id, kanji.char, kanji.size, kanji.depth, e as any);
              }
            }}
          >
            {/* Ambient Kanji glowing with RGB shifting glitch animation */}
            <span className="font-serif font-bold text-white ambient-kanji-glow hover:text-red-500 hover:scale-115 transition-transform duration-100 cursor-none">
              {kanji.char}
            </span>
          </div>
        );
      })}

      {/* Sliced Fragments */}
      {slicedKanjis.map((sliced) => {
        const clipLeft = 'polygon(0 0, 100% 0, 0 100%)';
        const clipRight = 'polygon(100% 0, 100% 100%, 0 100%)';
        const opacity = getOpacity(sliced.depth);
        const zClass = getZIndex(sliced.depth);

        return (
          <div
            key={sliced.id}
            className={`absolute pointer-events-none flex items-center justify-center ${zClass}`}
            style={{
              left: sliced.x,
              top: sliced.y,
              fontSize: `${sliced.size}px`,
              transform: `translate(-50%, -50%) rotate(${sliced.angle}deg)`,
              width: `${sliced.size * 1.5}px`,
              height: `${sliced.size * 1.5}px`,
              opacity
            }}
          >
            {/* Left half slice */}
            <span
              className="absolute font-serif font-bold text-white ambient-kanji-glow"
              style={{
                clipPath: clipLeft,
                animation: 'ambient-slice-left 0.4s cubic-bezier(0.1, 0.8, 0.2, 1) forwards'
              }}
            >
              {sliced.char}
            </span>

            {/* Right half slice */}
            <span
              className="absolute font-serif font-bold text-white ambient-kanji-glow"
              style={{
                clipPath: clipRight,
                animation: 'ambient-slice-right 0.4s cubic-bezier(0.1, 0.8, 0.2, 1) forwards'
              }}
            >
              {sliced.char}
            </span>
          </div>
        );
      })}
    </div>
  );
}
