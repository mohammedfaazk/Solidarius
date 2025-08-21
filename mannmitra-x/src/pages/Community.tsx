import React, { useState } from 'react';
import { CommunityComposer } from '../components/CommunityComposer';
import type { CommunityPost } from '../types';
import { useConsent } from '../hooks/useConsent';

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
  const { consents } = useConsent('anon_demo_user');
  const [posts, setPosts] = useState<CommunityPost[]>(DEMO_POSTS);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showModerationDemo, setShowModerationDemo] = useState(false);
  const [postInteractions, setPostInteractions] = useState<Record<string, {
    likes: number;
    hugs: number;
    hasLiked: boolean;
    hasHugged: boolean;
    showReply: boolean;
    replies: Array<{id: string; author: string; content: string; timestamp: string}>;
  }>>({});
  const [animatingInteraction, setAnimatingInteraction] = useState<{postId: string; type: 'like' | 'hug'} | null>(null);

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
    
    // Initialize interactions for new post
    setPostInteractions(prev => ({
      ...prev,
      [newPost.id]: {
        likes: 0,
        hugs: 0,
        hasLiked: false,
        hasHugged: false,
        showReply: false,
        replies: []
      }
    }));
  };

  const getPostInteractions = (postId: string) => {
    return postInteractions[postId] || {
      likes: Math.floor(Math.random() * 10) + 1,
      hugs: Math.floor(Math.random() * 8) + 1,
      hasLiked: false,
      hasHugged: false,
      showReply: false,
      replies: []
    };
  };

  const handleInteraction = (postId: string, type: 'like' | 'hug') => {
    const current = getPostInteractions(postId);
    
    setAnimatingInteraction({ postId, type });
    setTimeout(() => setAnimatingInteraction(null), 600);
    
    setPostInteractions(prev => ({
      ...prev,
      [postId]: {
        ...current,
        [type === 'like' ? 'likes' : 'hugs']: current[type === 'like' ? 'hasLiked' : 'hasHugged'] 
          ? current[type === 'like' ? 'likes' : 'hugs'] - 1 
          : current[type === 'like' ? 'likes' : 'hugs'] + 1,
        [type === 'like' ? 'hasLiked' : 'hasHugged']: !current[type === 'like' ? 'hasLiked' : 'hasHugged']
      }
    }));
  };

  const toggleReply = (postId: string) => {
    const current = getPostInteractions(postId);
    setPostInteractions(prev => ({
      ...prev,
      [postId]: {
        ...current,
        showReply: !current.showReply
      }
    }));
  };

  const handleReplySubmit = (postId: string, content: string) => {
    const current = getPostInteractions(postId);
    const newReply = {
      id: `r_${Date.now()}`,
      author: `Anonymous${Math.floor(Math.random() * 1000)}`,
      content,
      timestamp: new Date().toISOString()
    };
    
    setPostInteractions(prev => ({
      ...prev,
      [postId]: {
        ...current,
        replies: [...current.replies, newReply],
        showReply: false
      }
    }));
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

  // Show consent message if community participation is disabled
  if (!consents.community) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Community Support</h1>
          <p className="text-gray-600 mb-4">
            Connect with others, share experiences, and find support in a safe space.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-blue-600 text-4xl mb-4">🔒</div>
          <h3 className="text-blue-800 font-semibold mb-2">Community Participation Disabled</h3>
          <p className="text-blue-700 text-sm mb-4">
            You have disabled community participation in your privacy settings. 
            To access community features, please enable it in the Trust Center.
          </p>
          <a
            href="/trust"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Trust Center
          </a>
        </div>
      </div>
    );
  }

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
            const interactions = getPostInteractions(post.id);
            
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
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 mb-3">
                    <button 
                      onClick={() => handleInteraction(post.id, 'like')}
                      className={`flex items-center gap-2 text-sm transition-all duration-200 ${
                        interactions.hasLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                      } ${animatingInteraction?.postId === post.id && animatingInteraction?.type === 'like' ? 'animate-bounce' : ''}`}
                    >
                      <span className={`transition-transform duration-200 ${interactions.hasLiked ? 'scale-110' : ''}`}>
                        ❤️
                      </span>
                      <span>Like</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{interactions.likes}</span>
                    </button>
                    
                    <button 
                      onClick={() => toggleReply(post.id)}
                      className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm transition-colors"
                    >
                      <span>💬</span>
                      <span>Reply</span>
                      {interactions.replies.length > 0 && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{interactions.replies.length}</span>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => handleInteraction(post.id, 'hug')}
                      className={`flex items-center gap-2 text-sm transition-all duration-200 ${
                        interactions.hasHugged ? 'text-orange-600' : 'text-gray-500 hover:text-orange-600'
                      } ${animatingInteraction?.postId === post.id && animatingInteraction?.type === 'hug' ? 'animate-bounce' : ''}`}
                    >
                      <span className={`transition-transform duration-200 ${interactions.hasHugged ? 'scale-110' : ''}`}>
                        🤗
                      </span>
                      <span>Hug</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{interactions.hugs}</span>
                    </button>
                  </div>

                  {/* Reply Section */}
                  {interactions.showReply && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <ReplyForm onSubmit={(content) => handleReplySubmit(post.id, content)} />
                    </div>
                  )}

                  {/* Replies */}
                  {interactions.replies.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {interactions.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-medium">
                                {reply.author.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">
                                {reply.author} • {formatTimeAgo(reply.timestamp)}
                              </div>
                              <div className="text-sm text-gray-700">
                                {reply.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

interface ReplyFormProps {
  onSubmit: (content: string) => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Share your support or encouragement
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a supportive reply..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows={3}
          maxLength={500}
        />
        <div className="text-xs text-gray-500 mt-1">
          {content.length}/500 characters
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Remember to be kind and supportive
        </div>
        <button
          type="submit"
          disabled={!content.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Post Reply
        </button>
      </div>
    </form>
  );
};