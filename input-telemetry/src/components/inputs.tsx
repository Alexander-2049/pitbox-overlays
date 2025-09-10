import React from "react";
import InputBars, { InputBarsProps } from "./input-bars";
import { InputTraces, InputTraceProps } from "./input-traces";
import AbsIndicator from "./abs-indicator";

type Orientation = "vertical" | "horizontal";

export interface InputsProps {
  input?: InputBarsProps["input"] & { isAbsActive?: boolean };
  barsOrder?: InputBarsProps["barsOrder"];
  barColors?: InputBarsProps["colors"];
  traceSettings?: InputTraceProps["settings"];
  traceColors?: InputTraceProps["colors"];
  traceHistorySeconds?: InputTraceProps["historySeconds"];
  orientation?: Orientation;
  elementsOrder?: Array<"traces" | "abs" | "bars">;
  visible?: {
    tracesVisibile?: boolean;
    barsVisible?: boolean;
    absVisible?: boolean;
  };
  style?: React.CSSProperties;
}

const Inputs: React.FC<InputsProps> = ({
  input,
  barsOrder = ["throttle.bar", "brake.bar", "clutch.bar"],
  barColors,
  traceSettings,
  traceColors,
  traceHistorySeconds,
  orientation = "horizontal",
  elementsOrder = ["traces", "bars", "abs"],
  style,
  visible = {
    absVisible: false,
    barsVisible: true,
    tracesVisibile: true,
  },
}) => {
  const isVertical = orientation === "vertical";

  const bars = (
    <div
      style={{
        flex: 1,
        width: isVertical ? "100%" : undefined,
        height: isVertical ? undefined : "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
      }}
    >
      <InputBars input={input} barsOrder={barsOrder} colors={barColors} />
    </div>
  );

  const traces = (
    <div
      style={{
        width: isVertical ? "100%" : undefined,
        height: isVertical ? undefined : "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
      }}
    >
      <InputTraces
        input={input}
        settings={traceSettings}
        colors={traceColors}
        historySeconds={traceHistorySeconds}
      />
    </div>
  );

  const abs = (
    <AbsIndicator
      color={barColors?.brakeAbs || "#facc15"}
      isActive={!!input?.isAbsActive}
    />
  );

  const elementsMap: Record<"traces" | "abs" | "bars", React.ReactNode> = {
    traces,
    abs,
    bars,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        width: "100%",
        height: "100%",
        gap: "8px",
        background: "rgba(0,0,0,0.9)",
        ...style,
      }}
    >
      {elementsOrder
        .filter((element) => {
          if (element === "abs") {
            return visible.absVisible;
          }
          if (element === "bars") {
            return visible.barsVisible;
          }
          if (element === "traces") {
            return visible.tracesVisibile;
          }
        })
        .map((key) => elementsMap[key])}
    </div>
  );
};

export default Inputs;
