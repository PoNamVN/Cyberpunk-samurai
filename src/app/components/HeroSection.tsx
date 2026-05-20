import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { ScrambleText } from './ui/ScrambleText';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [kanjiText, setKanjiText] = useState('武士道');
  const [kanjiOpacity, setKanjiOpacity] = useState(0.75);

  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const lightLeaksRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- Cyber-Slash Sound & Screen Shake Integration ---
  const playCyberSlashSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      // Heavy resonance lowpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);
      filter.Q.setValueAtTime(6, ctx.currentTime);

      // White Noise buffer for the friction/whoosh sound
      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Noise volume envelope
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.35);

      // Sawtooth laser sweep node (metallic edge)
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.3);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.18, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.25);

      // Connect noise and synth
      noise.connect(noiseGain);
      noiseGain.connect(filter);

      osc.connect(oscGain);
      oscGain.connect(filter);

      filter.connect(ctx.destination);

      noise.start();
      osc.start();

      noise.stop(ctx.currentTime + 0.35);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("AudioContext blocked or failed to initialize", e);
    }
  };

  const triggerSlash = () => {
    // 1. Play Dynamic Cyber katana slash Whoosh Sound (Disabled per user request)
    // playCyberSlashSound();

    // 2. Camera Shake (Simulate physical impact on HUD & Title content)
    if (contentRef.current) {
      const tl = gsap.timeline();
      tl.to(contentRef.current, { x: gsap.utils.random(-8, 8), y: gsap.utils.random(-8, 8), duration: 0.05 })
        .to(contentRef.current, { x: gsap.utils.random(-6, 6), y: gsap.utils.random(-6, 6), duration: 0.05 })
        .to(contentRef.current, { x: gsap.utils.random(-4, 4), y: gsap.utils.random(-4, 4), duration: 0.05 })
        .to(contentRef.current, { x: 0, y: 0, duration: 0.05 });
    }
  };

  const handleSectionMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    triggerSlash();
  };

  // 1. High-Performance Frame Pre-rendering Engine
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/videos/samurai_bg.mp4';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');

    const totalFrames = 120; // 24 FPS for 5 seconds is incredibly detailed
    const loadedImages: HTMLImageElement[] = [];

    const loadFrames = async () => {
      await new Promise<void>((resolve) => {
        if (video.readyState >= 1) resolve();
        else video.addEventListener('loadedmetadata', () => resolve(), { once: true });
      });

      const duration = video.duration || 5;
      const step = duration / totalFrames;

      offscreenCanvas.width = 1280; // 720p resolution is extremely fast to seek and light on RAM
      offscreenCanvas.height = 720;

      for (let i = 0; i < totalFrames; i++) {
        const seekTime = i * step;
        video.currentTime = seekTime;

        // Wait until frame is fully seeked and decoded by the browser
        await new Promise<void>((resolve) => {
          video.addEventListener('seeked', () => resolve(), { once: true });
        });

        if (offscreenCtx) {
          // Draw video frame to offscreen canvas
          offscreenCtx.drawImage(video, 0, 0, 1280, 720);

          // Export canvas to high-performance JPEG
          const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.7);

          const img = new Image();
          img.src = dataUrl;
          loadedImages.push(img);
        }

        // Update progress state
        setLoadingProgress(Math.floor(((i + 1) / totalFrames) * 100));
      }

      setFrames(loadedImages);
      setIsPreloaded(true);
    };

    loadFrames().catch((err) => {
      console.error('Error preloading frames:', err);
      setIsPreloaded(true); // Graceful fallback
    });

    return () => {
      video.remove();
      offscreenCanvas.remove();
    };
  }, []);

  // 2. Hardware Canvas Drawing & GSAP Scroll Binding Loop
  useLayoutEffect(() => {
    if (!isPreloaded || frames.length === 0) return;

    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame();
    };

    // Smooth 3D Mouse Parallax Engine using GSAP quickTo (highly optimized, 0.00% lag)
    const xToContent = gsap.quickTo(contentRef.current, "x", { duration: 0.8, ease: "power3.out" });
    const yToContent = gsap.quickTo(contentRef.current, "y", { duration: 0.8, ease: "power3.out" });
    const xToCanvas = gsap.quickTo(canvasRef.current, "x", { duration: 1.2, ease: "power2.out" });
    const yToCanvas = gsap.quickTo(canvasRef.current, "y", { duration: 1.2, ease: "power2.out" });
    const xToLight = gsap.quickTo(lightLeaksRef.current, "x", { duration: 1.5, ease: "power1.out" });
    const yToLight = gsap.quickTo(lightLeaksRef.current, "y", { duration: 1.5, ease: "power1.out" });
    const xToParticles = gsap.quickTo(particlesRef.current, "x", { duration: 1.0, ease: "power2.out" });
    const yToParticles = gsap.quickTo(particlesRef.current, "y", { duration: 1.0, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xNorm = (clientX / window.innerWidth) - 0.5; // range: -0.5 to 0.5
      const yNorm = (clientY / window.innerHeight) - 0.5;

      xToContent(xNorm * 30);      // Drift foreground content
      yToContent(yNorm * 30);
      xToCanvas(xNorm * -15);      // Counter-drift background for stereoscopic 3D depth
      yToCanvas(yNorm * -15);
      xToLight(xNorm * 50);       // Large drift for atmospheric light leaks
      yToLight(yNorm * 50);
      xToParticles(xNorm * 20);   // Subtle drift for ambient smoke particles
      yToParticles(yNorm * 20);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const drawFrame = () => {
      const target = targetProgressRef.current;
      let current = currentProgressRef.current;

      // Smooth LERP mathematical easing (extremely responsive and buttery)
      current += (target - current) * 0.12;

      if (Math.abs(target - current) < 0.001) {
        current = target;
      }

      currentProgressRef.current = current;

      // Map progress to closest frame index
      const frameIndex = Math.min(
        frames.length - 1,
        Math.max(0, Math.floor(current * (frames.length - 1)))
      );

      const img = frames[frameIndex];
      if (img && img.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // CSS cover equivalent for HTML5 Canvas context
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.max(scaleX, scaleY);

        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx.drawImage(img, x, y, w, h);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const updateLoop = () => {
      drawFrame();
      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);

    // Setup the GSAP ScrollTrigger to track scroll progress and run cinematic reveal animations
    let ctxGsap = gsap.context(() => {
      // Reset text states initially (hidden until scroll progress reaches 50%)
      setIsRevealed(false);
      setKanjiText("武士道");
      setKanjiOpacity(0.75);
      gsap.set([titleRef.current, buttonRef.current], {
        opacity: 0,
        scale: 0.95,
        y: 35
      });
      gsap.set(scrollIndicatorRef.current, { opacity: 1, y: 0, x: 0, skewX: 0, scaleX: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=4000", // Restore original long cinematic scroll range
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            targetProgressRef.current = self.progress;

            // Calculate kanji text based on progress
            const progress = self.progress;
            if (progress < 0.25) {
              setKanjiText("武士道");
              setKanjiOpacity(0.75);
            } else if (progress >= 0.25 && progress < 0.40) {
              const ratio = (progress - 0.25) / 0.15; // 0 to 1
              const original = "武士道";
              const glitchChars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ⚔️⚡🤖👾";
              let currentText = "";

              // Character 0: original < 0.1, scramble < 0.5, blank >= 0.5
              // Character 1: original < 0.3, scramble < 0.75, blank >= 0.75
              // Character 2: original < 0.5, scramble < 0.95, blank >= 0.95
              const thresholds = [
                { start: 0.1, end: 0.5 },
                { start: 0.3, end: 0.75 },
                { start: 0.5, end: 0.95 }
              ];

              for (let i = 0; i < 3; i++) {
                const { start, end } = thresholds[i];
                if (ratio < start) {
                  currentText += original[i];
                } else if (ratio < end) {
                  currentText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                } else {
                  currentText += " ";
                }
              }

              setKanjiText(currentText);
              setKanjiOpacity(0.75 * (1 - ratio));
            } else {
              setKanjiText("   ");
              setKanjiOpacity(0);
            }
          }
        }
      });

      // Cinematic canvas reactive transformations over scroll
      tl.to(canvas, {
        scale: 1.15,
        yPercent: 4, // downward drift for parallax depth
        filter: 'brightness(0.3) contrast(1.4) saturate(1.1) blur(6px)',
        ease: 'none'
      }, 0);

      // 1. Long Screen Time: Kanji remains stable from progress 0 to 0.25
      // 2. Elegant Dissolve: gentle drift upward from progress 0.25 to 0.40
      tl.to(scrollIndicatorRef.current, {
        y: -60,
        duration: 0.15,
        ease: "power1.out"
      }, 0.25);

      // Reveal title and button at exactly 50% scroll progress
      tl.to([titleRef.current, buttonRef.current], {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.15,
        stagger: 0.08,
        ease: "power3.out",
        onStart: () => {
          setIsRevealed(true);
        },
        onReverseComplete: () => {
          setIsRevealed(false);
        }
      }, 0.5);
    }, containerRef);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
      ctxGsap.revert();
    };
  }, [isPreloaded, frames]);

  return (
    <section
      ref={containerRef}
      onMouseDown={handleSectionMouseDown}
      className="relative h-screen w-full flex items-center overflow-hidden bg-black cursor-none select-none"
    >
      {/* Decrypting Cyber Loader - Glowing Neon Cyberpunk UI */}
      {!isPreloaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="relative p-8 border-2 border-[#FF0000]/30 bg-black/40 backdrop-blur-md max-w-md w-full text-center">
            {/* Chamfered decorative corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FF0000]"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FF0000]"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#FF0000]"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FF0000]"></div>

            <div className="text-white font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1">
              SYS_CONNECTION // ONLINE
            </div>
            <div
              className="text-[#FF0000] text-3xl tracking-[0.2em] uppercase font-bold mb-4 animate-pulse"
              style={{ fontFamily: 'Teko, sans-serif' }}
            >
              BUFFERING VISUAL SYSTEM
            </div>

            {/* Glowing progress bar */}
            <div className="w-full bg-neutral-900 h-2 border border-neutral-800 relative overflow-hidden mb-3">
              <div
                className="bg-[#FF0000] h-full shadow-[0_0_10px_#FF0000] transition-all duration-100"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>

            <div className="text-white font-mono text-xs tracking-wider">
              DECRYPTING NEURAL BUFFER: <span className="text-[#FF0000] font-bold">{loadingProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Hardware-accelerated Canvas Render Board */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        style={{
          filter: 'brightness(0.65) contrast(1.35) saturate(1.2)',
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
        }}
      />



      {/* Cyber Grid CRT Scanline Overlay - stylized subgrid mask hides scaling artifacts */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[length:100%_4px,3px_100%] opacity-35 pointer-events-none z-10"
      ></div>

      {/* Smoke and Dust Particles Texture */}
      <div ref={particlesRef} className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#FF0000] blur-sm animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-[#FF0000] blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white blur-sm animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-0.5 h-0.5 bg-white blur-md animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-1/3 right-1/2 w-0.5 h-0.5 bg-[#FF0000] blur-md animate-pulse" style={{ animationDelay: '1.2s' }}></div>
      </div>

      {/* Red Light Leak Effect */}
      <div ref={lightLeaksRef} className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF0000] blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FF0000] blur-[100px] opacity-15"></div>
      </div>

      {/* Cinematic Cyber HUD UI Overlays (Only visible when fully preloaded) */}
      {isPreloaded && (
        <div className="absolute inset-0 z-20 pointer-events-none font-mono text-[9px] tracking-[0.15em] text-[#FF0000]/60 select-none">
          {/* Corner Brackets */}
          <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-[#FF0000]/40"></div>
          <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-[#FF0000]/40"></div>
          <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-[#FF0000]/40"></div>
          <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-[#FF0000]/40"></div>

          {/* Top-Left: System Telemetry */}
          <div className="absolute top-6 left-14 hidden md:block">
            <span className="text-white opacity-40">SYS_ONLINE // </span>
            <span className="animate-pulse text-[#FF0000]">DECRYPTING_SIGNAL</span>
          </div>

          {/* Top-Right: Sector Diagnostics */}
          <div className="absolute top-6 right-14 text-right hidden md:block">
            <span>SECTOR: 09_BUSHIDO_PROTOCOL</span>
            <span className="block opacity-40">CALIBRATION // STABLE</span>
          </div>

          {/* Bottom-Left: Ancient Coordinates */}
          <div className="absolute bottom-6 left-14 hidden md:block">
            <span>LAT: 35.0116° N / LON: 135.7681° E</span>
            <span className="block opacity-40">ANCIENT_CAPITAL_KYOTO // SYNC_OK</span>
          </div>

          {/* Bottom-Right: Blink Status */}
          <div className="absolute bottom-6 right-14 text-right hidden md:block flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF0000] animate-ping mr-1"></span>
            <span className="text-white opacity-60">TELEMETRY_TRACKING: </span>
            <span className="font-bold">ACTIVE</span>
          </div>
        </div>
      )}

      {/* Initial Japanese Typography - Fades out on scroll with elegant scramble effect */}
      <div
        ref={scrollIndicatorRef}
        className="absolute left-8 lg:left-[calc((100vw-1440px)/2+32px)] top-[14%] md:top-[12%] z-0 pointer-events-none flex flex-col items-start"
        style={{ opacity: kanjiOpacity }}
      >
        {/* Kanji Body with Softer, Premium Ambient Red Neon Glow */}
        <span
          className="text-[#E53935] font-bold leading-none select-none tracking-[0.15em] drop-shadow-[0_0_15px_rgba(255,0,0,0.35)]"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho Pro", "Noto Serif JP", serif',
            fontSize: 'clamp(8rem, 14vw, 15.5rem)',
            textShadow: '0px 0px 8px rgba(229,57,53,0.65), 0px 0px 25px rgba(229,57,53,0.3)',
          }}
        >
          {kanjiText}
        </span>
      </div>

      {/* Hero Content */}
      <div ref={contentRef} className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center justify-center text-center">
        <div 
          ref={titleRef} 
          className="relative mb-12 flex flex-col items-center justify-center text-center w-full max-w-5xl px-6 py-12 sm:px-12 sm:py-16 border border-[#FF0000]/25 bg-black/45 backdrop-blur-[3px] rounded-lg shadow-[0_0_40px_rgba(255,0,0,0.12)] overflow-hidden select-none group/frame"
        >
          {/* Cyber grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0"></div>

          {/* Holographic scanning laser line */}
          <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF0000]/40 to-transparent shadow-[0_0_8px_#FF0000] pointer-events-none z-0 animate-[scan_5s_infinite_ease-in-out]"></div>

          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.5)] z-10 transition-all duration-300 group-hover/frame:w-10 group-hover/frame:h-10"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.5)] z-10 transition-all duration-300 group-hover/frame:w-10 group-hover/frame:h-10"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.5)] z-10 transition-all duration-300 group-hover/frame:w-10 group-hover/frame:h-10"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.5)] z-10 transition-all duration-300 group-hover/frame:w-10 group-hover/frame:h-10"></div>

          {/* Tactical Telemetry Text Indicators */}
          <div className="absolute top-2 left-4 font-mono text-[8px] text-[#FF0000]/50 tracking-[0.2em] pointer-events-none hidden sm:block">
            SYS_LOCK: 0x90-SHINOBI
          </div>
          <div className="absolute top-2 right-4 font-mono text-[8px] text-[#FF0000]/50 tracking-[0.2em] pointer-events-none hidden sm:block">
            FR_RATE: 120fps // SECURE
          </div>
          <div className="absolute bottom-2 left-4 font-mono text-[8px] text-[#FF0000]/50 tracking-[0.2em] pointer-events-none hidden sm:block">
            TACTICAL_COORD: 35.0116_N
          </div>
          <div className="absolute bottom-2 right-4 font-mono text-[8px] text-[#FF0000]/50 tracking-[0.2em] pointer-events-none hidden sm:block">
            THREAT: OMEGA_LEVEL
          </div>

          {/* Outer Border Side Ticks */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-gradient-to-b from-[#FF0000]/20 via-[#FF0000] to-[#FF0000]/20"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-gradient-to-b from-[#FF0000]/20 via-[#FF0000] to-[#FF0000]/20"></div>

          {/* Tech HUD Subtitle Tag */}
          <div className="relative z-10 flex items-center gap-3 mb-6 font-mono text-[10px] md:text-xs tracking-[0.4em] text-[#FF0000] uppercase select-none justify-center">
            <span className="inline-block w-1.5 h-1.5 bg-[#FF0000] shadow-[0_0_8px_#FF0000] rounded-sm animate-pulse"></span>
            <span>SYSTEM_PROTOCOL: SHINOBI_ACTIVE</span>
            <span className="text-white/30 hidden sm:inline">// EST.2026</span>
          </div>

          <h1
            className="relative z-10 text-4xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[8rem] uppercase tracking-wider leading-none flex flex-col lg:flex-row items-center justify-center whitespace-normal lg:whitespace-nowrap gap-x-4 lg:gap-x-6 gap-y-4 lg:gap-y-0 text-center select-none w-full"
            style={{ fontFamily: '"Space Grotesk", "Orbitron", sans-serif', fontWeight: 900 }}
          >
            {/* HONOR (Futuristic Split Metal Silver Gradient) */}
            <span 
              className="inline-block tracking-widest font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.45)] transition-all duration-300"
              style={{ fontWeight: 900, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              <ScrambleText text="HONOR" isRevealed={isRevealed} />
            </span>

            {/* MEETS (Highly styled microchip connector badge) */}
            <span className="inline-block relative z-10 font-mono text-[10px] md:text-xs tracking-[0.35em] text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/35 px-4 py-2 rounded-sm backdrop-blur-md uppercase select-none lg:translate-y-1 mx-2 flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,59,48,0.15)] animate-pulse">
              <span className="inline-block w-1.5 h-1.5 bg-[#FF3B30] rounded-full animate-ping"></span>
              [ <span className="text-white font-bold">MEETS</span> ]
            </span>

            {/* CHAOS (Premium Dual-Glow Shifting Crimson-Red-Orange Gradient) */}
            <span 
              className="inline-block tracking-wide font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF0055] via-[#FF3B30] to-[#FF9500] drop-shadow-[0_0_35px_rgba(255,0,85,0.8)]"
              style={{ fontFamily: '"Syncopate", "Orbitron", sans-serif', fontWeight: 900, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              <ScrambleText text="CHAOS" isRevealed={isRevealed} />
            </span>
          </h1>

          {/* Premium HUD Tech Horizontal Center Divider */}
          <div className="relative z-10 w-64 h-[1px] bg-gradient-to-r from-transparent via-[#FF0000]/60 to-transparent relative mx-auto mt-8 select-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#FF0000] shadow-[0_0_10px_#FF0000] rounded-full animate-ping"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[#FF0000] rounded-full"></div>
          </div>
        </div>

        <button
          ref={buttonRef}
          className="relative bg-[#FF0000] text-white px-24 py-7 text-2xl uppercase tracking-widest border-2 border-[#FF0000] shadow-2xl shadow-red-900/60 overflow-hidden group cursor-none transition-colors duration-300"
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 700,
            borderRadius: '0px',
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
          }}
          onClick={() => {
            const el = document.querySelector('#showcase');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {/* Main button text */}
          <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200">ENTER THE SYSTEM</span>
          <span className="absolute inset-0 flex items-center justify-center bg-white text-black font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">ENTER THE SYSTEM</span>

          {/* Glitch Shadow 1 (Cyan Accent) */}
          <span className="absolute inset-0 bg-[#00FFFF] text-black px-24 py-7 text-2xl uppercase tracking-widest border-2 border-[#00FFFF] pointer-events-none cyber-btn-glitch-1 z-0 flex items-center justify-center"
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              borderRadius: '0px',
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              top: '-3px',
              left: '-3px'
            }}
          >
            ENTER THE SYSTEM
          </span>

          {/* Glitch Shadow 2 (Magenta Accent) */}
          <span className="absolute inset-0 bg-[#FF00FF] text-white px-24 py-7 text-2xl uppercase tracking-widest border-2 border-[#FF00FF] pointer-events-none cyber-btn-glitch-2 z-0 flex items-center justify-center"
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              borderRadius: '0px',
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              top: '3px',
              left: '3px'
            }}
          >
            ENTER THE SYSTEM
          </span>

          <div className="absolute top-0 right-0 w-3 h-3 bg-white opacity-0 group-hover:opacity-30 transition-opacity"></div>
        </button>

        {/* Localized Glitch Keyframe CSS Injection */}
        <style>{`
          @keyframes scan {
            0% { top: 0%; opacity: 0; }
            5% { opacity: 0.35; }
            50% { opacity: 0.55; }
            95% { opacity: 0.35; }
            100% { top: 100%; opacity: 0; }
          }
          
          @keyframes cyber-glitch-1 {
            0% { clip-path: inset(40% 0 61% 0); transform: translate(-5px, -3px); }
            20% { clip-path: inset(92% 0 1% 0); transform: translate(3px, 5px); }
            40% { clip-path: inset(15% 0 80% 0); transform: translate(-3px, -5px); }
            60% { clip-path: inset(80% 0 5% 0); transform: translate(5px, 3px); }
            80% { clip-path: inset(3% 0 92% 0); transform: translate(-5px, 3px); }
            100% { clip-path: inset(40% 0 61% 0); transform: translate(-5px, -3px); }
          }
          @keyframes cyber-glitch-2 {
            0% { clip-path: inset(25% 0 58% 0); transform: translate(5px, 3px); }
            20% { clip-path: inset(70% 0 12% 0); transform: translate(-3px, -5px); }
            40% { clip-path: inset(5% 0 85% 0); transform: translate(3px, 5px); }
            60% { clip-path: inset(85% 0 2% 0); transform: translate(-5px, -3px); }
            80% { clip-path: inset(12% 0 70% 0); transform: translate(5px, -3px); }
            100% { clip-path: inset(25% 0 58% 0); transform: translate(5px, 3px); }
          }
          .cyber-btn-glitch-1 {
            display: none;
          }
          .group:hover .cyber-btn-glitch-1 {
            display: flex;
            animation: cyber-glitch-1 0.22s infinite linear alternate-reverse;
          }
          .cyber-btn-glitch-2 {
            display: none;
          }
          .group:hover .cyber-btn-glitch-2 {
            display: flex;
            animation: cyber-glitch-2 0.18s infinite linear alternate-reverse;
          }
        `}</style>
      </div>
    </section>
  );
}
