import { useEffect, useRef, useState } from 'react';

export function useSTT(lang = 'en-IN') {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    recRef.current = new SpeechRecognition();
    recRef.current.lang = lang;
    recRef.current.interimResults = true;
    recRef.current.maxAlternatives = 1;
    recRef.current.continuous = false;

    recRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      setText(transcript);
    };

    recRef.current.onerror = (event: any) => {
      console.warn('STT error:', event.error);
      setListening(false);
    };

    recRef.current.onend = () => {
      setListening(false);
    };

    recRef.current.onstart = () => {
      setListening(true);
    };
  }, [lang]);

  const start = () => {
    if (!recRef.current || !isSupported) return;
    setText('');
    try {
      recRef.current.start();
    } catch (error) {
      console.warn('STT start failed:', error);
    }
  };

  const stop = () => {
    if (recRef.current) {
      recRef.current.stop();
    }
  };

  const reset = () => {
    setText('');
  };

  return { 
    text, 
    listening, 
    isSupported, 
    start, 
    stop, 
    reset 
  };
}