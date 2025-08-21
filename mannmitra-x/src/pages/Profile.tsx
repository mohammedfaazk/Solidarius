import React, { useState } from 'react';
import { ProfileChart } from '../components/ProfileChart';
import { MoodPicker } from '../components/MoodPicker';
import { useJournal } from '../hooks/useJournal';

// For demo, using a static user ID. In production, this would come from auth
const DEMO_USER_ID = 'anon_demo_user';

export const Profile: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const {
    entries,
    loading,
    addEntry,
    hasMoodToday,
    getWeeklyStats,
    getMonthlyStats,
    getMoodEntries,
  } = useJournal(DEMO_USER_ID);

  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();
  const todayLogged = hasMoodToday();

  const handleMoodSave = async (entryData: any) => {
    try {
      await addEntry(entryData);
    } catch (error) {
      console.error('Failed to save mood entry:', error);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Wellness Journey</h1>
        <p className="text-gray-600">Track your progress and reflect on your mental health journey.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {weeklyStats?.average.toFixed(1) || '—'}
              </p>
              <p className="text-xs text-gray-500">
                {weeklyStats?.entryCount || 0} entries
              </p>
            </div>
            <div className="text-2xl">
              {weeklyStats?.improvement && weeklyStats.improvement > 0 ? '📈' : 
               weeklyStats?.improvement && weeklyStats.improvement < 0 ? '📉' : '📊'}
            </div>
          </div>
          {weeklyStats?.improvement && (
            <div className={`text-xs mt-1 ${
              weeklyStats.improvement > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {weeklyStats.improvement > 0 ? '+' : ''}{weeklyStats.improvement} from last period
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
              <p className="text-xs text-gray-500">
                {getMoodEntries().length} mood logs
              </p>
            </div>
            <div className="text-2xl">✨</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculateCurrentStreak(getMoodEntries())}
              </p>
              <p className="text-xs text-gray-500">days logging</p>
            </div>
            <div className="text-2xl">🔥</div>
          </div>
        </div>
      </div>

      {/* Mood Logger */}
      {!todayLogged && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Ready to log today's mood?</h2>
            <p className="text-gray-600 text-sm">Take a moment to reflect on how you're feeling.</p>
          </div>
          <MoodPicker onSave={handleMoodSave} />
        </div>
      )}

      {todayLogged && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-green-800 font-medium">You've logged your mood today!</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Great job staying consistent with your wellness tracking.
          </p>
        </div>
      )}

      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Mood Trends</h2>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(['week', 'month', 'quarter'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm capitalize ${
                  timeRange === range
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range === 'quarter' ? '3 months' : range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Chart */}
      <ProfileChart entries={entries} timeRange={timeRange} />

      {/* Monthly Insights */}
      {monthlyStats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Common Mood Influences</h4>
              <div className="flex flex-wrap gap-2">
                {monthlyStats.commonTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Weekly Progress</h4>
              <div className="space-y-1">
                {monthlyStats.weeklyAverages.map((avg, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">Week {index + 1}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${(avg / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-700 w-8">{avg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Journal Entries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Entries</h3>
        
        {entries.slice(0, 5).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-600">No entries yet</p>
            <p className="text-gray-500 text-sm">Start by logging your mood to see your entries here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {entry.type.replace('_', ' ')}
                    {entry.type === 'mood' && entry.moodScore && (
                      <span className="ml-2">
                        {getMoodEmoji(entry.moodScore)}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {entry.note_redacted && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {entry.note_redacted}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
function calculateCurrentStreak(entries: any[]): number {
  if (entries.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Sort entries by date descending
  const sortedEntries = entries.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.timestamp);
    entryDate.setHours(0, 0, 0, 0);
    
    if (entryDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (entryDate.getTime() < currentDate.getTime()) {
      break;
    }
  }
  
  return streak;
}

function getMoodEmoji(score: number): string {
  const emojis = ['', '😢', '😔', '😐', '😊', '😁'];
  return emojis[score] || '😐';
}