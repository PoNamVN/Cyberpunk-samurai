import { useState, useRef } from 'react';

export function Navbar({ onPlayClick }: { onPlayClick?: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscRef1 = useRef<OscillatorNode | null>(null);
  const oscRef2 = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

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
      {/* Visualizer CSS style tag */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bar-wave {
          0% { height: 2px; }
          100% { height: 10px; }
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

          {/* Futuristic Cyberpunk Chamfered Stroke Button */}
          <button
            onClick={onPlayClick}
            className="relative text-white hover:text-black bg-[#FF0000]/10 hover:bg-[#FF0000] transition-all duration-300 border-2 border-[#FF0000] px-10 py-3.5 uppercase tracking-[0.25em] font-bold shadow-[0_0_15px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.85)] overflow-hidden group cursor-none"
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              borderRadius: '0px',
              clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))'
            }}
          >
            {/* Ambient cyber grid scanline inside the button */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-30 group-hover:opacity-0 transition-opacity"></div>
            
            {/* Sliding laser reflection sheen */}
            <span className="absolute inset-0 block w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>

            <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">PLAY NOW</span>

            {/* Micro tech corner indicator dots */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#FF0000] rounded-none opacity-40 group-hover:bg-black transition-colors"></div>
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#FF0000] rounded-none opacity-40 group-hover:bg-black transition-colors"></div>
          </button>
        </div>
      </div>
    </nav>
  );
}
