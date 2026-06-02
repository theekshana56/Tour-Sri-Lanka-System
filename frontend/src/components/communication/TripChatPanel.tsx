"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { communicationApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useAuthStore } from "@/store/authStore";
import type { TripMessage } from "@/types";
import { cn } from "@/lib/utils";

interface TripChatPanelProps {
  conversationId: string;
  peerLabel: string;
  className?: string;
}

export function TripChatPanel({
  conversationId,
  peerLabel,
  className,
}: TripChatPanelProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [lastPoll, setLastPoll] = useState<string | undefined>();
  const [allMessages, setAllMessages] = useState<TripMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllMessages([]);
    setLastPoll(undefined);
  }, [conversationId]);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["trip-messages", conversationId, lastPoll],
    queryFn: async () => {
      const { data } = await communicationApi.getMessages(conversationId, lastPoll);
      return data;
    },
    refetchInterval: 3000,
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!messages.length) return;
    setAllMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const merged = [...prev];
      for (const m of messages) {
        if (!ids.has(m.id)) merged.push(m);
      }
      merged.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return merged;
    });
    const latest = messages[messages.length - 1];
    if (latest) setLastPoll(latest.createdAt);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const sendMutation = useMutation({
    mutationFn: (body: string) => communicationApi.sendMessage(conversationId, body),
    onSuccess: ({ data }) => {
      setDraft("");
      setAllMessages((prev) => [...prev, data]);
      queryClient.invalidateQueries({ queryKey: ["trip-messages", conversationId] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sendMutation.isPending) return;
    sendMutation.mutate(text);
  };

  return (
    <div className={cn("flex flex-col rounded-lg border bg-white", className)}>
      <div className="border-b px-4 py-3">
        <p className="text-sm font-medium text-muted-foreground">Secure TSL chat</p>
        <p className="font-semibold text-foreground">{peerLabel}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Monitored by TSL · Do not share personal phone numbers
        </p>
      </div>

      <div className="flex max-h-[320px] min-h-[200px] flex-1 flex-col gap-2 overflow-y-auto p-4">
        {isLoading && allMessages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          allMessages.map((m) => {
            const mine = m.senderId === userId;
            const system = m.type === "SYSTEM";
            return (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  system
                    ? "mx-auto max-w-full bg-slate-100 text-center text-xs text-muted-foreground"
                    : mine
                      ? "ml-auto bg-tsl-teal text-white"
                      : "mr-auto bg-slate-100 text-foreground"
                )}
              >
                {!system && !mine && (
                  <p className="mb-0.5 text-xs font-medium opacity-70">
                    {m.senderDisplayName}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                {!system && (
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-white/70" : "text-muted-foreground"
                    )}
                  >
                    {format(parseISO(m.createdAt), "HH:mm")}
                  </p>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          maxLength={2000}
          className="min-h-[44px] flex-1"
        />
        <Button
          type="submit"
          disabled={!draft.trim() || sendMutation.isPending}
          className="min-h-[44px] min-w-[44px] shrink-0 bg-tsl-teal hover:bg-tsl-teal/90"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
