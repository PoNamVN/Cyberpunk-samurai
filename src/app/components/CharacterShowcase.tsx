import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleText } from './ui/ScrambleText';

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
  faction: string;
  weapon: string;
  specialty: string;
  backstory: string;
  fullStats: {
    speed: number;
    stealth: number;
    hacking: number;
    survival: number;
    tactics: number;
  };
}

// --- DEEP FACTION & LORE MOCK DATA ---
const characters: Character[] = [
  {
    id: 1,
    name: "KIRA SHADOWBLADE",
    role: "CYBER-ASSASSIN",
    description: "Master assassin wielding a plasma-edged katana. Silent, precise, deadly. A ghost in the neon rain.",
    power: 92,
    skill: 88,
    quote: "\"The shadow is my only ally.\"",
    imagePlaceholder: "/images/3.jpg",
    faction: "NEO-KYOTO RESISTANCE (UNDERGROUND)",
    weapon: "MURAMASA-V3 THERMAL PLASMA KATANA",
    specialty: "INFILTRATION / ASSASSINATION",
    backstory: "Born in the deep lightless slums of Neo-Kyoto, Kira was augment-trained by the shadow syndicates before going rogue. She operates as a silent vigilante, dismantling corrupt corporate power structures from the darkness under the city. Legend says she can bypass any laser security grid in exactly three seconds.",
    fullStats: {
      speed: 96,
      stealth: 98,
      hacking: 78,
      survival: 85,
      tactics: 84
    }
  },
  {
    id: 2,
    name: "RYKER IRONHEART",
    role: "EX-MILITARY ENFORCER",
    description: "Heavy assault specialist with dual quantum pistols. No mercy, no hesitation. Built for pure destruction.",
    power: 98,
    skill: 75,
    quote: "\"Armor won't save you.\"",
    imagePlaceholder: "/images/4.jpg",
    faction: "SHIN-KAIZA HEAVY COALITION",
    weapon: "VALKYRIE-MK4 THERMO-BARIC CANNON",
    specialty: "HEAVY ASSAULT / DEMOLITIONS",
    backstory: "An ex-military enforcer who survived the devastating Sector 9 cyber-wars. Rebuilt with 75% military-grade titanium prosthetics, Ryker now operates as a high-price heavy mercenary for the Shin-Kaiza cartel. He is a walking tank, crushing syndicate walls and armored barricades with high-yield thermal warfare.",
    fullStats: {
      speed: 68,
      stealth: 35,
      hacking: 55,
      survival: 95,
      tactics: 88
    }
  },
  {
    id: 3,
    name: "YUKI STORMBORN",
    role: "RONIN HACKER",
    description: "Cybernetic ronin with electro-chain blades. Honor bound, tech-enhanced. Manipulates data as easily as steel.",
    power: 85,
    skill: 95,
    quote: "\"The code is flawed, just like your technique.\"",
    imagePlaceholder: "/images/5.jpg",
    faction: "REBEL NET-RUNNERS SYNDICATE",
    weapon: "NEXUS-X9 COLD-CHAIN ELECTRO-WHIPS",
    specialty: "QUANTUM NETRUNNING / SYSTEM CRACKING",
    backstory: "A brilliant cybernetic prodigy and ronin netrunner who escaped the corporate data farms of Neo-Kyoto. Yuki manipulates high-voltage energy grids and bends secure networks to her will in real-time. Her neural deck directly interfaces with the city's power grid, calling down digital storms on her targets.",
    fullStats: {
      speed: 90,
      stealth: 82,
      hacking: 99,
      survival: 76,
      tactics: 92
    }
  }
];

export function CharacterShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const slashRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

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

  // --- WEB AUDIO INTERFACE SYNTHESIZER ---
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  };

  const playOpenBeep = () => {
    try {
      const ctx = getAudioContext();
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(4, ctx.currentTime);
      filter.connect(ctx.destination);

      const now = ctx.currentTime;
      
      // Fast high-pitch digital triple-beep
      [1100, 1500, 2000].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        
        gainNode.gain.setValueAtTime(0.08, now + idx * 0.06);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.05);
        
        osc.connect(gainNode);
        gainNode.connect(filter);
        
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.05);
      });

      // Cyber static load sweep
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.03, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      
      noise.connect(noiseGain);
      noiseGain.connect(filter);
      noise.start(now);
      noise.stop(now + 0.2);
    } catch (e) {
      console.warn("AudioContext blocked or failed to initialize", e);
    }
  };

  const playCloseBeep = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);

      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn("AudioContext blocked or failed to initialize", e);
    }
  };

  const openModal = (char: Character) => {
    playOpenBeep();
    setSelectedChar(char);
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  };

  const closeModal = () => {
    playCloseBeep();
    setSelectedChar(null);
    document.body.style.overflow = ''; // Unlock background scrolling
  };

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
      {/* Glitch Keyframe CSS definitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cyber-glitch-1 {
          0% { clip-path: inset(40% 0 61% 0); transform: skew(0.3deg); }
          20% { clip-path: inset(92% 0 1% 0); transform: skew(-0.5deg); }
          40% { clip-path: inset(15% 0 80% 0); transform: skew(0.5deg); }
          60% { clip-path: inset(80% 0 5% 0); transform: skew(-0.3deg); }
          80% { clip-path: inset(3% 0 92% 0); transform: skew(0.8deg); }
          100% { clip-path: inset(40% 0 61% 0); transform: skew(0deg); }
        }
        @keyframes cyber-glitch-2 {
          0% { clip-path: inset(25% 0 58% 0); transform: skew(-0.8deg); }
          20% { clip-path: inset(64% 0 28% 0); transform: skew(0.5deg); }
          40% { clip-path: inset(5% 0 88% 0); transform: skew(-0.3deg); }
          60% { clip-path: inset(80% 0 10% 0); transform: skew(0.8deg); }
          80% { clip-path: inset(45% 0 35% 0); transform: skew(-0.5deg); }
          100% { clip-path: inset(25% 0 58% 0); transform: skew(0deg); }
        }
        @keyframes white-noise-flicker {
          0% { opacity: 0; }
          10% { opacity: 0.15; }
          20% { opacity: 0.05; }
          30% { opacity: 0.25; }
          40% { opacity: 0.02; }
          50% { opacity: 0.18; }
          60% { opacity: 0.08; }
          70% { opacity: 0.3; }
          80% { opacity: 0.05; }
          90% { opacity: 0.12; }
          100% { opacity: 0; }
        }
        @keyframes modal-boot-glitch {
          0% { opacity: 0; transform: scale(0.95) skewX(-10deg); filter: hue-rotate(90deg) brightness(2); }
          10% { opacity: 0.8; transform: scale(1.02) skewX(5deg); }
          20% { opacity: 0.4; transform: scale(0.98) skewX(-5deg); filter: hue-rotate(-90deg) brightness(0.5); }
          30% { opacity: 0.9; transform: scale(1) skewX(0deg); filter: none; }
          100% { opacity: 1; transform: scale(1); }
        }
      `}} />
      
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
                onClick={() => openModal(character)}
                className={`relative w-full max-w-sm lg:w-[340px] group transition-transform duration-500 cursor-pointer ${lgScale} ${zIndex}`}
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
                    
                    {/* Blinking indicator on hover */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-900">
                      <div className="text-white/40 italic text-xs border-l-2 border-[#FF0000] pl-3 py-1">
                        {character.quote}
                      </div>
                      <div className="text-[10px] text-[#FF0000] font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse">
                        [ LINK SYNC ]
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immersive Cyber-Glitch HUD character profile modal */}
      {selectedChar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Glass backdrop with dark vignetting */}
          <div 
            onClick={closeModal}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer transition-opacity duration-300"
          ></div>
          
          {/* White static glitch flash overlay */}
          <div className="absolute inset-0 bg-white pointer-events-none z-50 mix-blend-difference" style={{ animation: 'white-noise-flicker 0.2s linear forwards' }}></div>

          {/* Modal Chassis Card */}
          <div 
            className="relative w-full max-w-4xl bg-black border-2 border-[#FF0000] text-white shadow-[0_0_50px_rgba(255,0,0,0.5)] overflow-hidden z-10 animate-[modal-boot-glitch_0.35s_ease-out_forwards]"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)',
              fontFamily: 'sans-serif'
            }}
          >
            {/* Decrypting grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.45)_50%)] bg-[length:100%_4px] opacity-35 pointer-events-none z-10"></div>
            
            {/* Bevel Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#FF0000]"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#FF0000]"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#FF0000]"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#FF0000]"></div>

            {/* Main Grid Content */}
            <div className="flex flex-col md:flex-row relative z-20">
              
              {/* Left Column: Glitch Art Image */}
              <div className="w-full md:w-5/12 aspect-[3/4] md:aspect-auto md:h-[550px] relative bg-neutral-900 overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-[#FF0000]/40">
                
                {/* Glitch Aberration absolute clones */}
                <img 
                  src={selectedChar.imagePlaceholder} 
                  alt={selectedChar.name} 
                  className="absolute inset-0 w-full h-full object-cover opacity-90 scale-102"
                  style={{ objectPosition: 'top center', filter: 'hue-rotate(60deg) saturate(1.5)', animation: 'cyber-glitch-1 4s linear infinite' }}
                />
                <img 
                  src={selectedChar.imagePlaceholder} 
                  alt={selectedChar.name} 
                  className="absolute inset-0 w-full h-full object-cover opacity-90 scale-102"
                  style={{ objectPosition: 'top center', filter: 'hue-rotate(-60deg) saturate(1.5)', animation: 'cyber-glitch-2 3.5s linear infinite' }}
                />
                <img 
                  src={selectedChar.imagePlaceholder} 
                  alt={selectedChar.name} 
                  className="absolute inset-0 w-full h-full object-cover opacity-95"
                  style={{ objectPosition: 'top center', filter: 'contrast(1.15) saturate(1.1)' }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-10"></div>
                
                {/* HUD Affiliation overlay */}
                <div className="absolute bottom-6 left-6 z-20">
                  <div className="text-[10px] font-mono text-[#FF0000] tracking-[0.2em] mb-1">COGNITIVE SYNC STATUS // ACTIVE</div>
                  <h4 className="text-xl uppercase font-bold tracking-widest text-white">{selectedChar.name.split(' ')[0]}</h4>
                </div>
              </div>

              {/* Right Column: Detailed Bio & Stats */}
              <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-between h-auto md:h-[550px] overflow-y-auto bg-black/95">
                <div>
                  
                  {/* Header Title Glitch Block */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-[#FF0000] text-xs font-mono font-bold tracking-[0.25em] uppercase mb-1.5">
                        {selectedChar.faction}
                      </div>
                      <h3 
                        className="text-4xl md:text-5xl uppercase tracking-tighter text-white font-bold leading-none" 
                        style={{ fontFamily: 'Teko, sans-serif' }}
                      >
                        {selectedChar.name}
                      </h3>
                    </div>

                    {/* Futuristic Close Button */}
                    <button 
                      onClick={closeModal}
                      className="relative border border-neutral-800 hover:border-[#FF0000] hover:text-[#FF0000] px-3.5 py-1.5 font-mono text-xs tracking-wider uppercase bg-neutral-900 transition-colors flex items-center justify-center gap-1.5"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
                    >
                      <span>CLOSE</span>
                      <span className="text-[#FF0000] font-bold">✖</span>
                    </button>
                  </div>

                  {/* Character Meta Specifications Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 border-y border-neutral-800 py-4">
                    <div>
                      <span className="text-[10px] text-white/40 block font-mono uppercase tracking-widest mb-0.5">Signature Weapon</span>
                      <span className="text-xs text-white uppercase tracking-wider font-semibold font-mono">{selectedChar.weapon}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block font-mono uppercase tracking-widest mb-0.5">Combat Specialty</span>
                      <span className="text-xs text-white uppercase tracking-wider font-semibold font-mono">{selectedChar.specialty}</span>
                    </div>
                  </div>

                  {/* Deep Narrative Backstory (Lore) */}
                  <div className="mb-6">
                    <h5 className="text-xs text-white/40 font-mono uppercase tracking-widest mb-2">// DETAILED INTEGRATION RECORD</h5>
                    <p className="text-white/80 text-sm leading-relaxed font-mono">
                      {selectedChar.backstory}
                    </p>
                  </div>

                </div>

                {/* Tactical HUD Stat Bar Dashboard */}
                <div>
                  <h5 className="text-xs text-white/40 font-mono uppercase tracking-widest mb-3.5">// TACTICAL SYSTEMS SYNAPSE LOAD</h5>
                  <div className="space-y-3.5">
                    {Object.entries(selectedChar.fullStats).map(([statName, statVal]) => (
                      <div key={statName}>
                        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest mb-1">
                          <span className="text-white/50 uppercase">{statName}</span>
                          <span className="text-[#FF0000] font-bold">{statVal}%</span>
                        </div>
                        <div className="w-full bg-neutral-900 h-1.5 border border-neutral-800 overflow-hidden relative">
                          <div 
                            className="bg-[#FF0000] h-full shadow-[0_0_8px_#FF0000] transition-all duration-700 ease-out"
                            style={{ width: `${statVal}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </section>
  );
}
