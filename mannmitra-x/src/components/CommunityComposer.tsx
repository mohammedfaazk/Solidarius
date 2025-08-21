import React, { useState } from 'react';
import type { CommunityPost } from '../types';
import { redactPII, detectToxicity } from '../lib/redact';

interface CommunityComposerProps {
  onPost: (post: Omit<CommunityPost, 'id' | 'createdAt'>) => void;
  currentUser?: string;
}

interface ModerationSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

export const CommunityComposer: React.FC<CommunityComposerProps> = ({
  onPost,
  currentUser = 'anon_user',
}) => {
  const [text, setText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('general');
  const [isChecking, setIsChecking] = useState(false);
  const [moderationSuggestion, setModerationSuggestion] = useState<ModerationSuggestion | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const topics = [
    { id: 'general', label: 'General Support', icon: '💬' },
    { id: 'exam_stress', label: 'Exam Stress', icon: '📚' },
    { id: 'relationships', label: 'Relationships', icon: '👥' },
    { id: 'anxiety', label: 'Anxiety', icon: '😰' },
    { id: 'depression', label: 'Depression', icon: '💙' },
    { id: 'self_care', label: 'Self Care', icon: '🌱' },
  ];

  const handleTextChange = (value: string) => {
    setText(value);
    setModerationSuggestion(null);
  };

  const checkModeration = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    const toxicity = detectToxicity(text);
    
    // Simulate AI moderation check
    if (toxicity > 0.3) {
      const suggestion = await generateKinderSuggestion(text);
      setModerationSuggestion(suggestion);
    } else {
      handleSubmit();
    }
    
    setIsChecking(false);
  };

  const handleSubmit = () => {
    const redactedText = redactPII(text);
    const toxicity = detectToxicity(redactedText);
    
    const post: Omit<CommunityPost, 'id' | 'createdAt'> = {
      topicId: selectedTopic,
      uidPseudo: generatePseudonym(currentUser),
      text_redacted: redactedText,
      toxicity,
      status: toxicity > 0.5 ? 'held' : 'published',
    };

    onPost(post);
    
    // Reset form
    setText('');
    setModerationSuggestion(null);
    setShowComposer(false);
  };

  const applySuggestion = () => {
    if (moderationSuggestion) {
      setText(moderationSuggestion.suggested);
      setModerationSuggestion(null);
    }
  };

  if (!showComposer) {
    return (
      <button
        onClick={() => setShowComposer(true)}
        className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-xl">✍️</span>
        Share with Community
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Share with Community</h3>
        <button
          onClick={() => setShowComposer(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Topic Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a topic
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`
                p-2 rounded-lg text-sm text-left transition-all duration-200
                ${selectedTopic === topic.id
                  ? 'bg-primary-100 border-2 border-primary-500'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span>{topic.icon}</span>
                <span className="font-medium">{topic.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What would you like to share?
        </label>
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Share your thoughts, ask for support, or offer encouragement to others..."
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows={4}
          maxLength={500}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Your message will be posted anonymously</span>
          <span>{text.length}/500</span>
        </div>
      </div>

      {/* Moderation Suggestion */}
      {moderationSuggestion && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600">💡</div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Suggestion for kinder phrasing
              </h4>
              <p className="text-yellow-700 text-sm mb-2">
                {moderationSuggestion.reason}
              </p>
              <div className="bg-white rounded p-3 border border-yellow-300">
                <p className="text-sm text-gray-800">
                  "{moderationSuggestion.suggested}"
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={applySuggestion}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
                >
                  Use suggestion
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  Keep original
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Community Guidelines</h4>
        <ul className="text-blue-700 text-xs space-y-1">
          <li>• Be kind and supportive to others</li>
          <li>• Share experiences, not medical advice</li>
          <li>• Respect privacy - no personal details</li>
          <li>• Use content warnings for sensitive topics</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setShowComposer(false)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        
        <button
          onClick={checkModeration}
          disabled={!text.trim() || isChecking}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isChecking ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Checking...
            </>
          ) : (
            'Post'
          )}
        </button>
      </div>
    </div>
  );
};

// Helper functions
async function generateKinderSuggestion(text: string): Promise<ModerationSuggestion> {
  // Simple rule-based suggestions (in production, this would use an LLM)
  const suggestions: { [key: string]: string } = {
    'stupid': 'challenging',
    'idiot': 'person who disagrees',
    'hate': 'really dislike',
    'kill': 'stop',
    'die': 'end',
    'dumb': 'confusing',
    'worthless': 'struggling',
  };

  let suggested = text.toLowerCase();
  let reason = 'Your message might come across as harsh. Here\'s a gentler way to express the same feeling:';

  for (const [harsh, kind] of Object.entries(suggestions)) {
    if (suggested.includes(harsh)) {
      suggested = suggested.replace(new RegExp(harsh, 'g'), kind);
      break;
    }
  }

  // Capitalize first letter
  suggested = suggested.charAt(0).toUpperCase() + suggested.slice(1);

  return {
    original: text,
    suggested,
    reason,
  };
}

function generatePseudonym(userId: string): string {
  // Generate a consistent but anonymous pseudonym for the user
  const adjectives = ['Kind', 'Brave', 'Gentle', 'Strong', 'Wise', 'Calm', 'Bright', 'Warm'];
  const nouns = ['Friend', 'Heart', 'Soul', 'Spirit', 'Voice', 'Light', 'Hope', 'Star'];
  
  // Use user ID to generate consistent pseudonym
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const adjIndex = Math.abs(hash) % adjectives.length;
  const nounIndex = Math.abs(hash >> 4) % nouns.length;
  const number = Math.abs(hash) % 100;
  
  return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`;
}