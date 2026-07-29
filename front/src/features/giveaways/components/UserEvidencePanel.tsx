import { useState } from "react";
import { Search, Loader2, User, Ticket, BadgeCheck, BadgeX, Tag, Gift, MessageSquareText } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { useUserActivity } from "../hooks/use-giveaways";
import type { Comment } from "../types";

export function UserEvidencePanel() {
  const [username, setUsername] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useUserActivity(search);

  function handleSearch() {
    const clean = username.trim().replace(/^@/, "");
    setSearch(clean);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Evidencia por usuario
        </h3>
        <p className="text-sm text-muted-foreground">
          Busca un @username para ver todos sus comentarios, tags y boletos.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            @
          </span>
          <input
            type="text"
            placeholder="username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-border bg-background py-2 pl-14 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={!username.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          Buscar
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {data && !data.giveaways.length && search && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          <User className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          No se encontraron registros para @{search}
        </div>
      )}

      {data && data.giveaways.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">@{data.username}</span>
            <span className="text-muted-foreground">
              {data.giveaways.reduce((s, g) => s + g.comments.length, 0)} comentarios
            </span>
            <span className="text-muted-foreground">
              {data.giveaways.reduce((s, g) => s + g.totalTickets, 0)} boletos totales
            </span>
          </div>

          {data.giveaways.map((g) => {
            const valid = g.comments.filter((c) => c.isValid);
            const invalid = g.comments.filter((c) => !c.isValid);

            return (
              <div
                key={g.giveawayId}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground text-sm">
                      {g.giveawayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Ticket className="h-3 w-3" />
                      {g.totalTickets} boletos
                    </span>
                    {g.verifiedStoryShare ? (
                      <Badge variant="success">+2 story</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {g.comments.map((c) => (
                    <CommentEvidenceRow key={c.id} comment={c} />
                  ))}
                </div>

                <div className="flex items-center gap-4 border-t border-border bg-muted/10 px-4 py-2 text-xs text-muted-foreground">
                  <span>
                    <span className="text-green-600 font-medium">{valid.length}</span> válidos
                  </span>
                  <span>
                    <span className="text-destructive font-medium">{invalid.length}</span> inválidos
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CommentEvidenceRow({ comment }: { comment: Comment }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 text-xs">
      {comment.isValid ? (
        <BadgeCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
      ) : (
        <BadgeX className="h-3.5 w-3.5 text-destructive shrink-0" />
      )}

      <div className="flex items-center gap-2 min-w-0 flex-1">
        {comment.taggedUsername ? (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Tag className="h-3 w-3 shrink-0" />
            <span className="font-medium text-foreground">@{comment.taggedUsername}</span>
          </span>
        ) : (
          <span className="text-muted-foreground italic">sin tag</span>
        )}
      </div>

      {comment.isValid ? (
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="success" className="text-[10px] px-1.5 py-0">
            +1 base
          </Badge>
          {comment.followBonus > 0 ? (
            <Badge variant="success" className="text-[10px] px-1.5 py-0">
              +{comment.followBonus} follow
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground">— follow</span>
          )}
        </div>
      ) : (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">
          {comment.invalidReason === "NO_TAG"
            ? "Sin tag"
            : comment.invalidReason === "MULTI_TAG"
              ? "Multi tag"
              : comment.invalidReason === "SELF_TAG"
                ? "Self tag"
                : comment.invalidReason === "DUPLICATE_TAG"
                  ? "Repetido"
                : comment.invalidReason === "NO_FOLLOW"
                  ? "No follow"
                : "Inválido"}
        </Badge>
      )}
    </div>
  );
}
