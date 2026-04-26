
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Zap, MessageSquare, Sparkles, ArrowRight, PlayCircle } from 'lucide-react';
import { EmailAuthDialog } from './EmailAuthDialog';
import { ElotiveLogoMark } from './BrandLogo';

export const Landing = () => {
  const { login, showEmailDialog, setShowEmailDialog, emailLoading, emailError, handleEmailAuth } = useAuth();
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const demoVideoUrl = process.env.REACT_APP_DEMO_VIDEO_URL || '/elotive-overview.mp4';
  const demoPosterUrl = process.env.REACT_APP_DEMO_POSTER_URL || '/elotive-overview-poster.svg';
  // const [isGuestLoading, setIsGuestLoading] = useState(false);



  return (
    <div className="min-h-screen hero-gradient overflow-x-hidden">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <ElotiveLogoMark className="w-10 h-10" />
            <span className="text-xl font-semibold font-['Outfit']">Elotive AI</span>
          </div>
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              onClick={() => login('google')}
              data-testid="login-google-btn"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 sm:px-6 w-full"
            >
              Sign in with Google
            </Button>
            <Button
              onClick={() => setShowEmailDialog(true)}
              variant="outline"
              data-testid="login-email-btn"
              className="rounded-full px-4 sm:px-6 w-full"
            >
              Sign in with Email
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 sm:px-6 py-8 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8 max-w-2xl md:max-w-none">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI Agent For Service Businesses
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-['Outfit'] tracking-tight leading-[1.1]">
                Turn enquiries into{' '}
                <span className="text-primary">booked jobs faster</span>
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                Elotive AI helps you draft instant replies for free. Upgrade for automated quotes
                and follow-ups so more leads become confirmed bookings.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => login('google')}
                  data-testid="get-started-btn"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 sm:px-8 min-h-[44px] sm:min-h-[48px] text-base sm:text-lg btn-press"
                >
                  Start Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => setShowEmailDialog(true)}
                  variant="outline"
                  className="rounded-full px-6 sm:px-8 min-h-[44px] sm:min-h-[48px] text-base sm:text-lg btn-press"
                >
                  Email Login
                </Button>
              </div>
      <EmailAuthDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        onSubmit={handleEmailAuth}
        loading={emailLoading}
        error={emailError}
      />

              {/* Free vs Premium */}
              <div className="pt-8 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-card/50 p-4 h-full sm:min-h-[180px]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold font-['Outfit']">Free</h3>
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 marker:text-muted-foreground/80">
                      <li>AI reply drafting from pasted enquiries</li>
                      <li>Tone controls</li>
                      <li>Manual send</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border bg-card/50 p-4 h-full sm:min-h-[180px]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-md bg-indigo-100 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold font-['Outfit']">Premium</h3>
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5 marker:text-muted-foreground/80">
                      <li>Automated quotes</li>
                      <li>Automatic follow-ups</li>
                      <li>Multi-channel inbox</li>
                      <li>Team collaboration</li>
                    </ul>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Free = draft replies with manual send. Premium = automated workflows.
                </p>
                <a
                  href="#pricing"
                  className="inline-flex text-sm font-medium text-primary hover:text-primary/80"
                >
                  See full Pro and Business plan details
                </a>
              </div>
            </div>

            {/* Right Content - Preview */}
            <div className="relative w-full max-w-xl md:max-w-none mx-auto md:mx-0">
              <div className="glass rounded-2xl p-6 card-shadow mb-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <PlayCircle className="w-4 h-4" />
                  How Elotive Works (36 sec)
                </div>
                {!videoUnavailable ? (
                  <div className="relative rounded-xl overflow-hidden border border-primary/25 bg-slate-950">
                    <video
                      className="w-full bg-slate-950"
                      controls
                      preload="metadata"
                      poster={demoPosterUrl}
                      onError={() => setVideoUnavailable(true)}
                      onLoadedData={() => setVideoUnavailable(false)}
                    >
                      <source src={demoVideoUrl} type="video/mp4" />
                    </video>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-emerald-400/10" />
                  </div>
                ) : (
                  <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-background to-emerald-400/10 p-5 text-sm text-muted-foreground">
                    <div className="rounded-lg border border-primary/20 bg-card/70 p-4 space-y-2">
                      <p className="text-foreground font-medium">Demo video unavailable locally</p>
                      <p>
                        Add your demo clip at <strong>/frontend/public/elotive-overview.mp4</strong>
                      </p>
                      <p>
                        Or set <strong>REACT_APP_DEMO_VIDEO_URL</strong> to a hosted MP4 URL.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-6 card-shadow">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    Customer Message
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl text-sm">
                    "Hi, can I get a quote to move a 2-bed flat this Friday?"
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-medium">
                      Friendly
                    </span>
                  </div>
                  
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <p className="text-sm leading-relaxed">
                      "Absolutely. Your move is estimated at £240 based on your details.
                      We have 10am and 2pm slots available Friday. Want me to confirm your booking?"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="w-3 h-3" />
                    Powered by Elotive AI Agent
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-8 -right-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -z-10 -bottom-8 -left-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>
          </div>

          <section id="pricing" className="mt-20 border-t border-border/60 pt-12">
            <div className="max-w-3xl space-y-3 mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/80">Pricing</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Outfit'] tracking-tight">
                Choose the plan that fits your workflow
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Start free with AI-drafted replies. Upgrade when you want quotes, follow-ups, and team workflows to run at scale.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border bg-card/70 p-6 card-shadow space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold font-['Outfit']">Pro</h3>
                    <span className="text-sm font-medium text-primary">Most teams start here</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold font-['Outfit']">$29</span>
                    <span className="text-muted-foreground pb-1">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Unlimited AI-handled enquiries · 3 team seats</p>
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 marker:text-primary/70">
                  <li>Everything in Free</li>
                  <li>Unlimited AI handling</li>
                  <li>3 team seats</li>
                  <li>PDF export</li>
                  <li>AI coaching</li>
                  <li>Analytics dashboard</li>
                  <li>Webhook automations</li>
                  <li>Multi-channel inbox</li>
                  <li>Workflow management</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-6 card-shadow space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold font-['Outfit']">Business</h3>
                    <span className="text-sm font-medium text-primary">For larger teams</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold font-['Outfit']">$79</span>
                    <span className="text-muted-foreground pb-1">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Unlimited AI-handled enquiries · 10 team seats</p>
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 marker:text-primary/70">
                  <li>Everything in Pro</li>
                  <li>10 team seats</li>
                  <li>Team collaboration</li>
                  <li>Priority support</li>
                  <li>Advanced analytics</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
