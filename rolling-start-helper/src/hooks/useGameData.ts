import { useEffect, useMemo, useRef, useState } from "react";

// --- Types ---
type DriversData = {
  lapDistPct: number;
  currentLap: number;
  isCarOnTrack: boolean;
};

type SessionData = {
  currentSessionType: string;
  trackLengthMeters: number;
};

export type GameData = {
  drivers: DriversData[];
  session: SessionData;
};

// --- Validator ---
// Ожидает объект вида { "realtime.throttle": number, ... }
function validateGameData(raw: Record<string, unknown>): GameData | null {
  try {
    // --- session ---
    const currentSessionType = raw["session.currentSessionType"];
    const trackLengthMeters = raw["session.trackLengthMeters"];

    if (
      typeof currentSessionType !== "string" ||
      typeof trackLengthMeters !== "number"
    ) {
      return null;
    }

    // --- drivers arrays ---
    const lapDistPct = raw["drivers[].lapDistPct"];
    const currentLap = raw["drivers[].currentLap"];
    const isCarOnTrack = raw["drivers[].isCarOnTrack"];

    if (
      !Array.isArray(lapDistPct) ||
      !Array.isArray(currentLap) ||
      !Array.isArray(isCarOnTrack)
    ) {
      return null;
    }

    const length = Math.min(
      lapDistPct.length,
      currentLap.length,
      isCarOnTrack.length
    );

    const drivers: DriversData[] = [];

    for (let i = 0; i < length; i++) {
      const ld = lapDistPct[i];
      const cl = currentLap[i];
      const ot = isCarOnTrack[i];

      // server uses -1 as "invalid"
      if (
        typeof ld !== "number" ||
        typeof cl !== "number" ||
        typeof ot !== "boolean" ||
        ld < 0 ||
        cl < 0
      ) {
        continue;
      }

      drivers.push({
        lapDistPct: ld,
        currentLap: cl,
        isCarOnTrack: ot,
      });
    }

    if (drivers.length === 0) {
      return null;
    }

    return {
      drivers,
      session: {
        currentSessionType,
        trackLengthMeters,
      },
    };
  } catch (err) {
    console.error("validateGameData exception:", err);
    return null;
  }
}

// --- Hook ---
const useGameData = () => {
  const url = "ws://localhost:42049";

  const params = useMemo(
    () => [
      "drivers[].lapDistPct",
      "drivers[].currentLap",
      "drivers[].isCarOnTrack",
      "session.currentSessionType",
      "session.trackLengthMeters",
    ],
    []
  );

  const [data, setData] = useState<GameData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // накопитель всех полученных полей (не в state чтобы не ререндерить лишний раз)
  const accumulatedRef = useRef<Record<string, unknown>>({});

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isUnmounted = false;

    const connect = () => {
      const isPreview = /\bpreview(\b|=true)/.test(window.location.search);
      const queryParams = `?preview=${isPreview ? "true" : "false"}&q=${params.join(
        ","
      )}`;
      const ws = new WebSocket(`${url}${queryParams}`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.debug("WebSocket OPEN");
        if (!isUnmounted) setError(null);
      };

      ws.onmessage = (event) => {
        try {
          // raw message
          console.debug("WebSocket MESSAGE raw =", event.data);
          const message = JSON.parse(event.data);
          console.debug("Parsed message =", message);

          if (message.success && message.data != null) {
            // message.data может быть либо массивом пар [['k','v'], ...], либо объектом
            let incoming: Record<string, unknown> = {};

            if (Array.isArray(message.data)) {
              // массив пар -> объект
              // TS: Object.fromEntries может вернуть any, поэтому кастуем
              incoming = Object.fromEntries(
                message.data as [string, unknown][]
              );
            } else if (typeof message.data === "object") {
              incoming = message.data as Record<string, unknown>;
            }

            console.debug("Incoming normalized =", incoming);

            // мерджим в накопитель — сохраняем предыдущие поля
            accumulatedRef.current = {
              ...accumulatedRef.current,
              ...incoming,
            };

            console.debug(
              "Accumulated all keys =",
              Object.keys(accumulatedRef.current).length
            );
            console.debug("Accumulated object =", accumulatedRef.current);

            // валидируем уже объединённый объект
            const validated = validateGameData(accumulatedRef.current);

            if (validated) {
              console.debug("Validated OK -> updating data");
              setData(validated);
            } else {
              // если не готовы (нет всех обязательных полей) — держим null
              console.debug("Validated FAILED -> setting data to null");
              setData(null);
            }
          } else if (message.errorMessage) {
            console.warn("WebSocket errorMessage =", message.errorMessage);
            setError(message.errorMessage);
          } else {
            console.warn("WebSocket message ignored", message);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message", err);
          setError("Failed to parse WebSocket message");
        }
      };

      ws.onerror = (ev) => {
        console.error("WebSocket ERROR", ev);
        if (!isUnmounted) setError("WebSocket error occurred");
      };

      ws.onclose = () => {
        console.debug("WebSocket CLOSED, reconnecting soon...");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, params]);

  return { data, error };
};

export default useGameData;
