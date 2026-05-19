import { useEffect, useState, useRef } from 'react';

interface FallingKanji {
  id: number;
  char: string;
  x: number; // Percentage width
  speed: number; // CSS Animation speed (seconds)
  size: number; // Font size (px)
  delay: number; // Start delay
}

interface SlicedKanji {
  id: number;
  char: string;
  x: number; // Pixel coordinate
  y: number; // Pixel coordinate
  size: number;
  angle: number;
}

const KANJI_LIST = ['武', '士', '道', '影', '斬', '剣', '魂', '死', '生', '刃', '闇', '光', '忍', '心'];

export function FallingKanjiGame() {
  const [activeKanjis, setActiveKanjis] = useState<FallingKanji[]>([]);
  const [slicedKanjis, setSlicedKanjis] = useState<SlicedKanji[]>([]);
  const nextId = useRef(0);

  // 1. Periodic spawning loop
  useEffect(() => {
    const spawnKanji = () => {
      // Limit total active kanji to 12 to maintain high performance
      setActiveKanjis((prev) => {
        if (prev.length >= 12) return prev;

        const newKanji: FallingKanji = {
          id: nextId.current++,
          char: KANJI_LIST[Math.floor(Math.random() * KANJI_LIST.length)],
          x: 5 + Math.random() * 90, // Keep away from extreme edges
          speed: 6 + Math.random() * 5, // Fall duration (6s to 11s)
          size: 28 + Math.random() * 24, // Size (28px to 52px)
          delay: Math.random() * 0.5
        };
        return [...prev, newKanji];
      });
    };

    // Spawn initial set
    for (let i = 0; i < 4; i++) {
      setTimeout(spawnKanji, i * 1500);
    }

    const interval = setInterval(spawnKanji, 2200);
    return () => clearInterval(interval);
  }, []);

  // Handle a successful sword slash click
  const handleKanjiSlash = (id: number, char: string, size: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Avoid triggering global clicks weirdly

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Random split angle
    const splitAngle = -30 + Math.random() * 60;

    // Create sliced halves effect
    const newSliced: SlicedKanji = {
      id: Date.now() + Math.random(),
      char,
      x,
      y,
      size,
      angle: splitAngle
    };

    setSlicedKanjis((prev) => [...prev, newSliced]);
    
    // Remove the falling kanji immediately
    setActiveKanjis((prev) => prev.filter((k) => k.id !== id));

    // Remove sliced fragments after animation completes (400ms)
    setTimeout(() => {
      setSlicedKanjis((prev) => prev.filter((s) => s.id !== newSliced.id));
    }, 450);
  };

  // Clean up kanjis that finished falling past the screen
  const handleAnimationEnd = (id: number) => {
    setActiveKanjis((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[40] overflow-hidden select-none">
      {/* Glitch styled keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes kanji-fall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
          15% { opacity: 0.75; }
          85% { opacity: 0.75; }
          100% { transform: translateY(105vh) rotate(120deg); opacity: 0; }
        }
        @keyframes slice-left {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; filter: brightness(2); }
          100% { transform: translate(-45px, -30px) rotate(-25deg); opacity: 0; filter: brightness(1); }
        }
        @keyframes slice-right {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; filter: brightness(2); }
          100% { transform: translate(45px, 30px) rotate(25deg); opacity: 0; filter: brightness(1); }
        }
        .kanji-text-shadow {
          text-shadow: 0 0 10px rgba(255, 0, 0, 0.8), -1.5px 0 #00ffff, 1.5px 0 #ff00ff;
        }
      `}} />

      {/* 1. Falling Active Kanjis */}
      {activeKanjis.map((kanji) => (
        <div
          key={kanji.id}
          className="absolute pointer-events-auto cursor-none select-none group"
          style={{
            left: `${kanji.x}%`,
            top: 0,
            fontSize: `${kanji.size}px`,
            animation: `kanji-fall ${kanji.speed}s linear ${kanji.delay}s forwards`,
          }}
          onAnimationEnd={() => handleAnimationEnd(kanji.id)}
          onMouseDown={(e) => handleKanjiSlash(kanji.id, kanji.char, kanji.size, e)}
        >
          {/* Glitchy Kanji Body */}
          <span 
            className="font-serif font-bold text-white/90 kanji-text-shadow hover:text-red-500 hover:scale-110 transition-transform duration-100 flex items-center justify-center w-16 h-16 cursor-none"
          >
            {kanji.char}
          </span>
        </div>
      ))}

      {/* 2. Sliced Decaying Kanji Halves */}
      {slicedKanjis.map((sliced) => {
        // Diagonal clip paths to represent physical slice angle
        // Top-Left Half
        const clipLeft = 'polygon(0 0, 100% 0, 0 100%)';
        // Bottom-Right Half
        const clipRight = 'polygon(100% 0, 100% 100%, 0 100%)';

        return (
          <div
            key={sliced.id}
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
              left: sliced.x,
              top: sliced.y,
              fontSize: `${sliced.size}px`,
              transform: `translate(-50%, -50%) rotate(${sliced.angle}deg)`,
              width: `${sliced.size * 1.5}px`,
              height: `${sliced.size * 1.5}px`,
            }}
          >
            {/* Top-Left Half sliding away */}
            <span
              className="absolute font-serif font-bold text-white kanji-text-shadow"
              style={{
                clipPath: clipLeft,
                animation: 'slice-left 0.4s cubic-bezier(0.1, 0.8, 0.2, 1) forwards'
              }}
            >
              {sliced.char}
            </span>

            {/* Bottom-Right Half sliding away */}
            <span
              className="absolute font-serif font-bold text-white kanji-text-shadow"
              style={{
                clipPath: clipRight,
                animation: 'slice-right 0.4s cubic-bezier(0.1, 0.8, 0.2, 1) forwards'
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
