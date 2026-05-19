import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- TYPES ---
interface Character {
  id: number;
  name: string;
  role: string;
  description: string;
  power: number;
  skill: number;
  quote: string;
  imagePlaceholder: string;
}

// --- MOCK DATA ---
const characters: Character[] = [
  {
    id: 1,
    name: "KIRA SHADOWBLADE",
    role: "CYBER-ASSASSIN",
    description: "Master assassin wielding a plasma-edged katana. Silent, precise, deadly. A ghost in the neon rain.",
    power: 92,
    skill: 88,
    quote: "\"The shadow is my only ally.\"",
    imagePlaceholder: "/images/3.jpg"
  },
  {
    id: 2,
    name: "RYKER IRONHEART",
    role: "EX-MILITARY ENFORCER",
    description: "Heavy assault specialist with dual quantum pistols. No mercy, no hesitation. Built for pure destruction.",
    power: 98,
    skill: 75,
    quote: "\"Armor won't save you.\"",
    imagePlaceholder: "/images/4.jpg"
  },
  {
    id: 3,
    name: "YUKI STORMBORN",
    role: "RONIN HACKER",
    description: "Cybernetic ronin with electro-chain blades. Honor bound, tech-enhanced. Manipulates data as easily as steel.",
    power: 85,
    skill: 95,
    quote: "\"The code is flawed, just like your technique.\"",
    imagePlaceholder: "/images/5.jpg"
  }
];

import { ScrambleText } from './ui/ScrambleText';

export function CharacterShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const slashRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const [isRevealed, setIsRevealed] = useState(false);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Setup initial state
      gsap.set(slashRef.current, { x: '-100%', skewX: -45 });
      gsap.set(contentRef.current, { opacity: 0, scale: 0.95 });
      gsap.set('.kanji-char', { opacity: 0, scale: 2, filter: 'blur(10px)' });
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%", 
          onEnter: () => setIsRevealed(true)
        }
      });

      // 1. The Slash Effect
      tl.to(slashRef.current, {
        x: '200vw',
        opacity: 0,
        duration: 0.7,
        ease: 'power3.inOut',
      })
      // 2. Content Reveal right after slash crosses
      .to(contentRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.2)'
      }, "-=0.2")
      // 3. Kanji Stagger
      .to('.kanji-char', {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.4,
        stagger: 0.2,
        ease: 'power3.out'
      }, "-=0.3")
      // 4. Character Cards stagger
      .fromTo(cardsRef.current, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.2)' },
        "-=0.2"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = (index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;
    
    const ghost = card.querySelector('.red-ghost');
    const image = card.querySelector('.char-image');
    
    let ctx = gsap.context(() => {
      gsap.to(ghost, {
        x: -15,
        y: 10,
        opacity: 0.8,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      gsap.to(image, {
        x: "random(-4, 4)",
        y: "random(-4, 4)",
        duration: 0.05,
        repeat: 5,
        yoyo: true,
        ease: 'none',
        onComplete: () => {
          gsap.set(image, { x: 0, y: 0 });
        }
      });
    }, card);
    
    (card as any)._gsapCtx = ctx;
  };

  const handleMouseLeave = (index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;
    
    const ghost = card.querySelector('.red-ghost');
    
    if ((card as any)._gsapCtx) {
       (card as any)._gsapCtx.revert();
    }
    
    gsap.to(ghost, {
      x: 0,
      y: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
    gsap.set(card.querySelector('.char-image'), { x: 0, y: 0 });
  };

  return (
    <section 
      ref={sectionRef} 
      className="bg-black pt-36 pb-24 px-4 md:px-8 relative overflow-hidden min-h-screen flex items-center justify-center"
      style={{
        marginTop: '-5vw',
        clipPath: 'polygon(0 5vw, 100% 0, 100% 100%, 0 100%)'
      }}
    >
      
      {/* The Slash Element */}
      <div 
        ref={slashRef}
        className="absolute top-0 left-0 w-8 h-[200%] bg-[#FF0000] shadow-[0_0_40px_15px_rgba(255,0,0,0.8)] z-50 pointer-events-none transform -translate-y-1/4"
        style={{ transformOrigin: 'center' }}
      ></div>

      <div ref={contentRef} className="max-w-[1440px] mx-auto w-full relative z-10">
        
        {/* Title Section */}
        <div className="relative mb-20 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <span className="kanji-char text-7xl md:text-8xl text-[#FF0000] drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]" style={{ fontFamily: 'serif' }}>武</span>
          
          <div className="relative px-4 py-2">
            <h2 className="text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter text-center text-white relative z-10" style={{ fontFamily: 'Teko, sans-serif', fontWeight: 700 }}>
              {/* Sharp cut lines */}
              <div className="absolute top-0 left-0 w-1/3 h-0.5 bg-[#FF0000] shadow-md shadow-red-600/50"></div>
              <div className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-[#FF0000] shadow-md shadow-red-600/50"></div>
              
              <span className="relative drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <ScrambleText text="CHOOSE YOUR WARRIOR" isRevealed={isRevealed} />
              </span>
            </h2>
          </div>
          
          <span className="kanji-char text-7xl md:text-8xl text-[#FF0000] drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]" style={{ fontFamily: 'serif' }}>侍</span>
        </div>

        {/* Character Grid */}
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 lg:gap-12">
          {characters.map((character, index) => {
            const isCenterCard = index === 1;
            const lgScale = isCenterCard ? 'lg:scale-110 lg:-translate-y-4' : 'lg:scale-100';
            const zIndex = isCenterCard ? 'z-20' : 'z-10';

            return (
              <div
                key={character.id}
                ref={(el) => { cardsRef.current[index] = el; }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                className={`relative w-full max-w-sm lg:w-[340px] group transition-transform duration-500 ${lgScale} ${zIndex}`}
              >
                {/* Red Ghost Layer */}
                <div 
                  className="red-ghost absolute inset-0 bg-[#FF0000] mix-blend-screen opacity-0 pointer-events-none"
                  style={{
                    clipPath: isCenterCard
                      ? 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)'
                      : 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                  }}
                >
                  <div className="absolute inset-0 border-2 border-[#FF0000] bg-black/40 backdrop-blur-sm"></div>
                </div>

                {/* Main Card */}
                <div
                  className="relative bg-black border-2 border-neutral-800 transition-colors duration-300 group-hover:border-white shadow-2xl overflow-hidden"
                  style={{
                    clipPath: isCenterCard
                      ? 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)'
                      : 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                  }}
                >
                  {/* Image Container */}
                  <div className="char-image relative aspect-[3/4] bg-neutral-900 overflow-hidden border-b-2 border-neutral-800 group-hover:border-[#FF0000] transition-colors">
                    <img 
                      src={character.imagePlaceholder} 
                      alt={character.name} 
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500" 
                      style={{ objectPosition: 'top center' }} // Ensure the face/head is prioritized in vertical alignment
                    />
                    
                    {/* Cyberpunk Scanline overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-25 pointer-events-none z-10"></div>

                    {/* Corner accents */}
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#FF0000] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 z-10"></div>
                  </div>

                  {/* Info Section with integrated Stats Dashboard */}
                  <div className="p-6 relative bg-black/80 backdrop-blur-sm z-10">
                    <div className="text-[#FF0000] text-xs font-bold tracking-widest mb-1">{character.role}</div>
                    
                    <h3 className="text-3xl uppercase tracking-tight text-white mb-3" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}>
                      {character.name}
                    </h3>

                    {/* High-Tech Side-by-Side Stats Dashboard */}
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 bg-neutral-900/60 border border-[#FF0000]/40 px-3 py-1.5 flex items-center justify-between" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}>
                        <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">POWER</span>
                        <span className="text-xl text-[#FF0000] font-bold leading-none" style={{ fontFamily: 'Teko, sans-serif' }}>{character.power}</span>
                      </div>
                      <div className="flex-1 bg-neutral-900/60 border border-white/20 px-3 py-1.5 flex items-center justify-between" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}>
                        <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">SKILL</span>
                        <span className="text-xl text-white font-bold leading-none" style={{ fontFamily: 'Teko, sans-serif' }}>{character.skill}</span>
                      </div>
                    </div>

                    <p className="text-white/60 text-sm leading-relaxed mb-4 min-h-[60px]">
                      {character.description}
                    </p>
                    
                    <div className="text-white/40 italic text-xs border-l-2 border-[#FF0000] pl-3 py-1">
                      {character.quote}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
