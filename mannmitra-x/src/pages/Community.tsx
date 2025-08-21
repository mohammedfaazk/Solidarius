import React, { useState } from 'react';
import { CommunityComposer } from '../components/CommunityComposer';
import type { CommunityPost } from '../types';

// Demo data for community posts
const DEMO_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    topicId: 'exam_stress',
    uidPseudo: 'KindHeart42',
    text_redacted: 'Feeling overwhelmed about upcoming board exams. Anyone else dealing with exam anxiety?',
    toxicity: 0.1,
    status: 'published',
    createdAt: '2025-08-21T02:00:00Z',
  },
  {
    id: 'p2',
    topicId: 'exam_stress',
    uidPseudo: 'BraveSpirit88',
    text_redacted: 'I found that breaking study sessions into 25-minute chunks really helps. Also, deep breathing when I start to panic.',
    toxicity: 0.05,
    status: 'published',
    createdAt: '2025-08-21T01:30:00Z',
  },
  {
    id: 'p3',
    topicId: 'self_care',
    uidPseudo: 'GentleLight77',
    text_redacted: 'Reminder: Taking breaks isn\'t lazy, it\'s necessary. Your mental health matters.',
    toxicity: 0.02,
    status: 'published',
    createdAt: '2025-08-21T01:00:00Z',
  },
  {
    id: 'p4',
    topicId: 'anxiety',
    uidPseudo: 'WiseVoice33',
    text_redacted: 'Had my first panic attack yesterday. Still shaken but talking to my friend helped. You\'re not alone in this.',
    toxicity: 0.15,
    status: 'published',
    createdAt: '2025-08-20T23:30:00Z',
  },
];

const TOPICS = [
  { id: 'all', label: 'All Topics', icon: '🌍' },
  { id: 'general', label: 'General Support', icon: '💬' },
  { id: 'exam_stress', label: 'Exam Stress', icon: '📚' },
  { id: 'relationships', label: 'Relationships', icon: '👥' },
  { id: 'anxiety', label: 'Anxiety', icon: '😰' },
  { id: 'depression', label: 'Depression', icon: '💙' },
  { id: 'self_care', label: 'Self Care', icon: '🌱' },
];

export const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(DEMO_POSTS);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showModerationDemo, setShowModerationDemo] = useState(false);

  const filteredPosts = posts.filter(post => 
    selectedTopic === 'all' || post.topicId === selectedTopic
  ).filter(post => post.status === 'published');

  const handleNewPost = (postData: Omit<CommunityPost, 'id' | 'createdAt'>) => {
    const newPost: CommunityPost = {
      ...postData,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setPosts(prev => [newPost, ...prev]);
  };

  const getTopicInfo = (topicId: string) => {
    return TOPICS.find(t => t.id === topicId) || TOPICS[0];
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Community Support</h1>
        <p className="text-gray-600">
          Connect with others, share experiences, and find support in a safe space.
        </p>
      </div>

      {/* Topic Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Browse by Topic</h3>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`
                px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2
                ${selectedTopic === topic.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span>{topic.icon}</span>
              <span>{topic.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <CommunityComposer onPost={handleNewPost} />

      {/* Moderation Demo */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">🛡️</div>
          <div className="flex-1">
            <h3 className="text-blue-800 font-semibold mb-2">AI-Powered Safety</h3>
            <p className="text-blue-700 text-sm mb-3">
              Our AI helps ensure community posts are kind and supportive. Toxic content is automatically held for review.
            </p>
            <button
              onClick={() => setShowModerationDemo(!showModerationDemo)}
              className="text-blue-600 text-sm underline hover:text-blue-800"
            >
              {showModerationDemo ? 'Hide' : 'See'} moderation demo
            </button>
          </div>
        </div>

        {showModerationDemo && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Example: Held Post</h4>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
              <p className="text-sm text-red-800">
                "Everyone is so [harsh word] and I [negative language] this place"
              </p>
              <span className="text-xs text-red-600">⚠️ Held for review - High toxicity detected</span>
            </div>
            
            <h4 className="text-sm font-medium text-gray-800 mb-2">AI Suggestion:</h4>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-800">
                "I'm feeling frustrated and having a tough time here"
              </p>
              <span className="text-xs text-green-600">✓ Approved - Expresses same feeling more kindly</span>
            </div>
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-gray-600 font-medium mb-2">No posts yet</h3>
            <p className="text-gray-500 text-sm">
              Be the first to share something in the {getTopicInfo(selectedTopic).label.toLowerCase()} topic!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const topicInfo = getTopicInfo(post.topicId);
            
            return (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-medium">
                        {post.uidPseudo.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">
                        {post.uidPseudo}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span>{topicInfo.icon}</span>
                          {topicInfo.label}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Safety Indicator */}
                  <div className={`
                    text-xs px-2 py-1 rounded
                    ${post.toxicity < 0.2 ? 'bg-green-100 text-green-700' :
                      post.toxicity < 0.4 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}
                  `}>
                    {post.toxicity < 0.2 ? '✓ Safe' :
                     post.toxicity < 0.4 ? '⚠ Reviewed' :
                     '🛡 Moderated'}
                  </div>
                </div>

                {/* Post Content */}
                <div className="text-gray-800 text-sm leading-relaxed mb-4">
                  {post.text_redacted}
                </div>

                {/* Engagement Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm">
                    <span>💙</span>
                    <span>Support</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm">
                    <span>💬</span>
                    <span>Reply</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600 text-sm">
                    <span>🤗</span>
                    <span>Hug</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Community Guidelines */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Community Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">✅ Do</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Share your experiences and feelings</li>
              <li>• Offer support and encouragement</li>
              <li>• Ask for help when you need it</li>
              <li>• Respect others' perspectives</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">❌ Don't</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Share personal information</li>
              <li>• Give medical or professional advice</li>
              <li>• Use harsh or judgmental language</li>
              <li>• Post content that could be triggering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};