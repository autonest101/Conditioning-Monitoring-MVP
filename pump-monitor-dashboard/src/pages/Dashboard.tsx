import { useEffect, useState, useMemo } from "react";
import { Header } from "../components/layout/Header";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import { StatusBadge } from "../components/dashboard/StatusBadge";
import { PumpSelector } from "../components/dashboard/PumpSelector";
import { RecentAlerts } from "../components/dashboard/RecentAlerts";
import { VibrationChart } from "../components/charts/VibrationChart";
import { TemperatureChart } from "../components/charts/TemperatureChart";
import { AIInsightsPanel } from "../components/ai/AIInsightsPanel";
import { RiskRadar } from "../modules/risk-radar/RiskRadar";
import { PumpForm } from "../components/dashboard/PumpForm";
import { LiveSensorPanel } from "../components/dashboard/LiveSensorPanel";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { mockApi } from "../services/mockApi";
import { supabase } from "../lib/supabaseClient";
import type {
  Pump,
  PumpSummary,
  Alert,
  ChartDataPoint,
  AIAnalysisInput,
} from "../types";
import { Heart, Activity, Thermometer, Gauge } from "lucide-react";

type PumpReading = {
  id: string;
  pump_id: string;
  ax: number | null;
  ay: number | null;
  az: number | null;
  rms: number | null;
  temperature: number | null;
  created_at: string;
};

type PumpInsightRow = {
  id: string;
  pump_id: string;
  health_score: number | null;
  failure_type: string | null;
  severity: string | null; // LOW | MEDIUM | HIGH (per backend) but keep flexible
  recommendation: string | null;
  tat_hours: number | null;
  generated_at: string;
};

export function Dashboard() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [selectedPumpId, setSelectedPumpId] = useState<string>("");
  const [summary, setSummary] = useState<PumpSummary | null>(null);
  const [vibrationData, setVibrationData] = useState<ChartDataPoint[]>([]);
  const [temperatureData, setTemperatureData] = useState<ChartDataPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pumpAlerts, setPumpAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestInsight, setLatestInsight] = useState<PumpInsightRow | null>(
    null
  );
  const [insightError, setInsightError] = useState<string | null>(null);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);
  const [latestReading, setLatestReading] = useState<PumpReading | null>(null);

  useEffect(() => {
    const loadPumps = async () => {
      const pumpList = await mockApi.getPumps();
      setPumps(pumpList);
      if (pumpList.length > 0) {
        setSelectedPumpId(pumpList[0].id);
      }
    };
    loadPumps();
  }, []);

  useEffect(() => {
    if (!selectedPumpId) return;

    const loadPumpData = async () => {
      setLoading(true);
      // Keep non-telemetry features on mock for now (alerts, pump list, etc.).
      // Telemetry and charts will be Supabase-driven below.
      const [recentAlerts, pumpSpecificAlerts] = await Promise.all([
        mockApi.getRecentAlerts(6),
        mockApi.getAlerts(selectedPumpId),
      ]);

      setAlerts(recentAlerts);
      setPumpAlerts(pumpSpecificAlerts);
      setLoading(false);
    };

    loadPumpData();
  }, [selectedPumpId]);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setTelemetryError("Live telemetry unavailable");
      setVibrationData([]);
      setTemperatureData([]);
      setLatestReading(null);
      return () => {
        isMounted = false;
      };
    }

    const client = supabase;

    const fetchInitialTelemetry = async () => {
      setTelemetryError(null);

      const [latestRes, vibRes, tempRes] = await Promise.all([
        client
          .from("pump_readings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1),
        client
          .from("pump_readings")
          .select("rms,created_at")
          .order("created_at", { ascending: false })
          .limit(60),
        client
          .from("pump_readings")
          .select("temperature,created_at")
          .order("created_at", { ascending: false })
          .limit(60),
      ]);

      if (!isMounted) return;

      if (latestRes.error) {
        setTelemetryError(latestRes.error.message);
      } else {
        setLatestReading((latestRes.data?.[0] as PumpReading | undefined) ?? null);
      }

      if (vibRes.error) {
        setTelemetryError(vibRes.error.message);
      } else {
        const points = (vibRes.data ?? [])
          .map((r) => ({
            date: (r as { created_at: string }).created_at,
            value: (r as { rms: number | null }).rms ?? 0,
          }))
          .reverse();
        setVibrationData(points.slice(-60));
      }

      if (tempRes.error) {
        setTelemetryError(tempRes.error.message);
      } else {
        const points = (tempRes.data ?? [])
          .map((r) => ({
            date: (r as { created_at: string }).created_at,
            value: (r as { temperature: number | null }).temperature ?? 0,
          }))
          .reverse();
        setTemperatureData(points.slice(-60));
      }
    };

    fetchInitialTelemetry();

    const channel = client
      .channel("pump_readings_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pump_readings" },
        (payload) => {
          if (!isMounted) return;
          const row = payload.new as PumpReading;
          setLatestReading(row);

          setVibrationData((prev) => {
            const next = [...prev, { date: row.created_at, value: row.rms ?? 0 }];
            return next.slice(-60);
          });
          setTemperatureData((prev) => {
            const next = [
              ...prev,
              { date: row.created_at, value: row.temperature ?? 0 },
            ];
            return next.slice(-60);
          });
        }
      )
      .subscribe((status) => {
        if (!isMounted) return;
        if (status === "CHANNEL_ERROR") {
          setTelemetryError("Realtime subscription error.");
        }
      });

    return () => {
      isMounted = false;
      client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setInsightError(
        "Supabase is not configured. Live insights will be disabled."
      );
      return () => {
        isMounted = false;
      };
    }

    const client = supabase;
    const fetchLatestInsight = async () => {
      if (!client) return;
      const { data, error } = await client
        .from("pump_insights")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(1);

      if (!isMounted) return;
      if (error) {
        setInsightError(error.message);
        return;
      }
      if (data && data.length > 0) {
        setLatestInsight(data[0] as PumpInsightRow);
      }
    };

    fetchLatestInsight();

    if (!client) {
      return () => {
        isMounted = false;
      };
    }

    const channel = client
      .channel("public:pump_insights")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pump_insights" },
        (payload) => {
          if (!isMounted) return;
          setLatestInsight(payload.new as PumpInsightRow);
        }
      )
      .subscribe((status) => {
        if (!isMounted) return;
        if (status === "CHANNEL_ERROR") {
          setInsightError("Realtime subscription error.");
        }
      });

    return () => {
      isMounted = false;
      client.removeChannel(channel);
    };
  }, []);

  const aiInput: AIAnalysisInput | null = useMemo(() => {
    if (!selectedPumpId) return null;
    if (!latestReading || !latestInsight) return null;

    const rms = latestReading.rms ?? 0;

    return {
      pumpId: selectedPumpId,
      rmsVibration: rms,
      temperature: latestReading.temperature ?? 0,
      vibrationHistory: vibrationData,
      temperatureHistory: temperatureData,
      alerts: pumpAlerts,
      healthScore: latestInsight.health_score ?? 0,
    };
  }, [
    selectedPumpId,
    latestReading,
    vibrationData,
    temperatureData,
    pumpAlerts,
    latestInsight,
  ]);

  useEffect(() => {
    // Derive top summary from latest AI insight (single source of truth) + latest reading
    if (!selectedPumpId) return;
    if (!latestReading || !latestInsight) return;

    const rms = latestReading.rms ?? 0;
    const temp = latestReading.temperature ?? 0;

    const sev = (latestInsight.severity ?? "").toString().toUpperCase();
    let computedStatus: PumpSummary["status"] = "Normal";
    if (sev === "HIGH" || sev === "CRITICAL") {
      computedStatus = "Critical";
    } else if (sev === "MEDIUM" || sev === "WARNING" || sev === "WARN") {
      computedStatus = "Warning";
    }

    setSummary({
      pumpId: latestInsight.pump_id ?? latestReading.pump_id ?? selectedPumpId,
      healthScore: latestInsight.health_score ?? 0,
      rmsVibration: rms,
      temperature: temp,
      status: computedStatus,
      lastUpdated:
        latestInsight.generated_at ?? latestReading.created_at,
    });
  }, [selectedPumpId, latestReading, latestInsight]);

  const getHealthVariant = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  };

  const getVibrationVariant = (value: number) => {
    if (value < 4) return "success";
    if (value < 6) return "warning";
    return "destructive";
  };

  const getTempVariant = (value: number) => {
    if (value < 75) return "success";
    if (value < 85) return "warning";
    return "destructive";
  };

  const getInsightBadgeVariant = (severity: string) => {
    const normalized = severity.toLowerCase();
    if (normalized === "high" || normalized === "critical")
      return { variant: "destructive" as const, color: "text-destructive" };
    if (normalized === "medium" || normalized === "warning" || normalized === "warn")
      return { variant: "warning" as const, color: "text-amber-400" };
    return { variant: "success" as const, color: "text-emerald-400" };
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Reliability Operating System"
        subtitle="AI-powered predictive maintenance intelligence"
      />

      <div className="p-6 space-y-6">
        <RiskRadar />

        {latestInsight && (
          <Card className="glass gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>AI Diagnosis</span>
                <span className="text-xs text-muted-foreground">
                  Pump {latestInsight.pump_id} •{" "}
                  {new Date(latestInsight.generated_at).toLocaleString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Severity:
                  </span>
                  {(() => {
                    const sev = (latestInsight.severity ?? "LOW").toUpperCase();
                    const { variant, color } = getInsightBadgeVariant(
                      latestInsight.severity ?? "LOW"
                    );
                    return (
                      <Badge variant={variant} className="px-3 py-1 text-xs">
                        <span className={color}>{sev}</span>
                      </Badge>
                    );
                  })()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Health Score:{" "}
                  <span className="font-semibold text-emerald-400">
                    {latestInsight.health_score ?? 0}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Recommendation
                  </p>
                  <p className="text-sm">
                    {latestInsight.recommendation ??
                      "No recommendation available."}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Maintenance TAT
                  </p>
                  <p className="text-sm font-medium">
                    {latestInsight.tat_hours != null
                      ? `${latestInsight.tat_hours} hours`
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!latestInsight && (
          <p className="text-xs text-muted-foreground">
            Awaiting AI insight...
          </p>
        )}

        {insightError && (
          <p className="text-xs text-destructive" role="alert">
            {insightError}
          </p>
        )}

        {telemetryError && (
          <p className="text-xs text-destructive" role="alert">
            {telemetryError}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <PumpSelector
              pumps={pumps}
              selectedPumpId={selectedPumpId}
              onPumpChange={setSelectedPumpId}
            />
            {summary && <StatusBadge status={summary.status} size="lg" />}
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated:{" "}
            {summary
              ? new Date(summary.lastUpdated).toLocaleTimeString()
              : "--"}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Health Score"
              value={summary?.healthScore ?? 0}
              subtitle="Overall pump health"
              icon={Heart}
              variant={getHealthVariant(summary?.healthScore ?? 0)}
            />
            <SummaryCard
              title="RMS Vibration"
              value={`${summary?.rmsVibration.toFixed(1) ?? 0} mm/s`}
              subtitle="Current vibration level"
              icon={Activity}
              variant={getVibrationVariant(summary?.rmsVibration ?? 0)}
            />
            <SummaryCard
              title="Temperature"
              value={`${summary?.temperature ?? 0}°C`}
              subtitle="Operating temperature"
              icon={Thermometer}
              variant={getTempVariant(summary?.temperature ?? 0)}
            />
            <Card className="glass gradient-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <div className="pt-1">
                      <StatusBadge
                        status={summary?.status ?? "Normal"}
                        size="lg"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current operational state
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <LiveSensorPanel />

        <PumpForm defaultPumpId={selectedPumpId} />

        <AIInsightsPanel input={loading ? null : aiInput} />

        <div className="grid gap-6 lg:grid-cols-2">
          {loading ? (
            <>
              <Card className="glass">
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px]" />
                </CardContent>
              </Card>
              <Card className="glass">
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px]" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <VibrationChart data={vibrationData} />
              <TemperatureChart data={temperatureData} />
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Fleet Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pumps.map((pump) => (
                    <div
                      key={pump.id}
                      className={`flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md ${
                        pump.id === selectedPumpId
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => setSelectedPumpId(pump.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            pump.status === "Normal"
                              ? "bg-success"
                              : pump.status === "Warning"
                              ? "bg-warning animate-pulse"
                              : "bg-destructive animate-pulse"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{pump.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {pump.location}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={pump.status} size="sm" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <RecentAlerts alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
