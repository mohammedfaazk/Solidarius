import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { Skills } from './pages/Skills';
import { Community } from './pages/Community';
import { Trust } from './pages/Trust';
import { initDB } from './lib/storage';

function App() {
  useEffect(() => {
    // Initialize IndexedDB
    initDB();
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <Navigation />
        
        <main className="pb-20 md:pb-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/community" element={<Community />} />
            <Route path="/trust" element={<Trust />} />
          </Routes>
        </main>

        {/* Offline indicator */}
        <OfflineIndicator />
      </div>
    </Router>
  );
}

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      📡 You're offline - Some features may be limited
    </div>
  );
};

export default App;
