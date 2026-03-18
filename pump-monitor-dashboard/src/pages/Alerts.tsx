import { useEffect, useState } from "react";
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
import { Skeleton } from "../components/ui/skeleton";
import { mockApi } from "../services/mockApi";
import type { Alert, Pump } from "../types";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Filter,
  Clock,
  Activity,
  Thermometer,
  Heart,
  Wrench,
} from "lucide-react";
import { formatDateTime } from "../lib/utils";

type FilterSeverity = "all" | "critical" | "high" | "medium" | "low";
type FilterType = "all" | "vibration" | "temperature" | "health" | "maintenance";
type FilterStatus = "all" | "unacknowledged" | "acknowledged";

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPump, setFilterPump] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [alertsData, pumpsData] = await Promise.all([
        mockApi.getAlerts(),
        mockApi.getPumps(),
      ]);
      setAlerts(alertsData);
      setPumps(pumpsData);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    await mockApi.acknowledgeAlert(alertId);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity !== "all" && alert.severity !== filterSeverity)
      return false;
    if (filterType !== "all" && alert.type !== filterType) return false;
    if (filterStatus === "unacknowledged" && alert.acknowledged) return false;
    if (filterStatus === "acknowledged" && !alert.acknowledged) return false;
    if (filterPump !== "all" && alert.pumpId !== filterPump) return false;
    return true;
  });

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "low":
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: Alert["type"]) => {
    switch (type) {
      case "vibration":
        return <Activity className="h-4 w-4" />;
      case "temperature":
        return <Thermometer className="h-4 w-4" />;
      case "health":
        return <Heart className="h-4 w-4" />;
      case "maintenance":
        return <Wrench className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: Alert["severity"]) => {
    const variants: Record<Alert["severity"], "destructive" | "warning" | "secondary"> = {
      critical: "destructive",
      high: "destructive",
      medium: "warning",
      low: "secondary",
    };
    return (
      <Badge variant={variants[severity]} className="capitalize">
        {severity}
      </Badge>
    );
  };

  const alertStats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Alerts"
        subtitle="Monitor and manage system alerts"
      />

      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-3xl font-bold">{alertStats.total}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                  <p className="text-3xl font-bold text-destructive">
                    {alertStats.critical}
                  </p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unacknowledged</p>
                  <p className="text-3xl font-bold text-warning">
                    {alertStats.unacknowledged}
                  </p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Alert List</CardTitle>
                <CardDescription>
                  {filteredAlerts.length} alerts matching filters
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filters:</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <Select
                value={filterSeverity}
                onValueChange={(v) => setFilterSeverity(v as FilterSeverity)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterType}
                onValueChange={(v) => setFilterType(v as FilterType)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vibration">Vibration</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as FilterStatus)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPump} onValueChange={setFilterPump}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pump" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pumps</SelectItem>
                  {pumps.map((pump) => (
                    <SelectItem key={pump.id} value={pump.id}>
                      {pump.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No alerts found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`rounded-lg border p-4 transition-all ${
                        alert.acknowledged
                          ? "opacity-60 bg-muted/30"
                          : alert.severity === "critical" ||
                            alert.severity === "high"
                          ? "border-destructive/30 bg-destructive/5"
                          : alert.severity === "medium"
                          ? "border-warning/30 bg-warning/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">{alert.message}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {getTypeIcon(alert.type)}
                                <span className="capitalize">{alert.type}</span>
                              </span>
                              <span>•</span>
                              <span>{alert.pumpName}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(alert.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getSeverityBadge(alert.severity)}
                          {alert.acknowledged ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span>Acknowledged</span>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
