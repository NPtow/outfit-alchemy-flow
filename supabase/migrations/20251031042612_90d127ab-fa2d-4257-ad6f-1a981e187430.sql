-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for storing clothing items with attributes
CREATE TABLE public.clothing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_image_url TEXT NOT NULL,
  processed_image_url TEXT,
  brand TEXT,
  product_name TEXT,
  category TEXT,
  attributes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read items (public catalog)
CREATE POLICY "Anyone can view clothing items"
ON public.clothing_items
FOR SELECT
USING (true);

-- Create policy to allow inserts (for now public, can be restricted later)
CREATE POLICY "Anyone can insert clothing items"
ON public.clothing_items
FOR INSERT
WITH CHECK (true);

-- Create policy to allow updates
CREATE POLICY "Anyone can update clothing items"
ON public.clothing_items
FOR UPDATE
USING (true);

-- Create index for faster searches
CREATE INDEX idx_clothing_items_category ON public.clothing_items(category);
CREATE INDEX idx_clothing_items_brand ON public.clothing_items(brand);
CREATE INDEX idx_clothing_items_attributes ON public.clothing_items USING GIN(attributes);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clothing_items_updated_at
BEFORE UPDATE ON public.clothing_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for processed images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('clothing-images', 'clothing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view clothing images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'clothing-images');

CREATE POLICY "Anyone can upload clothing images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'clothing-images');

CREATE POLICY "Anyone can update clothing images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'clothing-images');