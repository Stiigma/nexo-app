import { Loader2, Gift } from "lucide-react";
import { useGiveaways } from "../hooks/use-giveaways";
import { GiveawayCard } from "../components/GiveawayCard";
import { UserEvidencePanel } from "../components/UserEvidencePanel";

export function GiveawaysPage() {
  const { data: giveaways, isLoading, error } = useGiveaways();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Error al cargar giveaways
      </div>
    );
  }

  const activeGiveaways = giveaways?.filter((g) => g.isActive) ?? [];
  const pastGiveaways = giveaways?.filter((g) => !g.isActive) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Giveaways</h2>
        <p className="text-sm text-muted-foreground">
          Sorteos activos en Instagram
        </p>
      </div>

      {activeGiveaways.length > 0 && (
        <section>
          <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Activos
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeGiveaways.map((g) => (
              <GiveawayCard key={g.id} giveaway={g} />
            ))}
          </div>
        </section>
      )}

      {pastGiveaways.length > 0 && (
        <section>
          <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Finalizados
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {pastGiveaways.map((g) => (
              <GiveawayCard key={g.id} giveaway={g} />
            ))}
          </div>
        </section>
      )}

      {(!giveaways || giveaways.length === 0) && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Gift className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No hay giveaways configurados
          </p>
        </div>
      )}

      <div className="border-t border-border pt-8">
        <UserEvidencePanel />
      </div>
    </div>
  );
}
