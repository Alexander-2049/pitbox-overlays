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
        traceColors={parameters.traceColors}
        traceHistorySeconds={parameters.traceHistorySeconds}
        traceSettings={parameters.traceVisibility}
      />
    </div>
  );
};

export default App;
