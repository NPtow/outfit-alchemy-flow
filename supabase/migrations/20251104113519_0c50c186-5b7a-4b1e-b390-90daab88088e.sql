-- Create profiles table for Telegram users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  telegram_id BIGINT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create saved_outfits table
CREATE TABLE public.saved_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  outfit_id TEXT NOT NULL,
  occasion TEXT,
  items JSONB NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, outfit_id)
);

-- Enable RLS
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

-- Saved outfits policies
CREATE POLICY "Users can view their own saved outfits"
  ON public.saved_outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved outfits"
  ON public.saved_outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved outfits"
  ON public.saved_outfits FOR DELETE
  USING (auth.uid() = user_id);

-- Create basket_items table
CREATE TABLE public.basket_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  item_number TEXT,
  price NUMERIC,
  shop_url TEXT,
  image TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.basket_items ENABLE ROW LEVEL SECURITY;

-- Basket items policies
CREATE POLICY "Users can view their own basket items"
  ON public.basket_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own basket items"
  ON public.basket_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own basket items"
  ON public.basket_items FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();