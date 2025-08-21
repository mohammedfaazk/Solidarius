import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types';

interface LLMEngine {
  initialized: boolean;
  type: 'webllm' | 'fallback' | 'none';
}

export function useLLM() {
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState<LLMEngine>({ initialized: false, type: 'none' });

  const initEngine = useCallback(async () => {
    try {
      // Try to initialize WebLLM if available
      if ('gpu' in navigator && typeof (window as any).webllm !== 'undefined') {
        // WebLLM initialization would go here
        // For now, we'll skip this and use fallback
        setEngine({ initialized: true, type: 'fallback' });
      } else {
        setEngine({ initialized: true, type: 'fallback' });
      }
    } catch (error) {
      console.warn('LLM engine initialization failed:', error);
      setEngine({ initialized: true, type: 'fallback' });
    }
  }, []);

  const generateReply = useCallback(async (messages: ChatMessage[]): Promise<string> => {
    setLoading(true);
    
    try {
      if (engine.type === 'webllm') {
        // WebLLM implementation would go here
        // For now, fall back to API
      }
      
      // Fallback to API endpoint
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      return data.reply || generateLocalReply(messages);
    } catch (error) {
      console.warn('LLM API failed, using local reply:', error);
      return generateLocalReply(messages);
    } finally {
      setLoading(false);
    }
  }, [engine.type]);

  return {
    engine,
    loading,
    initEngine,
    generateReply,
  };
}

// Simple rule-based responses for fallback
function generateLocalReply(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1];
  const userText = lastMessage.content.toLowerCase();

  // Crisis detection
  if (userText.includes('kill') || userText.includes('die') || userText.includes('end my life')) {
    return "I'm really sorry you're feeling this way. I'm here with you. Can you tell me if you're thinking about harming yourself right now?";
  }

  // Stress/anxiety responses
  if (userText.includes('stress') || userText.includes('anxious') || userText.includes('worried')) {
    return "It sounds like you're dealing with some challenging feelings right now. Would you like to try a quick breathing exercise together, or would you prefer to talk about what's on your mind?";
  }

  // Exam/study related
  if (userText.includes('exam') || userText.includes('study') || userText.includes('test')) {
    return "Exams can feel overwhelming. Remember that it's normal to feel nervous. What specific part of studying is bothering you the most right now?";
  }

  // Sleep issues
  if (userText.includes('sleep') || userText.includes('tired') || userText.includes('insomnia')) {
    return "Sleep troubles can make everything feel harder. When did you last have a good night's sleep? Let's think about some things that might help.";
  }

  // Default empathetic response
  const empathetic = [
    "Thank you for sharing that with me. I'm here to listen and support you.",
    "I can hear that this is important to you. Can you tell me more about how you're feeling?",
    "It takes courage to open up about these feelings. I'm glad you're talking to me about this.",
    "I want to understand better. What would feel most helpful for you right now?",
    "Your feelings are valid. Let's explore this together at your own pace."
  ];

  return empathetic[Math.floor(Math.random() * empathetic.length)];
}