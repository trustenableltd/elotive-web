import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import { Mail, MessageSquare, Phone, Globe, Plus, Trash2, Copy, CheckCircle, Settings, Inbox, Code, Eye, EyeOff, ExternalLink, Loader2, Zap, XCircle, Facebook, Instagram } from 'lucide-react';
import { toast } from 'sonner';

const CHANNEL_TYPES = [
  { id: 'email', label: 'Email', icon: Mail, desc: 'Capture enquiries from email', color: 'bg-blue-500' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, desc: 'Connect your business number', color: 'bg-green-500' },
  { id: 'sms', label: 'SMS', icon: Phone, desc: 'Capture enquiries from text messages', color: 'bg-purple-500' },
  { id: 'web', label: 'Web Widget', icon: Globe, desc: 'Website chat that converts visitors', color: 'bg-orange-500' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, desc: 'Messenger for your Page', color: 'bg-[#1877F2]' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, desc: 'Instagram DMs for your account', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
];

const CONFIG_FIELDS = {
  email: [
    { key: 'sendgrid_api_key', label: 'SendGrid API Key', placeholder: 'SG.xxxxxxxx', secret: true },
    { key: 'from_email', label: 'From Email Address', placeholder: 'support@yourdomain.com' },
  ],
  whatsapp: [
    { key: 'twilio_account_sid', label: 'Twilio Account SID', placeholder: 'ACxxxxxxxx' },
    { key: 'twilio_auth_token', label: 'Twilio Auth Token', placeholder: 'xxxxxxxx', secret: true },
    { key: 'twilio_phone_number', label: 'WhatsApp Number', placeholder: '+14155238886' },
  ],
  sms: [
    { key: 'twilio_account_sid', label: 'Twilio Account SID', placeholder: 'ACxxxxxxxx' },
    { key: 'twilio_auth_token', label: 'Twilio Auth Token', placeholder: 'xxxxxxxx', secret: true },
    { key: 'twilio_phone_number', label: 'Twilio Phone Number', placeholder: '+14155238886' },
  ],
  web: [],
  facebook: [
    { key: 'page_access_token', label: 'Page Access Token', placeholder: 'EAAxxxxxxxx...', secret: true },
    { key: 'verify_token', label: 'Verify Token', placeholder: 'my-secret-verify-token' },
    { key: 'page_id', label: 'Facebook Page ID', placeholder: '123456789012345' },
  ],
  instagram: [
    { key: 'page_access_token', label: 'Page Access Token', placeholder: 'EAAxxxxxxxx...', secret: true },
    { key: 'verify_token', label: 'Verify Token', placeholder: 'my-secret-verify-token' },
    { key: 'ig_account_id', label: 'Instagram Account ID', placeholder: '17841400000000000' },
  ],
};

const channelIcon = (type) => {
  const ct = CHANNEL_TYPES.find(c => c.id === type);
  if (!ct) return Globe;
  return ct.icon;
};

const channelColor = (type) => {
  const ct = CHANNEL_TYPES.find(c => c.id === type);
  return ct?.color || 'bg-gray-500';
};

const normalizeBackendBaseUrl = (rawUrl) => {
  if (!rawUrl) return '';
  try {
    const url = new URL(rawUrl);
    // If backend URL was accidentally set to the frontend host in production,
    // auto-correct to api.<host> where our FastAPI service lives.
    if (
      typeof window !== 'undefined' &&
      url.hostname === window.location.hostname &&
      !url.hostname.startsWith('api.') &&
      !url.hostname.includes('localhost')
    ) {
      url.hostname = `api.${url.hostname}`;
    }
    return `${url.origin}`;
  } catch {
    return String(rawUrl).replace(/\/$/, '');
  }
};

const ChannelCard = ({ channel, onDelete, onToggle, onTestConnection }) => {
  const [copied, setCopied] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const Icon = channelIcon(channel.type);
  // Use backend base URL from env in production so webhook points to API domain.
  const configuredBackend = normalizeBackendBaseUrl(process.env.REACT_APP_BACKEND_URL || '');
  const localFallback = window.location.origin.replace(':3000', ':8000');
  const baseUrl = configuredBackend || localFallback;
  const webhookPath = channel.webhook_url || `/api/channels/inbound/${channel.channel_id}`;
  const webhookUrl = webhookPath.startsWith('http') ? webhookPath : `${baseUrl}${webhookPath}`;
  const widgetScript = channel.type === 'web'
    ? `<script src="${baseUrl}/widget/${channel.channel_id}.js" defer></script>`
    : null;

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
    if (label === 'Webhook URL') { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection(channel.channel_id);
      setTestResult(res);
    } catch {
      setTestResult({ success: false, message: 'Channel connection check failed' });
    }
    setTesting(false);
  };

  const configFields = CONFIG_FIELDS[channel.type] || [];
  const config = channel.config || {};

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${channelColor(channel.type)} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-sm">{channel.name}</h4>
            <p className="text-xs text-muted-foreground capitalize">{channel.type} · {channel.message_count || 0} messages</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleTest} disabled={testing}>
            {testing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
            Check
          </Button>
          <Switch
            checked={channel.is_active}
            onCheckedChange={() => onToggle(channel.channel_id, !channel.is_active)}
          />
          <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => onDelete(channel.channel_id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Test connection result */}
      {testResult && (
        <div className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${testResult.success ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'}`}>
          {testResult.success ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Webhook URL for Twilio/SendGrid */}
      {channel.type !== 'web' && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-24 shrink-0">Webhook URL:</span>
            <code className="flex-1 bg-muted px-2 py-1 rounded text-[11px] truncate">{webhookUrl}</code>
            <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={() => copyText(webhookUrl, 'Webhook URL')}>
              {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
          {channel.type === 'email' && (
            <div className="bg-muted/50 p-2.5 rounded-lg space-y-1">
              <p className="font-medium text-[11px]">Next step: Set up SendGrid Inbound Parse</p>
              <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
                <li>Copy the webhook URL above</li>
                <li>Go to <a href="https://app.sendgrid.com/settings/parse" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">SendGrid Inbound Parse <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li>Click "Add Host & URL" → paste the webhook URL</li>
                <li>Enter your receiving domain and save</li>
              </ol>
            </div>
          )}
          {channel.type === 'sms' && (
            <div className="bg-muted/50 p-2.5 rounded-lg space-y-1">
              <p className="font-medium text-[11px]">Next step: Configure Twilio webhook</p>
              <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
                <li>Copy the webhook URL above</li>
                <li>Go to <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Twilio Phone Numbers <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li>Click your number → scroll to "Messaging"</li>
                <li>Set "A message comes in" webhook URL → paste and save</li>
              </ol>
            </div>
          )}
          {channel.type === 'whatsapp' && (
            <div className="bg-muted/50 p-2.5 rounded-lg space-y-1">
              <p className="font-medium text-[11px]">Next step: Configure WhatsApp webhook</p>
              <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
                <li>Copy the webhook URL above</li>
                <li>Go to <a href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Twilio WhatsApp Sandbox <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li>Under "Sandbox Configuration" → paste the webhook URL in "When a message comes in"</li>
                <li>Save — messages to your WhatsApp number will now appear in your inbox</li>
              </ol>
            </div>
          )}
          {channel.type === 'facebook' && (
            <div className="bg-muted/50 p-2.5 rounded-lg space-y-1">
              <p className="font-medium text-[11px]">Next step: Configure Meta Webhook</p>
              <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
                <li>Copy the webhook URL above</li>
                <li>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Meta App Dashboard <ExternalLink className="w-2.5 h-2.5" /></a> → Messenger → Settings</li>
                <li>Under "Webhooks" → Edit Callback URL → paste the URL</li>
                <li>Enter your Verify Token (the one you set when connecting)</li>
                <li>Subscribe to <strong>messages</strong> events → Save</li>
              </ol>
            </div>
          )}
          {channel.type === 'instagram' && (
            <div className="bg-muted/50 p-2.5 rounded-lg space-y-1">
              <p className="font-medium text-[11px]">Next step: Configure Instagram Webhook</p>
              <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
                <li>Copy the webhook URL above</li>
                <li>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Meta App Dashboard <ExternalLink className="w-2.5 h-2.5" /></a> → Instagram → Settings</li>
                <li>Under "Webhooks" → Edit Callback URL → paste the URL</li>
                <li>Enter your Verify Token (the one you set when connecting)</li>
                <li>Subscribe to <strong>messages</strong> events → Save</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Web Widget embed code */}
      {channel.type === 'web' && widgetScript && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Embed Code:</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => copyText(widgetScript, 'Embed code')}>
              <Code className="w-3 h-3 mr-1" /> Copy
            </Button>
          </div>
          <code className="block bg-muted px-3 py-2 rounded text-[11px] break-all">{widgetScript}</code>
          <div className="bg-muted/50 p-2.5 rounded-lg space-y-1">
            <p className="font-medium text-[11px]">How to add to your website</p>
            <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
              <li>Copy the embed code above</li>
              <li>Open your website's HTML</li>
              <li>Paste it just before the <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag</li>
              <li>Save — a chat bubble will appear on your site</li>
            </ol>
          </div>
        </div>
      )}

      {/* Provider credentials status */}
      {configFields.length > 0 && (
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Provider Config:</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowSecrets(!showSecrets)}>
              {showSecrets ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {showSecrets ? 'Hide' : 'Show'}
            </Button>
          </div>
          {configFields.map(f => (
            <div key={f.key} className="flex items-center gap-2">
              <span className="text-muted-foreground w-32 shrink-0">{f.label}:</span>
              <code className="flex-1 bg-muted px-2 py-0.5 rounded text-[11px] truncate">
                {config[f.key] ? (showSecrets || !f.secret ? config[f.key] : '••••••••') : '(not set)'}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ChannelsDialog = ({ open, onOpenChange, channels, onCreateChannel, onDeleteChannel, onToggleChannel, onTestConnection }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newChannel, setNewChannel] = useState({ type: 'email', name: '', config: {} });

  const handleCreate = () => {
    if (!newChannel.name.trim()) {
      toast.error('Please enter a channel name');
      return;
    }
    // Validate provider config for non-web channels
    const fields = CONFIG_FIELDS[newChannel.type] || [];
    const missingFields = fields.filter(f => !newChannel.config[f.key]?.trim());
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }
    onCreateChannel(newChannel);
    setNewChannel({ type: 'email', name: '', config: {} });
    setShowCreate(false);
  };

  const updateConfig = (key, value) => {
    setNewChannel(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
  };

  const activeConfigFields = CONFIG_FIELDS[newChannel.type] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Enquiry Channels
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-2">
          <div className="space-y-4">
            {/* Connected Channels */}
            {channels.length === 0 && !showCreate ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <Inbox className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No channels connected</p>
                  <p className="text-sm text-muted-foreground">Connect your channels so Elotive can capture enquiries, reply instantly, and help convert them into bookings.</p>
                </div>
              </div>
            ) : (
              channels.map(ch => (
                <ChannelCard
                  key={ch.channel_id}
                  channel={ch}
                  onDelete={onDeleteChannel}
                  onToggle={onToggleChannel}
                  onTestConnection={onTestConnection}
                />
              ))
            )}

            {/* Create New Channel */}
            {showCreate && (
              <div className="border rounded-lg p-4 space-y-4 border-dashed">
                <p className="text-sm font-medium">Connect a new channel</p>
                
                {/* Channel type selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CHANNEL_TYPES.map(ct => {
                    const Icon = ct.icon;
                    return (
                      <button
                        key={ct.id}
                        onClick={() => setNewChannel({ type: ct.id, name: newChannel.name, config: {} })}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                          newChannel.type === ct.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${ct.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{ct.label}</p>
                          <p className="text-[11px] text-muted-foreground">{ct.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Channel name */}
                <Input
                  placeholder="Channel name (e.g. Support Email, Sales WhatsApp)"
                  value={newChannel.name}
                  onChange={e => setNewChannel({ ...newChannel, name: e.target.value })}
                />

                {/* Provider-specific fields */}
                {activeConfigFields.length > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {newChannel.type === 'email' ? 'SendGrid' : newChannel.type === 'facebook' || newChannel.type === 'instagram' ? 'Meta' : 'Twilio'} Configuration
                    </p>
                    {activeConfigFields.map(field => (
                      <div key={field.key}>
                        <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                        <Input
                          type={field.secret ? 'password' : 'text'}
                          placeholder={field.placeholder}
                          value={newChannel.config[field.key] || ''}
                          onChange={e => updateConfig(field.key, e.target.value)}
                        />
                      </div>
                    ))}
                    {newChannel.type === 'email' && (
                      <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg space-y-1.5">
                        <p className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Setup Guide</p>
                        <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
                          <li>Go to <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">SendGrid API Keys <ExternalLink className="w-2.5 h-2.5" /></a> → Create API Key (Full Access)</li>
                          <li>Paste the API key above</li>
                          <li>Enter the email address you want replies sent from</li>
                          <li>After connecting, you'll set up <a href="https://app.sendgrid.com/settings/parse" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Inbound Parse <ExternalLink className="w-2.5 h-2.5" /></a> to receive emails</li>
                        </ol>
                      </div>
                    )}
                    {newChannel.type === 'whatsapp' && (
                      <div className="bg-green-50/50 dark:bg-green-950/20 p-3 rounded-lg space-y-1.5">
                        <p className="text-[11px] font-medium text-green-700 dark:text-green-400">Setup Guide — Connect Your WhatsApp Business Number</p>
                        <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
                          <li>Sign up at <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">twilio.com <ExternalLink className="w-2.5 h-2.5" /></a> (or log in)</li>
                          <li>Go to <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Twilio Console <ExternalLink className="w-2.5 h-2.5" /></a> → copy Account SID & Auth Token</li>
                          <li>Register your WhatsApp business number with Twilio (or use the Sandbox for testing)</li>
                          <li>Paste your credentials above</li>
                          <li>After connecting, set the webhook URL in your <a href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">WhatsApp settings <ExternalLink className="w-2.5 h-2.5" /></a></li>
                        </ol>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">You can connect your existing business WhatsApp number — Twilio acts as the API bridge.</p>
                      </div>
                    )}
                    {newChannel.type === 'sms' && (
                      <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-lg space-y-1.5">
                        <p className="text-[11px] font-medium text-purple-700 dark:text-purple-400">Setup Guide</p>
                        <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
                          <li>Sign up at <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">twilio.com <ExternalLink className="w-2.5 h-2.5" /></a> (or log in)</li>
                          <li>Go to <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Twilio Console <ExternalLink className="w-2.5 h-2.5" /></a> → copy Account SID & Auth Token</li>
                          <li><a href="https://console.twilio.com/us1/develop/phone-numbers/manage/search" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Buy a phone number <ExternalLink className="w-2.5 h-2.5" /></a> (or use an existing one)</li>
                          <li>Paste your credentials above</li>
                          <li>After connecting, set the webhook URL in your <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Phone Number settings <ExternalLink className="w-2.5 h-2.5" /></a></li>
                        </ol>
                      </div>
                    )}
                    {newChannel.type === 'facebook' && (
                      <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg space-y-1.5">
                        <p className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Setup Guide — Facebook Messenger</p>
                        <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
                          <li>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Meta Developers <ExternalLink className="w-2.5 h-2.5" /></a> → Create or select your App</li>
                          <li>Add the <strong>Messenger</strong> product to your app</li>
                          <li>Under Messenger Settings → generate a <strong>Page Access Token</strong> for your Page</li>
                          <li>Copy your <strong>Page ID</strong> from your Facebook Page's About section</li>
                          <li>Choose a <strong>Verify Token</strong> (any secret string you make up)</li>
                          <li>Paste all three values above, then connect</li>
                          <li>After connecting, configure the webhook URL in Meta's dashboard</li>
                        </ol>
                      </div>
                    )}
                    {newChannel.type === 'instagram' && (
                      <div className="bg-pink-50/50 dark:bg-pink-950/20 p-3 rounded-lg space-y-1.5">
                        <p className="text-[11px] font-medium text-pink-700 dark:text-pink-400">Setup Guide — Instagram DMs</p>
                        <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal ml-3.5">
                          <li>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 inline-flex items-center gap-0.5">Meta Developers <ExternalLink className="w-2.5 h-2.5" /></a> → Create or select your App</li>
                          <li>Add the <strong>Instagram</strong> product to your app</li>
                          <li>Connect your Instagram Professional account to a Facebook Page</li>
                          <li>Generate a <strong>Page Access Token</strong> with <code className="bg-muted px-1 rounded text-[10px]">instagram_manage_messages</code> permission</li>
                          <li>Find your <strong>Instagram Account ID</strong> via the API or Business Suite</li>
                          <li>Choose a <strong>Verify Token</strong> (any secret string you make up)</li>
                          <li>Paste all three values above, then connect</li>
                          <li>After connecting, configure the webhook URL in Meta's dashboard</li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {newChannel.type === 'web' && (
                  <div className="bg-orange-50/50 dark:bg-orange-950/20 p-3 rounded-lg space-y-1.5">
                    <p className="text-[11px] font-medium text-orange-700 dark:text-orange-400">Easiest option — no accounts needed!</p>
                    <p className="text-[11px] text-muted-foreground">
                      After connecting, you'll get one line of code to paste on your website. The chat bubble captures visitor enquiries automatically so your AI agent can reply, quote, and follow up.
                    </p>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setNewChannel({ type: 'email', name: '', config: {} }); }}>Cancel</Button>
                  <Button size="sm" onClick={handleCreate}>Connect Channel</Button>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCreate(!showCreate)}
            >
              <Plus className="w-4 h-4 mr-2" />
              {showCreate ? 'Cancel' : 'Connect New Channel'}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export { channelIcon, channelColor, CHANNEL_TYPES };
