import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CreditCard, Check, Zap, Crown, Building2, ExternalLink, Loader2 } from 'lucide-react';

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    limit: '50 AI handled enquiries/mo',
    seats: '1 user',
    features: ['AI enquiry handling', 'Response templates', 'CSV export'],
    cta: 'Current Plan',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 29,
    limit: 'Unlimited AI handled enquiries',
    seats: '3 team seats',
    popular: true,
    features: ['Everything in Free', 'Unlimited AI handling', 'PDF export', 'AI coaching', 'Analytics dashboard', 'Webhook automations', 'Multi-channel inbox'],
    cta: 'Upgrade to Pro',
  },
  {
    key: 'business',
    name: 'Business',
    price: 79,
    limit: 'Unlimited AI handled enquiries',
    seats: '10 team seats',
    features: ['Everything in Pro', '10 team seats', 'Team collaboration', 'Priority support', 'Advanced analytics'],
    cta: 'Upgrade to Business',
  },
];

const PlanIcon = ({ plan }) => {
  if (plan === 'business') return <Building2 className="w-5 h-5" />;
  if (plan === 'pro') return <Crown className="w-5 h-5" />;
  return <Zap className="w-5 h-5" />;
};

export const BillingDialog = ({ open, onOpenChange, subscription, onCheckout, onManage }) => {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const currentPlan = subscription?.plan || 'free';
  const usage = subscription?.usage || 0;
  const limit = subscription?.limit || 50;
  const usagePercent = limit === -1 ? 0 : Math.min((usage / limit) * 100, 100);

  const handleCheckout = async (planKey) => {
    setLoadingPlan(planKey);
    await onCheckout(planKey);
    setLoadingPlan(null);
  };

  const handleManage = async () => {
    setLoadingPortal(true);
    await onManage();
    setLoadingPortal(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing & Plans
          </DialogTitle>
        </DialogHeader>

        {/* Current Usage */}
        <div className="rounded-lg border p-4 mb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
            <div className="flex items-center gap-2">
              <PlanIcon plan={currentPlan} />
              <span className="font-medium capitalize">{currentPlan} Plan</span>
              {subscription?.cancel_at_period_end && (
                <Badge variant="destructive" className="text-[10px]">Cancelling</Badge>
              )}
            </div>
            {currentPlan !== 'free' && (
              <Button variant="outline" size="sm" onClick={handleManage} disabled={loadingPortal}>
                {loadingPortal ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ExternalLink className="w-3 h-3 mr-1" />}
                Manage Subscription
              </Button>
            )}
          </div>
          {limit !== -1 ? (
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>AI handled enquiries this month</span>
                <span>{usage} / {limit}</span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              {usagePercent >= 80 && (
                <p className="text-xs text-amber-600 mt-1">
                  {usagePercent >= 100 ? 'Limit reached — upgrade to keep handling enquiries.' : 'Approaching limit — consider upgrading.'}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{usage} enquiries handled by AI this month (unlimited)</p>
          )}
          {subscription?.current_period_end && (
            <p className="text-xs text-muted-foreground mt-2">
              {subscription.cancel_at_period_end ? 'Access until' : 'Renews'}: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            const isDowngrade = (currentPlan === 'business' && plan.key !== 'business') || (currentPlan === 'pro' && plan.key === 'free');
            
            return (
              <div
                key={plan.key}
                className={`rounded-xl border-2 p-5 relative ${
                  plan.popular ? 'border-primary shadow-md' : 'border-border'
                } ${isCurrent ? 'bg-primary/5' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px]">Most Popular</Badge>
                )}
                <div className="text-center mb-4">
                  <PlanIcon plan={plan.key} />
                  <h3 className="font-semibold text-lg mt-1">{plan.name}</h3>
                  <div className="mt-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{plan.limit} · {plan.seats}</p>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                  disabled={isCurrent || isDowngrade || !!loadingPlan}
                  onClick={() => handleCheckout(plan.key)}
                >
                  {loadingPlan === plan.key && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                  {isCurrent ? 'Current Plan' : isDowngrade ? 'Manage to Change' : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
