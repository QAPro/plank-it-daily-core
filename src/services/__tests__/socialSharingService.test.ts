
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocialSharingService } from '../socialSharingService';

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

// Mock navigator.share
const mockNavigatorShare = vi.fn();
Object.defineProperty(navigator, 'share', {
  value: mockNavigatorShare,
  writable: true,
});

// Mock clipboard
const mockClipboard = {
  writeText: vi.fn(),
};
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

describe('SocialSharingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateShareText', () => {
    it('should generate basic share text', () => {
      const data = {
        exercise: 'Standard Plank',
        duration: 45,
      };

      const result = SocialSharingService.generateShareText(data);
      
      expect(result).toContain('🔥 Just completed a 45s Standard Plank!');
      expect(result).toContain('#PlankCoach #Fitness #CoreStrength');
    });

    it('should include personal best indicator', () => {
      const data = {
        exercise: 'Standard Plank',
        duration: 60,
        personalBest: true,
      };

      const result = SocialSharingService.generateShareText(data);
      
      expect(result).toContain('🏆 New personal best!');
    });

    it('should include achievement information', () => {
      const data = {
        exercise: 'Standard Plank',
        duration: 30,
        achievement: 'First Steps',
      };

      const result = SocialSharingService.generateShareText(data);
      
      expect(result).toContain('🎖️ Unlocked: First Steps');
    });

    it('should include streak information', () => {
      const data = {
        exercise: 'Standard Plank',
        duration: 30,
        streakDays: 7,
      };

      const result = SocialSharingService.generateShareText(data);
      
      expect(result).toContain('📅 7-day streak!');
    });

    it('should format time with minutes and seconds', () => {
      const data = {
        exercise: 'Standard Plank',
        duration: 125, // 2m 5s
      };

      const result = SocialSharingService.generateShareText(data);
      
      expect(result).toContain('2m 5s Standard Plank!');
    });
  });

  describe('shareToTwitter', () => {
    it('should open Twitter share URL', async () => {
      const data = {
        exercise: 'Standard Plank',
        duration: 30,
      };

      await SocialSharingService.shareToTwitter(data);
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://twitter.com/intent/tweet'),
        '_blank',
        'width=550,height=420'
      );
    });
  });

  describe('shareNative', () => {
    it('should use native sharing when available', async () => {
      mockNavigatorShare.mockResolvedValue(undefined);
      
      const data = {
        exercise: 'Standard Plank',
        duration: 30,
      };

      const result = await SocialSharingService.shareNative(data);
      
      expect(result).toBe(true);
      expect(mockNavigatorShare).toHaveBeenCalledWith({
        title: 'Plank Workout Complete!',
        text: expect.stringContaining('Standard Plank'),
        url: window.location.origin,
      });
    });

    it('should return false when native sharing is not available', async () => {
      // Temporarily remove navigator.share
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
      });

      const data = {
        exercise: 'Standard Plank',
        duration: 30,
      };

      const result = await SocialSharingService.shareNative(data);
      
      expect(result).toBe(false);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy share text to clipboard', async () => {
      const data = {
        exercise: 'Standard Plank',
        duration: 30,
      };

      await SocialSharingService.copyToClipboard(data);
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Standard Plank')
      );
    });
  });
});
