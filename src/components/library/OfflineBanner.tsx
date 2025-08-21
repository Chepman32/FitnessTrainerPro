import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { offlineService, OfflineStatus } from '../../services/offlineService';

export const OfflineBanner: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOnline: true,
    hasConnection: true,
    connectionType: null,
  });
  const [showBanner, setShowBanner] = useState(false);
  const [bannerHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    // Initialize offline service and get status
    const initializeOffline = async () => {
      await offlineService.initialize();
      updateOfflineStatus();
    };

    initializeOffline();

    // Set up periodic status checks
    const interval = setInterval(updateOfflineStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateOfflineStatus = () => {
    const status = offlineService.getOfflineStatus();
    setOfflineStatus(status);

    const shouldShow = offlineService.shouldShowOfflineBanner();

    if (shouldShow !== showBanner) {
      setShowBanner(shouldShow);

      // Animate banner appearance/disappearance
      Animated.timing(bannerHeight, {
        toValue: shouldShow ? 60 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBannerPress = () => {
    // Could navigate to offline content screen
    console.log('Navigate to offline content');
  };

  const handleDismiss = () => {
    setShowBanner(false);
    Animated.timing(bannerHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  if (!showBanner) {
    return null;
  }

  const message = offlineService.getOfflineMessage();
  const offlineContent = offlineService.getOfflineContent();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: bannerHeight,
          backgroundColor: isDark ? '#2A2A2A' : '#FFF3CD',
          borderBottomColor: isDark ? '#404040' : '#FFEAA7',
        },
      ]}
    >
      <Pressable
        style={styles.content}
        onPress={handleBannerPress}
        accessibilityRole="button"
        accessibilityLabel="View offline content"
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="cloud-offline"
            size={20}
            color={isDark ? '#FFA500' : '#856404'}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[styles.message, { color: isDark ? '#FFF' : '#856404' }]}
          >
            {message}
          </Text>
          {offlineContent.length > 0 && (
            <Text
              style={[
                styles.subMessage,
                { color: isDark ? '#AAA' : '#6C757D' },
              ]}
            >
              Tap to view downloaded content
            </Text>
          )}
        </View>

        <Pressable
          style={styles.dismissButton}
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss offline banner"
        >
          <Ionicons
            name="close"
            size={16}
            color={isDark ? '#AAA' : '#6C757D'}
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

// Offline content indicator for individual items
export const OfflineIndicator: React.FC<{
  contentId: string;
  size?: 'small' | 'medium';
}> = ({ contentId, size = 'small' }) => {
  const isDark = useColorScheme() === 'dark';
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkOfflineStatus = () => {
      setIsOffline(offlineService.isContentAvailableOffline(contentId));
    };

    checkOfflineStatus();

    // Check periodically in case content is downloaded/removed
    const interval = setInterval(checkOfflineStatus, 10000);
    return () => clearInterval(interval);
  }, [contentId]);

  if (!isOffline) {
    return null;
  }

  const iconSize = size === 'small' ? 14 : 18;
  const containerSize = size === 'small' ? 24 : 32;

  return (
    <View
      style={[
        styles.offlineIndicator,
        {
          width: containerSize,
          height: containerSize,
          backgroundColor: isDark
            ? 'rgba(74, 222, 128, 0.2)'
            : 'rgba(34, 197, 94, 0.2)',
        },
      ]}
    >
      <Ionicons
        name="download"
        size={iconSize}
        color={isDark ? '#4ADE80' : '#22C55E'}
      />
    </View>
  );
};

// Download button for content
export const DownloadButton: React.FC<{
  contentId: string;
  content: any;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: string) => void;
}> = ({
  contentId,
  content,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}) => {
  const isDark = useColorScheme() === 'dark';
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setIsDownloaded(offlineService.isContentAvailableOffline(contentId));
  }, [contentId]);

  const handleDownload = async () => {
    if (isDownloaded) {
      // Remove from offline storage
      const success = await offlineService.removeOfflineContent(contentId);
      if (success) {
        setIsDownloaded(false);
      }
      return;
    }

    try {
      setIsDownloading(true);
      onDownloadStart?.();

      const success = await offlineService.downloadContent(content);

      if (success) {
        setIsDownloaded(true);
        onDownloadComplete?.();
      } else {
        onDownloadError?.('Download failed');
      }
    } catch (error) {
      onDownloadError?.(
        error instanceof Error ? error.message : 'Download failed',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const getButtonIcon = () => {
    if (isDownloading) return 'hourglass';
    if (isDownloaded) return 'checkmark-circle';
    return 'download-outline';
  };

  const getButtonColor = () => {
    if (isDownloaded) return '#4ADE80';
    return isDark ? '#5B9BFF' : '#3B82F6';
  };

  return (
    <Pressable
      style={[styles.downloadButton, { opacity: isDownloading ? 0.6 : 1 }]}
      onPress={handleDownload}
      disabled={isDownloading}
      accessibilityRole="button"
      accessibilityLabel={
        isDownloaded
          ? 'Remove from offline'
          : isDownloading
          ? 'Downloading...'
          : 'Download for offline'
      }
    >
      <Ionicons name={getButtonIcon()} size={20} color={getButtonColor()} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subMessage: {
    fontSize: 12,
    fontWeight: '400',
  },
  dismissButton: {
    padding: 8,
    marginLeft: 8,
  },
  offlineIndicator: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  downloadButton: {
    padding: 8,
  },
});
