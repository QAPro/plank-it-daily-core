
import { useMemo, useState } from 'react';
import type { Tables } from '@/integrations/supabase/types';
import { useExercises } from '@/hooks/useExercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp, Trash2, Plus } from 'lucide-react';

type Exercise = Tables<'plank_exercises'>;

export type BuilderItem = {
  exercise_id: string;
  duration_seconds: number;
  rest_after_seconds: number;
};

type Props = {
  initialName?: string;
  initialDescription?: string | null;
  initialDifficulty?: number;
  initialItems?: BuilderItem[];
  onSave: (payload: {
    name: string;
    description: string | null;
    difficulty_level: number;
    items: BuilderItem[];
  }) => Promise<void>;
  saving?: boolean;
};

const CustomWorkoutBuilder: React.FC<Props> = ({
  initialName = '',
  initialDescription = '',
  initialDifficulty = 1,
  initialItems = [],
  onSave,
  saving = false,
}) => {
  const { data: exercises } = useExercises();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState<string | null>(initialDescription || '');
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [items, setItems] = useState<BuilderItem[]>(initialItems);

  const [newExerciseId, setNewExerciseId] = useState<string>('');
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newRest, setNewRest] = useState<number>(15);

  const totalDuration = useMemo(
    () => items.reduce((sum, i) => sum + (i.duration_seconds || 0) + (i.rest_after_seconds || 0), 0),
    [items]
  );

  const addItem = () => {
    if (!newExerciseId) return;
    setItems(prev => [
      ...prev,
      { exercise_id: newExerciseId, duration_seconds: Math.max(5, newDuration), rest_after_seconds: Math.max(0, newRest) },
    ]);
    setNewExerciseId('');
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    setItems(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[target];
      next[target] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, patch: Partial<BuilderItem>) => {
    setItems(prev => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (items.length === 0) return;
    await onSave({
      name: name.trim(),
      description: (description || '').trim() || null,
      difficulty_level: Math.max(1, Math.min(5, difficulty || 1)),
      items,
    });
  };

  const exerciseMap = useMemo(() => {
    const map = new Map<string, Exercise>();
    (exercises || []).forEach(e => map.set(e.id, e));
    return map;
  }, [exercises]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cw-name">Name</Label>
            <Input id="cw-name" value={name} onChange={e => setName(e.target.value)} placeholder="E.g., Core Crusher" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cw-desc">Description</Label>
            <Textarea id="cw-desc" value={description || ''} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
          </div>
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <Select value={String(difficulty)} onValueChange={v => setDifficulty(parseInt(v))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Beginner</SelectItem>
                <SelectItem value="2">2 - Easy</SelectItem>
                <SelectItem value="3">3 - Moderate</SelectItem>
                <SelectItem value="4">4 - Hard</SelectItem>
                <SelectItem value="5">5 - Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Duration</div>
            <div className="text-3xl font-semibold">{totalDuration}s</div>
            <div className="text-xs text-muted-foreground mt-1">Includes rest periods</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <div className="grid md:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
          <div className="space-y-1.5">
            <Label>Exercise</Label>
            <Select value={newExerciseId} onValueChange={setNewExerciseId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {(exercises || []).map(ex => (
                  <SelectItem key={ex.id} value={ex.id}>
                    {ex.name} {ex.difficulty_level ? `(L${ex.difficulty_level})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Duration (s)</Label>
            <Input
              type="number"
              min={5}
              value={newDuration}
              onChange={e => setNewDuration(parseInt(e.target.value || '0'))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Rest (s)</Label>
            <Input
              type="number"
              min={0}
              value={newRest}
              onChange={e => setNewRest(parseInt(e.target.value || '0'))}
            />
          </div>
          <Button className="md:ml-2" onClick={addItem} disabled={!newExerciseId}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No exercises added yet.</div>
          ) : (
            items.map((it, index) => {
              const ex = exerciseMap.get(it.exercise_id);
              return (
                <div
                  key={`${it.exercise_id}-${index}`}
                  className="flex flex-col md:flex-row md:items-center gap-2 rounded-md border p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{ex?.name || 'Exercise'}</div>
                    <div className="text-xs text-muted-foreground">
                      Duration {it.duration_seconds}s • Rest {it.rest_after_seconds}s
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Input
                      className="w-24"
                      type="number"
                      min={5}
                      value={it.duration_seconds}
                      onChange={e => updateItem(index, { duration_seconds: parseInt(e.target.value || '0') })}
                    />
                    <Input
                      className="w-24"
                      type="number"
                      min={0}
                      value={it.rest_after_seconds}
                      onChange={e => updateItem(index, { rest_after_seconds: parseInt(e.target.value || '0') })}
                    />
                    <Button variant="destructive" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !name.trim() || items.length === 0}>
          {saving ? 'Saving...' : 'Save Workout'}
        </Button>
      </div>
    </div>
  );
};

export default CustomWorkoutBuilder;
