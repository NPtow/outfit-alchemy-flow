import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Intro = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, показывали ли уже интро
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    
    if (hasSeenIntro) {
      // Если уже видели интро, сразу переходим к ленте
      navigate("/feed", { replace: true });
    } else {
      // Показываем интро 3 секунды, затем переходим к авторизации
      const timer = setTimeout(() => {
        localStorage.setItem("hasSeenIntro", "true");
        navigate("/telegram-auth", { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Логотип с анимацией */}
      <div className="animate-scale-in">
        <div className="relative">
          {/* Внешнее свечение */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 blur-3xl opacity-50 animate-pulse" />
          
          {/* Логотип */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-pink-400 via-purple-400 to-purple-500 flex items-center justify-center shadow-2xl mb-6">
              <span className="text-6xl font-stolzl font-bold text-white">I</span>
            </div>
            
            <h1 className="text-4xl font-stolzl font-bold text-white tracking-tight">
              SwipeStyle
            </h1>
            
            <p className="text-white/60 mt-2 font-inter">
              Your Personal Outfit Curator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;
