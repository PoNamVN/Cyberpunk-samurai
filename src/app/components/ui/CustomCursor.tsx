import { useEffect, useState, useRef } from 'react';

interface Slash {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [slashes, setSlashes] = useState<Slash[]>([]);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 1. Mouse movement tracking - updates target coordinates
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      targetPos.current = { x: e.clientX, y: e.clientY };
      
      // Prevent cursor from sliding in from (0,0) on first enter
      if (!hasInitialized.current) {
        currentPos.current = { x: e.clientX, y: e.clientY };
        hasInitialized.current = true;
      }
    };

    // 2. Global Hover detection for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') || 
        target.classList.contains('group') ||
        target.closest('.group') ||
        window.getComputedStyle(target).cursor === 'pointer';
        
      if (isInteractive) {
        setIsHovered(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovered(false);
    };

    // 3. Global Click Slash spawn
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('click', handleGlobalClick);

    // 4. Spring Physics LERP loop for cursor trailing
    let animId: number;
    const updateCursorPhysics = () => {
      if (hasInitialized.current) {
        const dx = targetPos.current.x - currentPos.current.x;
        const dy = targetPos.current.y - currentPos.current.y;

        // Easing interpolation (22% per frame for absolute butter trailing)
        currentPos.current.x += dx * 0.22;
        currentPos.current.y += dy * 0.22;

        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
        }
      }

      animId = requestAnimationFrame(updateCursorPhysics);
    };

    animId = requestAnimationFrame(updateCursorPhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('click', handleGlobalClick);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Hide native cursor globally */}
      <style dangerouslySetInnerHTML={{ __html: `
        body, button, a, [role="button"], .group {
          cursor: none !important;
        }
        @keyframes clip-wipe {
          0% { width: 0; x: 0; }
          25% { width: 220px; x: 0; }
          75% { width: 220px; x: 0; }
          100% { width: 220px; x: 220px; }
        }
        @keyframes spark-shoot {
          0% { stroke-dasharray: 40; stroke-dashoffset: 40; opacity: 1; }
          30% { stroke-dasharray: 40; stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dasharray: 40; stroke-dashoffset: -40; opacity: 0; }
        }
        @keyframes fade-out-quick {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}} />

      {/* 1. Sleek Cyber-Blade Pointer */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ 
          opacity: isVisible ? 1 : 0,
          transform: 'translate3d(0px, 0px, 0)' // initial placeholder
        }}
      >
        <svg 
          width="22" 
          height="22" 
          viewBox="0 0 24 24" 
          className={`transition-all duration-200 origin-top-left ${
            isHovered ? 'scale-125 text-white' : 'scale-100 text-[#FF0000]'
          }`}
          style={{
            filter: isHovered 
              ? 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' 
              : 'drop-shadow(0 0 5px rgba(255,0,0,0.9))'
          }}
        >
          {/* Futuristic Cyber-Blade pointer shape */}
          <path d="M0 0 L18 9 L10 10 L9 18 Z" fill="currentColor" />
          <path d="M3.5 3.5 L12.5 7.5 L8.5 8.5 L7.5 12.5 Z" fill={isHovered ? '#FF0000' : '#FFFFFF'} />
        </svg>
      </div>

      {/* 2. Render Katana Slashes */}
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

            {/* Main Razor-Sharp Blade (Needle-thin crescent with hot gradient - only 8px thick in middle) */}
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
