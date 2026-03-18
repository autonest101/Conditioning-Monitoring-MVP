import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { supabase } from "../../lib/supabaseClient";

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

function formatNumber(v: number | null, digits = 2) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toFixed(digits);
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LiveSensorPanel() {
  const [latest, setLatest] = useState<PumpReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      setLoading(false);
      setError("Supabase telemetry not configured.");
      return () => {
        isMounted = false;
      };
    }

    const client = supabase;

    const fetchLatest = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await client
        .from("pump_readings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!isMounted) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setLatest((data?.[0] as PumpReading | undefined) ?? null);
      setLoading(false);
    };

    fetchLatest();

    const channel = client
      .channel("public:pump_readings:live-sensor")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pump_readings" },
        (payload) => {
          if (!isMounted) return;
          setLatest(payload.new as PumpReading);
        }
      )
      .subscribe((status) => {
        if (!isMounted) return;
        if (status === "CHANNEL_ERROR") {
          setError("Realtime subscription error.");
        }
      });

    return () => {
      isMounted = false;
      client.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="glass gradient-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Live Sensor Telemetry</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg border p-3">
                <Skeleton className="h-3 w-10 mb-2" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : !latest ? (
          <p className="text-sm text-muted-foreground">
            Waiting for sensor data...
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Pump</p>
                <p className="text-sm font-medium">{latest.pump_id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Timestamp</p>
                <p className="text-sm font-medium">
                  {formatTimestamp(latest.created_at)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 bg-card/60">
                <p className="text-xs text-muted-foreground">AX</p>
                <p className="text-lg font-semibold">{formatNumber(latest.ax)}</p>
              </div>
              <div className="rounded-lg border p-3 bg-card/60">
                <p className="text-xs text-muted-foreground">AY</p>
                <p className="text-lg font-semibold">{formatNumber(latest.ay)}</p>
              </div>
              <div className="rounded-lg border p-3 bg-card/60">
                <p className="text-xs text-muted-foreground">AZ</p>
                <p className="text-lg font-semibold">{formatNumber(latest.az)}</p>
              </div>
              <div className="rounded-lg border p-3 bg-card/60">
                <p className="text-xs text-muted-foreground">RMS</p>
                <p className="text-lg font-semibold">
                  {formatNumber(latest.rms)}
                </p>
              </div>
              <div className="rounded-lg border p-3 bg-card/60">
                <p className="text-xs text-muted-foreground">Temperature (°C)</p>
                <p className="text-lg font-semibold">
                  {formatNumber(latest.temperature, 1)}
                </p>
              </div>
              <div className="rounded-lg border p-3 bg-card/60">
                <p className="text-xs text-muted-foreground">Reading ID</p>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {latest.id}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

