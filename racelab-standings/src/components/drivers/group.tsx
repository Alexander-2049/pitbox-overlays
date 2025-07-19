import type React from "react";

import type { Driver } from "../../types/Driver";
import { DriverRow } from "../driver-row/driver-row";
import styles from "./group.module.css";
import { generateColor } from "../../utils/formatters";
import { useMemo } from "react";

interface Props {
  drivers: Driver[];
  groupName?: string;
  groupColor?: string; // This will be the base color for the group header dot
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
  maxDriversToRender: number; // New prop: exact number of drivers to render
  isLightTheme?: boolean;
  groupBackgroundColor?: string;
  // New size props
  groupHeaderMinHeightPx?: number;
  groupHeaderMarginBottomPx?: number;
  // Removed groupSeparatorHeightPx?: number
  // Removed groupSeparatorMarginVerticalPx?: number
  driverRowMinHeightPx?: number;
  driverRowPaddingVerticalPx?: number;
  driverRowBorderBottomPx?: number;
  groupContainerPaddingPx?: number;
  showTopNCount: number; // New prop
  gapBetweenTopNAndRestPx?: number; // New prop
}

export const Group = ({
  drivers,
  groupName,
  groupColor,
  textColor,
  groupHeaderFontSize,
  driverNameFontSize,
  positionFontSize,
  carNumberFontSize,
  iRatingFontSize,
  fastestLapFontSize,
  selectedDriverHighlightColor,
  fastestLapHighlightColor,
  maxDriversToRender,
  isLightTheme,
  groupBackgroundColor,
  groupHeaderMinHeightPx,
  groupHeaderMarginBottomPx,
  // Removed groupSeparatorHeightPx,
  // Removed groupSeparatorMarginVerticalPx,
  driverRowMinHeightPx,
  driverRowPaddingVerticalPx,
  driverRowBorderBottomPx,
  groupContainerPaddingPx,
  showTopNCount, // Destructure new prop
  gapBetweenTopNAndRestPx = 10, // Destructure new prop with default
}: Props) => {
  const sortedDriversInGroup = useMemo(
    () => [...drivers].sort((a, b) => a.classPosition - b.classPosition),
    [drivers]
  );

  const fastestLapInGroup = useMemo(() => {
    return sortedDriversInGroup.reduce(
      (minLap, driver) =>
        driver.fastestLap !== undefined && driver.fastestLap < minLap
          ? driver.fastestLap
          : minLap,
      Number.POSITIVE_INFINITY
    );
  }, [sortedDriversInGroup]);

  const driversToDisplayResult = useMemo(() => {
    if (maxDriversToRender <= 0) {
      return { drivers: [], showSeparator: false, separatorIndex: -1 };
    }

    const selectedDriver = sortedDriversInGroup.find((d) => d.isSelected);
    const totalDriversInGroup = sortedDriversInGroup.length;
    const selectedIndex = selectedDriver
      ? sortedDriversInGroup.indexOf(selectedDriver)
      : -1;

    // Condition for special truncation logic (selected driver not in top N, and space for window)
    const needsSpecialWindowLogic =
      selectedDriver &&
      selectedIndex !== -1 &&
      selectedIndex >= showTopNCount && // Selected driver is outside the initial top N
      maxDriversToRender > showTopNCount; // There's space for a window beyond top N

    let finalDrivers: Driver[] = [];
    let showSeparator = false;
    let separatorIndex = -1;

    if (!needsSpecialWindowLogic) {
      // Case A: No selected driver, or selected driver is in top N, or maxDriversToRender <= showTopNCount
      // (including the edge case where selected replaces last top N)

      finalDrivers = sortedDriversInGroup.slice(0, maxDriversToRender);

      // Edge case: if maxDriversToRender is exactly showTopNCount, and selected driver is not in top N,
      // then replace the last top N driver with the selected driver.
      if (
        selectedDriver &&
        maxDriversToRender === showTopNCount &&
        selectedIndex !== -1 && // Ensure selected driver exists
        selectedIndex >= showTopNCount && // Selected driver is outside top N
        finalDrivers.length > 0 // Ensure there's a last element to replace
      ) {
        finalDrivers[finalDrivers.length - 1] = selectedDriver;
        // Re-sort to ensure selected driver is in its correct classPosition within the truncated list
        finalDrivers.sort((a, b) => a.classPosition - b.classPosition);
      }
    } else {
      // Case B: Special window logic applies (selected driver is outside top N, and space for window)

      const topNDrivers = sortedDriversInGroup.slice(0, showTopNCount);
      const remainingSlotsForWindow = maxDriversToRender - topNDrivers.length;

      const windowDrivers: Driver[] = [];
      const windowAddedIndices = new Set<number>();

      // Add selected driver to the window first
      windowDrivers.push(selectedDriver!);
      windowAddedIndices.add(selectedIndex);
      let currentWindowSize = 1;

      let left = selectedIndex - 1;
      let right = selectedIndex + 1;

      // Calculate target X and Y counts for the window
      const slotsForXandY = remainingSlotsForWindow - 1; // Total slots for drivers other than selected in window
      let targetX = Math.ceil(slotsForXandY / 2); // Prioritize X (drivers ahead)
      let targetY = slotsForXandY - targetX; // Remaining for Y (drivers behind)

      // Add drivers ahead (X)
      while (targetX > 0 && left >= showTopNCount) {
        windowDrivers.unshift(sortedDriversInGroup[left]); // Add to front to maintain order
        windowAddedIndices.add(left);
        currentWindowSize++;
        left--;
        targetX--;
      }

      // Add drivers behind (Y)
      while (targetY > 0 && right < totalDriversInGroup) {
        windowDrivers.push(sortedDriversInGroup[right]);
        windowAddedIndices.add(right);
        currentWindowSize++;
        right++;
        targetY--;
      }

      // If we still have slots and couldn't fill X or Y completely due to boundaries, fill remaining greedily
      while (currentWindowSize < remainingSlotsForWindow) {
        const canAddLeft =
          left >= showTopNCount && !windowAddedIndices.has(left);
        const canAddRight =
          right < totalDriversInGroup && !windowAddedIndices.has(right);

        if (canAddLeft) {
          windowDrivers.unshift(sortedDriversInGroup[left]);
          windowAddedIndices.add(left);
          currentWindowSize++;
          left--;
        } else if (canAddRight) {
          windowDrivers.push(sortedDriversInGroup[right]);
          windowAddedIndices.add(right);
          currentWindowSize++;
          right++;
        } else {
          break; // No more drivers to add
        }
      }

      // Combine top N and window drivers
      finalDrivers = [...topNDrivers, ...windowDrivers];
      finalDrivers.sort((a, b) => a.classPosition - b.classPosition);

      // Determine separator visibility based on discontinuity
      const lastTopNPosition =
        topNDrivers.length > 0
          ? topNDrivers[topNDrivers.length - 1].classPosition
          : -1;
      const firstWindowPosition =
        windowDrivers.length > 0 ? windowDrivers[0].classPosition : -1;
      showSeparator =
        topNDrivers.length > 0 &&
        windowDrivers.length > 0 &&
        firstWindowPosition !== lastTopNPosition + 1;

      if (showSeparator) {
        separatorIndex = showTopNCount - 1; // The gap appears after the last top N driver
      }
    }

    return {
      drivers: finalDrivers.slice(0, maxDriversToRender),
      showSeparator,
      separatorIndex,
    };
  }, [sortedDriversInGroup, maxDriversToRender, showTopNCount]);

  const groupHeaderColor =
    groupColor ||
    (drivers[0]?.carClassId ? generateColor(drivers[0].carClassId) : "#DEDEDE");
  const themeClass = isLightTheme ? styles.lightTheme : "";

  if (maxDriversToRender === 0) {
    return null; // Do not render the group if no drivers are to be shown
  }

  const {
    drivers: driversToDisplay,
    showSeparator: shouldRenderSeparator,
    separatorIndex,
  } = driversToDisplayResult;

  return (
    <div
      className={`${styles.groupContainer} ${themeClass}`}
      style={
        {
          backgroundColor: groupBackgroundColor,
          color: textColor,
          "--group-container-padding": `${groupContainerPaddingPx}px`,
        } as React.CSSProperties
      }
    >
      <div
        className={`${styles.groupHeader} ${themeClass}`}
        style={
          {
            fontSize: `${groupHeaderFontSize}px`,
            "--group-color": groupHeaderColor,
            "--group-header-min-height": `${groupHeaderMinHeightPx}px`,
            "--group-header-margin-bottom": `${groupHeaderMarginBottomPx}px`,
          } as React.CSSProperties
        }
      >
        <span>
          {groupName}
          <b
            className={`${styles.driverCount} ${themeClass}`}
            style={{
              fontSize: `${groupHeaderFontSize ? groupHeaderFontSize * 0.8 : undefined}px`,
            }}
          >
            ({drivers.length})
          </b>
        </span>
      </div>
      {driversToDisplay.map((driver, index) => (
        <DriverRow
          key={driver.carIdx}
          driver={driver}
          isFastestInGroup={
            driver.fastestLap === fastestLapInGroup &&
            fastestLapInGroup !== Number.POSITIVE_INFINITY
          }
          driverNameFontSize={driverNameFontSize}
          positionFontSize={positionFontSize}
          carNumberFontSize={carNumberFontSize}
          iRatingFontSize={iRatingFontSize}
          fastestLapFontSize={fastestLapFontSize}
          selectedDriverHighlightColor={selectedDriverHighlightColor}
          fastestLapHighlightColor={fastestLapHighlightColor}
          isLightTheme={isLightTheme}
          driverRowMinHeightPx={driverRowMinHeightPx}
          driverRowPaddingVerticalPx={driverRowPaddingVerticalPx}
          driverRowBorderBottomPx={driverRowBorderBottomPx}
          style={
            shouldRenderSeparator && index === separatorIndex + 1
              ? { marginTop: `${gapBetweenTopNAndRestPx}px` }
              : undefined
          }
        />
      ))}
    </div>
  );
};
