import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "destructive";
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: SummaryCardProps) {
  const variantStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  variantStyles[variant]
                )}
              >
                {value}
              </p>
              {trend && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "rounded-lg p-3",
              variant === "default" && "bg-primary/10",
              variant === "success" && "bg-success/10",
              variant === "warning" && "bg-warning/10",
              variant === "destructive" && "bg-destructive/10"
            )}
          >
            <Icon className={cn("h-5 w-5", variantStyles[variant])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
