import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { JournalEntry } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProfileChartProps {
  entries: JournalEntry[];
  timeRange?: 'week' | 'month' | 'quarter';
}

export const ProfileChart: React.FC<ProfileChartProps> = ({ 
  entries, 
  timeRange = 'month' 
}) => {
  // Filter entries by time range
  const now = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'quarter':
      startDate.setDate(now.getDate() - 90);
      break;
  }

  const filteredEntries = entries
    .filter(entry => entry.type === 'mood' && entry.moodScore)
    .filter(entry => new Date(entry.timestamp) >= startDate)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Prepare chart data
  const labels = filteredEntries.map(entry => 
    new Date(entry.timestamp).toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    })
  );

  const moodData = filteredEntries.map(entry => entry.moodScore || 0);

  // Calculate statistics
  const averageMood = moodData.length > 0 
    ? moodData.reduce((a, b) => a + b, 0) / moodData.length 
    : 0;

  const trendData = calculateTrend(moodData);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Mood Score',
        data: moodData,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(249, 115, 22)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Trend',
        data: trendData,
        borderColor: 'rgba(59, 130, 246, 0.6)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Mood Tracking - Last ${timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : '90 days'}`,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const moodLabels = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Great'];
            const score = context.parsed.y;
            return `${context.dataset.label}: ${score} (${moodLabels[Math.round(score)] || ''})`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            const labels = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Great'];
            return labels[value] || value;
          },
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgb(249, 115, 22)',
      },
    },
  };

  if (filteredEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Tracking</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h4 className="text-gray-600 font-medium mb-2">No mood data yet</h4>
          <p className="text-gray-500 text-sm">
            Start logging your daily mood to see your progress over time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Tracking</h3>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 uppercase tracking-wide">Average</div>
            <div className="text-lg font-semibold text-gray-800">
              {averageMood.toFixed(1)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 uppercase tracking-wide">Entries</div>
            <div className="text-lg font-semibold text-gray-800">
              {filteredEntries.length}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 uppercase tracking-wide">Best Day</div>
            <div className="text-lg font-semibold text-gray-800">
              {Math.max(...moodData)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 uppercase tracking-wide">Streak</div>
            <div className="text-lg font-semibold text-gray-800">
              {calculateStreak(filteredEntries)} days
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>

      {/* Recent Patterns */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Patterns</h4>
        <div className="text-sm text-gray-600">
          {getInsights(filteredEntries)}
        </div>
      </div>
    </div>
  );
};

// Helper functions
function calculateTrend(data: number[]): number[] {
  if (data.length < 2) return data;
  
  const trend: number[] = [];
  const windowSize = Math.min(3, data.length);
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, start + windowSize);
    const window = data.slice(start, end);
    const average = window.reduce((a, b) => a + b, 0) / window.length;
    trend.push(average);
  }
  
  return trend;
}

function calculateStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (let i = entries.length - 1; i >= 0; i--) {
    const entryDate = new Date(entries[i].timestamp);
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

function getInsights(entries: JournalEntry[]): string {
  if (entries.length < 3) return "Keep logging to see insights about your mood patterns.";
  
  const recentEntries = entries.slice(-7);
  const recentAvg = recentEntries.reduce((sum, e) => sum + (e.moodScore || 0), 0) / recentEntries.length;
  const overallAvg = entries.reduce((sum, e) => sum + (e.moodScore || 0), 0) / entries.length;
  
  if (recentAvg > overallAvg + 0.5) {
    return "Your mood has been trending upward recently! 📈";
  } else if (recentAvg < overallAvg - 0.5) {
    return "Your mood has been lower lately. Consider reaching out for support. 💙";
  } else {
    return "Your mood has been relatively stable. Keep up the good work! ⭐";
  }
}