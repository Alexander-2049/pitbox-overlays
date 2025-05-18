import { useEffect, useMemo, useState } from "react";
import useWebSocket from "./hooks/useWebSocket";
import GT7OriginalTelemetry from "./components/GT7-Original-Telemetry";

export default function RacingHUD() {
  const memoizedKeys = useMemo(
    () => [
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

  const [backgroundOpacity, setBackgroundOpacity] = useState(0.4);
  const [gear, setGear] = useState(0);
  const [speedKph, setSpeedKph] = useState(0);
  const [speedMph, setSpeedMph] = useState(0);
  const [steeringAnglePct, setSteeringAnglePct] = useState(0);
  const [steeringPointPosition, setSteeringPointPosition] = useState(0);
  const [displayUnits, setDisplayUnits] = useState("IMPERIAL");
  const [rpm, setRpm] = useState(0);
  const [rpmStageFirst, setRpmStageFirst] = useState(0);
  const [rpmStageShift, setRpmStageShift] = useState(0);
  const [rpmStageLast, setRpmStageLast] = useState(0);
  const [rpmStageBlink, setRpmStageBlink] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const backgroundOpacity = urlParams.get("backgroundOpacity");
    if (backgroundOpacity === null) return;
    let opacity = Number(backgroundOpacity);
    if (isNaN(opacity)) return;
    opacity = Math.max(0, Math.min(100, opacity));
    setBackgroundOpacity(opacity / 100);
  }, []);

  useEffect(() => {
    const getNumberValue = (key: string, defaultValue: number) =>
      typeof data[key] === "number" ? (data[key] as number) : defaultValue;

    const getStringValue = (key: string, defaultValue: string) =>
      typeof data[key] === "string" ? (data[key] as string) : defaultValue;

    const gear = getNumberValue("realtime.gear", 0);
    const speedKph = getNumberValue("realtime.speedKph", 0);
    const speedMph = getNumberValue("realtime.speedMph", 0);
    const steeringAnglePct = getNumberValue("realtime.steeringAnglePct", 0);
    const displayUnits = getStringValue("realtime.displayUnits", "IMPERIAL");
    const rpm = getNumberValue("realtime.rpm", 0);
    const rpmStageFirst = getNumberValue("realtime.rpmStageFirst", 0);
    const rpmStageShift = getNumberValue("realtime.rpmStageShift", 0);
    const rpmStageLast = getNumberValue("realtime.rpmStageLast", 0);
    const rpmStageBlink = getNumberValue("realtime.rpmStageBlink", 0);

    setGear(gear);
    setSpeedKph(speedKph);
    setSpeedMph(speedMph);
    setSteeringAnglePct(steeringAnglePct);
    setDisplayUnits(displayUnits);
    setRpm(rpm);
    setRpmStageFirst(rpmStageFirst);
    setRpmStageShift(rpmStageShift);
    setRpmStageLast(rpmStageLast);
    setRpmStageBlink(rpmStageBlink);
  }, [data]);

  useEffect(() => {
    if (steeringAnglePct > 0.245) {
      setSteeringPointPosition(0.245 * 4);
      return;
    } else if (steeringAnglePct < -0.245) {
      setSteeringPointPosition(-0.245 * 4);
      return;
    }

    setSteeringPointPosition(steeringAnglePct * 4);
  }, [steeringAnglePct]);

  return (
    <GT7OriginalTelemetry
      displayUnits={displayUnits === "IMPERIAL" ? "IMPERIAL" : "METRIC"}
      gear={gear}
      rpm={rpm}
      rpmStageFirst={rpmStageFirst}
      rpmStageShift={rpmStageShift}
      rpmStageLast={rpmStageLast}
      rpmStageBlink={rpmStageBlink}
      speedKph={speedKph}
      speedMph={speedMph}
      backgroundOpacity={backgroundOpacity}
      steeringPointPosition={steeringPointPosition}
    />
  );
}
