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

export function FallingKanjiGame({ 
  isActive, 
  onClose 
}: { 
  isActive: boolean; 
  onClose: () => void; 
}) {
  const [gameState, setGameState] = useState<'idle' | 'intro' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [integrity, setIntegrity] = useState(100);
  const [activeKanjis, setActiveKanjis] = useState<FallingKanji[]>([]);
  const [slicedKanjis, setSlicedKanjis] = useState<SlicedKanji[]>([]);
  const nextId = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Synthesize physical sword slash sound dynamically using Web Audio API (zero load latency)
  const playSlashSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Sharp lowpass filter to make it sound cybernetic/metallic
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

  // Synthesize a warning alert tone for losing integrity
  const playAlertSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(80, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  // 2. Control game states based on the isActive prop
  useEffect(() => {
    if (isActive) {
      setGameState('intro');
      setScore(0);
      setIntegrity(100);
      setActiveKanjis([]);
      setSlicedKanjis([]);
      
      // Cyber intro boots for 1.5 seconds
      const timer = setTimeout(() => {
        setGameState('playing');
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setGameState('idle');
      setActiveKanjis([]);
      setSlicedKanjis([]);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    }
  }, [isActive]);

  // 3. Spawning Loop when gameState is 'playing'
  useEffect(() => {
    if (gameState !== 'playing') {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      return;
    }

    const spawnKanji = () => {
      setActiveKanjis((prev) => {
        if (prev.length >= 10) return prev; // cap particles to maintain 60fps

        const newKanji: FallingKanji = {
          id: nextId.current++,
          char: KANJI_LIST[Math.floor(Math.random() * KANJI_LIST.length)],
          x: 8 + Math.random() * 84, // keep spacing within limits
          speed: 4.5 + Math.random() * 3.5, // 4.5s to 8s (intense gameplay)
          size: 32 + Math.random() * 20, // 32px to 52px
          delay: Math.random() * 0.2
        };
        return [...prev, newKanji];
      });
    };

    // Spawning frequency: every 1.6 seconds
    spawnTimerRef.current = setInterval(spawnKanji, 1600);
    
    // Spawn 2 immediately
    spawnKanji();
    setTimeout(spawnKanji, 800);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [gameState]);

  // 4. Handle Kanji Slash (MouseDown triggers instantly)
  const handleKanjiSlash = (id: number, char: string, size: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (gameState !== 'playing') return;

    playSlashSound();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const splitAngle = -25 + Math.random() * 50;

    const newSliced: SlicedKanji = {
      id: Date.now() + Math.random(),
      char,
      x,
      y,
      size,
      angle: splitAngle
    };

    setSlicedKanjis((prev) => [...prev, newSliced]);
    setActiveKanjis((prev) => prev.filter((k) => k.id !== id));
    setScore((prev) => prev + 15); // Add 15 points per slash

    setTimeout(() => {
      setSlicedKanjis((prev) => prev.filter((s) => s.id !== newSliced.id));
    }, 450);
  };

  // 5. Handle Kanji escaping past the bottom edge (decreases integrity)
  const handleAnimationEnd = (id: number) => {
    if (gameState !== 'playing') return;

    playAlertSound();
    setActiveKanjis((prev) => prev.filter((k) => k.id !== id));
    
    setIntegrity((prev) => {
      const nextVal = Math.max(0, prev - 20); // 5 misses = Game Over
      if (nextVal === 0) {
        setGameState('gameover');
      }
      return nextVal;
    });
  };

  if (gameState === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md select-none overflow-hidden">
      {/* Glitch styled keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes kanji-fall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
          100% { transform: translateY(105vh) rotate(90deg); opacity: 0; }
        }
        @keyframes slice-left {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; filter: brightness(2) drop-shadow(0 0 10px #00ffff); }
          100% { transform: translate(-50px, -25px) rotate(-35deg); opacity: 0; filter: brightness(1); }
        }
        @keyframes slice-right {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; filter: brightness(2) drop-shadow(0 0 10px #ff00ff); }
          100% { transform: translate(50px, 25px) rotate(35deg); opacity: 0; filter: brightness(1); }
        }
        .kanji-glow-shadow {
          text-shadow: 0 0 12px rgba(255, 0, 0, 0.95), -2px 0 #00ffff, 2px 0 #ff00ff;
        }
      `}} />

      {/* A. INTRO SCREEN */}
      {gameState === 'intro' && (
        <div className="text-center p-12 border border-[#FF0000]/30 bg-black/90 max-w-md w-full relative">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FF0000]"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FF0000]"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#FF0000]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FF0000]"></div>

          <div className="text-neutral-500 font-mono text-[10px] tracking-[0.25em] uppercase mb-2">
            SYS_CALIBRATION // NEURAL_LINK
          </div>
          <h2 className="text-4xl text-[#FF0000] tracking-[0.15em] font-bold uppercase mb-6 font-mono animate-pulse">
            SHADOW SLASH
          </h2>
          <div className="w-full bg-neutral-900 h-1.5 border border-neutral-800 relative overflow-hidden mb-4">
            <div className="bg-[#FF0000] h-full shadow-[0_0_8px_#FF0000] animate-[bar-wave_1.5s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
          </div>
          <div className="text-white font-mono text-xs tracking-wider animate-pulse">
            LOADING SLASH_PROTOCOL_V4.0...
          </div>
        </div>
      )}

      {/* B. PLAYING FIELD & INTERACTIVE HUD */}
      {gameState === 'playing' && (
        <>
          {/* Top Gaming HUD */}
          <div className="absolute top-0 left-0 right-0 z-30 p-8 flex items-center justify-between pointer-events-none select-none">
            {/* Score */}
            <div className="font-mono text-sm tracking-[0.2em] border border-neutral-800 bg-black/60 px-6 py-3 flex items-center gap-3">
              <span className="text-neutral-500">SCORE:</span>
              <span className="text-white font-bold text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                {String(score).padStart(4, '0')}
              </span>
            </div>

            {/* Integrity Meter (Integrity / Lives) */}
            <div className="font-mono text-sm tracking-[0.2em] border border-neutral-800 bg-black/60 px-6 py-3 flex flex-col items-start gap-1 w-64">
              <div className="flex justify-between w-full">
                <span className="text-neutral-500">INTEGRITY:</span>
                <span className={`font-bold ${integrity <= 40 ? 'text-[#FF0000]' : 'text-[#00FF66]'}`}>
                  {integrity}%
                </span>
              </div>
              <div className="w-full bg-neutral-950 h-2 border border-neutral-800 overflow-hidden relative mt-1">
                <div 
                  className={`h-full transition-all duration-300 ${integrity <= 40 ? 'bg-[#FF0000] shadow-[0_0_8px_#FF0000]' : 'bg-[#00FF66] shadow-[0_0_8px_#00FF66]'}`}
                  style={{ width: `${integrity}%` }}
                ></div>
              </div>
            </div>

            {/* System Exit Button */}
            <button 
              onClick={onClose}
              className="pointer-events-auto bg-[#FF0000]/10 hover:bg-[#FF0000] text-white font-mono text-[10px] tracking-[0.2em] border border-[#FF0000] px-6 py-3.5 transition-all duration-300 cursor-none"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
              }}
            >
              SYS_EXIT
            </button>
          </div>

          {/* Tutorial Sub-title inside the field */}
          <div className="absolute top-28 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-40 font-mono text-[9px] tracking-[0.2em]">
            DRAG OR CLICK MOUSE TO SLASH FALLING KANJIS BEFORE SYSTEM INTEGRITY DROPS
          </div>

          {/* Active Falling Kanjis Container */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {activeKanjis.map((kanji) => (
              <div
                key={kanji.id}
                className="absolute pointer-events-auto cursor-none select-none group flex items-center justify-center"
                style={{
                  left: `${kanji.x}%`,
                  top: 0,
                  fontSize: `${kanji.size}px`,
                  width: `${kanji.size * 1.8}px`,
                  height: `${kanji.size * 1.8}px`,
                  animation: `kanji-fall ${kanji.speed}s linear ${kanji.delay}s forwards`,
                }}
                onAnimationEnd={() => handleAnimationEnd(kanji.id)}
                onMouseDown={(e) => handleKanjiSlash(kanji.id, kanji.char, kanji.size, e)}
              >
                {/* Kanji character styled with glowing shadow */}
                <span className="font-serif font-bold text-white kanji-glow-shadow hover:text-red-500 hover:scale-115 transition-transform duration-100 cursor-none">
                  {kanji.char}
                </span>
              </div>
            ))}
          </div>

          {/* Decaying Sliced Half Fragments Container */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {slicedKanjis.map((sliced) => {
              const clipLeft = 'polygon(0 0, 100% 0, 0 100%)';
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
                  {/* Left Fragment */}
                  <span
                    className="absolute font-serif font-bold text-white kanji-glow-shadow"
                    style={{
                      clipPath: clipLeft,
                      animation: 'slice-left 0.4s cubic-bezier(0.1, 0.8, 0.2, 1) forwards'
                    }}
                  >
                    {sliced.char}
                  </span>

                  {/* Right Fragment */}
                  <span
                    className="absolute font-serif font-bold text-white kanji-glow-shadow"
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
        </>
      )}

      {/* C. GAME OVER MODAL */}
      {gameState === 'gameover' && (
        <div className="text-center p-12 border-2 border-[#FF0000] bg-black/90 max-w-md w-full relative shadow-[0_0_30px_rgba(255,0,0,0.35)]">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FF0000]"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FF0000]"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FF0000]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FF0000]"></div>

          <div className="text-[#FF0000] font-mono text-[10px] tracking-[0.25em] uppercase mb-2 animate-pulse font-bold">
            [PROTOCOL_TERMINATED]
          </div>
          <h2 className="text-4xl text-white tracking-[0.15em] font-bold uppercase mb-8 font-mono">
            GAME OVER
          </h2>

          <div className="border border-neutral-800 bg-neutral-950 p-6 mb-8 flex flex-col items-center">
            <span className="text-neutral-500 font-mono text-xs tracking-widest uppercase mb-1">FINAL SCORE</span>
            <span className="text-3xl text-[#FF0000] font-mono font-bold tracking-widest drop-shadow-[0_0_10px_#FF0000]">
              {score}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setGameState('intro')}
              className="pointer-events-auto bg-[#FF0000] hover:bg-white text-white hover:text-black font-mono text-xs tracking-[0.2em] font-bold py-4 transition-all duration-300 cursor-none shadow-[0_0_15px_rgba(255,0,0,0.4)]"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              RESTART PROTOCOL
            </button>

            <button
              onClick={onClose}
              className="pointer-events-auto bg-transparent hover:bg-neutral-800 text-neutral-400 hover:text-white font-mono text-xs tracking-[0.2em] py-4 transition-all duration-300 cursor-none border border-neutral-800"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              SYS_EXIT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
