import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { RiskTimeline } from "../modules/timeline/RiskTimeline";
import { mockApi } from "../services/mockApi";
import { getEnhancedInsight } from "../services/ai/fleetIntelligence";
import type { Pump, EnhancedInsight } from "../types";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Circle,
  DollarSign,
  TrendingUp,
  Shield,
  Lightbulb,
  Target,
  Scale,
} from "lucide-react";
import { cn } from "../lib/utils";

function ReasoningPanel({ reasoning }: { reasoning: EnhancedInsight["reasoning"] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full"
        >
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Reasoning
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      
      <CardContent className={cn("space-y-4", !isExpanded && "hidden")}>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Conclusion</span>
            <Badge variant="outline" className="gap-1">
              <Target className="h-3 w-3" />
              {reasoning.confidence}% confidence
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{reasoning.conclusion}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            Contributing Factors
          </p>
          {reasoning.factors.map((factor, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{factor.factor}</span>
                <Badge
                  variant={
                    factor.contribution === "negative"
                      ? "destructive"
                      : factor.contribution === "positive"
                      ? "default"
                      : "secondary"
                  }
                  className="text-[10px]"
                >
                  {factor.contribution}
                </Badge>
              </div>
              <Progress
                value={factor.weight * 100}
                className="h-1.5"
                indicatorClassName={cn(
                  factor.contribution === "negative" && "bg-destructive",
                  factor.contribution === "positive" && "bg-success",
                  factor.contribution === "neutral" && "bg-muted-foreground"
                )}
              />
              <p className="text-xs text-muted-foreground">{factor.evidence}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            Alternative Hypotheses
          </p>
          {reasoning.alternativeHypotheses.map((alt, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div>
                <p className="text-sm">{alt.hypothesis}</p>
                <p className="text-xs text-muted-foreground">{alt.reason}</p>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {alt.probability}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      {!isExpanded && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {reasoning.conclusion}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="mt-2 text-xs"
          >
            Show full reasoning
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

function MitigationChecklist({
  checklist,
}: {
  checklist: EnhancedInsight["mitigationChecklist"];
}) {
  const [items, setItems] = useState(checklist);

  const toggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Mitigation Checklist
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{items.length} completed
          </span>
        </div>
        <Progress value={progress} className="h-1.5" indicatorClassName="bg-success" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => toggleItem(i)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                item.completed
                  ? "bg-success/5 border-success/20"
                  : "hover:bg-accent/50"
              )}
            >
              {item.completed ? (
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span
                className={cn(
                  "text-sm flex-1",
                  item.completed && "line-through text-muted-foreground"
                )}
              >
                {item.item}
              </span>
              <Badge
                variant={
                  item.priority === "high"
                    ? "destructive"
                    : item.priority === "medium"
                    ? "warning"
                    : "secondary"
                }
                className="text-[10px]"
              >
                {item.priority}
              </Badge>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CostImpactCard({ costImpact }: { costImpact: EnhancedInsight["costImpact"] }) {
  return (
    <Card className="glass gradient-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-success" />
          Cost Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-2xl font-bold text-destructive">
              ${(costImpact.ifNoAction / 1000).toFixed(0)}K
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">If No Action</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-2xl font-bold text-primary">
              ${(costImpact.withMitigation / 1000).toFixed(0)}K
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">With Mitigation</p>
          </div>
          <div className="p-3 rounded-xl bg-success/10 border border-success/20">
            <p className="text-2xl font-bold text-success">
              ${(costImpact.savings / 1000).toFixed(0)}K
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Potential Savings</p>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-success/5 border border-success/10">
          <p className="text-xs text-muted-foreground">
            Taking recommended actions could save{" "}
            <span className="font-bold text-success">
              {Math.round((costImpact.savings / costImpact.ifNoAction) * 100)}%
            </span>{" "}
            of potential failure costs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DegradationIndicator({ stage }: { stage: EnhancedInsight["degradationStage"] }) {
  const stages = [1, 2, 3, 4];
  const stageLabels = ["Initial", "Developing", "Advanced", "Critical"];
  const stageColors = ["bg-success", "bg-warning", "bg-orange-500", "bg-destructive"];

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-warning" />
          Degradation Stage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {stages.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  s <= stage ? stageColors[s - 1] : "bg-muted"
                )}
              />
              <p
                className={cn(
                  "text-[10px] text-center mt-1",
                  s === stage ? "font-bold" : "text-muted-foreground"
                )}
              >
                {stageLabels[i]}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-3xl font-bold">Stage {stage}</p>
          <p className="text-sm text-muted-foreground">{stageLabels[stage - 1]} Degradation</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function Insights() {
  const [searchParams, setSearchParams] = useSearchParams();
  const assetId = searchParams.get("asset") || "pump-004";

  const [pumps, setPumps] = useState<Pump[]>([]);
  const [insight, setInsight] = useState<EnhancedInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getPumps().then(setPumps);
  }, []);

  useEffect(() => {
    const loadInsight = async () => {
      setLoading(true);
      const data = await getEnhancedInsight(assetId);
      setInsight(data);
      setLoading(false);
    };
    loadInsight();
  }, [assetId]);

  return (
    <div className="min-h-screen">
      <Header
        title="AI Insights"
        subtitle="Deep analysis and recommendations"
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Select
            value={assetId}
            onValueChange={(v) => setSearchParams({ asset: v })}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {pumps.map((pump) => (
                <SelectItem key={pump.id} value={pump.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        pump.status === "Normal"
                          ? "bg-success"
                          : pump.status === "Warning"
                          ? "bg-warning"
                          : "bg-destructive"
                      )}
                    />
                    {pump.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-64 bg-muted rounded-xl" />
              <div className="h-64 bg-muted rounded-xl" />
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        ) : !insight ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-lg font-medium">No Critical Insights</p>
              <p className="text-sm text-muted-foreground">
                This asset is operating within normal parameters
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <RiskTimeline assetId={assetId} />

            <div className="grid gap-6 lg:grid-cols-3">
              <DegradationIndicator stage={insight.degradationStage} />
              <CostImpactCard costImpact={insight.costImpact} />
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Risk Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-destructive">
                      {insight.overallRiskScore}
                    </p>
                    <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                  </div>
                  <Badge
                    variant={
                      insight.maintenanceUrgency === "Immediate"
                        ? "destructive"
                        : insight.maintenanceUrgency === "Urgent"
                        ? "warning"
                        : "secondary"
                    }
                    className="w-full justify-center py-2"
                  >
                    {insight.maintenanceUrgency} Action Required
                  </Badge>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    {insight.summary}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ReasoningPanel reasoning={insight.reasoning} />
              <MitigationChecklist checklist={insight.mitigationChecklist} />
            </div>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Failure Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {insight.predictions.map((prediction) => (
                    <div
                      key={prediction.failureType}
                      className={cn(
                        "rounded-xl border p-4 space-y-3",
                        prediction.severity === "Critical"
                          ? "bg-destructive/5 border-destructive/20"
                          : prediction.severity === "High"
                          ? "bg-orange-500/5 border-orange-500/20"
                          : "bg-warning/5 border-warning/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{prediction.failureType}</span>
                        <Badge
                          variant={
                            prediction.severity === "Critical"
                              ? "destructive"
                              : prediction.severity === "High"
                              ? "destructive"
                              : "warning"
                          }
                        >
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
                          className="h-2"
                          indicatorClassName={cn(
                            prediction.probability >= 70
                              ? "bg-destructive"
                              : prediction.probability >= 50
                              ? "bg-warning"
                              : "bg-primary"
                          )}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {prediction.rootCause}
                      </p>
                      <div className="flex items-center justify-between text-xs pt-2 border-t">
                        <span className="text-muted-foreground">
                          TAT: {prediction.estimatedTAT}
                        </span>
                        <span className="text-warning font-medium">
                          {prediction.forecastDaysToFailure} days to failure
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
