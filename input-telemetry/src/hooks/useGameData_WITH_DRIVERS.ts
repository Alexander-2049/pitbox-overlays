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

type DriverData = {
  carId: number;
  firstName: string;
  position: number;
};

export type GameData = {
  realtime: RealtimeData;
  drivers: DriverData[];
};

// --- Validator ---
function validateGameData(raw: Record<string, unknown>): GameData | null {
  try {
    // --- Validate realtime ---
    const candidateRealtime = {
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
      test:
        typeof raw["realtime.test"] === "number" ? raw["realtime.test"] : null,
    };

    // If any required realtime field is null, reject
    if (
      candidateRealtime.throttle === null ||
      candidateRealtime.brake === null ||
      candidateRealtime.steeringAnglePct === null ||
      candidateRealtime.gear === null ||
      candidateRealtime.speedKph === null ||
      candidateRealtime.speedMph === null ||
      candidateRealtime.displayUnits === null ||
      candidateRealtime.absActive === null
    ) {
      return null;
    }

    const realtime: RealtimeData = {
      throttle: candidateRealtime.throttle as number,
      brake: candidateRealtime.brake as number,
      steeringAnglePct: candidateRealtime.steeringAnglePct as number,
      gear: candidateRealtime.gear as number,
      speedKph: candidateRealtime.speedKph as number,
      speedMph: candidateRealtime.speedMph as number,
      displayUnits: candidateRealtime.displayUnits as string,
      absActive: candidateRealtime.absActive as boolean,
      test: candidateRealtime.test, // test is allowed to be null
    };

    // --- Validate drivers ---
    const carIds = Array.isArray(raw["drivers[].carId"])
      ? (raw["drivers[].carId"] as unknown[])
      : [];
    const firstNames = Array.isArray(raw["drivers[].firstName"])
      ? (raw["drivers[].firstName"] as unknown[])
      : [];
    const positions = Array.isArray(raw["drivers[].position"])
      ? (raw["drivers[].position"] as unknown[])
      : [];

    // All drivers arrays must be same length
    if (
      carIds.length !== firstNames.length ||
      carIds.length !== positions.length
    ) {
      return null;
    }

    const drivers: DriverData[] = carIds.map((carId, idx) => {
      const firstName = firstNames[idx];
      const position = positions[idx];

      if (
        typeof carId !== "number" ||
        typeof firstName !== "string" ||
        typeof position !== "number"
      ) {
        throw new Error("Invalid driver data");
      }

      return {
        carId,
        firstName,
        position,
      };
    });

    return { realtime, drivers };
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
      "drivers[].carId",
      "drivers[].firstName",
      "drivers[].position",
    ],
    []
  );

  const [data, setData] = useState<GameData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          const message = JSON.parse(event.data);

          if (message.success && message.data != null) {
            let incoming: Record<string, unknown> = {};

            if (Array.isArray(message.data)) {
              incoming = Object.fromEntries(
                message.data as [string, unknown][]
              );
            } else if (typeof message.data === "object") {
              incoming = message.data as Record<string, unknown>;
            }

            accumulatedRef.current = { ...accumulatedRef.current, ...incoming };

            const validated = validateGameData(accumulatedRef.current);

            if (validated) {
              setData(validated);
            } else {
              setData(null);
            }
          } else if (message.errorMessage) {
            setError(message.errorMessage);
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
  }, [url, params]);

  return { data, error };
};

export default useGameData;
