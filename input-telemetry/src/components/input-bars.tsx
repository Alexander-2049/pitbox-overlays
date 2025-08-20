import { useEffect, useState } from "react";
import AbsLightIcon from "../assets/abs-light-icon";

const DEFAULT_COLORS = {
  throttle: "#22c55e", // green
  brake: "#ef4444", // red
  brakeAbs: "#facc15", // yellow
  clutch: "#38bdf8", // light blue
  steering: "#1e3a8a", // dark blue
};

export interface InputBarsProps {
  input?: {
    brake?: number;
    throttle?: number;
    clutch?: number;
    steeringAnglePct?: number;
    isAbsActive?: boolean;
  };
  barsOrder?: Array<"throttle" | "brake" | "clutch" | "abs">;
  colors?: Partial<typeof DEFAULT_COLORS>;
}

interface InputBarProps {
  value: number;
  color: string;
}

const InputBar = ({ value, color }: InputBarProps) => {
  const pct = Math.round(value * 100);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "20px",
        height: "100%",
      }}
    >
      {/* Top label */}
      <div
        style={{
          width: "32px",
          height: "20px",
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "20px",
          marginBottom: "2px",
          userSelect: "none",
        }}
      >
        {pct}
      </div>

      {/* Bar container that takes up remaining space */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: color,
            width: "16px",
            height: `${pct}%`,
            borderRadius: "4px",
          }}
        />
      </div>
    </div>
  );
};

const InputBars = ({
  input,
  barsOrder = ["clutch", "throttle", "brake", "abs"],
  colors = {},
}: InputBarsProps) => {
  const mergedColors = { ...DEFAULT_COLORS, ...colors };
  const [absFlash, setAbsFlash] = useState(false);

  useEffect(() => {
    if (input?.isAbsActive) {
      const interval = setInterval(() => {
        setAbsFlash((prev) => !prev);
      }, 60);
      return () => clearInterval(interval);
    } else {
      setAbsFlash(false);
    }
  }, [input?.isAbsActive]);

  const renderBar = (
    type: "throttle" | "brake" | "clutch" | "abs",
    index: number
  ) => {
    switch (type) {
      case "throttle":
        return (
          <InputBar
            key={`throttle-${index}`}
            value={input?.throttle || 0}
            color={mergedColors.throttle}
          />
        );
      case "brake":
        return (
          <InputBar
            key={`brake-${index}`}
            value={input?.brake || 0}
            color={mergedColors.brake}
          />
        );
      case "clutch":
        return (
          <InputBar
            key={`clutch-${index}`}
            value={input?.clutch || 0}
            color={mergedColors.clutch}
          />
        );
      case "abs":
        // Use the ABS icon instead of text, keep flashing and 1:1 aspect ratio
        // Import at top: import AbsLightIcon from "../assets/abs-light-icon";
        return (
          <div
            key={`abs-${index}`}
            style={{
              aspectRatio: "1/1",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12%",
              boxSizing: "border-box",
            }}
          >
            <AbsLightIcon
              width="100%"
              height="100%"
              color={
                input?.isAbsActive
                  ? absFlash
                    ? "#bdbdbd"
                    : mergedColors.brakeAbs
                  : "#bdbdbd"
              }
              style={{
                display: "block",
                transition: "color 0.1s",
              }}
            />
          </div>
        );
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        gap: "4px",
        position: "relative",
      }}
    >
      {barsOrder.map((bar, index) => renderBar(bar, index))}
    </div>
  );
};

export default InputBars;
