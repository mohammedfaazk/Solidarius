import { useEffect, useRef, useState, useCallback } from 'react';

export function useSTT(lang = 'en-IN') {
  const [text, setText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [listening, setListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const recRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    recRef.current.maxAlternatives = 3;
    recRef.current.continuous = true;

    recRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let totalConfidence = 0;
      let resultCount = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
          totalConfidence += result[0].confidence || 0.8;
          resultCount++;
        } else {
          interimTranscript += transcript;
        }
      }

      if (resultCount > 0) {
        setConfidence(totalConfidence / resultCount);
      }

      setText(finalTranscript + interimTranscript);
      if (finalTranscript) {
        setFinalText(prev => prev + finalTranscript);
      }

      // Auto-stop after 2 seconds of silence
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (recRef.current && listening) {
          recRef.current.stop();
        }
      }, 2000);
    };

    recRef.current.onerror = (event: any) => {
      console.warn('STT error:', event.error);
      if (event.error === 'no-speech') {
        // Auto-restart if no speech detected initially
        if (listening) {
          setTimeout(() => {
            if (listening && recRef.current) {
              try {
                recRef.current.start();
              } catch (e) {
                setListening(false);
              }
            }
          }, 100);
        }
      } else {
        setListening(false);
      }
    };

    recRef.current.onend = () => {
      setListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recRef.current.onstart = () => {
      setListening(true);
    };

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lang, listening]);

  const start = useCallback(() => {
    if (!recRef.current || !isSupported) return;
    setText('');
    setFinalText('');
    setConfidence(0);
    try {
      recRef.current.start();
    } catch (error) {
      console.warn('STT start failed:', error);
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (recRef.current) {
      recRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    setText('');
    setFinalText('');
    setConfidence(0);
  }, []);

  return { 
    text: finalText || text,
    interimText: text,
    finalText,
    listening, 
    isSupported,
    confidence,
    start, 
    stop, 
    reset 
  };
}