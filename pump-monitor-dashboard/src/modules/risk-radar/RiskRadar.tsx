import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  DollarSign,
  Calendar,
  Activity,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { FleetRiskMetrics } from "../../types";
import { getFleetRiskMetrics } from "../../services/ai/fleetIntelligence";

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  variant?: "default" | "warning" | "critical" | "success";
  className?: string;
}) {
  const variantStyles = {
    default: "from-primary/10 to-primary/5 border-primary/20",
    warning: "from-warning/10 to-warning/5 border-warning/20",
    critical: "from-destructive/10 to-destructive/5 border-destructive/20",
    success: "from-success/10 to-success/5 border-success/20",
  };

  const iconStyles = {
    default: "text-primary bg-primary/20",
    warning: "text-warning bg-warning/20",
    critical: "text-destructive bg-destructive/20",
    success: "text-success bg-success/20",
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("rounded-lg p-2", iconStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <TrendIcon
            className={cn(
              "h-3 w-3",
              trend === "up" && "text-destructive",
              trend === "down" && "text-success",
              trend === "stable" && "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              trend === "up" && "text-destructive",
              trend === "down" && "text-success",
              trend === "stable" && "text-muted-foreground"
            )}
          >
            {trendValue}
          </span>
        </div>
      )}
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent" />
    </div>
  );
}

function FleetRiskGauge({ score, trend }: { score: number; trend: string }) {
  const getColor = (score: number) => {
    if (score >= 75) return { color: "text-destructive", glow: "glow-destructive" };
    if (score >= 50) return { color: "text-warning", glow: "glow-warning" };
    return { color: "text-success", glow: "glow-success" };
  };

  const { color, glow } = getColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className={cn("relative", glow)}>
        <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn("transition-all duration-1000 ease-out", color)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold", color)}>{score}</span>
          <span className="text-xs text-muted-foreground">Risk Score</span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs">
        {trend === "worsening" ? (
          <>
            <TrendingUp className="h-3 w-3 text-destructive" />
            <span className="text-destructive">Worsening</span>
          </>
        ) : trend === "improving" ? (
          <>
            <TrendingDown className="h-3 w-3 text-success" />
            <span className="text-success">Improving</span>
          </>
        ) : (
          <>
            <Minus className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Stable</span>
          </>
        )}
      </div>
    </div>
  );
}

function MaintenanceLoadChart({
  data,
}: {
  data: FleetRiskMetrics["maintenanceLoadForecast"];
}) {
  const maxValue = Math.max(data.week1, data.week2, data.week3, data.week4);
  const weeks = [
    { label: "W1", value: data.week1 },
    { label: "W2", value: data.week2 },
    { label: "W3", value: data.week3 },
    { label: "W4", value: data.week4 },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Maintenance Load (Hours)
      </p>
      <div className="flex items-end gap-2 h-16">
        {weeks.map((week) => (
          <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all duration-500"
              style={{ height: `${(week.value / maxValue) * 100}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{week.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RiskRadar() {
  const [metrics, setMetrics] = useState<FleetRiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await getFleetRiskMetrics();
      setMetrics(data);
      setLoading(false);
    };
    loadMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="glass rounded-2xl p-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 gradient-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/20 p-2.5">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Risk Radar</h2>
            <p className="text-xs text-muted-foreground">
              Fleet-wide predictive intelligence
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Updated {new Date(metrics.lastUpdated).toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="col-span-2 md:col-span-1 flex items-center justify-center p-4 rounded-xl bg-gradient-to-br from-card to-muted/30 border">
          <FleetRiskGauge score={metrics.fleetRiskScore} trend={metrics.riskTrend} />
        </div>

        <MetricCard
          title="Predicted Failures"
          value={metrics.predictedFailures30Days}
          subtitle="Next 30 days"
          icon={AlertTriangle}
          variant={metrics.predictedFailures30Days > 1 ? "critical" : "warning"}
        />

        <MetricCard
          title="Assets at Risk"
          value={metrics.assetsTrendingWorse}
          subtitle="Trending worse"
          icon={Activity}
          trend="up"
          trendValue={`${metrics.riskTrendPercent}% this week`}
          variant={metrics.assetsTrendingWorse > 2 ? "warning" : "default"}
        />

        <MetricCard
          title="Downtime Exposure"
          value={`$${(metrics.estimatedDowntimeCost / 1000).toFixed(0)}K`}
          subtitle="Estimated cost"
          icon={DollarSign}
          variant={metrics.estimatedDowntimeCost > 100000 ? "critical" : "warning"}
        />

        <div className="p-4 rounded-xl bg-gradient-to-br from-card to-muted/30 border">
          <MaintenanceLoadChart data={metrics.maintenanceLoadForecast} />
        </div>

        <MetricCard
          title="Critical Assets"
          value={metrics.criticalAssets.length}
          subtitle="Require attention"
          icon={Calendar}
          variant={metrics.criticalAssets.length > 0 ? "critical" : "success"}
        />
      </div>
    </div>
  );
}
