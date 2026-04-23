import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import { Webhook, Trash2, PlayCircle, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';

const EVENT_OPTIONS = [
  { id: 'message_generated', label: 'Message Generated', desc: 'When AI generates a response' },
  { id: 'low_rating', label: 'Low Rating', desc: 'When a response gets a low rating' },
  { id: 'new_conversation', label: 'New Conversation', desc: 'When a new conversation starts' },
];

const WebhookCard = ({ webhook, onTest, onDelete, onToggle, onFetchLogs }) => {
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleToggleLogs = async () => {
    if (!expanded && logs.length === 0) {
      setLoadingLogs(true);
      const fetchedLogs = await onFetchLogs(webhook.webhook_id);
      setLogs(fetchedLogs);
      setLoadingLogs(false);
    }
    setExpanded(!expanded);
  };

  const handleTest = async () => {
    setIsTesting(true);
    await onTest(webhook.webhook_id);
    // Refresh logs after test
    const fetchedLogs = await onFetchLogs(webhook.webhook_id);
    setLogs(fetchedLogs);
    setIsTesting(false);
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{webhook.name}</p>
              <Badge variant={webhook.is_active !== false ? 'default' : 'secondary'} className="text-[10px] h-5">
                {webhook.is_active !== false ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{webhook.url}</p>
          </div>
          <Switch
            checked={webhook.is_active !== false}
            onCheckedChange={() => onToggle(webhook.webhook_id)}
          />
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {webhook.events.map((event) => (
            <span key={event} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {EVENT_OPTIONS.find(e => e.id === event)?.label || event}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleTest} disabled={isTesting}>
            <PlayCircle className="w-3 h-3 mr-1" />
            {isTesting ? 'Testing...' : 'Test'}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleToggleLogs}>
            {expanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
            Logs
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => onDelete(webhook.webhook_id)}>
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
          {webhook.created_at && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              Created {new Date(webhook.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      {expanded && (
        <div className="border-t p-3">
          <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Recent Delivery Logs
          </h5>
          {loadingLogs ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No delivery logs yet. Try sending a test.</p>
          ) : (
            <ScrollArea className="h-[150px]">
              <div className="space-y-1.5">
                {logs.slice(0, 20).map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/30">
                    {log.status === 'success' ? (
                      <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500 shrink-0" />
                    )}
                    <span className="font-medium">{log.event}</span>
                    <span className="text-muted-foreground ml-auto">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                    {log.error && (
                      <span className="text-red-500 truncate max-w-[150px]" title={log.error}>
                        {log.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

export const WebhooksDialog = ({ open, onOpenChange, webhooks, newWebhook, setNewWebhook, onCreate, onDelete, onTest, onToggle, onFetchLogs }) => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Webhook Automations
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} configured
              {webhooks.length > 0 && ` · ${webhooks.filter(w => w.is_active !== false).length} active`}
            </p>
            <Button size="sm" variant={showCreate ? 'secondary' : 'default'} onClick={() => setShowCreate(!showCreate)}>
              <Plus className="w-3 h-3 mr-1" />
              {showCreate ? 'Cancel' : 'New Webhook'}
            </Button>
          </div>

          {/* Create Form */}
          {showCreate && (
            <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
              <h4 className="font-medium text-sm">Create Webhook</h4>
              <Input
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder="Webhook name (e.g., Slack Notifications)"
              />
              <Input
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://your-endpoint.com/webhook"
              />
              <div>
                <p className="text-xs font-medium mb-2">Trigger Events</p>
                <div className="space-y-2">
                  {EVENT_OPTIONS.map((event) => (
                    <label
                      key={event.id}
                      className={`flex items-start gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                        newWebhook.events.includes(event.id) ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30'
                      }`}
                      onClick={() => {
                        const events = newWebhook.events.includes(event.id)
                          ? newWebhook.events.filter(e => e !== event.id)
                          : [...newWebhook.events, event.id];
                        setNewWebhook({ ...newWebhook, events });
                      }}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${
                        newWebhook.events.includes(event.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {newWebhook.events.includes(event.id) && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.label}</p>
                        <p className="text-xs text-muted-foreground">{event.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={() => { onCreate(); setShowCreate(false); }} className="w-full">
                Create Webhook
              </Button>
            </div>
          )}

          {/* Webhook List */}
          {webhooks.length > 0 ? (
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <WebhookCard
                  key={webhook.webhook_id}
                  webhook={webhook}
                  onTest={onTest}
                  onDelete={onDelete}
                  onToggle={onToggle}
                  onFetchLogs={onFetchLogs}
                />
              ))}
            </div>
          ) : !showCreate && (
            <div className="text-center py-8">
              <Webhook className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">No webhooks configured</p>
              <p className="text-xs text-muted-foreground">
                Webhooks let you send real-time notifications to external services when events occur.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
