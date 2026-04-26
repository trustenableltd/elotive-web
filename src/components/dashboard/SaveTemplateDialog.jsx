import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

export const SaveTemplateDialog = ({ 
  open, onOpenChange, templateName, setTemplateName, 
  templateCategory, setTemplateCategory,
  templateMode, setTemplateMode,
  threadInstructions, setThreadInstructions,
  onSave 
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Save as Template</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Template Name</label>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., Inbound customer enquiries"
            data-testid="template-name-input"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Category</label>
          <select
            value={templateCategory}
            onChange={(e) => setTemplateCategory(e.target.value)}
            className="w-full p-2 rounded-lg border bg-background"
            data-testid="template-category-select"
          >
            <option value="general">General</option>
            <option value="pricing">Pricing / Quotes</option>
            <option value="support">Support</option>
            <option value="booking">Booking</option>
            <option value="intro">Introductions</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Template Mode</label>
          <select
            value={templateMode}
            onChange={(e) => setTemplateMode(e.target.value)}
            className="w-full p-2 rounded-lg border bg-background"
            data-testid="template-mode-select"
          >
            <option value="exact">Exact (reuse response as-is)</option>
            <option value="pattern">Pattern (same structure, rewrite to fit message)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Thread Instructions <span className="text-muted-foreground font-normal">(optional)</span></label>
          <p className="text-xs text-muted-foreground mb-2">
            Describe what this thread handles and how the AI should reply. When you apply this template to a conversation thread, the AI will follow these instructions on every Generate — without you having to repeat context.
          </p>
          <textarea
            value={threadInstructions}
            onChange={(e) => setThreadInstructions(e.target.value)}
            placeholder={"e.g., This thread handles inbound customer enquiries for this business. Greet customers by their first name, acknowledge the specific request they shared, provide a realistic estimate or clear next step, mention availability or timeline, and close with a booking call to action."}
            className="w-full p-2 rounded-lg border bg-background text-sm resize-none"
            rows={5}
            data-testid="template-thread-instructions"
          />
        </div>
      </div>
      <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
        <Button onClick={onSave} data-testid="confirm-save-template-btn" className="w-full sm:w-auto">Save Template</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
