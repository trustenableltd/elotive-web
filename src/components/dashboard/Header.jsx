import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import {
  LogOut, Check, ChevronDown, Building2, Plus,
  Download, FileDown, FileText, Lightbulb, BarChart3,
  Moon, Sun, Settings, Users, Webhook, CreditCard, Inbox, Radio, Bot
} from 'lucide-react';
import { ElotiveLogoMark } from '../BrandLogo';

export const Header = ({
  profiles, activeProfile, authType, isDarkMode, setIsDarkMode,
  onSwitchProfile, onCreateProfile, onExport,
  onShowCoaching, onShowAnalytics, onShowTeam, onShowWebhooks, onShowBilling, onShowChannels, onShowInbox, onShowAIAgent, onShowAnalyticsPanel, onLogout,
  subscription, unreadTotal, activeTab
}) => {
  const userPlan = subscription?.plan || 'free';
  const hasPdfExport = userPlan === 'pro' || userPlan === 'business';
  const hasProFeatures = userPlan === 'pro' || userPlan === 'business';
  const hasBusinessFeatures = userPlan === 'business';

  return (
  <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ElotiveLogoMark className="w-9 h-9" />
        <span className="text-lg font-semibold font-['Outfit'] hidden sm:block">Elotive AI</span>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Profile Selector */}
        {profiles.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" data-testid="profile-selector">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {activeProfile?.business_name || 'Select Profile'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {profiles.map((profile) => (
                <DropdownMenuItem
                  key={profile.profile_id}
                  onClick={() => onSwitchProfile(profile)}
                  className={profile.profile_id === activeProfile?.profile_id ? 'bg-muted' : ''}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  <span className="truncate">{profile.business_name}</span>
                  {profile.is_active && <Check className="w-4 h-4 ml-auto text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCreateProfile}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              data-testid="export-btn"
              className="w-9 h-9"
              title="Export messages"
            >
              <Download className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport('csv')} data-testid="export-csv-btn">
              <FileDown className="w-4 h-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => hasPdfExport ? onExport('pdf') : onShowBilling()}
              data-testid="export-pdf-btn"
              className={!hasPdfExport ? 'opacity-60' : ''}
            >
              <FileText className="w-4 h-4 mr-2" />
              {hasPdfExport ? 'Export as PDF' : 'Export as PDF (Pro)'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI Coaching */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => hasProFeatures ? onShowCoaching() : onShowBilling()}
          data-testid="coaching-btn"
          className={`w-9 h-9 ${!hasProFeatures ? 'opacity-50' : ''}`}
          title={hasProFeatures ? 'AI Coaching' : 'AI Coaching (Pro)'}
        >
          <Lightbulb className="w-4 h-4" />
        </Button>

        {/* Analytics */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => hasProFeatures ? onShowAnalytics() : onShowBilling()}
          data-testid="analytics-btn"
          className={`w-9 h-9 ${!hasProFeatures ? 'opacity-50' : ''}`}
          title={hasProFeatures ? 'Analytics' : 'Analytics (Pro)'}
        >
          <BarChart3 className="w-4 h-4" />
        </Button>

        {/* Inbox */}
        <Button
          variant={activeTab === 'inbox' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => hasProFeatures ? onShowInbox?.() : onShowBilling()}
          className={`w-9 h-9 relative ${!hasProFeatures ? 'opacity-50' : ''}`}
          title={hasProFeatures ? 'Inbox' : 'Inbox (Pro)'}
        >
          <Inbox className="w-4 h-4" />
          {unreadTotal > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center px-1">
              {unreadTotal > 99 ? '99+' : unreadTotal}
            </span>
          )}
        </Button>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          data-testid="dark-mode-toggle"
          className="w-9 h-9"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* More Options Dropdown */}
        {authType === 'user' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onShowBilling}>
                <CreditCard className="w-4 h-4 mr-2" />
                Billing & Plans
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => hasBusinessFeatures ? onShowTeam() : onShowBilling()}
                className={!hasBusinessFeatures ? 'opacity-50' : ''}
              >
                <Users className="w-4 h-4 mr-2" />
                {hasBusinessFeatures ? 'Team' : 'Team (Business)'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => hasProFeatures ? onShowWebhooks() : onShowBilling()}
                className={!hasProFeatures ? 'opacity-50' : ''}
              >
                <Webhook className="w-4 h-4 mr-2" />
                {hasProFeatures ? 'Webhooks' : 'Webhooks (Pro)'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => hasProFeatures ? onShowChannels?.() : onShowBilling()}
                className={!hasProFeatures ? 'opacity-50' : ''}
              >
                <Radio className="w-4 h-4 mr-2" />
                {hasProFeatures ? 'Channels' : 'Channels (Pro)'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => hasProFeatures ? onShowAIAgent?.() : onShowBilling()}
                className={!hasProFeatures ? 'opacity-50' : ''}
              >
                <Bot className="w-4 h-4 mr-2" />
                {hasProFeatures ? 'AI Agent' : 'AI Agent (Pro)'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => hasProFeatures ? onShowAnalyticsPanel?.() : onShowBilling()}
                className={!hasProFeatures ? 'opacity-50' : ''}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {hasProFeatures ? 'Analytics' : 'Analytics (Pro)'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {authType === 'guest' && (
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
            Guest
          </span>
        )}
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onLogout}
          data-testid="logout-btn"
          className="text-muted-foreground"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </header>
  );
};
