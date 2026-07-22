import { MoreHorizontal, Pencil, Trash2, Power } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/common/components/ui/table";
import { Badge } from "@/common/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/common/components/ui/dropdown-menu";
import { cn } from "@/common/lib/utils";
import type { CatConfig, CatEntity } from "../types/catalog-entity";

interface CatalogDataTableProps<T extends CatEntity> {
  config: CatConfig<T>;
  data: T[];
  onEdit: (entity: T) => void;
  onDelete: (entity: T) => void;
  onToggle: (entity: T) => void;
}

export function CatalogDataTable<T extends CatEntity>({
  config,
  data,
  onEdit,
  onDelete,
  onToggle,
}: CatalogDataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {config.columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(col.hideOnMobile && "hidden sm:table-cell")}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </TableHead>
            ))}
            <TableHead className="w-[90px]">Activo</TableHead>
            <TableHead className="w-[60px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {config.columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(col.hideOnMobile && "hidden sm:table-cell")}
                >
                  {col.render(row)}
                </TableCell>
              ))}
              <TableCell>
                <button
                  type="button"
                  onClick={() => onToggle(row)}
                  className="rounded-md transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`${row.active ? "Desactivar" : "Activar"} ${config.singular}`}
                >
                  <Badge variant={row.active ? "success" : "muted"}>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        row.active ? "bg-success" : "bg-muted-foreground"
                      )}
                    />
                    {row.active ? "Sí" : "No"}
                  </Badge>
                </button>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Acciones para ${config.singular}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(row)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggle(row)}>
                      <Power className="h-4 w-4" />
                      {row.active ? "Desactivar" : "Activar"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
