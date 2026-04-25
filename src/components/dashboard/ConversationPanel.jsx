import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { highlightText } from './highlightText';
import { User, Bot, Pin, PinOff, Copy, Star, Search, X, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const ConversationPanel = ({
  activeConversation, customerName, conversationMessages,
  pinnedMessages, filteredMessages, chatExpanded, setChatExpanded,
  chatSearch, setChatSearch, showChatSearch, setShowChatSearch,
  chatEndRef, onTogglePin, onNewConversation,
  threadTemplate, onClearThreadTemplate
}) => {
  if (!activeConversation) return null;

  return (
    <div className="bg-card rounded-xl border card-shadow overflow-hidden" data-testid="conversation-panel">
      {/* Conversation Header */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b bg-primary/5 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{customerName || activeConversation.customer_name || 'Customer'}</p>
            <p className="text-[11px] text-muted-foreground">
              {conversationMessages.length} message{conversationMessages.length !== 1 ? 's' : ''}
              {pinnedMessages.length > 0 && <> &middot; {pinnedMessages.length} pinned</>}
              {threadTemplate?.name && <> &middot; Thread: {threadTemplate.name}</>}
              {' '}&middot; AI context active
            </p>
            {threadTemplate?.instructions && (
              <p className="text-[11px] text-primary/80 mt-0.5 line-clamp-1" title={threadTemplate.instructions}>
                AI: {threadTemplate.instructions}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {threadTemplate?.name && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={onClearThreadTemplate}
              data-testid="clear-thread-template-btn"
              title="Clear thread template"
            >
              <X className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Clear Template</span>
            </Button>
          )}
          {conversationMessages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => { setShowChatSearch(!showChatSearch); setChatSearch(''); }}
              data-testid="toggle-chat-search"
              title="Search in conversation"
            >
              <Search className="w-4 h-4" />
            </Button>
          )}
          {conversationMessages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setChatExpanded(!chatExpanded)}
              data-testid="toggle-chat-history"
              title={chatExpanded ? 'Collapse history' : 'Expand history'}
            >
              {chatExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewConversation}
            data-testid="end-conversation-btn"
            className="text-muted-foreground hover:text-foreground px-2 sm:px-3"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showChatSearch && (
        <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-2" data-testid="chat-search-bar">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            placeholder="Search messages..."
            className="h-8 text-sm border-0 bg-transparent focus-visible:ring-0 shadow-none"
            autoFocus
            data-testid="chat-search-input"
          />
          {chatSearch && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {filteredMessages.length} found
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 shrink-0"
            onClick={() => { setShowChatSearch(false); setChatSearch(''); }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Pinned Messages Strip */}
      {chatExpanded && pinnedMessages.length > 0 && !chatSearch && (
        <div className="px-4 py-2 border-b bg-amber-50/50 dark:bg-amber-950/20" data-testid="pinned-messages-strip">
          <div className="flex items-center gap-2 mb-1.5">
            <Pin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Pinned</span>
          </div>
          <div className="space-y-1.5">
            {pinnedMessages.map((msg) => (
              <div
                key={msg.message_id}
                className="flex items-start gap-2 text-xs group cursor-pointer rounded-md px-2 py-1.5 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
                onClick={() => {
                  const el = document.querySelector(`[data-testid="chat-msg-pin-${msg.message_id}"]`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                data-testid={`pinned-item-${msg.message_id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground truncate">
                    <span className="font-medium text-foreground">{msg.customer_name || 'Customer'}:</span>{' '}
                    {msg.customer_message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-5 h-5 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => { e.stopPropagation(); onTogglePin(msg.message_id); }}
                >
                  <PinOff className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat History Messages */}
      {chatExpanded && conversationMessages.length > 0 && (
        <div className="chat-history-container" data-testid="conversation-history">
          <div className="overflow-y-auto max-h-[420px] px-5 py-4 space-y-5 chat-scroll">
            {filteredMessages.length === 0 && chatSearch ? (
              <p className="text-center text-sm text-muted-foreground py-8">No messages match "{chatSearch}"</p>
            ) : (
              filteredMessages.map((msg, idx) => (
                <div key={msg.message_id || idx} data-testid={`chat-msg-${idx}`} className={`chat-message-group ${msg.pinned ? 'chat-msg-pinned' : ''}`}>
                  <div data-testid={`chat-msg-pin-${msg.message_id}`} />
                  {/* Timestamp divider */}
                  {msg.created_at && (idx === 0 || (idx > 0 && new Date(msg.created_at).toDateString() !== new Date(filteredMessages[idx - 1]?.created_at).toDateString())) && (
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-[10px] text-muted-foreground/70 bg-muted/50 px-3 py-0.5 rounded-full">
                        {new Date(msg.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* Customer bubble */}
                  <div className="flex items-end gap-2 justify-end mb-2 group/customer">
                    <div className="chat-bubble chat-bubble-customer">
                      {chatSearch && highlightText(msg.customer_message, chatSearch) || (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.customer_message}</p>
                      )}
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button
                          className="opacity-0 group-hover/customer:opacity-100 text-muted-foreground/40 hover:text-amber-500 transition-all"
                          onClick={() => onTogglePin(msg.message_id)}
                          title={msg.pinned ? 'Unpin message' : 'Pin message'}
                          data-testid={`pin-btn-${msg.message_id}`}
                        >
                          {msg.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                        </button>
                        <span className="chat-bubble-time">
                          {msg.created_at && new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mb-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>

                  {/* AI bubble */}
                  <div className="flex items-end gap-2 justify-start group/ai">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mb-1 ${
                      msg.tone === 'friendly' ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                      msg.tone === 'professional' ? 'bg-indigo-100 dark:bg-indigo-900/40' :
                      'bg-rose-100 dark:bg-rose-900/40'
                    }`}>
                      <Bot className={`w-3 h-3 ${
                        msg.tone === 'friendly' ? 'text-emerald-600 dark:text-emerald-400' :
                        msg.tone === 'professional' ? 'text-indigo-600 dark:text-indigo-400' :
                        'text-rose-600 dark:text-rose-400'
                      }`} />
                    </div>
                    <div className={`chat-bubble chat-bubble-ai ${
                      msg.tone === 'friendly' ? 'chat-bubble-friendly' :
                      msg.tone === 'professional' ? 'chat-bubble-professional' :
                      'chat-bubble-sales'
                    }`}>
                      {chatSearch && highlightText(msg.ai_response, chatSearch) || (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.ai_response}</p>
                      )}
                      <div className="flex items-center justify-between mt-1.5 gap-3">
                        <span className="chat-bubble-time">
                          {msg.created_at && new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-2">
                          {msg.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-500 text-[10px]">
                              <Star className="w-2.5 h-2.5 fill-current" />{msg.rating}
                            </span>
                          )}
                          {msg.pinned && <Pin className="w-2.5 h-2.5 text-amber-500" />}
                          <button
                            className="text-muted-foreground/50 hover:text-foreground transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(msg.ai_response);
                              toast.success('Copied to clipboard');
                            }}
                            title="Copy response"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};
