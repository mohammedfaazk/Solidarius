import { openDB, type DBSchema } from 'idb';
import type { JournalEntry, User } from '../types';

interface MannMitraDB extends DBSchema {
  users: {
    key: string;
    value: User;
  };
  journal_entries: {
    key: string;
    value: JournalEntry;
    indexes: { 'by-uid': string; 'by-date': string };
  };
  conversations: {
    key: string;
    value: {
      id: string;
      messages: any[];
      timestamp: string;
    };
  };
}

const DB_NAME = 'mannmitra-db';
const DB_VERSION = 1;

let dbPromise: ReturnType<typeof openDB<MannMitraDB>>;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<MannMitraDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Users store
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'uid' });
        }

        // Journal entries store
        if (!db.objectStoreNames.contains('journal_entries')) {
          const journalStore = db.createObjectStore('journal_entries', { keyPath: 'id' });
          journalStore.createIndex('by-uid', 'uid');
          journalStore.createIndex('by-date', 'timestamp');
        }

        // Conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const storageAPI = {
  async saveUser(user: User): Promise<void> {
    const db = await initDB();
    await db.put('users', user);
  },

  async getUser(uid: string): Promise<User | undefined> {
    const db = await initDB();
    return await db.get('users', uid);
  },

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    const db = await initDB();
    await db.put('journal_entries', entry);
  },

  async getJournalEntries(uid: string, limit?: number): Promise<JournalEntry[]> {
    const db = await initDB();
    const tx = db.transaction('journal_entries', 'readonly');
    const index = tx.store.index('by-uid');
    let entries = await index.getAll(uid);
    
    // Sort by timestamp descending
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? entries.slice(0, limit) : entries;
  },

  async deleteUserData(uid: string): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(['users', 'journal_entries', 'conversations'], 'readwrite');
    
    // Delete user
    await tx.objectStore('users').delete(uid);
    
    // Delete journal entries
    const journalIndex = tx.objectStore('journal_entries').index('by-uid');
    const journalEntries = await journalIndex.getAllKeys(uid);
    for (const key of journalEntries) {
      await tx.objectStore('journal_entries').delete(key);
    }
    
    await tx.done;
  },
};