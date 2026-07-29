import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { useVerifyFollow, useVerifyStoryShare, useSyncGiveaway, useToggleParticipantActive, useVerifyFollows } from "../hooks/use-giveaways";
import type { Participant, Comment } from "../types";

interface Props {
  giveawayId: string;
  participants: Participant[];
  isLoading: boolean;
}

export function ParticipantTable({ giveawayId, participants, isLoading }: Props) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const verifyFollow = useVerifyFollow();
  const verifyStory = useVerifyStoryShare();
  const syncMutation = useSyncGiveaway();
  const toggleActive = useToggleParticipantActive();
  const verifyFollows = useVerifyFollows();

  const filtered = search
    ? participants.filter((p) =>
        p.instagramUsername.toLowerCase().includes(search.toLowerCase()),
      )
    : participants;

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleVerifyFollow(
    commentId: string,
    current: boolean,
  ) {
    try {
      await verifyFollow.mutateAsync({
        giveawayId,
        commentId,
        verified: !current,
      });
      toast.success(current ? "Follow bonus removido" : "+3 follow bonus activado");
    } catch {
      toast.error("Error al verificar follow");
    }
  }

  async function handleVerifyStory(participantId: string, current: boolean) {
    try {
      await verifyStory.mutateAsync({
        giveawayId,
        participantId,
        verified: !current,
      });
      toast.success(current ? "Story bonus removido" : "+2 story bonus activado");
    } catch {
      toast.error("Error al verificar story");
    }
  }

  async function handleToggleActive(participantId: string, current: boolean) {
    try {
      await toggleActive.mutateAsync({
        giveawayId,
        participantId,
        isActive: !current,
      });
      toast.success(!current ? "Participante activado" : "Participante desactivado");
    } catch {
      toast.error("Error al cambiar estado");
    }
  }

  async function handleSync() {
    try {
      const result = await syncMutation.mutateAsync(giveawayId);
      toast.success(
        `Sync completado: ${result.validComments} válidos, ${result.invalidComments} inválidos`,
      );
    } catch {
      toast.error("Error al sincronizar");
    }
  }

  async function handleVerifyFollows() {
    try {
      const result = await verifyFollows.mutateAsync(giveawayId);
      toast.success(
        `Verificación: ${result.commenterInvalid} no follow, ${result.taggedFollowBonus} +3 bonus`,
      );
    } catch {
      toast.error("Error al verificar follows");
    }
  }

  const validParticipants = filtered.filter((p) => p.comments.some((comment) => comment.isValid) && p.isActive);
  const totalTickets = validParticipants.reduce((sum, participant) => sum + participant.totalTickets, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar participante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncMutation.isPending}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`}
          />
          Sync
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleVerifyFollows}
          disabled={verifyFollows.isPending}
        >
          <Check
            className={`mr-2 h-4 w-4 ${verifyFollows.isPending ? "animate-spin" : ""}`}
          />
          Verify Follows
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{validParticipants.length}</strong> participantes
        </span>
        <span>
          <strong className="text-foreground">{totalTickets}</strong> boletos totales
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : validParticipants.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          {search
            ? "No se encontraron participantes con ese nombre"
            : "No hay participantes. Sincroniza los comentarios de Instagram."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Usuario
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Tags
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Base
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  +3 Follow
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  +2 Story
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Total
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Activo
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {validParticipants.map((p) => {
                const baseTickets = p.comments.filter((c) => c.isValid).length;
                const followBonus = p.comments
                  .filter((c) => c.isValid)
                  .reduce((s, c) => s + c.followBonus, 0);
                const isExpanded = expanded.has(p.id);

                return (
                  <>
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        @{p.instagramUsername}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {p.tagCount}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {baseTickets}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {followBonus > 0 ? (
                          <span className="text-green-600">+{followBonus}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {p.verifiedStoryShare ? (
                            <span className="text-green-600">+2</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleVerifyStory(p.id, p.verifiedStoryShare)}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs transition-colors ${
                              p.verifiedStoryShare
                                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                            title={
                              p.verifiedStoryShare
                                ? "Remover story bonus"
                                : "Activar +2 story"
                            }
                          >
                            {p.verifiedStoryShare ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {p.totalTickets}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p.id, p.isActive)}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs transition-colors ${
                            p.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                          title={p.isActive ? "Desactivar participante" : "Activar participante"}
                        >
                          {p.isActive ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExpand(p.id)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${p.id}-comments`}>
                        <td colSpan={8} className="bg-muted/20 px-4 py-3">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Comentarios
                            </p>
                            {p.comments.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Sin comentarios
                              </p>
                            ) : (
                              <div className="space-y-1">
                                {p.comments.map((c) => (
                                  <CommentRow
                                    key={c.id}
                                    comment={c}
                                    giveawayId={giveawayId}
                                    onToggleFollow={handleVerifyFollow}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CommentRow({
  comment,
  giveawayId,
  onToggleFollow,
}: {
  comment: Comment;
  giveawayId: string;
  onToggleFollow: (commentId: string, current: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-xs">
      <span className="min-w-[100px] text-muted-foreground">
        → @{comment.taggedUsername ?? "sin tag"}
      </span>

      {comment.isValid ? (
        <>
          <Badge variant="success" className="text-[10px]">
            +1 base
          </Badge>
          <button
            type="button"
            onClick={() => onToggleFollow(comment.id, comment.verifiedFollow)}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
              comment.verifiedFollow
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {comment.followBonus > 0
              ? "✓ +3 follow"
              : comment.verifiedFollow
                ? "Verificado sin bono"
                : "— +3 follow"}
          </button>
        </>
      ) : (
        <Badge variant="destructive" className="text-[10px]">
          {comment.invalidReason === "NO_TAG"
            ? "Sin tag"
            : comment.invalidReason === "MULTI_TAG"
              ? "Multi tag"
              : comment.invalidReason === "SELF_TAG"
                ? "Self tag"
                : comment.invalidReason === "DUPLICATE_TAG"
                  ? "Tag repetido"
                   : comment.invalidReason === "NO_FOLLOW"
                     ? "No sigue a @nexo.ens"
                     : "Inválido"}
        </Badge>
      )}
    </div>
  );
}
