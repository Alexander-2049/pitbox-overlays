import "./index.css";
import useGameData from "./hooks/useGameData";
import DistanceFromLeaderToFinish from "./components/DistanceFromLeaderToFinish";
import React from "react";

const App = () => {
  const { data } = useGameData();
  const threshold = 150;

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

  if (!data || data.session.currentSessionType !== "RACE") return;

  for (let i = 0; i < data.drivers.length; i++) {
    if (data.drivers[i].currentLap > 0) return;
  }

  const raceLeader = data.drivers
    .filter((driver) => driver.isCarOnTrack && driver.lapDistPct > 0.5)
    .reduce(
      (leader, driver) =>
        !leader || driver.lapDistPct > leader.lapDistPct ? driver : leader,
      null as (typeof data.drivers)[number] | null
    );

  if (!raceLeader) return;

  const trackLength = data.session.trackLengthMeters;
  const leaderDistanceFromStartTofinishInPercents = raceLeader.lapDistPct;
  const metersPassed = leaderDistanceFromStartTofinishInPercents * trackLength;
  const distanceToFinish = trackLength - metersPassed;
  const distanceToFinishFormatted = Math.floor(distanceToFinish);

  if (distanceToFinish > threshold) return;

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
        distanceMeters={distanceToFinishFormatted}
        threshold={threshold}
      />
    </div>
  );
};

export default App;
