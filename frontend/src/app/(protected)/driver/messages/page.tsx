"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { MessageCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { communicationApi } from "@/lib/api";

export default function DriverMessagesPage() {
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["driver-conversations"],
    queryFn: async () => {
      const { data } = await communicationApi.listConversations();
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-xl font-bold text-tsl-forest">Messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Contact customers through TSL — phone numbers stay private.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : conversations.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No active trip chats. Approved assignments appear here.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/driver/messages/${c.id}`}
                className="flex min-h-[56px] items-center gap-3 rounded-xl border bg-white p-4 shadow-sm"
              >
                <MessageCircle className="h-6 w-6 shrink-0 text-tsl-teal" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-bold">{c.bookingNumber}</p>
                  <p className="truncate text-sm">{c.customerName}</p>
                  {c.lastMessageAt && (
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(c.lastMessageAt), "MMM d, HH:mm")}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
