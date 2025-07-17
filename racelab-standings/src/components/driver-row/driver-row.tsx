import type React from "react";
import type { Driver } from "../../types/Driver";
import { formatFastestLap } from "../../utils/formatters";
import { CarNumber } from "../car-number/car-number";
import styles from "./driver-row.module.css";

interface Props {
  driver: Driver;
  isFastestInGroup?: boolean;
  driverNameFontSize?: string;
  positionFontSize?: string;
  carNumberFontSize?: string;
  iRatingFontSize?: string;
  fastestLapFontSize?: string;
  selectedDriverHighlightColor?: string;
  fastestLapHighlightColor?: string;
  isLightTheme?: boolean;
}

export const DriverRow = ({
  driver,
  isFastestInGroup = false,
  driverNameFontSize,
  positionFontSize,
  carNumberFontSize,
  iRatingFontSize,
  fastestLapFontSize,
  selectedDriverHighlightColor,
  fastestLapHighlightColor,
  isLightTheme,
}: Props) => {
  const fullName = `${driver.firstName} ${driver.middleName ? driver.middleName + " " : ""}${driver.lastName}`;
  const themeClass = isLightTheme ? styles.lightTheme : "";

  return (
    <div
      className={`${styles.driverRow} ${driver.isSelected ? styles.selected : ""} ${themeClass}`}
      style={
        {
          "--selected-highlight-color": selectedDriverHighlightColor,
        } as React.CSSProperties
      }
    >
      <div className={styles.position} style={{ fontSize: positionFontSize }}>
        {driver.classPosition}
      </div>
      <CarNumber
        carNumber={driver.carNumber}
        carClassId={driver.carClassId}
        fontSize={carNumberFontSize}
      />
      <div className={styles.name} style={{ fontSize: driverNameFontSize }}>
        {fullName}
      </div>
      {driver.iRating !== undefined && (
        <div className={styles.iRating} style={{ fontSize: iRatingFontSize }}>
          {Math.round(driver.iRating / 100) / 10}k
        </div>
      )}
      {driver.fastestLap !== undefined && (
        <div
          className={`${styles.fastestLap} ${isFastestInGroup ? styles.highlight : ""}`}
          style={
            {
              fontSize: fastestLapFontSize,
              "--fastest-lap-highlight-color": fastestLapHighlightColor,
            } as React.CSSProperties
          }
        >
          {formatFastestLap(driver.fastestLap)}
        </div>
      )}
    </div>
  );
};
