/**
 * API Key Manager Service
 * Manages saved API keys for different providers
 */

export interface SavedAPIKey {
  id: string;
  provider: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

const STORAGE_KEY = 'english-trainer-saved-api-keys';

export class APIKeyManager {
  /**
   * Get all saved API keys
   */
  public static getSavedKeys(): SavedAPIKey[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load saved API keys:', error);
    }
    return [];
  }

  /**
   * Save a new API key
   */
  public static saveKey(provider: string, name: string, key: string): SavedAPIKey {
    const keys = this.getSavedKeys();
    
    const newKey: SavedAPIKey = {
      id: this.generateId(),
      provider,
      name,
      key,
      createdAt: new Date().toISOString(),
    };

    keys.push(newKey);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw new Error('无法保存 API Key');
    }

    return newKey;
  }

  /**
   * Delete an API key
   */
  public static deleteKey(id: string): void {
    const keys = this.getSavedKeys();
    const filtered = keys.filter(k => k.id !== id);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete API key:', error);
      throw new Error('无法删除 API Key');
    }
  }

  /**
   * Update last used timestamp
   */
  public static updateLastUsed(id: string): void {
    const keys = this.getSavedKeys();
    const key = keys.find(k => k.id === id);
    
    if (key) {
      key.lastUsed = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
      } catch (error) {
        console.error('Failed to update last used:', error);
      }
    }
  }

  /**
   * Get keys for a specific provider
   */
  public static getKeysForProvider(provider: string): SavedAPIKey[] {
    return this.getSavedKeys().filter(k => k.provider === provider);
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mask API key for display
   */
  public static maskKey(key: string): string {
    if (key.length <= 10) {
      return '***';
    }
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  }
}
