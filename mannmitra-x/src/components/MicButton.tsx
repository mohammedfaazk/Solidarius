import React from 'react';

interface MicButtonProps {
  listening: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export const MicButton: React.FC<MicButtonProps> = ({
  listening,
  isSupported,
  onStart,
  onStop,
  disabled = false,
}) => {
  const handleClick = () => {
    if (listening) {
      onStop();
    } else {
      onStart();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          disabled
          className="w-16 h-16 rounded-full bg-gray-300 text-gray-500 cursor-not-allowed flex items-center justify-center"
        >
          <MicIcon />
        </button>
        <p className="text-sm text-gray-500 text-center">
          Voice not supported in this browser
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
          ${listening 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110' 
            : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:scale-105'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${listening ? 'animate-pulse' : ''}
        `}
      >
        <MicIcon />
      </button>
      <p className="text-sm text-gray-600 text-center">
        {listening ? 'Listening...' : 'Tap to speak'}
      </p>
    </div>
  );
};

const MicIcon: React.FC = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  </svg>
);