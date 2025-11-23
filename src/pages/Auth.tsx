import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message
      });
    } else {
      toast({
        title: "Conta criada!",
        description: "Você já pode fazer login."
      });
    }
    setLoading(false);
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message
      });
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: "1s" }} />
      </div>

      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative z-10 animate-scale-in">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 flex items-center justify-center animate-float">
              <img src={logoIcon} alt="AutoThreads" className="h-full w-full object-contain drop-shadow-2xl" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Bem-vindo ao AutoThreads</CardTitle>
          <CardDescription className="text-base">
            Automação inteligente para suas redes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 p-1 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-fade-in">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</Label>
                  <Input id="email-login" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white/5 border-white/10 focus:border-primary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Senha</Label>
                  <Input id="password-login" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white/5 border-white/10 focus:border-primary/50" />
                </div>
                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/25" disabled={loading}>
                  {loading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </> : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="animate-fade-in">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</Label>
                  <Input id="email-signup" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white/5 border-white/10 focus:border-primary/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Senha</Label>
                  <Input id="password-signup" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="bg-white/5 border-white/10 focus:border-primary/50" />
                </div>
                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/25" disabled={loading}>
                  {loading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </> : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
export default Auth;