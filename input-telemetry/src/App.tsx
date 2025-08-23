import "./index.css";
import useGameData from "./hooks/useGameData";
import Inputs from "./components/inputs";

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
      }}
    >
      <Inputs input={data?.realtime} traceSettings={{}} />
    </div>
  );
};

export default App;
