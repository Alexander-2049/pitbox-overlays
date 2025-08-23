import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const DEFAULT_COLORS = {
  throttle: "#22c55e", // green
  brake: "#ef4444", // red
  brakeAbs: "#facc15", // yellow
  clutch: "#38bdf8", // light blue
  steering: "#1e3a8a", // dark blue
};

export interface InputTraceProps {
  input?: {
    brake?: number;
    throttle?: number;
    clutch?: number;
    steeringAnglePct?: number;
    isAbsActive?: boolean;
  };
  settings?: {
    includeThrottle?: boolean;
    includeBrake?: boolean;
    includeClutch?: boolean;
    includeSteeringAngle?: boolean;
  };
  historySeconds?: number;
  colors?: Partial<typeof DEFAULT_COLORS>; // allow overrides
}

type TimedValue = { t: number; v: number };

function convertSteeringAngle(steeringAnglePct: number, minMaxPct: number) {
  // Map steeringAnglePct to [0, 1] range, centered at 0.5
  // minMaxPct is the maximum absolute value for full lock (e.g. 0.3)
  // 0 => 0.5, minMaxPct => 1, -minMaxPct => 0, linear in between
  if (minMaxPct === 0) return 0.5;
  const val = 0.5 + 0.5 * (steeringAnglePct / minMaxPct);
  return Math.max(0, Math.min(1, val));
}

export const InputTraces = ({
  input,
  settings,
  historySeconds = 7,
  colors = {},
}: InputTraceProps) => {
  const mergedColors = { ...DEFAULT_COLORS, ...colors };
  const {
    includeThrottle = true,
    includeBrake = true,
    includeClutch = false,
    includeSteeringAngle = false,
  } = settings || {};

  const svgRef = useRef<SVGSVGElement>(null);
  const { width, height } = { width: 400, height: 100 };

  const [throttleArray, setThrottleArray] = useState<TimedValue[]>([]);
  const [brakeArray, setBrakeArray] = useState<TimedValue[]>([]);
  const [clutchArray, setClutchArray] = useState<TimedValue[]>([]);
  const [steeringArray, setSteeringArray] = useState<TimedValue[]>([]);
  const [absArray, setAbsArray] = useState<TimedValue[]>([]);

  // latest values
  const lastInputRef = useRef({
    throttle: 0,
    brake: 0,
    clutch: 0,
    steeringAnglePct: 0.5,
    isAbsActive: false,
  });

  useEffect(() => {
    lastInputRef.current = {
      throttle: input?.throttle ?? lastInputRef.current.throttle,
      brake: input?.brake ?? lastInputRef.current.brake,
      clutch: input?.clutch ?? lastInputRef.current.clutch,
      steeringAnglePct:
        input?.steeringAnglePct ??
        convertSteeringAngle(lastInputRef.current.steeringAnglePct, 0.3),
      isAbsActive: input?.isAbsActive ?? lastInputRef.current.isAbsActive,
    };
  }, [input]);

  // update loop at 50 Hz
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() / 1000;

      if (includeThrottle) {
        setThrottleArray((arr) => {
          const updated = [
            ...arr,
            { t: now, v: lastInputRef.current.throttle },
          ];
          return updated.filter((p) => now - p.t <= historySeconds);
        });
      }
      if (includeBrake) {
        setBrakeArray((arr) => {
          const updated = [...arr, { t: now, v: lastInputRef.current.brake }];
          return updated.filter((p) => now - p.t <= historySeconds);
        });
        setAbsArray((arr) => {
          const updated = [
            ...arr,
            { t: now, v: lastInputRef.current.isAbsActive ? 1 : 0 },
          ];
          return updated.filter((p) => now - p.t <= historySeconds);
        });
      }
      if (includeClutch) {
        setClutchArray((arr) => {
          const updated = [...arr, { t: now, v: lastInputRef.current.clutch }];
          return updated.filter((p) => now - p.t <= historySeconds);
        });
      }
      if (includeSteeringAngle) {
        setSteeringArray((arr) => {
          const updated = [
            ...arr,
            {
              t: now,
              v: convertSteeringAngle(
                lastInputRef.current.steeringAnglePct,
                0.3
              ),
            },
          ];
          return updated.filter((p) => now - p.t <= historySeconds);
        });
      }
    }, 1000 / 50);

    return () => clearInterval(interval);
  }, [
    includeThrottle,
    includeBrake,
    includeClutch,
    includeSteeringAngle,
    historySeconds,
  ]);

  // draw graph on every data update
  useEffect(() => {
    const now = Date.now() / 1000;

    const traces: { values: TimedValue[]; color: string; type: string }[] = [];

    if (includeSteeringAngle)
      traces.push({
        values: steeringArray,
        color: mergedColors.steering,
        type: "steering",
      });
    if (includeClutch)
      traces.push({
        values: clutchArray,
        color: mergedColors.clutch,
        type: "clutch",
      });
    if (includeThrottle)
      traces.push({
        values: throttleArray,
        color: mergedColors.throttle,
        type: "throttle",
      });
    if (includeBrake)
      traces.push({
        values: brakeArray,
        color: mergedColors.brake,
        type: "brake",
      });

    drawGraph(
      svgRef.current,
      traces,
      absArray,
      mergedColors,
      width,
      height,
      now,
      historySeconds
    );
  }, [
    throttleArray,
    brakeArray,
    clutchArray,
    steeringArray,
    absArray,
    historySeconds,
    includeThrottle,
    includeBrake,
    includeClutch,
    includeSteeringAngle,
    colors,
  ]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    />
  );
};

// helper: pad values with a left-edge point
function padWithLeftEdgePoint(
  values: TimedValue[],
  now: number,
  historySeconds: number
): TimedValue[] {
  if (values.length === 0) return values;

  const first = values[0];
  const leftTime = now - historySeconds;

  if (first.t <= leftTime) return values;

  return [{ t: leftTime, v: first.v }, ...values];
}

function drawGraph(
  svgElement: SVGSVGElement | null,
  traces: { values: TimedValue[]; color: string; type: string }[],
  absArray: TimedValue[],
  colors: typeof DEFAULT_COLORS,
  width: number,
  height: number,
  now: number,
  historySeconds: number
) {
  if (!svgElement) return;

  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();

  const scaleMargin = 0.05;
  const xScale = d3
    .scaleLinear()
    .domain([now - historySeconds, now])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0 - scaleMargin, 1 + scaleMargin])
    .range([height, 0]);

  drawYAxis(svg, yScale, width);

  traces.forEach(({ values, color, type }) => {
    const paddedValues = padWithLeftEdgePoint(values, now, historySeconds);

    if (type === "brake" && absArray.length > 0) {
      const paddedAbs = padWithLeftEdgePoint(absArray, now, historySeconds);
      drawBrakeWithABS(svg, paddedValues, paddedAbs, xScale, yScale, colors);
    } else {
      drawLine(svg, paddedValues, xScale, yScale, color);
    }
  });
}

function drawYAxis(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  yScale: d3.ScaleLinear<number, number>,
  width: number
) {
  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(d3.range(0, 1.25, 0.25))
    .tickFormat(() => "");

  svg
    .append("g")
    .call(yAxis)
    .selectAll("line")
    .attr("x2", width)
    .attr("stroke", "#666")
    .attr("vector-effect", "non-scaling-stroke")
    .attr("stroke-dasharray", "2,2");

  svg.select(".domain").remove();
}

function drawLine(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  valueArray: TimedValue[],
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  color: string
) {
  const line = d3
    .line<TimedValue>()
    .x((d) => xScale(d.t))
    .y((d) => yScale(Math.max(0, Math.min(1, d.v))))
    .curve(d3.curveBasis);

  svg
    .append("path")
    .datum(valueArray)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .attr("vector-effect", "non-scaling-stroke")
    .attr("d", line);
}

// Special handling for brake + ABS
function drawBrakeWithABS(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  brakeValues: TimedValue[],
  absArray: TimedValue[],
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  colors: typeof DEFAULT_COLORS
) {
  if (brakeValues.length === 0) return;

  let currentSegment: TimedValue[] = [];
  let currentColor = colors.brake;

  const getAbsActive = (t: number) => {
    const closest = absArray.reduce(
      (prev, curr) =>
        Math.abs(curr.t - t) < Math.abs(prev.t - t) ? curr : prev,
      absArray[0]
    );
    return closest?.v > 0;
  };

  for (let i = 0; i < brakeValues.length; i++) {
    const point = brakeValues[i];
    const isActive = getAbsActive(point.t);
    const color = isActive ? colors.brakeAbs : colors.brake;

    if (color !== currentColor && currentSegment.length > 0) {
      currentSegment.push(point);
      drawLine(svg, currentSegment, xScale, yScale, currentColor);
      currentSegment = [point];
      currentColor = color;
    } else {
      currentColor = color;
      currentSegment.push(point);
    }
  }

  if (currentSegment.length > 0) {
    drawLine(svg, currentSegment, xScale, yScale, currentColor);
  }
}
