import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Users, UserPlus, Trash2, ChevronDown, Mail, Clock, Shield, User, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const TeamDialog = ({ open, onOpenChange, authType, team, inviteEmail, setInviteEmail, onCreateTeam, onInvite, onRefresh }) => {
  const [removingMember, setRemovingMember] = useState(null);

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the team?`)) return;
    setRemovingMember(userId);
    try {
      await axios.delete(`${API}/team/members/${userId}`, { withCredentials: true });
      toast.success(`${memberName} removed from team`);
      onRefresh?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  };

  const handleChangeRole = async (userId, newRole, memberName) => {
    try {
      await axios.patch(`${API}/team/members/${userId}/role`, { role: newRole }, { withCredentials: true });
      toast.success(`${memberName} is now ${newRole}`);
      onRefresh?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change role');
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await axios.delete(`${API}/team/invitations/${invitationId}`, { withCredentials: true });
      toast.success('Invitation cancelled');
      onRefresh?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel invitation');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Management
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {authType === 'guest' ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Sign in with Google to access team features.
              </p>
            </div>
          ) : team?.team ? (
            <>
              {/* Team Info */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border">
                <div>
                  <p className="text-sm font-semibold">{team.team.name || 'My Team'}</p>
                  <p className="text-xs text-muted-foreground">
                    {(team.members?.length || 0) + 1} member{(team.members?.length || 0) !== 0 ? 's' : ''}
                    {team.is_owner && ' · You are the owner'}
                  </p>
                </div>
                {team.is_owner && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                    <Shield className="w-3 h-3 inline mr-1" />Owner
                  </span>
                )}
              </div>

              {/* Team Members */}
              <div>
                <h4 className="font-medium mb-3 text-sm">Members</h4>
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-2">
                    {/* Owner (always first) */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">You (Owner)</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary font-medium">owner</span>
                    </div>

                    {/* Members */}
                    {team.members?.map((member) => (
                      <div key={member.user_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{member.name || member.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {team.is_owner ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                  {member.role}
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleChangeRole(member.user_id, 'admin', member.name || member.email)}>
                                  <Shield className="w-3 h-3 mr-2" />
                                  Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleChangeRole(member.user_id, 'member', member.name || member.email)}>
                                  <User className="w-3 h-3 mr-2" />
                                  Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              member.role === 'admin' 
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {member.role}
                            </span>
                          )}
                          {team.is_owner && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 opacity-0 group-hover:opacity-100 text-destructive"
                              onClick={() => handleRemoveMember(member.user_id, member.name || member.email)}
                              disabled={removingMember === member.user_id}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Pending Invitations */}
              {team.is_owner && team.invitations?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Pending Invitations
                  </h4>
                  <div className="space-y-2">
                    {team.invitations.map((inv) => (
                      <div key={inv.invitation_id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="text-sm font-medium">{inv.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Invited {new Date(inv.created_at).toLocaleDateString()}
                              {' · '}Expires {new Date(inv.expires_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleCancelInvitation(inv.invitation_id)}
                          title="Cancel invitation"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invite Section */}
              {team.is_owner && (
                <div>
                  <h4 className="font-medium mb-3 text-sm">Invite Member</h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      type="email"
                      onKeyDown={(e) => e.key === 'Enter' && onInvite()}
                    />
                    <Button onClick={onInvite} className="w-full sm:w-auto shrink-0">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Up to 5 team members. Invitations expire after 7 days.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Create a Team</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                Collaborate with your team. Share templates, assign conversations, and manage responses together.
              </p>
              <Button onClick={onCreateTeam} size="lg">
                <Users className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
