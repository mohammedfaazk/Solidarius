import React, { useState } from 'react';
import type { JournalEntry } from '../types';

interface MoodPickerProps {
  onSave: (entry: Omit<JournalEntry, 'id' | 'uid' | 'timestamp'>) => void;
  currentUser?: string;
}

const moodEmojis = [
  { score: 1, emoji: '😢', label: 'Very Low', color: 'text-red-500' },
  { score: 2, emoji: '😔', label: 'Low', color: 'text-orange-500' },
  { score: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
  { score: 4, emoji: '😊', label: 'Good', color: 'text-green-500' },
  { score: 5, emoji: '😁', label: 'Great', color: 'text-green-600' },
];

const commonTags = [
  'stressed', 'tired', 'anxious', 'excited', 'grateful', 'lonely',
  'motivated', 'overwhelmed', 'peaceful', 'frustrated', 'hopeful', 'confused'
];

export const MoodPicker: React.FC<MoodPickerProps> = ({ onSave }) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (selectedMood === null) return;

    const entry: Omit<JournalEntry, 'id' | 'uid' | 'timestamp'> = {
      type: 'mood',
      moodScore: selectedMood,
      tags: selectedTags,
      note_redacted: note.trim() || undefined,
    };

    onSave(entry);
    
    // Reset form
    setSelectedMood(null);
    setSelectedTags([]);
    setNote('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-xl">💭</span>
        Log Today's Mood
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">How are you feeling?</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Mood Selection */}
      <div className="mb-6">
        <div className="grid grid-cols-5 gap-2">
          {moodEmojis.map((mood) => (
            <button
              key={mood.score}
              onClick={() => setSelectedMood(mood.score)}
              className={`
                p-3 rounded-lg text-center transition-all duration-200
                ${selectedMood === mood.score
                  ? 'bg-primary-100 border-2 border-primary-500 scale-105'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }
              `}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className={`text-xs font-medium ${mood.color}`}>
                {mood.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tags Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What's influencing your mood? (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {commonTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`
                px-3 py-1 rounded-full text-sm transition-all duration-200
                ${selectedTags.includes(tag)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Note Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any thoughts? (Optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's on your mind today..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows={3}
          maxLength={500}
        />
        <div className="text-xs text-gray-500 text-right mt-1">
          {note.length}/500
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={selectedMood === null}
          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Entry
        </button>
      </div>
    </div>
  );
};