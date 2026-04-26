import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { StarRating } from './StarRating';
import { Star, BarChart3, Loader2 } from 'lucide-react';

export const AnalyticsDialog = ({ open, onOpenChange, analytics }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Response Analytics
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        {analytics ? (
          <>
            <div className="analytics-stat p-4 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Overall Rating</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">
                  {analytics.overall.avg_rating?.toFixed(1) || '0.0'}
                </span>
                <StarRating rating={Math.round(analytics.overall.avg_rating || 0)} onRate={() => {}} readonly />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {analytics.overall.total_rated || 0} rated responses
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-3">By Tone</h4>
              <div className="space-y-3">
                {analytics.by_tone?.map((toneData) => (
                  <div key={toneData._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        toneData._id === 'friendly' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' :
                        toneData._id === 'professional' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' :
                        'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                      }`}>
                        {toneData._id}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {toneData.total_rated} responses
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="font-medium">{toneData.avg_rating?.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
);
