import React from "react";
import { InputTraces, InputTraceProps } from "./input-traces";

export interface InputsProps {
  input?: {
    brake?: number;
    throttle?: number;
    clutch?: number;
    steeringAnglePct?: number;
    isAbsActive?: boolean;
  };
  traceSettings?: InputTraceProps["settings"];
  traceColors?: InputTraceProps["colors"];
  traceHistorySeconds?: InputTraceProps["historySeconds"];
  visible?: {
    tracesVisibile?: boolean;
    barsVisible?: boolean;
    absVisible?: boolean;
  };
  style?: React.CSSProperties;
  barSettings?: {
    throttleBarVisible: boolean;
    brakeBarVisible: boolean;
    clutchBarVisible: boolean;
  };
}

const Inputs: React.FC<InputsProps> = ({
  input,
  traceSettings,
  traceColors,
  traceHistorySeconds,
  style,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.9)",
        ...style,
      }}
    >
      <InputTraces
        inputValues={input}
        settings={traceSettings}
        colors={traceColors}
        historySeconds={traceHistorySeconds}
      />
    </div>
  );
};

export default Inputs;
