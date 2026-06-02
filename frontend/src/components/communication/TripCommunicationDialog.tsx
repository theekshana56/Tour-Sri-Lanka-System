"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TripChatPanel } from "@/components/communication/TripChatPanel";
import { SecureVoiceCall } from "@/components/communication/SecureVoiceCall";

interface TripCommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  bookingNumber: string;
  peerLabel: string;
}

export function TripCommunicationDialog({
  open,
  onOpenChange,
  conversationId,
  bookingNumber,
  peerLabel,
}: TripCommunicationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">{bookingNumber}</DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>
        <div className="space-y-4 px-4 pb-4">
          <SecureVoiceCall conversationId={conversationId} peerLabel={peerLabel} />
          <TripChatPanel conversationId={conversationId} peerLabel={peerLabel} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
