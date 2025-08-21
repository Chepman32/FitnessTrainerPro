import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Content, LibrarySection } from '../types/library';

export type OfflineContent = {
  content: Content;
  downloadedAt: string;
  lastAccessedAt: string;
  size: number; // in bytes
};

export type OfflineStatus = {
  isOnline: boolean;
  hasConnection: boolean;
  connectionType: string | null;
};

const STORAGE_KEYS = {
  OFFLINE_CONTENT: '@offline_content',
  CACHED_SECTIONS: '@cached_sections',
  OFFLINE_SETTINGS: '@offline_settings',
};

const MAX_OFFLINE_STORAGE = 500 * 1024 * 1024; // 500MB limit
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export class OfflineService {
  private static instance: OfflineService;
  private offlineContent: Map<string, OfflineContent> = new Map();
  private cachedSections: Map<
    string,
    { section: LibrarySection; cachedAt: string }
  > = new Map();
  private isOnline: boolean = true;
  private connectionType: string | null = null;

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  // Initialize offline service
  async initialize(): Promise<void> {
    try {
      // Set up network monitoring
      this.setupNetworkMonitoring();

      // Load offline content from storage
      await this.loadOfflineContent();
      await this.loadCachedSections();

      // Clean up expired content
      await this.cleanupExpiredContent();
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
    }
  }

  // Set up network monitoring
  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      this.connectionType = state.type;

      console.log('Network status changed:', {
        isOnline: this.isOnline,
        type: this.connectionType,
      });
    });
  }

  // Load offline content from storage
  private async loadOfflineContent(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_CONTENT);
      if (stored) {
        const contentArray: OfflineContent[] = JSON.parse(stored);
        this.offlineContent = new Map(
          contentArray.map(item => [item.content.id, item]),
        );
      }
    } catch (error) {
      console.error('Failed to load offline content:', error);
    }
  }

  // Save offline content to storage
  private async saveOfflineContent(): Promise<void> {
    try {
      const contentArray = Array.from(this.offlineContent.values());
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_CONTENT,
        JSON.stringify(contentArray),
      );
    } catch (error) {
      console.error('Failed to save offline content:', error);
    }
  }

  // Load cached sections from storage
  private async loadCachedSections(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_SECTIONS);
      if (stored) {
        const sectionsArray: Array<{
          id: string;
          section: LibrarySection;
          cachedAt: string;
        }> = JSON.parse(stored);
        this.cachedSections = new Map(
          sectionsArray.map(item => [
            item.id,
            { section: item.section, cachedAt: item.cachedAt },
          ]),
        );
      }
    } catch (error) {
      console.error('Failed to load cached sections:', error);
    }
  }

  // Save cached sections to storage
  private async saveCachedSections(): Promise<void> {
    try {
      const sectionsArray = Array.from(this.cachedSections.entries()).map(
        ([id, data]) => ({
          id,
          ...data,
        }),
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.CACHED_SECTIONS,
        JSON.stringify(sectionsArray),
      );
    } catch (error) {
      console.error('Failed to save cached sections:', error);
    }
  }

  // Clean up expired content
  private async cleanupExpiredContent(): Promise<void> {
    const now = new Date().getTime();
    let hasChanges = false;

    // Clean up offline content
    for (const [id, offlineContent] of this.offlineContent.entries()) {
      const downloadedAt = new Date(offlineContent.downloadedAt).getTime();
      if (now - downloadedAt > CACHE_EXPIRY) {
        this.offlineContent.delete(id);
        hasChanges = true;
      }
    }

    // Clean up cached sections
    for (const [id, cachedData] of this.cachedSections.entries()) {
      const cachedAt = new Date(cachedData.cachedAt).getTime();
      if (now - cachedAt > CACHE_EXPIRY) {
        this.cachedSections.delete(id);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await this.saveOfflineContent();
      await this.saveCachedSections();
    }
  }

  // Get current offline status
  getOfflineStatus(): OfflineStatus {
    return {
      isOnline: this.isOnline,
      hasConnection: this.isOnline,
      connectionType: this.connectionType,
    };
  }

  // Check if content is available offline
  isContentAvailableOffline(contentId: string): boolean {
    return this.offlineContent.has(contentId);
  }

  // Download content for offline use
  async downloadContent(content: Content): Promise<boolean> {
    try {
      // Check if user has premium access for offline downloads
      // This would integrate with the premium service

      // Check storage space
      const currentSize = this.getTotalOfflineSize();
      const estimatedSize = this.estimateContentSize(content);

      if (currentSize + estimatedSize > MAX_OFFLINE_STORAGE) {
        throw new Error('Insufficient storage space');
      }

      // Simulate content download
      // In a real app, this would download media files, workout data, etc.
      await this.simulateDownload(content);

      const offlineContent: OfflineContent = {
        content,
        downloadedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        size: estimatedSize,
      };

      this.offlineContent.set(content.id, offlineContent);
      await this.saveOfflineContent();

      return true;
    } catch (error) {
      console.error('Failed to download content:', error);
      return false;
    }
  }

  // Remove content from offline storage
  async removeOfflineContent(contentId: string): Promise<boolean> {
    try {
      if (this.offlineContent.has(contentId)) {
        this.offlineContent.delete(contentId);
        await this.saveOfflineContent();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove offline content:', error);
      return false;
    }
  }

  // Get all offline content
  getOfflineContent(): OfflineContent[] {
    return Array.from(this.offlineContent.values());
  }

  // Get offline content by ID
  getOfflineContentById(contentId: string): OfflineContent | null {
    return this.offlineContent.get(contentId) || null;
  }

  // Cache library sections
  async cacheSections(sections: LibrarySection[]): Promise<void> {
    try {
      const now = new Date().toISOString();

      for (const section of sections) {
        this.cachedSections.set(section.id, {
          section,
          cachedAt: now,
        });
      }

      await this.saveCachedSections();
    } catch (error) {
      console.error('Failed to cache sections:', error);
    }
  }

  // Get cached sections
  getCachedSections(): LibrarySection[] {
    return Array.from(this.cachedSections.values()).map(data => data.section);
  }

  // Get cached section by ID
  getCachedSection(sectionId: string): LibrarySection | null {
    const cached = this.cachedSections.get(sectionId);
    return cached ? cached.section : null;
  }

  // Update last accessed time for offline content
  async updateLastAccessed(contentId: string): Promise<void> {
    const offlineContent = this.offlineContent.get(contentId);
    if (offlineContent) {
      offlineContent.lastAccessedAt = new Date().toISOString();
      await this.saveOfflineContent();
    }
  }

  // Get total size of offline content
  getTotalOfflineSize(): number {
    return Array.from(this.offlineContent.values()).reduce(
      (total, content) => total + content.size,
      0,
    );
  }

  // Get storage usage info
  getStorageInfo(): {
    used: number;
    available: number;
    total: number;
    usedPercentage: number;
  } {
    const used = this.getTotalOfflineSize();
    const total = MAX_OFFLINE_STORAGE;
    const available = total - used;
    const usedPercentage = (used / total) * 100;

    return {
      used,
      available,
      total,
      usedPercentage,
    };
  }

  // Estimate content size (simplified)
  private estimateContentSize(content: Content): number {
    // Base size for metadata
    let size = 1024; // 1KB for metadata

    // Estimate based on content type
    switch (content.type) {
      case 'workout':
        size += 5 * 1024 * 1024; // 5MB for workout videos/images
        break;
      case 'program':
        size += 50 * 1024 * 1024; // 50MB for full program
        break;
      case 'challenge':
        size += 10 * 1024 * 1024; // 10MB for challenge content
        break;
      case 'article':
        size += 2 * 1024 * 1024; // 2MB for article with images
        break;
    }

    return size;
  }

  // Simulate content download
  private async simulateDownload(content: Content): Promise<void> {
    // Simulate download time based on content size
    const size = this.estimateContentSize(content);
    const downloadTime = Math.min(size / (1024 * 1024), 3000); // Max 3 seconds

    await new Promise(resolve => setTimeout(resolve, downloadTime));
  }

  // Clear all offline content
  async clearAllOfflineContent(): Promise<void> {
    try {
      this.offlineContent.clear();
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_CONTENT);
    } catch (error) {
      console.error('Failed to clear offline content:', error);
    }
  }

  // Clear all cached sections
  async clearAllCachedSections(): Promise<void> {
    try {
      this.cachedSections.clear();
      await AsyncStorage.removeItem(STORAGE_KEYS.CACHED_SECTIONS);
    } catch (error) {
      console.error('Failed to clear cached sections:', error);
    }
  }

  // Get offline content for a specific type
  getOfflineContentByType(type: Content['type']): OfflineContent[] {
    return Array.from(this.offlineContent.values()).filter(
      item => item.content.type === type,
    );
  }

  // Check if we should show offline banner
  shouldShowOfflineBanner(): boolean {
    return (
      !this.isOnline &&
      (this.offlineContent.size > 0 || this.cachedSections.size > 0)
    );
  }

  // Get offline capabilities message
  getOfflineMessage(): string {
    if (this.isOnline) {
      return '';
    }

    const offlineCount = this.offlineContent.size;
    const cachedCount = this.cachedSections.size;

    if (offlineCount === 0 && cachedCount === 0) {
      return "You're offline. Connect to internet to access content.";
    }

    return `You're offline. Showing ${offlineCount} downloaded items and cached content.`;
  }
}

// Export singleton instance
export const offlineService = OfflineService.getInstance();
