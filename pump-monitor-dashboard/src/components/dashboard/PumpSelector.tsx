import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Pump } from "../../types";

interface PumpSelectorProps {
  pumps: Pump[];
  selectedPumpId: string;
  onPumpChange: (pumpId: string) => void;
}

export function PumpSelector({
  pumps,
  selectedPumpId,
  onPumpChange,
}: PumpSelectorProps) {
  return (
    <Select value={selectedPumpId} onValueChange={onPumpChange}>
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
  );
}
