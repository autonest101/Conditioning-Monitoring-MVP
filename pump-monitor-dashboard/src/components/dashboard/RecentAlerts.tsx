import { AlertTriangle, AlertCircle, Info, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { formatDateTime } from "../../lib/utils";
import type { Alert } from "../../types";
import { useNavigate } from "react-router-dom";

interface RecentAlertsProps {
  alerts: Alert[];
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  const navigate = useNavigate();

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "low":
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBg = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 border-destructive/20";
      case "high":
        return "bg-destructive/10 border-destructive/20";
      case "medium":
        return "bg-warning/10 border-warning/20";
      case "low":
        return "bg-muted border-border";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Recent Alerts</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/alerts")}
          className="text-xs"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No recent alerts
              </p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 ${getSeverityBg(
                    alert.severity
                  )} ${alert.acknowledged ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-tight">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{alert.pumpName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
