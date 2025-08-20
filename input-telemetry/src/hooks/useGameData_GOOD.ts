import { useEffect, useMemo, useRef, useState } from "react";

// --- Types ---
type RealtimeData = {
  throttle: number;
  brake: number;
  steeringAnglePct: number;
  gear: number;
  speedKph: number;
  speedMph: number;
  displayUnits: string;
  absActive: boolean;
  test: number | null; // optional
};

export type GameData = {
  realtime: RealtimeData;
};

// --- Validator ---
// Ожидает объект вида { "realtime.throttle": number, ... }
function validateGameData(raw: Record<string, unknown>): GameData | null {
  try {
    // candidate с nullable значениями
    const candidate = {
      throttle:
        typeof raw["realtime.throttle"] === "number"
          ? raw["realtime.throttle"]
          : null,
      brake:
        typeof raw["realtime.brake"] === "number"
          ? raw["realtime.brake"]
          : null,
      steeringAnglePct:
        typeof raw["realtime.steeringAnglePct"] === "number"
          ? raw["realtime.steeringAnglePct"]
          : null,
      gear:
        typeof raw["realtime.gear"] === "number" ? raw["realtime.gear"] : null,
      speedKph:
        typeof raw["realtime.speedKph"] === "number"
          ? raw["realtime.speedKph"]
          : null,
      speedMph:
        typeof raw["realtime.speedMph"] === "number"
          ? raw["realtime.speedMph"]
          : null,
      displayUnits:
        typeof raw["realtime.displayUnits"] === "string"
          ? raw["realtime.displayUnits"]
          : null,
      absActive:
        typeof raw["realtime.absActive"] === "boolean"
          ? raw["realtime.absActive"]
          : null,
      // test — опциональное поле: если прислали и оно number — возьмём, иначе null
      test:
        typeof raw["realtime.test"] === "number" ? raw["realtime.test"] : null,
    };

    // если хоть одно обязательное поле (кроме test) отсутствует — отклоняем
    if (
      candidate.throttle === null ||
      candidate.brake === null ||
      candidate.steeringAnglePct === null ||
      candidate.gear === null ||
      candidate.speedKph === null ||
      candidate.speedMph === null ||
      candidate.displayUnits === null ||
      candidate.absActive === null
    ) {
      // не готовы — вернём null
      return null;
    }

    const realtime: RealtimeData = {
      throttle: candidate.throttle,
      brake: candidate.brake,
      steeringAnglePct: candidate.steeringAnglePct,
      gear: candidate.gear,
      speedKph: candidate.speedKph,
      speedMph: candidate.speedMph,
      displayUnits: candidate.displayUnits,
      absActive: candidate.absActive,
      test: candidate.test,
    };

    return { realtime };
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
      "realtime.throttle",
      "realtime.brake",
      "realtime.steeringAnglePct",
      "realtime.gear",
      "realtime.speedKph",
      "realtime.speedMph",
      "realtime.displayUnits",
      "realtime.absActive",
      "realtime.test",
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
