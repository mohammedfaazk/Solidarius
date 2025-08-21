# MannMitra X - Mental Wellness Companion

A privacy-first, voice-first mental wellness PWA for Indian youth featuring an empathetic AI companion, evidence-based CBT skills, mood tracking, and safe peer support.

## 🌟 Features

### Core Functionality
- **Voice Chat**: Natural conversation with AI using Web Speech API (STT/TTS)
- **Mood Tracking**: Daily mood logging with beautiful charts and insights
- **CBT Skills**: Evidence-based mental wellness techniques including Thought Records
- **Community Support**: AI-moderated safe spaces for peer connection
- **Privacy Controls**: Anonymous by default with full data control

### Privacy & Security
- **Anonymous by Default**: No email, phone, or personal info required
- **Local-First**: Data stays on your device unless you opt for cloud sync
- **Auto-Redaction**: Personal information automatically removed before storage
- **Full Data Control**: Export and delete all data anytime
- **Transparent Consent**: Granular privacy controls in Trust Center

### Technical Features
- **PWA**: Works offline, installable on mobile and desktop
- **Voice-First**: Web Speech API for hands-free interaction
- **Real-time Charts**: Mood trends and progress visualization
- **AI Moderation**: Automatic content filtering for safe community
- **Crisis Support**: Built-in safety resources and detection

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern browser with Web Speech API support (Chrome/Edge recommended)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd mannmitra-x
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open browser:**
   - Navigate to `http://localhost:5173`
   - Allow microphone access when prompted (optional)

### Building for Production

```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Frontend (React PWA)
```
src/
├── components/          # Reusable UI components
│   ├── MicButton.tsx   # Voice input button
│   ├── ChatBubble.tsx  # Chat message display
│   ├── MoodPicker.tsx  # Daily mood logger
│   ├── ProfileChart.tsx # Mood tracking charts
│   └── TrustCenter.tsx # Privacy controls
├── hooks/              # Custom React hooks
│   ├── useSTT.ts       # Speech-to-text
│   ├── useTTS.ts       # Text-to-speech
│   ├── useLLM.ts       # AI conversation
│   └── useJournal.ts   # Mood tracking data
├── lib/                # Utilities and storage
│   ├── storage.ts      # IndexedDB operations
│   ├── redact.ts       # PII redaction
│   └── api.ts          # Backend communication
├── pages/              # Route components
│   ├── Chat.tsx        # Voice chat interface
│   ├── Profile.tsx     # Mood tracking dashboard
│   ├── Skills.tsx      # CBT exercises
│   └── Community.tsx   # Peer support
└── types/              # TypeScript definitions
```

### Backend (Cloudflare Workers)
```
workers/
├── src/
│   └── index.ts        # API endpoints
├── wrangler.toml       # Cloudflare configuration
└── package.json        # Worker dependencies
```

### API Endpoints
- `POST /api/llm` - AI conversation fallback
- `POST /api/moderate` - Content moderation
- `POST /api/journal` - Cloud journal sync
- `POST /api/posts` - Community posts
- `POST /api/delete_data` - Data deletion

## 🎯 User Journeys

### 1. New User Onboarding
1. Land on home page → understand privacy-first approach
2. Grant microphone permission (optional)
3. Set privacy preferences in Trust Center
4. Start first voice conversation or mood log

### 2. Daily Mood Tracking
1. Open Profile page
2. Tap "Log Today's Mood" → select emoji (1-5 scale)
3. Add optional tags and note
4. View progress charts and insights

### 3. Voice Conversation
1. Navigate to Chat page
2. Tap microphone button → speak naturally
3. AI responds with empathy and support
4. Crisis detection triggers safety resources if needed

### 4. CBT Skill Practice
1. Go to Skills page → select Thought Record
2. Complete 7-step guided process:
   - Situation → Automatic Thought → Evidence → Balanced Thought → Action
3. Save to journal and link to mood data

### 5. Community Participation
1. Visit Community page → select topic
2. Compose post → AI suggests kinder phrasing if needed
3. Engage with peer posts safely and anonymously

## 📊 Data Model

### Local Storage (IndexedDB)
```typescript
interface User {
  uid: string;
  createdAt: string;
  consents: {
    analytics: boolean;
    storeJournal: boolean;
    community: boolean;
    shareCounselor: boolean;
  };
}

interface JournalEntry {
  id: string;
  uid: string;
  type: 'mood' | 'thought_record' | 'note';
  moodScore?: number; // 1-5
  tags?: string[];
  note_redacted?: string;
  timestamp: string;
}
```

## 🛡️ Privacy & Safety

### Privacy Measures
- **Anonymous IDs**: Generated locally, no personal info
- **PII Redaction**: Phone numbers, emails, names automatically removed
- **Consent-First**: All data sharing requires explicit user permission
- **Deletion Rights**: Complete data removal with receipt
- **No Tracking**: No analytics without user consent

### Safety Features
- **Crisis Detection**: Keyword and sentiment analysis
- **Human Resources**: Indian helpline numbers and crisis support
- **Content Moderation**: AI filters harmful content
- **Safe Reporting**: Community content flagging system

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically on push

### Backend (Cloudflare Workers)
```bash
cd workers
npx wrangler deploy
```

## 📱 PWA Features

### Installation
- Add to home screen on mobile
- Desktop app experience
- Offline functionality

### Service Worker
- Caches static assets
- Background sync for journal entries
- Offline fallback pages

## 🆘 Crisis Resources

- **India National Suicide Prevention**: 1-800-599-0019
- **Sneha Foundation**: 044-24640050
- **Emergency Services**: 112

## 🏆 Key Innovation Points

- **Privacy Innovation**: Anonymous-first architecture
- **Voice UX**: Natural conversation interface  
- **Real Impact**: Evidence-based mental health tools
- **Technical Excellence**: PWA, offline-first, scalable
- **Safety First**: Crisis detection and human escalation
- **Data Rights**: Complete user control and transparency

---

**MannMitra X** - Empowering mental wellness with privacy, voice, and community. 🌟
