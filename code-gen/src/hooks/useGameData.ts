/**
 * @generated
 * {
  "version": 1,
  "generatedAt": "2025-12-22T14:25:49.865Z",
  "fields": [
    {
      "name": "realtime.throttle",
      "type": "number",
      "optional": false
    },
    {
      "name": "realtime.brake",
      "type": "number",
      "optional": false
    },
    {
      "name": "realtime.gear",
      "type": "number",
      "optional": false
    },
    {
      "name": "realtime.lapTimes.lapBestLap",
      "type": "number",
      "optional": false
    },
    {
      "name": "realtime.lapTimes.lapBestLapTime",
      "type": "number",
      "optional": false
    },
    {
      "name": "realtime.steeringAnglePct",
      "type": "number",
      "optional": true
    }
  ]
}
 */

import { useEffect, useMemo, useRef, useState } from "react";

// --- Types ---

type RealtimeData = {
  throttle: number;
  brake: number;
  gear: number;
  lapTimes: {
    lapBestLap: number;
    lapBestLapTime: number;
  };
  steeringAnglePct: number | null;
};

export type GameData = {
  realtime: RealtimeData;
};

// --- Validator ---

function validateGameData(raw: Record<string, unknown>): GameData | null {
  try {
    // --- realtime ---

    const realtime_throttle =
      typeof raw["realtime.throttle"] === "number"
        ? raw["realtime.throttle"]
        : null;

    const realtime_brake =
      typeof raw["realtime.brake"] === "number" ? raw["realtime.brake"] : null;

    const realtime_gear =
      typeof raw["realtime.gear"] === "number" ? raw["realtime.gear"] : null;

    const realtime_lapTimes_lapBestLap =
      typeof raw["realtime.lapTimes.lapBestLap"] === "number"
        ? raw["realtime.lapTimes.lapBestLap"]
        : null;

    const realtime_lapTimes_lapBestLapTime =
      typeof raw["realtime.lapTimes.lapBestLapTime"] === "number"
        ? raw["realtime.lapTimes.lapBestLapTime"]
        : null;

    const realtime_steeringAnglePct =
      typeof raw["realtime.steeringAnglePct"] === "number"
        ? raw["realtime.steeringAnglePct"]
        : null;

    if (
      realtime_throttle === null ||
      realtime_brake === null ||
      realtime_gear === null ||
      realtime_lapTimes_lapBestLap === null ||
      realtime_lapTimes_lapBestLapTime === null
    )
      return null;

    const realtime: RealtimeData = {
      throttle: realtime_throttle,
      brake: realtime_brake,
      gear: realtime_gear,
      lapTimes: {
        lapBestLap: realtime_lapTimes_lapBestLap,
        lapBestLapTime: realtime_lapTimes_lapBestLapTime,
      },
      steeringAnglePct: realtime_steeringAnglePct,
    };

    return {
      realtime,
    };
  } catch {
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
      "realtime.gear",
      "realtime.lapTimes.lapBestLap",
      "realtime.lapTimes.lapBestLapTime",
      "realtime.steeringAnglePct",
    ],
    []
  );

  const isPreview = useMemo(() => {
    const p = new URLSearchParams(window.location.search).get("preview");
    return p === "" || p === "true";
  }, []);

  const [data, setData] = useState<GameData | null>(null);
  const accumulatedRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    const ws = new WebSocket(
      `${url}?preview=${isPreview ? "true" : "false"}&q=${params.join(",")}`
    );

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data) as {
        success: boolean;
        data?: [string, unknown][];
      };

      if (msg.success && msg.data) {
        accumulatedRef.current = {
          ...accumulatedRef.current,
          ...Object.fromEntries(msg.data),
        };
        setData(validateGameData(accumulatedRef.current));
      }
    };

    return () => ws.close();
  }, [params, isPreview]);

  return { data };
};

export default useGameData;
