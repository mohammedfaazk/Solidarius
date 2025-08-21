import React from 'react';

interface TranscriptPaneProps {
  transcript: string;
  listening: boolean;
  placeholder?: string;
  onSend?: () => void;
  onClear?: () => void;
}

export const TranscriptPane: React.FC<TranscriptPaneProps> = ({
  transcript,
  listening,
  placeholder = "Your words will appear here...",
  onSend,
  onClear,
}) => {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 relative">
      <div className="p-4 min-h-[120px]">
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
      
      {/* Action buttons when transcript is available */}
      {transcript && !listening && (
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-xs text-gray-500">
            Recording captured successfully
          </div>
          <div className="flex gap-2">
            {onClear && (
              <button
                onClick={onClear}
                className="px-3 py-1 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-100"
              >
                Clear
              </button>
            )}
            {onSend && (
              <button
                onClick={onSend}
                className="px-4 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 flex items-center gap-1"
              >
                <span>📤</span>
                Send
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Status indicator when listening */}
      {listening && (
        <div className="px-4 py-2 border-t border-gray-200 bg-blue-50">
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            Recording... Speak clearly and pause when finished
          </div>
        </div>
      )}
    </div>
  );
};