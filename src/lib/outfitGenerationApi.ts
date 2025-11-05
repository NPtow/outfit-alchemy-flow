import { supabase } from "@/integrations/supabase/client";

export interface GeneratedOutfit {
  id: string;
  style: string;
  vibe: string;
  occasion: string;
  category: string;
  image: string;
  items: Array<{
    id: string;
    name: string;
    brand: string;
    category: string;
    itemNumber: string;
    price: number;
    shopUrl: string;
    image: string;
    position: { top: string; left: string };
    placement: "above" | "below";
  }>;
}

export interface GenerateOutfitsResponse {
  outfits: GeneratedOutfit[];
  usedProductIds: string[];
}

class OutfitGenerationApi {
  private generatedOutfitsQueue: GeneratedOutfit[] = [];
  private excludedProductIds: Set<string> = new Set();
  private isGenerating = false;

  async generateBatch(count: number = 5): Promise<GeneratedOutfit[]> {
    if (this.isGenerating) {
      console.log('Already generating, waiting...');
      // Wait and return from queue
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.getNextOutfits(count);
    }

    this.isGenerating = true;

    try {
      const { data, error } = await supabase.functions.invoke('generate-outfit', {
        body: { 
          count, 
          excludedProductIds: Array.from(this.excludedProductIds) 
        }
      });

      if (error) {
        console.error('Error generating outfits:', error);
        throw error;
      }

      const response = data as GenerateOutfitsResponse;
      
      if (!response.outfits || response.outfits.length === 0) {
        throw new Error('No outfits generated');
      }

      // Add to queue
      this.generatedOutfitsQueue.push(...response.outfits);
      
      // Track used products
      response.usedProductIds?.forEach(id => this.excludedProductIds.add(id));

      // Reset exclusion list if it gets too large (prevents running out of products)
      if (this.excludedProductIds.size > 100) {
        console.log('Resetting excluded products list');
        this.excludedProductIds.clear();
      }

      console.log(`Generated ${response.outfits.length} outfits, queue size: ${this.generatedOutfitsQueue.length}`);
      
      return response.outfits;
    } finally {
      this.isGenerating = false;
    }
  }

  async getNextOutfits(count: number = 1): Promise<GeneratedOutfit[]> {
    // If queue is low, generate more
    if (this.generatedOutfitsQueue.length < 3 && !this.isGenerating) {
      console.log('Queue low, generating more outfits...');
      this.generateBatch(5).catch(err => {
        console.error('Background generation failed:', err);
      });
    }

    // Return from queue
    const outfits = this.generatedOutfitsQueue.splice(0, count);
    
    // If we don't have enough in queue, generate immediately
    if (outfits.length < count) {
      console.log('Not enough in queue, generating immediately...');
      const generated = await this.generateBatch(Math.max(count - outfits.length, 5));
      outfits.push(...generated.slice(0, count - outfits.length));
    }

    return outfits;
  }

  getQueueSize(): number {
    return this.generatedOutfitsQueue.length;
  }

  clearQueue(): void {
    this.generatedOutfitsQueue = [];
    this.excludedProductIds.clear();
  }
}

export const outfitGenerationApi = new OutfitGenerationApi();
