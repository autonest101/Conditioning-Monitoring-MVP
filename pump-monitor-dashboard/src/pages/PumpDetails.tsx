import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { StatusBadge } from "../components/dashboard/StatusBadge";
import { VibrationChart } from "../components/charts/VibrationChart";
import { TemperatureChart } from "../components/charts/TemperatureChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { mockApi } from "../services/mockApi";
import type { Pump, PumpDetails as PumpDetailsType, ChartDataPoint, Alert } from "../types";
import {
  MapPin,
  Calendar,
  Wrench,
  Zap,
  Droplets,
  Gauge,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { formatDate, formatDateTime } from "../lib/utils";

export function PumpDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const pumpId = searchParams.get("id") || "";

  const [pumps, setPumps] = useState<Pump[]>([]);
  const [details, setDetails] = useState<PumpDetailsType | null>(null);
  const [vibrationData, setVibrationData] = useState<ChartDataPoint[]>([]);
  const [temperatureData, setTemperatureData] = useState<ChartDataPoint[]>([]);
  const [pumpAlerts, setPumpAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPumps = async () => {
      const pumpList = await mockApi.getPumps();
      setPumps(pumpList);
      if (!pumpId && pumpList.length > 0) {
        setSearchParams({ id: pumpList[0].id });
      }
    };
    loadPumps();
  }, [pumpId, setSearchParams]);

  useEffect(() => {
    if (!pumpId) return;

    const loadPumpDetails = async () => {
      setLoading(true);
      const [pumpDetails, vibration, temperature, alerts] = await Promise.all([
        mockApi.getPumpDetails(pumpId),
        mockApi.getVibrationHistory(pumpId),
        mockApi.getTemperatureHistory(pumpId),
        mockApi.getAlerts(pumpId),
      ]);

      setDetails(pumpDetails || null);
      setVibrationData(vibration);
      setTemperatureData(temperature);
      setPumpAlerts(alerts);
      setLoading(false);
    };

    loadPumpDetails();
  }, [pumpId]);

  const handlePumpChange = (newPumpId: string) => {
    setSearchParams({ id: newPumpId });
  };

  if (loading && !details) {
    return (
      <div className="min-h-screen">
        <Header title="Pump Details" subtitle="Loading..." />
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px] lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Pump Details"
        subtitle={details?.name || "Select a pump to view details"}
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Select value={pumpId} onValueChange={handlePumpChange}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a pump" />
              </SelectTrigger>
              <SelectContent>
                {pumps.map((pump) => (
                  <SelectItem key={pump.id} value={pump.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          pump.status === "Normal"
                            ? "bg-success"
                            : pump.status === "Warning"
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                      />
                      {pump.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {details && <StatusBadge status={details.status} size="lg" />}
          </div>
        </div>

        {details && (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pump Information</CardTitle>
                  <CardDescription>Equipment details and status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Gauge className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="font-medium">{details.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{details.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Install Date
                      </p>
                      <p className="font-medium">
                        {formatDate(details.installDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Wrench className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last Maintenance
                      </p>
                      <p className="font-medium">
                        {formatDate(details.lastMaintenance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Current Readings</CardTitle>
                  <CardDescription>Real-time sensor data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Health Score</span>
                      </div>
                      <p
                        className={`text-2xl font-bold ${
                          details.summary.healthScore >= 80
                            ? "text-success"
                            : details.summary.healthScore >= 60
                            ? "text-warning"
                            : "text-destructive"
                        }`}
                      >
                        {details.summary.healthScore}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Gauge className="h-4 w-4" />
                        <span className="text-sm">Vibration</span>
                      </div>
                      <p
                        className={`text-2xl font-bold ${
                          details.summary.rmsVibration < 4
                            ? "text-success"
                            : details.summary.rmsVibration < 6
                            ? "text-warning"
                            : "text-destructive"
                        }`}
                      >
                        {details.summary.rmsVibration.toFixed(1)}{" "}
                        <span className="text-sm font-normal">mm/s</span>
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm">Temperature</span>
                      </div>
                      <p
                        className={`text-2xl font-bold ${
                          details.summary.temperature < 75
                            ? "text-success"
                            : details.summary.temperature < 85
                            ? "text-warning"
                            : "text-destructive"
                        }`}
                      >
                        {details.summary.temperature}
                        <span className="text-sm font-normal">°C</span>
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Active Alerts</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {pumpAlerts.filter((a) => !a.acknowledged).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Specifications</CardTitle>
                <CardDescription>Technical specifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Power</p>
                      <p className="font-medium">
                        {details.specifications.power}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Droplets className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Flow Rate</p>
                      <p className="font-medium">
                        {details.specifications.flowRate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Gauge className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Head Pressure
                      </p>
                      <p className="font-medium">
                        {details.specifications.headPressure}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Efficiency</p>
                      <p className="font-medium">
                        {details.specifications.efficiency}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <VibrationChart
                data={vibrationData}
                title={`Vibration Trend - ${details.name}`}
              />
              <TemperatureChart
                data={temperatureData}
                title={`Temperature Trend - ${details.name}`}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert History</CardTitle>
                <CardDescription>
                  Recent alerts for this pump
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pumpAlerts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No alerts for this pump
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pumpAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-center justify-between rounded-lg border p-4 ${
                          alert.acknowledged ? "opacity-60" : ""
                        } ${
                          alert.severity === "critical" || alert.severity === "high"
                            ? "border-destructive/30 bg-destructive/5"
                            : alert.severity === "medium"
                            ? "border-warning/30 bg-warning/5"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              alert.severity === "critical" ||
                              alert.severity === "high"
                                ? "text-destructive"
                                : alert.severity === "medium"
                                ? "text-warning"
                                : "text-muted-foreground"
                            }`}
                          />
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(alert.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              alert.severity === "critical"
                                ? "bg-destructive text-destructive-foreground"
                                : alert.severity === "high"
                                ? "bg-destructive/80 text-destructive-foreground"
                                : alert.severity === "medium"
                                ? "bg-warning text-warning-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {alert.severity}
                          </span>
                          {alert.acknowledged && (
                            <span className="text-xs text-muted-foreground">
                              Acknowledged
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
