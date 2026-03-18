export type PumpStatus = "Normal" | "Warning" | "Critical";

export interface Pump {
  id: string;
  name: string;
  location: string;
  model: string;
  installDate: string;
  lastMaintenance: string;
  status: PumpStatus;
}

export interface PumpSummary {
  pumpId: string;
  healthScore: number;
  rmsVibration: number;
  temperature: number;
  status: PumpStatus;
  lastUpdated: string;
}

export interface VibrationDataPoint {
  timestamp: string;
  value: number;
}

export interface TemperatureDataPoint {
  timestamp: string;
  value: number;
}

export interface Alert {
  id: string;
  pumpId: string;
  pumpName: string;
  type: "vibration" | "temperature" | "health" | "maintenance";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface PumpDetails extends Pump {
  summary: PumpSummary;
  specifications: {
    power: string;
    flowRate: string;
    headPressure: string;
    efficiency: string;
  };
}

export type FailureType =
  | "Bearing Failure"
  | "Imbalance"
  | "Cavitation"
  | "Misalignment"
  | "Overheating";

export type AISeverity = "Low" | "Medium" | "High" | "Critical";

export type MaintenanceUrgency = "Normal" | "Soon" | "Urgent" | "Immediate";

export interface FailurePrediction {
  failureType: FailureType;
  probability: number;
  severity: AISeverity;
  rootCause: string;
  recommendedAction: string;
  estimatedTAT: string;
  riskScore: number;
  forecastDaysToFailure: number;
}

export interface AIAnalysisInput {
  pumpId: string;
  rmsVibration: number;
  temperature: number;
  vibrationHistory: ChartDataPoint[];
  temperatureHistory: ChartDataPoint[];
  alerts: Alert[];
  healthScore: number;
}

export interface AIInsights {
  pumpId: string;
  overallRiskScore: number;
  maintenanceUrgency: MaintenanceUrgency;
  predictions: FailurePrediction[];
  summary: string;
  analyzedAt: string;
}

export interface PumpInsight {
  id: string;
  pump_id: string;
  status: string;
  created_at: string;
  // Additional columns are allowed but not required here
  [key: string]: unknown;
}

export type DegradationStage = 1 | 2 | 3 | 4;

export interface FleetRiskMetrics {
  fleetRiskScore: number;
  riskTrend: "improving" | "stable" | "worsening";
  riskTrendPercent: number;
  predictedFailures30Days: number;
  assetsTrendingWorse: number;
  estimatedDowntimeCost: number;
  maintenanceLoadForecast: {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
  };
  criticalAssets: string[];
  lastUpdated: string;
}

export interface AICopilotState {
  systemSummary: string;
  topRiskAsset: {
    id: string;
    name: string;
    riskScore: number;
    primaryConcern: string;
  };
  urgentRecommendation: {
    action: string;
    asset: string;
    priority: "high" | "critical";
    deadline: string;
  };
  confidenceScore: number;
  businessImpact: {
    potentialSavings: number;
    downtimeReduction: number;
    riskReduction: number;
  };
  generatedAt: string;
}

export interface RiskTimelineStage {
  stage: "normal" | "warning" | "critical" | "failure";
  label: string;
  description: string;
  enteredAt?: string;
  predictedAt?: string;
  isCurrentStage: boolean;
  riskLevel: number;
}

export interface AssetRiskTimeline {
  assetId: string;
  assetName: string;
  currentStage: RiskTimelineStage["stage"];
  stages: RiskTimelineStage[];
  predictedFailureWindow: {
    start: string;
    end: string;
  };
  riskAcceleration: number;
  daysToFailure: number;
}

export interface AnomalyEvent {
  id: string;
  timestamp: string;
  type: "spike" | "drop" | "trend_change" | "threshold_breach";
  metric: "vibration" | "temperature" | "health";
  severity: AISeverity;
  value: number;
  expectedValue: number;
  description: string;
}

export interface ForecastDataPoint extends ChartDataPoint {
  isForecast: boolean;
  confidenceLower?: number;
  confidenceUpper?: number;
}

export interface MaintenanceAction {
  id: string;
  assetId: string;
  assetName: string;
  action: string;
  failureType: FailureType;
  priorityScore: number;
  suggestedTAT: string;
  scheduledDate?: string;
  resourceRequirements: {
    technicians: number;
    estimatedHours: number;
    partsNeeded: string[];
  };
  impactMetrics: {
    downtimeReduction: number;
    costSavings: number;
    riskReduction: number;
  };
  status: "pending" | "scheduled" | "in_progress" | "completed";
}

export interface MaintenancePlan {
  id: string;
  generatedAt: string;
  actions: MaintenanceAction[];
  totalResourceLoad: {
    technicians: number;
    hours: number;
  };
  expectedOutcomes: {
    totalCostSavings: number;
    downtimeReduction: number;
    fleetRiskReduction: number;
  };
  weeklyDistribution: {
    week: number;
    actions: number;
    hours: number;
  }[];
}

export interface FailureStageInfo {
  stage: DegradationStage;
  name: string;
  description: string;
  typicalDuration: string;
  symptoms: string[];
  diagnosticIndicators: string[];
  preventiveMeasures: string[];
  urgency: MaintenanceUrgency;
}

export interface FailureTypeLibrary {
  type: FailureType;
  description: string;
  commonCauses: string[];
  stages: FailureStageInfo[];
  typicalProgressionTime: string;
  detectionMethods: string[];
  preventionStrategies: string[];
}

export interface AIReasoning {
  conclusion: string;
  confidence: number;
  factors: {
    factor: string;
    weight: number;
    contribution: "positive" | "negative" | "neutral";
    evidence: string;
  }[];
  alternativeHypotheses: {
    hypothesis: string;
    probability: number;
    reason: string;
  }[];
}

export interface EnhancedInsight extends AIInsights {
  reasoning: AIReasoning;
  degradationStage: DegradationStage;
  mitigationChecklist: {
    item: string;
    completed: boolean;
    priority: "high" | "medium" | "low";
  }[];
  costImpact: {
    ifNoAction: number;
    withMitigation: number;
    savings: number;
  };
}
