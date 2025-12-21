import React from "react";
import DistanceFromLeaderToFinish from "./DistanceFromLeaderToFinish";

interface PreviewProps {
  threshold: number;
}

const PreviewComponent = ({ threshold }: PreviewProps) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev + 1) % (threshold * 2));
    }, 10);
    return () => clearInterval(interval);
  }, []);

  const distance =
    progress < threshold ? threshold - progress : progress - threshold;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
      }}
    >
      <DistanceFromLeaderToFinish
        distanceMeters={Math.floor(distance)}
        threshold={threshold}
      />
    </div>
  );
};

export default PreviewComponent;
