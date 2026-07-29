import { useNavigate } from "react-router-dom";
import { Gift, Users, MessageSquareText, Ticket, ArrowRight } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import type { Giveaway } from "../types";

interface Props {
  giveaway: Giveaway;
}

export function GiveawayCard({ giveaway }: Props) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{giveaway.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{giveaway.prizeDescription}</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          ${giveaway.prizeValue.toLocaleString("es-MX")} MXN
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Participantes</span>
          <span className="ml-auto font-semibold text-foreground">{giveaway.participantCount}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Comentarios</span>
          <span className="ml-auto font-semibold text-foreground">{giveaway.commentCount}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Ticket className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Boletos</span>
          <span className="ml-auto font-semibold text-foreground">{giveaway.totalTickets}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          Ganador: {new Date(giveaway.winnerDate).toLocaleDateString("es-MX")}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/giveaways/${giveaway.id}`)}
        >
          Ver detalle
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
