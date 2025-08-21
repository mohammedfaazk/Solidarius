import React from 'react';

interface TranscriptPaneProps {
  transcript: string;
  listening: boolean;
  placeholder?: string;
}

export const TranscriptPane: React.FC<TranscriptPaneProps> = ({
  transcript,
  listening,
  placeholder = "Your words will appear here...",
}) => {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[120px] relative">
      {transcript ? (
        <div className="text-gray-800 text-base leading-relaxed">
          {transcript}
          {listening && (
            <span className="inline-block w-1 h-5 bg-primary-500 ml-1 animate-pulse" />
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-base italic">
          {listening ? "Listening..." : placeholder}
        </div>
      )}
      
      {listening && (
        <div className="absolute bottom-2 right-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
};