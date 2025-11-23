import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, Users, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PostHistory {
  id: string;
  content: string;
  posted_at: string;
  account_username: string | null;
  account_profile_picture: string | null;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    accounts: 0,
    phrases: 0,
    periodicPosts: 0,
    postsToday: 0
  });
  const [postHistory, setPostHistory] = useState<PostHistory[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      await loadStats();
      await loadPostHistory();
    };

    checkAuth();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [accountsRes, phrasesRes, postsRes, postsTodayRes] = await Promise.all([
        supabase.from("threads_accounts").select("id", { count: "exact" }),
        supabase.from("phrases").select("id", { count: "exact" }),
        supabase.from("periodic_posts").select("id", { count: "exact" }),
        supabase.from("post_history").select("id", { count: "exact" }).gte("posted_at", today.toISOString())
      ]);

      setStats({
        accounts: accountsRes.count || 0,
        phrases: phrasesRes.count || 0,
        periodicPosts: postsRes.count || 0,
        postsToday: postsTodayRes.count || 0
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPostHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("post_history")
        .select(`
          id,
          content,
          posted_at,
          threads_accounts!post_history_account_id_fkey (username, profile_picture_url)
        `)
        .order("posted_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedHistory = data?.map((post: any) => ({
        id: post.id,
        content: post.content,
        posted_at: post.posted_at,
        account_username: post.threads_accounts?.username || null,
        account_profile_picture: post.threads_accounts?.profile_picture_url || null
      })) || [];

      setPostHistory(formattedHistory);
    } catch (error) {
      console.error("Error loading post history:", error);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Visão geral da sua automação no Threads
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Calendar className="h-4 w-4" />
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Contas Conectadas",
              value: stats.accounts,
              icon: Users,
              description: "Contas do Threads conectadas",
              color: "text-blue-400",
              bg: "bg-blue-400/10"
            },
            {
              title: "Frases Cadastradas",
              value: stats.phrases,
              icon: MessageSquare,
              description: "Frases disponíveis para posts",
              color: "text-violet-400",
              bg: "bg-violet-400/10"
            },
            {
              title: "Posts Periódicos",
              value: stats.periodicPosts,
              icon: Calendar,
              description: "Automações configuradas",
              color: "text-emerald-400",
              bg: "bg-emerald-400/10"
            },
            {
              title: "Posts Hoje",
              value: stats.postsToday,
              icon: Sparkles,
              description: "Posts realizados hoje",
              color: "text-amber-400",
              bg: "bg-amber-400/10"
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="group hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 border-white/5 bg-white/5 backdrop-blur-2xl overflow-hidden relative group hover:border-white/10 transition-all duration-500">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-y-32 translate-x-32 group-hover:bg-primary/10 transition-all duration-500" />
            <CardHeader className="relative">
              <CardTitle className="text-2xl text-white">Bem-vindo ao AutoThreads!</CardTitle>
              <CardDescription className="text-white/60 text-base">
                Sua central de automação inteligente está pronta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { text: "Conectar Contas", icon: Users, path: "/accounts" },
                  { text: "Criar Frases", icon: MessageSquare, path: "/phrases" },
                  { text: "Agendar Posts", icon: Calendar, path: "/periodic-posts" }
                ].map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.text}
                      onClick={() => navigate(step.path)}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 cursor-pointer transition-all duration-300 hover:-translate-y-1 group/item">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors duration-300">
                        <Icon className="h-5 w-5 text-white group-hover/item:text-primary transition-colors" />
                      </div>
                      <span className="font-medium text-sm text-muted-foreground group-hover/item:text-white transition-colors">{step.text}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-black/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <MessageSquare className="h-5 w-5 text-primary" />
                Histórico Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {postHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Nenhum post realizado ainda</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {postHistory.map((post) => (
                    <div
                      key={post.id}
                      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200"
                    >
                      <div className="shrink-0 mt-1">
                        {post.account_profile_picture ? (
                          <img
                            src={post.account_profile_picture}
                            alt={post.account_username || "Avatar"}
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/10">
                            <Users className="h-4 w-4 text-white/60" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 line-clamp-2 leading-relaxed font-medium group-hover:text-primary transition-colors">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-medium text-white/40">
                            {post.account_username || "Desconhecido"}
                          </span>
                          <span className="text-[10px] text-white/20">•</span>
                          <span className="text-xs text-white/40 flex items-center gap-1">
                            {format(new Date(post.posted_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
