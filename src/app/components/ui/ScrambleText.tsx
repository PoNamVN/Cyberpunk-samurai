import { useEffect, useState } from 'react';

export const ScrambleText = ({ 
  text, 
  isRevealed, 
  durationMs = 1000 // default 1 second
}: { 
  text: string; 
  isRevealed: boolean;
  durationMs?: number;
}) => {
  const [displayText, setDisplayText] = useState('');
  const chars = '!<>-_\\\\/[]{}—=+*^?#________';
  
  useEffect(() => {
    if (!isRevealed) {
      setDisplayText('');
      return;
    }
    
    let frame = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Estimate frames assuming 30fps
    const totalFrames = (durationMs / 1000) * 30;
    // How many frames to wait before revealing a specific character index
    // We want the last character to be revealed at totalFrames
    const speed = Math.max(totalFrames / text.length, 0.2); 
    
    const scramble = () => {
      let result = '';
      let completeCount = 0;
      
      for (let i = 0; i < text.length; i++) {
        // preserve whitespace and newlines
        if (text[i] === ' ' || text[i] === '\n') {
          result += text[i];
          completeCount++;
          continue;
        }

        if (frame >= i * speed) {
          result += text[i];
          completeCount++;
        } else {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      setDisplayText(result);
      
      if (completeCount < text.length) {
        frame++;
        timeoutId = setTimeout(scramble, 33); // ~30fps
      }
    };
    
    scramble();
    
    return () => clearTimeout(timeoutId);
  }, [text, isRevealed, durationMs]);

  // Handle newlines by converting them to <br />
  return (
    <span>
      {displayText.split('\n').map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
};
