import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import Feed from "./pages/Feed";
import MyOutfits from "./pages/MyOutfits";
import Basket from "./pages/Basket";
import Auth from "./pages/Auth";
import TelegramAuth from "./pages/TelegramAuth";
import Profile from "./pages/Profile";
import MLInsights from "./pages/MLInsights";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/my-outfits" element={<MyOutfits />} />
          <Route path="/basket" element={<Basket />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/telegram-auth" element={<TelegramAuth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ml-insights" element={<MLInsights />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
