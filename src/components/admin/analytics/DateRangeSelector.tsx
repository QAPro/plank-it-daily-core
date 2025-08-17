
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  options?: number[];
}

const DateRangeSelector = ({ value, onChange, label = "Date Range", options = [7, 30, 90] }: Props) => {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>
              Last {opt} days
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DateRangeSelector;
