"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { TripChatPanel } from "@/components/communication/TripChatPanel";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminCommunicationApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminMessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: async () => {
      const { data } = await adminCommunicationApi.listConversations();
      return data;
    },
  });

  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0];

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-bold text-tsl-forest">Trip communications</h1>
      <p className="mb-4 mt-2 text-sm text-muted-foreground">
        All driver–customer messages and calls are logged here. Personal WhatsApp numbers
        are never shown to drivers.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No trip conversations yet. Conversations open when bookings are approved.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="max-h-[70vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                    (selectedId ?? selected?.id) === c.id
                      ? "bg-tsl-teal/10 font-medium text-tsl-teal"
                      : "hover:bg-muted"
                  )}
                >
                  <p className="font-mono text-xs">{c.bookingNumber}</p>
                  <p className="truncate">
                    {c.customerName} ↔ {c.driverName}
                  </p>
                  {c.lastMessageAt && (
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(c.lastMessageAt), "MMM d, HH:mm")}
                    </p>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {selected && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4 text-sm">
                  <p>
                    <span className="text-muted-foreground">Booking:</span>{" "}
                    <span className="font-mono font-semibold">{selected.bookingNumber}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Customer:</span>{" "}
                    {selected.customerName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Driver:</span>{" "}
                    {selected.driverName}
                  </p>
                </CardContent>
              </Card>
              <TripChatPanel
                conversationId={selected.id}
                peerLabel={`${selected.customerName} & ${selected.driverName}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
