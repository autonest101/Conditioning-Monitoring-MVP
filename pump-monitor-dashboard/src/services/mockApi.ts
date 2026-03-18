import type {
  Pump,
  PumpSummary,
  Alert,
  ChartDataPoint,
  PumpDetails,
} from "../types";

const pumps: Pump[] = [
  {
    id: "pump-001",
    name: "Primary Coolant Pump A",
    location: "Building A - Floor 1",
    model: "CP-5000X",
    installDate: "2023-03-15",
    lastMaintenance: "2025-12-10",
    status: "Normal",
  },
  {
    id: "pump-002",
    name: "Secondary Coolant Pump B",
    location: "Building A - Floor 2",
    model: "CP-5000X",
    installDate: "2023-03-15",
    lastMaintenance: "2025-11-28",
    status: "Warning",
  },
  {
    id: "pump-003",
    name: "Booster Pump C",
    location: "Building B - Basement",
    model: "BP-3200",
    installDate: "2022-08-20",
    lastMaintenance: "2025-10-15",
    status: "Normal",
  },
  {
    id: "pump-004",
    name: "Transfer Pump D",
    location: "Building C - Floor 1",
    model: "TP-2100",
    installDate: "2024-01-10",
    lastMaintenance: "2026-01-05",
    status: "Critical",
  },
  {
    id: "pump-005",
    name: "Circulation Pump E",
    location: "Building A - Floor 3",
    model: "CP-5000X",
    installDate: "2023-06-22",
    lastMaintenance: "2025-12-20",
    status: "Normal",
  },
];

const pumpSummaries: Record<string, PumpSummary> = {
  "pump-001": {
    pumpId: "pump-001",
    healthScore: 94,
    rmsVibration: 2.3,
    temperature: 65,
    status: "Normal",
    lastUpdated: new Date().toISOString(),
  },
  "pump-002": {
    pumpId: "pump-002",
    healthScore: 72,
    rmsVibration: 4.8,
    temperature: 78,
    status: "Warning",
    lastUpdated: new Date().toISOString(),
  },
  "pump-003": {
    pumpId: "pump-003",
    healthScore: 88,
    rmsVibration: 2.8,
    temperature: 62,
    status: "Normal",
    lastUpdated: new Date().toISOString(),
  },
  "pump-004": {
    pumpId: "pump-004",
    healthScore: 45,
    rmsVibration: 7.2,
    temperature: 92,
    status: "Critical",
    lastUpdated: new Date().toISOString(),
  },
  "pump-005": {
    pumpId: "pump-005",
    healthScore: 91,
    rmsVibration: 2.1,
    temperature: 58,
    status: "Normal",
    lastUpdated: new Date().toISOString(),
  },
};

const generateHistoricalData = (
  baseValue: number,
  variance: number,
  days: number,
  trend: "stable" | "increasing" | "decreasing" = "stable"
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    let trendAdjustment = 0;
    if (trend === "increasing") {
      trendAdjustment = ((days - i) / days) * variance * 0.5;
    } else if (trend === "decreasing") {
      trendAdjustment = -((days - i) / days) * variance * 0.5;
    }

    const randomVariance = (Math.random() - 0.5) * variance;
    const value = Math.max(0, baseValue + randomVariance + trendAdjustment);

    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(value * 100) / 100,
    });
  }

  return data;
};

const vibrationHistory: Record<string, ChartDataPoint[]> = {
  "pump-001": generateHistoricalData(2.3, 0.8, 30, "stable"),
  "pump-002": generateHistoricalData(4.2, 1.5, 30, "increasing"),
  "pump-003": generateHistoricalData(2.8, 0.6, 30, "stable"),
  "pump-004": generateHistoricalData(6.5, 2.0, 30, "increasing"),
  "pump-005": generateHistoricalData(2.1, 0.5, 30, "stable"),
};

const temperatureHistory: Record<string, ChartDataPoint[]> = {
  "pump-001": generateHistoricalData(65, 8, 30, "stable"),
  "pump-002": generateHistoricalData(75, 10, 30, "increasing"),
  "pump-003": generateHistoricalData(62, 6, 30, "stable"),
  "pump-004": generateHistoricalData(88, 12, 30, "increasing"),
  "pump-005": generateHistoricalData(58, 5, 30, "stable"),
};

const alerts: Alert[] = [
  {
    id: "alert-001",
    pumpId: "pump-004",
    pumpName: "Transfer Pump D",
    type: "vibration",
    severity: "critical",
    message: "Vibration levels exceeded critical threshold (7.2 mm/s RMS)",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-002",
    pumpId: "pump-004",
    pumpName: "Transfer Pump D",
    type: "temperature",
    severity: "high",
    message: "Operating temperature above safe limit (92°C)",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-003",
    pumpId: "pump-002",
    pumpName: "Secondary Coolant Pump B",
    type: "vibration",
    severity: "medium",
    message: "Vibration trend showing gradual increase over past week",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-004",
    pumpId: "pump-002",
    pumpName: "Secondary Coolant Pump B",
    type: "health",
    severity: "medium",
    message: "Health score dropped below 75% threshold",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    acknowledged: true,
  },
  {
    id: "alert-005",
    pumpId: "pump-003",
    pumpName: "Booster Pump C",
    type: "maintenance",
    severity: "low",
    message: "Scheduled maintenance due in 15 days",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    acknowledged: true,
  },
  {
    id: "alert-006",
    pumpId: "pump-001",
    pumpName: "Primary Coolant Pump A",
    type: "maintenance",
    severity: "low",
    message: "Filter replacement recommended",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    acknowledged: true,
  },
  {
    id: "alert-007",
    pumpId: "pump-004",
    pumpName: "Transfer Pump D",
    type: "health",
    severity: "critical",
    message: "Health score critically low - immediate inspection required",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-008",
    pumpId: "pump-005",
    pumpName: "Circulation Pump E",
    type: "vibration",
    severity: "low",
    message: "Minor vibration spike detected - monitoring",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    acknowledged: true,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  getPumps: async (): Promise<Pump[]> => {
    await delay(300);
    return pumps;
  },

  getPumpById: async (id: string): Promise<Pump | undefined> => {
    await delay(200);
    return pumps.find((p) => p.id === id);
  },

  getPumpSummary: async (pumpId: string): Promise<PumpSummary | undefined> => {
    await delay(250);
    return pumpSummaries[pumpId];
  },

  getAllPumpSummaries: async (): Promise<PumpSummary[]> => {
    await delay(300);
    return Object.values(pumpSummaries);
  },

  getVibrationHistory: async (
    pumpId: string
  ): Promise<ChartDataPoint[]> => {
    await delay(400);
    return vibrationHistory[pumpId] || [];
  },

  getTemperatureHistory: async (
    pumpId: string
  ): Promise<ChartDataPoint[]> => {
    await delay(400);
    return temperatureHistory[pumpId] || [];
  },

  getAlerts: async (pumpId?: string): Promise<Alert[]> => {
    await delay(300);
    if (pumpId) {
      return alerts.filter((a) => a.pumpId === pumpId);
    }
    return alerts;
  },

  getRecentAlerts: async (limit: number = 5): Promise<Alert[]> => {
    await delay(200);
    return alerts
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  },

  acknowledgeAlert: async (alertId: string): Promise<boolean> => {
    await delay(200);
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  },

  getPumpDetails: async (pumpId: string): Promise<PumpDetails | undefined> => {
    await delay(350);
    const pump = pumps.find((p) => p.id === pumpId);
    const summary = pumpSummaries[pumpId];

    if (!pump || !summary) return undefined;

    return {
      ...pump,
      summary,
      specifications: {
        power: pump.model === "CP-5000X" ? "75 kW" : pump.model === "BP-3200" ? "45 kW" : "30 kW",
        flowRate: pump.model === "CP-5000X" ? "500 m³/h" : pump.model === "BP-3200" ? "300 m³/h" : "200 m³/h",
        headPressure: pump.model === "CP-5000X" ? "120 m" : pump.model === "BP-3200" ? "80 m" : "50 m",
        efficiency: pump.model === "CP-5000X" ? "92%" : pump.model === "BP-3200" ? "88%" : "85%",
      },
    };
  },

  getUnacknowledgedAlertCount: async (): Promise<number> => {
    await delay(100);
    return alerts.filter((a) => !a.acknowledged).length;
  },
};
