/**
 * Smart Pronunciation Assessment Service
 * Uses Azure Speech Services with hybrid sampling strategy to reduce costs by 75-80%
 */

import {
  PronunciationAssessmentResult,
  AssessmentContext,
  AssessmentStats,
  UserLevel,
  WordAssessment,
} from '../types';

/**
 * Azure Speech Services configuration
 */
export interface AzureSpeechConfig {
  /** Azure Speech Services API key */
  apiKey: string;
  /** Azure region (e.g., 'eastus', 'westus') */
  region: string;
}

/**
 * Hybrid assessment strategy configuration
 */
interface HybridStrategyConfig {
  /** Force assessment when confidence below this threshold */
  confidenceThreshold: number;
  /** Periodic assessment interval (every N messages) */
  periodicInterval: number;
  /** Time interval for conditional assessment (ms) */
  timeInterval: number;
  /** Probability when time interval exceeded */
  timeIntervalProbability: number;
  /** Probability for difficult words */
  difficultWordProbability: number;
  /** Base random rates by user level */
  baseRates: Record<UserLevel, number>;
}

/**
 * Default hybrid strategy configuration
 */
const DEFAULT_STRATEGY: HybridStrategyConfig = {
  confidenceThreshold: 0.7,
  periodicInterval: 5,
  timeInterval: 60000, // 60 seconds
  timeIntervalProbability: 0.5,
  difficultWordProbability: 0.4,
  baseRates: {
    beginner: 0.3,
    intermediate: 0.2,
    advanced: 0.1,
  },
};

/**
 * Difficult English sounds for Chinese learners
 */
const DIFFICULT_PATTERNS = [
  /th/i,
  /\br\b/i,
  /\bl\b/i,
  /\bv\b/i,
  /\bw\b/i,
  /sh/i,
  /ch/i,
];

/**
 * Smart Pronunciation Assessment Service
 */
export class SmartPronunciationService {
  private config: AzureSpeechConfig;
  private strategy: HybridStrategyConfig;
  private messageCount: number = 0;
  private assessmentCount: number = 0;
  private lastAssessmentTime: number = 0;
  private userLevel: UserLevel = 'beginner';

  constructor(config: AzureSpeechConfig, userLevel: UserLevel = 'beginner') {
    this.config = config;
    this.strategy = DEFAULT_STRATEGY;
    this.userLevel = userLevel;
  }

  /**
   * Set user proficiency level
   */
  public setUserLevel(level: UserLevel): void {
    this.userLevel = level;
  }

  /**
   * Determine if assessment should be performed based on hybrid strategy
   */
  public shouldAssess(text: string, confidence: number): boolean {
    // Increment message count first
    this.messageCount++;
    
    const now = Date.now();
    const timeSinceLastAssessment = now - this.lastAssessmentTime;

    // Rule 1: Force assessment when confidence < 70%
    if (confidence < this.strategy.confidenceThreshold) {
      console.log('[Assessment] Triggered: Low confidence', confidence);
      return true;
    }

    // Rule 2: Force assessment on critical errors
    if (text.length < 3 || text.includes('???')) {
      console.log('[Assessment] Triggered: Critical error');
      return true;
    }

    // Rule 3: Periodic checks every 5 messages
    if (this.messageCount > 0 && this.messageCount % this.strategy.periodicInterval === 0) {
      console.log('[Assessment] Triggered: Periodic check');
      return true;
    }

    // Rule 4: Time interval - if > 60s since last assessment, 50% probability
    if (
      this.lastAssessmentTime > 0 &&
      timeSinceLastAssessment > this.strategy.timeInterval
    ) {
      const shouldAssess = Math.random() < this.strategy.timeIntervalProbability;
      if (shouldAssess) {
        console.log('[Assessment] Triggered: Time interval');
      }
      return shouldAssess;
    }

    // Rule 5: Difficult words - 40% probability
    const hasDifficultWords = DIFFICULT_PATTERNS.some((pattern) => pattern.test(text));
    if (hasDifficultWords) {
      const shouldAssess = Math.random() < this.strategy.difficultWordProbability;
      if (shouldAssess) {
        console.log('[Assessment] Triggered: Difficult words');
      }
      return shouldAssess;
    }

    // Rule 6: Base random rate by user level
    const baseRate = this.strategy.baseRates[this.userLevel];
    const shouldAssess = Math.random() < baseRate;
    if (shouldAssess) {
      console.log('[Assessment] Triggered: Base random rate');
    }
    return shouldAssess;
  }

  /**
   * Process user speech and decide whether to assess
   */
  public async processUserSpeech(
    audioBlob: Blob,
    recognizedText: string,
    confidence: number
  ): Promise<PronunciationAssessmentResult | null> {
    // Decide whether to assess (shouldAssess already increments messageCount)
    if (!this.shouldAssess(recognizedText, confidence)) {
      console.log('[Assessment] Skipped');
      return null;
    }

    // Perform assessment
    try {
      const result = await this.assessPronunciation(audioBlob, recognizedText);
      this.assessmentCount++;
      this.lastAssessmentTime = Date.now();
      console.log('[Assessment] Completed', result);
      return result;
    } catch (error) {
      console.error('[Assessment] Failed:', error);
      return null;
    }
  }

  /**
   * Call Azure Speech Services API for pronunciation assessment
   */
  private async assessPronunciation(
    audioBlob: Blob,
    referenceText: string
  ): Promise<PronunciationAssessmentResult> {
    const { apiKey, region } = this.config;
    const endpoint = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

    // Convert blob to array buffer
    const audioData = await audioBlob.arrayBuffer();

    // Prepare pronunciation assessment parameters
    const pronunciationAssessmentParams = {
      ReferenceText: referenceText,
      GradingSystem: 'HundredMark',
      Granularity: 'Word',
      Dimension: 'Comprehensive',
      EnableMiscue: true,
    };

    // Make API request
    const response = await fetch(
      `${endpoint}?language=en-US&format=detailed`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'audio/wav',
          'Pronunciation-Assessment': JSON.stringify(pronunciationAssessmentParams),
        },
        body: audioData,
      }
    );

    if (!response.ok) {
      throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseAzureResponse(data);
  }

  /**
   * Parse Azure API response
   */
  private parseAzureResponse(data: any): PronunciationAssessmentResult {
    const assessment = data.NBest?.[0]?.PronunciationAssessment || {};
    const words: WordAssessment[] = (data.NBest?.[0]?.Words || []).map((word: any) => ({
      word: word.Word,
      accuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
      errorType: word.PronunciationAssessment?.ErrorType,
    }));

    const accuracyScore = assessment.AccuracyScore || 0;
    const pronunciationScore = assessment.PronunciationScore || 0;
    const fluencyScore = assessment.FluencyScore || 0;
    const completenessScore = assessment.CompletenessScore || 0;

    // Determine if correction is needed (threshold: 70)
    const shouldCorrect = pronunciationScore < 70;

    // Generate feedback
    const feedback = this.generateFeedback({
      accuracyScore,
      pronunciationScore,
      fluencyScore,
      completenessScore,
      words,
      shouldCorrect,
    });

    return {
      accuracyScore,
      pronunciationScore,
      fluencyScore,
      completenessScore,
      words,
      shouldCorrect,
      feedback,
    };
  }

  /**
   * Generate user-friendly feedback
   */
  public generateFeedback(result: PronunciationAssessmentResult): string {
    if (!result.shouldCorrect) {
      return ''; // No feedback needed
    }

    // Find words with low scores
    const problematicWords = result.words.filter((w) => w.accuracyScore < 70);

    if (problematicWords.length === 0) {
      return ''; // No specific issues
    }

    // Focus on the first problematic word
    const word = problematicWords[0];
    return `Try saying "${word.word}" more clearly.`;
  }

  /**
   * Get assessment statistics
   */
  public getStats(): AssessmentStats {
    const assessmentRate = this.messageCount > 0 ? this.assessmentCount / this.messageCount : 0;
    
    // Cost estimation: $1 per 1000 assessments (Azure pricing)
    const estimatedCost = (this.assessmentCount / 1000) * 1.0;

    return {
      totalMessages: this.messageCount,
      assessmentCount: this.assessmentCount,
      assessmentRate,
      estimatedCost,
    };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.messageCount = 0;
    this.assessmentCount = 0;
    this.lastAssessmentTime = 0;
  }
}
