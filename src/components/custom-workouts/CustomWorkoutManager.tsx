
import React, { useMemo, useState } from 'react';
import { useCustomWorkouts, WorkoutItemInput } from '@/hooks/useCustomWorkouts';
import { useExercises } from '@/hooks/useExercises';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CustomWorkoutBuilder, { BuilderItem } from './CustomWorkoutBuilder';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import FlagGuard from '@/components/access/FlagGuard';

const CustomWorkoutManager: React.FC = () => {
  const { user, listQuery, createWorkout, updateWorkout, deleteWorkout } = useCustomWorkouts();
  const { data: exercises } = useExercises();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const editingWorkout = useMemo(
    () => listQuery.data?.find(w => w.id === editingId) || null,
    [editingId, listQuery.data]
  );

  const loadItemsForWorkout = async (workoutId: string): Promise<BuilderItem[]> => {
    const { data, error } = await import('@/integrations/supabase/client').then(({ supabase }) =>
      supabase
        .from('custom_workout_exercises')
        .select('*')
        .eq('custom_workout_id', workoutId)
        .order('order_index', { ascending: true })
    );

    if (error) {
      console.error('Error loading workout items:', error);
      return [];
    }
    return (data || []).map(d => ({
      exercise_id: d.exercise_id as unknown as string,
      duration_seconds: d.duration_seconds || 0,
      rest_after_seconds: d.rest_after_seconds || 0,
    }));
  };

  const [prefillItems, setPrefillItems] = useState<BuilderItem[] | null>(null);

  const handleCreate = () => {
    setEditingId(null);
    setPrefillItems([]);
    setOpen(true);
  };

  const handleEdit = async (id: string) => {
    setEditingId(id);
    const items = await loadItemsForWorkout(id);
    setPrefillItems(items);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workout? This cannot be undone.')) return;
    await deleteWorkout(id);
  };

  const handleSave = async (payload: {
    name: string;
    description: string | null;
    difficulty_level: number;
    items: BuilderItem[];
  }) => {
    setSaving(true);
    try {
      const items: WorkoutItemInput[] = payload.items.map(i => ({
        exercise_id: i.exercise_id,
        duration_seconds: i.duration_seconds,
        rest_after_seconds: i.rest_after_seconds,
      }));

      if (editingWorkout) {
        await updateWorkout({
          workoutId: editingWorkout.id,
          updates: {
            name: payload.name,
            description: payload.description,
            difficulty_level: payload.difficulty_level,
          },
          items,
        });
      } else {
        await createWorkout({
          workout: {
            name: payload.name,
            description: payload.description,
            difficulty_level: payload.difficulty_level,
          },
          items,
        });
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FlagGuard featureName="custom_workouts">
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Custom Workouts</h3>
          <p className="text-sm text-muted-foreground">
            Build and save your own workouts using any exercises.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Workout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(listQuery.data || []).map(w => (
          <Card key={w.id} className="hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{w.name}</span>
                <Badge variant="outline">Level {w.difficulty_level}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground line-clamp-2">{w.description}</div>
              <div className="text-sm">
                Total: <span className="font-medium">{w.total_duration}s</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(w.id)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(w.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {listQuery.data && listQuery.data.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground">
            You have no custom workouts yet. Create your first one!
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingWorkout ? 'Edit Workout' : 'Create Workout'}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <CustomWorkoutBuilder
              initialName={editingWorkout?.name}
              initialDescription={editingWorkout?.description}
              initialDifficulty={editingWorkout?.difficulty_level || 1}
              initialItems={prefillItems || []}
              onSave={handleSave}
              saving={saving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </FlagGuard>
  );
};

export default CustomWorkoutManager;
