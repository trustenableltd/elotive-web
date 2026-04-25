import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { TemplateSuggestions } from '../TemplateManager';
import { MessageSquare, Bookmark, Loader2, Send } from 'lucide-react';

// Extract the first name from a Nextdoor / Facebook-style post header.
// Posts typically start with "Firstname Lastname\nNeighbourhood • time • ..."
function extractNameFromPost(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  const firstLine = lines[0];
  const secondLine = lines[1] || '';

  // Ignore likely message content lines; only attempt on short name-like headers.
  if (firstLine.length > 48 || /\b(need|looking|quote|price|help|hello|hi)\b/i.test(firstLine)) {
    return null;
  }

  // Require a social-post style signal on the next line to reduce false positives.
  const hasSocialSignal =
    /[•·]/.test(secondLine) ||
    /\b\d{1,2}\s*(m|min|h|hr|hrs|d|day|days)\b/i.test(secondLine) ||
    /\b(today|yesterday)\b/i.test(secondLine);

  if (!hasSocialSignal) return null;

  // Match name with 2-4 capitalized words (e.g. "Jakaria Sadeque", "Emma W").
  const fullNameMatch = firstLine.match(
    /^([A-Z][a-zA-Zéàèùâêîôûäëïöü'-]+)(?:\s+[A-Z][a-zA-Zéàèùâêîôûäëïöü'.-]*){1,3}$/
  );

  return fullNameMatch ? fullNameMatch[1] : null;
}

export const CustomerMessageInput = ({
  customerMessage, setCustomerMessage, customerName, setCustomerName,
  tone, setTone, tones, showTemplates, setShowTemplates,
  isGenerating, onGenerate, onApplyTemplate,
  suppressTemplateSuggestions = false,
  onUserMessageEdit,
  userInstruction, setUserInstruction
}) => {
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;
    // Auto-fill name only when the field is currently empty
    if (!customerName || customerName.trim() === '') {
      const detected = extractNameFromPost(pasted);
      if (detected) {
        setCustomerName(detected);
      }
    }
  };

  return (
  <div className="bg-card rounded-xl border p-6 card-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="font-semibold font-['Outfit']">Customer Message</h2>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowTemplates(!showTemplates)}
        data-testid="templates-btn"
      >
        <Bookmark className="w-4 h-4 mr-2" />
        Templates
      </Button>
    </div>

    {/* Customer Name Input */}
    <div className="mb-4">
      <Input
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Customer name — auto-filled when you paste an enquiry"
        className="max-w-xs"
        data-testid="customer-name-input"
      />
    </div>
    
    <Textarea
      value={customerMessage}
      onChange={(e) => {
        setCustomerMessage(e.target.value);
        onUserMessageEdit?.(e.target.value);
      }}
      onPaste={handlePaste}
      placeholder={"Paste the full customer enquiry here — name is detected automatically\n\ne.g., Jakaria Sadeque\nHi, I'm looking for a reliable service and would like a quote for this job."}
      className="min-h-[150px] resize-none message-input border-muted"
      data-testid="customer-message-input"
    />

    {/* Coach the AI — optional instruction from the business owner */}
    <div className="mt-3">
      <Input
        value={userInstruction || ''}
        onChange={(e) => setUserInstruction?.(e.target.value)}
        placeholder="Coach the AI (optional) — e.g., ask for postcode and stairs, be more urgent, mention availability today"
        className="text-sm"
        data-testid="user-instruction-input"
      />
    </div>

    {/* Template Suggestions */}
    <TemplateSuggestions
      customerMessage={customerMessage}
      onApply={onApplyTemplate}
      suppress={suppressTemplateSuggestions}
    />

    {/* Tone Selector */}
    <div className="mt-4">
      <p className="text-sm text-muted-foreground mb-3">Response tone:</p>
      <div className="flex gap-2 flex-wrap">
        {tones.map((t) => (
          <button
            key={t.id}
            onClick={() => setTone(t.id)}
            data-testid={`tone-selector-${t.id}`}
            className={`tone-btn px-4 py-2 rounded-lg text-sm font-medium border ${
              tone === t.id 
                ? `active-${t.id}` 
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>

    {/* Generate Button */}
    <Button
      onClick={onGenerate}
      disabled={isGenerating || !customerMessage.trim()}
      data-testid="generate-btn"
      className="mt-6 w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-lg px-8 py-5 text-base font-medium btn-press"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Send className="w-4 h-4 mr-2" />
          Generate Response
        </>
      )}
    </Button>
  </div>
);
};
