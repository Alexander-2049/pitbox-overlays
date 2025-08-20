import React from "react";
import InputBars, { InputBarsProps } from "./input-bars";
import { InputTraces, InputTraceProps } from "./input-traces";

type Orientation = "vertical" | "horizontal";

export interface InputsProps {
  input: InputBarsProps["input"];
  barsOrder?: InputBarsProps["barsOrder"];
  barColors?: InputBarsProps["colors"];
  traceSettings: InputTraceProps["settings"];
  traceColors?: InputTraceProps["colors"];
  traceHistorySeconds?: InputTraceProps["historySeconds"];
  orientation?: Orientation;
  tracesFirst?: boolean;
  style?: React.CSSProperties;
}

const Inputs: React.FC<InputsProps> = ({
  input,
  barsOrder,
  barColors,
  traceSettings,
  traceColors,
  traceHistorySeconds,
  orientation = "vertical",
  tracesFirst = true, // default
  style,
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
        flexGrow: "1",
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        width: isVertical ? "100%" : "100%",
        height: isVertical ? "100%" : "100%",
        gap: "8px",
        ...style,
      }}
    >
      {tracesFirst ? (
        <>
          {traces}
          {bars}
        </>
      ) : (
        <>
          {bars}
          {traces}
        </>
      )}
    </div>
  );
};

export default Inputs;
