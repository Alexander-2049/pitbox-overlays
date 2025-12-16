import "./index.css";
import useGameData from "./hooks/useGameData";
import DistanceFromLeaderToFinish from "./components/DistanceFromLeaderToFinish";

const App = () => {
  const { data } = useGameData();

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
        <DistanceFromLeaderToFinish distanceMeters={300} />
      </div>
    );
  }

  if (!data || data.session.currentSessionType !== "RACE") return;

  const raceLeader = data.drivers.find((driver) => driver.position === 1);

  if (!raceLeader) return;
  if (raceLeader.lapsCompleted > 0) return;

  const trackLength = data.session.trackLengthMeters;
  const leaderDistanceFromStartTofinishInPercents = raceLeader.lapDistPct;
  const metersPassed = leaderDistanceFromStartTofinishInPercents * trackLength;
  const distanceToFinish = trackLength - metersPassed;
  const distanceToFinishFormatted = Math.floor(distanceToFinish);

  if (distanceToFinish < 300) return;

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
      <DistanceFromLeaderToFinish distanceMeters={distanceToFinishFormatted} />
    </div>
  );
};

export default App;
