import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Couple } from "@withu/shared-types";
import { useAuthStore } from "@/stores/auth-store";
import { connectSocket, disconnectSocket, type AppSocket } from "@/lib/socket";
import { coupleKey } from "@/features/couple/hooks";

type ConnectionState = "connected" | "connecting" | "disconnected";

interface SocketContextValue {
  socket: AppSocket | null;
  connectionState: ConnectionState;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connectionState: "disconnected" });

export function useAppSocket() {
  return useContext(SocketContext);
}

function updatePartner(couple: Couple, userId: string, updater: (p: Couple["partnerOne"]) => Couple["partnerOne"]): Couple {
  if (couple.partnerOne.id === userId) return { ...couple, partnerOne: updater(couple.partnerOne) };
  if (couple.partnerTwo?.id === userId) return { ...couple, partnerTwo: updater(couple.partnerTwo) };
  return couple;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const socketRef = useRef<AppSocket | null>(null);
  const [, forceRender] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      socketRef.current = null;
      setConnectionState("disconnected");
      return;
    }

    const socket = connectSocket(accessToken);
    socketRef.current = socket;
    forceRender((n) => n + 1);
    setConnectionState("connecting");

    const onConnect = () => setConnectionState("connected");
    const onDisconnect = () => setConnectionState("disconnected");
    const onReconnectAttempt = () => setConnectionState("connecting");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);

    socket.on("USER_ONLINE", ({ userId, presence }) => {
      queryClient.setQueryData<Couple | null>(coupleKey, (prev) =>
        !prev ? prev : updatePartner(prev, userId, (p) => ({ ...p, presence }))
      );
    });
    socket.on("USER_OFFLINE", ({ userId, lastSeen }) => {
      queryClient.setQueryData<Couple | null>(coupleKey, (prev) =>
        !prev ? prev : updatePartner(prev, userId, (p) => ({ ...p, presence: "offline", lastSeen }))
      );
    });
    socket.on("MOOD_CHANGED", ({ userId, mood, moodMessage }) => {
      queryClient.setQueryData<Couple | null>(coupleKey, (prev) =>
        !prev ? prev : updatePartner(prev, userId, (p) => ({ ...p, mood, moodMessage }))
      );
    });
    socket.on("STATUS_CHANGED", ({ userId, status }) => {
      queryClient.setQueryData<Couple | null>(coupleKey, (prev) => (!prev ? prev : updatePartner(prev, userId, (p) => ({ ...p, status }))));
    });
    socket.on("NOTIFICATION_RECEIVED", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.removeAllListeners("USER_ONLINE");
      socket.removeAllListeners("USER_OFFLINE");
      socket.removeAllListeners("MOOD_CHANGED");
      socket.removeAllListeners("STATUS_CHANGED");
      socket.removeAllListeners("NOTIFICATION_RECEIVED");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connectionState }}>{children}</SocketContext.Provider>
  );
}
