import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoS from "@/assets/logo-s.png";

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
    <div className="min-h-screen w-full bg-white flex items-center justify-center overflow-hidden">
      {/* Логотип с анимацией */}
      <div className="animate-scale-in">
        <img 
          src={logoS} 
          alt="SwipeStyle Logo" 
          className="w-48 h-48 object-contain animate-pulse"
        />
      </div>
    </div>
  );
};

export default Intro;
