import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Lightbulb, Check, Loader2, FileText, Zap } from 'lucide-react';

export const CoachingDialog = ({ open, onOpenChange, coaching, isLoading }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          AI Coaching Suggestions
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Analyzing your responses...</span>
          </div>
        ) : coaching ? (
          <>
            {coaching.total_low_rated === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Great Job!</h3>
                <p className="text-muted-foreground">{coaching.summary}</p>
              </div>
            ) : (
              <>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-sm">
                    Analyzed <strong>{coaching.analyzed_count}</strong> low-rated responses out of <strong>{coaching.total_low_rated}</strong> total.
                  </p>
                </div>

                {coaching.suggestions?.patterns && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Common Issues Found
                    </h4>
                    <ul className="space-y-2">
                      {coaching.suggestions.patterns.map((pattern, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-amber-500">•</span>
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {coaching.suggestions?.quick_wins && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Quick Wins
                    </h4>
                    <ul className="space-y-2">
                      {coaching.suggestions.quick_wins.map((win, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm bg-primary/5 p-3 rounded-lg">
                          <span className="text-primary font-bold">{i + 1}.</span>
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {coaching.suggestions?.business_info_suggestions && (
                  <div>
                    <h4 className="font-medium mb-2">Suggested Profile Updates</h4>
                    <ul className="space-y-2">
                      {coaching.suggestions.business_info_suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          → {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {coaching.suggestions?.example_improved_response && (
                  <div>
                    <h4 className="font-medium mb-2">Example Improved Response</h4>
                    <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-wrap">
                      {coaching.suggestions.example_improved_response}
                    </div>
                  </div>
                )}

                {coaching.suggestions?.raw_analysis && (
                  <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {coaching.suggestions.raw_analysis}
                  </div>
                )}
              </>
            )}
          </>
        ) : null}
      </div>
    </DialogContent>
  </Dialog>
);
