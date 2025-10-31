import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Upload } from 'lucide-react';

const AdminPanel = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');

  const handleProcessItem = async () => {
    if (!imageUrl || !category) {
      toast({
        title: 'Ошибка',
        description: 'Введите URL изображения и категорию',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Remove background via NanoBanana
      toast({
        title: 'Обработка',
        description: 'Удаляем фон через NanoBanana...',
      });

      const { data: bgData, error: bgError } = await supabase.functions.invoke('remove-background', {
        body: { imageUrl, category }
      });

      if (bgError) throw bgError;
      if (!bgData?.processedImageUrl) throw new Error('No processed image');

      const processedImageUrl = bgData.processedImageUrl;

      // Step 2: Generate attributes via LLM
      toast({
        title: 'Обработка',
        description: 'Генерируем атрибуты через LLM...',
      });

      const { data: attrData, error: attrError } = await supabase.functions.invoke('generate-attributes', {
        body: {
          imageUrl: processedImageUrl,
          category,
          brand,
          productName
        }
      });

      if (attrError) throw attrError;
      if (!attrData?.attributes) throw new Error('No attributes generated');

      // Step 3: Save to database
      const { error: insertError } = await supabase
        .from('clothing_items')
        .insert({
          original_image_url: imageUrl,
          processed_image_url: processedImageUrl,
          brand,
          product_name: productName,
          category,
          attributes: attrData.attributes
        });

      if (insertError) throw insertError;

      toast({
        title: 'Успех!',
        description: 'Товар успешно добавлен в базу',
      });

      // Reset form
      setImageUrl('');
      setBrand('');
      setProductName('');
      setCategory('');

    } catch (error: any) {
      console.error('Error processing item:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обработать товар',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-stolzl font-bold text-primary mb-6">
          Админ-панель: добавление товаров
        </h1>

        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">URL изображения</label>
            <Input
              type="url"
              placeholder="https://brand.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Категория (обязательно)</label>
            <Input
              placeholder="рубашка, куртка, брюки..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Бренд</label>
            <Input
              placeholder="Nike, Zara, H&M..."
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Название товара</label>
            <Input
              placeholder="Классическая белая рубашка"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <Button
            onClick={handleProcessItem}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Обрабатываем...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Добавить товар
              </>
            )}
          </Button>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Как это работает:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Введите URL изображения товара с сайта бренда</li>
              <li>NanoBanana удалит фон и оставит только вещь</li>
              <li>LLM сгенерирует атрибуты (цвет, стиль, ткань, сезон и т.п.)</li>
              <li>Все сохранится в базу и станет доступно для рекомендаций</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
