-- Create table for try-this.ru generated outfits
CREATE TABLE public.trythis_outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trythis_outfits ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own trythis outfits" 
ON public.trythis_outfits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trythis outfits" 
ON public.trythis_outfits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trythis outfits" 
ON public.trythis_outfits 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_trythis_outfits_user_id ON public.trythis_outfits(user_id);
CREATE INDEX idx_trythis_outfits_created_at ON public.trythis_outfits(created_at DESC);