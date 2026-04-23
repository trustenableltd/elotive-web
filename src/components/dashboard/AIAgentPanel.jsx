import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import {
  Bot, Plus, Trash2, Save, Loader2, ArrowLeft, Zap, Phone, Mail,
  MapPin, Clock, Calendar, Link, MessageSquare, Settings2,
  Facebook, Instagram, Globe, AlertTriangle, CheckCircle, Timer
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CHANNEL_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { value: 'sms', label: 'SMS', icon: Phone, color: 'text-purple-500' },
  { value: 'email', label: 'Email', icon: Mail, color: 'text-blue-400' },
  { value: 'web', label: 'Web Widget', icon: Globe, color: 'text-orange-500' },
];

export const AIAgentPanel = ({ onBack }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API}/ai-agent`, { withCredentials: true });
      setSettings(resp.data);
    } catch (e) {
      console.error('Failed to load AI agent settings:', e);
      toast.error('Failed to load settings');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const update = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const resp = await axios.put(`${API}/ai-agent`, settings, { withCredentials: true });
      setSettings(resp.data);
      setHasChanges(false);
      toast.success('AI Agent settings saved');
    } catch (e) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const addService = () => {
    const services = [...(settings.services || []), { name: '', description: '', price: '' }];
    update('services', services);
  };

  const updateService = (idx, field, value) => {
    const services = [...(settings.services || [])];
    services[idx] = { ...services[idx], [field]: value };
    update('services', services);
  };

  const removeService = (idx) => {
    const services = (settings.services || []).filter((_, i) => i !== idx);
    update('services', services);
  };

  const toggleChannel = (channelType) => {
    const current = settings.enabled_channels || [];
    const updated = current.includes(channelType)
      ? current.filter(c => c !== channelType)
      : [...current, channelType];
    update('enabled_channels', updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Agent</h2>
            <Badge variant={settings.enabled ? 'default' : 'secondary'} className="text-xs">
              {settings.enabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        <Button size="sm" className="gap-1" onClick={saveSettings} disabled={saving || !hasChanges}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Save
        </Button>
      </div>

      {/* Master Toggle */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Autonomous Handling</p>
              <p className="text-xs text-muted-foreground">Automatically handle enquiries with AI replies, quotes, and follow-ups</p>
            </div>
          </div>
          <Switch
            checked={settings.enabled || false}
            onCheckedChange={v => update('enabled', v)}
          />
        </div>
        {settings.enabled && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              AI will automatically handle new enquiries. Make sure your business info, services, and quote rules are configured below.
            </p>
          </div>
        )}
      </Card>

      {/* Channel Selection */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Enabled Channels</h3>
        </div>
        <p className="text-xs text-muted-foreground">Select which channels the AI agent should respond on. Leave empty to respond on all channels.</p>
        <div className="flex flex-wrap gap-2">
          {CHANNEL_OPTIONS.map(ch => {
            const Icon = ch.icon;
            const active = (settings.enabled_channels || []).includes(ch.value);
            return (
              <button
                key={ch.value}
                onClick={() => toggleChannel(ch.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-border'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? '' : ch.color}`} />
                {ch.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Business Info */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Business Information</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Business Name</label>
            <input
              type="text"
              value={settings.business_name || ''}
              onChange={e => update('business_name', e.target.value)}
              placeholder="e.g. Acme Services Ltd"
              className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Business Description</label>
            <Textarea
              value={settings.business_description || ''}
              onChange={e => update('business_description', e.target.value)}
              placeholder="Briefly describe what your business does, what makes you unique..."
              className="text-sm min-h-[80px] resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Services & Pricing */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Services & Pricing</h3>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addService}>
            <Plus className="w-3 h-3" /> Add Service
          </Button>
        </div>
        {(settings.services || []).length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No services configured yet. Add your services so the AI knows what to offer customers.
          </p>
        ) : (
          <div className="space-y-3">
            {settings.services.map((svc, idx) => (
              <div key={idx} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={svc.name}
                    onChange={e => updateService(idx, 'name', e.target.value)}
                    placeholder="Service name"
                    className="flex-1 h-8 px-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={svc.price}
                    onChange={e => updateService(idx, 'price', e.target.value)}
                    placeholder="Price (e.g. £50)"
                    className="w-28 h-8 px-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive" onClick={() => removeService(idx)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <input
                  type="text"
                  value={svc.description}
                  onChange={e => updateService(idx, 'description', e.target.value)}
                  placeholder="Brief description (optional)"
                  className="w-full h-8 px-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Contact Info */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Contact Information</h3>
        </div>
        <p className="text-xs text-muted-foreground">The AI will share this info when customers need to reach you directly.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Phone
            </label>
            <input
              type="tel"
              value={settings.contact_phone || ''}
              onChange={e => update('contact_phone', e.target.value)}
              placeholder="+44 7700 900000"
              className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </label>
            <input
              type="email"
              value={settings.contact_email || ''}
              onChange={e => update('contact_email', e.target.value)}
              placeholder="hello@business.com"
              className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Address
          </label>
          <input
            type="text"
            value={settings.contact_address || ''}
            onChange={e => update('contact_address', e.target.value)}
            placeholder="123 High Street, London, UK"
            className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </Card>

      {/* Working Hours & Booking */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Hours, Quotes & Booking</h3>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Working Hours
          </label>
          <input
            type="text"
            value={settings.working_hours || ''}
            onChange={e => update('working_hours', e.target.value)}
            placeholder="Mon-Fri 9am-5pm, Sat 10am-2pm"
            className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Appointment Booking</p>
              <p className="text-xs text-muted-foreground">Let AI share your booking link when customers are ready to confirm</p>
            </div>
          </div>
          <Switch
            checked={settings.booking_enabled || false}
            onCheckedChange={v => update('booking_enabled', v)}
          />
        </div>
        {settings.booking_enabled && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Link className="w-3 h-3" /> Booking Link
            </label>
            <input
              type="url"
              value={settings.booking_link || ''}
              onChange={e => update('booking_link', e.target.value)}
              placeholder="https://calendly.com/your-business"
              className="w-full h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}
      </Card>

      {/* Escalation & Custom Instructions */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Escalation & Custom Behavior</h3>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Escalation Message</label>
          <Textarea
            value={settings.escalation_message || ''}
            onChange={e => update('escalation_message', e.target.value)}
            placeholder="e.g. I'd love to help further! Please call us on 0800 123 456 or email support@business.com for complex requests."
            className="text-sm min-h-[60px] resize-none"
          />
          <p className="text-[10px] text-muted-foreground mt-1">The AI will use this when it can't handle a request and needs to hand off to a human.</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Custom Instructions</label>
          <Textarea
            value={settings.custom_instructions || ''}
            onChange={e => update('custom_instructions', e.target.value)}
            placeholder="e.g. Always greet by name. Offer 10% discount for first-time customers. Never discuss competitor pricing..."
            className="text-sm min-h-[80px] resize-none"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Extra rules or personality traits for the AI to follow.</p>
        </div>
      </Card>

      {/* Follow-Up Settings */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-sm">Smart Follow-Ups</h3>
              <p className="text-xs text-muted-foreground">Automatically nudge customers who stop replying</p>
            </div>
          </div>
          <Switch
            checked={settings.follow_up_enabled || false}
            onCheckedChange={v => update('follow_up_enabled', v)}
          />
        </div>
        {settings.follow_up_enabled && (
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Follow-ups only send when the customer has gone quiet. Max 2-3 natural messages designed to recover lost enquiries.
              </p>
            </div>
            {/* Follow-up 1 */}
            <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5">1st</Badge>
                  <span className="text-xs font-medium">First follow-up</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.follow_up_1_delay || 25}
                    onChange={e => update('follow_up_1_delay', parseInt(e.target.value) || 25)}
                    className="w-16 h-7 px-2 rounded-md border bg-background text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-[10px] text-muted-foreground">min</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Casual check-in after no reply. Quick and helpful.</p>
            </div>
            {/* Follow-up 2 */}
            <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5">2nd</Badge>
                  <span className="text-xs font-medium">Second follow-up</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="30"
                    max="720"
                    value={settings.follow_up_2_delay || 180}
                    onChange={e => update('follow_up_2_delay', parseInt(e.target.value) || 180)}
                    className="w-16 h-7 px-2 rounded-md border bg-background text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-[10px] text-muted-foreground">min</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Warm nudge mentioning availability. Zero pressure.</p>
            </div>
            {/* Follow-up 3 (optional) */}
            <div className={`p-3 rounded-lg border space-y-2 ${settings.follow_up_3_enabled ? 'bg-muted/30' : 'bg-muted/10 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5">3rd</Badge>
                  <span className="text-xs font-medium">Final follow-up (optional)</span>
                </div>
                <Switch
                  checked={settings.follow_up_3_enabled || false}
                  onCheckedChange={v => update('follow_up_3_enabled', v)}
                />
              </div>
              {settings.follow_up_3_enabled && (
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[10px] text-muted-foreground">Brief, open-ended. "Here when you're ready."</p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="60"
                      max="4320"
                      value={settings.follow_up_3_delay || 1440}
                      onChange={e => update('follow_up_3_delay', parseInt(e.target.value) || 1440)}
                      className="w-16 h-7 px-2 rounded-md border bg-background text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <span className="text-[10px] text-muted-foreground">min</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Status Summary */}
      {settings.enabled && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <h3 className="font-medium text-sm text-green-700 dark:text-green-400">Agent Active</h3>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Responding on: {(settings.enabled_channels || []).length > 0 ? settings.enabled_channels.join(', ') : 'All channels'}</p>
            <p>Services configured: {(settings.services || []).filter(s => s.name).length}</p>
            <p>Booking: {settings.booking_enabled ? 'Enabled' : 'Disabled'}</p>
            <p>Follow-ups: {settings.follow_up_enabled ? `Enabled (${settings.follow_up_3_enabled ? '3' : '2'} max)` : 'Disabled'}</p>
          </div>
        </Card>
      )}

      {/* Bottom Save */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button className="gap-1 shadow-lg" onClick={saveSettings} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};
