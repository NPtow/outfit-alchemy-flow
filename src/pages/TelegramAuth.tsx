import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import "@/types/telegram";

const TelegramAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const botUsername = "swipestyle_auth_bot";

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/feed");
        return;
      }

      // Check if opened in Telegram WebApp
      const tg = window.Telegram?.WebApp;
      if (tg?.initData) {
        console.log("Telegram Mini App detected");
        tg.ready();
        tg.expand();
        
        // Отправляем только initData для валидации
        authenticateWithTelegram(tg.initData);
      } else {
        // Not in Telegram WebApp
        console.log("Not in Telegram, showing login widget");
        setIsLoading(false);
        setupLoginWidget();
      }
    });
  }, [navigate]);

  const authenticateWithTelegram = async (initData: string) => {
    setIsLoading(true);
    console.log("Starting Telegram authentication");

    try {
      const { data, error } = await supabase.functions.invoke("telegram-auth", {
        body: { initData },
      });

      if (error) {
        console.error("Auth error:", error);
        toast({
          title: "Ошибка авторизации",
          description: error.message || "Не удалось войти через Telegram",
          variant: "destructive",
        });
        setIsLoading(false);
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

        navigate("/feed");
      } else {
        throw new Error("No session returned");
      }
    } catch (error) {
      console.error("Telegram auth error:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при авторизации",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const setupLoginWidget = () => {
    // Для Login Widget используем другой callback
    (window as any).onTelegramAuth = async (user: any) => {
      // Login Widget возвращает данные в другом формате
      // Создаем initData вручную для единообразия
      const initDataParams = new URLSearchParams();
      initDataParams.set('user', JSON.stringify(user));
      initDataParams.set('auth_date', user.auth_date.toString());
      initDataParams.set('hash', user.hash);
      
      await authenticateWithTelegram(initDataParams.toString());
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-userpic", "true");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.async = true;

    const container = document.getElementById("telegram-login-container");
    if (container) {
      container.appendChild(script);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-stolzl font-bold text-white mb-2">
            SwipeStyle
          </h1>
          <p className="font-stolzl text-white/60">
            Войдите с помощью Telegram
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
          <div className="flex flex-col items-center gap-6">
            {isLoading ? (
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-stolzl">Авторизация...</span>
              </div>
            ) : (
              <>
                <div
                  id="telegram-login-container"
                  className="flex justify-center"
                />
                <p className="text-sm text-white/60 font-stolzl text-center">
                  Нажимая кнопку выше, вы соглашаетесь с условиями
                  использования приложения
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/40 font-stolzl">
            Ваши данные защищены и не будут переданы третьим лицам
          </p>
        </div>
      </div>
    </div>
  );
};

export default TelegramAuth;