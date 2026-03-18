import { useEffect, useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import type { AssetRiskTimeline, RiskTimelineStage } from "../../types";
import { getAssetRiskTimeline } from "../../services/ai/fleetIntelligence";
import { formatDate } from "../../lib/utils";

interface RiskTimelineProps {
  assetId: string;
  compact?: boolean;
}

function StageIcon({ stage, isActive }: { stage: RiskTimelineStage["stage"]; isActive: boolean }) {
  const iconClass = cn(
    "h-5 w-5 transition-all duration-300",
    isActive && "scale-125"
  );

  switch (stage) {
    case "normal":
      return <CheckCircle className={cn(iconClass, isActive ? "text-success" : "text-success/50")} />;
    case "warning":
      return <AlertTriangle className={cn(iconClass, isActive ? "text-warning" : "text-warning/50")} />;
    case "critical":
      return <AlertCircle className={cn(iconClass, isActive ? "text-destructive" : "text-destructive/50")} />;
    case "failure":
      return <XCircle className={cn(iconClass, isActive ? "text-destructive" : "text-destructive/50")} />;
  }
}

function TimelineStage({
  stage,
  isLast,
  predictedFailureWindow,
}: {
  stage: RiskTimelineStage;
  isLast: boolean;
  predictedFailureWindow?: { start: string; end: string };
}) {
  const stageColors = {
    normal: {
      bg: "bg-success/20",
      border: "border-success/30",
      text: "text-success",
      glow: "shadow-success/20",
    },
    warning: {
      bg: "bg-warning/20",
      border: "border-warning/30",
      text: "text-warning",
      glow: "shadow-warning/20",
    },
    critical: {
      bg: "bg-destructive/20",
      border: "border-destructive/30",
      text: "text-destructive",
      glow: "shadow-destructive/20",
    },
    failure: {
      bg: "bg-destructive/30",
      border: "border-destructive/50",
      text: "text-destructive",
      glow: "shadow-destructive/30",
    },
  };

  const colors = stageColors[stage.stage];
  const isPredicted = !stage.enteredAt && stage.predictedAt;
  const showFailureWindow = stage.stage === "failure" && predictedFailureWindow?.start;

  return (
    <div className="flex-1 relative">
      <div
        className={cn(
          "relative rounded-xl border p-4 transition-all duration-500",
          stage.isCurrentStage
            ? cn(colors.bg, colors.border, "shadow-lg", colors.glow)
            : "bg-muted/30 border-muted",
          isPredicted && "border-dashed opacity-70"
        )}
      >
        {stage.isCurrentStage && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <Badge variant="default" className="text-[10px] px-2 py-0">
              Current
            </Badge>
          </div>
        )}

        <div className="flex flex-col items-center text-center space-y-2">
          <div
            className={cn(
              "rounded-full p-2 transition-all duration-300",
              stage.isCurrentStage ? colors.bg : "bg-muted"
            )}
          >
            <StageIcon stage={stage.stage} isActive={stage.isCurrentStage} />
          </div>

          <div>
            <p
              className={cn(
                "font-semibold text-sm",
                stage.isCurrentStage ? colors.text : "text-muted-foreground"
              )}
            >
              {stage.label}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {stage.description}
            </p>
          </div>

          <div className="text-[10px] text-muted-foreground">
            {stage.enteredAt ? (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(stage.enteredAt)}
              </span>
            ) : stage.predictedAt ? (
              <span className="flex items-center gap-1 text-warning">
                <Clock className="h-3 w-3" />
                Est. {formatDate(stage.predictedAt)}
              </span>
            ) : null}
          </div>

          {showFailureWindow && (
            <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-[10px]">
              <p className="text-destructive font-medium">Failure Window</p>
              <p className="text-muted-foreground">
                {formatDate(predictedFailureWindow!.start)} - {formatDate(predictedFailureWindow!.end)}
              </p>
            </div>
          )}
        </div>
      </div>

      {!isLast && (
        <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-10">
          <ChevronRight className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export function RiskTimeline({ assetId, compact = false }: RiskTimelineProps) {
  const [timeline, setTimeline] = useState<AssetRiskTimeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimeline = async () => {
      setLoading(true);
      const data = await getAssetRiskTimeline(assetId);
      setTimeline(data);
      setLoading(false);
    };
    loadTimeline();
  }, [assetId]);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-6" />
        <div className="flex gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1 h-40 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!timeline) return null;

  const accelerationColor =
    timeline.riskAcceleration > 15
      ? "text-destructive"
      : timeline.riskAcceleration > 0
      ? "text-warning"
      : "text-success";

  if (compact) {
    const currentStageIndex = timeline.stages.findIndex((s) => s.isCurrentStage);
    const progress = ((currentStageIndex + 1) / timeline.stages.length) * 100;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Risk Progression</span>
          <span className="font-medium">{timeline.daysToFailure} days to failure</span>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
              timeline.currentStage === "normal" && "bg-success",
              timeline.currentStage === "warning" && "bg-warning",
              timeline.currentStage === "critical" && "bg-destructive",
              timeline.currentStage === "failure" && "bg-destructive"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {timeline.stages.map((stage) => (
            <span
              key={stage.stage}
              className={cn(stage.isCurrentStage && "font-bold text-foreground")}
            >
              {stage.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 gradient-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{timeline.assetName}</h3>
          <p className="text-sm text-muted-foreground">Risk Timeline Progression</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold">{timeline.daysToFailure}</p>
            <p className="text-xs text-muted-foreground">Days to Failure</p>
          </div>
          <div className="text-right">
            <div className={cn("flex items-center gap-1", accelerationColor)}>
              <TrendingUp className="h-4 w-4" />
              <span className="text-lg font-bold">
                {timeline.riskAcceleration > 0 ? "+" : ""}
                {timeline.riskAcceleration}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Risk Acceleration</p>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {timeline.stages.map((stage, index) => (
          <TimelineStage
            key={stage.stage}
            stage={stage}
            isLast={index === timeline.stages.length - 1}
            predictedFailureWindow={
              stage.stage === "failure" ? timeline.predictedFailureWindow : undefined
            }
          />
        ))}
      </div>

      {timeline.predictedFailureWindow.start && (
        <div className="mt-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium text-sm">Predicted Failure Window</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on current degradation patterns, failure is predicted between{" "}
            <span className="font-medium text-foreground">
              {formatDate(timeline.predictedFailureWindow.start)}
            </span>{" "}
            and{" "}
            <span className="font-medium text-foreground">
              {formatDate(timeline.predictedFailureWindow.end)}
            </span>
            . Immediate action recommended to prevent unplanned downtime.
          </p>
        </div>
      )}
    </div>
  );
}
