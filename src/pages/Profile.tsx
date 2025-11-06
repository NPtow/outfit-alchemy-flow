import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import "@/types/telegram";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Проверяем, открыто ли в Telegram Mini App
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);

        // Fetch profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithTelegram = async () => {
    const tg = window.Telegram?.WebApp;
    
    if (!tg?.initData) {
      toast({
        title: "Ошибка",
        description: "Откройте приложение через Telegram Mini App",
        variant: "destructive",
      });
      return;
    }

    setIsAuthenticating(true);

    try {
      const { data, error } = await supabase.functions.invoke("telegram-auth", {
        body: { initData: tg.initData },
      });

      if (error) {
        console.error("Auth error:", error);
        toast({
          title: "Ошибка авторизации",
          description: error.message || "Не удалось войти через Telegram",
          variant: "destructive",
        });
        return;
      }

      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        const userName = data.user?.user_metadata?.first_name || "пользователь";
        
        toast({
          title: "Добро пожаловать!",
          description: `Вы вошли как ${userName}`,
        });

        // Обновляем состояние
        await checkAuth();
      }
    } catch (error) {
      console.error("Telegram auth error:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при авторизации",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
      });
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Не авторизован
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-black pb-32">
        <div className="max-w-md mx-auto px-4 pt-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-stolzl font-bold text-white mb-2">
              Личный кабинет
            </h1>
            <p className="font-stolzl text-white/60">
              Войдите для доступа к персонализированным функциям
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <Button
              onClick={authenticateWithTelegram}
              disabled={isAuthenticating}
              className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white font-stolzl text-lg py-6 rounded-2xl transition-all duration-200"
            >
              {isAuthenticating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Авторизация...
                </span>
              ) : (
                "Войти через Telegram"
              )}
            </Button>
            
            <p className="text-sm text-white/60 font-stolzl text-center mt-4">
              Доступно только в Telegram Mini App
            </p>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Авторизован
  return (
    <div className="min-h-screen w-full bg-black pb-32">
      <div className="max-w-md mx-auto px-4 pt-12">
        <div className="text-center mb-8">
          {profile?.photo_url && (
            <img 
              src={profile.photo_url} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-white/20"
            />
          )}
          <h1 className="text-4xl font-stolzl font-bold text-white mb-2">
            {profile?.first_name || "Пользователь"}
          </h1>
          {profile?.last_name && (
            <p className="font-stolzl text-white/80 text-xl">
              {profile.last_name}
            </p>
          )}
          {profile?.username && (
            <p className="font-stolzl text-white/60 text-sm mt-1">
              @{profile.username}
            </p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 space-y-4">
          <div className="text-center text-white/60 font-stolzl text-sm mb-4">
            Telegram ID: {profile?.telegram_id || user.user_metadata?.telegram_id}
          </div>
          
          <Button
            onClick={handleLogout}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-stolzl text-lg py-6 rounded-2xl border border-white/20 transition-all duration-200"
          >
            Выход
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
