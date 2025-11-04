import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/telegram-auth");
        return;
      }

      setUser(session.user);

      // Fetch profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
      });
      navigate("/telegram-auth");
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

  return (
    <div className="min-h-screen w-full bg-black pb-32">
      <div className="max-w-md mx-auto px-4 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-stolzl font-bold text-white mb-2">
            Добро пожаловать
          </h1>
          {profile?.first_name && (
            <p className="font-stolzl text-white/80 text-xl">
              {profile.first_name} {profile.last_name || ""}
            </p>
          )}
          {profile?.username && (
            <p className="font-stolzl text-white/60 text-sm mt-1">
              @{profile.username}
            </p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
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
