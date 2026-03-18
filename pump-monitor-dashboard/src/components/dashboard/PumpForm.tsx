import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";

interface PumpFormProps {
  defaultPumpId?: string;
  onSubmittedStatus?: (status: string) => void;
}

interface EdgeFunctionResponse {
  success: boolean;
  status?: string;
  [key: string]: unknown;
}

export function PumpForm({ defaultPumpId, onSubmittedStatus }: PumpFormProps) {
  const [pumpId, setPumpId] = useState(defaultPumpId ?? "");
  const [ax, setAx] = useState("");
  const [ay, setAy] = useState("");
  const [az, setAz] = useState("");
  const [rms, setRms] = useState("");
  const [temperature, setTemperature] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as
      | string
      | undefined;
    const anonKey = import.meta.env
      .VITE_SUPABASE_ANON_KEY as string | undefined;

    if (!supabaseUrl || !anonKey) {
      setError("Supabase environment variables are not configured.");
      return;
    }

    if (!pumpId || !rms || !temperature) {
      setError("Pump ID, RMS, and Temperature are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const baseUrl = supabaseUrl.replace(/\/$/, "");
    const functionUrl = `${baseUrl}/functions/v1/generate-insights`;

    const numericOrNull = (value: string) => {
      if (value === "") return null;
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    };

    const payload = {
      pump_id: pumpId,
      ax: numericOrNull(ax),
      ay: numericOrNull(ay),
      az: numericOrNull(az),
      rms: numericOrNull(rms),
      temperature: numericOrNull(temperature),
    };

    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        setError(
          text || `Edge function error (HTTP ${response.status.toString()})`
        );
        setSubmitting(false);
        return;
      }

      const data = (await response.json()) as EdgeFunctionResponse;
      if (data.success && data.status) {
        setLastStatus(data.status);
        onSubmittedStatus?.(data.status);
      } else {
        setError("Edge function did not return a valid status.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  const statusVariant =
    lastStatus === "Critical"
      ? "destructive"
      : lastStatus === "Warning"
      ? "warning"
      : "success";

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base">Submit Pump Reading</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 md:grid-cols-3 lg:grid-cols-6 items-end"
        >
          <div className="md:col-span-2">
            <Label htmlFor="pump-id">Pump ID</Label>
            <Input
              id="pump-id"
              value={pumpId}
              onChange={(e) => setPumpId(e.target.value)}
              placeholder="pump-001"
            />
          </div>
          <div>
            <Label htmlFor="ax">ax</Label>
            <Input
              id="ax"
              value={ax}
              onChange={(e) => setAx(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div>
            <Label htmlFor="ay">ay</Label>
            <Input
              id="ay"
              value={ay}
              onChange={(e) => setAy(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div>
            <Label htmlFor="az">az</Label>
            <Input
              id="az"
              value={az}
              onChange={(e) => setAz(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div>
            <Label htmlFor="rms">RMS</Label>
            <Input
              id="rms"
              value={rms}
              onChange={(e) => setRms(e.target.value)}
              placeholder="e.g. 6.2"
              required
            />
          </div>
          <div>
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="e.g. 85"
              required
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full md:w-auto"
            >
              {submitting ? "Submitting..." : "Submit Reading"}
            </Button>
            {lastStatus && (
              <Badge variant={statusVariant} className="mt-4">
                Last status: {lastStatus}
              </Badge>
            )}
          </div>
        </form>
        {error && (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

