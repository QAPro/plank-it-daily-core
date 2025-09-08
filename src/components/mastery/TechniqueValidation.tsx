import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Video,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface TechniqueValidation {
  id: string;
  user_id: string;
  validator_id: string;
  exercise_id: string;
  technique_rating: number;
  form_feedback?: string;
  improvement_suggestions?: string;
  validation_video_url?: string;
  created_at: string;
}

interface TechniqueValidationProps {
  exerciseId: string;
  canValidate?: boolean;
  onRequestValidation?: () => void;
}

const TechniqueValidation: React.FC<TechniqueValidationProps> = ({
  exerciseId,
  canValidate = false,
  onRequestValidation
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [rating, setRating] = useState(5);

  const { data: validations, isLoading } = useQuery({
    queryKey: ['technique-validations', exerciseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technique_validations')
        .select('*')
        .eq('exercise_id', exerciseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TechniqueValidation[];
    }
  });

  const createValidationMutation = useMutation({
    mutationFn: async ({
      userId,
      rating,
      feedback,
      suggestions
    }: {
      userId: string;
      rating: number;
      feedback: string;
      suggestions: string;
    }) => {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('technique_validations')
        .insert({
          user_id: userId,
          validator_id: currentUser.data.user.id,
          exercise_id: exerciseId,
          technique_rating: rating,
          form_feedback: feedback,
          improvement_suggestions: suggestions
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technique-validations', exerciseId] });
      setFeedback('');
      setSuggestions('');
      setRating(5);
      toast({
        title: 'Validation Submitted',
        description: 'Your technique validation has been recorded.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit validation. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 5) return 'Excellent';
    if (rating === 4) return 'Good';
    if (rating === 3) return 'Fair';
    if (rating === 2) return 'Needs Work';
    return 'Poor';
  };

  if (isLoading) return <div>Loading validations...</div>;

  const userValidations = validations?.filter(v => v.user_id === v.validator_id) || [];
  const receivedValidations = validations?.filter(v => v.user_id !== v.validator_id) || [];

  return (
    <div className="space-y-6">
      {/* Validation Request Section */}
      {!canValidate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-500" />
              Request Technique Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  Get feedback on your technique from experienced practitioners
                </div>
                <Button onClick={onRequestValidation} className="w-full max-w-xs">
                  Request Validation Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Form (for qualified validators) */}
      {canValidate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              Provide Technique Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Technique Rating</label>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    className={`p-2 rounded ${
                      rating >= value ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
                <span className={`ml-2 font-medium ${getRatingColor(rating)}`}>
                  {getRatingLabel(rating)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Form Feedback</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback on technique and form..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Improvement Suggestions</label>
              <Textarea
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="Suggest specific improvements or corrections..."
                className="mt-1"
                rows={3}
              />
            </div>

            <Button 
              onClick={() => createValidationMutation.mutate({
                userId: 'target-user-id', // This would be passed from parent
                rating,
                feedback,
                suggestions
              })}
              disabled={createValidationMutation.isPending}
              className="w-full"
            >
              {createValidationMutation.isPending ? 'Submitting...' : 'Submit Validation'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Received Validations */}
      {receivedValidations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              Validation Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {receivedValidations.map((validation) => (
              <div key={validation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`h-4 w-4 ${
                            validation.technique_rating >= value
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getRatingColor(validation.technique_rating)}
                    >
                      {getRatingLabel(validation.technique_rating)}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(validation.created_at))} ago
                  </span>
                </div>

                {validation.form_feedback && (
                  <div>
                    <div className="text-sm font-medium mb-1">Form Feedback:</div>
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {validation.form_feedback}
                    </div>
                  </div>
                )}

                {validation.improvement_suggestions && (
                  <div>
                    <div className="text-sm font-medium mb-1">Improvement Suggestions:</div>
                    <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded border-l-4 border-blue-500">
                      {validation.improvement_suggestions}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Validation Stats */}
      {receivedValidations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Validation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{receivedValidations.length}</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {(receivedValidations.reduce((sum, v) => sum + v.technique_rating, 0) / receivedValidations.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {receivedValidations.filter(v => v.technique_rating >= 4).length}
                </div>
                <div className="text-sm text-muted-foreground">Good+ Ratings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">
                  {receivedValidations.filter(v => v.improvement_suggestions).length}
                </div>
                <div className="text-sm text-muted-foreground">With Suggestions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TechniqueValidation;