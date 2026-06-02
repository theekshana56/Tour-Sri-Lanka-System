"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { TripChatPanel } from "@/components/communication/TripChatPanel";
import { SecureVoiceCall } from "@/components/communication/SecureVoiceCall";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { communicationApi } from "@/lib/api";

interface DriverConversationPageProps {
  params: { conversationId: string };
}

export default function DriverConversationPage({
  params,
}: DriverConversationPageProps) {
  const conversationId = decodeURIComponent(params.conversationId);

  const { data: conversation, isLoading, isError } = useQuery({
    queryKey: ["driver-conversation", conversationId],
    queryFn: async () => {
      const { data } = await communicationApi.getConversation(conversationId);
      return data;
    },
    enabled: !!conversationId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !conversation) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Conversation not found.</p>
        <Link
          href="/driver/messages"
          className="inline-flex min-h-[44px] items-center text-tsl-teal font-semibold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to messages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/driver/messages"
        className="inline-flex min-h-[44px] items-center text-sm font-semibold text-tsl-teal"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        All messages
      </Link>

      <div>
        <p className="font-mono text-sm font-bold text-tsl-forest">
          {conversation.bookingNumber}
        </p>
        <h1 className="text-xl font-bold">{conversation.customerName}</h1>
        <p className="text-sm text-muted-foreground">
          Secure TSL chat — customer phone number is hidden
        </p>
      </div>

      <SecureVoiceCall
        conversationId={conversation.id}
        peerLabel={conversation.customerName}
      />
      <TripChatPanel
        conversationId={conversation.id}
        peerLabel={conversation.customerName}
      />
    </div>
  );
}
