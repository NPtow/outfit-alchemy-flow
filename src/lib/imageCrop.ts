import { supabase } from "@/integrations/supabase/client";

export async function cropClothingImage(imageUrl: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('crop-image', {
      body: { imageUrl }
    });

    if (error) {
      console.error('Error cropping image:', error);
      throw error;
    }

    if (!data?.croppedImageUrl) {
      throw new Error('No cropped image returned');
    }

    return data.croppedImageUrl;
  } catch (error) {
    console.error('Failed to crop image:', error);
    throw error;
  }
}

export async function cropMultipleImages(imageUrls: string[]): Promise<string[]> {
  const croppedImages: string[] = [];
  
  for (const url of imageUrls) {
    try {
      const croppedUrl = await cropClothingImage(url);
      croppedImages.push(croppedUrl);
    } catch (error) {
      console.error(`Failed to crop image ${url}:`, error);
      croppedImages.push(url); // Use original if cropping fails
    }
  }
  
  return croppedImages;
}
