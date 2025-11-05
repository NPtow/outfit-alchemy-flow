import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const UpdateMetadata = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState('');

  const handleUpdate = async () => {
    setIsUpdating(true);
    setStatus('Читаем JSON файлы и обновляем данные...');

    try {
      const { data, error } = await supabase.functions.invoke('update-product-metadata');

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Ошибка обновления');
      }

      setStatus(`Завершено! Обновлено: ${data.updated}, Ошибок: ${data.failed}`);
      toast.success(`Обновлено ${data.updated} товаров`);
      
      if (data.errors && data.errors.length > 0) {
        console.error('Update errors:', data.errors);
      }

    } catch (error) {
      console.error('Update error:', error);
      setStatus('Ошибка при обновлении');
      toast.error('Ошибка: ' + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Обновление метаданных</h1>
          <p className="text-muted-foreground">
            Загрузка названий и цен из JSON файлов в storage
          </p>
        </div>

        {status && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-center">{status}</p>
          </div>
        )}

        <Button 
          onClick={handleUpdate} 
          disabled={isUpdating}
          size="lg"
          className="w-full"
        >
          {isUpdating ? 'Обновление...' : 'Обновить метаданные'}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Читает JSON файлы из внешнего storage</p>
          <p>• Обновляет названия и цены товаров</p>
          <p>• Процесс займёт несколько минут</p>
        </div>
      </div>
    </div>
  );
};

export default UpdateMetadata;
