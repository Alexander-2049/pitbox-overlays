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
  colors?: InputTraceProps["colors"];
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
  colors,
  traceHistorySeconds,
  style,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: colors?.background,
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
