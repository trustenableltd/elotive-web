import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { MessageCircle, Plus, Check, Trash2, Settings, UserPlus, User, Mail, MessageSquare, Phone, Globe } from 'lucide-react';

const CONV_CHANNEL_ICONS = { email: Mail, whatsapp: MessageSquare, sms: Phone, web: Globe };
const CONV_CHANNEL_COLORS = { email: 'text-blue-500', whatsapp: 'text-green-500', sms: 'text-purple-500', web: 'text-orange-500' };

export const ConversationList = ({
  activeTab, conversations, activeConversation, editingConvName,
  setEditingConvName, newConvName, setNewConvName,
  onLoad, onUpdateName, onDelete, onNew, teamMembers, onAssign
}) => (
  <div className={`bg-card rounded-xl border p-5 card-shadow ${activeTab === 'conversations' ? 'block' : 'hidden lg:block'}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold font-['Outfit'] flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        Conversations
      </h3>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNew}
        data-testid="new-conversation-btn"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
    
    <ScrollArea className="h-[200px] lg:h-[250px] -mx-2 px-2">
      {conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No conversations yet
        </p>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.conversation_id}
              className={`conversation-item group p-3 rounded-lg border cursor-pointer ${
                activeConversation?.conversation_id === conv.conversation_id ? 'active border-primary/30' : 'border-transparent'
              }`}
              onClick={() => onLoad(conv)}
              data-testid={`conversation-${conv.conversation_id}`}
            >
              <div className="flex items-center justify-between gap-2">
                {editingConvName === conv.conversation_id ? (
                  <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={newConvName}
                      onChange={(e) => setNewConvName(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateName(conv.conversation_id, newConvName);
                        } else if (e.key === 'Escape') {
                          setEditingConvName(null);
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 shrink-0"
                      onClick={() => onUpdateName(conv.conversation_id, newConvName)}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span 
                      className="text-sm font-medium truncate flex-1"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingConvName(conv.conversation_id);
                        setNewConvName(conv.customer_name || 'Customer');
                      }}
                      title="Double-click to rename"
                    >
                      {conv.customer_name || 'Customer'}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingConvName(conv.conversation_id);
                          setNewConvName(conv.customer_name || 'Customer');
                        }}
                        title="Rename"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.conversation_id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-2 mt-1 min-w-0">
                {conv.channel && conv.channel !== 'manual' && (() => {
                  const ChIcon = CONV_CHANNEL_ICONS[conv.channel];
                  return ChIcon ? <ChIcon className={`w-3 h-3 ${CONV_CHANNEL_COLORS[conv.channel] || ''}`} title={conv.channel} /> : null;
                })()}
                <span className="text-xs text-muted-foreground">
                  {conv.message_count} messages
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </span>
                {conv.assigned_to && (
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />
                    {teamMembers?.find(m => m.user_id === conv.assigned_to)?.name || 'Assigned'}
                  </span>
                )}
                {teamMembers && teamMembers.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="w-5 h-5 opacity-0 group-hover:opacity-100" title="Assign to team member">
                        <UserPlus className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => onAssign(conv.conversation_id, null)}>
                        <span className="text-muted-foreground">Unassign</span>
                      </DropdownMenuItem>
                      {teamMembers.map((member) => (
                        <DropdownMenuItem
                          key={member.user_id}
                          onClick={() => onAssign(conv.conversation_id, member.user_id)}
                        >
                          <User className="w-3 h-3 mr-2" />
                          {member.name || member.email}
                          {conv.assigned_to === member.user_id && <Check className="w-3 h-3 ml-auto" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  </div>
);
