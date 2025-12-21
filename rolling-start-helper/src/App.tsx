import "./index.css";
import useGameData from "./hooks/useGameData";
import DistanceFromLeaderToFinish from "./components/DistanceFromLeaderToFinish";
import PreviewComponent from "./components/PreviewComponent";
import React from "react";

const App = () => {
  const threshold = 150;
  const delayMs = 1 * 1000; // N seconds * 1000 = ms

  const [prevLapDistPct, setPrevLapDistPct] = React.useState<number>(0);
  const [nextShowTime, setNextShowTime] = React.useState(0);

  const { data } = useGameData();

  React.useEffect(() => {
    if (!data) return;
    const raceLeader = data.drivers
      .filter((driver) => driver.isCarOnTrack && driver.lapDistPct > 0.5)
      .reduce(
        (leader, driver) =>
          !leader || driver.lapDistPct > leader.lapDistPct ? driver : leader,
        null as (typeof data.drivers)[number] | null
      );
    if (!raceLeader) {
      setNextShowTime(0);
      setPrevLapDistPct(0);
      return;
    }
    setPrevLapDistPct(raceLeader.lapDistPct);
    if (raceLeader.lapDistPct < prevLapDistPct) {
      setNextShowTime(Date.now() + delayMs);
    }
  }, [prevLapDistPct, data]);

  const isPreview = /\bpreview(\b|=true)/.test(window.location.search);
  if (isPreview) {
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
        <PreviewComponent threshold={threshold} />
      </div>
    );
  }

  if (nextShowTime > Date.now()) return;
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
  const trackLength = data.session.trackLengthMeters;
  const leaderDistanceFromStartTofinishInPercents =
    raceLeader?.lapDistPct || threshold;
  const metersPassed = leaderDistanceFromStartTofinishInPercents * trackLength;
  const distanceToFinish = trackLength - metersPassed + 1;
  const distanceToFinishFormatted = Math.floor(distanceToFinish);

  if (!raceLeader) return;
  if (distanceToFinish > threshold) return;
  if (distanceToFinish < 0) return;

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
