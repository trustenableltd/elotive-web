import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import {
  Inbox, Mail, MessageSquare, Phone, Globe, Archive, Reply, Eye, Send,
  Loader2, CheckCircle, ArrowLeft, Settings2, Facebook, Instagram,
  Image, Video, Paperclip, X, Play, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const CHANNEL_ICONS = { email: Mail, whatsapp: MessageSquare, sms: Phone, web: Globe, facebook: Facebook, instagram: Instagram };
const CHANNEL_COLORS = {
  email: 'bg-blue-500',
  whatsapp: 'bg-green-500',
  sms: 'bg-purple-500',
  web: 'bg-orange-500',
  facebook: 'bg-[#1877F2]',
  instagram: 'bg-pink-500'
};
const CHANNEL_LIGHT = {
  email: 'bg-blue-50 dark:bg-blue-950/30',
  whatsapp: 'bg-green-50 dark:bg-green-950/30',
  sms: 'bg-purple-50 dark:bg-purple-950/30',
  web: 'bg-orange-50 dark:bg-orange-950/30',
  facebook: 'bg-blue-50 dark:bg-blue-950/30',
  instagram: 'bg-pink-50 dark:bg-pink-950/30'
};
const STATUS_COLORS = { new: 'destructive', read: 'secondary', replied: 'default', archived: 'outline' };

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function resolveMediaUrl(url) {
  if (!url) return url;
  // Twilio media URLs require auth — proxy them through our backend
  if (url.includes('api.twilio.com') || url.includes('media.twiliocdn.com')) {
    return `${API}/media-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

const MediaAttachment = ({ att }) => {
  const [expanded, setExpanded] = useState(false);
  if (!att?.url && !att?.name) return null;
  const mediaUrl = resolveMediaUrl(att.url);
  // Only use credentials for proxied URLs (our backend), not external CDNs
  const isProxied = mediaUrl.includes('/media-proxy');
  const crossOriginAttr = isProxied ? 'use-credentials' : undefined;

  if (att.type === 'image') {
    return (
      <div className="relative group">
        <img
          src={mediaUrl}
          alt={att.name || 'Image'}
          crossOrigin={crossOriginAttr}
          className={`rounded-lg border cursor-pointer transition-all ${expanded ? 'max-w-full' : 'max-w-[240px] max-h-[180px] object-cover'}`}
          onClick={() => setExpanded(!expanded)}
        />
        <div className="absolute top-1 left-1 bg-black/50 rounded px-1.5 py-0.5 text-[10px] text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Image className="w-3 h-3" /> Image
        </div>
      </div>
    );
  }

  if (att.type === 'video') {
    return (
      <div className="relative">
        <video
          src={mediaUrl}
          controls
          crossOrigin={crossOriginAttr}
          className="rounded-lg border max-w-[320px] max-h-[240px]"
        />
        <div className="absolute top-1 left-1 bg-black/50 rounded px-1.5 py-0.5 text-[10px] text-white flex items-center gap-1">
          <Play className="w-3 h-3" /> Video
        </div>
      </div>
    );
  }

  if (att.type === 'audio') {
    return <audio src={mediaUrl} controls crossOrigin={crossOriginAttr} className="max-w-[280px]" />;
  }

  return (
    <a href={mediaUrl} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50 hover:bg-muted transition-colors text-sm max-w-[240px]">
      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="truncate">{att.name || 'Attachment'}</span>
    </a>
  );
};

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ────────────────────────────────────────────
   Thread list item (left sidebar)
   ──────────────────────────────────────────── */
const ThreadListItem = ({ thread, isActive, onClick }) => {
  const Icon = CHANNEL_ICONS[thread.channel_type] || Globe;
  const colorClass = CHANNEL_COLORS[thread.channel_type] || 'bg-gray-500';
  const hasUnread = thread.unread_count > 0;
  const timeAgo = getTimeAgo(thread.last_message_at);
  const preview = thread.last_message_body?.slice(0, 60) || (thread.last_attachments?.length > 0 ? `[${thread.last_attachments[0]?.type || 'attachment'}]` : '');

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 flex items-start gap-3 transition-colors border-b border-border/50 ${
        isActive
          ? 'bg-primary/10 border-l-2 border-l-primary'
          : 'hover:bg-muted/50 border-l-2 border-l-transparent'
      }`}
    >
      <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon className="w-4.5 h-4.5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm truncate ${hasUnread ? 'font-bold' : 'font-medium'}`}>
            {thread.from_name || thread.from_address || 'Unknown'}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-xs truncate ${hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {preview || 'No messages'}
          </p>
          {hasUnread && (
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {thread.unread_count > 9 ? '9+' : thread.unread_count}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{thread.channel_type} · {thread.message_count} message{thread.message_count !== 1 ? 's' : ''}</p>
      </div>
    </button>
  );
};

/* ────────────────────────────────────────────
   Single message bubble inside the thread view
   ──────────────────────────────────────────── */
const MessageBubble = ({ msg, onReply, onMarkRead }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(msg.status === 'replied');
  const isNew = msg.status === 'new';
  const lightClass = CHANNEL_LIGHT[msg.channel_type] || 'bg-muted/50';

  const handleGenerateReply = async () => {
    setIsReplying(true);
    setIsGenerating(true);
    try {
      const result = await onReply(msg, false);
      if (result?.reply_text) setReplyText(result.reply_text);
    } catch (e) {
      toast.error('Failed to draft response');
    }
    setIsGenerating(false);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() && !mediaUrl.trim()) return;
    setIsSending(true);
    try {
      const result = await onReply(msg, true, replyText, mediaUrl || undefined);
      if (result?.sent) {
        toast.success(`Response sent via ${msg.channel_type}!`);
      } else {
        toast.success('Response saved as draft');
      }
      setSent(true);
      setIsReplying(false);
      setMediaUrl('');
    } catch (e) {
      toast.error('Failed to send response');
    }
    setIsSending(false);
  };

  const timeStr = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  const dateStr = msg.created_at
    ? new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="group px-4 py-1.5">
      {/* Inbound message bubble */}
      <div className="max-w-[85%]">
        <div className={`rounded-2xl rounded-tl-sm px-4 py-2.5 ${lightClass}`}>
          {msg.body && (
            <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
          )}
          {msg.attachments?.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${msg.body ? 'mt-2' : ''}`}>
              {msg.attachments.map((att, i) => (
                <MediaAttachment key={i} att={att} />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-[10px] text-muted-foreground">{dateStr} {timeStr}</span>
          {isNew && <span className="text-[10px] text-primary font-medium">New</span>}
        </div>
      </div>

      {/* Reply bubble (sent by user) */}
      {msg.reply_text && !isReplying && (
        <div className="flex justify-end mt-2">
          <div className="max-w-[85%]">
            <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 bg-primary text-primary-foreground">
              <p className="text-sm whitespace-pre-wrap break-words">{msg.reply_text}</p>
              {msg.reply_media_url && (
                <div className="mt-2">
                  {/\.(mp4|webm|mov)$/i.test(msg.reply_media_url) ? (
                    <video src={msg.reply_media_url} controls className="max-w-[240px] max-h-[160px] rounded-lg" />
                  ) : (
                    <img src={msg.reply_media_url} alt="Sent media" className="max-w-[240px] max-h-[160px] rounded-lg object-cover" />
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 justify-end mt-1 px-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-[10px] text-muted-foreground">{msg.reply_sent ? 'Sent' : 'Draft'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Inline reply composer */}
      {isReplying && (
        <div className="mt-2 ml-0 max-w-[85%]">
          {isGenerating ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-3 px-4 bg-muted rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              Drafting AI response...
            </div>
          ) : (
            <div className="space-y-2 p-3 border rounded-xl bg-background shadow-sm">
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Review or edit before sending..."
                className="text-sm min-h-[60px] resize-none"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                  placeholder="Attach image/video URL"
                  className="flex-1 text-xs h-7 px-2 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {mediaUrl && (
                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setMediaUrl('')}>
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              {mediaUrl && (
                <div className="rounded-lg border p-2 bg-muted/30">
                  {/\.(mp4|webm|mov)$/i.test(mediaUrl) ? (
                    <video src={mediaUrl} controls className="max-w-[180px] max-h-[100px] rounded" />
                  ) : (
                    <img src={mediaUrl} alt="Preview" className="max-w-[180px] max-h-[100px] rounded object-cover"
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setIsReplying(false); setMediaUrl(''); }}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSendReply}
                  disabled={isSending || (!replyText.trim() && !mediaUrl.trim())}
                >
                  {isSending ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-3 h-3 mr-1" /> Send</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message actions */}
      {!isReplying && (
        <div className="flex gap-1.5 mt-1">
          {isNew && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => onMarkRead(msg.inbox_message_id)}>
              <Eye className="w-3 h-3 mr-0.5" /> Read
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Thread conversation view (right pane)
   ──────────────────────────────────────────── */
const ThreadView = ({ thread, onReply, onMarkRead, onArchive, onBackToList }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAutoMarkingRead, setIsAutoMarkingRead] = useState(false);
  const scrollRef = useRef(null);
  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;
  const Icon = CHANNEL_ICONS[thread.channel_type] || Globe;
  const colorClass = CHANNEL_COLORS[thread.channel_type] || 'bg-gray-500';

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axios.get(
        `${API_URL}/inbox/threads/${encodeURIComponent(thread.channel_id)}/${encodeURIComponent(thread.from_address)}`,
        { withCredentials: true }
      );
      setMessages(resp.data.messages || []);
    } catch (e) {
      console.error('Failed to load thread messages:', e);
    }
    setLoading(false);
  }, [API_URL, thread.channel_id, thread.from_address]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleReply = async (msg, sendNow, text, media) => {
    const result = await onReply(msg, sendNow, text, media);
    await loadMessages();
    return result;
  };

  const handleMarkRead = async (msgId) => {
    await onMarkRead(msgId);
    await loadMessages();
  };

  // Automatically mark inbound "new" messages as read once the thread is opened.
  useEffect(() => {
    const autoMarkRead = async () => {
      if (loading || isAutoMarkingRead || messages.length === 0) return;

      const unreadInboundIds = messages
        .filter(m => m.status === 'new' && m.direction !== 'outbound')
        .map(m => m.inbox_message_id);

      if (unreadInboundIds.length === 0) return;

      setIsAutoMarkingRead(true);
      try {
        await Promise.all(unreadInboundIds.map(id => onMarkRead(id)));
        await loadMessages();
      } finally {
        setIsAutoMarkingRead(false);
      }
    };

    autoMarkRead();
  }, [loading, isAutoMarkingRead, messages, onMarkRead, loadMessages]);

  // Get the latest inbound message (to reply to)
  const latestInbound = messages.length > 0
    ? [...messages].reverse().find(m => m.direction !== 'outbound') || messages[messages.length - 1]
    : null;

  const handleGenerateAI = async () => {
    if (!latestInbound) return;
    setIsGenerating(true);
    try {
      const result = await onReply(latestInbound, false);
      if (result?.reply_text) setReplyText(result.reply_text);
      await loadMessages();
    } catch (e) {
      toast.error('Failed to draft AI response');
    }
    setIsGenerating(false);
  };

  const handleSendFromComposer = async () => {
    if (!latestInbound || (!replyText.trim() && !mediaUrl.trim())) return;
    setIsSending(true);
    try {
      const result = await onReply(latestInbound, true, replyText, mediaUrl || undefined);
      if (result?.sent) {
        toast.success(`Response sent via ${thread.channel_type}!`);
      } else {
        toast.success('Response saved as draft');
      }
      setReplyText('');
      setMediaUrl('');
      await loadMessages();
    } catch (e) {
      toast.error('Failed to send response');
    }
    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b bg-background shrink-0">
        <Button variant="ghost" size="icon" className="w-8 h-8 lg:hidden" onClick={onBackToList}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center shrink-0 shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{thread.from_name || thread.from_address}</p>
          <p className="text-[11px] text-muted-foreground truncate capitalize">{thread.channel_type} · {thread.from_address}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{thread.message_count} msg{thread.message_count !== 1 ? 's' : ''}</Badge>
          {thread.unread_count > 0 && (
            <Badge variant="destructive" className="text-[10px]">{thread.unread_count} new</Badge>
          )}
        </div>
      </div>

      {/* Messages scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Inbox className="w-8 h-8 opacity-40 mb-2" />
            <p className="text-sm">No messages in this thread</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map(msg => (
              <MessageBubble
                key={msg.inbox_message_id}
                msg={msg}
                onReply={handleReply}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Persistent reply composer at bottom */}
      {!loading && messages.length > 0 && (
        <div className="shrink-0 border-t bg-background px-3 sm:px-4 py-3 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
          {isGenerating ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-3 bg-muted rounded-xl mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Drafting AI response...
            </div>
          ) : null}
          {mediaUrl && (
            <div className="rounded-lg border p-2 bg-muted/30 mb-2 inline-block">
              {/\.(mp4|webm|mov)$/i.test(mediaUrl) ? (
                <video src={mediaUrl} controls className="max-w-[160px] max-h-[90px] rounded" />
              ) : (
                <img src={mediaUrl} alt="Preview" className="max-w-[160px] max-h-[90px] rounded object-cover"
                  onError={e => { e.target.style.display = 'none'; }} />
              )}
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Respond to ${thread.from_name || thread.from_address}...`}
                className="text-sm min-h-[44px] max-h-[120px] resize-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && replyText.trim()) {
                    e.preventDefault();
                    handleSendFromComposer();
                  }
                }}
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 sm:h-7 text-xs gap-1 shrink-0"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Reply className="w-3 h-3" />}
                  AI Draft
                </Button>
                <div className="flex items-center gap-1 w-full sm:flex-1 sm:w-auto min-w-0">
                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    placeholder="Media URL"
                    className="flex-1 text-xs h-7 px-2 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {mediaUrl && (
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setMediaUrl('')}>
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <Button
                  size="sm"
                  className="h-8 sm:h-7 text-xs gap-1 shrink-0"
                  onClick={handleSendFromComposer}
                  disabled={isSending || (!replyText.trim() && !mediaUrl.trim())}
                >
                  {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Main InboxPanel — Messenger-style layout
   ──────────────────────────────────────────── */
export const InboxPanel = ({
  inboxMessages, unreadTotal, unreadByChannel,
  onMarkRead, onReply, onArchive,
  channelFilter, onChannelFilter, statusFilter, onStatusFilter,
  onBack, onManageChannels
}) => {
  const [activeThread, setActiveThread] = useState(null);
  const [localThreads, setLocalThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

  const fetchThreads = useCallback(async (showLoader) => {
    if (showLoader) setThreadsLoading(true);
    try {
      const params = new URLSearchParams();
      if (channelFilter) params.set('channel_type', channelFilter);
      const resp = await axios.get(`${API_URL}/inbox/threads?${params.toString()}`, { withCredentials: true });
      setLocalThreads(resp.data.threads || []);
    } catch (e) {
      console.error('Failed to fetch threads:', e);
    }
    if (showLoader) setThreadsLoading(false);
  }, [API_URL, channelFilter]);

  useEffect(() => {
    fetchThreads(true);
  }, [fetchThreads]);

  // Poll for new threads every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchThreads(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchThreads]);

  // Keep active thread open when switching channel filters — don't clear it
  const handleSelectThread = (thread) => {
    setActiveThread(thread);
  };

  const handleReply = async (msg, sendNow, text, media) => {
    const result = await onReply(msg, sendNow, text, media);
    fetchThreads(false);
    return result;
  };

  const handleMarkRead = async (msgId) => {
    await onMarkRead(msgId);
    fetchThreads(false);
  };

  const handleArchive = async (msgId) => {
    await onArchive(msgId);
    fetchThreads(false);
  };

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0" onClick={onBack} title="Back to Dashboard">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Inbox className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold truncate">Inbox</h2>
            {unreadTotal > 0 && (
              <Badge variant="destructive" className="text-xs h-5 px-2 shrink-0">{unreadTotal} new</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs hidden sm:flex" onClick={onManageChannels}>
            <Settings2 className="w-3 h-3 mr-1" /> Manage Channels
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 sm:hidden" onClick={onManageChannels} title="Manage Channels">
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Channel filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => onChannelFilter(null)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            channelFilter === null
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-muted border-border'
          }`}
        >
          All Channels
        </button>
        {Object.entries(CHANNEL_ICONS).map(([type, ChIcon]) => (
          <button
            key={type}
            onClick={() => onChannelFilter(type)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              channelFilter === type
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-border'
            }`}
          >
            <ChIcon className="w-3 h-3" />
            <span className="capitalize">{type}</span>
            {(unreadByChannel?.[type] || 0) > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                {unreadByChannel[type]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main messenger layout: thread list + conversation */}
      <div className="flex border rounded-xl overflow-hidden bg-background h-[68dvh] sm:h-[72vh] lg:h-[calc(100vh-230px)]">
        {/* Left: Thread list */}
        <div className={`${activeThread ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-[340px] lg:min-w-[340px] border-r`}>
          <ScrollArea className="flex-1">
            {threadsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : localThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground px-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Inbox className="w-7 h-7 opacity-40" />
                </div>
                <p className="text-sm font-medium mb-1">No conversations</p>
                <p className="text-xs text-center">
                  {channelFilter
                    ? `No ${channelFilter} conversations yet`
                    : 'Messages from your channels will appear here'
                  }
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={onManageChannels}>
                  <Settings2 className="w-3 h-3 mr-1" /> Set Up Channels
                </Button>
              </div>
            ) : (
              localThreads.map(thread => (
                <ThreadListItem
                  key={thread.thread_id}
                  thread={thread}
                  isActive={activeThread?.thread_id === thread.thread_id}
                  onClick={() => handleSelectThread(thread)}
                />
              ))
            )}
          </ScrollArea>
        </div>

        {/* Right: Conversation view */}
        <div className={`${activeThread ? 'flex' : 'hidden lg:flex'} flex-col flex-1 min-w-0`}>
          {activeThread ? (
            <ThreadView
              thread={activeThread}
              onReply={handleReply}
              onMarkRead={handleMarkRead}
              onArchive={handleArchive}
              onBackToList={() => setActiveThread(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 opacity-40" />
              </div>
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-1">Choose a thread from the left to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
