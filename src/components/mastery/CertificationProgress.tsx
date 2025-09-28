
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Upload,
  Eye,
  Users,
  Calendar
} from 'lucide-react';
import { useExerciseMastery } from '@/hooks/useExerciseMastery';
import { useExercises } from '@/hooks/useExercises';
import { formatDistanceToNow } from 'date-fns';

interface CertificationProgressProps {
  onUploadEvidence?: (certificationId: string) => void;
  onViewCertification?: (certificationId: string) => void;
}

const CertificationProgress: React.FC<CertificationProgressProps> = ({
  onUploadEvidence,
  onViewCertification
}) => {
  const { data: exercises } = useExercises();
  const { certifications, masteries, getTotalMasteryScore } = useExerciseMastery();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'expired':
        return 'bg-orange-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getCertificationLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bronze':
        return 'bg-amber-600';
      case 'silver':
        return 'bg-gray-400';
      case 'gold':
        return 'bg-yellow-500';
      case 'platinum':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };

  const approvedCertifications = certifications.filter(c => c.status === 'approved');
  const pendingCertifications = certifications.filter(c => c.status === 'pending');
  const totalMasteryScore = getTotalMasteryScore();

  if (!exercises) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{approvedCertifications.length}</div>
            <div className="text-sm text-muted-foreground">Certifications</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{pendingCertifications.length}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{masteries.length}</div>
            <div className="text-sm text-muted-foreground">Skills Tracked</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{Math.round(totalMasteryScore)}</div>
            <div className="text-sm text-muted-foreground">Avg Mastery Level</div>
            <Progress value={(totalMasteryScore / 10) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Pending Certifications */}
      {pendingCertifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingCertifications.map((certification) => {
              const exercise = exercises.find(e => e.id === certification.exercise_id);
              return (
                <div key={certification.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(certification.status)}
                      <div>
                        <div className="font-medium">{exercise?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Submitted {formatDistanceToNow(new Date(certification.created_at))} ago
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getCertificationLevelColor(certification.certification_level)} text-white`}>
                      {certification.certification_level.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUploadEvidence?.(certification.id)}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Add Evidence
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewCertification?.(certification.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Approved Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-500" />
            Your Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedCertifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No certifications yet.</p>
              <p className="text-sm">Master exercises to earn your first certification!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedCertifications.map((certification) => {
                const exercise = exercises.find(e => e.id === certification.exercise_id);
                return (
                  <div 
                    key={certification.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onViewCertification?.(certification.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">{exercise?.name}</span>
                      </div>
                      <Badge className={`${getCertificationLevelColor(certification.certification_level)} text-white`}>
                        {certification.certification_level.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Earned {formatDistanceToNow(new Date(certification.approved_at!))} ago
                        </span>
                      </div>
                      {certification.expires_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Expires {formatDistanceToNow(new Date(certification.expires_at))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificationProgress;