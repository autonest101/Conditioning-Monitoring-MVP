import { Badge } from "../ui/badge";
import type { PumpStatus } from "../../types";

interface StatusBadgeProps {
  status: PumpStatus;
  size?: "sm" | "default" | "lg";
}

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const variant =
    status === "Normal"
      ? "success"
      : status === "Warning"
      ? "warning"
      : "destructive";

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-2.5 py-0.5",
    lg: "text-sm px-3 py-1",
  };

  return (
    <Badge variant={variant} className={sizeClasses[size]}>
      {status}
    </Badge>
  );
}
