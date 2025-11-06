import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoSwipeStyle from "@/assets/logo-swipestyle.png";

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

const Intro = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, открыто ли в Telegram WebApp
    const isTelegramWebApp = window.Telegram?.WebApp?.initDataUnsafe?.user;
    
    if (isTelegramWebApp) {
      // Если открыто в Telegram, сразу перенаправляем на авторизацию
      navigate("/telegram-auth", { replace: true });
    } else {
      // Показываем интро 3 секунды, затем переходим к ленте
      const timer = setTimeout(() => {
        navigate("/feed", { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Логотип с анимацией */}
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="animate-[scale-in_0.8s_ease-out,pulse_2s_ease-in-out_infinite]">
          <img 
            src={logoSwipeStyle} 
            alt="SwipeStyle Logo" 
            className="w-64 h-64 object-contain"
          />
        </div>
        <h1 className="font-stolzl text-4xl font-bold text-foreground tracking-wider animate-fade-in">
          SwipeStyle
        </h1>
      </div>
    </div>
  );
};

export default Intro;
