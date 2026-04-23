import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

export const SaveTemplateDialog = ({ 
  open, onOpenChange, templateName, setTemplateName, 
  templateCategory, setTemplateCategory, onSave 
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save as Template</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Template Name</label>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., Moving Quote - 2 Bed"
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
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={onSave} data-testid="confirm-save-template-btn">Save Template</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
