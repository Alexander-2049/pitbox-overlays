import { Driver } from "../../types/Driver";

interface Props {
  driver: Driver;
}

export const GroupDriver = ({ driver }: Props) => {
  return (
    <div className="driver-entry">
      <strong>{driver.firstName}</strong> {driver.lastName}
      {/* {driver.classPosition}
      {driver.iRating}
      {driver.iRacingLicString} */}
      {/* {driver.fastestLap} value in seconds, convert to Minutes[2 digits]:Seconds[2 digits]:Milliseconds[3 digits] */}
    </div>
  );
};
