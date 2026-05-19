import { useState, useRef } from 'react';

export function Navbar() {
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
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />

      <div className="max-w-[1440px] mx-auto px-8 py-6 flex items-center justify-between">
        {/* Logo with Glitch Effect and Katana Symbols */}
        <div className="relative">
          <div className="text-white text-3xl tracking-widest uppercase relative" style={{ fontFamily: 'Teko, sans-serif', fontWeight: 700 }}>
            {/* Glitch cut lines */}
            <div className="absolute -top-1 left-0 w-12 h-0.5 bg-[#FF0000]"></div>
            <div className="absolute top-1 right-0 w-8 h-0.5 bg-[#FF0000] opacity-60"></div>

            CYBER SAMURAI
          </div>

          {/* Small Katana Symbols */}
          <div className="flex gap-2 mt-1 justify-center items-center">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-[#FF0000] to-transparent"></div>
            <span className="text-[#FF0000] text-xs">⚔</span>
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-[#FF0000] to-transparent"></div>
          </div>
        </div>

        {/* Navigation Links with Cyberpunk Style */}
        <div className="hidden md:flex items-center gap-10 font-mono text-base tracking-[0.28em] relative">
          <button 
            onClick={() => handleScrollTo('#hero')} 
            className="text-white/80 hover:text-white hover:drop-shadow-[0_0_12px_#FF0000] transition-all duration-300 cursor-none uppercase relative group"
            style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}
          >
            HOME
            <span className="absolute -bottom-1.5 left-0 w-0 h-[3px] bg-[#FF0000] shadow-[0_0_10px_#FF0000] group-hover:w-full transition-all duration-300"></span>
          </button>
          <button 
            onClick={() => handleScrollTo('#lore')} 
            className="text-white/80 hover:text-white hover:drop-shadow-[0_0_12px_#FF0000] transition-all duration-300 cursor-none uppercase relative group"
            style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}
          >
            LORE
            <span className="absolute -bottom-1.5 left-0 w-0 h-[3px] bg-[#FF0000] shadow-[0_0_10px_#FF0000] group-hover:w-full transition-all duration-300"></span>
          </button>
          <button 
            onClick={() => handleScrollTo('#showcase')} 
            className="text-white/80 hover:text-white hover:drop-shadow-[0_0_12px_#FF0000] transition-all duration-300 cursor-none uppercase relative group"
            style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}
          >
            WARRIORS
            <span className="absolute -bottom-1.5 left-0 w-0 h-[3px] bg-[#FF0000] shadow-[0_0_10px_#FF0000] group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>

        <div className="flex items-center gap-6">
          {/* Cyberpunk Audio HUD Switch */}
          <button 
            onClick={toggleAudio}
            className={`relative border-2 px-5 py-2.5 font-mono text-xs tracking-widest transition-all duration-300 flex items-center gap-2 group ${
              isPlaying 
                ? 'border-[#FF0000] text-[#FF0000] shadow-[0_0_15px_rgba(255,0,0,0.4)]' 
                : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'
            }`}
            style={{
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
            }}
          >
            {/* Pulsing indicator */}
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#FF0000] animate-pulse shadow-[0_0_8px_#FF0000]' : 'bg-white/20'}`}></span>
            
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600 }}>
              AUDIO // {isPlaying ? 'SYS_ONLINE' : 'SYS_OFFLINE'}
            </span>

            {/* Visualizer bar mini animation when playing */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3 ml-1">
                <div className="w-0.5 bg-[#FF0000] animate-[bar-wave_0.8s_ease-in-out_infinite_alternate]" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-0.5 bg-[#FF0000] animate-[bar-wave_0.6s_ease-in-out_infinite_alternate]" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-0.5 bg-[#FF0000] animate-[bar-wave_0.9s_ease-in-out_infinite_alternate]" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </button>

          {/* Ultra-Premium Dual-Chassis Play Widget */}
          <div className="flex items-center pointer-events-auto">
            {/* Left Indicator Chamber: Pulse Beacon */}
            <div className="bg-[#FF0000]/10 border-t border-b border-l border-[#FF0000]/40 text-[#FF0000] font-mono text-[9px] px-3.5 py-4 tracking-widest hidden lg:flex items-center justify-center gap-1.5 font-bold shadow-[inset_0_0_8px_rgba(255,0,0,0.1)]"
              style={{
                clipPath: 'polygon(8px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 8px)',
                borderRight: 'none',
                height: '47.5px'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] animate-[ping_1.2s_infinite]"></span>
              [SYS_01]
            </div>

            {/* Right Interactive Chamber: Scramble Button */}
            <button
              onClick={() => {}}
              onMouseEnter={handlePlayMouseEnter}
              onMouseLeave={handlePlayMouseLeave}
              className="relative text-white hover:text-black bg-black/75 hover:bg-[#FF0000] transition-all duration-300 border border-[#FF0000] px-10 py-3 uppercase tracking-[0.22em] font-bold overflow-hidden group cursor-none nav-play-btn"
              style={{
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 700,
                borderRadius: '0px',
                clipPath: 'polygon(0px 0px, calc(100% - 12px) 0px, 100% 12px, 100% 100%, 0px 100%, 0px 0px)',
                animation: 'neon-glow-pulse 4s infinite ease-in-out',
                height: '47.5px'
              }}
            >
              {/* Top Cyan Sliding Scanning Laser */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00FFFF] to-transparent animate-[scan-laser_2s_linear_infinite_reverse]"></div>
              
              {/* Bottom Red Sliding Scanning Laser */}
              <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF0000] to-transparent animate-[scan-laser_2s_linear_infinite]"></div>

              {/* High-Tech Dot Grid Texture Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,0,0,0.18)_1.2px,transparent_1.2px)] bg-[size:5px_5px] opacity-40 group-hover:opacity-0 transition-opacity"></div>
              
              {/* Sliding metallic shine */}
              <span className="absolute inset-0 block w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>

              {/* Main Scrambling Decryption Text Label */}
              <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-extrabold group-hover:opacity-0 transition-opacity duration-200">
                {playBtnText}
              </span>
              <span className="absolute inset-0 flex items-center justify-center bg-white text-black font-extrabold opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span>
                PLAY NOW
              </span>

              {/* Glitch Overlay 1 (Cyan Shadow) */}
              <span className="absolute inset-0 bg-[#00FFFF] text-black px-10 py-3 uppercase tracking-[0.22em] font-bold border border-[#00FFFF] pointer-events-none nav-play-glitch-1 z-0 flex items-center justify-center"
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  borderRadius: '0px',
                  clipPath: 'polygon(0px 0px, calc(100% - 12px) 0px, 100% 12px, 100% 100%, 0px 100%, 0px 0px)',
                  top: '-2.5px',
                  left: '-2.5px'
                }}
              >
                PLAY NOW
              </span>

              {/* Glitch Overlay 2 (Magenta Shadow) */}
              <span className="absolute inset-0 bg-[#FF00FF] text-white px-10 py-3 uppercase tracking-[0.22em] font-bold border border-[#FF00FF] pointer-events-none nav-play-glitch-2 z-0 flex items-center justify-center"
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  borderRadius: '0px',
                  clipPath: 'polygon(0px 0px, calc(100% - 12px) 0px, 100% 12px, 100% 100%, 0px 100%, 0px 0px)',
                  top: '2.5px',
                  left: '2.5px'
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
