import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Plus,
  Tag,
} from "lucide-react";
import {
  mainPhotoPlaceholders,
  type Garment,
  type PurchaseBatchDetail,
} from "../domain/types";
import { formatDate, formatPercent, formatRate } from "./format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Money } from "@/components/nexo/Money";
import { StatusBadge } from "@/components/nexo/StatusBadge";
import { PhotoThumb } from "@/components/nexo/PhotoThumb";
import { ContextStrip } from "@/components/nexo/ContextStrip";
import { StepHeader } from "@/components/nexo/StepHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const evidenceLabels: Record<string, string> = {
  "evidence-ticket": "Ticket",
  "evidence-invoice": "Factura",
  "evidence-digital": "Digital",
};

type BatchDetailProps = {
  batch: PurchaseBatchDetail;
  onBack: () => void;
  onNewCartForBatch: () => void;
  onViewAcquiredStock: () => void;
};

export function BatchDetail({
  batch,
  onNewCartForBatch,
  onViewAcquiredStock,
}: BatchDetailProps) {
  const allGarments = batch.payments.flatMap((p) => p.garments);

  return (
    <section className="grid gap-5">
      <StepHeader
        title="Detalle de lote"
        subtitle={`${batch.storeName} · ${formatDate(batch.date)}`}
        actions={
          <>
            <Button variant="outline" onClick={onViewAcquiredStock}>
              Ver en inventario
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button variant="primary" onClick={onNewCartForBatch}>
              <Plus className="size-4" aria-hidden="true" />
              Nuevo pago
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-3">
        <StatusBadge tone="success">Confirmado</StatusBadge>
        <ContextStrip
          segments={[
            { label: "Moneda", value: batch.currency },
            { label: "Pagos", value: String(batch.paymentCount) },
            { label: "Prendas", value: String(batch.garmentCount) },
          ]}
        />
      </div>

      <Tabs defaultValue="payments" className="gap-4">
        <TabsList>
          <TabsTrigger value="payments">
            Pagos
            <Badge variant="neutral" className="ml-1">
              {batch.paymentCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="garments">
            Prendas
            <Badge variant="neutral" className="ml-1">
              {batch.garmentCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="grid gap-3">
          {batch.payments.map((payment, index) => {
            const totalsDiffer =
              Math.abs(payment.paidTotal - payment.expectedTotal) >= 0.001;
            return (
              <Card key={payment.id} className="gap-0">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">
                        Pago {index + 1} ·{" "}
                        <span className="text-muted-foreground">
                          {evidenceLabels[payment.evidence] ?? payment.evidence}
                        </span>
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <Money value={payment.paidTotal} currency={batch.currency} strong />
                      </p>
                    </div>
                    <StatusBadge tone={totalsDiffer ? "warning" : "success"}>
                      {totalsDiffer ? "Diferencia" : "Coincide"}
                    </StatusBadge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                    <Metric label="Esperado" value={<Money value={payment.expectedTotal} currency={batch.currency} />} />
                    <Metric label="Pagado" value={<Money value={payment.paidTotal} currency={batch.currency} />} />
                    <Metric label="Impuesto" value={formatPercent(payment.taxRate)} />
                    <Metric label="Tipo de cambio" value={formatRate(payment.exchangeRate)} />
                  </div>

                  {totalsDiffer && payment.differenceReasonId ? (
                    <Alert
                      reason={payment.differenceReasonId}
                      note={payment.differenceNote}
                    />
                  ) : totalsDiffer ? null : (
                    <p className="inline-flex items-center gap-1.5 text-sm text-success-ink">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      Los totales coinciden.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="garments">
          {allGarments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este lote no tiene prendas.
            </p>
          ) : (
            <GarmentTable garments={allGarments} currency={batch.currency} />
          )}
        </TabsContent>
      </Tabs>

      {/* Totales consolidados */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Totales consolidados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <ConsolidatedRow
            label="Total esperado"
            value={<Money value={batch.expectedTotal} currency={batch.currency} strong />}
          />
          <ConsolidatedRow
            label="Total pagado"
            value={<Money value={batch.paidTotal} currency={batch.currency} />}
          />
          <Separator />
          <ConsolidatedRow label="Pagos" value={String(batch.paymentCount)} />
          <ConsolidatedRow label="Prendas" value={String(batch.garmentCount)} />
        </CardContent>
      </Card>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ConsolidatedRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function Alert({ reason, note }: { reason: string; note: string | null }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-warning/25 bg-warning-soft p-3 text-sm text-warning-ink">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <span className="font-semibold">Motivo: </span>
        {reason}
        {note ? ` — ${note}` : ""}
      </span>
    </div>
  );
}

function GarmentTable({
  garments,
  currency,
}: {
  garments: Garment[];
  currency: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-semibold">Código</th>
            <th scope="col" className="px-4 py-2.5 font-semibold">Categoría</th>
            <th scope="col" className="px-4 py-2.5 text-right font-semibold">Costo</th>
            <th scope="col" className="px-4 py-2.5 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {garments.map((garment) => {
            const photo = mainPhotoPlaceholders.find(
              (p) => p.id === garment.mainPhotoPlaceholder,
            );
            return (
              <tr key={garment.id} className="transition-colors hover:bg-surface-2/40">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <PhotoThumb label={photo?.label} size="sm" />
                    <span className="font-semibold text-foreground">
                      {garment.internalCode}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  {garment.categoryReview ? (
                    <StatusBadge tone="warning">Revisión</StatusBadge>
                  ) : (
                    <Badge variant="neutral" className="gap-1">
                      <Tag className="size-3" aria-hidden="true" />
                      {garment.categoryName ?? "Sin categoría"}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Money value={garment.purchaseCost} currency={currency} />
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge tone="info">
                    {garment.inventoryState === "acquired_stock"
                      ? "Adquirida"
                      : garment.inventoryState}
                  </StatusBadge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
