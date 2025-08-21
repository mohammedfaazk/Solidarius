export function redactPII(text: string): string {
  if (!text) return text;
  
  return text
    // Phone numbers (Indian format)
    .replace(/\b[6-9]\d{9}\b/g, '[phone]')
    .replace(/\b\d{10}\b/g, '[phone]')
    .replace(/\+91[\s-]?\d{10}/g, '[phone]')
    
    // Email addresses
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
    
    // Names (basic pattern - two consecutive capitalized words)
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[name]')
    
    // Addresses with numbers
    .replace(/\b\d{1,4}[\s-]?[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Block|Sector)\b/gi, '[address]')
    
    // Credit card numbers
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[card]')
    
    // Aadhaar numbers
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[id]')
    
    // Generic number sequences that might be sensitive
    .replace(/\b\d{6,}\b/g, '[number]');
}

export function detectCrisisKeywords(text: string): boolean {
  const crisisPatterns = [
    /\b(kill myself|end my life|want to die|suicide|can't take it|no point living)\b/i,
    /\b(hurt myself|harm myself|cut myself|overdose)\b/i,
    /\b(everyone would be better|world without me|tired of living)\b/i,
    /\b(can't go on|give up|done with life|end it all)\b/i,
  ];
  
  return crisisPatterns.some(pattern => pattern.test(text));
}

// Comprehensive moderation word lists for mental health community
const NEGATIVE_WORDS = {
  // High toxicity - immediate hold for review
  severe: [
    'stupid', 'idiot', 'moron', 'dumb', 'retard', 'loser', 'worthless', 'pathetic', 'disgusting',
    'hate', 'kill', 'die', 'murder', 'violence', 'abuse', 'attack', 'destroy', 'ruin',
    'ugly', 'fat', 'hideous', 'gross', 'repulsive', 'awful', 'terrible', 'horrible',
    'shut up', 'go away', 'get lost', 'nobody cares', 'waste of space', 'useless'
  ],
  
  // Medium toxicity - flag for review
  moderate: [
    'annoying', 'weird', 'strange', 'crazy', 'insane', 'mental', 'nuts', 'psycho',
    'failure', 'hopeless', 'helpless', 'disaster', 'mess', 'problem', 'burden',
    'weak', 'coward', 'baby', 'childish', 'immature', 'naive', 'clueless',
    'wrong', 'bad', 'worse', 'worst', 'negative', 'toxic', 'harmful'
  ],
  
  // Crisis-related words that need special handling
  crisis: [
    'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'hurt myself', 'harm myself', 'cut myself', 'overdose', 'pills',
    'can\'t go on', 'give up', 'done with life', 'end it all', 'no point',
    'everyone would be better', 'world without me', 'tired of living'
  ],
  
  // Profanity - moderate filtering
  profanity: [
    'fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'bastard', 'crap',
    'piss', 'bloody', 'suck', 'screw'
  ]
};

export function detectToxicity(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  // Check severe toxicity words (weight: 0.8)
  NEGATIVE_WORDS.severe.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      score += 0.8;
    }
  });
  
  // Check moderate toxicity words (weight: 0.4)
  NEGATIVE_WORDS.moderate.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      score += 0.4;
    }
  });
  
  // Check profanity (weight: 0.2)
  NEGATIVE_WORDS.profanity.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      score += 0.2;
    }
  });
  
  return Math.min(score, 1); // Cap at 1
}

export function detectSelfHarm(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  // Check crisis words (weight: 0.7)
  NEGATIVE_WORDS.crisis.forEach(phrase => {
    if (lowerText.includes(phrase.toLowerCase())) {
      score += 0.7;
    }
  });
  
  return Math.min(score, 1); // Cap at 1
}

export function getNegativeWordsList() {
  return NEGATIVE_WORDS;
}

export function moderateContent(text: string): {
  toxicity: number;
  selfHarm: number;
  action: 'allow' | 'hold' | 'crisis';
  flaggedWords: string[];
} {
  const toxicity = detectToxicity(text);
  const selfHarm = detectSelfHarm(text);
  const lowerText = text.toLowerCase();
  
  // Find flagged words
  const flaggedWords: string[] = [];
  Object.values(NEGATIVE_WORDS).flat().forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      flaggedWords.push(word);
    }
  });
  
  // Determine action
  let action: 'allow' | 'hold' | 'crisis' = 'allow';
  if (selfHarm > 0.3) {
    action = 'crisis';
  } else if (toxicity > 0.5 || selfHarm > 0.1) {
    action = 'hold';
  }
  
  return {
    toxicity,
    selfHarm,
    action,
    flaggedWords: [...new Set(flaggedWords)] // Remove duplicates
  };
}