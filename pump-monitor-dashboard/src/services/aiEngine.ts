import type {
  AIAnalysisInput,
  AIInsights,
  FailurePrediction,
  AISeverity,
  MaintenanceUrgency,
  ChartDataPoint,
  Alert,
} from "../types";

interface TrendAnalysis {
  slope: number;
  direction: "increasing" | "decreasing" | "stable";
  volatility: number;
  average: number;
  max: number;
  min: number;
}

function analyzeTrend(data: ChartDataPoint[]): TrendAnalysis {
  if (data.length < 2) {
    return {
      slope: 0,
      direction: "stable",
      volatility: 0,
      average: data[0]?.value ?? 0,
      max: data[0]?.value ?? 0,
      min: data[0]?.value ?? 0,
    };
  }

  const values = data.map((d) => d.value);
  const n = values.length;

  const sum = values.reduce((a, b) => a + b, 0);
  const average = sum / n;
  const max = Math.max(...values);
  const min = Math.min(...values);

  let sumXY = 0;
  let sumX = 0;
  let sumY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumXY += i * values[i];
    sumX += i;
    sumY += values[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / n;
  const volatility = Math.sqrt(variance) / average;

  let direction: TrendAnalysis["direction"] = "stable";
  if (slope > 0.05) direction = "increasing";
  else if (slope < -0.05) direction = "decreasing";

  return { slope, direction, volatility, average, max, min };
}

function countRecentAlerts(alerts: Alert[], type?: string): number {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return alerts.filter((a) => {
    const alertTime = new Date(a.timestamp).getTime();
    const matchesType = type ? a.type === type : true;
    return alertTime > oneDayAgo && matchesType;
  }).length;
}

function calculateSeverity(probability: number, riskScore: number): AISeverity {
  const combined = (probability + riskScore) / 2;
  if (combined >= 80) return "Critical";
  if (combined >= 60) return "High";
  if (combined >= 40) return "Medium";
  return "Low";
}

function estimateTAT(severity: AISeverity): string {
  switch (severity) {
    case "Critical":
      return "4-8 hours";
    case "High":
      return "1-2 days";
    case "Medium":
      return "3-5 days";
    case "Low":
      return "1-2 weeks";
  }
}

function estimateDaysToFailure(
  probability: number,
  trendDirection: TrendAnalysis["direction"],
  slope: number
): number {
  let baseDays = Math.round((100 - probability) * 1.5);

  if (trendDirection === "increasing") {
    baseDays = Math.round(baseDays * (1 - Math.min(slope, 0.5)));
  } else if (trendDirection === "decreasing") {
    baseDays = Math.round(baseDays * 1.3);
  }

  return Math.max(1, Math.min(baseDays, 180));
}

function detectBearingFailure(
  rmsVibration: number,
  vibrationTrend: TrendAnalysis,
  alerts: Alert[]
): FailurePrediction | null {
  let probability = 0;
  let rootCause = "";
  let recommendedAction = "";

  if (rmsVibration > 8 && vibrationTrend.direction === "increasing") {
    probability = 85;
    rootCause =
      "High RMS vibration with increasing trend indicates bearing wear or damage";
    recommendedAction =
      "Schedule immediate bearing inspection and replacement. Reduce load if possible.";
  } else if (rmsVibration > 6 && vibrationTrend.direction === "increasing") {
    probability = 65;
    rootCause =
      "Elevated vibration levels with upward trend suggest early bearing degradation";
    recommendedAction =
      "Plan bearing inspection within 1 week. Monitor vibration frequency spectrum.";
  } else if (rmsVibration > 5 && vibrationTrend.volatility > 0.3) {
    probability = 45;
    rootCause =
      "Moderate vibration with high variability may indicate bearing looseness";
    recommendedAction =
      "Inspect bearing housing and mounting. Check lubrication levels.";
  } else if (countRecentAlerts(alerts, "vibration") >= 3) {
    probability = 55;
    rootCause = "Multiple vibration alerts suggest developing bearing issues";
    recommendedAction =
      "Perform vibration analysis to identify bearing defect frequencies.";
  }

  if (probability === 0) return null;

  const riskScore = Math.round(
    probability * 0.7 + (vibrationTrend.slope > 0 ? vibrationTrend.slope * 50 : 0)
  );
  const severity = calculateSeverity(probability, riskScore);

  return {
    failureType: "Bearing Failure",
    probability,
    severity,
    rootCause,
    recommendedAction,
    estimatedTAT: estimateTAT(severity),
    riskScore: Math.min(100, riskScore),
    forecastDaysToFailure: estimateDaysToFailure(
      probability,
      vibrationTrend.direction,
      vibrationTrend.slope
    ),
  };
}

function detectImbalance(
  rmsVibration: number,
  temperature: number,
  vibrationTrend: TrendAnalysis
): FailurePrediction | null {
  let probability = 0;
  let rootCause = "";
  let recommendedAction = "";

  if (rmsVibration > 5 && temperature < 70) {
    probability = 70;
    rootCause =
      "High vibration with normal temperature typically indicates rotor imbalance";
    recommendedAction =
      "Schedule dynamic balancing. Check for debris accumulation on impeller.";
  } else if (
    rmsVibration > 4 &&
    temperature < 75 &&
    vibrationTrend.direction === "stable"
  ) {
    probability = 50;
    rootCause =
      "Consistent elevated vibration without thermal issues suggests imbalance";
    recommendedAction =
      "Perform vibration analysis at 1x RPM. Plan balancing if confirmed.";
  } else if (vibrationTrend.average > 3.5 && vibrationTrend.volatility < 0.15) {
    probability = 35;
    rootCause =
      "Steady moderate vibration pattern may indicate minor imbalance";
    recommendedAction =
      "Monitor vibration levels. Include balancing in next maintenance window.";
  }

  if (probability === 0) return null;

  const riskScore = Math.round(probability * 0.6 + rmsVibration * 5);
  const severity = calculateSeverity(probability, riskScore);

  return {
    failureType: "Imbalance",
    probability,
    severity,
    rootCause,
    recommendedAction,
    estimatedTAT: estimateTAT(severity),
    riskScore: Math.min(100, riskScore),
    forecastDaysToFailure: estimateDaysToFailure(
      probability,
      vibrationTrend.direction,
      vibrationTrend.slope
    ),
  };
}

function detectCavitation(
  rmsVibration: number,
  vibrationTrend: TrendAnalysis,
  alerts: Alert[]
): FailurePrediction | null {
  let probability = 0;
  let rootCause = "";
  let recommendedAction = "";

  if (vibrationTrend.volatility > 0.4 && rmsVibration > 4) {
    probability = 75;
    rootCause =
      "Highly irregular vibration pattern indicates possible cavitation";
    recommendedAction =
      "Check NPSH conditions. Inspect suction line for restrictions. Verify fluid levels.";
  } else if (vibrationTrend.volatility > 0.3 && vibrationTrend.max - vibrationTrend.min > 3) {
    probability = 55;
    rootCause =
      "Fluctuating vibration with wide range suggests intermittent cavitation";
    recommendedAction =
      "Review pump operating point. Check for air ingress in suction.";
  } else if (
    vibrationTrend.volatility > 0.25 &&
    countRecentAlerts(alerts, "vibration") >= 2
  ) {
    probability = 40;
    rootCause =
      "Variable vibration with recent alerts may indicate developing cavitation";
    recommendedAction =
      "Monitor suction pressure. Perform acoustic analysis for cavitation noise.";
  }

  if (probability === 0) return null;

  const riskScore = Math.round(
    probability * 0.65 + vibrationTrend.volatility * 60
  );
  const severity = calculateSeverity(probability, riskScore);

  return {
    failureType: "Cavitation",
    probability,
    severity,
    rootCause,
    recommendedAction,
    estimatedTAT: estimateTAT(severity),
    riskScore: Math.min(100, riskScore),
    forecastDaysToFailure: estimateDaysToFailure(
      probability,
      vibrationTrend.direction,
      vibrationTrend.slope
    ),
  };
}

function detectMisalignment(
  rmsVibration: number,
  vibrationTrend: TrendAnalysis,
  temperature: number
): FailurePrediction | null {
  let probability = 0;
  let rootCause = "";
  let recommendedAction = "";

  if (
    vibrationTrend.direction === "stable" &&
    rmsVibration > 4.5 &&
    vibrationTrend.volatility < 0.2
  ) {
    probability = 65;
    rootCause =
      "Consistent directional vibration pattern indicates shaft misalignment";
    recommendedAction =
      "Perform laser alignment check. Inspect coupling condition and mounting bolts.";
  } else if (
    rmsVibration > 3.5 &&
    temperature > 70 &&
    vibrationTrend.volatility < 0.18
  ) {
    probability = 50;
    rootCause =
      "Steady vibration with elevated temperature suggests misalignment stress";
    recommendedAction =
      "Schedule alignment verification. Check for thermal growth compensation.";
  } else if (
    vibrationTrend.average > 3 &&
    vibrationTrend.direction === "stable" &&
    vibrationTrend.volatility < 0.15
  ) {
    probability = 30;
    rootCause =
      "Low variability vibration may indicate minor misalignment";
    recommendedAction =
      "Include alignment check in next scheduled maintenance.";
  }

  if (probability === 0) return null;

  const riskScore = Math.round(probability * 0.55 + rmsVibration * 6);
  const severity = calculateSeverity(probability, riskScore);

  return {
    failureType: "Misalignment",
    probability,
    severity,
    rootCause,
    recommendedAction,
    estimatedTAT: estimateTAT(severity),
    riskScore: Math.min(100, riskScore),
    forecastDaysToFailure: estimateDaysToFailure(
      probability,
      vibrationTrend.direction,
      vibrationTrend.slope
    ),
  };
}

function detectOverheating(
  temperature: number,
  temperatureTrend: TrendAnalysis,
  rmsVibration: number,
  alerts: Alert[]
): FailurePrediction | null {
  let probability = 0;
  let rootCause = "";
  let recommendedAction = "";

  if (temperature > 90) {
    probability = 90;
    rootCause =
      "Critical temperature level indicates severe overheating condition";
    recommendedAction =
      "Immediate shutdown recommended. Check cooling system, lubrication, and load conditions.";
  } else if (
    temperature > 80 &&
    temperatureTrend.direction === "increasing"
  ) {
    probability = 75;
    rootCause =
      "High temperature with rising trend indicates progressive overheating";
    recommendedAction =
      "Reduce load immediately. Inspect cooling system and bearing lubrication.";
  } else if (
    temperatureTrend.direction === "increasing" &&
    rmsVibration > 4
  ) {
    probability = 60;
    rootCause =
      "Rising temperature combined with elevated vibration suggests friction-induced heating";
    recommendedAction =
      "Check bearing condition and lubrication. Verify alignment and coupling.";
  } else if (
    temperature > 75 &&
    countRecentAlerts(alerts, "temperature") >= 2
  ) {
    probability = 50;
    rootCause =
      "Elevated temperature with recent thermal alerts indicates cooling issues";
    recommendedAction =
      "Inspect cooling system. Check ambient conditions and ventilation.";
  } else if (temperatureTrend.slope > 0.3 && temperature > 70) {
    probability = 40;
    rootCause =
      "Accelerating temperature rise may lead to overheating";
    recommendedAction =
      "Monitor closely. Prepare cooling system inspection.";
  }

  if (probability === 0) return null;

  const riskScore = Math.round(
    probability * 0.7 +
      (temperatureTrend.slope > 0 ? temperatureTrend.slope * 40 : 0) +
      (temperature > 85 ? 20 : 0)
  );
  const severity = calculateSeverity(probability, riskScore);

  return {
    failureType: "Overheating",
    probability,
    severity,
    rootCause,
    recommendedAction,
    estimatedTAT: estimateTAT(severity),
    riskScore: Math.min(100, riskScore),
    forecastDaysToFailure: estimateDaysToFailure(
      probability,
      temperatureTrend.direction,
      temperatureTrend.slope
    ),
  };
}

function determineMaintenanceUrgency(
  predictions: FailurePrediction[],
  overallRiskScore: number
): MaintenanceUrgency {
  const hasCritical = predictions.some((p) => p.severity === "Critical");
  const hasHigh = predictions.some((p) => p.severity === "High");
  const minDaysToFailure = Math.min(
    ...predictions.map((p) => p.forecastDaysToFailure),
    999
  );

  if (hasCritical || overallRiskScore >= 80 || minDaysToFailure <= 3) {
    return "Immediate";
  }
  if (hasHigh || overallRiskScore >= 60 || minDaysToFailure <= 14) {
    return "Urgent";
  }
  if (overallRiskScore >= 40 || minDaysToFailure <= 30) {
    return "Soon";
  }
  return "Normal";
}

function generateSummary(
  predictions: FailurePrediction[],
  urgency: MaintenanceUrgency
): string {
  if (predictions.length === 0) {
    return "All systems operating within normal parameters. No immediate concerns detected.";
  }

  const topPrediction = predictions.reduce((a, b) =>
    a.probability > b.probability ? a : b
  );

  const urgencyText: Record<MaintenanceUrgency, string> = {
    Immediate: "Immediate attention required.",
    Urgent: "Urgent maintenance recommended.",
    Soon: "Maintenance should be scheduled soon.",
    Normal: "Continue routine monitoring.",
  };

  return `Primary concern: ${topPrediction.failureType} (${topPrediction.probability}% probability). ${urgencyText[urgency]} ${predictions.length} potential issue${predictions.length > 1 ? "s" : ""} detected.`;
}

export async function analyzeWithAI(
  input: AIAnalysisInput
): Promise<AIInsights> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const vibrationTrend = analyzeTrend(input.vibrationHistory);
  const temperatureTrend = analyzeTrend(input.temperatureHistory);

  const predictions: FailurePrediction[] = [];

  const bearingPrediction = detectBearingFailure(
    input.rmsVibration,
    vibrationTrend,
    input.alerts
  );
  if (bearingPrediction) predictions.push(bearingPrediction);

  const imbalancePrediction = detectImbalance(
    input.rmsVibration,
    input.temperature,
    vibrationTrend
  );
  if (imbalancePrediction) predictions.push(imbalancePrediction);

  const cavitationPrediction = detectCavitation(
    input.rmsVibration,
    vibrationTrend,
    input.alerts
  );
  if (cavitationPrediction) predictions.push(cavitationPrediction);

  const misalignmentPrediction = detectMisalignment(
    input.rmsVibration,
    vibrationTrend,
    input.temperature
  );
  if (misalignmentPrediction) predictions.push(misalignmentPrediction);

  const overheatingPrediction = detectOverheating(
    input.temperature,
    temperatureTrend,
    input.rmsVibration,
    input.alerts
  );
  if (overheatingPrediction) predictions.push(overheatingPrediction);

  predictions.sort((a, b) => b.probability - a.probability);

  let overallRiskScore = 0;
  if (predictions.length > 0) {
    const weightedSum = predictions.reduce(
      (sum, p, i) => sum + p.riskScore * Math.pow(0.7, i),
      0
    );
    const weightSum = predictions.reduce(
      (sum, _, i) => sum + Math.pow(0.7, i),
      0
    );
    overallRiskScore = Math.round(weightedSum / weightSum);
  }

  overallRiskScore = Math.round(
    overallRiskScore * 0.7 + (100 - input.healthScore) * 0.3
  );

  const maintenanceUrgency = determineMaintenanceUrgency(
    predictions,
    overallRiskScore
  );

  const summary = generateSummary(predictions, maintenanceUrgency);

  return {
    pumpId: input.pumpId,
    overallRiskScore: Math.min(100, overallRiskScore),
    maintenanceUrgency,
    predictions,
    summary,
    analyzedAt: new Date().toISOString(),
  };
}

export type { TrendAnalysis };
