import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Clock, Bookmark, Trash2, Star } from 'lucide-react';

export const RecentMessages = ({ messages, onLoad, onSaveTemplate, onDelete }) => (
  <div className="bg-card rounded-xl border p-5 card-shadow hidden lg:block">
    <h3 className="font-semibold font-['Outfit'] flex items-center gap-2 mb-4">
      <Clock className="w-4 h-4 text-primary" />
      Recent Messages
      <span className="ml-auto text-xs text-muted-foreground font-normal">
        {messages.length} saved
      </span>
    </h3>
    
    <ScrollArea className="h-[200px] -mx-2 px-2">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No messages yet
        </p>
      ) : (
        <div className="space-y-2">
          {messages.slice(0, 10).map((msg) => (
            <div
              key={msg.message_id}
              className="history-item group p-3 rounded-lg border border-transparent cursor-pointer"
              onClick={() => onLoad(msg)}
              data-testid={`history-item-${msg.message_id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {msg.customer_name && msg.customer_name !== 'Customer' && (
                    <p className="text-xs font-medium text-primary truncate">{msg.customer_name}</p>
                  )}
                  <p className="text-sm line-clamp-2">{msg.customer_message}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveTemplate(msg.message_id);
                    }}
                    data-testid={`save-template-${msg.message_id}`}
                  >
                    <Bookmark className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(msg.message_id);
                    }}
                    data-testid={`delete-msg-${msg.message_id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  msg.tone === 'friendly' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' :
                  msg.tone === 'professional' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' :
                  'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                }`}>
                  {msg.tone}
                </span>
                {msg.rating && (
                  <span className="flex items-center gap-1 text-xs text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    {msg.rating}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  </div>
);
