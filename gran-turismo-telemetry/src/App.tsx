import { useEffect, useMemo, useState } from "react";
import useWebSocket from "./hooks/useWebSocket";
import { useWindowSize } from "usehooks-ts";

export default function RacingHUD() {
  const { width, height } = useWindowSize();

  const memoizedKeys = useMemo(
    () => [
      "realtime.throttle",
      "realtime.brake",
      "realtime.gear",
      "realtime.speedKph",
      "realtime.speedMph",
      "realtime.steeringAnglePct",
      "realtime.rpm",
      "realtime.rpmStageFirst",
      "realtime.rpmStageShift",
      "realtime.rpmStageLast",
      "realtime.rpmStageBlink",
      "realtime.displayUnits",
    ],
    []
  );

  const { data } = useWebSocket("ws://localhost:49791", memoizedKeys) as {
    data: Record<string, number | string>;
  };

  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(1);
  const [gear, setGear] = useState(0);
  const [speedKph, setSpeedKph] = useState(0);
  const [steeringAnglePct, setSteeringAnglePct] = useState(0);
  const [displayUnits, setDisplayUnits] = useState("IMPERIAL");
  const [rpm, setRpm] = useState(0);
  const [rpmStageFirst, setRpmStageFirst] = useState(0);
  const [, setRpmStageShift] = useState(0);
  const [rpmStageLast, setRpmStageLast] = useState(0);
  const [rpmStageBlink, setRpmStageBlink] = useState(0);
  const [blinkState, setBlinkState] = useState(false);

  // Blink effect for high RPM
  useEffect(() => {
    let interval: number;

    if (rpm >= rpmStageBlink) {
      interval = setInterval(() => {
        setBlinkState((prev) => !prev);
      }, 200); // Blink every 200ms
    } else {
      setBlinkState(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rpm, rpmStageBlink]);

  useEffect(() => {
    const getNumberValue = (key: string, defaultValue: number) =>
      typeof data[key] === "number" ? (data[key] as number) : defaultValue;

    const getStringValue = (key: string, defaultValue: string) =>
      typeof data[key] === "string" ? (data[key] as string) : defaultValue;

    const throttle = getNumberValue("realtime.throttle", 0);
    const brake = getNumberValue("realtime.brake", 1);
    const gear = getNumberValue("realtime.gear", 0);
    const speedKph = getNumberValue("realtime.speedKph", 0);
    const steeringAnglePct = getNumberValue("realtime.steeringAnglePct", 0);
    const displayUnits = getStringValue("realtime.displayUnits", "IMPERIAL");
    const rpm = getNumberValue("realtime.rpm", 0);
    const rpmStageFirst = getNumberValue("realtime.rpmStageFirst", 0);
    const rpmStageShift = getNumberValue("realtime.rpmStageShift", 0);
    const rpmStageLast = getNumberValue("realtime.rpmStageLast", 0);
    const rpmStageBlink = getNumberValue("realtime.rpmStageBlink", 0);

    setThrottle(throttle);
    setBrake(brake);
    setGear(gear);
    setSpeedKph(speedKph);
    setSteeringAnglePct(steeringAnglePct);
    setDisplayUnits(displayUnits);
    setRpm(rpm);
    setRpmStageFirst(rpmStageFirst);
    setRpmStageShift(rpmStageShift);
    setRpmStageLast(rpmStageLast);
    setRpmStageBlink(rpmStageBlink);
  }, [data]);

  // Calculate speed based on display units
  const speed = displayUnits === "IMPERIAL" ? speedKph * 0.621371 : speedKph;
  const speedUnit = displayUnits === "IMPERIAL" ? "mph" : "kph";

  // Calculate RPM percentage for the progress bar
  const calculateRpmPercentage = () => {
    if (rpmStageFirst === 0 || rpmStageLast === 0) return 0;

    // Calculate normalized RPM percentage between first stage and last stage
    const currentRpm = rpm;
    const rpmRange = rpmStageLast - rpmStageFirst;
    const rpmProgress = (currentRpm - rpmStageFirst) / rpmRange;

    return Math.max(0, Math.min(1, rpmProgress)) * 100;
  };

  // Determine RPM bar color based on current RPM stage
  const getRpmBarColor = () => {
    if (rpm >= rpmStageBlink) {
      return blinkState ? "red" : "white"; // Blinking red/white for highest stage
    } else if (rpm >= rpmStageLast) {
      return "red"; // Red for high stage
    } else {
      return "white"; // White for low stage
    }
  };

  // Calculate steering dot position
  const calculateSteeringDotPosition = () => {
    // Clamp steering angle to [-0.25, 0.25] range
    const clampedSteering = Math.max(-0.25, Math.min(0.25, steeringAnglePct));
    // Reverse the steering logic and convert to percentage for positioning (0% = far left, 100% = far right)
    return ((-clampedSteering + 0.25) / 0.5) * 100;
  };

  // Responsive sizing based on viewport
  const getFontSize = (baseSize: number) => {
    const scaleFactor = Math.min(width / 1200, height / 800);
    return Math.max(baseSize * scaleFactor, baseSize * 0.6); // Ensure minimum size
  };

  const getElementSize = (baseSize: number) => {
    const scaleFactor = Math.min(width / 1200, height / 800);
    return Math.max(baseSize * scaleFactor, baseSize * 0.6); // Ensure minimum size
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      {/* Main HUD Container */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `calc(100% - ${getElementSize(100)}px)`,
          height: `calc(100% - ${getElementSize(100)}px)`,
          backgroundColor: "rgba(0, 0, 0, 0.5)", // More transparent
          borderRadius: `${getElementSize(15)}px`,
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
          color: "white",
          fontFamily: "'Orbitron', sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: `${getElementSize(20)}px`,
        }}
      >
        {/* Steering Angle Indicator */}
        <div
          style={{
            position: "absolute",
            top: `${getElementSize(10)}px`,
            left: "0",
            width: "100%",
            height: `${getElementSize(4)}px`,
            backgroundColor: "#333",
            borderRadius: `${getElementSize(2)}px`,
          }}
        >
          {/* Center Dot (new) */}
          <div
            style={{
              position: "absolute",
              top: `${getElementSize(-3)}px`,
              left: "50%",
              width: `${getElementSize(10)}px`,
              height: `${getElementSize(10)}px`,
              backgroundColor: "rgba(128, 128, 128, 0.5)", // Transparent gray
              borderRadius: "50%",
              transform: "translateX(-50%)",
              zIndex: 1,
            }}
          ></div>

          {/* Steering Dot */}
          <div
            style={{
              position: "absolute",
              top: `${getElementSize(-3)}px`,
              left: `${calculateSteeringDotPosition()}%`,
              width: `${getElementSize(10)}px`,
              height: `${getElementSize(10)}px`,
              backgroundColor: "red",
              borderRadius: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
            }}
          ></div>
        </div>

        {/* RPM Bar */}
        <div
          style={{
            position: "absolute",
            top: `${getElementSize(30)}px`,
            left: "10%",
            width: "80%",
            height: `${getElementSize(10)}px`,
            backgroundColor: "#333",
            borderRadius: `${getElementSize(5)}px`,
            overflow: "hidden",
          }}
        >
          {/* Active RPM Indicator with dynamic color */}
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: `${calculateRpmPercentage()}%`,
              height: "100%",
              backgroundColor: getRpmBarColor(),
              transition:
                rpm >= rpmStageBlink ? "none" : "background-color 0.2s ease",
            }}
          ></div>
        </div>

        {/* Speed and Gear Display */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: `${getElementSize(30)}px`,
            gap: `${getElementSize(40)}px`,
          }}
        >
          {/* Speed Display */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: `${getFontSize(48)}px`,
                fontWeight: "bold",
                color: "white",
                textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
              }}
            >
              {Math.round(speed)}
            </div>
            <div
              style={{
                fontSize: `${getFontSize(14)}px`,
                color: "#aaa",
                marginTop: `${getElementSize(-5)}px`,
              }}
            >
              {speedUnit}
            </div>
          </div>

          {/* Vertical Divider */}
          <div
            style={{
              width: `${getElementSize(2)}px`,
              height: `${getElementSize(60)}px`,
              backgroundColor: "#444",
            }}
          ></div>

          {/* Gear Display */}
          <div
            style={{
              fontSize: `${getFontSize(60)}px`,
              fontWeight: "bold",
              color: "white",
              textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
            }}
          >
            {gear}
          </div>
        </div>

        {/* Additional Telemetry */}
        <div
          style={{
            position: "absolute",
            bottom: `${getElementSize(10)}px`,
            left: "0",
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
            fontSize: `${getFontSize(12)}px`,
            color: "#FFF",
          }}
        >
          <div>Throttle: {(throttle * 100).toFixed(0)}%</div>
          <div>Brake: {(brake * 100).toFixed(0)}%</div>
          <div>RPM: {rpm.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}
