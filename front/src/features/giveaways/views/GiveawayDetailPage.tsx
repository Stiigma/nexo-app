import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Calendar, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { useGiveawayDetail } from "../hooks/use-giveaways";
import { ParticipantTable } from "../components/ParticipantTable";
import { PenaltyPanel } from "../components/PenaltyPanel";

export function GiveawayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGiveawayDetail(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Error al cargar el giveaway
      </div>
    );
  }

  const { giveaway, participants } = data;

  const validParticipants = participants.filter((p) => p.comments.some((comment) => comment.isValid) && p.isActive);
  const totalTickets = validParticipants.reduce((sum, participant) => sum + participant.totalTickets, 0);
  const totalComments = participants.reduce((s, p) => s + p.comments.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/giveaways")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">{giveaway.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{giveaway.prizeDescription}</p>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            ${giveaway.prizeValue.toLocaleString("es-MX")} MXN
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-6 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ganador:</span>
            <span className="font-medium text-foreground">
              {new Date(giveaway.winnerDate).toLocaleDateString("es-MX")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Post ID:</span>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              {giveaway.postId}
            </code>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{validParticipants.length}</p>
          <p className="text-xs text-muted-foreground">Participantes</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalComments}</p>
          <p className="text-xs text-muted-foreground">Comentarios</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalTickets}</p>
          <p className="text-xs text-muted-foreground">Boletos totales</p>
        </div>
      </div>

      <ParticipantTable
        giveawayId={giveaway.id}
        participants={participants}
        isLoading={isLoading}
      />
      <PenaltyPanel giveawayId={giveaway.id} participants={participants} />
    </div>
  );
}
