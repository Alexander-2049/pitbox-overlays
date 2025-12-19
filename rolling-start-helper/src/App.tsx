import "./index.css";
import useGameData from "./hooks/useGameData";
import DistanceFromLeaderToFinish from "./components/DistanceFromLeaderToFinish";
import React from "react";

const App = () => {
  const { data } = useGameData();
  const threshold = 150;

  const [showDistance, setShowDistance] = React.useState(true);
  const prevDistanceRef = React.useRef<number | null>(null);

  const isPreview = /\bpreview(\b|=true)/.test(window.location.search);
  if (isPreview) {
    return (() => {
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
    })();
  }

  if (!data || data.session.currentSessionType !== "RACE") return null;

  for (let i = 0; i < data.drivers.length; i++) {
    if (data.drivers[i].currentLap > 0) return null;
  }

  const raceLeader = data.drivers
    .filter((driver) => driver.isCarOnTrack && driver.lapDistPct > 0.5)
    .reduce(
      (leader, driver) =>
        !leader || driver.lapDistPct > leader.lapDistPct ? driver : leader,
      null as (typeof data.drivers)[number] | null
    );

  if (!raceLeader) return null;

  const trackLength = data.session.trackLengthMeters;
  const metersPassed = raceLeader.lapDistPct * trackLength;
  const distanceToFinishFormatted = Math.floor(trackLength - metersPassed);

  if (distanceToFinishFormatted > threshold) return null;

  // Detect increase and hide component temporarily
  React.useEffect(() => {
    if (
      prevDistanceRef.current !== null &&
      distanceToFinishFormatted > prevDistanceRef.current
    ) {
      setShowDistance(false);
      const timer = setTimeout(() => setShowDistance(true), 750);
      return () => clearTimeout(timer);
    }
    prevDistanceRef.current = distanceToFinishFormatted;
  }, [distanceToFinishFormatted]);

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
      {showDistance && (
        <DistanceFromLeaderToFinish
          distanceMeters={distanceToFinishFormatted}
          threshold={threshold}
        />
      )}
    </div>
  );
};

export default App;
