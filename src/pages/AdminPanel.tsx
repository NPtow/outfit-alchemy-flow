import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Upload, Crop } from 'lucide-react';
import { cropClothingImage } from '@/lib/imageCrop';

const AdminPanel = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [isCropping, setIsCropping] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outfitStats, setOutfitStats] = useState<{total: number, min: number, max: number} | null>(null);

  const loadOutfitStats = async () => {
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select('items');
      
      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        min: Math.min(...(data?.map(o => Array.isArray(o.items) ? o.items.length : 0) || [0])),
        max: Math.max(...(data?.map(o => Array.isArray(o.items) ? o.items.length : 0) || [0]))
      };
      setOutfitStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleGenerateOutfits = async () => {
    setIsGenerating(true);
    
    try {
      toast({
        title: 'Генерация образов',
        description: 'Запускаем генерацию 49 новых образов...',
      });

      const { data, error } = await supabase.functions.invoke('generate-outfits');

      if (error) throw error;

      toast({
        title: 'Успех!',
        description: `Сгенерировано ${data.generated} новых образов`,
      });

      // Reload stats
      await loadOutfitStats();
    } catch (error: any) {
      console.error('Error generating outfits:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сгенерировать образы',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCropImage = async () => {
    if (!cropImageUrl) {
      toast({
        title: 'Ошибка',
        description: 'Введите URL изображения для обрезки',
        variant: 'destructive',
      });
      return;
    }

    setIsCropping(true);

    try {
      toast({
        title: 'Обработка',
        description: 'Обрезаем изображение...',
      });

      const croppedUrl = await cropClothingImage(cropImageUrl);

      toast({
        title: 'Готово!',
        description: 'Изображение обрезано. Скачайте результат.',
      });

      // Download the cropped image
      const link = document.createElement('a');
      link.href = croppedUrl;
      link.download = 'cropped-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCropImageUrl('');
    } catch (error: any) {
      console.error('Error cropping image:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обрезать изображение',
        variant: 'destructive',
      });
    } finally {
      setIsCropping(false);
    }
  };

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
      <div className="container mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-stolzl font-bold text-primary">
          Админ-панель
        </h1>

        {/* Outfit Generation Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-stolzl font-semibold">Генерация образов</h2>
          
          {outfitStats && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm font-semibold mb-2">Текущая статистика:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Всего образов: {outfitStats.total}</li>
                <li>Мин. вещей в образе: {outfitStats.min}</li>
                <li>Макс. вещей в образе: {outfitStats.max}</li>
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={loadOutfitStats}
              variant="outline"
              className="flex-1"
            >
              Обновить статистику
            </Button>
            <Button
              onClick={handleGenerateOutfits}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Генерируем...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Сгенерировать 49 образов
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Новые правила генерации:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Каждый образ содержит 4-5 вещей</li>
              <li>Обувь и сумка обязательны в каждом образе</li>
              <li>Верхняя одежда опциональна (5-я вещь)</li>
              <li>Все неполноценные образы уже удалены</li>
            </ul>
          </div>
        </Card>

        {/* Image Cropping Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-stolzl font-semibold">Обрезка изображений</h2>
          <p className="text-sm text-muted-foreground">
            Автоматически обрезает изображение по границам одежды, убирая лишние поля
          </p>

          <div>
            <label className="text-sm font-semibold mb-2 block">URL изображения</label>
            <Input
              type="url"
              placeholder="https://example.com/clothing-image.png или /clothing-images/pants.png"
              value={cropImageUrl}
              onChange={(e) => setCropImageUrl(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCropImage}
            disabled={isCropping}
            className="w-full"
          >
            {isCropping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Обрезаем...
              </>
            ) : (
              <>
                <Crop className="mr-2 h-4 w-4" />
                Обрезать изображение
              </>
            )}
          </Button>

          <div className="mt-4 p-4 bg-primary/5 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Как использовать:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Вставьте URL изображения (внешний или локальный)</li>
              <li>Нажмите "Обрезать изображение"</li>
              <li>AI автоматически обрежет по границам одежды</li>
              <li>Обрезанное изображение скачается автоматически</li>
              <li>Замените старый файл в папке public/clothing-images/</li>
            </ol>
          </div>
        </Card>

        {/* Add Product Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-stolzl font-semibold">Добавление товаров</h2>
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
