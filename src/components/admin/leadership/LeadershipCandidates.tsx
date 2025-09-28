import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLeadershipCandidates, CandidateWithUserInfo } from "@/hooks/useLeadershipCandidates";
import { Loader2, Users, Crown, Shield, Award, MessageCircle, UserCheck, UserX, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const LeadershipCandidates: React.FC = () => {
  const {
    candidates,
    isLoading,
    updateCandidateStatus,
    promoteCandidate,
    detectCandidates,
    getCandidateTypeLabel,
    getCandidateTypeBadgeColor,
    getStatusBadgeColor,
  } = useLeadershipCandidates();

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithUserInfo | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = candidates.filter(candidate =>
    candidate.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.candidate_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCandidateIcon = (type: string) => {
    switch (type) {
      case 'expert': return <Crown className="h-4 w-4" />;
      case 'community_leader': return <Users className="h-4 w-4" />;
      case 'moderator': return <Shield className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const handleAction = async (action: 'contact' | 'promote' | 'dismiss', candidate: CandidateWithUserInfo) => {
    if (!candidate) return;

    try {
      if (action === 'promote') {
        await promoteCandidate.mutateAsync({
          candidateId: candidate.id,
          notes: actionNotes || undefined
        });
      } else {
        const status = action === 'contact' ? 'contacted' : 'dismissed';
        await updateCandidateStatus.mutateAsync({
          candidateId: candidate.id,
          status,
          notes: actionNotes || undefined
        });
      }
      setSelectedCandidate(null);
      setActionNotes("");
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leadership Candidates
          </CardTitle>
          <CardDescription>
            Users eligible for leadership roles based on community participation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leadership Candidates
            </CardTitle>
            <CardDescription>
              Users eligible for leadership roles based on community participation
            </CardDescription>
          </div>
          <Button
            onClick={() => detectCandidates.mutate()}
            disabled={detectCandidates.isPending}
            variant="outline"
          >
            {detectCandidates.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Detect New Candidates
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {candidates.length === 0 ? "No leadership candidates found" : "No candidates match your search"}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getCandidateIcon(candidate.candidate_type)}
                          <div>
                            <p className="font-medium">{candidate.username}</p>
                            <p className="text-sm text-muted-foreground">
                              User ID: {candidate.user_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getCandidateTypeBadgeColor(candidate.candidate_type) as any}>
                            {getCandidateTypeLabel(candidate.candidate_type)}
                          </Badge>
                          <Badge variant={getStatusBadgeColor(candidate.status) as any}>
                            {candidate.status}
                          </Badge>
                          <Badge variant="outline">
                            {candidate.qualification_data.subscription_tier || 'free'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCandidate(candidate)}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Contact Candidate</DialogTitle>
                              <DialogDescription>
                                Mark {candidate.username} as contacted for the {getCandidateTypeLabel(candidate.candidate_type)} role.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add any notes about the contact..."
                                  value={actionNotes}
                                  onChange={(e) => setActionNotes(e.target.value)}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCandidate(null);
                                    setActionNotes("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleAction('contact', candidate)}
                                  disabled={updateCandidateStatus.isPending}
                                >
                                  {updateCandidateStatus.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Mark as Contacted
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setSelectedCandidate(candidate)}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Promote
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Promote Candidate</DialogTitle>
                              <DialogDescription>
                                Promote {candidate.username} to {getCandidateTypeLabel(candidate.candidate_type)} role.
                                This will grant them actual leadership permissions.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="promote-notes">Promotion Notes (optional)</Label>
                                <Textarea
                                  id="promote-notes"
                                  placeholder="Add any notes about this promotion..."
                                  value={actionNotes}
                                  onChange={(e) => setActionNotes(e.target.value)}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCandidate(null);
                                    setActionNotes("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleAction('promote', candidate)}
                                  disabled={promoteCandidate.isPending}
                                >
                                  {promoteCandidate.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <UserCheck className="h-4 w-4 mr-2" />
                                  )}
                                  Promote to {getCandidateTypeLabel(candidate.candidate_type)}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCandidate(candidate)}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Dismiss
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Dismiss Candidate</DialogTitle>
                              <DialogDescription>
                                Dismiss {candidate.username} from consideration for the {getCandidateTypeLabel(candidate.candidate_type)} role.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="dismiss-notes">Dismissal Reason (optional)</Label>
                                <Textarea
                                  id="dismiss-notes"
                                  placeholder="Add reason for dismissal..."
                                  value={actionNotes}
                                  onChange={(e) => setActionNotes(e.target.value)}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCandidate(null);
                                    setActionNotes("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleAction('dismiss', candidate)}
                                  disabled={updateCandidateStatus.isPending}
                                >
                                  {updateCandidateStatus.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <UserX className="h-4 w-4 mr-2" />
                                  )}
                                  Dismiss Candidate
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Level:</span> {candidate.qualification_data.highest_level}
                      </div>
                      <div>
                        <span className="font-medium">Karma:</span> {candidate.qualification_data.total_karma}
                      </div>
                      <div>
                        <span className="font-medium">Community Track:</span> {candidate.qualification_data.community_track_level}
                      </div>
                      <div>
                        <span className="font-medium">Qualified:</span> {new Date(candidate.qualification_date).toLocaleDateString()}
                      </div>
                    </div>

                    {candidate.review_notes && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Admin Notes:</p>
                        <p className="text-sm text-muted-foreground">{candidate.review_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadershipCandidates;