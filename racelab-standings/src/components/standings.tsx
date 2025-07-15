import type { StandingsProps } from "../types/StandingsProps"
import { Header } from "./header"
import styles from "./Standings.module.css"
import { useRef, useState, useEffect, useMemo } from "react"
import type { Driver } from "../types/Driver"
import { Group } from "./drivers/group"

// Precise height constants based on CSS
const HEADER_HEIGHT = 40 // px, from header.module.css
const GROUP_HEADER_HEIGHT = 28 // px, 20px min-height + 8px margin-bottom from group.module.css
const GROUP_SEPARATOR_HEIGHT = 17 // px, 1px height + 8px margin top/bottom from group.module.css
const DRIVER_ROW_HEIGHT = 47 // px, fixed height including paddings/margins
const GROUP_PADDING_VERTICAL = 20 // px, 10px top + 10px bottom from group.module.css
const DRIVERS_SECTION_PADDING_VERTICAL = 20 // px, 10px top + 10px bottom from standings.module.css
const GROUP_GAP = 10 // px, from standings.module.css for driversSection gap

const calculateGroupRenderHeight = (numDrivers: number) => {
  if (numDrivers === 0) return 0
  return GROUP_HEADER_HEIGHT + GROUP_SEPARATOR_HEIGHT + GROUP_PADDING_VERTICAL + numDrivers * DRIVER_ROW_HEIGHT
}

const Standings = ({
  drivers,
  session,
  backgroundColor,
  backgroundOpacity = 0.7,
  textColor,
  headerFontSize = "20px",
  groupHeaderFontSize = "18px",
  driverNameFontSize = "16px",
  positionFontSize = "16px",
  carNumberFontSize = "14px",
  iRatingFontSize = "14px",
  fastestLapFontSize = "14px",
  showTopNCount = 3,
  selectedDriverHighlightColor,
  fastestLapHighlightColor,
  groupSeparatorColor,
  isLightTheme = false,
}: StandingsProps) => {
  const driversSectionRef = useRef<HTMLDivElement>(null)
  const [availableDriversHeight, setAvailableDriversHeight] = useState(0)

  useEffect(() => {
    const updateHeight = () => {
      if (driversSectionRef.current) {
        setAvailableDriversHeight(driversSectionRef.current.clientHeight)
      }
    }

    updateHeight() // Set initial height
    const observer = new ResizeObserver(updateHeight)
    if (driversSectionRef.current) {
      observer.observe(driversSectionRef.current)
    }

    return () => {
      if (driversSectionRef.current) {
        observer.unobserve(driversSectionRef.current)
      }
    }
  }, [])

  const selectedDriver = useMemo(() => drivers.find((d) => d.isSelected), [drivers])

  // Group drivers by carClassId and sort groups by fastest lap
  const groupedDrivers = useMemo(() => {
    const groups = new Map<number, Driver[]>()
    drivers.forEach((driver) => {
      if (driver.carClassId != null) {
        const group = groups.get(driver.carClassId)
        if (group) {
          group.push(driver)
        } else {
          groups.set(driver.carClassId, [driver])
        }
      }
    })

    return Array.from(groups.entries()).sort(([, driversA], [, driversB]) => {
      const fastestLapA = driversA.reduce(
        (minLap, driver) =>
          driver.fastestLap !== undefined && driver.fastestLap < minLap ? driver.fastestLap : minLap,
        Number.POSITIVE_INFINITY,
      )
      const fastestLapB = driversB.reduce(
        (minLap, driver) =>
          driver.fastestLap !== undefined && driver.fastestLap < minLap ? driver.fastestLap : minLap,
        Number.POSITIVE_INFINITY,
      )
      return fastestLapA - fastestLapB
    })
  }, [drivers])

  const themeColors = useMemo(() => {
    if (isLightTheme) {
      return {
        bgColor: backgroundColor || "rgba(240, 240, 240, 0.8)",
        txtColor: textColor || "#333",
        selectedHighlight: selectedDriverHighlightColor || "#e0e0e0",
        fastestHighlight: fastestLapHighlightColor || "#ff8a65", // Lighter orange
        separatorColor: groupSeparatorColor || "rgba(180, 180, 180, 0.5)",
        groupBg: "rgba(255, 255, 255, 0.9)",
      }
    } else {
      return {
        bgColor: backgroundColor || "rgba(34, 35, 36, 0.7)",
        txtColor: textColor || "#fff",
        selectedHighlight: selectedDriverHighlightColor || "#3a4a6a",
        fastestHighlight: fastestLapHighlightColor || "#9b59b6", // Purple
        separatorColor: groupSeparatorColor || "rgba(109, 109, 109, 0.5)",
        groupBg: "rgba(0, 0, 0, 0.4)",
      }
    }
  }, [
    isLightTheme,
    backgroundColor,
    textColor,
    selectedDriverHighlightColor,
    fastestLapHighlightColor,
    groupSeparatorColor,
  ])

  const groupsToRender = useMemo(() => {
    if (availableDriversHeight === 0) return []

    const currentRemainingHeight = availableDriversHeight - DRIVERS_SECTION_PADDING_VERTICAL

    const selectedGroupEntry = selectedDriver
      ? groupedDrivers.find(([, groupDrivers]) => groupDrivers.some((d) => d.carIdx === selectedDriver.carIdx))
      : undefined

    // Helper to get initial number of drivers for a group, ensuring selected driver is visible
    const getInitialNumDriversForGroup = (
      groupDrivers: Driver[],
      isCurrentGroupSelected: boolean,
      selectedDriver: Driver | undefined,
      showTopNCount: number,
    ) => {
      const sortedGroupDrivers = [...groupDrivers].sort((a, b) => a.classPosition - b.classPosition)
      let numDrivers = Math.min(sortedGroupDrivers.length, showTopNCount)

      if (isCurrentGroupSelected && selectedDriver) {
        const selectedIdx = sortedGroupDrivers.findIndex((d) => d.carIdx === selectedDriver.carIdx)
        if (selectedIdx !== -1) {
          // Ensure selected driver is visible, and try to show a few around them if possible
          // Max of showTopNCount or selected driver's index + 1 (to include selected driver)
          numDrivers = Math.max(numDrivers, selectedIdx + 1)
          // Optionally, if selected driver is not in top N, try to show one driver above and below
          if (selectedIdx >= showTopNCount) {
            numDrivers = Math.min(sortedGroupDrivers.length, numDrivers + 2) // selected + 1 above + 1 below
          }
        }
      }
      return numDrivers
    }

    // Step 1: Initialize with target number of drivers per group (max possible without exceeding showTopNCount, but ensuring selected is visible)
    const currentDriversPerGroup = new Map<number, number>()
    groupedDrivers.forEach(([carClassId, groupDrivers]) => {
      const isCurrentGroupSelected = selectedGroupEntry && carClassId === selectedGroupEntry[0]
      const numDrivers = getInitialNumDriversForGroup(
        groupDrivers,
        isCurrentGroupSelected,
        selectedDriver,
        showTopNCount,
      )
      currentDriversPerGroup.set(carClassId, numDrivers)
    })

    // Helper to calculate total height based on currentDriversPerGroup map
    const calculateCurrentTotalHeight = (map: Map<number, number>) => {
      let height = 0
      let renderedGroupCount = 0
      map.forEach((numDrivers) => {
        if (numDrivers > 0) {
          height += calculateGroupRenderHeight(numDrivers)
          renderedGroupCount++
        }
      })
      if (renderedGroupCount > 0) {
        height += (renderedGroupCount - 1) * GROUP_GAP
      }
      return height
    }

    let currentTotalHeight = calculateCurrentTotalHeight(currentDriversPerGroup)

    // Step 2: Iteratively shrink groups until total height fits or no more shrinking possible
    while (currentTotalHeight > currentRemainingHeight) {
      let changedThisIteration = false

      // Phase 2a: Shrink groups with > 3 drivers (prioritize non-selected, then selected)
      const shrinkCandidatesGT3: [number, number][] = [] // [carClassId, currentNumDrivers]
      currentDriversPerGroup.forEach((numDrivers, carClassId) => {
        if (numDrivers > 3) {
          shrinkCandidatesGT3.push([carClassId, numDrivers])
        }
      })

      // Sort candidates: non-selected first, then selected. Within each, by numDrivers descending.
      shrinkCandidatesGT3.sort((a, b) => {
        const isASelected = selectedGroupEntry && a[0] === selectedGroupEntry[0]
        const isBSelected = selectedGroupEntry && b[0] === selectedGroupEntry[0]

        if (isASelected && !isBSelected) return 1 // B (non-selected) comes before A (selected)
        if (!isASelected && isBSelected) return -1 // A (non-selected) comes before B (selected)
        return b[1] - a[1] // Sort by number of drivers descending
      })

      if (shrinkCandidatesGT3.length > 0) {
        const [carClassIdToShrink] = shrinkCandidatesGT3[0]
        const oldNumDrivers = currentDriversPerGroup.get(carClassIdToShrink)!
        currentDriversPerGroup.set(carClassIdToShrink, oldNumDrivers - 1)
        currentTotalHeight = calculateCurrentTotalHeight(currentDriversPerGroup)
        changedThisIteration = true
      } else {
        // Phase 2b: All groups are now at 3 drivers or less. Shrink groups with > 1 driver (prioritize non-selected, then selected)
        const shrinkCandidatesGT1: [number, number][] = []
        currentDriversPerGroup.forEach((numDrivers, carClassId) => {
          if (numDrivers > 1) {
            shrinkCandidatesGT1.push([carClassId, numDrivers])
          }
        })

        shrinkCandidatesGT1.sort((a, b) => {
          const isASelected = selectedGroupEntry && a[0] === selectedGroupEntry[0]
          const isBSelected = selectedGroupEntry && b[0] === selectedGroupEntry[0]

          if (isASelected && !isBSelected) return 1
          if (!isASelected && isBSelected) return -1
          return b[1] - a[1]
        })

        if (shrinkCandidatesGT1.length > 0) {
          const [carClassIdToShrink] = shrinkCandidatesGT1[0]
          const oldNumDrivers = currentDriversPerGroup.get(carClassIdToShrink)!
          currentDriversPerGroup.set(carClassIdToShrink, oldNumDrivers - 1)
          currentTotalHeight = calculateCurrentTotalHeight(currentDriversPerGroup)
          changedThisIteration = true
        } else {
          // Phase 2c: All groups are now at 1 driver or 0. Hide groups (prioritize non-selected, then selected if no other option)
          let hiddenAGroup = false
          // Find a group to hide. Iterate through original sorted groups to maintain order.
          for (const [carClassId] of groupedDrivers) {
            const isCurrentGroupSelected = selectedGroupEntry && carClassId === selectedGroupEntry[0]
            const numDrivers = currentDriversPerGroup.get(carClassId) || 0

            if (numDrivers > 0 && !isCurrentGroupSelected) {
              currentDriversPerGroup.set(carClassId, 0) // Hide this group
              currentTotalHeight = calculateCurrentTotalHeight(currentDriversPerGroup)
              hiddenAGroup = true
              changedThisIteration = true
              break // Hide one group at a time
            }
          }

          if (!hiddenAGroup && selectedGroupEntry) {
            // If no non-selected groups to hide, and selected group is still visible, hide it if necessary
            const [selectedCarClassId] = selectedGroupEntry
            const numDriversInSelectedGroup = currentDriversPerGroup.get(selectedCarClassId) || 0
            if (numDriversInSelectedGroup > 0) {
              currentDriversPerGroup.set(selectedCarClassId, 0) // Hide selected group
              currentTotalHeight = calculateCurrentTotalHeight(currentDriversPerGroup)
              changedThisIteration = true
            }
          }
        }
      }

      if (!changedThisIteration) {
        // No changes were made in this iteration, meaning we can't fit.
        break
      }
    }

    // Final check: if it still doesn't fit, return empty.
    if (currentTotalHeight > currentRemainingHeight) {
      return []
    }

    // Construct the final renderable groups list
    const finalRenderableGroups: { groupEntry: [number, Driver[]]; maxDriversToRender: number }[] = []
    groupedDrivers.forEach((groupEntry) => {
      const [carClassId] = groupEntry
      const maxDrivers = currentDriversPerGroup.get(carClassId) || 0
      if (maxDrivers > 0) {
        finalRenderableGroups.push({ groupEntry, maxDriversToRender: maxDrivers })
      }
    })

    return finalRenderableGroups
  }, [availableDriversHeight, groupedDrivers, selectedDriver, showTopNCount])

  const themeClass = isLightTheme ? styles.lightTheme : ""

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
      />
      <div ref={driversSectionRef} className={styles.driversSection}>
        {groupsToRender.length === 0 && availableDriversHeight > 0 && (
          <div style={{ textAlign: "center", padding: "20px" }}>Not enough space to display standings.</div>
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
            showTopNCount={showTopNCount}
            selectedDriverHighlightColor={themeColors.selectedHighlight}
            fastestLapHighlightColor={themeColors.fastestHighlight}
            groupSeparatorColor={themeColors.separatorColor}
            maxDriversToRender={maxDriversToRender} // Pass the calculated max drivers
            isLightTheme={isLightTheme}
            groupBackgroundColor={themeColors.groupBg}
          />
        ))}
      </div>
    </div>
  )
}

export default Standings
