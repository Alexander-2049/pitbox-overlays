import { useMemo } from "react";

interface Parameters {
  traceVisibility: {
    includeThrottle: boolean;
    includeBrake: boolean;
    includeClutch: boolean;
    includeSteeringAngle: boolean;
  };
  traceColors: {
    throttle: string;
    brake: string;
    clutch: string;
    brakeAbs: string;
    steering: string;
  };
  traceHistorySeconds: number;
}

function parseBoolean(value: string | null, defaultValue: boolean): boolean {
  if (value === null) return defaultValue;
  return value.toLowerCase() === "true";
}

function parseHexColor(value: string | null, defaultValue: string): string {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value || "")
    ? (value as string)
    : defaultValue;
}

function parseNumber(value: string | null, defaultValue: number): number {
  if (value === null) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

export function useParameters(): Parameters {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    return {
      traceVisibility: {
        includeThrottle: parseBoolean(
          params.get("traceSettings.includeThrottle"),
          true
        ),
        includeBrake: parseBoolean(
          params.get("traceSettings.includeBrake"),
          true
        ),
        includeClutch: parseBoolean(
          params.get("traceSettings.includeClutch"),
          false
        ),
        includeSteeringAngle: parseBoolean(
          params.get("traceSettings.includeSteeringAngle"),
          true
        ),
      },
      traceColors: {
        throttle: parseHexColor(params.get("traceColors.throttle"), "#22c55e"),
        brake: parseHexColor(params.get("traceColors.brake"), "#ef4444"),
        clutch: parseHexColor(params.get("traceColors.clutch"), "#38bdf8"),
        brakeAbs: parseHexColor(params.get("traceColors.brakeAbs"), "#fefefe"),
        steering: parseHexColor(params.get("traceColors.steering"), "#1e3a8a"),
      },
      traceHistorySeconds: parseNumber(params.get("traceHistorySeconds"), 7),
    };
  }, []);
}
