import React, { useState } from 'react';
import { ThoughtRecordForm } from '../components/ThoughtRecordForm';
import { useJournal } from '../hooks/useJournal';

// For demo, using a static user ID
const DEMO_USER_ID = 'anon_demo_user';

const CBT_SKILLS = [
  {
    id: 'thought-record',
    title: 'Thought Record',
    description: 'Examine and challenge negative thought patterns',
    icon: '🧠',
    difficulty: 'Beginner',
    duration: '10-15 min',
    category: 'CBT',
  },
  {
    id: 'breathing',
    title: 'Deep Breathing',
    description: 'Calm your nervous system with guided breathing',
    icon: '🫁',
    difficulty: 'Beginner',
    duration: '3-5 min',
    category: 'Mindfulness',
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to ground yourself in the present',
    icon: '🌍',
    difficulty: 'Beginner',
    duration: '5 min',
    category: 'Mindfulness',
  },
  {
    id: 'gratitude',
    title: 'Gratitude Practice',
    description: 'Shift focus to positive aspects of your life',
    icon: '🙏',
    difficulty: 'Beginner',
    duration: '5 min',
    category: 'Positive Psychology',
  },
];

export const Skills: React.FC = () => {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [showThoughtRecord, setShowThoughtRecord] = useState(false);
  const { addEntry } = useJournal(DEMO_USER_ID);

  const handleSkillSelect = (skillId: string) => {
    if (skillId === 'thought-record') {
      setShowThoughtRecord(true);
    } else {
      setActiveSkill(skillId);
    }
  };

  const handleThoughtRecordSave = async (entry: any) => {
    try {
      await addEntry(entry);
      setShowThoughtRecord(false);
      // You could show a success message here
    } catch (error) {
      console.error('Failed to save thought record:', error);
    }
  };

  const handleSkillComplete = () => {
    setActiveSkill(null);
  };

  if (showThoughtRecord) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <ThoughtRecordForm
          onSave={handleThoughtRecordSave}
          onCancel={() => setShowThoughtRecord(false)}
        />
      </div>
    );
  }

  if (activeSkill) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <SkillExercise
          skillId={activeSkill}
          onComplete={handleSkillComplete}
          onCancel={() => setActiveSkill(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Mental Wellness Skills</h1>
        <p className="text-gray-600">
          Evidence-based techniques to help you manage thoughts, emotions, and stress.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CBT_SKILLS.map((skill) => (
          <div
            key={skill.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleSkillSelect(skill.id)}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{skill.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {skill.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {skill.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {skill.category}
                  </span>
                  <span>{skill.difficulty}</span>
                  <span>{skill.duration}</span>
                </div>
              </div>
              
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div>
            <h3 className="text-blue-800 font-semibold mb-2">How to use these skills</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Practice regularly for best results</li>
              <li>• Start with beginner techniques if you're new to mental wellness skills</li>
              <li>• Use these tools when you notice difficult thoughts or emotions</li>
              <li>• Remember: it's normal for these skills to feel awkward at first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SkillExerciseProps {
  skillId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const SkillExercise: React.FC<SkillExerciseProps> = ({
  skillId,
  onComplete,
  onCancel,
}) => {

  const skill = CBT_SKILLS.find(s => s.id === skillId);
  
  if (!skill) {
    return <div>Skill not found</div>;
  }

  const renderExercise = () => {
    switch (skillId) {
      case 'breathing':
        return <BreathingExercise onComplete={onComplete} onCancel={onCancel} />;
      case 'grounding':
        return <GroundingExercise onComplete={onComplete} onCancel={onCancel} />;
      case 'gratitude':
        return <GratitudeExercise onComplete={onComplete} onCancel={onCancel} />;
      default:
        return <div>Exercise not implemented yet</div>;
    }
  };

  return renderExercise();
};

const BreathingExercise: React.FC<{ onComplete: () => void; onCancel: () => void }> = ({
  onComplete,
  onCancel,
}) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('ready');
  const [cycle, setCycle] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startExercise = () => {
    setIsActive(true);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    // Inhale for 4 seconds
    setPhase('inhale');
    setTimeout(() => {
      // Hold for 4 seconds
      setPhase('hold');
      setTimeout(() => {
        // Exhale for 6 seconds
        setPhase('exhale');
        setTimeout(() => {
          setCycle(prev => {
            const newCycle = prev + 1;
            if (newCycle >= 6) {
              setIsActive(false);
              setPhase('ready');
              return 0;
            } else {
              runBreathingCycle();
              return newCycle;
            }
          });
        }, 6000);
      }, 4000);
    }, 4000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Deep Breathing Exercise</h2>
      <p className="text-gray-600 mb-8">
        Follow the visual guide to practice 4-4-6 breathing (inhale-hold-exhale)
      </p>

      <div className="mb-8">
        <div className={`
          w-32 h-32 mx-auto rounded-full transition-all duration-1000 ease-in-out
          ${phase === 'inhale' ? 'bg-blue-400 scale-150' : 
            phase === 'hold' ? 'bg-green-400 scale-150' :
            phase === 'exhale' ? 'bg-purple-400 scale-75' :
            'bg-gray-300 scale-100'}
        `} />
        
        <div className="mt-6">
          {isActive ? (
            <div>
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {phase === 'inhale' ? 'Breathe In' :
                 phase === 'hold' ? 'Hold' :
                 phase === 'exhale' ? 'Breathe Out' : ''}
              </div>
              <div className="text-sm text-gray-600">
                Cycle {cycle + 1} of 6
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xl font-semibold text-gray-800 mb-2">
                Ready to begin?
              </div>
              <div className="text-sm text-gray-600">
                Click start when you're comfortable
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        
        {!isActive && cycle === 0 ? (
          <button
            onClick={startExercise}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Start Exercise
          </button>
        ) : !isActive && cycle > 0 ? (
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Complete
          </button>
        ) : null}
      </div>
    </div>
  );
};

const GroundingExercise: React.FC<{ onComplete: () => void; onCancel: () => void }> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(['', '', '', '', '']);

  const steps = [
    { sense: 'See', count: 5, prompt: 'Name 5 things you can see around you' },
    { sense: 'Touch', count: 4, prompt: 'Name 4 things you can touch' },
    { sense: 'Hear', count: 3, prompt: 'Name 3 things you can hear' },
    { sense: 'Smell', count: 2, prompt: 'Name 2 things you can smell' },
    { sense: 'Taste', count: 1, prompt: 'Name 1 thing you can taste' },
  ];

  const updateResponse = (value: string) => {
    const newResponses = [...responses];
    newResponses[currentStep] = value;
    setResponses(newResponses);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">5-4-3-2-1 Grounding</h2>
      <p className="text-gray-600 mb-6">
        This technique helps you ground yourself using your five senses.
      </p>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-4xl mb-4">
          {currentStep === 0 ? '👁️' :
           currentStep === 1 ? '✋' :
           currentStep === 2 ? '👂' :
           currentStep === 3 ? '👃' : '👅'}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {currentStepData.prompt}
        </h3>
        
        <textarea
          value={responses[currentStep]}
          onChange={(e) => updateResponse(e.target.value)}
          placeholder={`Write down ${currentStepData.count} things you can ${currentStepData.sense.toLowerCase()}...`}
          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows={4}
        />
      </div>

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
              onClick={prevStep}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Previous
            </button>
          )}
        </div>

        <button
          onClick={nextStep}
          disabled={!responses[currentStep].trim()}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

const GratitudeExercise: React.FC<{ onComplete: () => void; onCancel: () => void }> = ({
  onComplete,
  onCancel,
}) => {
  const [gratitudeItems, setGratitudeItems] = useState(['', '', '']);

  const updateItem = (index: number, value: string) => {
    const newItems = [...gratitudeItems];
    newItems[index] = value;
    setGratitudeItems(newItems);
  };

  const canComplete = gratitudeItems.every(item => item.trim().length > 0);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Gratitude Practice</h2>
      <p className="text-gray-600 mb-6">
        Take a moment to reflect on three things you're grateful for today.
      </p>

      <div className="space-y-6 mb-8">
        {gratitudeItems.map((item, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you grateful for today? ({index + 1}/3)
            </label>
            <textarea
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="I'm grateful for..."
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          onClick={onComplete}
          disabled={!canComplete}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete
        </button>
      </div>
    </div>
  );
};