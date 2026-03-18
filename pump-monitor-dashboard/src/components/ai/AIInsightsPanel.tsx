import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";
import { analyzeWithAI } from "../../services/aiEngine";
import type {
  AIInsights,
  FailurePrediction,
  AIAnalysisInput,
  MaintenanceUrgency,
  AISeverity,
} from "../../types";
import {
  Brain,
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield,
  Wrench,
  Activity,
  Thermometer,
  Target,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface AIInsightsPanelProps {
  input: AIAnalysisInput | null;
  compact?: boolean;
}

function RiskGauge({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return "text-destructive";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-warning";
    return "text-success";
  };

  const getBgColor = (score: number) => {
    if (score >= 80) return "from-destructive/20 to-destructive/5";
    if (score >= 60) return "from-orange-500/20 to-orange-500/5";
    if (score >= 40) return "from-warning/20 to-warning/5";
    return "from-success/20 to-success/5";
  };

  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-40 h-20 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 rounded-t-full bg-gradient-to-b",
            getBgColor(score)
          )}
        />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
        >
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 126} 126`}
            className={getColor(score)}
          />
        </svg>
        <div
          className="absolute bottom-0 left-1/2 w-1 h-16 origin-bottom transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className={cn("w-1 h-12 rounded-full", getColor(score).replace("text-", "bg-"))} />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-card border-2 border-muted" />
      </div>
      <div className="mt-2 text-center">
        <span className={cn("text-3xl font-bold", getColor(score))}>{score}</span>
        <span className="text-sm text-muted-foreground ml-1">/ 100</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">Overall Risk Score</p>
    </div>
  );
}

function UrgencyIndicator({ urgency }: { urgency: MaintenanceUrgency }) {
  const config: Record<
    MaintenanceUrgency,
    { color: string; bgColor: string; label: string; pulse: boolean }
  > = {
    Immediate: {
      color: "text-destructive",
      bgColor: "bg-destructive",
      label: "Immediate Action Required",
      pulse: true,
    },
    Urgent: {
      color: "text-orange-500",
      bgColor: "bg-orange-500",
      label: "Urgent Maintenance Needed",
      pulse: true,
    },
    Soon: {
      color: "text-warning",
      bgColor: "bg-warning",
      label: "Schedule Maintenance Soon",
      pulse: false,
    },
    Normal: {
      color: "text-success",
      bgColor: "bg-success",
      label: "Normal Operations",
      pulse: false,
    },
  };

  const { color, bgColor, label, pulse } = config[urgency];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
      <div className="relative">
        <div className={cn("w-4 h-4 rounded-full", bgColor)} />
        {pulse && (
          <div
            className={cn(
              "absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-75",
              bgColor
            )}
          />
        )}
      </div>
      <div>
        <p className={cn("font-medium", color)}>{urgency}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: FailurePrediction }) {
  const getSeverityColor = (severity: AISeverity) => {
    switch (severity) {
      case "Critical":
        return "destructive";
      case "High":
        return "destructive";
      case "Medium":
        return "warning";
      case "Low":
        return "secondary";
    }
  };

  const getProgressColor = (probability: number) => {
    if (probability >= 70) return "bg-destructive";
    if (probability >= 50) return "bg-orange-500";
    if (probability >= 30) return "bg-warning";
    return "bg-success";
  };

  const getIcon = (failureType: string) => {
    switch (failureType) {
      case "Bearing Failure":
        return Activity;
      case "Overheating":
        return Thermometer;
      case "Imbalance":
        return Target;
      case "Cavitation":
        return Zap;
      case "Misalignment":
        return TrendingUp;
      default:
        return AlertTriangle;
    }
  };

  const Icon = getIcon(prediction.failureType);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 transition-all hover:shadow-md hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{prediction.failureType}</h4>
            <p className="text-xs text-muted-foreground">
              Risk Score: {prediction.riskScore}
            </p>
          </div>
        </div>
        <Badge variant={getSeverityColor(prediction.severity)}>
          {prediction.severity}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Probability</span>
          <span className="font-medium">{prediction.probability}%</span>
        </div>
        <Progress
          value={prediction.probability}
          indicatorClassName={getProgressColor(prediction.probability)}
        />
      </div>

      <div className="pt-2 border-t space-y-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">{prediction.rootCause}</p>
        </div>
        <div className="flex items-start gap-2">
          <Wrench className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-xs">{prediction.recommendedAction}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>TAT: {prediction.estimatedTAT}</span>
        </div>
        <div className="flex items-center gap-1 text-warning">
          <TrendingUp className="h-3 w-3" />
          <span>{prediction.forecastDaysToFailure} days to failure</span>
        </div>
      </div>
    </div>
  );
}

function ForecastCard({ predictions }: { predictions: FailurePrediction[] }) {
  if (predictions.length === 0) return null;

  const minDays = Math.min(...predictions.map((p) => p.forecastDaysToFailure));
  const criticalPrediction = predictions.find(
    (p) => p.forecastDaysToFailure === minDays
  );

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return "text-destructive";
    if (days <= 14) return "text-orange-500";
    if (days <= 30) return "text-warning";
    return "text-success";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Failure Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">
            Estimated Days to Critical Failure
          </p>
          <p className={cn("text-5xl font-bold", getUrgencyColor(minDays))}>
            {minDays}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {criticalPrediction?.failureType}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span>&lt; 7 days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>7-14 days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span>14-30 days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>&gt; 30 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AIInsightsPanel({ input, compact = false }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input) {
      setInsights(null);
      return;
    }

    const runAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await analyzeWithAI(input);
        setInsights(result);
      } catch (err) {
        setError("Failed to analyze pump data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [input]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle className="text-lg">AI Predictive Maintenance</CardTitle>
          </div>
          <CardDescription>Analyzing pump data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-24 w-40" />
          </div>
          <Skeleton className="h-20" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">AI Predictive Maintenance</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">AI Predictive Maintenance</CardTitle>
          </div>
          <CardDescription>Select a pump to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No pump selected for analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-medium">
                AI Insights
              </CardTitle>
            </div>
            <UrgencyIndicator urgency={insights.maintenanceUrgency} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <RiskGauge score={insights.overallRiskScore} />
            <div className="flex-1 space-y-2">
              <p className="text-sm">{insights.summary}</p>
              {insights.predictions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {insights.predictions.slice(0, 3).map((p) => (
                    <Badge
                      key={p.failureType}
                      variant="outline"
                      className="text-xs"
                    >
                      {p.failureType}: {p.probability}%
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">
                AI Predictive Maintenance Insights
              </CardTitle>
              <CardDescription>
                Powered by rule-based reliability analysis engine
              </CardDescription>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Last analyzed:{" "}
            {new Date(insights.analyzedAt).toLocaleTimeString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-gradient-to-b from-card to-muted/20">
            <RiskGauge score={insights.overallRiskScore} />
          </div>

          <div className="space-y-4">
            <UrgencyIndicator urgency={insights.maintenanceUrgency} />
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Analysis Summary</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insights.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <ForecastCard predictions={insights.predictions} />
        </div>

        {insights.predictions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Detected Failure Risks
              </h3>
              <span className="text-xs text-muted-foreground">
                {insights.predictions.length} potential issue
                {insights.predictions.length > 1 ? "s" : ""} identified
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {insights.predictions.map((prediction) => (
                <PredictionCard
                  key={prediction.failureType}
                  prediction={prediction}
                />
              ))}
            </div>
          </div>
        )}

        {insights.predictions.length === 0 && (
          <div className="text-center py-8 rounded-lg border bg-success/5 border-success/20">
            <Shield className="h-12 w-12 text-success mx-auto mb-3" />
            <p className="font-medium text-success">All Systems Healthy</p>
            <p className="text-sm text-muted-foreground mt-1">
              No failure risks detected. Continue routine monitoring.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            <span>Rule-based AI Engine v1.0</span>
          </div>
          <div className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            <span>Ready for ML API integration</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
