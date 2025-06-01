import { useEffect, useMemo, useState } from "react";
import useWebSocket from "./hooks/useWebSocket";
import { Driver } from "./types/Driver";
import Leaderboard from "./components/Leaderboard";

type DriverField = keyof Driver;
type DriverKey = `drivers[].${Exclude<DriverField, "spectateCarId">}`;
type ExtraKey = "realtime.spectateCarId";
type WSSKey = DriverKey | ExtraKey;

type WSSData = Partial<Record<WSSKey, (string | number | boolean)[] | number>>;

export default function RacingHUD() {
  const memoizedKeys = useMemo<WSSKey[]>(
    () => [
      "drivers[].carId",
      "drivers[].firstName",
      "drivers[].lastName",
      "drivers[].middleName",
      "drivers[].position",
      "drivers[].classPosition",
      "drivers[].isCarOnTrack",
      "drivers[].iRating",
      "drivers[].iRatingChange",
      "drivers[].carClassShortName",
      "drivers[].iRacingLicString",
      "drivers[].iRacingLicSubLevel",
      "realtime.spectateCarId",
    ],
    []
  );

  const { data } = useWebSocket("ws://localhost:49791", memoizedKeys) as {
    data?: WSSData;
  };

  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    if (!data) return;

    const structured: Partial<
      Record<DriverField, (string | number | boolean)[]>
    > = {};
    let maxLength = 0;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (key.startsWith("drivers[]")) {
          const field = key.replace("drivers[].", "") as DriverField;
          const values = data[key as DriverKey] as (
            | string
            | number
            | boolean
          )[];
          structured[field] = values;
          if (Array.isArray(values)) {
            maxLength = Math.max(maxLength, values.length);
          }
        }
      }
    }

    const spectateCarId =
      typeof data["realtime.spectateCarId"] === "number"
        ? (data["realtime.spectateCarId"] as number)
        : undefined;

    const newDrivers: Driver[] = Array.from({ length: maxLength }, (_, i) => {
      const driver: Driver = {};

      (Object.keys(structured) as DriverField[]).forEach((field) => {
        const value = structured[field]?.[i];

        switch (field) {
          case "carId":
          case "position":
          case "classPosition":
          case "iRating":
          case "iRatingChange":
          case "iRacingLicSubLevel":
            if (typeof value === "number") driver[field] = value;
            break;
          case "firstName":
          case "lastName":
          case "middleName":
          case "carClassShortName":
          case "iRacingLicString":
            if (typeof value === "string") driver[field] = value;
            break;
          case "isCarOnTrack":
            if (typeof value === "boolean") driver[field] = value;
            break;
        }
      });

      if (spectateCarId !== undefined) {
        driver.spectateCarId = spectateCarId;
      }

      return driver;
    });

    setDrivers(newDrivers);
  }, [data]);

  return <Leaderboard drivers={drivers} />;
}
