import { useEffect, useState } from "react";
import AbsLightIcon from "../assets/abs-light-icon";

interface AbsIndicatorProps {
  isActive?: boolean;
  color?: string;
  inactiveColor?: string;
}

const AbsIndicator: React.FC<AbsIndicatorProps> = ({
  isActive,
  color = "#facc15",
  inactiveColor = "#bdbdbd",
}) => {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setFlash((prev) => !prev);
      }, 60);
      return () => clearInterval(interval);
    } else {
      setFlash(false);
    }
  }, [isActive]);

  return (
    <div
      style={{
        aspectRatio: "1/1",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12%",
        boxSizing: "border-box",
      }}
    >
      <AbsLightIcon
        width="100%"
        height="100%"
        color={isActive ? (flash ? "#bdbdbd" : color) : inactiveColor}
        style={{ display: "block", transition: "color 0.1s" }}
      />
    </div>
  );
};

export default AbsIndicator;
