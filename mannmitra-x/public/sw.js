const CACHE_NAME = 'mannmitra-x-v1';
const STATIC_CACHE = 'mannmitra-static-v1';
const DYNAMIC_CACHE = 'mannmitra-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// API endpoints that should be cached with network-first strategy
const API_CACHE_PATTERNS = [
  /\/api\/llm/,
  /\/api\/moderate/,
  /\/api\/retrieve/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension URLs
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: network-first strategy
  event.respondWith(handleDefault(request));
});

// Network-first strategy for API requests
async function handleAPIRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API request');
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Network unavailable', 
        offline: true,
        message: 'You are currently offline. Some features may not work.'
      }), 
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache-first strategy for static assets
async function handleStaticAssets(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback to network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch static asset', request.url);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Navigation requests - network-first with cache fallback
async function handleNavigation(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed for navigation, trying cache');
    
    // Fallback to cached index.html for SPA routing
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match('/index.html');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page if available
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MannMitra X - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 2rem; 
              background: linear-gradient(135deg, #f97316, #3b82f6);
              color: white;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .container {
              max-width: 400px;
              background: rgba(255, 255, 255, 0.1);
              padding: 2rem;
              border-radius: 1rem;
              backdrop-filter: blur(10px);
            }
            h1 { margin-bottom: 1rem; }
            p { margin-bottom: 1.5rem; opacity: 0.9; }
            button {
              background: white;
              color: #f97316;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-weight: bold;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🌟 MannMitra X</h1>
            <p>You're currently offline, but your mental wellness companion is still here.</p>
            <p>Some features like voice chat and mood logging work offline!</p>
            <button onclick="location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, { 
      headers: { 'Content-Type': 'text/html' } 
    });
  }
}

// Default network-first strategy
async function handleDefault(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Content not available offline', { status: 404 });
  }
}

// Background sync for journal entries
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'journal-sync') {
    event.waitUntil(syncJournalEntries());
  }
});

// Sync journal entries when back online
async function syncJournalEntries() {
  try {
    // Get pending journal entries from IndexedDB
    const pendingEntries = await getPendingJournalEntries();
    
    for (const entry of pendingEntries) {
      try {
        const response = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        
        if (response.ok) {
          // Mark as synced in IndexedDB
          await markEntrySynced(entry.id);
          console.log('Service Worker: Journal entry synced', entry.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync journal entry', entry.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingJournalEntries() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('mannmitra-db', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['journal_entries'], 'readonly');
      const store = transaction.objectStore('journal_entries');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const entries = getAllRequest.result.filter(entry => !entry.synced);
        resolve(entries);
      };
      
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function markEntrySynced(entryId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('mannmitra-db', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['journal_entries'], 'readwrite');
      const store = transaction.objectStore('journal_entries');
      const getRequest = store.get(entryId);
      
      getRequest.onsuccess = () => {
        const entry = getRequest.result;
        if (entry) {
          entry.synced = true;
          store.put(entry);
        }
        resolve();
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

// Push notifications for crisis support (if user opts in)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Open MannMitra',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/dismiss-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Loaded and ready');