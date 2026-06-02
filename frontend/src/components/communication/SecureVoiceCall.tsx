"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Phone, PhoneOff } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { communicationApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useAuthStore } from "@/store/authStore";
import type { TripCallSession } from "@/types";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com" }];

interface SecureVoiceCallProps {
  conversationId: string;
  peerLabel: string;
}

export function SecureVoiceCall({ conversationId, peerLabel }: SecureVoiceCallProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [call, setCall] = useState<TripCallSession | null>(null);
  const [statusLabel, setStatusLabel] = useState("Voice calls stay on TSL — numbers are hidden");
  const signalCursor = useRef<string | undefined>();

  const { data: activeCall } = useQuery({
    queryKey: ["active-call", conversationId],
    queryFn: async () => {
      try {
        const { data } = await communicationApi.getActiveCall(conversationId);
        return data;
      } catch {
        return null;
      }
    },
    refetchInterval: 2000,
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (activeCall && !call) {
      setCall(activeCall);
    }
  }, [activeCall, call]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    signalCursor.current = undefined;
  }, []);

  const ensurePeer = useCallback(async () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pc.ontrack = (ev) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = ev.streams[0];
      }
    };
    pc.onicecandidate = async (ev) => {
      if (ev.candidate && call?.id) {
        await communicationApi.postSignal(
          call.id,
          "ice-candidate",
          JSON.stringify(ev.candidate)
        );
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    pcRef.current = pc;
    return pc;
  }, [call?.id]);

  const processSignals = useCallback(
    async (callId: string) => {
      const { data: signals } = await communicationApi.getSignals(
        callId,
        signalCursor.current
      );
      const pc = pcRef.current;
      if (!pc) return;
      for (const sig of signals) {
        if (sig.fromUserId === userId) continue;
        signalCursor.current = sig.createdAt;
        if (sig.signalType === "offer") {
          await pc.setRemoteDescription(JSON.parse(sig.payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await communicationApi.postSignal(callId, "answer", JSON.stringify(answer));
        } else if (sig.signalType === "answer") {
          await pc.setRemoteDescription(JSON.parse(sig.payload));
        } else if (sig.signalType === "ice-candidate") {
          await pc.addIceCandidate(JSON.parse(sig.payload));
        }
      }
    },
    [userId]
  );

  useEffect(() => {
    if (!call?.id || call.status === "ENDED" || call.status === "DECLINED") return;
    const id = setInterval(() => processSignals(call.id), 1500);
    return () => clearInterval(id);
  }, [call?.id, call?.status, processSignals]);

  const startCall = useMutation({
    mutationFn: () => communicationApi.initiateCall(conversationId),
    onSuccess: async ({ data }) => {
      setCall(data);
      setStatusLabel("Calling…");
      try {
        const pc = await ensurePeer();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await communicationApi.postSignal(data.id, "offer", JSON.stringify(offer));
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Microphone access required"));
      }
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const acceptCall = useMutation({
    mutationFn: async () => {
      if (!call) return;
      await communicationApi.acceptCall(call.id);
      await ensurePeer();
      await processSignals(call.id);
      setStatusLabel("Connected");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const endCall = useMutation({
    mutationFn: async () => {
      if (call) await communicationApi.endCall(call.id);
    },
    onSettled: () => {
      cleanup();
      setCall(null);
      setStatusLabel("Call ended");
    },
  });

  const isIncoming =
    call?.status === "RINGING" && call.initiatorId !== userId;
  const inProgress =
    call?.status === "RINGING" || call?.status === "ACTIVE";

  return (
    <div className="rounded-lg border border-tsl-teal/20 bg-tsl-sand/20 p-4">
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      <p className="text-sm font-medium text-tsl-forest">Secure voice call</p>
      <p className="text-xs text-muted-foreground">{statusLabel}</p>
      <p className="mt-1 text-sm font-semibold">{peerLabel}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {!inProgress && (
          <Button
            type="button"
            className="min-h-[44px] flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={startCall.isPending}
            onClick={() => startCall.mutate()}
          >
            <Phone className="mr-2 h-4 w-4" />
            Start call
          </Button>
        )}
        {isIncoming && (
          <Button
            type="button"
            className="min-h-[44px] flex-1 bg-emerald-600"
            onClick={() => acceptCall.mutate()}
          >
            <Phone className="mr-2 h-4 w-4" />
            Answer
          </Button>
        )}
        {inProgress && (
          <Button
            type="button"
            variant="destructive"
            className="min-h-[44px] flex-1"
            onClick={() => endCall.mutate()}
          >
            <PhoneOff className="mr-2 h-4 w-4" />
            End call
          </Button>
        )}
      </div>
    </div>
  );
}
