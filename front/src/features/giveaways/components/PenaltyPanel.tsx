import { useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { useCreateParticipantPenalty, useRevokeParticipantPenalty } from "../hooks/use-giveaways";
import type { Participant, ParticipantPenalty } from "../types";

const reasons: Record<string, string> = {
  NO_FOLLOW: "No sigue a @nexo.ens",
  RULE_VIOLATION: "Incumplimiento de reglas",
  FAKE_OR_DUPLICATE_ACCOUNT: "Cuenta falsa o duplicada",
  INELIGIBLE_LOCATION: "Ubicación no elegible",
  PRE_EXISTING_FOLLOWER: "Ya seguía antes del giveaway",
  MANUAL_OTHER: "Otro motivo manual",
};

export function PenaltyPanel({ giveawayId, participants }: { giveawayId: string; participants: Participant[] }) {
  const [participantId, setParticipantId] = useState("");
  const [commentId, setCommentId] = useState("");
  const [reason, setReason] = useState("PRE_EXISTING_FOLLOWER");
  const [note, setNote] = useState("");
  const createPenalty = useCreateParticipantPenalty();
  const revokePenalty = useRevokeParticipantPenalty();
  const tagged = participants.filter((participant) => participant.evidenceTags.some((tag) => tag.reason !== "PRE_EXISTING_FOLLOWER"));
  const inactiveBonuses = participants.flatMap((participant) =>
    participant.evidenceTags
      .filter((tag) => tag.reason === "PRE_EXISTING_FOLLOWER")
      .map((tag) => ({ participant, tag })),
  );
  const tagCount = participants.reduce((total, participant) => total + participant.evidenceTags.length, 0);
  const candidates = participants;
  const selectedParticipant = participants.find((participant) => participant.id === participantId);
  const commentCandidates = selectedParticipant?.comments.filter((comment) => comment.isValid && comment.taggedUsername) ?? [];

  async function submitPenalty(event: React.FormEvent) {
    event.preventDefault();
    if (!participantId || !note.trim() || (reason === "PRE_EXISTING_FOLLOWER" && !commentId)) {
      toast.error("Selecciona participante, tag y escribe la evidencia.");
      return;
    }
    try {
      await createPenalty.mutateAsync({
        giveawayId,
        participantId,
        commentId: reason === "PRE_EXISTING_FOLLOWER" ? commentId : undefined,
        reason,
        note: note.trim(),
      });
      setParticipantId("");
      setCommentId("");
      setNote("");
      toast.success("Tag de evidencia agregado; los boletos no cambiaron.");
    } catch {
      toast.error("No se pudo aplicar la penalización.");
    }
  }

  async function revoke(participant: Participant, tag: ParticipantPenalty) {
    const note = window.prompt("Motivo para revocar la penalización:");
    if (!note?.trim()) return;
    try {
      await revokePenalty.mutateAsync({
        giveawayId,
        participantId: participant.id,
        penaltyId: tag.id,
        note: note.trim(),
      });
      toast.success("Tag de evidencia retirado; los boletos no cambiaron.");
    } catch {
      toast.error("No se pudo revocar la penalización.");
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="font-semibold text-foreground">Tags de validación</h3>
            <p className="text-xs text-muted-foreground">Evidencia por username. No modifica boletos ni elegibilidad.</p>
          </div>
        </div>
        <Badge variant="secondary">{tagCount}</Badge>
      </div>

      <form onSubmit={submitPenalty} className="grid gap-2 rounded-lg border border-border bg-card p-3 md:grid-cols-[1fr_1fr_1fr_2fr_auto]">
        <select value={participantId} onChange={(event) => { setParticipantId(event.target.value); setCommentId(""); }} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar participante</option>
          {candidates.map((participant) => <option key={participant.id} value={participant.id}>@{participant.instagramUsername}</option>)}
        </select>
        <select value={reason} onChange={(event) => setReason(event.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          {Object.entries(reasons).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={commentId} onChange={(event) => setCommentId(event.target.value)} disabled={reason !== "PRE_EXISTING_FOLLOWER"} className="rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50">
          <option value="">Seleccionar tag</option>
          {commentCandidates.map((comment) => <option key={comment.id} value={comment.id}>@{comment.taggedUsername}</option>)}
        </select>
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Evidencia o nota obligatoria" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <Button type="submit" variant="outline" disabled={createPenalty.isPending}>Agregar tag</Button>
      </form>

      {inactiveBonuses.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Bonos inactivos</h4>
            <Badge variant="secondary">{inactiveBonuses.length}</Badge>
          </div>
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {inactiveBonuses.map(({ participant, tag }) => (
              <div key={tag.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
                <span className="font-medium">@{participant.instagramUsername}</span>
                <span className="text-muted-foreground">mencionó a</span>
                <span className="font-medium">@{tag.taggedUsername}</span>
                <Badge variant="secondary">Sin +3: seguidor previo</Badge>
                <span className="min-w-48 flex-1 text-muted-foreground">{tag.note}</span>
                <Button size="sm" variant="outline" onClick={() => revoke(participant, tag)} disabled={revokePenalty.isPending}>
                  <RotateCcw className="mr-2 h-3.5 w-3.5" /> Retirar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tagged.length > 0 && (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {tagged.flatMap((participant) => participant.evidenceTags.filter((tag) => tag.reason !== "PRE_EXISTING_FOLLOWER").map((tag) => (
            <div key={tag.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
              <span className="font-medium">@{participant.instagramUsername}</span>
              <Badge variant="secondary">{reasons[tag.reason] ?? tag.reason}</Badge>
              <span className="min-w-48 flex-1 text-muted-foreground">{tag.note}</span>
              <span className="text-xs text-muted-foreground">{new Date(tag.appliedAt).toLocaleString("es-MX")}</span>
              <Button size="sm" variant="outline" onClick={() => revoke(participant, tag)} disabled={revokePenalty.isPending}>
                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Retirar
              </Button>
            </div>
          )))}
        </div>
      )}
    </section>
  );
}
