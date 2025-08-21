import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { storageAPI } from '../lib/storage';

interface ConsentSettings {
  analytics: boolean;
  storeJournal: boolean;
  community: boolean;
  shareCounselor: boolean;
}

const DEFAULT_CONSENTS: ConsentSettings = {
  analytics: false,
  storeJournal: false,
  community: true,
  shareCounselor: false,
};

export function useConsent(userId: string) {
  const [consents, setConsents] = useState<ConsentSettings>(DEFAULT_CONSENTS);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Load user consents on mount
  useEffect(() => {
    loadUserConsents();
  }, [userId]);

  const loadUserConsents = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await storageAPI.getUser(userId);
      
      if (userData) {
        setUser(userData);
        setConsents(userData.consents);
      } else {
        // Create new user with default consents
        const newUser: User = {
          uid: userId,
          createdAt: new Date().toISOString(),
          locale: 'en-IN',
          deviceCaps: {
            webgpu: 'gpu' in navigator,
            stt: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
            tts: 'speechSynthesis' in window,
          },
          consents: DEFAULT_CONSENTS,
        };
        
        await storageAPI.saveUser(newUser);
        setUser(newUser);
        setConsents(DEFAULT_CONSENTS);
      }
    } catch (error) {
      console.error('Failed to load user consents:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateConsent = useCallback(async (key: keyof ConsentSettings, value: boolean) => {
    try {
      const newConsents = { ...consents, [key]: value };
      setConsents(newConsents);

      if (user) {
        const updatedUser = { ...user, consents: newConsents };
        await storageAPI.saveUser(updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to update consent:', error);
      // Revert on error
      setConsents(consents);
    }
  }, [consents, user]);

  const deleteAllData = useCallback(async (): Promise<string> => {
    try {
      // Delete local data
      await storageAPI.deleteUserData(userId);
      
      // Call server deletion endpoint
      const response = await fetch('/api/delete_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userId }),
      });

      if (response.ok) {
        const { receiptId } = await response.json();
        
        // Clear local state
        setUser(null);
        setConsents(DEFAULT_CONSENTS);
        
        // Clear localStorage
        localStorage.removeItem(`mannmitra_user_${userId}`);
        
        return receiptId;
      } else {
        throw new Error('Server deletion failed');
      }
    } catch (error) {
      console.error('Failed to delete data:', error);
      throw error;
    }
  }, [userId]);

  const exportData = useCallback(async (): Promise<any> => {
    try {
      const journalEntries = await storageAPI.getJournalEntries(userId);
      
      return {
        user: user,
        journalEntries: journalEntries,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, [userId, user]);

  return {
    consents,
    user,
    loading,
    updateConsent,
    deleteAllData,
    exportData,
    loadUserConsents,
  };
}