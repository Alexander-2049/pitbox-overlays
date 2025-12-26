import "./App.css";
import useGameData from "./hooks/useGameData";
import { generateReactHook } from "./utils/generate";

function App() {
  const { data } = useGameData();

  return (
    <>
      <textarea
        style={{ width: "1024px", height: "92vh" }}
        value={generateReactHook([
          { name: "realtime.throttle", type: "number" },
          { name: "realtime.brake", type: "number" },
          {
            name: "realtime.displayUnits",
            type: "enum",
            enumValues: ["IMPERIAL", "METRIC"],
          },
          { name: "drivers[].lapDistPct", type: "number" },
          { name: "drivers[].currentLap", type: "number" },
          { name: "drivers[].isCarOnTrack", type: "boolean" },
          { name: "realtime.test", type: "number", optional: true },
        ])}
        onChange={() => {}}
        readOnly
      />

      <textarea
        style={{ width: "1024px", height: "92vh" }}
        value={JSON.stringify(data, null, 2)}
        onChange={() => {}}
        readOnly
      />
    </>
  );
}

export default App;
