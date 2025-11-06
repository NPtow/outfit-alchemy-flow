import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
      };
    };
    TelegramLoginWidget: {
      dataOnauth: (user: any) => void;
    };
  }
}

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
      if (tg && tg.initDataUnsafe?.user) {
        console.log("Detected Telegram WebApp, auto-authenticating...");
        tg.ready();
        tg.expand();
        
        const user = tg.initDataUnsafe.user;
        authenticateWithTelegram({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          auth_date: Math.floor(Date.now() / 1000),
          hash: tg.initData // Use initData as hash for verification
        });
      } else {
        // Not in Telegram WebApp, show login widget
        setIsLoading(false);
        setupLoginWidget();
      }
    });
  }, [navigate]);

  const authenticateWithTelegram = async (user: any) => {
    setIsLoading(true);
    console.log("Telegram auth data:", user);

    try {
      // Call edge function to verify and create session
      const { data, error } = await supabase.functions.invoke("telegram-auth", {
        body: { telegramData: user },
      });

      if (error) {
        console.error("Auth error:", error);
        toast({
          title: "Ошибка авторизации",
          description: "Не удалось войти через Telegram",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Set session
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        toast({
          title: "Успешный вход!",
          description: `Добро пожаловать, ${user.first_name}!`,
        });

        navigate("/feed");
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
    // Define callback function globally before loading script
    (window as any).onTelegramAuth = authenticateWithTelegram;

    // Load Telegram widget script
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