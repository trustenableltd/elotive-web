import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { User, Trash2 } from 'lucide-react';

export const COUNTRIES = [
  { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP (£)' },
  { name: 'United States', flag: '🇺🇸', currency: 'USD ($)' },
  { name: 'Canada', flag: '🇨🇦', currency: 'CAD ($)' },
  { name: 'Australia', flag: '🇦🇺', currency: 'AUD ($)' },
  { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD ($)' },
  { name: 'South Africa', flag: '🇿🇦', currency: 'ZAR (R)' },
  { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN (₦)' },
  { name: 'Ghana', flag: '🇬🇭', currency: 'GHS (₵)' },
  { name: 'Kenya', flag: '🇰🇪', currency: 'KES (KSh)' },
  { name: 'India', flag: '🇮🇳', currency: 'INR (₹)' },
  { name: 'Pakistan', flag: '🇵🇰', currency: 'PKR (₨)' },
  { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT (৳)' },
  { name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED (د.إ)' },
  { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR (﷼)' },
  { name: 'Qatar', flag: '🇶🇦', currency: 'QAR (﷼)' },
  { name: 'Singapore', flag: '🇸🇬', currency: 'SGD ($)' },
  { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR (RM)' },
  { name: 'Philippines', flag: '🇵🇭', currency: 'PHP (₱)' },
  { name: 'Germany', flag: '🇩🇪', currency: 'EUR (€)' },
  { name: 'France', flag: '🇫🇷', currency: 'EUR (€)' },
  { name: 'Netherlands', flag: '🇳🇱', currency: 'EUR (€)' },
  { name: 'Spain', flag: '🇪🇸', currency: 'EUR (€)' },
  { name: 'Italy', flag: '🇮🇹', currency: 'EUR (€)' },
  { name: 'Ireland', flag: '🇮🇪', currency: 'EUR (€)' },
  { name: 'Portugal', flag: '🇵🇹', currency: 'EUR (€)' },
  { name: 'Poland', flag: '🇵🇱', currency: 'PLN (zł)' },
  { name: 'Sweden', flag: '🇸🇪', currency: 'SEK (kr)' },
  { name: 'Norway', flag: '🇳🇴', currency: 'NOK (kr)' },
  { name: 'Denmark', flag: '🇩🇰', currency: 'DKK (kr)' },
  { name: 'Switzerland', flag: '🇨🇭', currency: 'CHF (CHF)' },
  { name: 'Brazil', flag: '🇧🇷', currency: 'BRL (R$)' },
  { name: 'Mexico', flag: '🇲🇽', currency: 'MXN ($)' },
  { name: 'Argentina', flag: '🇦🇷', currency: 'ARS ($)' },
  { name: 'Colombia', flag: '🇨🇴', currency: 'COP ($)' },
  { name: 'Chile', flag: '🇨🇱', currency: 'CLP ($)' },
  { name: 'Jamaica', flag: '🇯🇲', currency: 'JMD ($)' },
  { name: 'Trinidad & Tobago', flag: '🇹🇹', currency: 'TTD ($)' },
  { name: 'China', flag: '🇨🇳', currency: 'CNY (¥)' },
  { name: 'Japan', flag: '🇯🇵', currency: 'JPY (¥)' },
  { name: 'South Korea', flag: '🇰🇷', currency: 'KRW (₩)' },
  { name: 'Indonesia', flag: '🇮🇩', currency: 'IDR (Rp)' },
  { name: 'Vietnam', flag: '🇻🇳', currency: 'VND (₫)' },
  { name: 'Thailand', flag: '🇹🇭', currency: 'THB (฿)' },
  { name: 'Egypt', flag: '🇪🇬', currency: 'EGP (E£)' },
  { name: 'Morocco', flag: '🇲🇦', currency: 'MAD (MAD)' },
  { name: 'Ethiopia', flag: '🇪🇹', currency: 'ETB (Br)' },
  { name: 'Tanzania', flag: '🇹🇿', currency: 'TZS (TSh)' },
  { name: 'Uganda', flag: '🇺🇬', currency: 'UGX (USh)' },
  { name: 'Zimbabwe', flag: '🇿🇼', currency: 'USD ($)' },
  { name: 'Zambia', flag: '🇿🇲', currency: 'ZMW (ZK)' },
  { name: 'Other', flag: '🌍', currency: '' },
];

export const BusinessProfileCard = ({
  activeTab, activeProfile, isEditingProfile, setIsEditingProfile,
  isCreatingProfile, setIsCreatingProfile, profileForm, setProfileForm,
  onSave, onDelete, profileCount
}) => (
  <div className={`bg-card rounded-xl border p-5 card-shadow ${activeTab === 'profile' ? 'block' : 'hidden lg:block'}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold font-['Outfit'] flex items-center gap-2">
        <User className="w-4 h-4 text-primary" />
        Business Profile
      </h3>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => {
          if (isEditingProfile) {
            setIsCreatingProfile(false);
          }
          setIsEditingProfile(!isEditingProfile);
        }}
        data-testid="edit-profile-btn"
      >
        {isEditingProfile ? 'Cancel' : 'Edit'}
      </Button>
    </div>

    {isEditingProfile ? (
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Business Name</label>
          <Input
            value={profileForm.business_name}
            onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })}
            placeholder="e.g., Quick Movers"
            data-testid="business-name-input"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Business Info</label>
          <Textarea
            value={profileForm.business_info}
            onChange={(e) => setProfileForm({ ...profileForm, business_info: e.target.value })}
            placeholder="e.g., Man and van service, prices from £75 minimum, same-day available"
            rows={3}
            data-testid="business-info-input"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Contact Info</label>
          <Input
            value={profileForm.contact_info}
            onChange={(e) => setProfileForm({ ...profileForm, contact_info: e.target.value })}
            placeholder="📞 07444 570404"
            data-testid="contact-info-input"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Response Signature</label>
          <Textarea
            value={profileForm.response_signature}
            onChange={(e) => setProfileForm({ ...profileForm, response_signature: e.target.value })}
            placeholder="📞 Call / WhatsApp: 07444 570404&#10;🌐 yourwebsite.com"
            rows={2}
            data-testid="signature-input"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Country</label>
          <select
            value={profileForm.country}
            onChange={(e) => {
              const selected = COUNTRIES.find(c => c.name === e.target.value);
              setProfileForm({
                ...profileForm,
                country: e.target.value,
                currency: selected?.currency || profileForm.currency
              });
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="country-select"
          >
            <option value="">Select country…</option>
            {COUNTRIES.map(c => (
              <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Currency</label>
          <Input
            value={profileForm.currency}
            onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
            placeholder="e.g. GBP (£)"
            data-testid="currency-input"
          />
          <p className="text-xs text-muted-foreground mt-1">Auto-filled from country. You can edit manually.</p>
        </div>
          onClick={onSave}
          className="w-full bg-primary hover:bg-primary/90 rounded-lg"
          data-testid="save-profile-btn"
        >
          {isCreatingProfile ? 'Create Profile' : 'Save Profile'}
        </Button>
        {activeProfile && !isCreatingProfile && profileCount > 1 && (
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => onDelete(activeProfile.profile_id)}
            data-testid="delete-profile-btn"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Profile
          </Button>
        )}
      </div>
    ) : (
      <div className="space-y-3">
        {activeProfile ? (
          <>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Name</p>
              <p className="text-sm font-medium">{activeProfile.business_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Info</p>
              <p className="text-sm text-muted-foreground line-clamp-3">{activeProfile.business_info}</p>
            </div>
            {activeProfile.contact_info && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
                <p className="text-sm">{activeProfile.contact_info}</p>
              </div>
            )}
            {activeProfile.country && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Country</p>
                <p className="text-sm">
                  {(COUNTRIES.find(c => c.name === activeProfile.country)?.flag || '🌍')} {activeProfile.country}
                </p>
              </div>
            )}
            {activeProfile.currency && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Currency</p>
                <p className="text-sm">{activeProfile.currency}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No profile set. Click Edit to add your business details.
          </p>
        )}
      </div>
    )}
  </div>
);
