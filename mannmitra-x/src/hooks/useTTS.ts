import { useCallback, useState } from 'react';

export function useTTS(lang = 'en-IN') {
  const [speaking, setSpeaking] = useState(false);
  const [isSupported] = useState('speechSynthesis' in window);

  const speak = useCallback((text: string, rate = 0.95, pitch = 1.0) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [lang, isSupported]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    speaking,
    isSupported,
  };
}