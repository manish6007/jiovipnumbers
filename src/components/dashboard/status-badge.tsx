import { Badge } from "@/components/ui/badge";

const MAP: Record<string, "default" | "success" | "warning" | "destructive" | "info" | "secondary"> = {
  // orders
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "destructive",
  // listings
  approved: "success",
  rejected: "destructive",
  // numbers
  available: "success",
  reserved: "warning",
  sold: "secondary",
  paused: "secondary",
  // payments
  unpaid: "warning",
  awaiting_verification: "info",
  paid: "success",
  refunded: "secondary",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = MAP[status] ?? "secondary";
  const label = status.replace(/_/g, " ");
  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
}
