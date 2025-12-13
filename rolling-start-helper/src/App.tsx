import "./index.css";
import useGameData from "./hooks/useGameData";
import Inputs from "./components/inputs";
import { useParameters } from "./hooks/useParameters";

const App = () => {
  const { data } = useGameData();
  const parameters = useParameters();

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
      <Inputs
        input={data?.realtime}
        colors={parameters.colors}
        backgroundOpacity={parameters.backgroundOpacity}
        traceHistorySeconds={parameters.traceHistorySeconds}
        traceVisibility={parameters.traceVisibility}
      />
    </div>
  );
};

export default App;
