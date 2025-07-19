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
  groupHeaderMinHeightPx = 20,
  groupHeaderMarginBottomPx = 8,
  // Removed groupSeparatorHeightPx = 1,
  // Removed groupSeparatorMarginVerticalPx = 4,
  driverRowMinHeightPx = 25, // User's request for default row height
  driverRowPaddingVerticalPx = 3,
  driverRowBorderBottomPx = 1,
  groupContainerPaddingPx = 10,
  driversSectionPaddingPx = 10,
  groupGapPx = 2,
  gapBetweenTopNAndRestPx = 10, // New prop with default
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

  // Calculate the total effective vertical padding for a group container
  const effectiveGroupContainerPaddingVertical = useMemo(
    () => 2 * groupContainerPaddingPx,
    [groupContainerPaddingPx]
  );

  // Helper to calculate total height of a group based on number of drivers
  const calculateGroupRenderHeight = useMemo(() => {
    return (
      numDrivers: number,
      isSelectedGroupTruncatedWithSeparator: boolean
    ) => {
      if (numDrivers === 0) return 0;
      let height =
        effectiveGroupHeaderHeight +
        effectiveGroupContainerPaddingVertical +
        numDrivers * effectiveDriverRowHeight;
      if (isSelectedGroupTruncatedWithSeparator) {
        height += gapBetweenTopNAndRestPx; // Use the new gap prop here
      }
      return height;
    };
  }, [
    effectiveGroupHeaderHeight,
    effectiveGroupContainerPaddingVertical,
    effectiveDriverRowHeight,
    gapBetweenTopNAndRestPx, // Dependency added
  ]);

  // Helper to calculate total height of all groups based on currentDriversPerGroup map
  const calculateCurrentTotalHeight = (
    map: Map<number, number>,
    selectedGroupId: number | undefined
  ) => {
    let height = 0;
    let renderedGroupCount = 0;
    map.forEach((numDrivers, carClassId) => {
      if (numDrivers > 0) {
        const groupDrivers =
          groupedDrivers.find(([id]) => id === carClassId)?.[1] || [];
        const selectedDriverInGroup = groupDrivers.find((d) => d.isSelected);
        const selectedIndexInGroup = selectedDriverInGroup
          ? groupDrivers.indexOf(selectedDriverInGroup)
          : -1;

        // A separator is likely if it's the selected group, truncated, selected driver is outside top N,
        // and there's space for a window (i.e., more drivers than just showTopNCount).
        // This is an approximation for layout calculation. The actual rendering in Group.tsx
        // will be precise based on discontinuity.
        let isSelectedGroupTruncatedWithSeparator = false;
        if (
          carClassId === selectedGroupId &&
          selectedDriverInGroup &&
          numDrivers > showTopNCount
        ) {
          // If the selected driver is outside top N, and we are rendering more than top N drivers in this group,
          // it implies a window, and thus a potential separator for height calculation.
          if (selectedIndexInGroup >= showTopNCount) {
            isSelectedGroupTruncatedWithSeparator = true;
          }
        }

        height += calculateGroupRenderHeight(
          numDrivers,
          isSelectedGroupTruncatedWithSeparator
        );
        renderedGroupCount++;
      }
    });
    if (renderedGroupCount > 0) {
      height += (renderedGroupCount - 1) * groupGapPx;
    }
    return height;
  };

  const groupsToRender = useMemo(() => {
    if (availableDriversHeight === 0) return [];

    const currentRemainingHeight =
      availableDriversHeight - 2 * driversSectionPaddingPx; // Total vertical padding for drivers section

    const selectedGroupEntry = selectedDriver
      ? groupedDrivers.find(([, groupDrivers]) =>
          groupDrivers.some((d) => d.carIdx === selectedDriver.carIdx)
        )
      : undefined;
    const selectedGroupId = selectedGroupEntry?.[0];

    const currentDriversPerGroup = new Map<number, number>();

    // --- Scenario: No selected driver ---
    if (!selectedDriver) {
      // Phase 1: Initialize all groups to show showTopNCount drivers
      groupedDrivers.forEach(([carClassId, groupDrivers]) => {
        currentDriversPerGroup.set(
          carClassId,
          Math.min(groupDrivers.length, showTopNCount)
        );
      });

      let currentTotalHeight = calculateCurrentTotalHeight(
        currentDriversPerGroup,
        undefined
      );

      // Phase 2: Iteratively shrink groups (from showTopNCount down to 1)
      // Shrink one driver from each group in a round-robin fashion until it fits or all are at 1.
      let changedThisIteration = true; // Start with true to enter loop
      while (
        currentTotalHeight > currentRemainingHeight &&
        changedThisIteration
      ) {
        changedThisIteration = false;
        const shrinkableGroups: number[] = [];
        currentDriversPerGroup.forEach((numDrivers, carClassId) => {
          if (numDrivers > 1) {
            shrinkableGroups.push(carClassId);
          }
        });

        if (shrinkableGroups.length === 0) {
          // No groups can shrink further (all are at 1 or 0 drivers)
          break;
        }

        // Sort shrinkable groups to maintain a consistent shrinking order (e.g., by carClassId)
        shrinkableGroups.sort((a, b) => a - b);

        for (const carClassId of shrinkableGroups) {
          const oldNumDrivers = currentDriversPerGroup.get(carClassId)!;
          currentDriversPerGroup.set(carClassId, oldNumDrivers - 1);
          currentTotalHeight = calculateCurrentTotalHeight(
            currentDriversPerGroup,
            undefined
          );
          changedThisIteration = true;
          if (currentTotalHeight <= currentRemainingHeight) break; // Stop if it fits
        }
      }

      // Phase 3: If still too tall, start hiding groups one by one (from the end of sorted groups)
      if (currentTotalHeight > currentRemainingHeight) {
        // Iterate in reverse order of groupedDrivers to hide less important groups first
        for (let i = groupedDrivers.length - 1; i >= 0; i--) {
          const [carClassId] = groupedDrivers[i];
          if ((currentDriversPerGroup.get(carClassId) || 0) > 0) {
            currentDriversPerGroup.set(carClassId, 0); // Hide this group
            currentTotalHeight = calculateCurrentTotalHeight(
              currentDriversPerGroup,
              undefined
            );
            if (currentTotalHeight <= currentRemainingHeight) break; // Stop if it fits
          }
        }
      }
    }
    // --- Scenario: Selected driver exists ---
    else {
      const otherGroups = groupedDrivers.filter(
        ([id]) => id !== selectedGroupId
      );
      const selectedGroupDrivers = selectedGroupEntry?.[1] ?? [];

      // Step 1: Initialize all groups to show showTopNCount drivers
      groupedDrivers.forEach(([carClassId, groupDrivers]) => {
        currentDriversPerGroup.set(
          carClassId,
          Math.min(groupDrivers.length, showTopNCount)
        );
      });

      const currentTotalHeight = calculateCurrentTotalHeight(
        currentDriversPerGroup,
        selectedGroupId
      );

      // If there's enough space for showTopNCount in all groups (including selected)
      if (currentTotalHeight <= currentRemainingHeight) {
        // All groups can initially show showTopNCount.
        // Now, expand the selected group to fill as much remaining space as possible.
        let remainingSpace = currentRemainingHeight - currentTotalHeight;
        let currentSelectedCount =
          currentDriversPerGroup.get(selectedGroupId!) || 0;

        // Approximate if a separator would be needed if we expand
        const selectedDriverIndex =
          selectedGroupDrivers.indexOf(selectedDriver);
        const wouldNeedSeparator =
          selectedDriverIndex >= showTopNCount &&
          currentSelectedCount >= showTopNCount;

        if (wouldNeedSeparator) {
          // If we are going to show more than showTopNCount and selected driver is outside top N,
          // we need to account for the separator height.
          remainingSpace -= gapBetweenTopNAndRestPx;
        }

        while (
          remainingSpace >= effectiveDriverRowHeight && // Check if there's space for at least one more driver row
          currentSelectedCount < selectedGroupDrivers.length // Check if there are more drivers to add
        ) {
          currentSelectedCount++;
          currentDriversPerGroup.set(selectedGroupId!, currentSelectedCount);
          remainingSpace -= effectiveDriverRowHeight; // Each additional driver adds this much height
        }
      } else {
        // Not enough space for showTopNCount in all groups.
        // Prioritize selected group, shrink others, then hide others if needed.

        // Ensure selected group shows showTopNCount (or its max)
        currentDriversPerGroup.set(
          selectedGroupId!,
          Math.min(selectedGroupDrivers.length, showTopNCount)
        );

        // Calculate height of selected group (with its target drivers)
        const selectedDriverIndex =
          selectedGroupDrivers.indexOf(selectedDriver);
        const isSelectedGroupTruncatedWithSeparator =
          selectedDriverIndex >= showTopNCount &&
          currentDriversPerGroup.get(selectedGroupId!)! > showTopNCount;

        const heightOfSelectedGroup = calculateGroupRenderHeight(
          currentDriversPerGroup.get(selectedGroupId!)!,
          isSelectedGroupTruncatedWithSeparator
        );

        // Calculate remaining height for all other groups combined, including their gaps
        let remainingHeightForOtherGroupsSection =
          currentRemainingHeight - heightOfSelectedGroup;
        if (selectedGroupEntry && otherGroups.length > 0) {
          remainingHeightForOtherGroupsSection -= groupGapPx; // Account for gap between selected and first other group
        }

        // Shrink other groups (non-selected) in a round-robin fashion
        let changedThisIteration = true;
        while (changedThisIteration) {
          changedThisIteration = false;
          let currentHeightOfOtherGroups = 0;
          let renderedOtherGroupCount = 0;
          otherGroups.forEach(([carClassId]) => {
            const numDrivers = currentDriversPerGroup.get(carClassId) || 0;
            if (numDrivers > 0) {
              currentHeightOfOtherGroups += calculateGroupRenderHeight(
                numDrivers,
                false
              ); // Other groups don't have special separator logic
              renderedOtherGroupCount++;
            }
          });
          if (renderedOtherGroupCount > 0) {
            currentHeightOfOtherGroups +=
              (renderedOtherGroupCount - 1) * groupGapPx;
          }

          if (
            currentHeightOfOtherGroups <= remainingHeightForOtherGroupsSection
          ) {
            break; // Other groups fit
          }

          const shrinkableOtherGroups: number[] = [];
          otherGroups.forEach(([carClassId]) => {
            const numDrivers = currentDriversPerGroup.get(carClassId) || 0;
            if (numDrivers > 1) {
              // Can shrink down to 1 driver
              shrinkableOtherGroups.push(carClassId);
            }
          });

          if (shrinkableOtherGroups.length === 0) {
            break; // No other groups can shrink further (all are at 1 or 0 drivers)
          }

          shrinkableOtherGroups.sort((a, b) => a - b); // Consistent shrinking order

          for (const carClassId of shrinkableOtherGroups) {
            const oldNumDrivers = currentDriversPerGroup.get(carClassId)!;
            currentDriversPerGroup.set(carClassId, oldNumDrivers - 1);
            changedThisIteration = true;

            // Recalculate height of other groups after this shrink
            let tempHeightOfOtherGroups = 0;
            let tempRenderedOtherGroupCount = 0;
            otherGroups.forEach(([tempCarClassId]) => {
              const tempNumDrivers =
                currentDriversPerGroup.get(tempCarClassId) || 0;
              if (tempNumDrivers > 0) {
                tempHeightOfOtherGroups += calculateGroupRenderHeight(
                  tempNumDrivers,
                  false
                );
                tempRenderedOtherGroupCount++;
              }
            });
            if (tempRenderedOtherGroupCount > 0) {
              tempHeightOfOtherGroups +=
                (tempRenderedOtherGroupCount - 1) * groupGapPx;
            }

            if (
              tempHeightOfOtherGroups <= remainingHeightForOtherGroupsSection
            ) {
              break; // It fits now
            }
          }
        }

        // Phase 3: If still too tall (after shrinking others to 1), hide non-selected groups
        let finalTotalHeight = calculateCurrentTotalHeight(
          currentDriversPerGroup,
          selectedGroupId
        );
        if (finalTotalHeight > currentRemainingHeight) {
          otherGroups.forEach(([carClassId]) =>
            currentDriversPerGroup.set(carClassId, 0)
          ); // Hide all other groups
          finalTotalHeight = calculateCurrentTotalHeight(
            currentDriversPerGroup,
            selectedGroupId
          ); // Recalculate total height (now only selected group)

          // Phase 4: If still too tall (meaning selected group itself is too big), or if space opened up, adjust selected group
          // This part is for the selected group to take up as much space as possible *after* other groups are handled.
          let currentSelectedCount =
            currentDriversPerGroup.get(selectedGroupId!) || 0;
          const heightOfCurrentSelected = calculateGroupRenderHeight(
            currentSelectedCount,
            selectedDriverIndex >= showTopNCount &&
              currentSelectedCount > showTopNCount
          );
          let remainingSpaceForSelectedExpansion =
            currentRemainingHeight - heightOfCurrentSelected;

          while (
            remainingSpaceForSelectedExpansion >= effectiveDriverRowHeight &&
            currentSelectedCount < selectedGroupDrivers.length
          ) {
            currentSelectedCount++;
            currentDriversPerGroup.set(selectedGroupId!, currentSelectedCount);
            remainingSpaceForSelectedExpansion -= effectiveDriverRowHeight;
          }
        }
      }
    }

    // Final construction of renderable groups
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
    effectiveGroupHeaderHeight,
    effectiveGroupContainerPaddingVertical,
    gapBetweenTopNAndRestPx, // Added dependency
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
        {drivers.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            No drivers to display.
          </div>
        )}
        {drivers.length > 0 &&
          groupsToRender.length === 0 &&
          availableDriversHeight > 0 && (
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
            // Removed groupSeparatorHeightPx={groupSeparatorHeightPx}
            // Removed groupSeparatorMarginVerticalPx={groupSeparatorMarginVerticalPx}
            driverRowMinHeightPx={driverRowMinHeightPx}
            driverRowPaddingVerticalPx={driverRowPaddingVerticalPx}
            driverRowBorderBottomPx={driverRowBorderBottomPx}
            groupContainerPaddingPx={groupContainerPaddingPx}
            showTopNCount={showTopNCount} // Pass showTopNCount to Group
            gapBetweenTopNAndRestPx={gapBetweenTopNAndRestPx} // Pass new prop to Group
          />
        ))}
      </div>
    </div>
  );
};

export default Standings;
