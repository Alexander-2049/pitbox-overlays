import { useEffect, useRef, useState } from "react";

/// <reference types="node" />

type WebSocketData = Record<string, unknown>;

const useWebSocket = (params: string[]) => {
  const url = "ws://localhost:49791";

  const [data, setData] = useState<WebSocketData>(
    Object.fromEntries(params.map((param) => [param, null]))
  );
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isUnmounted = false;

    const connect = () => {
      const isPreview = /\bpreview(\b|=true)/.test(window.location.search);
      const queryParams = `?preview=${isPreview ? "true" : "false"}&q=${params.join(",")}`;
      const ws = new WebSocket(`${url}${queryParams}`);
      socketRef.current = ws;

      ws.onopen = () => {
        if (!isUnmounted) setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (
            message.success &&
            typeof message.data === "object" &&
            message.data !== null
          ) {
            const updatedData: WebSocketData = {};
            message.data.forEach(([key, value]: [string, unknown]) => {
              if (params.includes(key)) {
                updatedData[key] = value;
              }
            });
            setData((prevData) => ({ ...prevData, ...updatedData }));
          } else if (message.errorMessage) {
            setError(message.errorMessage);
          }
        } catch {
          setError("Failed to parse WebSocket message");
        }
      };

      ws.onerror = () => {
        if (!isUnmounted) setError("WebSocket error occurred");
      };

      ws.onclose = () => {
        if (!isUnmounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketRef.current?.close();
    };
  }, [url, params]);

  return { data, error };
};

export default useWebSocket;
