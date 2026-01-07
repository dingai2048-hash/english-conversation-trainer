/**
 * Tests for Settings Service
 */

import { SettingsService } from './SettingsService';
import { AISettings } from '../components/SettingsModal';

describe('SettingsService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getSettings', () => {
    it('should return default settings when no settings are stored', () => {
      const settings = SettingsService.getSettings();
      
      expect(settings.provider).toBe('mock');
      expect(settings.apiKey).toBe('');
      expect(settings.endpoint).toBe('');
      expect(settings.model).toBe('mock');
      expect(settings.ttsProvider).toBe('browser');
      expect(settings.replicateApiKey).toBe('');
      expect(settings.replicateTTSModel).toBe('turbo');
      expect(settings.systemPrompt).toBeTruthy(); // Has default prompt
    });

    it('should return stored settings when available', () => {
      const testSettings: AISettings = {
        provider: 'openai',
        apiKey: 'test-key',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
      };

      localStorage.setItem('english-trainer-ai-settings', JSON.stringify(testSettings));

      const settings = SettingsService.getSettings();
      expect(settings).toEqual(testSettings);
    });

    it('should return default settings when stored data is invalid', () => {
      localStorage.setItem('english-trainer-ai-settings', 'invalid-json');

      const settings = SettingsService.getSettings();
      expect(settings.provider).toBe('mock');
      expect(settings.apiKey).toBe('');
      expect(settings.endpoint).toBe('');
      expect(settings.model).toBe('mock');
      expect(settings.ttsProvider).toBe('browser');
      expect(settings.replicateApiKey).toBe('');
      expect(settings.replicateTTSModel).toBe('turbo');
      expect(settings.systemPrompt).toBeTruthy();
    });
  });

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      const testSettings: AISettings = {
        provider: 'openai',
        apiKey: 'test-key',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
      };

      SettingsService.saveSettings(testSettings);

      const stored = localStorage.getItem('english-trainer-ai-settings');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(testSettings);
    });
  });

  describe('clearSettings', () => {
    it('should remove settings from localStorage', () => {
      const testSettings: AISettings = {
        provider: 'openai',
        apiKey: 'test-key',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
      };

      SettingsService.saveSettings(testSettings);
      expect(localStorage.getItem('english-trainer-ai-settings')).toBeTruthy();

      SettingsService.clearSettings();
      expect(localStorage.getItem('english-trainer-ai-settings')).toBeNull();
    });
  });

  describe('isConfigured', () => {
    it('should return false when using mock provider', () => {
      const settings: AISettings = {
        provider: 'mock',
        apiKey: '',
        endpoint: '',
        model: 'mock',
      };

      SettingsService.saveSettings(settings);
      expect(SettingsService.isConfigured()).toBe(false);
    });

    it('should return false when apiKey is empty', () => {
      const settings: AISettings = {
        provider: 'openai',
        apiKey: '',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
      };

      SettingsService.saveSettings(settings);
      expect(SettingsService.isConfigured()).toBe(false);
    });

    it('should return true when properly configured', () => {
      const settings: AISettings = {
        provider: 'openai',
        apiKey: 'test-key',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
      };

      SettingsService.saveSettings(settings);
      expect(SettingsService.isConfigured()).toBe(true);
    });
  });
});
