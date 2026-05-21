import { useState, useRef } from 'react';

interface NavbarProps {
  onPlayClick?: () => void;
}

export function Navbar({ onPlayClick }: NavbarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playBtnText, setPlayBtnText] = useState("PLAY NOW");
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscRef1 = useRef<OscillatorNode | null>(null);
  const oscRef2 = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  const handlePlayMouseEnter = () => {
    const chars = "ｦｧｨｩ⚔️⚡🤖👾武士道影斬剣魂";
    let iterations = 0;
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);

    playIntervalRef.current = setInterval(() => {
      setPlayBtnText(
        "PLAY NOW"
          .split("")
          .map((char, index) => {
            if (index < iterations) return "PLAY NOW"[index];
            if (char === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      iterations += 0.8;
      if (iterations >= "PLAY NOW".length) {
        if (playIntervalRef.current) clearInterval(playIntervalRef.current);
        setPlayBtnText("PLAY NOW");
      }
    }, 30);
  };

  const handlePlayMouseLeave = () => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    setPlayBtnText("PLAY NOW");
  };

  const handleScrollTo = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startDrone = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // GainNode to fade sound in and out smoothly
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.connect(ctx.destination);
        gainNodeRef.current = gainNode;

        // Deep Low-pass Filter to cut off bright tones and make it dark & cinematic
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(3, ctx.currentTime);
        filter.frequency.setValueAtTime(110, ctx.currentTime); // Low frequency
        filter.connect(gainNode);

        // Deep Sawtooth Bass oscillator
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
        osc1.connect(filter);
        osc1.start();
        oscRef1.current = osc1;

        // Warm Triangle Sub-Bass oscillator (detuned slightly for rich chorusing)
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(55.4, ctx.currentTime);
        osc2.connect(filter);
        osc2.start();
        oscRef2.current = osc2;

        // LFO to modulate the filter frequency slowly (breathing wind/synth drone)
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // 0.06Hz - very slow cycle
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(30, ctx.currentTime); // Modulates frequency between 80Hz and 140Hz

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        lfoRef.current = lfo;
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const gainNode = gainNodeRef.current;
      if (gainNode) {
        // Prevent pops: cancel previous ramps and start transition from current value
        gainNode.gain.cancelScheduledValues(ctx.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.2);
      }
    } catch (e) {
      console.error("Web Audio API not supported or blocked", e);
    }
  };

  const stopDrone = () => {
    const ctx = audioCtxRef.current;
    const gainNode = gainNodeRef.current;
    if (ctx && gainNode) {
      // Smooth fade-out over 0.8 seconds
      gainNode.gain.cancelScheduledValues(ctx.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    }
  };

  const playSlashSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioContextClass();
      if (!audioCtxRef.current) audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      // Fast slicing wind swoosh (pre-impact)
      const swoosh = ctx.createOscillator();
      swoosh.type = 'triangle';
      swoosh.frequency.setValueAtTime(900, now);
      swoosh.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);

      swoosh.connect(filter);
      filter.connect(gainNode);

      // Heavy metal thud clang (impact body)
      const clangOsc = ctx.createOscillator();
      clangOsc.type = 'sawtooth';
      clangOsc.frequency.setValueAtTime(190, now + 0.12); // Deep chest thud on impact

      // Crystal metallic chime ring (blade ring)
      const ringOsc = ctx.createOscillator();
      ringOsc.type = 'sine';
      ringOsc.frequency.setValueAtTime(3200, now + 0.12); // High-pitch steel resonance

      const impactGain = ctx.createGain();
      impactGain.gain.setValueAtTime(0, now);
      impactGain.gain.setValueAtTime(0.42, now + 0.12); // Heavy slam!
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8); // Long decaying ring

      clangOsc.connect(impactGain);
      ringOsc.connect(impactGain);
      impactGain.connect(gainNode);

      // Swoosh envelope (cutoff immediately upon impact)
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.22, now + 0.04);
      gainNode.gain.setValueAtTime(0, now + 0.12); 

      swoosh.start(now);
      swoosh.stop(now + 0.12);
      
      clangOsc.start(now + 0.12);
      clangOsc.stop(now + 0.8);
      
      ringOsc.start(now + 0.12);
      ringOsc.stop(now + 0.8);
    } catch (e) {
      console.warn("Stab sound ignored:", e);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopDrone();
      setIsPlaying(false);
    } else {
      startDrone();
      setIsPlaying(true);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-sm select-none">
      {/* Visualizer and High-Tech Button CSS style tag */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bar-wave {
          0% { height: 2px; }
          100% { height: 10px; }
        }
        @keyframes scan-laser {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes neon-glow-pulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.2), inset 0 0 5px rgba(255,0,0,0.1); }
          50% { box-shadow: 0 0 22px rgba(255, 0, 0, 0.65), inset 0 0 10px rgba(255,0,0,0.3); }
        }
        @keyframes play-glitch-1 {
          0% { clip-path: inset(30% 0 65% 0); transform: translate(-4px, -2px); }
          20% { clip-path: inset(88% 0 2% 0); transform: translate(2px, 4px); }
          40% { clip-path: inset(10% 0 85% 0); transform: translate(-2px, -4px); }
          60% { clip-path: inset(75% 0 8% 0); transform: translate(4px, 2px); }
          80% { clip-path: inset(5% 0 90% 0); transform: translate(-4px, 2px); }
          100% { clip-path: inset(30% 0 65% 0); transform: translate(-4px, -2px); }
        }
        @keyframes play-glitch-2 {
          0% { clip-path: inset(20% 0 60% 0); transform: translate(4px, 2px); }
          20% { clip-path: inset(65% 0 15% 0); transform: translate(-2px, -4px); }
          40% { clip-path: inset(8% 0 80% 0); transform: translate(2px, 4px); }
          60% { clip-path: inset(80% 0 4% 0); transform: translate(-4px, -2px); }
          80% { clip-path: inset(15% 0 68% 0); transform: translate(4px, -2px); }
          100% { clip-path: inset(20% 0 60% 0); transform: translate(4px, 2px); }
        }
        .nav-play-glitch-1 {
          display: none;
        }
        .nav-play-btn:hover .nav-play-glitch-1 {
          display: flex;
          animation: play-glitch-1 0.22s infinite linear alternate-reverse;
        }
        .nav-play-glitch-2 {
          display: none;
        }
        .nav-play-btn:hover .nav-play-glitch-2 {
          display: flex;
          animation: play-glitch-2 0.18s infinite linear alternate-reverse;
        }

        /* Ultra-Premium Red, White, and Black Sliced Cyberpunk Logo */
        .cyber-logo-split {
          position: relative;
          display: inline-block;
          padding: 3px 10px;
          cursor: pointer;
          background: linear-gradient(135deg, #050507, #0f0f12);
          border: 1px solid rgba(255, 0, 60, 0.25);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: visible; /* Allow sword handle/tip to stick out! */
          box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.95), 0 5px 25px rgba(0, 0, 0, 0.65);
        }

        .cyber-logo-split:hover {
          background: linear-gradient(135deg, #09090c, #16161d);
          border-color: rgba(255, 0, 60, 0.6);
          box-shadow: inset 0 0 20px rgba(255, 0, 60, 0.08), 0 0 35px rgba(255, 0, 60, 0.25);
        }

        .hud-bracket {
          position: absolute;
          width: 6px;
          height: 6px;
          border-color: rgba(255, 255, 255, 0.15);
          border-style: solid;
          transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .hud-tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
        .hud-tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
        .hud-bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
        .hud-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

        .cyber-logo-split:hover .hud-tl { transform: translate(-4px, -4px); border-color: #ffffff; filter: drop-shadow(0 0 3px #ffffff); }
        .cyber-logo-split:hover .hud-tr { transform: translate(4px, -4px); border-color: #ff003c; filter: drop-shadow(0 0 3px #ff003c); }
        .cyber-logo-split:hover .hud-bl { transform: translate(-4px, 4px); border-color: #ff003c; filter: drop-shadow(0 0 3px #ff003c); }
        .cyber-logo-split:hover .hud-br { transform: translate(4px, 4px); border-color: #ffffff; filter: drop-shadow(0 0 3px #ffffff); }

        .cyber-text-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          text-transform: uppercase;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: 0.08s; /* Sync with sword impact (100ms-120ms) */
          pointer-events: none;
        }

        .text-invisible {
          text-transform: uppercase;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 
          Robust typography with solid colors & thick strokes to prevent WebKit clipping bugs.
          100% reliable across all browsers.
        */
        .cyber-text-cyber {
          font-family: "Syncopate", sans-serif;
          font-size: 0.55rem;
          font-weight: 900;
          letter-spacing: 0.18em;
          color: #ffffff;
          -webkit-text-stroke: 1px #000000;
          text-shadow: 1.5px 1.5px 0px #000000, 0 0 5px rgba(255, 255, 255, 0.25);
          transition: all 0.35s;
        }

        .cyber-text-samurai {
          font-family: "Orbitron", sans-serif;
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          margin-left: 5px;
          color: #ff003c;
          -webkit-text-stroke: 1px #000000;
          text-shadow: 1.8px 1.8px 0px #000000, 0 0 6px rgba(255, 0, 60, 0.5);
          transition: all 0.35s;
        }

        .cyber-logo-split:hover .cyber-text-cyber {
          text-shadow: 2px 2px 0px #ff003c, 0 0 8px rgba(255, 255, 255, 0.4);
        }

        .cyber-logo-split:hover .cyber-text-samurai {
          text-shadow: 2px 2px 0px #ffffff, 0 0 10px rgba(255, 0, 60, 0.7);
        }

        /* 
          Default/Idle State: FULL, SOLID text. No cuts, no gaps!
          Completely solves the "already split" amateurish look.
        */
        .text-top {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          z-index: 20;
        }
        .text-bottom {
          clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
          opacity: 0;
          z-index: 10;
        }

        /* Hover displacement: Apply sharp horizontal split & move apart */
        .cyber-logo-split:hover .text-top {
          clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
          transform: translateY(-2.5px);
        }
        .cyber-logo-split:hover .text-bottom {
          clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
          transform: translateY(2.5px);
          opacity: 1;
        }

        /* Horizontal Neon Laser Slash inside the split gap */
        .cyber-slash-line {
          position: absolute;
          left: 5%;
          right: 5%;
          height: 2px;
          background: #ffffff;
          box-shadow: 0 0 18px #ff003c, 0 0 6px #ffffff, 0 0 35px #ff003c;
          top: 50%;
          transform: translateY(-50%) scaleX(0);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s;
          transition-delay: 0.08s;
          opacity: 0;
          z-index: 15;
          pointer-events: none;
        }
        .cyber-logo-split:hover .cyber-slash-line {
          transform: translateY(-50%) scaleX(1);
          opacity: 1;
        }

        /* Physical SVG Katana Sword horizontal stab & stick (Lengthened to 290px) */
        .cyber-katana {
          position: absolute;
          width: 290px;
          height: 18px;
          pointer-events: none;
          z-index: 50;
          top: 50%;
          left: 0;
          transform: translateY(-50%) translateX(-290px);
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cyber-logo-split:hover .cyber-katana {
          opacity: 1;
          animation: sword-stab-horizontal 0.45s cubic-bezier(0.15, 0.85, 0.35, 1.15) forwards;
          transition: none; /* Let animation take over on hover */
        }

        @keyframes sword-stab-horizontal {
          0% {
            transform: translateY(-50%) translateX(-290px) scaleX(1.8) scaleY(0.6);
            opacity: 0;
          }
          /* High-speed motion blur streak enters */
          15% {
            transform: translateY(-50%) translateX(-100px) scaleX(1.4) scaleY(0.8);
            opacity: 1;
          }
          /* Deep impact thud: sword hits and lodges at a slight violent tilt angle */
          25% {
            transform: translateY(-50%) translateX(-48px) scaleX(1) scaleY(1) rotate(-1.5deg);
            opacity: 1;
          }
          /* Recoil bounce */
          35% {
            transform: translateY(-50%) translateX(-59px) scaleX(1) scaleY(1) rotate(0.5deg);
            opacity: 1;
          }
          45% {
            transform: translateY(-50%) translateX(-54px) translateY(-1px) rotate(-1deg);
            opacity: 1;
          }
          55% {
            transform: translateY(-50%) translateX(-57px) translateY(1px) rotate(-0.5deg);
            opacity: 1;
          }
          65% {
            transform: translateY(-50%) translateX(-56px) translateY(0) rotate(-0.8deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) translateX(-56px) translateY(0) rotate(-0.8deg);
            opacity: 1;
          }
        }

        .cyber-kanji {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          user-select: none;
          z-index: 0;
          opacity: 0.08;
          color: #ff003c;
          filter: grayscale(1);
          text-shadow: 0 0 10px rgba(255, 0, 60, 0.1);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: "Noto Serif JP", "MS Mincho", "Hiragino Mincho ProN", serif;
          font-size: 1.8rem;
          font-weight: 900;
        }
        .cyber-logo-split:hover .cyber-kanji {
          opacity: 0.35;
          color: #ff003c;
          filter: none;
          text-shadow: 0 0 20px rgba(255, 0, 60, 0.7);
          animation: kanji-shake-impact 0.35s ease-out forwards;
          animation-delay: 0.08s;
        }

        @keyframes kanji-shake-impact {
          0% { transform: scale(1) rotate(0deg); }
          15% { transform: scale(1.22) rotate(-8deg); }
          30% { transform: scale(1.22) rotate(8deg); }
          45% { transform: scale(1.18) rotate(-4deg); }
          60% { transform: scale(1.18) rotate(4deg); }
          75% { transform: scale(1.14) rotate(-1.5deg); }
          100% { transform: scale(1.16) rotate(0deg); }
        }

        @keyframes scanline-anim {
          0% { top: -10%; }
          50% { top: 110%; }
          100% { top: 110%; }
        }
        .cyber-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 0, 60, 0.2);
          box-shadow: 0 0 8px rgba(255, 0, 60, 0.35);
          pointer-events: none;
          z-index: 30;
          animation: scanline-anim 4s linear infinite;
        }
      `}} />

      <div className="max-w-[1440px] mx-auto px-8 py-1 flex items-center justify-between">
        {/* Advanced Interactive Sliced Cyberpunk Logo */}
        <div className="cyber-logo-split group" onMouseEnter={playSlashSound}>
          {/* Traditional Calligraphy Background Decal '侍' (Samurai) */}
          <div className="cyber-kanji">
            侍
          </div>

          {/* HUD Tech Corner Brackets */}
          <div className="hud-bracket hud-tl"></div>
          <div className="hud-bracket hud-tr"></div>
          <div className="hud-bracket hud-bl"></div>
          <div className="hud-bracket hud-br"></div>

          {/* Hologram Scanline Overlay */}
          <div className="cyber-scanline"></div>

          {/* Slashed Glowing Text Wrapper */}
          <div className="relative py-1 px-1 flex items-center justify-center z-10">
            {/* Ultra-Premium Cyberpunk Tactical Katana SVG */}
            <svg className="cyber-katana" viewBox="0 0 550 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Sleek Matte Black Tactical Handle (Tsuka) */}
              <rect x="10" y="16" width="70" height="8" rx="2" fill="#08080c" stroke="#3f0f15" strokeWidth="1" />
              {/* Grip wraps (Tactical Red dashes) */}
              <path d="M 20 16 L 25 24 M 30 16 L 35 24 M 40 16 L 45 24 M 50 16 L 55 24 M 60 16 L 65 24 M 70 16 L 75 24" stroke="#ff003c" strokeWidth="1.5" />
              
              {/* Hexagonal Futuristic Hilt Guard (Tsuba) */}
              <polygon points="80,10 85,12 85,28 80,30" fill="#020203" stroke="#ff003c" strokeWidth="1" filter="drop-shadow(0 0 3px #ff003c)" />
              
              {/* Collar (Habaki) */}
              <rect x="85" y="17" width="12" height="6" fill="#2d1c1e" stroke="#5c2c31" strokeWidth="0.5" />
              
              {/* Ultra-Lethal Steel Blade */}
              <path d="M 97 18 L 515 18 L 525 21 L 97 22 Z" fill="url(#katana-blade-metal)" />
              
              {/* Hot crimson mono-molecular plasma cutting edge */}
              <path d="M 97 22 L 525 21" stroke="#ffffff" strokeWidth="1" filter="drop-shadow(0 0 2px #ffffff)" opacity="0.9" />
              <path d="M 97 22 L 525 21" stroke="#ff003c" strokeWidth="2" filter="drop-shadow(0 0 5px #ff003c)" />
              
              {/* Blood Groove (Hi) */}
              <path d="M 115 19.5 L 495 19.5" stroke="#ff003c" strokeWidth="0.8" opacity="0.8" />
              
              {/* Laser Etched Blade Decal */}
              <text x="150" y="21" fill="#ffffff" fontSize="4.5" fontFamily="monospace" letterSpacing="1.8" opacity="0.9">SYS.ERR // SHIN-UCHI</text>

              <defs>
                <linearGradient id="katana-blade-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1a1a24" />
                  <stop offset="40%" stopColor="#2c2c38" />
                  <stop offset="70%" stopColor="#0f0f14" />
                  <stop offset="90%" stopColor="#dcdce6" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>

            {/* Horizontal Slash Spark Flare */}
            <div className="cyber-slash-line"></div>

            {/* Top Text Layer */}
            <div className="cyber-text-layer text-top flex items-center justify-center">
              <span className="cyber-text-cyber">CYBER</span>
              <span className="cyber-text-samurai">SAMURAI</span>
            </div>

            {/* Bottom Text Layer */}
            <div className="cyber-text-layer text-bottom flex items-center justify-center" aria-hidden="true">
              <span className="cyber-text-cyber">CYBER</span>
              <span className="cyber-text-samurai">SAMURAI</span>
            </div>

            {/* Static invisible text to maintain layout size */}
            <div className="text-invisible opacity-0 pointer-events-none select-none flex items-center justify-center">
              <span className="cyber-text-cyber">CYBER</span>
              <span className="cyber-text-samurai">SAMURAI</span>
            </div>
          </div>

          {/* Sub-HUD Techwear Decos */}
          <div className="flex justify-between items-center w-full mt-1 px-1 z-10 select-none">
            <div className="flex gap-1 items-center">
              <span className="w-2 h-[1.5px] bg-[#ff003c] group-hover:bg-white group-hover:shadow-[0_0_8px_#ffffff] transition-all duration-300"></span>
              <span className="w-[2px] h-[2px] rounded-full bg-white/20"></span>
              <span className="text-[5.5px] font-mono text-white/30 tracking-widest font-bold">HUD // v2.8</span>
            </div>
            <div className="text-[6.5px] font-mono text-white/40 tracking-[0.4em] uppercase flex items-center gap-1 group-hover:text-white transition-colors duration-300">
              <span className="w-1 h-1 rounded-full bg-[#ff003c] animate-ping duration-1000"></span>
              SYS_ON
            </div>
            <div className="flex gap-1 items-center">
              <span className="text-[5.5px] font-mono text-[#ff003c] tracking-widest font-bold opacity-40 group-hover:opacity-100 transition-opacity">LN.09</span>
              <span className="w-[2px] h-[2px] rounded-full bg-white/20"></span>
              <span className="w-2 h-[1.5px] bg-[#ff003c] group-hover:bg-white group-hover:shadow-[0_0_8px_#ffffff] transition-all duration-300"></span>
            </div>
          </div>
        </div>

        {/* Navigation Links with Cyberpunk Style */}
        <div className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.25em] relative">
          <button
            onClick={() => handleScrollTo('#hero')}
            className="text-white/80 hover:text-white hover:drop-shadow-[0_0_12px_#FF0000] transition-all duration-300 cursor-pointer uppercase relative group"
            style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}
          >
            HOME
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FF0000] shadow-[0_0_10px_#FF0000] group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            onClick={() => handleScrollTo('#lore')}
            className="text-white/80 hover:text-white hover:drop-shadow-[0_0_12px_#FF0000] transition-all duration-300 cursor-pointer uppercase relative group"
            style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}
          >
            LORE
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FF0000] shadow-[0_0_10px_#FF0000] group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            onClick={() => handleScrollTo('#showcase')}
            className="text-white/80 hover:text-white hover:drop-shadow-[0_0_12px_#FF0000] transition-all duration-300 cursor-pointer uppercase relative group"
            style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}
          >
            WARRIORS
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FF0000] shadow-[0_0_10px_#FF0000] group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Cyberpunk Audio HUD Switch */}
          <button
            onClick={toggleAudio}
            className={`relative border px-3.5 py-1.5 font-mono text-[10px] tracking-widest transition-all duration-300 flex items-center gap-2 group ${isPlaying
                ? 'border-[#FF0000] text-[#FF0000] shadow-[0_0_12px_rgba(255,0,0,0.4)]'
                : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'
              }`}
            style={{
              clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
              height: '32px'
            }}
          >
            {/* Pulsing indicator */}
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#FF0000] animate-pulse shadow-[0_0_8px_#FF0000]' : 'bg-white/20'}`}></span>

            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}>
              AUDIO // {isPlaying ? 'SYS_ONLINE' : 'SYS_OFFLINE'}
            </span>

            {/* Visualizer bar mini animation when playing */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-2.5 ml-0.5">
                <div className="w-[1.5px] bg-[#FF0000] animate-[bar-wave_0.8s_ease-in-out_infinite_alternate]" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-[1.5px] bg-[#FF0000] animate-[bar-wave_0.6s_ease-in-out_infinite_alternate]" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-[1.5px] bg-[#FF0000] animate-[bar-wave_0.9s_ease-in-out_infinite_alternate]" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </button>

          {/* Ultra-Premium Dual-Chassis Play Widget */}
          <div className="flex items-center pointer-events-auto">
            {/* Left Indicator Chamber: Pulse Beacon */}
            <div className="bg-[#FF0000]/10 border-t border-b border-l border-[#FF0000]/40 text-[#FF0000] font-mono text-[8px] px-2.5 tracking-widest hidden lg:flex items-center justify-center gap-1.5 font-bold shadow-[inset_0_0_8px_rgba(255,0,0,0.1)]"
              style={{
                clipPath: 'polygon(6px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 6px)',
                borderRight: 'none',
                height: '32px'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] animate-[ping_1.2s_infinite]"></span>
              [SYS_01]
            </div>

            {/* Right Interactive Chamber: Scramble Button */}
            <button
              onClick={onPlayClick}
              onMouseEnter={handlePlayMouseEnter}
              onMouseLeave={handlePlayMouseLeave}
              className="relative text-white hover:text-black bg-black/75 hover:bg-[#FF0000] transition-all duration-300 border border-[#FF0000] px-6 uppercase tracking-[0.15em] font-bold overflow-hidden group cursor-pointer nav-play-btn"
              style={{
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 700,
                borderRadius: '0px',
                clipPath: 'polygon(0px 0px, calc(100% - 8px) 0px, 100% 8px, 100% 100%, 0px 100%, 0px 0px)',
                animation: 'neon-glow-pulse 4s infinite ease-in-out',
                height: '32px'
              }}
            >
              {/* Top Cyan Sliding Scanning Laser */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00FFFF] to-transparent animate-[scan-laser_2s_linear_infinite_reverse]"></div>

              {/* Bottom Red Sliding Scanning Laser */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF0000] to-transparent animate-[scan-laser_2s_linear_infinite]"></div>

              {/* High-Tech Dot Grid Texture Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,0,0,0.18)_1.2px,transparent_1.2px)] bg-[size:5px_5px] opacity-40 group-hover:opacity-0 transition-opacity"></div>

              {/* Sliding metallic shine */}
              <span className="absolute inset-0 block w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>

              {/* Main Scrambling Decryption Text Label */}
              <span className="relative z-10 flex items-center justify-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-extrabold group-hover:opacity-0 transition-opacity duration-200 text-xs">
                {playBtnText}
              </span>
              <span className="absolute inset-0 flex items-center justify-center bg-white text-black font-extrabold opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span>
                PLAY NOW
              </span>

              {/* Glitch Overlay 1 (Cyan Shadow) */}
              <span className="absolute inset-0 bg-[#00FFFF] text-black px-6 uppercase tracking-[0.15em] font-bold border border-[#00FFFF] pointer-events-none nav-play-glitch-1 z-0 flex items-center justify-center text-xs"
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  borderRadius: '0px',
                  clipPath: 'polygon(0px 0px, calc(100% - 8px) 0px, 100% 8px, 100% 100%, 0px 100%, 0px 0px)',
                  top: '-2px',
                  left: '-2px',
                  height: '32px'
                }}
              >
                PLAY NOW
              </span>

              {/* Glitch Overlay 2 (Magenta Shadow) */}
              <span className="absolute inset-0 bg-[#FF00FF] text-white px-6 uppercase tracking-[0.15em] font-bold border border-[#FF00FF] pointer-events-none nav-play-glitch-2 z-0 flex items-center justify-center text-xs"
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  borderRadius: '0px',
                  clipPath: 'polygon(0px 0px, calc(100% - 8px) 0px, 100% 8px, 100% 100%, 0px 100%, 0px 0px)',
                  top: '2px',
                  left: '2px',
                  height: '32px'
                }}
              >
                PLAY NOW
              </span>
            </button>
          </div>
          </div>
        </div>
      </nav>
  );
}
