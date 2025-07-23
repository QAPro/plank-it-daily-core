
import { useState } from "react";

export const useTimerAudio = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playCompletionSound = () => {
    if (!soundEnabled) return;
    
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return {
    soundEnabled,
    playCompletionSound,
    toggleSound,
  };
};
