"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export function DeleteConfirmDialog({
  open,
  title,
  itemName,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  itemName?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {itemName ? (
              <>Are you sure you want to delete &ldquo;{itemName}&rdquo;? This cannot be undone.</>
            ) : (
              <>Are you sure? This cannot be undone.</>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <button className="px-4 py-2 rounded-md text-sm text-[#8b949e] hover:text-white border border-[#30363d] hover:border-[#8b949e] transition-colors">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
