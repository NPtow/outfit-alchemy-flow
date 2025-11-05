import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MigrateImages = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleMigrate = async () => {
    setIsMigrating(true);
    setProgress(0);
    setStatus('Начинаем миграцию изображений...');
    
    const BATCH_SIZE = 50;
    const TOTAL_PRODUCTS = 809;
    let offset = 0;
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    try {
      while (offset < TOTAL_PRODUCTS) {
        setStatus(`Обработка изображений ${offset + 1}-${Math.min(offset + BATCH_SIZE, TOTAL_PRODUCTS)} из ${TOTAL_PRODUCTS}...`);
        
        const { data, error } = await supabase.functions.invoke('migrate-images', {
          body: { batchSize: BATCH_SIZE, offset }
        });

        if (error) throw error;

        if (!data.success) {
          throw new Error(data.error || 'Ошибка миграции');
        }

        totalProcessed += data.processed;
        totalSuccess += data.successful;
        totalFailed += data.failed;

        setProgress((totalProcessed / TOTAL_PRODUCTS) * 100);

        if (data.errors && data.errors.length > 0) {
          console.error('Batch errors:', data.errors);
        }

        if (!data.hasMore || data.processed === 0) {
          break;
        }

        offset += BATCH_SIZE;
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setStatus(`Завершено! Успешно: ${totalSuccess}, Ошибок: ${totalFailed}`);
      toast.success(`Миграция завершена! Обработано ${totalSuccess} изображений`);
      
    } catch (error) {
      console.error('Migration error:', error);
      setStatus('Ошибка при миграции');
      toast.error('Ошибка: ' + (error as Error).message);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Миграция изображений</h1>
          <p className="text-muted-foreground">
            Скачивание 809 изображений из внешнего Supabase storage в локальный
          </p>
        </div>

        {isMigrating && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">{status}</p>
            <p className="text-sm text-center font-medium">{Math.round(progress)}%</p>
          </div>
        )}

        <Button 
          onClick={handleMigrate} 
          disabled={isMigrating}
          size="lg"
          className="w-full"
        >
          {isMigrating ? 'Миграция...' : 'Запустить миграцию'}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Процесс может занять 10-15 минут</p>
          <p>• Не закрывайте страницу во время миграции</p>
          <p>• После завершения URL изображений будут обновлены</p>
        </div>
      </div>
    </div>
  );
};

export default MigrateImages;
