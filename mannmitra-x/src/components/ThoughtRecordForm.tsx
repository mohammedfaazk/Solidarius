import React, { useState } from 'react';
import type { JournalEntry } from '../types';

interface ThoughtRecordFormProps {
  onSave: (entry: Omit<JournalEntry, 'id' | 'uid' | 'timestamp'>) => void;
  onCancel: () => void;
}

interface ThoughtRecordData {
  situation: string;
  automaticThought: string;
  emotionIntensity: number;
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  action: string;
}

const STEPS = [
  {
    id: 'situation',
    title: 'What happened?',
    description: 'Describe the situation that triggered your thoughts.',
    placeholder: 'e.g., I got a low grade on my exam...',
  },
  {
    id: 'automaticThought',
    title: 'What went through your mind?',
    description: 'What automatic thoughts or images came to mind?',
    placeholder: 'e.g., I\'m terrible at this subject, I\'ll never succeed...',
  },
  {
    id: 'emotion',
    title: 'How intense was the emotion?',
    description: 'Rate the intensity of your emotional response.',
    placeholder: '',
  },
  {
    id: 'evidenceFor',
    title: 'Evidence FOR your thought',
    description: 'What evidence supports this thought?',
    placeholder: 'e.g., This was an important exam and I did study for it...',
  },
  {
    id: 'evidenceAgainst',
    title: 'Evidence AGAINST your thought',
    description: 'What evidence contradicts this thought?',
    placeholder: 'e.g., I\'ve done well on other exams, one grade doesn\'t define me...',
  },
  {
    id: 'balancedThought',
    title: 'What\'s a more balanced thought?',
    description: 'Based on the evidence, what\'s a more realistic perspective?',
    placeholder: 'e.g., This was disappointing, but I can learn from it and improve...',
  },
  {
    id: 'action',
    title: 'What will you do?',
    description: 'What helpful action can you take?',
    placeholder: 'e.g., Review my study methods and talk to my teacher about extra help...',
  },
];

export const ThoughtRecordForm: React.FC<ThoughtRecordFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ThoughtRecordData>({
    situation: '',
    automaticThought: '',
    emotionIntensity: 5,
    evidenceFor: '',
    evidenceAgainst: '',
    balancedThought: '',
    action: '',
  });

  const currentStepInfo = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const updateData = (field: string, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = () => {
    const thoughtRecord: Omit<JournalEntry, 'id' | 'uid' | 'timestamp'> = {
      type: 'thought_record',
      thoughtRecord: data,
      note_redacted: `Thought Record: ${data.situation}`,
    };

    onSave(thoughtRecord);
  };

  const canProceed = () => {
    switch (currentStepInfo.id) {
      case 'situation':
        return data.situation.trim().length > 0;
      case 'automaticThought':
        return data.automaticThought.trim().length > 0;
      case 'emotion':
        return true; // Emotion intensity always has a value
      case 'evidenceFor':
        return data.evidenceFor.trim().length > 0;
      case 'evidenceAgainst':
        return data.evidenceAgainst.trim().length > 0;
      case 'balancedThought':
        return data.balancedThought.trim().length > 0;
      case 'action':
        return data.action.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-lg p-6">
        <h2 className="text-xl font-bold">Thought Record</h2>
        <p className="text-primary-100 text-sm">
          A CBT technique to examine and reframe negative thoughts
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-primary-100 mb-1">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-primary-400 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {currentStepInfo.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {currentStepInfo.description}
          </p>

          {/* Input Field */}
          {currentStepInfo.id === 'emotion' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emotion Intensity (1 = Very Low, 10 = Overwhelming)
              </label>
              <div className="px-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={data.emotionIntensity}
                  onChange={(e) => updateData('emotionIntensity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span className="font-semibold text-lg text-primary-600">
                    {data.emotionIntensity}
                  </span>
                  <span>10</span>
                </div>
              </div>
            </div>
          ) : (
            <textarea
              value={data[currentStepInfo.id as keyof ThoughtRecordData] as string}
              onChange={(e) => updateData(currentStepInfo.id, e.target.value)}
              placeholder={currentStepInfo.placeholder}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={4}
              maxLength={1000}
            />
          )}

          {currentStepInfo.id !== 'emotion' && (
            <div className="text-xs text-gray-500 text-right mt-1">
              {(data[currentStepInfo.id as keyof ThoughtRecordData] as string).length}/1000
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 mt-0.5">💡</div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Tip</h4>
              <p className="text-blue-700 text-sm">
                {getStepTip(currentStepInfo.id)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastStep ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>

      {/* Summary (Last Step) */}
      {isLastStep && (
        <div className="border-t border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Summary</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-600">Situation:</span>{' '}
              <span className="text-gray-800">{data.situation}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Balanced Thought:</span>{' '}
              <span className="text-gray-800">{data.balancedThought}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Action Plan:</span>{' '}
              <span className="text-gray-800">{data.action}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getStepTip(stepId: string): string {
  switch (stepId) {
    case 'situation':
      return 'Be specific about what happened. Focus on facts, not interpretations.';
    case 'automaticThought':
      return 'Write down the first thoughts that came to mind. These are often harsh or extreme.';
    case 'emotion':
      return 'Rate how you felt at the peak of the emotion, not how you feel now.';
    case 'evidenceFor':
      return 'Look for concrete facts that support your thought, not just feelings.';
    case 'evidenceAgainst':
      return 'Challenge your thought: What would you tell a friend? What contradicts it?';
    case 'balancedThought':
      return 'Combine both sides of evidence. What\'s a more realistic, helpful perspective?';
    case 'action':
      return 'Choose something specific and achievable you can do to help the situation.';
    default:
      return 'Take your time and be honest with yourself.';
  }
}