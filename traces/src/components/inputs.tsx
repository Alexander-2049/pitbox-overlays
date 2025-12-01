import React from "react";
import { InputTraces, InputTraceProps } from "./input-traces";
import { opacityToHex } from "../utils/opacityToHex";

export interface InputsProps {
  input?: {
    brake?: number;
    throttle?: number;
    clutch?: number;
    steeringAnglePct?: number;
    isAbsActive?: boolean;
  };
  traceVisibility?: InputTraceProps["settings"];
  colors?: InputTraceProps["colors"];
  traceHistorySeconds?: InputTraceProps["historySeconds"];
  visible?: {
    tracesVisibile?: boolean;
    barsVisible?: boolean;
    absVisible?: boolean;
  };
  backgroundOpacity?: number;
  style?: React.CSSProperties;
}

const Inputs: React.FC<InputsProps> = ({
  input,
  traceVisibility: traceSettings,
  colors,
  traceHistorySeconds,
  backgroundOpacity,
  style,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor:
          (colors?.background || "#202c44") +
          (backgroundOpacity ? opacityToHex(backgroundOpacity) : "FF"),
        ...style,
      }}
    >
      <InputTraces
        inputValues={input}
        settings={traceSettings}
        colors={colors}
        historySeconds={traceHistorySeconds}
      />
    </div>
  );
};

export default Inputs;
