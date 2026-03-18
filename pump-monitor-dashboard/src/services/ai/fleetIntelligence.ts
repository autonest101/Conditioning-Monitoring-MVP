import type {
  FleetRiskMetrics,
  AICopilotState,
  AssetRiskTimeline,
  MaintenancePlan,
  MaintenanceAction,
  FailureTypeLibrary,
  EnhancedInsight,
  AnomalyEvent,
  ForecastDataPoint,
  ChartDataPoint,
} from "../../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getFleetRiskMetrics(): Promise<FleetRiskMetrics> {
  await delay(400);

  return {
    fleetRiskScore: 67,
    riskTrend: "worsening",
    riskTrendPercent: 12,
    predictedFailures30Days: 2,
    assetsTrendingWorse: 3,
    estimatedDowntimeCost: 145000,
    maintenanceLoadForecast: {
      week1: 24,
      week2: 18,
      week3: 32,
      week4: 16,
    },
    criticalAssets: ["pump-004", "pump-002"],
    lastUpdated: new Date().toISOString(),
  };
}

export async function getAICopilotState(): Promise<AICopilotState> {
  await delay(350);

  return {
    systemSummary:
      "Fleet health is declining with 2 assets requiring immediate attention. Transfer Pump D shows critical bearing degradation patterns. Recommend prioritizing maintenance to avoid estimated $145K downtime exposure over the next 30 days.",
    topRiskAsset: {
      id: "pump-004",
      name: "Transfer Pump D",
      riskScore: 87,
      primaryConcern: "Bearing Failure - Stage 3 degradation detected",
    },
    urgentRecommendation: {
      action: "Schedule emergency bearing inspection and replacement",
      asset: "Transfer Pump D",
      priority: "critical",
      deadline: "Within 48 hours",
    },
    confidenceScore: 89,
    businessImpact: {
      potentialSavings: 95000,
      downtimeReduction: 72,
      riskReduction: 45,
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function getAssetRiskTimeline(
  assetId: string
): Promise<AssetRiskTimeline> {
  await delay(300);

  const timelines: Record<string, AssetRiskTimeline> = {
    "pump-001": {
      assetId: "pump-001",
      assetName: "Primary Coolant Pump A",
      currentStage: "normal",
      stages: [
        {
          stage: "normal",
          label: "Normal",
          description: "Operating within all parameters",
          isCurrentStage: true,
          riskLevel: 15,
          enteredAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stage: "warning",
          label: "Warning",
          description: "Early degradation signs",
          isCurrentStage: false,
          riskLevel: 45,
          predictedAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stage: "critical",
          label: "Critical",
          description: "Immediate attention required",
          isCurrentStage: false,
          riskLevel: 75,
        },
        {
          stage: "failure",
          label: "Failure",
          description: "Asset failure imminent",
          isCurrentStage: false,
          riskLevel: 95,
        },
      ],
      predictedFailureWindow: {
        start: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
      },
      riskAcceleration: -5,
      daysToFailure: 135,
    },
    "pump-004": {
      assetId: "pump-004",
      assetName: "Transfer Pump D",
      currentStage: "critical",
      stages: [
        {
          stage: "normal",
          label: "Normal",
          description: "Operating within all parameters",
          isCurrentStage: false,
          riskLevel: 15,
          enteredAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stage: "warning",
          label: "Warning",
          description: "Early degradation signs",
          isCurrentStage: false,
          riskLevel: 45,
          enteredAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stage: "critical",
          label: "Critical",
          description: "Immediate attention required",
          isCurrentStage: true,
          riskLevel: 75,
          enteredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stage: "failure",
          label: "Failure",
          description: "Asset failure imminent",
          isCurrentStage: false,
          riskLevel: 95,
          predictedAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      predictedFailureWindow: {
        start: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      },
      riskAcceleration: 23,
      daysToFailure: 12,
    },
    "pump-002": {
      assetId: "pump-002",
      assetName: "Secondary Coolant Pump B",
      currentStage: "warning",
      stages: [
        {
          stage: "normal",
          label: "Normal",
          description: "Operating within all parameters",
          isCurrentStage: false,
          riskLevel: 15,
          enteredAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stage: "warning",
          label: "Warning",
          description: "Early degradation signs",
          isCurrentStage: true,
          riskLevel: 45,
          enteredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stage: "critical",
          label: "Critical",
          description: "Immediate attention required",
          isCurrentStage: false,
          riskLevel: 75,
          predictedAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          stage: "failure",
          label: "Failure",
          description: "Asset failure imminent",
          isCurrentStage: false,
          riskLevel: 95,
        },
      ],
      predictedFailureWindow: {
        start: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
      },
      riskAcceleration: 8,
      daysToFailure: 42,
    },
  };

  return (
    timelines[assetId] || {
      assetId,
      assetName: "Unknown Asset",
      currentStage: "normal",
      stages: [
        { stage: "normal", label: "Normal", description: "", isCurrentStage: true, riskLevel: 20 },
        { stage: "warning", label: "Warning", description: "", isCurrentStage: false, riskLevel: 45 },
        { stage: "critical", label: "Critical", description: "", isCurrentStage: false, riskLevel: 75 },
        { stage: "failure", label: "Failure", description: "", isCurrentStage: false, riskLevel: 95 },
      ],
      predictedFailureWindow: { start: "", end: "" },
      riskAcceleration: 0,
      daysToFailure: 180,
    }
  );
}

export async function generateMaintenancePlan(): Promise<MaintenancePlan> {
  await delay(800);

  const actions: MaintenanceAction[] = [
    {
      id: "ma-001",
      assetId: "pump-004",
      assetName: "Transfer Pump D",
      action: "Emergency bearing replacement and shaft inspection",
      failureType: "Bearing Failure",
      priorityScore: 95,
      suggestedTAT: "4-8 hours",
      resourceRequirements: {
        technicians: 2,
        estimatedHours: 6,
        partsNeeded: ["Bearing assembly SKF-6205", "Shaft seal kit", "Lubricant"],
      },
      impactMetrics: {
        downtimeReduction: 85,
        costSavings: 75000,
        riskReduction: 60,
      },
      status: "pending",
    },
    {
      id: "ma-002",
      assetId: "pump-002",
      assetName: "Secondary Coolant Pump B",
      action: "Vibration analysis and dynamic balancing",
      failureType: "Imbalance",
      priorityScore: 72,
      suggestedTAT: "2-3 hours",
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      resourceRequirements: {
        technicians: 1,
        estimatedHours: 3,
        partsNeeded: ["Balance weights", "Alignment shims"],
      },
      impactMetrics: {
        downtimeReduction: 45,
        costSavings: 25000,
        riskReduction: 35,
      },
      status: "scheduled",
    },
    {
      id: "ma-003",
      assetId: "pump-004",
      assetName: "Transfer Pump D",
      action: "Cooling system inspection and thermal management review",
      failureType: "Overheating",
      priorityScore: 68,
      suggestedTAT: "1-2 hours",
      resourceRequirements: {
        technicians: 1,
        estimatedHours: 2,
        partsNeeded: ["Thermal paste", "Cooling fan assembly"],
      },
      impactMetrics: {
        downtimeReduction: 30,
        costSavings: 15000,
        riskReduction: 25,
      },
      status: "pending",
    },
    {
      id: "ma-004",
      assetId: "pump-003",
      assetName: "Booster Pump C",
      action: "Scheduled preventive maintenance and filter replacement",
      failureType: "Cavitation",
      priorityScore: 45,
      suggestedTAT: "1-2 hours",
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      resourceRequirements: {
        technicians: 1,
        estimatedHours: 1.5,
        partsNeeded: ["Filter element", "Gasket set"],
      },
      impactMetrics: {
        downtimeReduction: 20,
        costSavings: 8000,
        riskReduction: 15,
      },
      status: "scheduled",
    },
    {
      id: "ma-005",
      assetId: "pump-001",
      assetName: "Primary Coolant Pump A",
      action: "Alignment verification and coupling inspection",
      failureType: "Misalignment",
      priorityScore: 35,
      suggestedTAT: "2-3 hours",
      resourceRequirements: {
        technicians: 1,
        estimatedHours: 2.5,
        partsNeeded: ["Coupling element", "Alignment tools"],
      },
      impactMetrics: {
        downtimeReduction: 15,
        costSavings: 5000,
        riskReduction: 10,
      },
      status: "pending",
    },
  ];

  return {
    id: `plan-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    actions,
    totalResourceLoad: {
      technicians: 3,
      hours: 15,
    },
    expectedOutcomes: {
      totalCostSavings: 128000,
      downtimeReduction: 65,
      fleetRiskReduction: 42,
    },
    weeklyDistribution: [
      { week: 1, actions: 2, hours: 8 },
      { week: 2, actions: 2, hours: 5 },
      { week: 3, actions: 1, hours: 2 },
      { week: 4, actions: 0, hours: 0 },
    ],
  };
}

export function getFailureTypeLibrary(): FailureTypeLibrary[] {
  return [
    {
      type: "Bearing Failure",
      description:
        "Progressive degradation of bearing components due to wear, contamination, or improper lubrication",
      commonCauses: [
        "Inadequate lubrication",
        "Contamination",
        "Misalignment",
        "Overloading",
        "Fatigue",
      ],
      stages: [
        {
          stage: 1,
          name: "Subsurface Initiation",
          description: "Microscopic cracks form below bearing surface",
          typicalDuration: "Weeks to months",
          symptoms: ["Slight increase in vibration at bearing frequencies"],
          diagnosticIndicators: ["Ultrasonic detection", "Oil analysis shows early wear particles"],
          preventiveMeasures: ["Regular oil analysis", "Vibration monitoring baseline"],
          urgency: "Normal",
        },
        {
          stage: 2,
          name: "Spalling Initiation",
          description: "Surface defects begin to appear",
          typicalDuration: "Days to weeks",
          symptoms: ["Audible noise increase", "Temperature rise", "Vibration spike at BPFO/BPFI"],
          diagnosticIndicators: ["Vibration spectrum shows bearing defect frequencies"],
          preventiveMeasures: ["Plan bearing replacement", "Increase monitoring frequency"],
          urgency: "Soon",
        },
        {
          stage: 3,
          name: "Damage Propagation",
          description: "Defects spread across bearing surfaces",
          typicalDuration: "Days",
          symptoms: ["Significant vibration", "Heat generation", "Noise clearly audible"],
          diagnosticIndicators: ["Multiple defect frequencies", "Elevated temperature trend"],
          preventiveMeasures: ["Schedule immediate replacement", "Reduce load if possible"],
          urgency: "Urgent",
        },
        {
          stage: 4,
          name: "Catastrophic Failure",
          description: "Complete bearing breakdown",
          typicalDuration: "Hours",
          symptoms: ["Extreme vibration", "Seizure risk", "Potential secondary damage"],
          diagnosticIndicators: ["Broadband vibration", "Metal particles in oil"],
          preventiveMeasures: ["Emergency shutdown", "Immediate replacement required"],
          urgency: "Immediate",
        },
      ],
      typicalProgressionTime: "2-6 months from Stage 1 to Stage 4",
      detectionMethods: [
        "Vibration analysis",
        "Oil analysis",
        "Temperature monitoring",
        "Ultrasonic testing",
      ],
      preventionStrategies: [
        "Proper lubrication program",
        "Contamination control",
        "Correct installation practices",
        "Load management",
      ],
    },
    {
      type: "Imbalance",
      description:
        "Uneven mass distribution in rotating components causing centrifugal forces",
      commonCauses: [
        "Manufacturing defects",
        "Deposit buildup",
        "Erosion/corrosion",
        "Broken/missing parts",
        "Improper assembly",
      ],
      stages: [
        {
          stage: 1,
          name: "Minor Imbalance",
          description: "Slight mass asymmetry detectable",
          typicalDuration: "Months",
          symptoms: ["1x RPM vibration slightly elevated"],
          diagnosticIndicators: ["Vibration at 1x running speed"],
          preventiveMeasures: ["Monitor trend", "Plan balancing at next outage"],
          urgency: "Normal",
        },
        {
          stage: 2,
          name: "Moderate Imbalance",
          description: "Noticeable vibration affecting operation",
          typicalDuration: "Weeks",
          symptoms: ["Visible vibration", "Bearing wear acceleration"],
          diagnosticIndicators: ["1x vibration exceeds baseline by 50%"],
          preventiveMeasures: ["Schedule balancing", "Check for deposit buildup"],
          urgency: "Soon",
        },
        {
          stage: 3,
          name: "Severe Imbalance",
          description: "High forces causing rapid wear",
          typicalDuration: "Days to weeks",
          symptoms: ["Excessive vibration", "Seal leakage", "Coupling wear"],
          diagnosticIndicators: ["1x vibration at alarm levels"],
          preventiveMeasures: ["Urgent balancing required", "Inspect for damage"],
          urgency: "Urgent",
        },
        {
          stage: 4,
          name: "Critical Imbalance",
          description: "Risk of secondary failures",
          typicalDuration: "Hours to days",
          symptoms: ["Structural stress", "Bearing damage", "Potential shaft crack"],
          diagnosticIndicators: ["Vibration at shutdown threshold"],
          preventiveMeasures: ["Immediate shutdown and repair"],
          urgency: "Immediate",
        },
      ],
      typicalProgressionTime: "1-4 months depending on severity",
      detectionMethods: ["Vibration analysis at 1x RPM", "Phase analysis", "Visual inspection"],
      preventionStrategies: [
        "Regular cleaning",
        "Precision balancing",
        "Quality spare parts",
        "Proper assembly procedures",
      ],
    },
    {
      type: "Cavitation",
      description:
        "Formation and collapse of vapor bubbles in liquid causing erosion and vibration",
      commonCauses: [
        "Insufficient NPSH",
        "Suction restrictions",
        "High fluid temperature",
        "Air ingress",
        "Operating off-BEP",
      ],
      stages: [
        {
          stage: 1,
          name: "Incipient Cavitation",
          description: "Occasional bubble formation",
          typicalDuration: "Ongoing if conditions persist",
          symptoms: ["Intermittent crackling noise", "Slight flow fluctuation"],
          diagnosticIndicators: ["High-frequency vibration spikes"],
          preventiveMeasures: ["Review operating conditions", "Check suction pressure"],
          urgency: "Normal",
        },
        {
          stage: 2,
          name: "Developed Cavitation",
          description: "Consistent bubble formation and collapse",
          typicalDuration: "Weeks to months",
          symptoms: ["Continuous noise", "Reduced efficiency", "Flow instability"],
          diagnosticIndicators: ["Broadband high-frequency vibration"],
          preventiveMeasures: ["Adjust operating point", "Improve suction conditions"],
          urgency: "Soon",
        },
        {
          stage: 3,
          name: "Erosive Cavitation",
          description: "Material removal from impeller surfaces",
          typicalDuration: "Weeks",
          symptoms: ["Performance degradation", "Visible erosion damage"],
          diagnosticIndicators: ["Efficiency drop", "Changed pump curve"],
          preventiveMeasures: ["Plan impeller replacement", "Address root cause"],
          urgency: "Urgent",
        },
        {
          stage: 4,
          name: "Severe Damage",
          description: "Extensive erosion affecting pump integrity",
          typicalDuration: "Days",
          symptoms: ["Major performance loss", "Potential seal failure"],
          diagnosticIndicators: ["Significant efficiency loss", "Structural damage"],
          preventiveMeasures: ["Immediate repair or replacement"],
          urgency: "Immediate",
        },
      ],
      typicalProgressionTime: "Varies widely based on severity and duration",
      detectionMethods: [
        "Acoustic monitoring",
        "Vibration analysis",
        "Performance testing",
        "Visual inspection",
      ],
      preventionStrategies: [
        "Ensure adequate NPSH margin",
        "Proper system design",
        "Operating near BEP",
        "Suction line optimization",
      ],
    },
    {
      type: "Misalignment",
      description:
        "Improper alignment between coupled rotating shafts causing stress and vibration",
      commonCauses: [
        "Improper installation",
        "Thermal growth",
        "Foundation settlement",
        "Pipe strain",
        "Soft foot",
      ],
      stages: [
        {
          stage: 1,
          name: "Minor Misalignment",
          description: "Slight offset within tolerance",
          typicalDuration: "Months to years",
          symptoms: ["Elevated 2x vibration", "Slight coupling wear"],
          diagnosticIndicators: ["2x RPM vibration present"],
          preventiveMeasures: ["Document baseline", "Plan alignment check"],
          urgency: "Normal",
        },
        {
          stage: 2,
          name: "Moderate Misalignment",
          description: "Alignment exceeds recommended tolerance",
          typicalDuration: "Weeks to months",
          symptoms: ["Coupling heating", "Seal wear", "Bearing loading"],
          diagnosticIndicators: ["2x vibration elevated", "Axial vibration increase"],
          preventiveMeasures: ["Schedule realignment", "Check thermal growth"],
          urgency: "Soon",
        },
        {
          stage: 3,
          name: "Severe Misalignment",
          description: "Significant stress on components",
          typicalDuration: "Days to weeks",
          symptoms: ["Coupling damage", "Seal leakage", "Bearing failure risk"],
          diagnosticIndicators: ["High 2x and axial vibration"],
          preventiveMeasures: ["Urgent realignment required"],
          urgency: "Urgent",
        },
        {
          stage: 4,
          name: "Critical Misalignment",
          description: "Imminent component failure",
          typicalDuration: "Hours to days",
          symptoms: ["Coupling failure risk", "Shaft stress", "Multiple failures"],
          diagnosticIndicators: ["Extreme vibration levels"],
          preventiveMeasures: ["Shutdown and complete realignment"],
          urgency: "Immediate",
        },
      ],
      typicalProgressionTime: "Months to years depending on severity",
      detectionMethods: [
        "Laser alignment measurement",
        "Vibration analysis (2x RPM)",
        "Thermal imaging",
        "Coupling inspection",
      ],
      preventionStrategies: [
        "Precision alignment during installation",
        "Thermal growth compensation",
        "Proper foundation design",
        "Pipe strain elimination",
      ],
    },
    {
      type: "Overheating",
      description:
        "Excessive temperature rise affecting component integrity and lubrication",
      commonCauses: [
        "Inadequate cooling",
        "Friction from wear",
        "Overloading",
        "Lubrication failure",
        "Ambient conditions",
      ],
      stages: [
        {
          stage: 1,
          name: "Elevated Temperature",
          description: "Temperature above normal but within limits",
          typicalDuration: "Ongoing",
          symptoms: ["Temperature 10-20% above baseline"],
          diagnosticIndicators: ["Trending temperature data"],
          preventiveMeasures: ["Investigate cause", "Check cooling system"],
          urgency: "Normal",
        },
        {
          stage: 2,
          name: "High Temperature",
          description: "Approaching operational limits",
          typicalDuration: "Days to weeks",
          symptoms: ["Lubricant degradation risk", "Seal stress"],
          diagnosticIndicators: ["Temperature at warning threshold"],
          preventiveMeasures: ["Reduce load", "Improve cooling", "Check lubrication"],
          urgency: "Soon",
        },
        {
          stage: 3,
          name: "Critical Temperature",
          description: "Exceeding safe operating limits",
          typicalDuration: "Hours to days",
          symptoms: ["Lubricant breakdown", "Material stress", "Seal damage"],
          diagnosticIndicators: ["Temperature at alarm level"],
          preventiveMeasures: ["Immediate load reduction", "Emergency cooling"],
          urgency: "Urgent",
        },
        {
          stage: 4,
          name: "Thermal Failure",
          description: "Imminent or occurring thermal damage",
          typicalDuration: "Minutes to hours",
          symptoms: ["Seizure risk", "Fire hazard", "Catastrophic failure"],
          diagnosticIndicators: ["Temperature at trip level"],
          preventiveMeasures: ["Emergency shutdown required"],
          urgency: "Immediate",
        },
      ],
      typicalProgressionTime: "Hours to days in acute cases",
      detectionMethods: [
        "Temperature sensors",
        "Thermal imaging",
        "Oil analysis",
        "Touch/smell inspection",
      ],
      preventionStrategies: [
        "Proper cooling system maintenance",
        "Adequate lubrication",
        "Load management",
        "Environmental controls",
      ],
    },
  ];
}

export async function getAnomalyEvents(assetId: string): Promise<AnomalyEvent[]> {
  await delay(250);

  const events: AnomalyEvent[] = [
    {
      id: "anom-001",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: "spike",
      metric: "vibration",
      severity: "High",
      value: 8.2,
      expectedValue: 4.5,
      description: "Sudden vibration spike detected - 82% above expected",
    },
    {
      id: "anom-002",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: "trend_change",
      metric: "temperature",
      severity: "Medium",
      value: 78,
      expectedValue: 65,
      description: "Temperature trend acceleration detected",
    },
    {
      id: "anom-003",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: "threshold_breach",
      metric: "vibration",
      severity: "Medium",
      value: 6.1,
      expectedValue: 4.0,
      description: "Vibration exceeded warning threshold",
    },
  ];

  return assetId === "pump-004" ? events : events.slice(1);
}

export function generateForecastData(
  historicalData: ChartDataPoint[],
  daysToForecast: number = 14
): ForecastDataPoint[] {
  const result: ForecastDataPoint[] = historicalData.map((d) => ({
    ...d,
    isForecast: false,
  }));

  if (historicalData.length < 7) return result;

  const recentValues = historicalData.slice(-7).map((d) => d.value);
  const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const trend =
    (recentValues[recentValues.length - 1] - recentValues[0]) / recentValues.length;

  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  const variance = Math.abs(trend) * 2 + avgRecent * 0.1;

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);

    const baseValue = avgRecent + trend * i;
    const value = Math.max(0, baseValue + (Math.random() - 0.5) * variance * 0.5);

    result.push({
      date: forecastDate.toISOString().split("T")[0],
      value: Math.round(value * 100) / 100,
      isForecast: true,
      confidenceLower: Math.max(0, value - variance * Math.sqrt(i) * 0.5),
      confidenceUpper: value + variance * Math.sqrt(i) * 0.5,
    });
  }

  return result;
}

export async function getEnhancedInsight(
  assetId: string
): Promise<EnhancedInsight | null> {
  await delay(400);

  if (assetId !== "pump-004" && assetId !== "pump-002") return null;

  const insights: Record<string, EnhancedInsight> = {
    "pump-004": {
      pumpId: "pump-004",
      overallRiskScore: 87,
      maintenanceUrgency: "Immediate",
      predictions: [
        {
          failureType: "Bearing Failure",
          probability: 85,
          severity: "Critical",
          rootCause: "Advanced bearing degradation with metal particle detection",
          recommendedAction: "Emergency bearing replacement within 48 hours",
          estimatedTAT: "4-8 hours",
          riskScore: 87,
          forecastDaysToFailure: 12,
        },
        {
          failureType: "Overheating",
          probability: 65,
          severity: "High",
          rootCause: "Friction-induced heating from bearing wear",
          recommendedAction: "Address after bearing replacement",
          estimatedTAT: "1-2 hours",
          riskScore: 68,
          forecastDaysToFailure: 18,
        },
      ],
      summary:
        "Critical bearing failure imminent. Immediate intervention required to prevent catastrophic failure and secondary damage.",
      analyzedAt: new Date().toISOString(),
      reasoning: {
        conclusion:
          "Bearing failure at Stage 3 with high confidence based on multiple correlated indicators",
        confidence: 89,
        factors: [
          {
            factor: "RMS Vibration Level",
            weight: 0.35,
            contribution: "negative",
            evidence: "7.2 mm/s RMS - 80% above baseline, bearing defect frequencies present",
          },
          {
            factor: "Temperature Trend",
            weight: 0.25,
            contribution: "negative",
            evidence: "92°C and rising - friction-induced heating pattern",
          },
          {
            factor: "Vibration Trend",
            weight: 0.2,
            contribution: "negative",
            evidence: "23% increase over past 7 days - accelerating degradation",
          },
          {
            factor: "Alert History",
            weight: 0.15,
            contribution: "negative",
            evidence: "4 high-severity alerts in past 48 hours",
          },
          {
            factor: "Operating Hours",
            weight: 0.05,
            contribution: "neutral",
            evidence: "Within expected service interval",
          },
        ],
        alternativeHypotheses: [
          {
            hypothesis: "Lubrication failure causing symptoms",
            probability: 15,
            reason: "Would show different thermal pattern",
          },
          {
            hypothesis: "Coupling misalignment",
            probability: 10,
            reason: "2x vibration not dominant",
          },
        ],
      },
      degradationStage: 3,
      mitigationChecklist: [
        { item: "Order replacement bearing assembly", completed: false, priority: "high" },
        { item: "Schedule maintenance window", completed: false, priority: "high" },
        { item: "Prepare backup pump", completed: true, priority: "high" },
        { item: "Notify operations of planned outage", completed: false, priority: "medium" },
        { item: "Arrange technician availability", completed: false, priority: "high" },
        { item: "Review shaft condition", completed: false, priority: "medium" },
      ],
      costImpact: {
        ifNoAction: 145000,
        withMitigation: 12000,
        savings: 133000,
      },
    },
    "pump-002": {
      pumpId: "pump-002",
      overallRiskScore: 58,
      maintenanceUrgency: "Urgent",
      predictions: [
        {
          failureType: "Imbalance",
          probability: 70,
          severity: "Medium",
          rootCause: "Rotor imbalance causing elevated 1x vibration",
          recommendedAction: "Schedule dynamic balancing",
          estimatedTAT: "2-3 hours",
          riskScore: 55,
          forecastDaysToFailure: 42,
        },
      ],
      summary:
        "Developing imbalance condition. Schedule maintenance within 1-2 weeks to prevent escalation.",
      analyzedAt: new Date().toISOString(),
      reasoning: {
        conclusion: "Rotor imbalance at Stage 2 based on vibration signature",
        confidence: 78,
        factors: [
          {
            factor: "1x RPM Vibration",
            weight: 0.4,
            contribution: "negative",
            evidence: "4.8 mm/s at 1x - classic imbalance signature",
          },
          {
            factor: "Temperature",
            weight: 0.25,
            contribution: "neutral",
            evidence: "78°C - slightly elevated but stable",
          },
          {
            factor: "Vibration Pattern",
            weight: 0.2,
            contribution: "negative",
            evidence: "Consistent radial vibration pattern",
          },
          {
            factor: "Operating History",
            weight: 0.15,
            contribution: "neutral",
            evidence: "No recent maintenance or changes",
          },
        ],
        alternativeHypotheses: [
          {
            hypothesis: "Bent shaft",
            probability: 20,
            reason: "Would show different phase relationship",
          },
          {
            hypothesis: "Foundation looseness",
            probability: 15,
            reason: "Would show harmonics",
          },
        ],
      },
      degradationStage: 2,
      mitigationChecklist: [
        { item: "Perform detailed vibration analysis", completed: true, priority: "high" },
        { item: "Check for deposit buildup", completed: false, priority: "medium" },
        { item: "Schedule balancing service", completed: false, priority: "high" },
        { item: "Inspect coupling condition", completed: false, priority: "low" },
      ],
      costImpact: {
        ifNoAction: 45000,
        withMitigation: 3500,
        savings: 41500,
      },
    },
  };

  return insights[assetId] || null;
}
