import { useEffect, useRef, useState } from "react";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL?.trim() || "";
const API_URL =
  process.env.NEXT_PUBLIC_VISIT_API_URL?.trim() || "";
const shouldConnectVisitCounter = Boolean(SOCKET_URL && API_URL);

function PortfolioView() {
  const [visitCount, setVisitCount] = useState<number>(0);
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >(shouldConnectVisitCounter ? "connecting" : "disconnected");
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!shouldConnectVisitCounter) {
      setStatus("disconnected");
      return;
    }

    let shouldReconnect = true;

    const connect = () => {
      if (!shouldReconnect) return;

      setStatus("connecting");
      const socket = new WebSocket(SOCKET_URL);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "visit_count" && Number.isFinite(data.count)) {
            setVisitCount(data.count);
            setStatus("connected");
          }
        } catch (error) {
          console.error("Invalid message from socket:", error);
        }
      };

      socket.onerror = () => {
        setStatus("disconnected");
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        setStatus("disconnected");
        if (shouldReconnect) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };

      return socket;
    };

    connect();
    return () => {
      shouldReconnect = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!shouldConnectVisitCounter || !API_URL) {
      return;
    }

    fetch(`${API_URL}/api/visit`, { method: "POST" }).catch((error) =>
      console.error("Visit API error:", error),
    );
  }, []);

  if (!shouldConnectVisitCounter) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-4 z-50 flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/85 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 dark:text-slate-100 sm:left-6">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          status === "connected"
            ? "bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.18)]"
            : status === "connecting"
              ? "bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.16)]"
              : "bg-slate-400"
        }`}
      />
      <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
        Visits
      </span>
      {status === "connecting" && (
        <span
          className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"
          aria-label="connecting"
        />
      )}
      {status === "connected" && (
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {visitCount.toLocaleString()}
        </span>
      )}
      {status === "disconnected" && (
        <span className="text-slate-500">Offline</span>
      )}
    </div>
  );
}

export default PortfolioView;
