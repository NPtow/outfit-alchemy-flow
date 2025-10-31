const ML_API_BASE = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000/api/ml';

export interface MLOutfit {
  outfit_id: string;
  score: number;
  visual_score?: number;
  attribute_score?: number;
  phase: 'cold_start' | 'learning' | 'personalized';
  attributes: {
    style: string[];
    colors: string[];
    fabric: string[];
    details: string[];
    season: string[];
    vibe: string[];
  };
}

export interface MLFeedResponse {
  outfits: MLOutfit[];
  user_phase: string;
  total_likes: number;
}

export interface MLInsights {
  total_interactions: number;
  total_likes: number;
  phase: string;
  top_styles: string[];
  top_colors: string[];
  top_fabrics: string[];
  top_vibes: string[];
}

export const mlApi = {
  // Получить ML-персонализированную ленту
  async getFeed(userId: string, limit: number = 20): Promise<MLFeedResponse> {
    try {
      const response = await fetch(
        `${ML_API_BASE}/feed?user_id=${userId}&limit=${limit}&exclude_seen=true`
      );
      if (!response.ok) throw new Error('Failed to fetch ML feed');
      return response.json();
    } catch (error) {
      console.error('ML API Error:', error);
      throw error;
    }
  },
  
  // Записать взаимодействие
  async recordInteraction(
    userId: string,
    outfitId: string,
    interactionType: 'like' | 'skip' | 'view' | 'view_detail',
    viewDuration?: number
  ) {
    try {
      const response = await fetch(`${ML_API_BASE}/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          outfit_id: outfitId,
          interaction_type: interactionType,
          view_duration: viewDuration || 0
        })
      });
      if (!response.ok) throw new Error('Failed to record interaction');
      return response.json();
    } catch (error) {
      console.error('ML API Error:', error);
      throw error;
    }
  },
  
  // Получить инсайты
  async getInsights(userId: string): Promise<MLInsights> {
    try {
      const response = await fetch(`${ML_API_BASE}/insights/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    } catch (error) {
      console.error('ML API Error:', error);
      throw error;
    }
  },
  
  // Проверить статус ML backend
  async checkStatus() {
    try {
      const response = await fetch(`${ML_API_BASE}/status`);
      return response.json();
    } catch (error) {
      console.error('ML Backend не доступен:', error);
      return null;
    }
  }
};
