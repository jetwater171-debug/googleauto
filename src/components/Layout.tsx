import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LayoutDashboard, MessageSquare, Calendar, LogOut, Send, Moon, Sun, TrendingUp, ImageIcon, Megaphone, Sparkles, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import logoFull from "@/assets/logo-full.png";
import { useTheme } from "./ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme, effectiveTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!"
    });
    navigate("/auth");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/accounts", label: "Contas", icon: Sparkles },
    { path: "/phrases", label: "Frases", icon: MessageSquare },
    { path: "/images", label: "Imagens", icon: ImageIcon },
    { path: "/periodic-posts", label: "Posts Periódicos", icon: Calendar },
    { path: "/campaigns", label: "Campanhas", icon: Megaphone },
    { path: "/manual-post", label: "Post Manual", icon: Send },
    { path: "/analytics", label: "Analytics", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Subtle Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.02, 0.04, 0.02],
            x: [0, 30, 0],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-primary/[0.03] blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.02, 0.05, 0.02],
            x: [0, -30, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute bottom-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full bg-accent/[0.03] blur-[150px]"
        />
      </div>

      {/* Elegant Floating Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-50">
        <div className="m-4 flex-1 glass-card rounded-2xl overflow-hidden flex flex-col">
          {/* Logo Area */}
          <div className="p-6 border-b border-white/[0.06]">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-center"
            >
              <img
                src={logoFull}
                alt="AutoThreads"
                className="h-10 w-auto object-contain"
              />
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group",
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                      )}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 gradient-primary rounded-r-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}

                      <Icon
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isActive ? "text-primary scale-110" : "group-hover:scale-110"
                        )}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-white/[0.06] space-y-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-white/[0.04] h-10"
                >
                  {effectiveTheme === "dark" ? (
                    <Moon className="mr-2 h-4 w-4" />
                  ) : (
                    <Sun className="mr-2 h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {theme === "system" ? "Sistema" : theme === "dark" ? "Escuro" : "Claro"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className={cn(theme === "light" && "bg-accent")}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Claro</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className={cn(theme === "dark" && "bg-accent")}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Escuro</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className={cn(theme === "system" && "bg-accent")}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="text-sm">Sair</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 relative z-10 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen p-6 md:p-8"
          >
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;