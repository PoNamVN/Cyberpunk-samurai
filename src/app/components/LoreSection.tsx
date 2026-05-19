import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleText } from './ui/ScrambleText';

gsap.registerPlugin(ScrollTrigger);

export function LoreSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const topLaserRef = useRef<SVGLineElement>(null);
  const bottomLaserRef = useRef<SVGLineElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Set initial state for laser drawing
      gsap.set([topLaserRef.current, bottomLaserRef.current], {
        strokeDasharray: 100,
        strokeDashoffset: 100
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%", 
        }
      });

      tl.to([topLaserRef.current, bottomLaserRef.current], {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.3,
        onStart: () => setIsRevealed(true)
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const p1 = "In the neon-drenched streets of Neo-Kyoto, ancient traditions clash with bleeding-edge technology. The Blade Masters uphold the sacred way of the sword, their techniques perfected over millennia, now enhanced with cybernetic precision.";
  const p2 = "Against them stand the Gun Syndicates, wielding weapons of mass destruction powered by quantum cores and AI targeting systems. Where honor once decided battles, now firepower and circuit speed reign supreme.";
  const p3 = "The old world burns. The new world rises. Only the strongest will survive this brutal synthesis of steel and silicon, tradition and innovation, swords versus high-tech guns.";

  return (
    <section 
      ref={sectionRef} 
      className="bg-black pt-40 pb-40 px-8 relative overflow-hidden"
      style={{ clipPath: 'polygon(0 5vw, 100% 0, 100% calc(100% - 5vw), 0 100%)' }}
    >
      {/* Top Laser Line Overlay */}
      <svg className="absolute top-0 left-0 w-full h-[5vw] pointer-events-none z-20 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line 
          ref={topLaserRef}
          x1="0" y1="100" x2="100" y2="0" 
          stroke="#FF0000" 
          strokeWidth="1.5" 
          pathLength="100"
          className="drop-shadow-[0_0_10px_rgba(255,0,0,0.9)]"
        />
      </svg>

      {/* Bottom Laser Line Overlay */}
      <svg className="absolute bottom-0 left-0 w-full h-[5vw] pointer-events-none z-20 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line 
          ref={bottomLaserRef}
          x1="0" y1="100" x2="100" y2="0" 
          stroke="#FF0000" 
          strokeWidth="1.5" 
          pathLength="100"
          className="drop-shadow-[0_0_10px_rgba(255,0,0,0.9)]"
        />
      </svg>

      {/* Glitch overlay effect */}
      <div className="absolute top-0 right-1/4 w-0.5 h-32 bg-[#FF0000] opacity-20 blur-sm"></div>

      <div className="max-w-[1440px] mx-auto">
        {/* Asymmetrical Layout - Image 60% width on right */}
        <div className="relative flex items-center justify-end">
          {/* Large Character Image - 60% width, right side */}
          <div
            className="relative w-full md:w-3/5 aspect-[3/4] bg-neutral-900 overflow-hidden border-2 border-neutral-800"
            style={{
              borderRadius: '0px',
              clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'
            }}
          >
            <img 
              src="/images/city_samurai.jpg" 
              alt="Cyber Samurai Conflict" 
              className="w-full h-full object-cover opacity-80 brightness-75 hover:opacity-100 hover:scale-105 transition-all duration-700" 
            />

            {/* Chamfered corner accent */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FF0000] opacity-70 z-10"></div>
            {/* Cyberpunk Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none z-10"></div>
          </div>

          {/* Text Content Overlay - Partially overlapping from left */}
          <div
            className="absolute left-0 top-1/4 w-full md:w-3/5 bg-black/95 border-2 border-[#FF0000] p-12 shadow-2xl shadow-red-900/40"
            style={{
              borderRadius: '0px',
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)'
            }}
          >
            {/* Title with enhanced glitch effect */}
            <div className="relative mb-8">
              <h2
                className="text-6xl md:text-7xl uppercase tracking-tighter relative text-white"
                style={{ fontFamily: 'Teko, sans-serif', fontWeight: 700 }}
              >
                {/* Multiple Sharp cut lines */}
                <div className="absolute -top-2 -left-2 w-20 h-0.5 bg-[#FF0000] shadow-md shadow-red-600/50"></div>
                <div className="absolute -top-1 left-0 w-16 h-0.5 bg-white opacity-30"></div>
                <div className="absolute -bottom-2 right-0 w-28 h-0.5 bg-[#FF0000] shadow-md shadow-red-600/50"></div>
                <div className="absolute bottom-0 right-4 w-20 h-0.5 bg-white opacity-20"></div>

                {/* Glitch duplicate */}
                <span className="absolute top-0 left-0 text-[#FF0000] opacity-10" style={{ transform: 'translate(1px, -1px)' }}>
                  <ScrambleText text="THE CONFLICT" isRevealed={isRevealed} durationMs={800} />
                </span>

                <span className="relative drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  <ScrambleText text="THE CONFLICT" isRevealed={isRevealed} durationMs={800} />
                </span>
              </h2>
            </div>

            <div className="space-y-4 text-white/90 leading-relaxed font-mono text-sm md:text-base">
              <p>
                <ScrambleText text={p1} isRevealed={isRevealed} durationMs={1500} />
              </p>

              <p>
                <ScrambleText text={p2} isRevealed={isRevealed} durationMs={2000} />
              </p>

              <p>
                <ScrambleText text={p3} isRevealed={isRevealed} durationMs={2500} />
              </p>
            </div>

            {/* Bottom chamfered corner accent */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#FF0000] opacity-30"></div>
          </div>
        </div>
      </div>

    </section>
  );
}
