
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Zap, MessageSquare, Clock, Sparkles, ArrowRight, PlayCircle } from 'lucide-react';
import { EmailAuthDialog } from './EmailAuthDialog';
import { ElotiveLogoMark } from './BrandLogo';

export const Landing = () => {
  const { login, showEmailDialog, setShowEmailDialog, emailLoading, emailError, handleEmailAuth } = useAuth();
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const demoVideoUrl = process.env.REACT_APP_DEMO_VIDEO_URL || '/elotive-overview.mp4';
  // const [isGuestLoading, setIsGuestLoading] = useState(false);



  return (
    <div className="min-h-screen hero-gradient">
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
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI Agent For Service Businesses
              </div>
              
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-['Outfit'] tracking-tight leading-tight">
                Turn enquiries into{' '}
                <span className="text-primary">booked jobs automatically</span>
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                Elotive AI replies instantly, provides accurate quotes, and follows up automatically
                so you convert more leads into confirmed bookings.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => login('google')}
                  data-testid="get-started-btn"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg btn-press"
                >
                  Start Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => setShowEmailDialog(true)}
                  variant="outline"
                  className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg btn-press"
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

              {/* Features */}
              <div className="grid sm:grid-cols-3 gap-6 pt-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-['Outfit']">Instant Replies</h3>
                    <p className="text-sm text-muted-foreground">Respond to every enquiry in minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-['Outfit']">Accurate Quotes</h3>
                    <p className="text-sm text-muted-foreground">Consistent pricing based on your rules</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-['Outfit']">Automatic Follow-Up</h3>
                    <p className="text-sm text-muted-foreground">Keep leads warm until they book</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Preview */}
            <div className="relative">
              <div className="glass rounded-2xl p-6 card-shadow mb-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <PlayCircle className="w-4 h-4" />
                  How Elotive Works (36 sec)
                </div>
                {!videoUnavailable ? (
                  <video
                    className="w-full rounded-xl border border-primary/20 bg-black/80"
                    controls
                    preload="metadata"
                    onError={() => setVideoUnavailable(true)}
                  >
                    <source src={demoVideoUrl} type="video/mp4" />
                    Your browser does not support embedded videos.
                  </video>
                ) : (
                  <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5 text-sm text-muted-foreground">
                    Add your demo clip at <strong>/frontend/public/elotive-overview.mp4</strong>
                    or set <strong>REACT_APP_DEMO_VIDEO_URL</strong> to a hosted MP4 URL.
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
        </div>
      </main>
    </div>
  );
};
