import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface VisibilityOption {
  value: string;
  label: string;
  description: string;
}

interface VisibilityRadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: VisibilityOption[];
  name: string;
}

const VisibilityRadioGroup = ({ value, onValueChange, options, name }: VisibilityRadioGroupProps) => {
  return (
    <RadioGroup value={value} onValueChange={onValueChange}>
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} className="mt-0.5" />
            <div className="flex-1">
              <Label
                htmlFor={`${name}-${option.value}`}
                className="font-medium cursor-pointer"
              >
                {option.label}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
};

export default VisibilityRadioGroup;
