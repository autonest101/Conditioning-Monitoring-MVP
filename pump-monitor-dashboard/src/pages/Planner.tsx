import { useEffect, useState } from "react";
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
  generateMaintenancePlan,
} from "../services/ai/fleetIntelligence";
import type { MaintenancePlan, MaintenanceAction } from "../types";
import {
  Calendar,
  Clock,
  Users,
  Wrench,
  TrendingDown,
  DollarSign,
  Shield,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { cn } from "../lib/utils";

function ActionCard({ action, index }: { action: MaintenanceAction; index: number }) {
  const priorityColor =
    action.priorityScore >= 80
      ? "text-destructive"
      : action.priorityScore >= 60
      ? "text-warning"
      : "text-primary";

  const priorityBg =
    action.priorityScore >= 80
      ? "from-destructive/10 to-destructive/5 border-destructive/20"
      : action.priorityScore >= 60
      ? "from-warning/10 to-warning/5 border-warning/20"
      : "from-primary/10 to-primary/5 border-primary/20";

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br p-4 transition-all hover:shadow-lg",
        priorityBg
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
            action.priorityScore >= 80
              ? "bg-destructive text-destructive-foreground"
              : action.priorityScore >= 60
              ? "bg-warning text-warning-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          {index + 1}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{action.assetName}</h4>
              <p className="text-sm text-muted-foreground">{action.action}</p>
            </div>
            <Badge
              variant={
                action.status === "completed"
                  ? "default"
                  : action.status === "in_progress"
                  ? "secondary"
                  : action.status === "scheduled"
                  ? "outline"
                  : "secondary"
              }
              className="capitalize"
            >
              {action.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Badge variant="outline" className="gap-1">
              <Wrench className="h-3 w-3" />
              {action.failureType}
            </Badge>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {action.suggestedTAT}
            </span>
            {action.scheduledDate && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(action.scheduledDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Priority:</span>
            <Progress
              value={action.priorityScore}
              className="flex-1 h-1.5"
              indicatorClassName={cn(
                action.priorityScore >= 80
                  ? "bg-destructive"
                  : action.priorityScore >= 60
                  ? "bg-warning"
                  : "bg-primary"
              )}
            />
            <span className={cn("text-sm font-bold", priorityColor)}>
              {action.priorityScore}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-3 border-t">
            <div className="text-center">
              <p className="text-lg font-bold text-success">
                ${(action.impactMetrics.costSavings / 1000).toFixed(0)}K
              </p>
              <p className="text-[10px] text-muted-foreground">Cost Savings</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">
                {action.impactMetrics.downtimeReduction}%
              </p>
              <p className="text-[10px] text-muted-foreground">Less Downtime</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-warning">
                {action.impactMetrics.riskReduction}%
              </p>
              <p className="text-[10px] text-muted-foreground">Risk Reduced</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {action.resourceRequirements.technicians} technician(s)
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {action.resourceRequirements.estimatedHours}h estimated
            </span>
          </div>

          {action.resourceRequirements.partsNeeded.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {action.resourceRequirements.partsNeeded.map((part) => (
                <Badge key={part} variant="secondary" className="text-[10px]">
                  {part}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Planner() {
  const [plan, setPlan] = useState<MaintenancePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      const data = await generateMaintenancePlan();
      setPlan(data);
      setLoading(false);
    };
    loadPlan();
  }, []);

  const regeneratePlan = async () => {
    setLoading(true);
    const data = await generateMaintenancePlan();
    setPlan(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Maintenance Planner" subtitle="Loading..." />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="min-h-screen">
      <Header
        title="Maintenance Planner"
        subtitle="AI-optimized maintenance scheduling"
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/20 p-2.5">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">AI-Generated Maintenance Plan</h2>
              <p className="text-xs text-muted-foreground">
                Generated {new Date(plan.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <Button onClick={regeneratePlan} variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Regenerate Plan
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass gradient-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Actions</p>
                  <p className="text-2xl font-bold">{plan.actions.length}</p>
                </div>
                <div className="rounded-lg bg-primary/20 p-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass gradient-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Resource Load</p>
                  <p className="text-2xl font-bold">{plan.totalResourceLoad.hours}h</p>
                  <p className="text-[10px] text-muted-foreground">
                    {plan.totalResourceLoad.technicians} technicians
                  </p>
                </div>
                <div className="rounded-lg bg-warning/20 p-2">
                  <Users className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass gradient-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Cost Savings</p>
                  <p className="text-2xl font-bold text-success">
                    ${(plan.expectedOutcomes.totalCostSavings / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="rounded-lg bg-success/20 p-2">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass gradient-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Risk Reduction</p>
                  <p className="text-2xl font-bold text-primary">
                    {plan.expectedOutcomes.fleetRiskReduction}%
                  </p>
                </div>
                <div className="rounded-lg bg-primary/20 p-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Prioritized Action List
              </h3>
              <span className="text-xs text-muted-foreground">
                Ranked by AI priority score
              </span>
            </div>

            <div className="space-y-4">
              {plan.actions.map((action, index) => (
                <ActionCard key={action.id} action={action} index={index} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Weekly Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.weeklyDistribution.map((week) => (
                    <div key={week.week} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Week {week.week}</span>
                        <span className="text-muted-foreground">
                          {week.actions} actions · {week.hours}h
                        </span>
                      </div>
                      <Progress
                        value={(week.hours / 40) * 100}
                        className="h-2"
                        indicatorClassName={cn(
                          week.hours > 30
                            ? "bg-destructive"
                            : week.hours > 20
                            ? "bg-warning"
                            : "bg-primary"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-success" />
                  Expected Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Downtime Reduction</span>
                  <span className="font-bold text-success">
                    {plan.expectedOutcomes.downtimeReduction}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fleet Risk Reduction</span>
                  <span className="font-bold text-primary">
                    {plan.expectedOutcomes.fleetRiskReduction}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Cost Savings</span>
                  <span className="font-bold text-success">
                    ${plan.expectedOutcomes.totalCostSavings.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">AI Recommendation</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Executing this plan within the suggested timeframes will reduce
                      fleet-wide failure risk by {plan.expectedOutcomes.fleetRiskReduction}%
                      and save an estimated ${(plan.expectedOutcomes.totalCostSavings / 1000).toFixed(0)}K
                      in potential downtime costs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
