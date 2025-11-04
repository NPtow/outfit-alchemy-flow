import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: any) => void;
    };
  }
}

const TelegramAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const botUsername = "YOUR_BOT_USERNAME"; // Replace with your bot username

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

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

    // Define callback function
    (window as any).onTelegramAuth = async (user: any) => {
      setIsLoading(true);
      console.log("Telegram auth callback:", user);

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

          navigate("/");
        }
      } catch (error) {
        console.error("Telegram auth error:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при авторизации",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-stolzl font-bold text-white mb-2">
            InspirationKit
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