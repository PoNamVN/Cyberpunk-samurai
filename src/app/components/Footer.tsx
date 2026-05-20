export function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black border-t border-neutral-900 pt-16 pb-12 px-8 overflow-hidden">
      {/* Red ambient bottom light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-[#FF0000]/5 blur-[80px] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        
        {/* Left Column: Branding and Copyright */}
        <div className="flex flex-col gap-3 text-center md:text-left">
          <div className="relative inline-block self-center md:self-start">
            <span 
              className="text-white text-2xl tracking-widest uppercase font-bold"
              style={{ fontFamily: 'Teko, sans-serif' }}
            >
              CYBER SAMURAI
            </span>
            <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-[#FF0000]"></div>
          </div>
          <p className="text-neutral-500 font-mono text-[11px] tracking-wider leading-relaxed mt-2">
            © 2088 NEO-KYOTO SYNCHRONOUS. ALL RIGHTS RESERVED.<br />
            STEEL AND SILICON // TRADITION AND INNOVATION.
          </p>
        </div>

        {/* Center Column: Futuristic Neon Social Links */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-6 items-center">
            {['DISCORD', 'TWITTER', 'YOUTUBE'].map((social) => (
              <a
                key={social}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="relative text-neutral-400 text-xs tracking-widest font-mono hover:text-[#FF0000] hover:drop-shadow-[0_0_8px_#FF0000] transition-all py-1 px-3 border border-transparent hover:border-[#FF0000]/40 cursor-pointer"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                }}
              >
                {social}
              </a>
            ))}
          </div>
          <button 
            onClick={handleScrollToTop}
            className="text-neutral-500 hover:text-white font-mono text-[10px] tracking-[0.2em] transition-colors border-b border-transparent hover:border-white pb-0.5 uppercase cursor-pointer"
          >
            ▲ BACK TO TOP
          </button>
        </div>

        {/* Right Column: Game Rating Warnings */}
        <div className="flex items-center justify-center md:justify-end gap-4">
          {/* Wireframe Mature Rating Box */}
          <div 
            className="border-2 border-neutral-800 p-2.5 flex items-center gap-3 bg-neutral-950/80 backdrop-blur-sm select-none"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
            }}
          >
            <div className="bg-white text-black font-bold text-center px-2 py-1 leading-none text-xl" style={{ fontFamily: 'Oswald, sans-serif' }}>
              M
            </div>
            <div className="flex flex-col font-mono text-[9px] tracking-wide text-neutral-400">
              <span className="font-bold text-white uppercase text-[10px]">MATURE 17+</span>
              <span>BLOOD AND GORE</span>
              <span>INTENSE VIOLENCE</span>
            </div>
          </div>
        </div>

      </div>

      {/* Decorative cyber grid slice bottom line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent mt-12"></div>
    </footer>
  );
}
