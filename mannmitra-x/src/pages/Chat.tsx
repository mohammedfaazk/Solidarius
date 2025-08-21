import React, { useState, useEffect, useRef } from 'react';
import { ChatBubble } from '../components/ChatBubble';
import { MicButton } from '../components/MicButton';
import { TranscriptPane } from '../components/TranscriptPane';
import { useSTT } from '../hooks/useSTT';
import { useTTS } from '../hooks/useTTS';
import { useLLM } from '../hooks/useLLM';
import type { ChatMessage } from '../types';
import { redactPII, detectCrisisKeywords } from '../lib/redact';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m MannMitra, your companion for mental wellness. I\'m here to listen and support you. How are you feeling today?',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);
  
  const { text: sttText, listening, isSupported: sttSupported, start: startSTT, stop: stopSTT, reset: resetSTT } = useSTT();
  const { speak, speaking, isSupported: ttsSupported, stop: stopTTS } = useTTS();
  const { generateReply, loading: llmLoading, initEngine, engine } = useLLM();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    initEngine();
  }, [initEngine]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Check for crisis keywords
    if (detectCrisisKeywords(text)) {
      setShowCrisisSupport(true);
    }

    // Redact PII before storing
    const redactedText = redactPII(text);
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: redactedText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Generate response
    try {
      const reply = await generateReply([...messages, userMessage]);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-speak the response if TTS is supported
      if (ttsSupported) {
        speak(reply);
      }
    } catch (error) {
      console.error('Failed to generate reply:', error);
    }
  };

  const handleSTTSend = () => {
    if (sttText.trim()) {
      sendMessage(sttText);
      resetSTT();
    }
  };

  const handleSTTClear = () => {
    resetSTT();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const handleSpeak = (text: string) => {
    speak(text);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 text-center">MannMitra</h1>
        <p className="text-gray-600 text-center text-sm">Your companion for mental wellness</p>
      </div>

      {/* Crisis Support Banner */}
      {showCrisisSupport && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="text-red-600 mt-1">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-800">Crisis Support Resources</h3>
              <p className="text-red-700 text-sm mb-2">
                If you're having thoughts of self-harm, please reach out for immediate help:
              </p>
              <div className="text-sm text-red-700">
                <p>• <strong>India Suicide Prevention Helpline:</strong> 1-800-599-0019</p>
                <p>• <strong>Sneha Foundation:</strong> 044-24640050</p>
                <p>• <strong>Emergency:</strong> 112</p>
              </div>
              <button
                onClick={() => setShowCrisisSupport(false)}
                className="mt-2 text-xs text-red-600 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        {messages.map((message, index) => (
          <ChatBubble
            key={index}
            message={message}
            speaking={speaking}
            onSpeak={message.role === 'assistant' ? handleSpeak : undefined}
          />
        ))}
        {llmLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Voice Input */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-4">
            <MicButton
              listening={listening}
              isSupported={sttSupported}
              onStart={startSTT}
              onStop={stopSTT}
              disabled={llmLoading}
            />
            {speaking && (
              <button
                onClick={stopTTS}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                Stop Speaking
              </button>
            )}
          </div>
        </div>

        {/* Transcript Display */}
        {(sttText || listening) && (
          <div className="mb-4">
            <TranscriptPane
              transcript={sttText}
              listening={listening}
              placeholder="Start speaking..."
              onSend={handleSTTSend}
              onClear={handleSTTClear}
            />
          </div>
        )}

        {/* Text Input Fallback */}
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or type your message here..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={llmLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || llmLoading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>

        {/* Engine Status */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Engine: {engine.initialized ? engine.type : 'initializing...'}
        </div>
      </div>
    </div>
  );
};