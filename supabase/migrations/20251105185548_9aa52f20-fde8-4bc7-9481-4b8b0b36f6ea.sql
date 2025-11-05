-- Create outfits table (shared for all users)
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_number INTEGER UNIQUE NOT NULL,
  occasion TEXT NOT NULL CHECK (occasion IN ('general', 'work', 'everyday', 'evening', 'home')),
  items JSONB NOT NULL, -- Array of product_ids: ["TShirt_123", "Pants_456", ...]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user outfit views table (tracks what each user has seen)
CREATE TABLE IF NOT EXISTS public.user_outfit_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_outfit_unique UNIQUE(user_id, anonymous_id, outfit_id),
  CONSTRAINT either_user_or_anon CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  )
);

-- Create user action logs table (tracks all user actions)
CREATE TABLE IF NOT EXISTS public.user_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  action_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT action_user_or_anon CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_outfit_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_action_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for outfits (public read for now, admin only write)
CREATE POLICY "Anyone can view outfits" ON public.outfits
  FOR SELECT USING (true);

-- RLS Policies for user_outfit_views
CREATE POLICY "Users can view their own outfit views" ON public.user_outfit_views
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL)
  );

CREATE POLICY "Anyone can insert outfit views" ON public.user_outfit_views
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_action_logs
CREATE POLICY "Users can view their own action logs" ON public.user_action_logs
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL)
  );

CREATE POLICY "Anyone can insert action logs" ON public.user_action_logs
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_outfits_occasion ON public.outfits(occasion);
CREATE INDEX idx_user_outfit_views_user ON public.user_outfit_views(user_id);
CREATE INDEX idx_user_outfit_views_anon ON public.user_outfit_views(anonymous_id);
CREATE INDEX idx_user_outfit_views_outfit ON public.user_outfit_views(outfit_id);
CREATE INDEX idx_user_action_logs_user ON public.user_action_logs(user_id);
CREATE INDEX idx_user_action_logs_anon ON public.user_action_logs(anonymous_id);
CREATE INDEX idx_user_action_logs_created ON public.user_action_logs(created_at);