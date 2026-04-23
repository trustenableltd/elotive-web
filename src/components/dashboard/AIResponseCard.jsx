import { Button } from '../ui/button';
import { StarRating } from './StarRating';
import { Sparkles, Bookmark, Copy, Check } from 'lucide-react';

export const AIResponseCard = ({
  aiResponse, tone, currentRating, copied,
  onRate, onCopy, onSaveTemplate
}) => {
  if (!aiResponse) return null;

  return (
    <div className="bg-card rounded-xl border p-6 card-shadow response-card" data-testid="response-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold font-['Outfit']">AI Response</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveTemplate}
            data-testid="save-as-template-btn"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            data-testid="copy-response-btn"
            className="rounded-lg"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className={`p-5 rounded-xl border-2 ${
        tone === 'friendly' ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50' :
        tone === 'professional' ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50' :
        'bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50'
      }`}>
        <p className="text-base leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
      </div>

      {/* Rating Section */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Rate this response:</span>
          <StarRating rating={currentRating} onRate={onRate} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          GPT-5.2
          <span className={`px-2 py-1 rounded ${
            tone === 'friendly' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' :
            tone === 'professional' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' :
            'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
          }`}>
            {tone}
          </span>
        </div>
      </div>
    </div>
  );
};
