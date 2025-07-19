import type { StandingsProps } from "../types/StandingsProps";
import { Header } from "./header";
// @ts-ignore
import styles from "./Standings.module.css";
import { useRef, useState, useEffect, useMemo } from "react";
import type { Driver } from "../types/Driver";
import { Group } from "./drivers/group";
import type React from "react";

const Standings = ({
  drivers,
  session,
  backgroundColor,
  backgroundOpacity = 0.7,
  textColor,
  headerFontSize = 13,
  groupHeaderFontSize = 13,
  driverNameFontSize = 13,
  positionFontSize = 13,
  carNumberFontSize = 13,
  iRatingFontSize = 13,
  fastestLapFontSize = 13,
  showTopNCount = 3,
  selectedDriverHighlightColor,
  fastestLapHighlightColor,
  groupSeparatorColor,
  isLightTheme = false,
  // New size props with default values matching the user's request or original effective values
  headerHeightPx = 40,
  groupHeaderMinHeightPx = 20, // User's new constant
  groupHeaderMarginBottomPx = 8, // Fixed margin from CSS
  groupSeparatorHeightPx = 1, // Fixed height from CSS
  groupSeparatorMarginVerticalPx = 4, // Fixed margin from CSS (4px top + 4px bottom = 8px total vertical margin)
  driverRowMinHeightPx = 25, // User's request for default row height
  driverRowPaddingVerticalPx = 3, // Fixed padding from CSS (3px top + 3px bottom = 6px total vertical padding)
  driverRowBorderBottomPx = 1, // Fixed border from CSS
  groupContainerPaddingPx = 10, // Fixed padding from CSS (10px all sides, so 20px vertical)
  driversSectionPaddingPx = 10, // Fixed padding from CSS (10px all sides, so 20px vertical)
  groupGapPx = 2, // User's new constant
}: StandingsProps) => {
  const driversSectionRef = useRef<HTMLDivElement>(null);
  const [availableDriversHeight, setAvailableDriversHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (driversSectionRef.current) {
        setAvailableDriversHeight(driversSectionRef.current.clientHeight);
      }
    };

    updateHeight(); // Set initial height
    const observer = new ResizeObserver(updateHeight);
    if (driversSectionRef.current) {
      observer.observe(driversSectionRef.current);
    }

    return () => {
      if (driversSectionRef.current) {
        observer.unobserve(driversSectionRef.current);
      }
    };
  }, []);

  const selectedDriver = useMemo(
    () => drivers.find((d) => d.isSelected),
    [drivers]
  );

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

  const themeColors = useMemo(() => {
    if (isLightTheme) {
      return {
        bgColor: backgroundColor || "rgba(240, 240, 240, 0.8)",
        txtColor: textColor || "#333",
        selectedHighlight: selectedDriverHighlightColor || "#e0e0e0",
        fastestHighlight: fastestLapHighlightColor || "#ff8a65", // Lighter orange
        separatorColor: groupSeparatorColor || "rgba(180, 180, 180, 0.5)",
        groupBg: "rgba(255, 255, 255, 0.9)",
      };
    } else {
      return {
        bgColor: backgroundColor || "rgba(34, 35, 36, 0.7)",
        txtColor: textColor || "#fff",
        selectedHighlight: selectedDriverHighlightColor || "#3a4a6a",
        fastestHighlight: fastestLapHighlightColor || "#9b59b6", // Purple
        separatorColor: groupSeparatorColor || "rgba(109, 109, 109, 0.5)",
        groupBg: "rgba(0, 0, 0, 0.4)",
      };
    }
  }, [
    isLightTheme,
    backgroundColor,
    textColor,
    selectedDriverHighlightColor,
    fastestLapHighlightColor,
    groupSeparatorColor,
  ]);

  // Calculate the total effective height of a single driver row
  const effectiveDriverRowHeight = useMemo(
    () =>
      driverRowMinHeightPx +
      2 * driverRowPaddingVerticalPx +
      driverRowBorderBottomPx,
    [driverRowMinHeightPx, driverRowPaddingVerticalPx, driverRowBorderBottomPx]
  );

  // Calculate the total effective height of a group header
  const effectiveGroupHeaderHeight = useMemo(
    () => groupHeaderMinHeightPx + groupHeaderMarginBottomPx,
    [groupHeaderMinHeightPx, groupHeaderMarginBottomPx]
  );

  // Calculate the total effective height of a group separator
  const effectiveGroupSeparatorHeight = useMemo(
    () => groupSeparatorHeightPx + 2 * groupSeparatorMarginVerticalPx,
    [groupSeparatorHeightPx, groupSeparatorMarginVerticalPx]
  );

  // Calculate the total effective vertical padding for a group container
  const effectiveGroupContainerPaddingVertical = useMemo(
    () => 2 * groupContainerPaddingPx,
    [groupContainerPaddingPx]
  );

  // Helper to calculate total height of a group based on number of drivers
  const calculateGroupRenderHeight = useMemo(() => {
    return (numDrivers: number) => {
      if (numDrivers === 0) return 0;
      return (
        effectiveGroupHeaderHeight +
        effectiveGroupSeparatorHeight +
        effectiveGroupContainerPaddingVertical +
        numDrivers * effectiveDriverRowHeight
      );
    };
  }, [
    effectiveGroupHeaderHeight,
    effectiveGroupSeparatorHeight,
    effectiveGroupContainerPaddingVertical,
    effectiveDriverRowHeight,
  ]);

  const groupsToRender = useMemo(() => {
    if (availableDriversHeight === 0) return [];

    const currentRemainingHeight =
      availableDriversHeight - 2 * driversSectionPaddingPx; // Total vertical padding for drivers section

    const selectedGroupEntry = selectedDriver
      ? groupedDrivers.find(([, groupDrivers]) =>
          groupDrivers.some((d) => d.carIdx === selectedDriver.carIdx)
        )
      : undefined;

    // Step 1: Determine driver counts to render
    const currentDriversPerGroup = new Map<number, number>();
    let remainingHeight = currentRemainingHeight;

    const selectedGroupId = selectedGroupEntry?.[0];

    // Track progress for iterative adding
    const otherGroups = groupedDrivers.filter(([id]) => id !== selectedGroupId);
    const selectedGroupDrivers = selectedGroupEntry?.[1] ?? [];
    let selectedGroupCount = 0;

    // Phase 1: Iteratively add one driver to each group (prioritizing selected group)
    // until showTopNCount is reached for each group or height limit is hit.
    let iterationCount = 0;
    let canAddMore = true;

    while (canAddMore) {
      canAddMore = false;

      // Try to add to selected group first
      if (
        selectedGroupEntry &&
        selectedGroupCount < selectedGroupDrivers.length &&
        selectedGroupCount < showTopNCount
      ) {
        const potentialNewHeight = calculateGroupRenderHeight(
          selectedGroupCount + 1
        );
        const currentGroupHeight =
          calculateGroupRenderHeight(selectedGroupCount);
        const heightIncrease = potentialNewHeight - currentGroupHeight;

        if (remainingHeight >= heightIncrease) {
          selectedGroupCount++;
          currentDriversPerGroup.set(selectedGroupId!, selectedGroupCount);
          remainingHeight -= heightIncrease;
          canAddMore = true;
        }
      }

      // Then try to add to other groups
      for (const [groupId, groupDrivers] of otherGroups) {
        const current = currentDriversPerGroup.get(groupId) || 0;
        if (current < groupDrivers.length && current < showTopNCount) {
          const potentialNewHeight = calculateGroupRenderHeight(current + 1);
          const currentGroupHeight = calculateGroupRenderHeight(current);
          const heightIncrease = potentialNewHeight - currentGroupHeight;

          if (remainingHeight >= heightIncrease) {
            currentDriversPerGroup.set(groupId, current + 1);
            remainingHeight -= heightIncrease;
            canAddMore = true;
          }
        }
      }

      iterationCount++;
      if (iterationCount > drivers.length * 2) break; // Safety break
    }

    // Phase 2: If there's still space, give all remaining height to selected group
    if (selectedGroupEntry) {
      const [carClassId, groupDrivers] = selectedGroupEntry;
      const currentSelectedGroupDrivers =
        currentDriversPerGroup.get(carClassId) || 0;

      // Calculate how many more drivers can fit in the selected group
      const remainingSpaceForDrivers = Math.floor(
        remainingHeight / effectiveDriverRowHeight
      );

      const newNumDrivers = Math.min(
        groupDrivers.length,
        currentSelectedGroupDrivers + remainingSpaceForDrivers
      );

      if (newNumDrivers > currentSelectedGroupDrivers) {
        currentDriversPerGroup.set(carClassId, newNumDrivers);
      }
    }

    // Calculate the total height of rendered groups
    const calculateCurrentTotalHeight = (map: Map<number, number>) => {
      let height = 0;
      let renderedGroupCount = 0;
      map.forEach((numDrivers) => {
        if (numDrivers > 0) {
          height += calculateGroupRenderHeight(numDrivers);
          renderedGroupCount++;
        }
      });
      if (renderedGroupCount > 0) {
        height += (renderedGroupCount - 1) * groupGapPx;
      }
      return height;
    };

    let currentTotalHeight = calculateCurrentTotalHeight(
      currentDriversPerGroup
    );

    // Step 3: Iteratively shrink groups until total height fits or no more shrinking possible
    while (currentTotalHeight > currentRemainingHeight) {
      let changedThisIteration = false;

      // Phase 3a: Shrink groups with > 3 drivers (prioritize non-selected, then selected)
      const shrinkCandidatesGT3: [number, number][] = [];
      currentDriversPerGroup.forEach((numDrivers, carClassId) => {
        if (numDrivers > 3) {
          shrinkCandidatesGT3.push([carClassId, numDrivers]);
        }
      });

      shrinkCandidatesGT3.sort((a, b) => {
        const isASelected =
          selectedGroupEntry && a[0] === selectedGroupEntry[0];
        const isBSelected =
          selectedGroupEntry && b[0] === selectedGroupEntry[0];

        if (isASelected && !isBSelected) return 1;
        if (!isASelected && isBSelected) return -1;
        return b[1] - a[1]; // Sort by number of drivers descending
      });

      if (shrinkCandidatesGT3.length > 0) {
        const [carClassIdToShrink] = shrinkCandidatesGT3[0];
        const oldNumDrivers = currentDriversPerGroup.get(carClassIdToShrink)!;
        currentDriversPerGroup.set(carClassIdToShrink, oldNumDrivers - 1);
        currentTotalHeight = calculateCurrentTotalHeight(
          currentDriversPerGroup
        );
        changedThisIteration = true;
      } else {
        // Phase 3b: All groups are now at 3 drivers or less. Shrink groups with > 1 driver (prioritize non-selected, then selected)
        const shrinkCandidatesGT1: [number, number][] = [];
        currentDriversPerGroup.forEach((numDrivers, carClassId) => {
          if (numDrivers > 1) {
            shrinkCandidatesGT1.push([carClassId, numDrivers]);
          }
        });

        shrinkCandidatesGT1.sort((a, b) => {
          const isASelected =
            selectedGroupEntry && a[0] === selectedGroupEntry[0];
          const isBSelected =
            selectedGroupEntry && b[0] === selectedGroupEntry[0];

          if (isASelected && !isBSelected) return 1;
          if (!isASelected && isBSelected) return -1;
          return b[1] - a[1];
        });

        if (shrinkCandidatesGT1.length > 0) {
          const [carClassIdToShrink] = shrinkCandidatesGT1[0];
          const oldNumDrivers = currentDriversPerGroup.get(carClassIdToShrink)!;
          currentDriversPerGroup.set(carClassIdToShrink, oldNumDrivers - 1);
          currentTotalHeight = calculateCurrentTotalHeight(
            currentDriversPerGroup
          );
          changedThisIteration = true;
        } else {
          // Phase 3c: All groups are now at 1 driver or 0. Hide groups (prioritize non-selected, then selected if no other option)
          let hiddenAGroup = false;
          // Find a group to hide. Iterate through original sorted groups to maintain order.
          for (const [carClassId] of groupedDrivers) {
            const isCurrentGroupSelected =
              selectedGroupEntry && carClassId === selectedGroupEntry[0];
            const numDrivers = currentDriversPerGroup.get(carClassId) || 0;

            if (numDrivers > 0 && !isCurrentGroupSelected) {
              currentDriversPerGroup.set(carClassId, 0); // Hide this group
              currentTotalHeight = calculateCurrentTotalHeight(
                currentDriversPerGroup
              );
              hiddenAGroup = true;
              changedThisIteration = true;
              break;
            }
          }

          if (!hiddenAGroup && selectedGroupEntry) {
            const [selectedCarClassId] = selectedGroupEntry;
            const numDriversInSelectedGroup =
              currentDriversPerGroup.get(selectedCarClassId) || 0;
            if (numDriversInSelectedGroup > 0) {
              currentDriversPerGroup.set(selectedCarClassId, 0); // Hide selected group
              currentTotalHeight = calculateCurrentTotalHeight(
                currentDriversPerGroup
              );
              changedThisIteration = true;
            }
          }
        }
      }

      if (!changedThisIteration) {
        break;
      }
    }

    // If it still doesn't fit, return empty
    if (currentTotalHeight > currentRemainingHeight) {
      return [];
    }

    // Construct the final renderable groups list
    const finalRenderableGroups: {
      groupEntry: [number, Driver[]];
      maxDriversToRender: number;
    }[] = [];
    groupedDrivers.forEach((groupEntry) => {
      const [carClassId] = groupEntry;
      const maxDrivers = currentDriversPerGroup.get(carClassId) || 0;
      if (maxDrivers > 0) {
        finalRenderableGroups.push({
          groupEntry,
          maxDriversToRender: maxDrivers,
        });
      }
    });

    return finalRenderableGroups;
  }, [
    availableDriversHeight,
    groupedDrivers,
    selectedDriver,
    showTopNCount,
    driversSectionPaddingPx,
    groupGapPx,
    calculateGroupRenderHeight,
    effectiveDriverRowHeight,
  ]);

  const themeClass = isLightTheme ? styles.lightTheme : "";

  return (
    <div
      className={`${styles.wrapper} ${themeClass}`}
      style={{
        backgroundColor: `${themeColors.bgColor.replace("rgb", "rgba").replace(")", "")}, ${backgroundOpacity})`,
        color: themeColors.txtColor,
      }}
    >
      <Header
        session={session}
        textColor={themeColors.txtColor}
        fontSize={headerFontSize}
        isLightTheme={isLightTheme}
        heightPx={headerHeightPx}
      />
      <div
        ref={driversSectionRef}
        className={styles.driversSection}
        style={
          {
            "--drivers-section-padding-vertical": `${driversSectionPaddingPx}px`,
            "--group-gap": `${groupGapPx}px`,
          } as React.CSSProperties
        }
      >
        {groupsToRender.length === 0 && availableDriversHeight > 0 && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Not enough space to display standings.
          </div>
        )}

        {groupsToRender.map(({ groupEntry, maxDriversToRender }) => (
          <Group
            key={groupEntry[0]}
            drivers={groupEntry[1]}
            groupName={`${groupEntry[1][0].carClassShortName}`}
            textColor={themeColors.txtColor}
            groupHeaderFontSize={groupHeaderFontSize}
            driverNameFontSize={driverNameFontSize}
            positionFontSize={positionFontSize}
            carNumberFontSize={carNumberFontSize}
            iRatingFontSize={iRatingFontSize}
            fastestLapFontSize={fastestLapFontSize}
            selectedDriverHighlightColor={themeColors.selectedHighlight}
            fastestLapHighlightColor={themeColors.fastestHighlight}
            groupSeparatorColor={themeColors.separatorColor}
            maxDriversToRender={maxDriversToRender} // Pass the calculated max drivers
            isLightTheme={isLightTheme}
            groupBackgroundColor={themeColors.groupBg}
            groupHeaderMinHeightPx={groupHeaderMinHeightPx}
            groupHeaderMarginBottomPx={groupHeaderMarginBottomPx}
            groupSeparatorHeightPx={groupSeparatorHeightPx}
            groupSeparatorMarginVerticalPx={groupSeparatorMarginVerticalPx}
            driverRowMinHeightPx={driverRowMinHeightPx}
            driverRowPaddingVerticalPx={driverRowPaddingVerticalPx}
            driverRowBorderBottomPx={driverRowBorderBottomPx}
            groupContainerPaddingPx={groupContainerPaddingPx}
          />
        ))}
      </div>
    </div>
  );
};

export default Standings;
