import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🌟</div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          MannMitra X
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your privacy-first mental wellness companion. Chat with AI, track your mood, 
          learn CBT skills, and connect with peer support—all in your browser.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/chat"
            className="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            Start Voice Chat
          </Link>
          <Link
            to="/profile"
            className="px-8 py-3 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
          >
            Track Your Mood
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          to="/chat"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🎤</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Voice Companion</h3>
          <p className="text-gray-600 text-sm">
            Talk to your AI wellness companion using voice or text. Get empathetic support anytime.
          </p>
        </Link>

        <Link 
          to="/profile"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Mood Tracking</h3>
          <p className="text-gray-600 text-sm">
            Log daily moods and see your progress over time with beautiful charts and insights.
          </p>
        </Link>

        <Link 
          to="/skills"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🧠</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">CBT Skills</h3>
          <p className="text-gray-600 text-sm">
            Learn evidence-based techniques like Thought Records and mindfulness exercises.
          </p>
        </Link>

        <Link 
          to="/community"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">💬</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Safe Community</h3>
          <p className="text-gray-600 text-sm">
            Connect with peers in AI-moderated safe spaces for support and encouragement.
          </p>
        </Link>

        <Link 
          to="/trust"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🔒</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Privacy Control</h3>
          <p className="text-gray-600 text-sm">
            Full control over your data. Anonymous by default, delete anytime, export everything.
          </p>
        </Link>

        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
          <div className="text-3xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Works Offline</h3>
          <p className="text-gray-600 text-sm">
            PWA technology means core features work even without internet connection.
          </p>
        </div>
      </div>

      {/* Privacy Highlights */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-8 border border-primary-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Privacy-First Design
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl mb-2">🎭</div>
            <h3 className="font-semibold text-gray-800 mb-2">Anonymous by Default</h3>
            <p className="text-gray-600 text-sm">
              No email, phone, or personal info required. You're anonymous from day one.
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🏠</div>
            <h3 className="font-semibold text-gray-800 mb-2">Local-First</h3>
            <p className="text-gray-600 text-sm">
              Your data stays on your device. Cloud sync only with your explicit consent.
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="font-semibold text-gray-800 mb-2">Auto-Redaction</h3>
            <p className="text-gray-600 text-sm">
              Personal info is automatically removed before any data storage or sharing.
            </p>
          </div>
        </div>
      </div>

      {/* Crisis Support */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-red-600 text-xl">🆘</div>
          <div>
            <h3 className="font-semibold text-red-800 mb-2">Crisis Support</h3>
            <p className="text-red-700 text-sm mb-3">
              If you're experiencing thoughts of self-harm, please reach out for immediate help:
            </p>
            <div className="text-sm text-red-700 space-y-1">
              <div><strong>India National Suicide Prevention Helpline:</strong> 1-800-599-0019</div>
              <div><strong>Sneha Foundation (24/7):</strong> 044-24640050</div>
              <div><strong>Emergency Services:</strong> 112</div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Getting Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Allow Microphone</h3>
            <p className="text-gray-600 text-sm">
              Grant microphone access for voice features (optional - you can also type).
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibant text-gray-800 mb-2">Start Chatting</h3>
            <p className="text-gray-600 text-sm">
              Begin a conversation about how you're feeling or what's on your mind.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Track Progress</h3>
            <p className="text-gray-600 text-sm">
              Log your mood daily and use CBT skills to build mental wellness habits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};