import { useEffect, useState } from 'react';

interface Slash {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export function SlashEffect() {
  const [slashes, setSlashes] = useState<Slash[]>([]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const angles = [-35, -15, 15, 35, -45, 45];
      const randomAngle = angles[Math.floor(Math.random() * angles.length)];

      const newSlash: Slash = {
        id: Date.now() + Math.random(),
        x: clientX,
        y: clientY,
        angle: randomAngle
      };

      setSlashes((prev) => [...prev, newSlash]);

      // Remove after fast animation completes (300ms total lifecycle)
      setTimeout(() => {
        setSlashes((prev) => prev.filter((s) => s.id !== newSlash.id));
      }, 300);
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <>
      {/* CSS Keyframes for slash sweep wipe and fadeout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes clip-wipe {
          0% { width: 0; x: 0; }
          25% { width: 220px; x: 0; }
          75% { width: 220px; x: 0; }
          100% { width: 220px; x: 220px; }
        }
        @keyframes fade-out-quick {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}} />

      {slashes.map((slash) => (
        <div 
          key={slash.id} 
          className="fixed inset-0 pointer-events-none z-[9997]"
        >
          {/* Extremely Long and Thin Glowing Sword Sweep */}
          <svg 
            className="absolute overflow-visible w-[360px] h-[360px]"
            style={{
              left: slash.x,
              top: slash.y,
              transform: `translate(-50%, -50%) rotate(${slash.angle}deg)`,
              animation: 'fade-out-quick 0.3s ease-out forwards'
            }}
            viewBox="0 0 200 200"
          >
            <defs>
              {/* Hot blade energy gradient */}
              <linearGradient id={`slash-grad-${slash.id}`} x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#FF0000" stopOpacity="0.1" />
                <stop offset="35%" stopColor="#FF0000" stopOpacity="1" />
                <stop offset="85%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Dynamic hilt-to-tip cutting mask */}
              <clipPath id={`slash-clip-${slash.id}`}>
                <rect 
                  x="-10" y="0" width="0" height="200"
                  style={{
                    animation: 'clip-wipe 0.26s cubic-bezier(0.08, 0.82, 0.17, 1) forwards'
                  }}
                />
              </clipPath>
            </defs>

            {/* Back Glow Layer (Extremely thin, blurred, deep neon red) */}
            <path 
              d="M 5 102 Q 100 80 195 98 Q 100 98 5 102 Z" 
              fill="#FF0000"
              opacity="0.8"
              clipPath={`url(#slash-clip-${slash.id})`}
              style={{
                filter: 'drop-shadow(0 0 8px #FF0000) blur(3px)'
              }}
            />

            {/* Main Razor-Sharp Blade (Needle-thin crescent with hot gradient) */}
            <path 
              d="M 5 102 Q 100 85 195 98 Q 100 93 5 102 Z" 
              fill={`url(#slash-grad-${slash.id})`}
              clipPath={`url(#slash-clip-${slash.id})`}
              style={{
                filter: 'drop-shadow(0 0 3px #FF0000)'
              }}
            />

            {/* Blinding White Core (Needle centerline - only 2px thick) */}
            <path 
              d="M 15 101 Q 100 88 185 99 Q 100 91 15 101 Z" 
              fill="#FFFFFF"
              clipPath={`url(#slash-clip-${slash.id})`}
              opacity="0.95"
            />
          </svg>
        </div>
      ))}
    </>
  );
}
