export interface Env {
  PERSPECTIVE_API_KEY?: string;
  HF_API_TOKEN?: string;
  NEON_DATABASE_URL?: string;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response: Response;

      switch (true) {
        case path.startsWith('/api/llm'):
          response = await handleLLM(request, env);
          break;
        case path.startsWith('/api/moderate'):
          response = await handleModerate(request, env);
          break;
        case path.startsWith('/api/journal'):
          response = await handleJournal(request, env);
          break;
        case path.startsWith('/api/posts'):
          response = await handlePosts(request, env);
          break;
        case path.startsWith('/api/retrieve'):
          response = await handleRetrieve(request, env);
          break;
        case path.startsWith('/api/delete_data'):
          response = await handleDeleteData(request, env);
          break;
        case path.startsWith('/api/assess'):
          response = await handleAssess(request, env);
          break;
        case path === '/api/health':
          response = new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
          break;
        default:
          response = new Response('Not Found', { status: 404 });
      }

      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('API Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  },
};

// LLM endpoint (fallback for when on-device fails)
async function handleLLM(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages } = await request.json();
    
    // Simple fallback responses for demo
    const reply = generateFallbackReply(messages);
    
    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Moderation endpoint using Perspective API
async function handleModerate(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { text } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use Perspective API if key is available
    if (env.PERSPECTIVE_API_KEY) {
      const result = await moderateWithPerspective(text, env.PERSPECTIVE_API_KEY);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fallback to simple client-side moderation
    const toxicity = detectToxicity(text);
    const self_harm = detectSelfHarm(text);
    
    return new Response(JSON.stringify({
      toxicity,
      self_harm,
      action: toxicity > 0.5 || self_harm > 0.7 ? 'hold' : self_harm > 0.3 ? 'crisis' : 'allow'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Moderation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Journal endpoint (for cloud storage if user consents)
async function handleJournal(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { uid, type, moodScore, tags, note } = await request.json();
    
    // Validate required fields
    if (!uid || !type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate entry ID
    const id = `jr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In production, save to Neon/PostgreSQL
    // For demo, just return success
    return new Response(JSON.stringify({ 
      id,
      status: 'saved',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save journal entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Community posts endpoint
async function handlePosts(request: Request, env: Env): Promise<Response> {
  if (request.method === 'GET') {
    // Return demo posts
    const demoPosts = [
      {
        id: 'p1',
        topicId: 'exam_stress',
        text_redacted: 'Feeling overwhelmed about upcoming exams...',
        uidPseudo: 'KindHeart42',
        status: 'published',
        createdAt: new Date().toISOString()
      }
    ];
    
    return new Response(JSON.stringify({ posts: demoPosts }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    try {
      const { uid, topicId, text } = await request.json();
      
      // Moderate the post
      const toxicity = detectToxicity(text);
      const self_harm = detectSelfHarm(text);
      
      const status = toxicity > 0.5 || self_harm > 0.5 ? 'held' : 'published';
      const postId = `p_${Date.now()}`;
      
      return new Response(JSON.stringify({ 
        status,
        postId,
        toxicity,
        self_harm
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to create post' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}

// RAG retrieval endpoint
async function handleRetrieve(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { query } = await request.json();
    
    // Demo: return relevant mental health resources
    const passages = getDemoPassages(query);
    
    return new Response(JSON.stringify({ passages }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Retrieval failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Assessment endpoint (PHQ-9, GAD-7, etc.)
async function handleAssess(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { type, answers } = await request.json();
    
    if (type === 'phq9' && answers && answers.length === 9) {
      const score = answers.reduce((sum: number, answer: number) => sum + answer, 0);
      const band = score < 5 ? 'minimal' : score < 10 ? 'mild' : score < 15 ? 'moderate' : score < 20 ? 'severe' : 'severe';
      
      return new Response(JSON.stringify({ score, band }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid assessment type or answers' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Assessment failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Delete user data endpoint
async function handleDeleteData(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate deletion receipt
    const receiptId = `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In production: delete from all databases and storage
    
    return new Response(JSON.stringify({ 
      receiptId,
      status: 'deleted',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Data deletion failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions
function generateFallbackReply(messages: any[]): string {
  const lastMessage = messages[messages.length - 1];
  const userText = lastMessage.content.toLowerCase();

  // Crisis detection
  if (userText.includes('kill') || userText.includes('die') || userText.includes('end my life')) {
    return "I'm really sorry you're feeling this way. I'm here with you. Can you tell me if you're thinking about harming yourself right now?";
  }

  // Stress/anxiety responses
  if (userText.includes('stress') || userText.includes('anxious') || userText.includes('worried')) {
    return "It sounds like you're dealing with some challenging feelings right now. Would you like to try a quick breathing exercise together, or would you prefer to talk about what's on your mind?";
  }

  // Default empathetic response
  const responses = [
    "Thank you for sharing that with me. I'm here to listen and support you.",
    "I can hear that this is important to you. Can you tell me more about how you're feeling?",
    "It takes courage to open up about these feelings. I'm glad you're talking to me about this.",
    "Your feelings are valid. Let's explore this together at your own pace."
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

function detectToxicity(text: string): number {
  const toxicPatterns = [
    { pattern: /\b(idiot|stupid|dumb|moron)\b/gi, weight: 0.3 },
    { pattern: /\b(hate|kill|die|murder)\b/gi, weight: 0.5 },
    { pattern: /\b(loser|worthless|pathetic)\b/gi, weight: 0.4 },
  ];
  
  let score = 0;
  toxicPatterns.forEach(({ pattern, weight }) => {
    const matches = text.match(pattern);
    if (matches) {
      score += matches.length * weight;
    }
  });
  
  return Math.min(score, 1);
}

function detectSelfHarm(text: string): number {
  const selfHarmPatterns = [
    /\b(kill myself|end my life|want to die|suicide)\b/gi,
    /\b(hurt myself|harm myself|cut myself)\b/gi,
    /\b(can't go on|give up|done with life)\b/gi,
  ];
  
  let score = 0;
  selfHarmPatterns.forEach(pattern => {
    if (pattern.test(text)) {
      score += 0.4;
    }
  });
  
  return Math.min(score, 1);
}

async function moderateWithPerspective(text: string, apiKey: string): Promise<any> {
  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        IDENTITY_ATTACK: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {}
      },
      comment: { text }
    })
  });

  if (!response.ok) {
    throw new Error('Perspective API request failed');
  }

  const data = await response.json();
  const toxicity = data.attributeScores?.TOXICITY?.summaryScore?.value || 0;
  const severeToxicity = data.attributeScores?.SEVERE_TOXICITY?.summaryScore?.value || 0;
  
  return {
    toxicity,
    self_harm: severeToxicity, // Approximate
    action: toxicity > 0.7 || severeToxicity > 0.5 ? 'hold' : 'allow'
  };
}

function getDemoPassages(query: string): any[] {
  const passages = [
    {
      id: 'p1',
      title: 'Breathing Techniques for Anxiety',
      content: 'Deep breathing exercises can help calm your nervous system. Try the 4-7-8 technique: inhale for 4 counts, hold for 7, exhale for 8.',
      relevance: 0.9
    },
    {
      id: 'p2',
      title: 'Understanding Exam Stress',
      content: 'Exam stress is normal and manageable. Break study sessions into smaller chunks, take regular breaks, and practice self-compassion.',
      relevance: 0.8
    },
    {
      id: 'p3',
      title: 'Building Daily Mental Health Habits',
      content: 'Small daily practices like gratitude journaling, mindful walking, and connecting with friends can significantly improve mental wellbeing.',
      relevance: 0.7
    }
  ];

  // Simple keyword matching for demo
  return passages.filter(p => 
    query.toLowerCase().split(' ').some(word => 
      p.content.toLowerCase().includes(word) || 
      p.title.toLowerCase().includes(word)
    )
  ).slice(0, 3);
}