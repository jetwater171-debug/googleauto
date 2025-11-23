import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar, CheckCircle, ChevronRight, Megaphone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Campaign {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  automation_count?: number;
}

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      await loadCampaigns();
    };

    checkAuth();
  }, [navigate]);

  const loadCampaigns = async () => {
    try {
      const { data: campaignsData, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const campaignsWithCounts = await Promise.all(
        (campaignsData || []).map(async (campaign) => {
          const { count } = await supabase
            .from("periodic_posts")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id);

          return {
            ...campaign,
            automation_count: count || 0,
          };
        })
      );

      setCampaigns(campaignsWithCounts);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Digite um nome para a campanha",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Selecione as datas de início e fim",
      });
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast({
        variant: "destructive",
        title: "A data de término deve ser após a data de início",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("campaigns").insert({
        user_id: user.id,
        title: title.trim(),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        status: 'active',
      });

      if (error) throw error;

      toast({
        title: "Campanha criada!",
        description: "A campanha foi criada com sucesso.",
      });

      setOpen(false);
      resetForm();
      loadCampaigns();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar campanha",
        description: error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Campanha removida",
        description: "A campanha foi excluída com sucesso.",
      });

      loadCampaigns();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover campanha",
        description: error.message,
      });
    }
  };

  const handleEndCampaign = async (id: string) => {
    try {
      const { error: campaignError } = await supabase
        .from("campaigns")
        .update({ status: 'ended' })
        .eq("id", id);

      if (campaignError) throw campaignError;

      const { error: postsError } = await supabase
        .from("periodic_posts")
        .update({ is_active: false })
        .eq("campaign_id", id);

      if (postsError) throw postsError;

      toast({
        title: "Campanha encerrada",
        description: "Todas as automações foram pausadas.",
      });

      loadCampaigns();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao encerrar campanha",
        description: error.message,
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
  };

  const getCampaignStatus = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);

    if (campaign.status === 'ended') {
      return { label: 'Encerrada', variant: 'secondary' as const };
    }

    if (now < start) {
      return { label: 'Agendada', variant: 'default' as const };
    }

    if (now > end) {
      return { label: 'Expirada', variant: 'destructive' as const };
    }

    return { label: 'Ativa', variant: 'default' as const };
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Campanhas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie grupos de automações com datas de início e fim
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-black/90 border-white/10 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Nova Campanha</DialogTitle>
                <DialogDescription>
                  Crie uma campanha para agrupar automações
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-base font-semibold">Nome da Campanha</Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="Ex: Black Friday 2024"
                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="startDate" className="text-base font-semibold">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/10 focus:border-primary/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="endDate" className="text-base font-semibold">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/10 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Campanha</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {campaigns.map((campaign) => {
            const status = getCampaignStatus(campaign);

            return (
              <Card key={campaign.id} className="border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2 flex-wrap text-white group-hover:text-primary transition-colors">
                        {campaign.title}
                        <Badge variant={status.variant} className="ml-2">
                          {status.label}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="space-y-1.5">
                        <div className="flex items-center gap-2 text-muted-foreground/80">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {format(new Date(campaign.start_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            {" → "}
                            {format(new Date(campaign.end_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-white/60">
                          {campaign.automation_count} {campaign.automation_count === 1 ? 'automação' : 'automações'}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                        className="bg-transparent border-white/20 hover:bg-white/10"
                      >
                        Gerenciar
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                      {campaign.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEndCampaign(campaign.id)}
                          className="bg-transparent border-white/20 hover:bg-white/10"
                        >
                          Encerrar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(campaign.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {campaigns.length === 0 && !loading && (
          <Card className="border-white/10 bg-white/5 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Megaphone className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-4 text-lg">
                Nenhuma campanha criada ainda
              </p>
              <Button onClick={() => setOpen(true)} size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Campanha
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Campaigns;
