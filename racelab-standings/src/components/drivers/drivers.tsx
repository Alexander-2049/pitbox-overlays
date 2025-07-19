// This component is now effectively a passthrough for the grouped drivers.
// The main logic for which groups/drivers to render is in Standings.tsx.
// Keeping it for file structure, but it could potentially be merged into Standings.
import type { Driver } from "../../types/Driver";
import { Group } from "./group";
import { useMemo } from "react";

interface Props {
  drivers: Driver[];
  textColor?: string;
  groupHeaderFontSize?: number;
  driverNameFontSize?: number;
  positionFontSize?: number;
  carNumberFontSize?: number;
  iRatingFontSize?: number;
  fastestLapFontSize?: number;
  selectedDriverHighlightColor?: string;
  fastestLapHighlightColor?: string;
  groupSeparatorColor?: string;
  // New prop: exact number of drivers to render in this group
  maxDriversToRender: Map<number, number>; // Map of carClassId to maxDriversToRender
  isLightTheme?: boolean;
  groupBackgroundColor?: string;
  // New size props
  groupHeaderMinHeightPx?: number;
  groupHeaderMarginBottomPx?: number;
  groupSeparatorHeightPx?: number;
  groupSeparatorMarginVerticalPx?: number;
  driverRowMinHeightPx?: number;
  driverRowPaddingVerticalPx?: number;
  driverRowBorderBottomPx?: number;
  groupContainerPaddingPx?: number;
}

export const Drivers = ({
  drivers,
  textColor,
  groupHeaderFontSize,
  driverNameFontSize,
  positionFontSize,
  carNumberFontSize,
  iRatingFontSize,
  fastestLapFontSize,
  selectedDriverHighlightColor,
  fastestLapHighlightColor,
  groupSeparatorColor,
  maxDriversToRender, // This is now a map
  isLightTheme,
  groupBackgroundColor,
  groupHeaderMinHeightPx,
  groupHeaderMarginBottomPx,
  groupSeparatorHeightPx,
  groupSeparatorMarginVerticalPx,
  driverRowMinHeightPx,
  driverRowPaddingVerticalPx,
  driverRowBorderBottomPx,
  groupContainerPaddingPx,
}: Props) => {
  // Group drivers by carClassId and sort groups by fastest lap
  const groupedDrivers = useMemo(() => {
    const groups = new Map<number, Driver[]>();
    drivers.forEach((driver) => {
      if (driver.carClassId != null) {
        const group = groups.get(driver.carClassId);
        if (group) {
          group.push(driver);
        } else {
          groups.set(driver.carClassId, [driver]);
        }
      }
    });

    return Array.from(groups.entries()).sort(([, driversA], [, driversB]) => {
      const fastestLapA = driversA.reduce(
        (minLap, driver) =>
          driver.fastestLap !== undefined && driver.fastestLap < minLap
            ? driver.fastestLap
            : minLap,
        Number.POSITIVE_INFINITY
      );
      const fastestLapB = driversB.reduce(
        (minLap, driver) =>
          driver.fastestLap !== undefined && driver.fastestLap < minLap
            ? driver.fastestLap
            : minLap,
        Number.POSITIVE_INFINITY
      );
      return fastestLapA - fastestLapB;
    });
  }, [drivers]);

  return (
    <>
      {groupedDrivers.map(([carClassId, groupDrivers]) => {
        const driversToRenderInThisGroup =
          maxDriversToRender.get(carClassId) || 0;
        if (driversToRenderInThisGroup === 0) {
          return null; // Do not render group if no drivers are allowed
        }

        return (
          <Group
            key={carClassId}
            drivers={groupDrivers}
            groupName={`${groupDrivers[0].carClassShortName}`}
            textColor={textColor}
            groupHeaderFontSize={groupHeaderFontSize}
            driverNameFontSize={driverNameFontSize}
            positionFontSize={positionFontSize}
            carNumberFontSize={carNumberFontSize}
            iRatingFontSize={iRatingFontSize}
            fastestLapFontSize={fastestLapFontSize}
            selectedDriverHighlightColor={selectedDriverHighlightColor}
            fastestLapHighlightColor={fastestLapHighlightColor}
            groupSeparatorColor={groupSeparatorColor}
            maxDriversToRender={driversToRenderInThisGroup}
            isLightTheme={isLightTheme}
            groupBackgroundColor={groupBackgroundColor}
            groupHeaderMinHeightPx={groupHeaderMinHeightPx}
            groupHeaderMarginBottomPx={groupHeaderMarginBottomPx}
            groupSeparatorHeightPx={groupSeparatorHeightPx}
            groupSeparatorMarginVerticalPx={groupSeparatorMarginVerticalPx}
            driverRowMinHeightPx={driverRowMinHeightPx}
            driverRowPaddingVerticalPx={driverRowPaddingVerticalPx}
            driverRowBorderBottomPx={driverRowBorderBottomPx}
            groupContainerPaddingPx={groupContainerPaddingPx}
          />
        );
      })}
    </>
  );
};
