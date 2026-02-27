import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Image,
  ImageSourcePropType,
  ImageURISource,
} from 'react-native';
import { Content, LibrarySection } from '../types/library';
import { Program as TrainingProgram } from '../types/program';

const IMAGE_CACHE_INDEX_KEY = '@remote_image_cache_index_v1';
const MAX_TRACKED_URLS = 2000;
const PREFETCH_BATCH_SIZE = 6;

const isRemoteHttpUrl = (url?: string | null): url is string =>
  typeof url === 'string' && /^https?:\/\//i.test(url);

class RemoteImageCacheService {
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private cachedUrlIndex = new Set<string>();
  private sessionPrefetched = new Set<string>();
  private inFlight = new Set<string>();
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.loadIndex();
    await this.initPromise;
  }

  getCachedImageSource(uri?: string | null): ImageSourcePropType | undefined {
    if (typeof uri !== 'string' || uri.length === 0) return undefined;

    const source: ImageURISource = {
      uri,
    };

    if (isRemoteHttpUrl(uri)) {
      source.cache = 'force-cache';
    }

    return source;
  }

  async prefetchSections(sections: LibrarySection[]): Promise<void> {
    const urls = sections.flatMap(section => this.getContentImageUrls(section.items));
    await this.prefetchUrls(urls);
  }

  async prefetchContentItems(items: Content[]): Promise<void> {
    await this.prefetchUrls(this.getContentImageUrls(items));
  }

  async prefetchPrograms(programs: TrainingProgram[]): Promise<void> {
    await this.prefetchUrls(programs.map(program => program.thumbnailUrl));
  }

  async prefetchUrl(url?: string | null): Promise<void> {
    if (!isRemoteHttpUrl(url)) return;
    await this.prefetchUrls([url]);
  }

  async prefetchUrls(urls: Array<string | null | undefined>): Promise<void> {
    await this.init();

    const uniqueRemoteUrls = Array.from(
      new Set(urls.filter(isRemoteHttpUrl)),
    );

    if (uniqueRemoteUrls.length === 0) return;

    for (let i = 0; i < uniqueRemoteUrls.length; i += PREFETCH_BATCH_SIZE) {
      const batch = uniqueRemoteUrls.slice(i, i + PREFETCH_BATCH_SIZE);
      await Promise.all(batch.map(url => this.prefetchSingleUrl(url)));
    }
  }

  private getContentImageUrls(items: Content[]): string[] {
    const urls: string[] = [];

    for (const item of items) {
      if (item.coverUrl) {
        urls.push(item.coverUrl);
      }

      if (item.type === 'article' && item.thumbnailUrl) {
        urls.push(item.thumbnailUrl);
      }
    }

    return urls;
  }

  private async loadIndex(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(IMAGE_CACHE_INDEX_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(value => {
            if (typeof value === 'string' && isRemoteHttpUrl(value)) {
              this.cachedUrlIndex.add(value);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load remote image cache index:', error);
    } finally {
      this.initialized = true;
      this.initPromise = null;
    }
  }

  private schedulePersist(): void {
    if (this.persistTimer) return;

    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      void this.persistIndex();
    }, 500);
  }

  private async persistIndex(): Promise<void> {
    try {
      const allUrls = Array.from(this.cachedUrlIndex);
      const urlsToStore = allUrls.slice(
        Math.max(0, allUrls.length - MAX_TRACKED_URLS),
      );

      await AsyncStorage.setItem(
        IMAGE_CACHE_INDEX_KEY,
        JSON.stringify(urlsToStore),
      );
    } catch (error) {
      console.error('Failed to persist remote image cache index:', error);
    }
  }

  private async prefetchSingleUrl(url: string): Promise<void> {
    if (this.inFlight.has(url)) return;
    if (this.sessionPrefetched.has(url)) return;

    const isCached = await this.isInNativeCache(url);
    if (isCached) {
      this.sessionPrefetched.add(url);
      this.trackCachedUrl(url);
      return;
    }

    const prefetch = (Image as any).prefetch;
    if (typeof prefetch !== 'function') return;

    this.inFlight.add(url);
    try {
      const success = await prefetch(url);
      if (success) {
        this.sessionPrefetched.add(url);
        this.trackCachedUrl(url);
      }
    } catch (error) {
      if (__DEV__) {
        console.log('Image prefetch skipped for URL:', url);
      }
    } finally {
      this.inFlight.delete(url);
    }
  }

  private async isInNativeCache(url: string): Promise<boolean> {
    try {
      const queryCache = (Image as any).queryCache;
      if (typeof queryCache === 'function') {
        const result = await queryCache([url]);
        const status = result?.[url];
        if (status === 'memory' || status === 'disk') {
          return true;
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.log('Image cache query skipped for URL:', url);
      }
    }

    return false;
  }

  private trackCachedUrl(url: string): void {
    this.cachedUrlIndex.add(url);
    this.schedulePersist();
  }
}

export const remoteImageCacheService = new RemoteImageCacheService();

export const getCachedImageSource = (
  uri?: string | null,
): ImageSourcePropType | undefined => {
  return remoteImageCacheService.getCachedImageSource(uri);
};
