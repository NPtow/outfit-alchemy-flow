import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Loader2, TrendingUp, Eye, Users, Package } from "lucide-react";

interface AnalyticsStats {
  total_outfits: number;
  viewed_outfits: number;
  unique_viewers: number;
  total_views: number;
}

interface OutfitStats {
  id: string;
  occasion: string;
  outfit_number: number;
  unique_viewers: number;
  total_views: number;
}

const Analytics = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [topOutfits, setTopOutfits] = useState<OutfitStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      // Direct query for stats
      const { count: totalOutfits } = await supabase
        .from('outfits')
        .select('*', { count: 'exact', head: true });
      
      const { data: viewsData } = await supabase
        .from('user_outfit_views')
        .select('outfit_id, user_id, anonymous_id');

      if (viewsData) {
        const uniqueOutfits = new Set(viewsData.map(v => v.outfit_id)).size;
        const uniqueViewers = new Set(
          viewsData.map(v => v.user_id?.toString() || v.anonymous_id)
        ).size;

        setStats({
          total_outfits: totalOutfits || 0,
          viewed_outfits: uniqueOutfits,
          unique_viewers: uniqueViewers,
          total_views: viewsData.length
        });
      }

      // Load top outfits
      const { data: outfitsData } = await supabase
        .from('outfits')
        .select(`
          id,
          occasion,
          outfit_number,
          user_outfit_views (
            user_id,
            anonymous_id
          )
        `)
        .limit(20);

      if (outfitsData) {
        const processedOutfits = outfitsData
          .map(outfit => {
            const views = outfit.user_outfit_views as any[];
            const uniqueViewers = new Set(
              views.map((v: any) => v.user_id?.toString() || v.anonymous_id)
            ).size;

            return {
              id: outfit.id,
              occasion: outfit.occasion,
              outfit_number: outfit.outfit_number,
              unique_viewers: uniqueViewers,
              total_views: views.length
            };
          })
          .filter(o => o.total_views > 0)
          .sort((a, b) => b.unique_viewers - a.unique_viewers)
          .slice(0, 20);

        setTopOutfits(processedOutfits);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const occasionLabels: Record<string, string> = {
    everyday: 'Повседневный',
    work: 'Работа',
    evening: 'Вечерний',
    home: 'Домашний',
    sport: 'Спорт',
    party: 'Вечеринка'
  };

  const viewRate = stats 
    ? ((stats.viewed_outfits / stats.total_outfits) * 100).toFixed(1)
    : '0';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Аналитика образов
              </h1>
              <p className="text-sm text-muted-foreground">
                Статистика просмотров и вовлеченности
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Всего образов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.total_outfits || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Просмотрено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.viewed_outfits || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {viewRate}% от всех
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Зрителей
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.unique_viewers || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Уникальных
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Всего просмотров
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.total_views || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats && stats.unique_viewers > 0 
                  ? `~${(stats.total_views / stats.unique_viewers).toFixed(1)} на юзера`
                  : '—'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Outfits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Топ просматриваемых образов</CardTitle>
            <CardDescription>
              Образы с наибольшим количеством уникальных просмотров
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">№</th>
                    <th className="pb-3 font-medium">ID образа</th>
                    <th className="pb-3 font-medium">Категория</th>
                    <th className="pb-3 font-medium text-right">Уникальные просмотры</th>
                    <th className="pb-3 font-medium text-right">Всего просмотров</th>
                  </tr>
                </thead>
                <tbody>
                  {topOutfits.map((outfit, index) => (
                    <tr 
                      key={outfit.id} 
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 text-sm font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3 text-sm font-mono text-muted-foreground">
                        #{outfit.outfit_number}
                      </td>
                      <td className="py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {occasionLabels[outfit.occasion] || outfit.occasion}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-semibold text-right">
                        {outfit.unique_viewers}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground text-right">
                        {outfit.total_views}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {topOutfits.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Пока нет данных о просмотрах</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        {stats && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ключевые показатели
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  Охват образов
                </span>
                <span className="text-lg font-bold">
                  {viewRate}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  Средний engagement
                </span>
                <span className="text-lg font-bold">
                  {stats.unique_viewers > 0 
                    ? (stats.total_views / stats.unique_viewers).toFixed(1)
                    : '0'
                  } просмотров/юзер
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  Непросмотренных образов
                </span>
                <span className="text-lg font-bold">
                  {stats.total_outfits - stats.viewed_outfits}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Analytics;
