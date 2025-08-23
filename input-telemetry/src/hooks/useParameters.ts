import { useMemo } from "react";

type BarType = "throttle" | "brake" | "clutch";
type Orientation = "horizontal" | "vertical";
type ElementType = "traces" | "abs" | "bars";

interface Parameters {
  barsOrder: BarType[];
  barColors: {
    throttle: string;
    brake: string;
    clutch: string;
    brakeAbs: string;
  };
  traceSettings: {
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
  orientation: Orientation;
  elementsOrder: ElementType[];
}

const allowedBars: BarType[] = ["throttle", "brake", "clutch"];
const allowedElements: ElementType[] = ["traces", "abs", "bars"];

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
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

function parseOrientation(
  value: string | null,
  defaultValue: Orientation
): Orientation {
  return value === "horizontal" || value === "vertical" ? value : defaultValue;
}

function parseArray<T extends string>(
  value: string | null,
  allowed: readonly T[],
  defaultValue: T[]
): T[] {
  if (!value) return defaultValue;
  const arr = value.split(",").map((s) => s.trim()) as T[];
  const filtered = arr.filter((v): v is T => allowed.includes(v));
  return filtered.length > 0 ? filtered : defaultValue;
}

export function useParameters(): Parameters {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    return {
      barsOrder: parseArray(params.get("barsOrder"), allowedBars, [
        "throttle",
        "brake",
        "clutch",
      ]),
      barColors: {
        throttle: parseHexColor(params.get("barColors.throttle"), "#22c55e"),
        brake: parseHexColor(params.get("barColors.brake"), "#ef4444"),
        clutch: parseHexColor(params.get("barColors.clutch"), "#38bdf8"),
        brakeAbs: parseHexColor(params.get("barColors.brakeAbs"), "#fefefe"),
      },
      traceSettings: {
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
      orientation: parseOrientation(params.get("orientation"), "horizontal"),
      elementsOrder: parseArray(params.get("elementsOrder"), allowedElements, [
        "traces",
        "bars",
      ]),
    };
  }, []);
}
