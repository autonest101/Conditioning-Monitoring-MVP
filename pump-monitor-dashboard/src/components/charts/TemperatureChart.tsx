import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { ChartDataPoint } from "../../types";

interface TemperatureChartProps {
  data: ChartDataPoint[];
  title?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export function TemperatureChart({
  data,
  title = "Temperature Trend (30 Days)",
  warningThreshold = 75,
  criticalThreshold = 85,
}: TemperatureChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
                labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                formatter={(value) => [`${(value as number).toFixed(1)}°C`, "Temperature"]}
              />
              <ReferenceLine
                y={warningThreshold}
                stroke="hsl(var(--warning))"
                strokeDasharray="5 5"
                label={{
                  value: "Warning",
                  position: "right",
                  fill: "hsl(var(--warning))",
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={criticalThreshold}
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                label={{
                  value: "Critical",
                  position: "right",
                  fill: "hsl(var(--destructive))",
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#f97316",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
