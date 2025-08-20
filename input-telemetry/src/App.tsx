import { InputTraces } from "./components/input-traces";
import "./index.css";
import InputBars from "./components/input-bars";
import useGameData from "./hooks/useGameData";

const App = () => {
  const { data } = useGameData();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        backgroundColor: "rgba(100, 100, 200, 0.15)",
      }}
    >
      <InputTraces
        input={data?.realtime}
        settings={{
          includeThrottle: true,
          includeBrake: true,
          includeClutch: true,
          includeSteeringAngle: true,
        }}
        historySeconds={7}
      />
      <InputBars
        input={data?.realtime}
        barsOrder={["throttle", "brake", "abs"]}
      />
    </div>
  );
};

export default App;
