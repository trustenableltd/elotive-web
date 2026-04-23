import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { User, Trash2 } from 'lucide-react';

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
        <Button 
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
