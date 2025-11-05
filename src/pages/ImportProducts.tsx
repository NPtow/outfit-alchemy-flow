import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { importProductsFromCSV } from '@/lib/importProducts';

const ImportProducts = () => {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const response = await fetch('/database/products_catalog_full_809.csv');
      const csvText = await response.text();
      
      toast.info('Начинаем импорт 809 товаров...');
      await importProductsFromCSV(csvText);
      
      toast.success('Все товары успешно импортированы!');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Ошибка при импорте: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-3xl font-bold">Импорт товаров</h1>
        <p className="text-muted-foreground">
          Импортировать 809 товаров из CSV файла в базу данных
        </p>
        <Button 
          onClick={handleImport} 
          disabled={isImporting}
          size="lg"
          className="w-full"
        >
          {isImporting ? 'Импорт...' : 'Импортировать товары'}
        </Button>
      </div>
    </div>
  );
};

export default ImportProducts;
