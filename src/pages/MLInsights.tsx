import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { mlApi } from '@/lib/mlApi';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Brain, TrendingUp, Palette, Sparkles } from 'lucide-react';

const MLInsights = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    fetchUserId();
  }, []);
  
  const { data: insights, isLoading } = useQuery({
    queryKey: ['ml-insights', userId],
    queryFn: () => userId ? mlApi.getInsights(userId) : Promise.resolve(null),
    enabled: !!userId,
    refetchInterval: 5000 // Обновляем каждые 5 секунд
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary">Загрузка ML инсайтов...</p>
      </div>
    );
  }
  
  const getPhaseText = (phase: string) => {
    switch(phase) {
      case 'cold_start': return 'Холодный старт: лайкни 5+ образов';
      case 'learning': return 'Обучение: ML учится твои предпочтения';
      case 'personalized': return 'Персонализировано: ML знает твой стиль!';
      default: return phase;
    }
  };
  
  const getPhaseColor = (phase: string) => {
    switch(phase) {
      case 'cold_start': return 'text-gray-500';
      case 'learning': return 'text-blue-500';
      case 'personalized': return 'text-green-500';
      default: return 'text-primary';
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-stolzl font-bold text-primary flex items-center gap-2">
            <Brain className="w-6 h-6" />
            ML Инсайты
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Фаза персонализации */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Фаза ML персонализации</h2>
          </div>
          <p className={`text-2xl font-bold capitalize mb-2 ${getPhaseColor(insights?.phase || 'cold_start')}`}>
            {insights?.phase || 'cold_start'}
          </p>
          <p className="text-sm text-muted-foreground">
            {getPhaseText(insights?.phase || 'cold_start')}
          </p>
        </Card>

        {/* Статистика */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Статистика</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold text-primary">{insights?.total_likes || 0}</p>
              <p className="text-sm text-muted-foreground">Лайков</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{insights?.total_interactions || 0}</p>
              <p className="text-sm text-muted-foreground">Взаимодействий</p>
            </div>
          </div>
        </Card>

        {/* ML Предпочтения */}
        {insights && insights.phase !== 'cold_start' && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Твои ML предпочтения</h2>
            </div>
            
            <div className="space-y-4">
              {insights.top_styles && insights.top_styles.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Любимые стили</h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.top_styles.map((style: string) => (
                      <span key={style} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {insights.top_colors && insights.top_colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Любимые цвета</h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.top_colors.map((color: string) => (
                      <span key={color} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {insights.top_vibes && insights.top_vibes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Настроение</h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.top_vibes.map((vibe: string) => (
                      <span key={vibe} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize">
                        {vibe}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MLInsights;
