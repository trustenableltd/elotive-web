import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Loader2 } from 'lucide-react';

export const ConfirmDialog = ({ confirmDialog, setConfirmDialog }) => (
  <Dialog open={confirmDialog.open} onOpenChange={(open) => !confirmDialog.isLoading && setConfirmDialog({ ...confirmDialog, open })}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground py-4">{confirmDialog.message}</p>
      <DialogFooter className="flex gap-3 justify-end">
        <Button 
          variant="outline"
          onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          disabled={confirmDialog.isLoading}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive"
          onClick={confirmDialog.onConfirm}
          disabled={confirmDialog.isLoading}
        >
          {confirmDialog.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
