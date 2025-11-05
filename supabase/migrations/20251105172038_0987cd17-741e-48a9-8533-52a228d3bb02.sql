-- Allow anyone to insert products (for import functionality)
CREATE POLICY "Anyone can insert products"
ON public.products
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update products (for future updates)
CREATE POLICY "Anyone can update products"
ON public.products
FOR UPDATE
USING (true);