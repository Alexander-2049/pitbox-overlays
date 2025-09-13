// input-bars.tsx
const DEFAULT_COLORS = {
  throttle: "#22c55e",
  brake: "#ef4444",
  clutch: "#38bdf8",
  steering: "#1e3a8a",
  brakeAbs: "#fefefe",
};

export interface InputBarsProps {
  input?: {
    brake?: number;
    throttle?: number;
    clutch?: number;
    steeringAnglePct?: number;
  };
  settings?: {
    includeThrottle?: boolean;
    includeBrake?: boolean;
    includeClutch?: boolean;
  };
  barsOrder?: Array<"throttle.bar" | "brake.bar" | "clutch.bar">;
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
        padding: "4px",
      }}
    >
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
          marginTop: "3px",
          userSelect: "none",
          color: "#fff",
          textShadow: "2px 2px 4px #919191ff",
          fontFamily: "sans-serif",
        }}
      >
        {pct}
      </div>
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

const InputBars: React.FC<InputBarsProps> = ({
  input,
  settings = {
    includeBrake: true,
    includeThrottle: true,
    includeClutch: false,
  },
  barsOrder = ["clutch.bar", "throttle.bar", "brake.bar"],
  colors = {},
}) => {
  const mergedColors = { ...DEFAULT_COLORS, ...colors };

  const renderBar = (
    type: "throttle.bar" | "brake.bar" | "clutch.bar",
    index: number
  ) => {
    switch (type) {
      case "throttle.bar":
        if (!settings.includeThrottle) return null;
        return (
          <InputBar
            key={`throttle-${index}`}
            value={input?.throttle || 0}
            color={mergedColors.throttle}
          />
        );
      case "brake.bar":
        if (!settings.includeBrake) return null;
        return (
          <InputBar
            key={`brake-${index}`}
            value={input?.brake || 0}
            color={mergedColors.brake}
          />
        );
      case "clutch.bar":
        if (!settings.includeClutch) return null;
        return (
          <InputBar
            key={`clutch-${index}`}
            value={input?.clutch || 0}
            color={mergedColors.clutch}
          />
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
