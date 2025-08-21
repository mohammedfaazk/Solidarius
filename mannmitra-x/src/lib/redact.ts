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

export function detectToxicity(text: string): number {
  // Basic client-side toxicity detection
  const toxicPatterns = [
    { pattern: /\b(idiot|stupid|dumb|moron)\b/gi, weight: 0.3 },
    { pattern: /\b(hate|kill|die|murder)\b/gi, weight: 0.5 },
    { pattern: /\b(f\*ck|sh\*t|damn)\b/gi, weight: 0.2 },
    { pattern: /\b(loser|worthless|pathetic)\b/gi, weight: 0.4 },
  ];
  
  let score = 0;
  toxicPatterns.forEach(({ pattern, weight }) => {
    const matches = text.match(pattern);
    if (matches) {
      score += matches.length * weight;
    }
  });
  
  return Math.min(score, 1); // Cap at 1
}