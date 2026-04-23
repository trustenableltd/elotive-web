import { Button } from '../ui/button';
import { TemplateRating, TemplateVariants, TemplateSharing } from '../TemplateManager';
import { Bookmark, X, Trash2 } from 'lucide-react';

export const TemplatesPanel = ({
  show, templates, onClose, onApply, onDelete,
  setTemplates, setAiResponse, setShowTemplates
}) => {
  if (!show) return null;

  return (
    <div className="bg-card rounded-xl border p-6 card-shadow animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold font-['Outfit'] flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          Saved Templates
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No templates saved yet. Generate a response and save it as a template.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((tmpl) => (
            <div
              key={tmpl.template_id}
              className="template-card p-4 rounded-lg border bg-muted/30 group flex flex-col"
              data-testid={`template-${tmpl.template_id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 cursor-pointer" onClick={() => onApply(tmpl)}>
                  <span className="font-medium text-sm">{tmpl.name}</span>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tmpl.customer_message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(tmpl.template_id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  tmpl.tone === 'friendly' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' :
                  tmpl.tone === 'professional' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' :
                  'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                }`}>
                  {tmpl.tone}
                </span>
                <span className="text-xs text-muted-foreground">Used {tmpl.use_count}x</span>
                {tmpl.avg_rating > 0 && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    ★ {tmpl.avg_rating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Template enhancements */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex gap-2 flex-wrap">
                  <TemplateRating 
                    templateId={tmpl.template_id}
                    onRate={(rating) => {
                      const updatedTemplates = templates.map(t => 
                        t.template_id === tmpl.template_id 
                          ? { ...t, avg_rating: rating }
                          : t
                      );
                      setTemplates(updatedTemplates);
                    }}
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <TemplateVariants 
                    templateId={tmpl.template_id}
                    onSelectVariant={(variant) => {
                      setAiResponse(variant.response);
                      setShowTemplates(false);
                    }}
                  />
                  <TemplateSharing 
                    templateId={tmpl.template_id}
                    isTeamTemplate={tmpl.is_team_template}
                    onShare={() => {
                      const updatedTemplates = templates.map(t => 
                        t.template_id === tmpl.template_id 
                          ? { ...t, is_team_template: true }
                          : t
                      );
                      setTemplates(updatedTemplates);
                    }}
                  />
                </div>
              </div>

              <Button
                size="sm"
                className="mt-3 w-full text-xs"
                onClick={() => onApply(tmpl)}
              >
                Use Template
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
