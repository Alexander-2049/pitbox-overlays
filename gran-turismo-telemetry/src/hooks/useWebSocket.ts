import { useEffect, useState } from "react";

type WebSocketData = Record<string, unknown>;

const useWebSocket = (url: string, params: string[]) => {
  const [data, setData] = useState<WebSocketData>(
    Object.fromEntries(params.map((param) => [param, null])),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = `?q=${params.join(",")}`;
    const socket = new WebSocket(`${url}${queryParams}`);

    socket.onmessage = (event) => {
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
      } catch (err) {
        console.error(err);
        setError("Failed to parse WebSocket message");
      }
    };

    socket.onerror = () => {
      setError("WebSocket error occurred");
    };

    return () => {
      socket.close();
    };
  }, [url, params]); // Use serializedParams here

  return { data, error };
};

export default useWebSocket;
