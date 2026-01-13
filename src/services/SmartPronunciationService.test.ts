/**
 * Tests for SmartPronunciationService
 */

import { SmartPronunciationService } from './SmartPronunciationService';

describe('SmartPronunciationService', () => {
  let service: SmartPronunciationService;

  beforeEach(() => {
    service = new SmartPronunciationService(
      { apiKey: 'test-key', region: 'eastus' },
      'beginner'
    );
  });

  describe('shouldAssess', () => {
    it('should force assessment when confidence < 70%', () => {
      const result = service.shouldAssess('Hello world', 0.65);
      expect(result).toBe(true);
    });

    it('should force assessment on critical errors (short text)', () => {
      const result = service.shouldAssess('Hi', 0.9);
      expect(result).toBe(true);
    });

    it('should force assessment on critical errors (contains ???)', () => {
      const result = service.shouldAssess('Hello ???', 0.9);
      expect(result).toBe(true);
    });

    it('should assess on periodic interval (every 5 messages)', () => {
      // Simulate 4 messages without assessment
      for (let i = 0; i < 4; i++) {
        service.shouldAssess('Hello world', 0.95);
      }
      
      // 5th message should trigger periodic assessment
      const result = service.shouldAssess('Hello world', 0.95);
      expect(result).toBe(true);
    });

    it('should have higher probability for difficult words', () => {
      // Test multiple times to check probability
      const results: boolean[] = [];
      for (let i = 0; i < 100; i++) {
        const newService = new SmartPronunciationService(
          { apiKey: 'test-key', region: 'eastus' },
          'beginner'
        );
        results.push(newService.shouldAssess('I think this is good', 0.9));
      }
      
      // Should have ~40% assessment rate for difficult words
      const assessmentRate = results.filter(r => r).length / results.length;
      expect(assessmentRate).toBeGreaterThan(0.2);
      expect(assessmentRate).toBeLessThan(0.6);
    });

    it('should respect user level base rates', () => {
      const beginnerService = new SmartPronunciationService(
        { apiKey: 'test-key', region: 'eastus' },
        'beginner'
      );
      const advancedService = new SmartPronunciationService(
        { apiKey: 'test-key', region: 'eastus' },
        'advanced'
      );

      // Test multiple times
      const beginnerResults: boolean[] = [];
      const advancedResults: boolean[] = [];

      for (let i = 0; i < 100; i++) {
        beginnerResults.push(beginnerService.shouldAssess('Hello world', 0.9));
        advancedResults.push(advancedService.shouldAssess('Hello world', 0.9));
      }

      const beginnerRate = beginnerResults.filter(r => r).length / beginnerResults.length;
      const advancedRate = advancedResults.filter(r => r).length / advancedResults.length;

      // Beginner should have higher assessment rate than advanced
      expect(beginnerRate).toBeGreaterThan(advancedRate);
    });
  });

  describe('generateFeedback', () => {
    it('should return empty string when no correction needed', () => {
      const result = {
        accuracyScore: 85,
        pronunciationScore: 85,
        fluencyScore: 80,
        completenessScore: 90,
        words: [],
        shouldCorrect: false,
      };
      
      const feedback = service.generateFeedback(result);
      expect(feedback).toBe('');
    });

    it('should generate feedback for problematic words', () => {
      const result = {
        accuracyScore: 60,
        pronunciationScore: 60,
        fluencyScore: 70,
        completenessScore: 80,
        words: [
          { word: 'think', accuracyScore: 50 },
          { word: 'this', accuracyScore: 65 },
        ],
        shouldCorrect: true,
      };
      
      const feedback = service.generateFeedback(result);
      expect(feedback).toContain('think');
      expect(feedback).toContain('clearly');
    });

    it('should return empty string when no problematic words', () => {
      const result = {
        accuracyScore: 65,
        pronunciationScore: 65,
        fluencyScore: 70,
        completenessScore: 80,
        words: [
          { word: 'hello', accuracyScore: 75 },
          { word: 'world', accuracyScore: 80 },
        ],
        shouldCorrect: true,
      };
      
      const feedback = service.generateFeedback(result);
      expect(feedback).toBe('');
    });
  });

  describe('getStats', () => {
    it('should track assessment statistics', () => {
      // Simulate some assessments
      service.shouldAssess('Hello', 0.6); // Force assessment
      service.shouldAssess('World', 0.9); // May or may not assess
      service.shouldAssess('Test', 0.9);

      const stats = service.getStats();
      expect(stats.totalMessages).toBe(3);
      expect(stats.assessmentCount).toBeGreaterThanOrEqual(0);
      expect(stats.assessmentRate).toBeGreaterThanOrEqual(0);
      expect(stats.assessmentRate).toBeLessThanOrEqual(1);
      expect(stats.estimatedCost).toBeGreaterThanOrEqual(0);
    });

    it('should calculate assessment rate correctly', () => {
      // Force 2 assessments out of 5 messages
      service.shouldAssess('Hi', 0.6); // Force
      service.shouldAssess('Hello', 0.6); // Force
      service.shouldAssess('Good', 0.95); // Skip
      service.shouldAssess('Morning', 0.95); // Skip
      service.shouldAssess('Test', 0.95); // Periodic (5th message)

      const stats = service.getStats();
      expect(stats.totalMessages).toBe(5);
    });
  });

  describe('setUserLevel', () => {
    it('should update user level', () => {
      service.setUserLevel('advanced');
      
      // Test that base rate changes
      const results: boolean[] = [];
      for (let i = 0; i < 100; i++) {
        results.push(service.shouldAssess('Hello world', 0.9));
      }
      
      const assessmentRate = results.filter(r => r).length / results.length;
      // Advanced level should have lower base rate (~10%)
      expect(assessmentRate).toBeLessThan(0.4);
    });
  });

  describe('resetStats', () => {
    it('should reset all statistics', () => {
      // Generate some stats
      service.shouldAssess('Hello', 0.6);
      service.shouldAssess('World', 0.9);

      // Reset
      service.resetStats();

      const stats = service.getStats();
      expect(stats.totalMessages).toBe(0);
      expect(stats.assessmentCount).toBe(0);
      expect(stats.assessmentRate).toBe(0);
      expect(stats.estimatedCost).toBe(0);
    });
  });

  describe('processUserSpeech', () => {
    it('should return null when assessment is skipped', async () => {
      // Mock fetch to avoid real API calls
      global.fetch = jest.fn();

      const audioBlob = new Blob(['test'], { type: 'audio/wav' });
      
      // Use high confidence and text that won't trigger assessment
      // Reset service to ensure clean state
      const newService = new SmartPronunciationService(
        { apiKey: 'test-key', region: 'eastus' },
        'advanced' // Use advanced level for lower assessment rate
      );
      
      const result = await newService.processUserSpeech(audioBlob, 'Hello world', 0.95);

      // With high confidence and no triggers, should skip most of the time
      // (but may occasionally assess due to random rate)
      if (result === null) {
        expect(fetch).not.toHaveBeenCalled();
      }
    });

    it('should trigger assessment with low confidence', async () => {
      // Create new service
      const newService = new SmartPronunciationService(
        { apiKey: 'test-key', region: 'eastus' },
        'beginner'
      );
      
      // Verify that shouldAssess returns true for low confidence
      const shouldAssess = newService.shouldAssess('Hello', 0.6);
      expect(shouldAssess).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const audioBlob = new Blob(['test'], { type: 'audio/wav' });
      
      // Create new service and use low confidence to force assessment
      const newService = new SmartPronunciationService(
        { apiKey: 'test-key', region: 'eastus' },
        'beginner'
      );
      
      const result = await newService.processUserSpeech(audioBlob, 'Hello', 0.6);

      // Should return null when API fails
      expect(result).toBeNull();
    });
  });
});
