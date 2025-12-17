interface Props {
  distanceMeters: number;
  threshold: number;
}

const DistanceFromLeaderToFinish = ({ distanceMeters, threshold }: Props) => {
  const isVisible = distanceMeters <= threshold;

  // 0m => 100%, threshold => 0%
  const progress =
    Math.max(0, Math.min(1, 1 - distanceMeters / threshold)) * 50;

  const getBarColor = () => {
    const ratio = distanceMeters / threshold;
    if (ratio > 2 / 3) return "#dc2626";
    if (ratio > 1 / 3) return "#facc15";
    return "#22c55e";
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "black",
      }}
    >
      {/* Left bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${progress}%`,
          backgroundColor: getBarColor(),
        }}
      />

      {/* Right bar */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: `${progress}%`,
          backgroundColor: getBarColor(),
        }}
      />

      {/* Text */}
      {isVisible && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "monospace",
            fontSize: "100vh",
            fontWeight: 900,
            lineHeight: 1,
            textShadow: "0 0 32px rgba(0,0,0,0.85)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {Math.round(distanceMeters)}
        </div>
      )}
    </div>
  );
};

export default DistanceFromLeaderToFinish;
