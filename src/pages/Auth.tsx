import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";

const Auth = () => {
  const handleTelegramAuth = () => {
    // TODO: Implement Telegram auth
    console.log("Telegram auth");
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <h1 className="text-2xl font-stolzl font-bold text-white">
          Вход
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="flex flex-col items-center">
          {/* Telegram Icon */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center mb-8">
            <Send className="w-16 h-16 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-stolzl font-bold text-white mb-3">
            Telegram
          </h2>

          {/* Description */}
          <p className="text-center text-white/70 mb-8 max-w-xs">
            Вход доступен через аккаунт в Telegram
          </p>

          {/* Auth Button */}
          <Button
            onClick={handleTelegramAuth}
            className="w-full max-w-xs bg-blue-500 hover:bg-blue-600 text-white font-stolzl font-semibold py-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-5 h-5" />
            Войти при помощи Telegram
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Auth;
