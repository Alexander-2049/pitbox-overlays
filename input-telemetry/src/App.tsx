import { useEffect, useState } from "react";
import { InputTraces } from "./components/input-traces";
import "./index.css";
import InputBars from "./components/input-bars";

const App = () => {
  const [input, setInput] = useState({
    throttle: 0,
    brake: 0,
    clutch: 0,
    steeringAnglePct: 0,
    isAbsActive: false,
  });

  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.02; // time step for the sine waves

      // randomly skip updates (~20% chance)
      if (Math.random() < 0.2) return;

      const throttle = 0.5 + 0.5 * Math.sin(t); // sine wave 1
      const brake = 0.5 + 0.5 * Math.sin(t + Math.PI / 2); // sine wave 2, phase shifted
      const clutch = 0.5 + 0.5 * Math.sin(t + Math.PI); // sine wave 3
      const steeringAnglePct = 0.5 + 0.5 * Math.sin(t * 0.5); // slower sine wave
      const isAbsActive = brake > 0.8;

      setInput({ throttle, brake, clutch, steeringAnglePct, isAbsActive });
    }, 1000 / 100); // produce new values at 100 Hz

    return () => clearInterval(interval);
  }, []);

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
        input={input}
        settings={{
          includeThrottle: true,
          includeBrake: true,
          includeClutch: true,
          includeSteeringAngle: true,
        }}
        historySeconds={7}
      />
      <InputBars input={input} barsOrder={["throttle", "brake", "abs"]} />
    </div>
  );
};

export default App;
