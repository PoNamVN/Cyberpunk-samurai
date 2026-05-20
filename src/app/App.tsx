import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LoreSection } from './components/LoreSection';
import { CharacterShowcase } from './components/CharacterShowcase';
import { FallingKanjisAmbient } from './components/FallingKanjisAmbient';
import { Footer } from './components/Footer';
import { SlashEffect } from './components/ui/SlashEffect';

export default function App() {
  const [burstTrigger, setBurstTrigger] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPercent = (clientX / window.innerWidth) - 0.5; // -0.5 to 0.5
      const yPercent = (clientY / window.innerHeight) - 0.5; // -0.5 to 0.5

      // Move grid with subtle parallax (3D background depth)
      gsap.to(gridRef.current, {
        x: xPercent * 25,
        y: yPercent * 25,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Move particles with larger parallax in opposite direction (foreground layer feel)
      gsap.to(particlesRef.current, {
        x: -xPercent * 45,
        y: -yPercent * 45,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Global Katana Click Slash Effect */}
      <SlashEffect />

      {/* 1. Parallax Glowing Cyber Grid Background */}
      <div
        ref={gridRef}
        className="fixed inset-[-10%] pointer-events-none z-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 0, 0, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 0, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 75%)',
        }}
      />

      {/* 2. Global Smoke and Dust Particles Texture (Parallax Enabled) */}
      <div ref={particlesRef} className="fixed inset-[-10%] pointer-events-none opacity-15 z-0">
        {/* Scattered dust particles */}
        <div className="absolute top-[10%] left-[15%] w-0.5 h-0.5 bg-white blur-sm animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
        <div className="absolute top-[25%] right-[20%] w-0.5 h-0.5 bg-[#FF0000] blur-sm animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-[40%] left-[30%] w-1 h-1 bg-white blur-md animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-[60%] right-[35%] w-0.5 h-0.5 bg-[#FF0000] blur-sm animate-pulse" style={{ animationDelay: '2s', animationDuration: '4.5s' }}></div>
        <div className="absolute top-[75%] left-[45%] w-0.5 h-0.5 bg-white blur-sm animate-pulse" style={{ animationDelay: '2.5s', animationDuration: '3s' }}></div>
        <div className="absolute top-[15%] right-[50%] w-1 h-1 bg-[#FF0000] blur-md animate-pulse" style={{ animationDelay: '3s', animationDuration: '4s' }}></div>
        <div className="absolute top-[50%] left-[60%] w-0.5 h-0.5 bg-white blur-sm animate-pulse" style={{ animationDelay: '1.2s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-[85%] right-[15%] w-0.5 h-0.5 bg-[#FF0000] blur-sm animate-pulse" style={{ animationDelay: '1.6s', animationDuration: '4.5s' }}></div>
        <div className="absolute top-[30%] left-[70%] w-1 h-1 bg-white blur-md animate-pulse" style={{ animationDelay: '2.2s', animationDuration: '3s' }}></div>
        <div className="absolute top-[70%] right-[25%] w-0.5 h-0.5 bg-[#FF0000] blur-sm animate-pulse" style={{ animationDelay: '2.6s', animationDuration: '4s' }}></div>
      </div>

      {/* Ambient Interactive Falling Kanjis */}
      <FallingKanjisAmbient burstTrigger={burstTrigger} />


      {/* Content */}
      <div className="relative z-10">
        <Navbar onPlayClick={() => setBurstTrigger((prev) => prev + 1)} />
        <div id="hero"><HeroSection /></div>
        <div id="lore"><LoreSection /></div>
        <div id="showcase"><CharacterShowcase /></div>
        <Footer />
      </div>
    </div>
  );
}
