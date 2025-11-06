import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoSwipeStyle from "@/assets/logo-swipestyle.png";

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
          };
        };
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

const Intro = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем Telegram WebApp с небольшой задержкой для загрузки SDK
    const checkTelegram = () => {
      const tg = window.Telegram?.WebApp;
      
      if (tg) {
        console.log("Telegram WebApp detected:", tg.initDataUnsafe);
        tg.ready();
        
        // Проверяем наличие initData (любые данные от Telegram)
        if (tg.initData && tg.initData.length > 0) {
          console.log("Redirecting to telegram-auth");
          navigate("/telegram-auth", { replace: true });
          return true;
        }
      }
      return false;
    };
    
    // Пробуем сразу
    if (checkTelegram()) return;
    
    // Если не сработало, пробуем через 100ms (на случай медленной загрузки SDK)
    const quickCheck = setTimeout(() => {
      if (checkTelegram()) return;
    }, 100);
    
    // Если не Telegram, показываем интро и переходим к ленте
    const timer = setTimeout(() => {
      navigate("/feed", { replace: true });
    }, 3000);

    return () => {
      clearTimeout(quickCheck);
      clearTimeout(timer);
    };
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
