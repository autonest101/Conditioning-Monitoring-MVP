import { useState } from "react";
import { Header } from "../components/layout/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { getFailureTypeLibrary } from "../services/ai/fleetIntelligence";
import type { FailureTypeLibrary, FailureStageInfo, DegradationStage } from "../types";
import {
  Activity,
  Thermometer,
  Target,
  Zap,
  TrendingUp,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  BookOpen,
  Lightbulb,
  Stethoscope,
} from "lucide-react";
import { cn } from "../lib/utils";

const failureIcons: Record<string, React.ElementType> = {
  "Bearing Failure": Activity,
  Imbalance: Target,
  Cavitation: Zap,
  Misalignment: TrendingUp,
  Overheating: Thermometer,
};

function StageVisualization({
  stages,
  currentStage,
}: {
  stages: FailureStageInfo[];
  currentStage?: DegradationStage;
}) {
  const stageColors = {
    1: { bg: "bg-success", text: "text-success", border: "border-success" },
    2: { bg: "bg-warning", text: "text-warning", border: "border-warning" },
    3: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500" },
    4: { bg: "bg-destructive", text: "text-destructive", border: "border-destructive" },
  };

  return (
    <div className="relative">
      <div className="absolute top-6 left-8 right-8 h-1 bg-gradient-to-r from-success via-warning via-orange-500 to-destructive rounded-full" />
      
      <div className="relative flex justify-between">
        {stages.map((stage) => {
          const colors = stageColors[stage.stage];
          const isActive = currentStage === stage.stage;

          return (
            <div
              key={stage.stage}
              className={cn(
                "flex flex-col items-center w-1/4 transition-all",
                isActive && "scale-105"
              )}
            >
              <div
                className={cn(
                  "relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-4 transition-all",
                  isActive
                    ? cn(colors.bg, "text-white border-white shadow-lg")
                    : cn("bg-card", colors.border, colors.text)
                )}
              >
                {stage.stage}
              </div>
              <div className="mt-3 text-center">
                <p className={cn("font-semibold text-sm", isActive && colors.text)}>
                  {stage.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {stage.typicalDuration}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageDetails({ stage }: { stage: FailureStageInfo }) {
  const urgencyColors = {
    Normal: "bg-success/10 text-success border-success/20",
    Soon: "bg-warning/10 text-warning border-warning/20",
    Urgent: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    Immediate: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              stage.stage === 1 && "bg-success text-success-foreground",
              stage.stage === 2 && "bg-warning text-warning-foreground",
              stage.stage === 3 && "bg-orange-500 text-white",
              stage.stage === 4 && "bg-destructive text-destructive-foreground"
            )}
          >
            {stage.stage}
          </div>
          <div>
            <p className="font-semibold">{stage.name}</p>
            <p className="text-xs text-muted-foreground">{stage.typicalDuration}</p>
          </div>
        </div>
        <Badge className={cn("border", urgencyColors[stage.urgency])}>
          {stage.urgency}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{stage.description}</p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-xs font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-warning" />
            Symptoms
          </p>
          <ul className="space-y-1">
            {stage.symptoms.map((symptom, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                {symptom}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium flex items-center gap-1">
            <Stethoscope className="h-3 w-3 text-primary" />
            Diagnostic Indicators
          </p>
          <ul className="space-y-1">
            {stage.diagnosticIndicators.map((indicator, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                {indicator}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium flex items-center gap-1">
            <Shield className="h-3 w-3 text-success" />
            Preventive Measures
          </p>
          <ul className="space-y-1">
            {stage.preventiveMeasures.map((measure, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                <CheckCircle className="h-3 w-3 mt-0.5 shrink-0 text-success" />
                {measure}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function FailureTypeCard({
  failure,
  isSelected,
  onClick,
}: {
  failure: FailureTypeLibrary;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = failureIcons[failure.type] || Activity;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all hover:shadow-md",
        isSelected
          ? "bg-primary/10 border-primary shadow-lg"
          : "bg-card hover:bg-accent/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "rounded-lg p-2",
            isSelected ? "bg-primary/20" : "bg-muted"
          )}
        >
          <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="flex-1">
          <p className={cn("font-semibold", isSelected && "text-primary")}>
            {failure.type}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {failure.description}
          </p>
        </div>
        <ChevronRight
          className={cn(
            "h-5 w-5 transition-transform",
            isSelected ? "text-primary rotate-90" : "text-muted-foreground"
          )}
        />
      </div>
    </button>
  );
}

export function FailureIntelligence() {
  const failureLibrary = getFailureTypeLibrary();
  const [selectedType, setSelectedType] = useState<FailureTypeLibrary>(failureLibrary[0]);
  const [selectedStage, setSelectedStage] = useState<DegradationStage>(1);

  const Icon = failureIcons[selectedType.type] || Activity;

  return (
    <div className="min-h-screen">
      <Header
        title="Failure Intelligence"
        subtitle="Comprehensive failure mode library and diagnostics"
      />

      <div className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              Failure Type Library
            </h3>
            <div className="space-y-2">
              {failureLibrary.map((failure) => (
                <FailureTypeCard
                  key={failure.type}
                  failure={failure}
                  isSelected={selectedType.type === failure.type}
                  onClick={() => {
                    setSelectedType(failure);
                    setSelectedStage(1);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card className="glass gradient-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/20 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{selectedType.type}</CardTitle>
                    <CardDescription>{selectedType.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Common Causes
                    </p>
                    <ul className="space-y-1">
                      {selectedType.commonCauses.map((cause, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4 text-primary" />
                      Typical Progression
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedType.typicalProgressionTime}
                    </p>

                    <p className="text-sm font-medium flex items-center gap-1 mt-4">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      Detection Methods
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedType.detectionMethods.map((method, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Shield className="h-4 w-4 text-success" />
                    Prevention Strategies
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {selectedType.preventionStrategies.map((strategy, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-success/5 border border-success/10"
                      >
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                        {strategy}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Degradation Stages (1-4)
                </CardTitle>
                <CardDescription>
                  Click on a stage to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <StageVisualization
                  stages={selectedType.stages}
                  currentStage={selectedStage}
                />

                <div className="flex justify-center gap-2">
                  {selectedType.stages.map((stage) => (
                    <Button
                      key={stage.stage}
                      variant={selectedStage === stage.stage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStage(stage.stage)}
                    >
                      Stage {stage.stage}
                    </Button>
                  ))}
                </div>

                <StageDetails
                  stage={selectedType.stages.find((s) => s.stage === selectedStage)!}
                />
              </CardContent>
            </Card>

            <Card className="glass bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">AI Insight</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Early detection at Stage 1-2 can prevent up to 90% of unplanned failures.
                      Implementing predictive maintenance based on these indicators typically
                      reduces maintenance costs by 25-30% while extending asset life by 20-40%.
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
