import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import {
  BarChart3, ArrowLeft, Loader2, MessageSquare, Users, Bot, Timer,
  TrendingUp, Clock, Mail, Phone, Globe, Facebook, Instagram,
  RefreshCw, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FileText, Download } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CHANNEL_ICONS = {
  whatsapp: Phone,
  sms: Phone,
  email: Mail,
  facebook: Facebook,
  instagram: Instagram,
  web: Globe
};

const CHANNEL_COLORS = {
  whatsapp: 'bg-green-500',
  sms: 'bg-blue-500',
  email: 'bg-purple-500',
  facebook: 'bg-blue-600',
  instagram: 'bg-pink-500',
  web: 'bg-gray-500'
};

const STATUS_COLORS = {
  new: 'bg-blue-500',
  read: 'bg-yellow-500',
  replied: 'bg-green-500',
  archived: 'bg-gray-400'
};

export default function AnalyticsPanel({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/analytics/dashboard?days=${days}`, {
        withCredentials: true
      });
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const maxDaily = data?.daily_messages?.length
    ? Math.max(...data.daily_messages.map(d => d.total), 1)
    : 1;

  const maxChannelCount = data?.channels?.length
    ? Math.max(...data.channels.map(c => c.count), 1)
    : 1;

  // --- Export handlers ---
  const handleExportJSON = async () => {
    try {
      const res = await axios.get(`${API}/export/analytics/json`, { withCredentials: true });
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to export JSON');
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    // Flatten daily messages for CSV
    const rows = [
      ['Date','Inbound','Outbound','Total'],
      ...data.daily_messages.map(d => [d.date, d.inbound, d.outbound, d.total])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_activity_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Analytics
            </h2>
            <p className="text-sm text-muted-foreground">Performance overview for your channels</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportJSON}>
                <FileText className="w-4 h-4 mr-2" /> Download JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="w-4 h-4 mr-2" /> Download CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="text-sm border rounded-md px-2 py-1.5 bg-background"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button variant="ghost" size="icon" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Messages
              </div>
              <p className="text-2xl font-bold">{data.summary.messages_in_period}</p>
              <p className="text-xs text-muted-foreground">{data.summary.total_messages} total</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                <Users className="w-3.5 h-3.5" />
                Customers
              </div>
              <p className="text-2xl font-bold">{data.summary.unique_customers}</p>
              <p className="text-xs text-muted-foreground">unique in period</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                <Bot className="w-3.5 h-3.5" />
                AI Replies
              </div>
              <p className="text-2xl font-bold">{data.summary.ai_auto_replies}</p>
              <p className="text-xs text-muted-foreground">auto-generated</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                <Timer className="w-3.5 h-3.5" />
                Follow-ups
              </div>
              <p className="text-2xl font-bold">{data.summary.follow_ups_sent}</p>
              <p className="text-xs text-muted-foreground">sent in period</p>
            </Card>
          </div>

          {/* Message Activity Chart */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Message Activity
            </h3>
            {data.daily_messages.length > 0 ? (
              <div className="space-y-1">
                <div className="flex items-end gap-[2px] h-32">
                  {data.daily_messages.map((day, i) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover border rounded px-2 py-1 text-xs shadow-md hidden group-hover:block whitespace-nowrap z-10">
                        {day.date}: {day.inbound} in / {day.outbound} out
                      </div>
                      <div
                        className="w-full bg-primary/20 rounded-t-sm relative overflow-hidden"
                        style={{ height: `${(day.total / maxDaily) * 100}%`, minHeight: day.total > 0 ? '4px' : '1px' }}
                      >
                        <div
                          className="absolute bottom-0 w-full bg-primary rounded-t-sm"
                          style={{ height: `${day.inbound > 0 ? (day.inbound / day.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                  <span>{data.daily_messages[0]?.date?.slice(5)}</span>
                  <span>{data.daily_messages[data.daily_messages.length - 1]?.date?.slice(5)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Inbound</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/20 inline-block" /> Outbound</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No message data for this period</p>
            )}
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Channel Breakdown */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Messages by Channel</h3>
              {data.channels.length > 0 ? (
                <div className="space-y-2">
                  {data.channels.map(ch => {
                    const Icon = CHANNEL_ICONS[ch.channel] || Globe;
                    const color = CHANNEL_COLORS[ch.channel] || 'bg-gray-500';
                    return (
                      <div key={ch.channel} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="capitalize font-medium">{ch.channel}</span>
                            <span className="text-muted-foreground">{ch.count}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${color} rounded-full`}
                              style={{ width: `${(ch.count / maxChannelCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No channel data</p>
              )}
            </Card>

            {/* Status Breakdown */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Message Status</h3>
              {data.statuses.length > 0 ? (
                <>
                  <div className="flex h-4 rounded-full overflow-hidden mb-3">
                    {data.statuses.map(s => {
                      const pct = (s.count / data.summary.messages_in_period) * 100;
                      return (
                        <div
                          key={s.status}
                          className={`${STATUS_COLORS[s.status] || 'bg-gray-400'}`}
                          style={{ width: `${pct}%` }}
                          title={`${s.status}: ${s.count}`}
                        />
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {data.statuses.map(s => (
                      <div key={s.status} className="flex items-center gap-2 text-sm">
                        <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[s.status] || 'bg-gray-400'}`} />
                        <span className="capitalize">{s.status}</span>
                        <span className="text-muted-foreground ml-auto">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No status data</p>
              )}
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* AI Performance */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                AI Performance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI handling rate</span>
                  <span className="font-semibold">
                    {data.summary.messages_in_period > 0
                      ? Math.round((data.summary.ai_auto_replies / data.summary.messages_in_period) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg rating</span>
                  <span className="font-semibold flex items-center gap-1">
                    {data.ratings.avg_rating ? data.ratings.avg_rating.toFixed(1) : '—'}
                    <span className="text-amber-500">★</span>
                    <span className="text-xs text-muted-foreground">({data.ratings.total_rated} rated)</span>
                  </span>
                </div>
                {data.follow_up_breakdown.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Follow-ups sent</span>
                    <div className="flex items-center gap-2">
                      {data.follow_up_breakdown.map(f => (
                        <Badge key={f.follow_up} variant="secondary" className="text-xs">
                          #{f.follow_up}: {f.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Busiest Hours */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Busiest Hours
              </h3>
              {data.busiest_hours.length > 0 ? (
                <div className="space-y-2">
                  {data.busiest_hours.map((h, i) => {
                    const hour = parseInt(h.hour, 10);
                    const label = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
                    return (
                      <div key={h.hour} className="flex items-center gap-3 text-sm">
                        <span className="w-14 text-muted-foreground">{label}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(h.count / data.busiest_hours[0].count) * 100}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-8 text-right">{h.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
