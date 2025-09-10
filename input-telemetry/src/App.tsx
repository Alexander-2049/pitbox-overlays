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
        barColors={parameters.barColors}
        barsOrder={parameters.barsOrder}
        elementsOrder={parameters.elementsOrder}
        orientation={parameters.orientation}
        traceColors={parameters.traceColors}
        traceHistorySeconds={parameters.traceHistorySeconds}
        traceSettings={parameters.traceSettings}
        visible={{
          absVisible: parameters.absVisible,
          barsVisible: parameters.barsVisible,
          tracesVisibile: parameters.tracesVisibile,
        }}
      />
    </div>
  );
};

export default App;
