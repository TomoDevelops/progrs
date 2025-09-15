"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface CancelRestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CancelRestModal({
  open,
  onOpenChange,
  onConfirm,
}: CancelRestModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skip Rest Period?</DialogTitle>
          <DialogDescription>
            Are you sure you want to skip your rest period and continue with the workout?
            Taking proper rest between sets helps with performance and recovery.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continue Resting
          </Button>
          <Button onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
            Skip Rest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}