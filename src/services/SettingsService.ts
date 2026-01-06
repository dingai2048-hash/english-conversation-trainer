/**
 * Settings Service
 * Manages AI API settings in local storage
 */

import { AISettings } from '../components/SettingsModal';

const SETTINGS_KEY = 'english-trainer-ai-settings';

export class SettingsService {
  /**
   * Get current settings from local storage
   */
  public static getSettings(): AISettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }

    // Return default settings
    return {
      provider: 'mock',
      apiKey: '',
      endpoint: '',
      model: 'mock',
    };
  }

  /**
   * Save settings to local storage
   */
  public static saveSettings(settings: AISettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('无法保存设置，请检查浏览器存储权限');
    }
  }

  /**
   * Clear all settings
   */
  public static clearSettings(): void {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Failed to clear settings:', error);
    }
  }

  /**
   * Check if API is configured (not using mock)
   */
  public static isConfigured(): boolean {
    const settings = this.getSettings();
    return settings.provider !== 'mock' && settings.apiKey !== '';
  }
}
