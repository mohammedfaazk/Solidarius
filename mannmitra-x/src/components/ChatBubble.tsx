import React from 'react';
import type { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
  speaking?: boolean;
  onSpeak?: (text: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  speaking = false,
  onSpeak,
}) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`
        max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm
        ${isUser 
          ? 'bg-primary-500 text-white' 
          : 'bg-white text-gray-800 border border-gray-200'
        }
      `}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        
        {!isUser && onSpeak && (
          <button
            onClick={() => onSpeak(message.content)}
            disabled={speaking}
            className={`
              mt-2 text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50
              ${speaking ? 'text-primary-600 bg-primary-50' : 'text-gray-600'}
            `}
          >
            {speaking ? (
              <span className="flex items-center gap-1">
                <SpeakerIcon className="w-3 h-3 animate-pulse" />
                Speaking...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <SpeakerIcon className="w-3 h-3" />
                Listen
              </span>
            )}
          </button>
        )}
        
        <div className="text-xs opacity-70 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 12h-1a1 1 0 01-1-1V8a1 1 0 011-1h1l4-4v16l-4-4z"
    />
  </svg>
);