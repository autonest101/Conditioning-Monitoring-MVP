import { useEffect, useState, useMemo } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Scatter,
} from "recharts";
import { Header } from "../components/layout/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { mockApi } from "../services/mockApi";
import {
  generateForecastData,
  getAnomalyEvents,
} from "../services/ai/fleetIntelligence";
import type { Pump, ChartDataPoint, ForecastDataPoint, AnomalyEvent } from "../types";
import {
  Activity,
  Thermometer,
  TrendingUp,
  AlertTriangle,
  Eye,
  EyeOff,
  Layers,
  Zap,
} from "lucide-react";
import { cn } from "../lib/utils";

type MetricType = "vibration" | "temperature" | "both";

export function Analytics() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [selectedPumpId, setSelectedPumpId] = useState<string>("");
  const [vibrationData, setVibrationData] = useState<ChartDataPoint[]>([]);
  const [temperatureData, setTemperatureData] = useState<ChartDataPoint[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForecast, setShowForecast] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [showConfidenceBand, setShowConfidenceBand] = useState(true);
  const [metricType, setMetricType] = useState<MetricType>("vibration");

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

    const loadData = async () => {
      setLoading(true);
      const [vibration, temperature, anomalyEvents] = await Promise.all([
        mockApi.getVibrationHistory(selectedPumpId),
        mockApi.getTemperatureHistory(selectedPumpId),
        getAnomalyEvents(selectedPumpId),
      ]);

      setVibrationData(vibration);
      setTemperatureData(temperature);
      setAnomalies(anomalyEvents);
      setLoading(false);
    };

    loadData();
  }, [selectedPumpId]);

  const vibrationForecast = useMemo(
    () => generateForecastData(vibrationData, 14),
    [vibrationData]
  );

  const temperatureForecast = useMemo(
    () => generateForecastData(temperatureData, 14),
    [temperatureData]
  );

  const chartData = useMemo(() => {
    const data = showForecast ? vibrationForecast : vibrationData.map(d => ({ ...d, isForecast: false }));
    
    return data.map((d) => {
      const tempPoint = (showForecast ? temperatureForecast : temperatureData).find(
        (t) => t.date === d.date
      );
      const anomaly = anomalies.find(
        (a) => a.timestamp.split("T")[0] === d.date
      );

      return {
        date: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        rawDate: d.date,
        vibration: d.value,
        vibrationLower: (d as ForecastDataPoint).confidenceLower,
        vibrationUpper: (d as ForecastDataPoint).confidenceUpper,
        temperature: tempPoint?.value,
        temperatureLower: (tempPoint as ForecastDataPoint)?.confidenceLower,
        temperatureUpper: (tempPoint as ForecastDataPoint)?.confidenceUpper,
        isForecast: (d as ForecastDataPoint).isForecast,
        anomaly: anomaly ? anomaly.value : null,
        anomalyType: anomaly?.type,
        anomalySeverity: anomaly?.severity,
      };
    });
  }, [vibrationForecast, temperatureForecast, vibrationData, temperatureData, anomalies, showForecast]);

  const forecastStartIndex = chartData.findIndex((d) => d.isForecast);

  return (
    <div className="min-h-screen">
      <Header
        title="Advanced Analytics"
        subtitle="AI-powered trend analysis and forecasting"
      />

      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select value={selectedPumpId} onValueChange={setSelectedPumpId}>
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

            <Select
              value={metricType}
              onValueChange={(v) => setMetricType(v as MetricType)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vibration">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Vibration
                  </div>
                </SelectItem>
                <SelectItem value="temperature">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Temperature
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Multi-Axis
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showForecast ? "default" : "outline"}
              size="sm"
              onClick={() => setShowForecast(!showForecast)}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Forecast
            </Button>
            <Button
              variant={showAnomalies ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAnomalies(!showAnomalies)}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Anomalies
            </Button>
            <Button
              variant={showConfidenceBand ? "default" : "outline"}
              size="sm"
              onClick={() => setShowConfidenceBand(!showConfidenceBand)}
              className="gap-2"
            >
              {showConfidenceBand ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Confidence
            </Button>
          </div>
        </div>

        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Trend Analysis with AI Forecast
                </CardTitle>
                <CardDescription>
                  Historical data with 14-day predictive extension
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-primary" />
                  <span>Historical</span>
                </div>
                {showForecast && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-primary/50 border-dashed border-t-2 border-primary" />
                    <span>Forecast</span>
                  </div>
                )}
                {showAnomalies && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span>Anomaly</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vibrationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, "auto"]}
                      label={{
                        value: metricType !== "temperature" ? "Vibration (mm/s)" : "",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))", fontSize: 10 },
                      }}
                    />
                    {metricType === "both" && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, "auto"]}
                        label={{
                          value: "Temperature (°C)",
                          angle: 90,
                          position: "insideRight",
                          style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))", fontSize: 10 },
                        }}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      formatter={(value, name) => {
                        const v = value as number;
                        if (name === "vibration") return [`${v?.toFixed(2)} mm/s`, "Vibration"];
                        if (name === "temperature") return [`${v?.toFixed(1)}°C`, "Temperature"];
                        return [v, name];
                      }}
                    />

                    {showForecast && forecastStartIndex > 0 && (
                      <ReferenceLine
                        x={chartData[forecastStartIndex]?.date}
                        stroke="hsl(var(--primary))"
                        strokeDasharray="5 5"
                        label={{
                          value: "Forecast →",
                          position: "top",
                          fill: "hsl(var(--primary))",
                          fontSize: 10,
                        }}
                      />
                    )}

                    {(metricType === "vibration" || metricType === "both") && (
                      <>
                        <ReferenceLine
                          y={4}
                          yAxisId="left"
                          stroke="hsl(var(--warning))"
                          strokeDasharray="5 5"
                        />
                        <ReferenceLine
                          y={6}
                          yAxisId="left"
                          stroke="hsl(var(--destructive))"
                          strokeDasharray="5 5"
                        />

                        {showConfidenceBand && showForecast && (
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="vibrationUpper"
                            stroke="none"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.1}
                          />
                        )}

                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="vibration"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                        />
                      </>
                    )}

                    {(metricType === "temperature" || metricType === "both") && (
                      <>
                        {metricType === "temperature" && (
                          <>
                            <ReferenceLine
                              y={75}
                              yAxisId="left"
                              stroke="hsl(var(--warning))"
                              strokeDasharray="5 5"
                            />
                            <ReferenceLine
                              y={85}
                              yAxisId="left"
                              stroke="hsl(var(--destructive))"
                              strokeDasharray="5 5"
                            />
                          </>
                        )}

                        <Line
                          yAxisId={metricType === "both" ? "right" : "left"}
                          type="monotone"
                          dataKey="temperature"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: "#f97316" }}
                        />
                      </>
                    )}

                    {showAnomalies && (
                      <Scatter
                        yAxisId="left"
                        dataKey="anomaly"
                        fill="hsl(var(--destructive))"
                        shape={(props) => {
                          const { cx, cy } = props as { cx?: number; cy?: number };
                          if (!cy || !cx) return <></>;
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={6}
                              fill="hsl(var(--destructive))"
                              stroke="hsl(var(--background))"
                              strokeWidth={2}
                            />
                          );
                        }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {showAnomalies && anomalies.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Detected Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {anomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className={cn(
                      "rounded-xl border p-4 transition-all hover:shadow-md",
                      anomaly.severity === "Critical" || anomaly.severity === "High"
                        ? "bg-destructive/5 border-destructive/20"
                        : "bg-warning/5 border-warning/20"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant={
                          anomaly.severity === "Critical" || anomaly.severity === "High"
                            ? "destructive"
                            : "warning"
                        }
                        className="text-[10px]"
                      >
                        {anomaly.severity}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(anomaly.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1 capitalize">
                      {anomaly.type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {anomaly.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <span>
                        Actual: <span className="font-medium">{anomaly.value}</span>
                      </span>
                      <span>
                        Expected: <span className="font-medium">{anomaly.expectedValue}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
