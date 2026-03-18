import { useEffect, useState } from "react";
import {
  Brain,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Target,
  DollarSign,
  Clock,
  Sparkles,
  Shield,
  Zap,
  FileText,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import type { AICopilotState } from "../../types";
import { getAICopilotState, generateMaintenancePlan } from "../../services/ai/fleetIntelligence";

interface AICopilotProps {
  onGeneratePlan?: () => void;
}

export function AICopilot({ onGeneratePlan }: AICopilotProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copilotState, setCopilotState] = useState<AICopilotState | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    const loadCopilotState = async () => {
      const state = await getAICopilotState();
      setCopilotState(state);
      setLoading(false);
    };
    loadCopilotState();
  }, []);

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    await generateMaintenancePlan();
    setGeneratingPlan(false);
    onGeneratePlan?.();
  };

  return (
    <>
      <div
        className={cn(
          "fixed right-0 top-0 h-screen z-50 transition-all duration-300 ease-out",
          isExpanded ? "w-96" : "w-14"
        )}
      >
        <div
          className={cn(
            "h-full glass-strong border-l flex flex-col",
            isExpanded ? "rounded-l-2xl" : "rounded-l-xl"
          )}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-primary p-1.5 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          >
            {isExpanded ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {!isExpanded ? (
            <div className="flex flex-col items-center py-4 gap-4">
              <div className="rounded-xl bg-primary/20 p-2 pulse-ring">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="writing-mode-vertical text-xs font-medium text-muted-foreground rotate-180">
                AI Copilot
              </div>
              {copilotState && (
                <div className="flex flex-col items-center gap-2 mt-auto mb-4">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      copilotState.urgentRecommendation.priority === "critical"
                        ? "bg-destructive animate-pulse"
                        : "bg-warning"
                    )}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {copilotState.confidenceScore}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b flex items-center gap-3">
                <div className="rounded-xl bg-primary/20 p-2">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Copilot</h3>
                  <p className="text-xs text-muted-foreground">
                    Reliability Intelligence
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>

              {loading ? (
                <div className="flex-1 p-4 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : copilotState ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                  <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-4 border">
                    <div className="flex items-start gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm font-medium">System Summary</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {copilotState.systemSummary}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-destructive" />
                      <p className="text-sm font-medium">Top Risk Asset</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">{copilotState.topRiskAsset.name}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Risk Score</span>
                        <span className="font-medium text-destructive">
                          {copilotState.topRiskAsset.riskScore}/100
                        </span>
                      </div>
                      <Progress
                        value={copilotState.topRiskAsset.riskScore}
                        className="h-1.5"
                        indicatorClassName="bg-destructive"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {copilotState.topRiskAsset.primaryConcern}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <p className="text-sm font-medium">Urgent Recommendation</p>
                      <Badge
                        variant={
                          copilotState.urgentRecommendation.priority === "critical"
                            ? "destructive"
                            : "warning"
                        }
                        className="ml-auto text-[10px]"
                      >
                        {copilotState.urgentRecommendation.priority}
                      </Badge>
                    </div>
                    <p className="text-sm">{copilotState.urgentRecommendation.action}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{copilotState.urgentRecommendation.deadline}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Confidence Score</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress
                          value={copilotState.confidenceScore}
                          className="h-2"
                          indicatorClassName="bg-primary"
                        />
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {copilotState.confidenceScore}%
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-4 w-4 text-success" />
                      <p className="text-sm font-medium">Business Impact</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-success">
                          ${(copilotState.businessImpact.potentialSavings / 1000).toFixed(0)}K
                        </p>
                        <p className="text-[10px] text-muted-foreground">Savings</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-success">
                          {copilotState.businessImpact.downtimeReduction}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">Less Downtime</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-success">
                          {copilotState.businessImpact.riskReduction}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">Risk Reduced</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="p-4 border-t">
                <Button
                  className="w-full gap-2"
                  onClick={handleGeneratePlan}
                  disabled={generatingPlan}
                >
                  {generatingPlan ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Generate Maintenance Plan
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  AI-optimized action plan based on current fleet state
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </>
  );
}
