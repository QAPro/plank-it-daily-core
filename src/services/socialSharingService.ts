
export interface ShareData {
  exercise: string;
  duration: number;
  achievement?: string;
  personalBest?: boolean;
  streakDays?: number;
}

export class SocialSharingService {
  static generateShareText(data: ShareData): string {
    const { exercise, duration, achievement, personalBest, streakDays } = data;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    let message = `🔥 Just completed a ${timeStr} ${exercise}!`;
    
    if (personalBest) {
      message += " 🏆 New personal best!";
    }
    
    if (achievement) {
      message += ` 🎖️ Unlocked: ${achievement}`;
    }
    
    if (streakDays && streakDays > 1) {
      message += ` 📅 ${streakDays}-day streak!`;
    }
    
    message += " #PlankChallenge #Fitness #CoreStrength";
    
    return message;
  }

  static async shareToTwitter(data: ShareData): Promise<void> {
    const text = this.generateShareText(data);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }

  static async shareToFacebook(data: ShareData): Promise<void> {
    const text = this.generateShareText(data);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  }

  static async shareNative(data: ShareData): Promise<boolean> {
    if (!navigator.share) return false;
    
    try {
      await navigator.share({
        title: 'Plank Workout Complete!',
        text: this.generateShareText(data),
        url: window.location.origin,
      });
      return true;
    } catch (error) {
      console.log('Native sharing cancelled or failed:', error);
      return false;
    }
  }

  static async copyToClipboard(data: ShareData): Promise<void> {
    const text = this.generateShareText(data);
    await navigator.clipboard.writeText(text);
  }
}
