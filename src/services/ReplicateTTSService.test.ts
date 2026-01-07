/**
 * Tests for ReplicateTTSService
 */

import { ReplicateTTSService } from './ReplicateTTSService';

describe('ReplicateTTSService', () => {
  let service: ReplicateTTSService;

  beforeEach(() => {
    service = new ReplicateTTSService({
      apiKey: 'test-api-key',
      model: 'turbo',
    });
  });

  describe('isConfigured', () => {
    it('should return true when API key is provided', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when API key is empty', () => {
      const emptyService = new ReplicateTTSService({
        apiKey: '',
        model: 'turbo',
      });
      expect(emptyService.isConfigured()).toBe(false);
    });
  });

  describe('stop', () => {
    it('should stop current audio playback', () => {
      // Create a mock audio element
      const mockAudio = {
        pause: jest.fn(),
        currentTime: 5,
        paused: false,
      };

      // @ts-ignore - accessing private property for testing
      service.currentAudio = mockAudio as any;

      service.stop();

      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.currentTime).toBe(0);
      // @ts-ignore
      expect(service.currentAudio).toBeNull();
    });

    it('should handle stop when no audio is playing', () => {
      expect(() => service.stop()).not.toThrow();
    });
  });

  describe('isSpeaking', () => {
    it('should return false when no audio is playing', () => {
      expect(service.isSpeaking()).toBe(false);
    });

    it('should return true when audio is playing', () => {
      const mockAudio = {
        paused: false,
      };

      // @ts-ignore
      service.currentAudio = mockAudio as any;

      expect(service.isSpeaking()).toBe(true);
    });

    it('should return false when audio is paused', () => {
      const mockAudio = {
        paused: true,
      };

      // @ts-ignore
      service.currentAudio = mockAudio as any;

      expect(service.isSpeaking()).toBe(false);
    });
  });

  describe('speak', () => {
    it('should throw error when not configured', async () => {
      const unconfiguredService = new ReplicateTTSService({
        apiKey: '',
        model: 'turbo',
      });

      await expect(unconfiguredService.speak('Hello')).rejects.toThrow(
        'Replicate API key is not configured.'
      );
    });

    // Note: Full integration tests for speak() would require mocking fetch
    // and the Audio API, which is complex. These would be better as integration tests.
  });
});
