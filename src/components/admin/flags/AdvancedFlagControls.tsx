import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AdvancedFlagState = {
  cohort_rules_text: string; // JSON as text
  ab_test_config_text: string; // JSON as text
  rollout_strategy: "immediate" | "gradual" | "scheduled";
  rollout_start_date: string; // datetime-local value
  rollout_end_date: string;   // datetime-local value
};

type Props = {
  value: AdvancedFlagState;
  onChange: (next: AdvancedFlagState) => void;
};

const AdvancedFlagControls = ({ value, onChange }: Props) => {
  return (
    <div className="space-y-4 pt-2 border-t">
      <div>
        <Label htmlFor="cohort_rules">Cohort rules (JSON)</Label>
        <Textarea
          id="cohort_rules"
          placeholder='e.g. { "subscription_tiers": ["premium", "pro"], "min_level": 5 }'
          value={value.cohort_rules_text}
          onChange={(e) => onChange({ ...value, cohort_rules_text: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Define who should see the feature. Leave empty for everyone.
        </p>
      </div>

      <div>
        <Label htmlFor="ab_test_config">A/B test config (JSON)</Label>
        <Textarea
          id="ab_test_config"
          placeholder='e.g. { "variants": ["control", "variantA"] }'
          value={value.ab_test_config_text}
          onChange={(e) => onChange({ ...value, ab_test_config_text: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Provide variants array to enable A/B testing. Leave empty to disable A/B test.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label>Rollout strategy</Label>
          <Select
            value={value.rollout_strategy}
            onValueChange={(val) =>
              onChange({ ...value, rollout_strategy: val as AdvancedFlagState["rollout_strategy"] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="gradual">Gradual</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="rollout_start">Rollout start (optional)</Label>
          <Input
            id="rollout_start"
            type="datetime-local"
            value={value.rollout_start_date}
            onChange={(e) => onChange({ ...value, rollout_start_date: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="rollout_end">Rollout end (optional)</Label>
          <Input
            id="rollout_end"
            type="datetime-local"
            value={value.rollout_end_date}
            onChange={(e) => onChange({ ...value, rollout_end_date: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedFlagControls;
