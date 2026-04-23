import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { TemplateSuggestions } from '../TemplateManager';
import { MessageSquare, Bookmark, Loader2, Send } from 'lucide-react';

export const CustomerMessageInput = ({
  customerMessage, setCustomerMessage, customerName, setCustomerName,
  tone, setTone, tones, showTemplates, setShowTemplates,
  isGenerating, onGenerate, onApplyTemplate
}) => (
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
        placeholder="Customer name (e.g., Sophie, Laurent)"
        className="max-w-xs"
        data-testid="customer-name-input"
      />
    </div>
    
    <Textarea
      value={customerMessage}
      onChange={(e) => setCustomerMessage(e.target.value)}
      placeholder="Paste the customer's inquiry here...&#10;&#10;e.g., I need a van to move a 2-bed flat from SW16 to KT17 on 4th March"
      className="min-h-[150px] resize-none message-input border-muted"
      data-testid="customer-message-input"
    />

    {/* Template Suggestions */}
    <TemplateSuggestions customerMessage={customerMessage} onApply={onApplyTemplate} />

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
