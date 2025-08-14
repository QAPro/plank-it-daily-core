import { supabase } from '@/integrations/supabase/client';
import type { ShareTemplate, EnhancedShareData, ShareAnalytics } from '@/types/socialSharing';

export class EnhancedSocialSharingService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 1080;
      this.canvas.height = 1080;
      this.ctx = this.canvas.getContext('2d');
    }
  }

  async getShareTemplates(type?: string): Promise<ShareTemplate[]> {
    let query = supabase
      .from('share_templates')
      .select('*')
      .eq('is_public', true);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching share templates:', error);
      return [];
    }

    // Cast the data to ShareTemplate[] with proper type assertion
    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      type: template.type as ShareTemplate['type'],
      template_data: (template.template_data as unknown) as ShareTemplate['template_data'],
      is_public: template.is_public,
      created_by: template.created_by,
      created_at: template.created_at,
      updated_at: template.updated_at
    }));
  }

  async generateShareImage(shareData: EnhancedShareData, templateId: string): Promise<string> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not available');
    }

    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    return this.createShareCanvas(shareData, template);
  }

  private async getTemplate(templateId: string): Promise<ShareTemplate | null> {
    const { data, error } = await supabase
      .from('share_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      return null;
    }

    // Cast the data to ShareTemplate with proper type assertion
    return {
      id: data.id,
      name: data.name,
      type: data.type as ShareTemplate['type'],
      template_data: (data.template_data as unknown) as ShareTemplate['template_data'],
      is_public: data.is_public,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  private async createShareCanvas(shareData: EnhancedShareData, template: ShareTemplate): Promise<string> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not available');
    }

    const ctx = this.ctx;
    const { template_data } = template;

    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set background
    await this.setBackground(ctx, template_data.background_color);

    // Render elements
    for (const element of template_data.elements) {
      await this.renderElement(ctx, element, shareData, template_data);
    }

    return this.canvas.toDataURL('image/png', 0.9);
  }

  private async setBackground(ctx: CanvasRenderingContext2D, background: string): Promise<void> {
    if (background.startsWith('linear-gradient')) {
      // Parse gradient
      const gradientMatch = background.match(/linear-gradient\(([^)]+)\)/);
      if (gradientMatch) {
        const gradient = ctx.createLinearGradient(0, 0, this.canvas!.width, this.canvas!.height);
        // Simple gradient parsing - in production, you'd want more robust parsing
        if (background.includes('#667eea') && background.includes('#764ba2')) {
          gradient.addColorStop(0, '#667eea');
          gradient.addColorStop(1, '#764ba2');
        } else if (background.includes('#ff9a56') && background.includes('#ff6b6b')) {
          gradient.addColorStop(0, '#ff9a56');
          gradient.addColorStop(1, '#ff6b6b');
        }
        ctx.fillStyle = gradient;
      }
    } else {
      ctx.fillStyle = background;
    }
    
    ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height);
  }

  private async renderElement(
    ctx: CanvasRenderingContext2D, 
    element: any, 
    shareData: EnhancedShareData,
    templateData: any
  ): Promise<void> {
    const x = (element.position.x / 100) * this.canvas!.width;
    const y = (element.position.y / 100) * this.canvas!.height;

    ctx.save();

    // Set text properties
    if (element.type === 'text' || element.type === 'stat') {
      const fontSize = element.style.fontSize || 20;
      const fontWeight = element.style.fontWeight || 'normal';
      const color = element.style.color || templateData.text_color || '#ffffff';
      const textAlign = element.style.textAlign || 'center';
      const opacity = element.style.opacity || 1;

      ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.textAlign = textAlign as CanvasTextAlign;
      ctx.textBaseline = 'middle';

      // Replace template variables
      let content = this.replaceTemplateVariables(element.content, shareData);
      
      if (element.type === 'stat' && content.includes('{{duration}}')) {
        content = content.replace('{{duration}}', shareData.duration?.toString() || '0');
      }

      ctx.fillText(content, x, y);
    }

    // Add more element types as needed (charts, images, etc.)
    if (element.type === 'badge' && shareData.personalBest) {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PB!', x, y);
    }

    ctx.restore();
  }

  private replaceTemplateVariables(content: string, shareData: EnhancedShareData): string {
    return content
      .replace('{{exercise_name}}', shareData.exercise || 'Workout')
      .replace('{{duration}}', shareData.duration?.toString() || '0')
      .replace('{{achievement_name}}', shareData.achievement || 'Achievement')
      .replace('{{description}}', shareData.achievement_description || 'Great job!')
      .replace('{{streak_days}}', shareData.streakDays?.toString() || '0')
      .replace('{{is_personal_best}}', shareData.personalBest ? '🏆 Yes!' : 'No')
      .replace('{{user_name}}', shareData.user_name || 'You')
      .replace('{{app_name}}', shareData.app_name || 'PlankIt');
  }

  // Enhanced platform sharing methods
  async shareToInstagram(imageDataUrl: string, caption: string): Promise<void> {
    try {
      const file = await this.dataURLToFile(imageDataUrl, 'plankit-workout.png');
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My PlankIt Workout',
          text: caption,
          files: [file]
        });
        
        await this.trackShare('instagram', 'workout_image');
      } else {
        // Fallback: copy image to clipboard and open Instagram
        await this.copyImageToClipboard(imageDataUrl);
        window.open('https://www.instagram.com/', '_blank');
      }
    } catch (error) {
      console.error('Instagram sharing failed:', error);
      throw error;
    }
  }

  async shareToLinkedIn(text: string, imageDataUrl?: string): Promise<void> {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
    
    if (imageDataUrl) {
      await this.copyImageToClipboard(imageDataUrl);
    }
    
    // Copy text to clipboard for easy pasting
    await navigator.clipboard.writeText(text);
    
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
    await this.trackShare('linkedin', 'professional_post');
  }

  async shareToTwitter(text: string, imageDataUrl?: string): Promise<void> {
    const tweetText = `${text} #PlankIt #Fitness #CoreStrength`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    if (imageDataUrl) {
      await this.copyImageToClipboard(imageDataUrl);
    }
    
    window.open(tweetUrl, '_blank', 'width=550,height=420');
    await this.trackShare('twitter', 'workout_tweet');
  }

  async shareToFacebook(text: string, imageDataUrl?: string): Promise<void> {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(text)}`;
    
    if (imageDataUrl) {
      await this.copyImageToClipboard(imageDataUrl);
    }
    
    window.open(fbUrl, '_blank', 'width=550,height=420');
    await this.trackShare('facebook', 'workout_post');
  }

  async shareToWhatsApp(text: string): Promise<void> {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    await this.trackShare('whatsapp', 'workout_message');
  }

  async shareToTelegram(text: string): Promise<void> {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
    await this.trackShare('telegram', 'workout_message');
  }

  async copyShareableLink(shareData: EnhancedShareData): Promise<string> {
    const shareUrl = `${window.location.origin}/share/${btoa(JSON.stringify(shareData))}`;
    await navigator.clipboard.writeText(shareUrl);
    await this.trackShare('clipboard', 'shareable_link');
    return shareUrl;
  }

  private async dataURLToFile(dataURL: string, filename: string): Promise<File> {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    return new File([blob], filename, { type: 'image/png' });
  }

  private async copyImageToClipboard(imageDataUrl: string): Promise<void> {
    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
    } catch (error) {
      console.log('Image clipboard copy not supported, falling back to text');
    }
  }

  private async trackShare(platform: string, contentType: string, templateId?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('share_analytics').insert({
        user_id: user.id,
        platform,
        content_type: contentType,
        template_id: templateId,
        engagement_data: {}
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }

  // Community sharing methods
  async createCommunityChallenge(challengeData: {
    title: string;
    description: string;
    challenge_type: string;
    target_data: any;
    start_date: string;
    end_date: string;
    template_id?: string;
  }): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_challenges')
        .insert({
          ...challengeData,
          created_by: user.id
        })
        .select('id')
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error creating community challenge:', error);
      return null;
    }
  }

  async joinChallenge(challengeId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id
        });

      if (error) throw error;

      // Update participant count using the RPC function
      const { error: rpcError } = await supabase.rpc('increment_challenge_participants', { 
        challenge_id: challengeId 
      });

      if (rpcError) {
        console.error('Error updating participant count:', rpcError);
      }

      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      return false;
    }
  }

  async getShareAnalytics(userId: string): Promise<ShareAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('share_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('shared_at', { ascending: false });

      if (error) throw error;

      // Cast the data to ShareAnalytics[] with proper type assertion
      return (data || []).map(analytics => ({
        id: analytics.id,
        user_id: analytics.user_id,
        platform: analytics.platform,
        content_type: analytics.content_type,
        template_id: analytics.template_id,
        shared_at: analytics.shared_at,
        engagement_data: (analytics.engagement_data as unknown) as ShareAnalytics['engagement_data']
      }));
    } catch (error) {
      console.error('Error fetching share analytics:', error);
      return [];
    }
  }
}

export const enhancedSocialSharingService = new EnhancedSocialSharingService();
