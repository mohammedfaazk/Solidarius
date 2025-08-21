import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry } from '../types';
import { storageAPI } from '../lib/storage';
import { redactPII } from '../lib/redact';
import { useConsent } from './useConsent';

export function useJournal(userId: string) {
  const { consents } = useConsent(userId);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, [userId]);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const journalEntries = await storageAPI.getJournalEntries(userId);
      setEntries(journalEntries);
      setError(null);
    } catch (err) {
      setError('Failed to load journal entries');
      console.error('Error loading journal entries:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addEntry = useCallback(async (entryData: Omit<JournalEntry, 'id' | 'uid' | 'timestamp'>) => {
    try {
      const entry: JournalEntry = {
        ...entryData,
        id: `jr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uid: userId,
        timestamp: new Date().toISOString(),
        note_redacted: entryData.note_redacted ? redactPII(entryData.note_redacted) : undefined,
      };

      // Always save locally
      await storageAPI.saveJournalEntry(entry);
      setEntries(prev => [entry, ...prev]);
      
      // Save to cloud only if user has consented to cloud storage
      if (consents.storeJournal) {
        try {
          await fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: userId,
              type: entry.type,
              moodScore: entry.moodScore,
              tags: entry.tags,
              note: entry.note_redacted,
              thoughtRecord: entry.thoughtRecord,
              timestamp: entry.timestamp
            }),
          });
        } catch (cloudError) {
          console.warn('Failed to save to cloud, but local save succeeded:', cloudError);
          // Don't throw error - local save is primary
        }
      }
      
      return entry;
    } catch (err) {
      setError('Failed to save journal entry');
      console.error('Error saving journal entry:', err);
      throw err;
    }
  }, [userId, consents.storeJournal]);

  const getMoodEntries = useCallback((days?: number) => {
    let moodEntries = entries.filter(entry => entry.type === 'mood');
    
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      moodEntries = moodEntries.filter(entry => 
        new Date(entry.timestamp) >= cutoffDate
      );
    }
    
    return moodEntries;
  }, [entries]);

  const getThoughtRecords = useCallback(() => {
    return entries.filter(entry => entry.type === 'thought_record');
  }, [entries]);

  const getEntriesByDate = useCallback((date: Date) => {
    const dateStr = date.toDateString();
    return entries.filter(entry => 
      new Date(entry.timestamp).toDateString() === dateStr
    );
  }, [entries]);

  const getTodaysEntries = useCallback(() => {
    return getEntriesByDate(new Date());
  }, [getEntriesByDate]);

  const hasMoodToday = useCallback(() => {
    const today = getTodaysEntries();
    return today.some(entry => entry.type === 'mood');
  }, [getTodaysEntries]);

  const getWeeklyStats = useCallback(() => {
    const weekEntries = getMoodEntries(7);
    if (weekEntries.length === 0) return null;

    const moodScores = weekEntries.map(e => e.moodScore || 0);
    const average = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
    const highest = Math.max(...moodScores);
    const lowest = Math.min(...moodScores);

    return {
      average: parseFloat(average.toFixed(1)),
      highest,
      lowest,
      entryCount: weekEntries.length,
      improvement: calculateImprovement(weekEntries),
    };
  }, [getMoodEntries]);

  const getMonthlyStats = useCallback(() => {
    const monthEntries = getMoodEntries(30);
    if (monthEntries.length === 0) return null;

    const moodScores = monthEntries.map(e => e.moodScore || 0);
    const average = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;

    // Group by week to show progress
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = 7 * i;
      const weekEnd = 7 * (i + 1);
      const weekEntries = monthEntries.slice(weekStart, weekEnd);
      
      if (weekEntries.length > 0) {
        const weekAvg = weekEntries.reduce((sum, e) => sum + (e.moodScore || 0), 0) / weekEntries.length;
        weeks.push(parseFloat(weekAvg.toFixed(1)));
      }
    }

    return {
      average: parseFloat(average.toFixed(1)),
      entryCount: monthEntries.length,
      weeklyAverages: weeks,
      commonTags: getCommonTags(monthEntries),
    };
  }, [getMoodEntries]);

  return {
    entries,
    loading,
    error,
    loadEntries,
    addEntry,
    getMoodEntries,
    getThoughtRecords,
    getEntriesByDate,
    getTodaysEntries,
    hasMoodToday,
    getWeeklyStats,
    getMonthlyStats,
  };
}

// Helper functions
function calculateImprovement(entries: JournalEntry[]): number {
  if (entries.length < 2) return 0;
  
  const sorted = entries.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const firstHalf = sorted.slice(0, Math.ceil(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, e) => sum + (e.moodScore || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, e) => sum + (e.moodScore || 0), 0) / secondHalf.length;
  
  return parseFloat((secondAvg - firstAvg).toFixed(1));
}

function getCommonTags(entries: JournalEntry[]): string[] {
  const tagCounts: { [key: string]: number } = {};
  
  entries.forEach(entry => {
    entry.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);
}