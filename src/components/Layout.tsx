import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LayoutDashboard, MessageSquare, Calendar, LogOut, Sparkles, Send, Moon, Sun, TrendingUp, ImageIcon, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import logoFull from "@/assets/logo-full.png";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({
  children
}: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!"
    });
    navigate("/auth");
  };

  const navItems = [{
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  }, {
    path: "/accounts",
    label: "Contas",
    icon: Sparkles
  }, {
    path: "/phrases",
    label: "Frases",
    icon: MessageSquare
  }, {
    path: "/images",
    label: "Imagens",
    icon: ImageIcon
  }, {
    path: "/periodic-posts",
    label: "Posts Periódicos",
    icon: Calendar
  }, {
    path: "/campaigns",
    label: "Campanhas",
    icon: Megaphone
  }, {
    path: "/manual-post",
    label: "Post Manual",
    icon: Send
  }, {
    path: "/analytics",
    label: "Analytics",
    icon: TrendingUp
  }];

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary/20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Floating Glass Sidebar */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-6 left-6 z-50 rounded-3xl border border-white/5 bg-black/20 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:border-white/10">
        {/* Logo Area */}
        <div className="p-6 relative z-10 border-b border-white/5">
          <div className="flex items-center justify-center">
            <img src={logoFull} alt="AutoThreads" className="h-12 w-auto object-contain" />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="block group">
                <div className={cn(
                  "flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden group-hover:bg-white/5",
                  isActive
                    ? "bg-white/10 text-white shadow-inner border border-white/5"
                    : "text-muted-foreground hover:text-white"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "text-primary scale-110" : "group-hover:text-white group-hover:scale-110"
                  )} />
                  <span className="font-medium text-sm tracking-wide">{item.label}</span>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(0,122,255,0.5)]" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-6 space-y-3 bg-gradient-to-t from-black/40 to-transparent">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5 rounded-2xl h-11 px-4 transition-all duration-300"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="mr-3 h-4 w-4" /> : <Moon className="mr-3 h-4 w-4" />}
            <span className="text-sm font-medium">{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl h-11 px-4 transition-all duration-300"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="text-sm font-medium">Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-80 p-6 md:p-10 min-h-screen transition-all duration-500 relative z-10">
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;