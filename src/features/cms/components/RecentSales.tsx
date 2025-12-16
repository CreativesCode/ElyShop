import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type RecentSaleItem = {
  id: string;
  name: string;
  subtitle?: string | null;
  amount: number;
};

function initials(name: string) {
  const cleaned = name.trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

export function RecentSales({ items }: { items: RecentSaleItem[] }) {
  return (
    <div className="space-y-8">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay ventas recientes.
        </p>
      ) : (
        items.map((sale) => (
          <div key={sale.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials(sale.name)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{sale.name}</p>
              {sale.subtitle ? (
                <p className="text-sm text-muted-foreground">{sale.subtitle}</p>
              ) : null}
            </div>
            <div className="ml-auto font-medium">
              +
              {sale.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              CUP
            </div>
          </div>
        ))
      )}
    </div>
  );
}
