
import React, { useState } from "react";

export const useEnhancedTimerAudio = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdownSoundsEnabled, setCountdownSoundsEnabled] = useState(true);

  const playCompletionSound = () => {
    if (!soundEnabled) return;
    
    // Enhanced completion sound - celebratory tone
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a sequence of ascending notes for celebration
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G major chord
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
      }, index * 150);
    });
  };

  const playCountdownSound = (secondsLeft: number) => {
    if (!soundEnabled || !countdownSoundsEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Higher pitch for final seconds
    oscillator.frequency.value = secondsLeft === 1 ? 1000 : 800;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const toggleCountdownSounds = () => {
    setCountdownSoundsEnabled(!countdownSoundsEnabled);
  };

  return {
    soundEnabled,
    countdownSoundsEnabled,
    playCompletionSound,
    playCountdownSound,
    toggleSound,
    toggleCountdownSounds,
  };
};
