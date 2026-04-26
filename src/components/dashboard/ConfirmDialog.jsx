import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Loader2 } from 'lucide-react';

export const ConfirmDialog = ({ confirmDialog, setConfirmDialog }) => (
  <Dialog open={confirmDialog.open} onOpenChange={(open) => !confirmDialog.isLoading && setConfirmDialog({ ...confirmDialog, open })}>
    <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground py-4">{confirmDialog.message}</p>
      <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button 
          variant="outline"
          onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
          disabled={confirmDialog.isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          variant="destructive"
          onClick={confirmDialog.onConfirm}
          disabled={confirmDialog.isLoading}
          className="w-full sm:w-auto"
        >
          {confirmDialog.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
