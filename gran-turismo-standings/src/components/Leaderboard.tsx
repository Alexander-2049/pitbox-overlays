import React from "react";

import type { FC } from "react";
import { useMemo, useEffect, useState } from "react";
import type { Driver } from "../types/Driver";

interface Props {
  drivers: Driver[];
  fontSize?: {
    position?: string;
    driverName?: string;
    safetyRating?: string;
    iRating?: string;
    iRatingChange?: string;
  };
  backgroundOpacity?: number;
}

const Leaderboard: FC<Props> = ({ drivers }) => {
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const { visibleDrivers, hasGap } = useMemo(() => {
    if (!drivers || drivers.length === 0) {
      return { visibleDrivers: [], hasGap: false };
    }

    // Sort drivers by position and ensure only one is selected
    const sortedDrivers = drivers
      .filter((driver) => driver.position !== undefined && driver.position > 0)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    if (sortedDrivers.length < 1) {
      return { visibleDrivers: [], hasGap: false };
    }

    // Ensure only one driver is selected (first one found)
    let selectedFound = false;
    const driversWithSingleSelection = sortedDrivers.map((driver) => {
      if (driver.isSelected && !selectedFound) {
        selectedFound = true;
        return driver;
      }
      return { ...driver, isSelected: false };
    });

    // Calculate how many rows can fit in viewport (51px per row + 3px gap)
    // Calculate how many rows can fit completely in viewport (51px per row + 3px gap)
    const rowHeight = 54; // 51px + 3px gap
    // Use Math.floor to ensure we only count fully visible rows (no partial rows)
    const maxVisibleRows = Math.max(
      3,
      Math.floor((viewportHeight - 16) / rowHeight)
    ); // Subtract padding (8px top + 8px bottom)

    if (maxVisibleRows <= 3) {
      return {
        visibleDrivers: driversWithSingleSelection.slice(0, maxVisibleRows),
        hasGap: false,
      };
    }

    const selectedDriver = driversWithSingleSelection.find((d) => d.isSelected);
    const selectedPosition = selectedDriver?.position ?? 1;

    // Always show top 3
    const top3 = driversWithSingleSelection.slice(0, 3);

    // If selected driver is in top 3, show all drivers sequentially
    if (selectedPosition <= 3) {
      return {
        visibleDrivers: driversWithSingleSelection.slice(0, maxVisibleRows),
        hasGap: false,
      };
    }

    // Selected driver is below top 3
    const remainingSlots = maxVisibleRows - 3;

    if (remainingSlots <= 1) {
      // Not enough space for proper centering, just show top 3
      return { visibleDrivers: top3, hasGap: false };
    }

    // Calculate range to center selected driver
    const halfRange = Math.floor(remainingSlots / 2);
    const startPos = Math.max(4, selectedPosition - halfRange);
    const endPos = Math.min(
      driversWithSingleSelection.length,
      startPos + remainingSlots - 1
    );

    // Adjust start position if we hit the end
    const adjustedStartPos = Math.max(4, endPos - remainingSlots + 1);

    const middleDrivers = driversWithSingleSelection.filter(
      (d) =>
        (d.position ?? 0) >= adjustedStartPos && (d.position ?? 0) <= endPos
    );

    const hasGap = adjustedStartPos > 4;

    return {
      visibleDrivers: [...top3, ...middleDrivers],
      hasGap,
    };
  }, [drivers, viewportHeight]);

  if (!drivers || visibleDrivers.length === 0) return null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        fontSize: "24px",
        color: "#ffffff",
        fontWeight: "normal",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "8px",
        backdropFilter: "blur(2px)",
      }}
    >
      {visibleDrivers.map((driver, index) => {
        // const isTop3 = index < 3;
        const showSeparator = hasGap && index === 3;

        return (
          <React.Fragment key={`lb-row-${driver.carId}`}>
            {showSeparator && (
              <hr
                style={{
                  height: "1px",
                  background: "rgba(0,0,0,0.6)",
                  outline: "none",
                  border: "none",
                  width: "100%",
                  margin: "2px 0",
                }}
              />
            )}

            <div
              style={{
                height: "51px",
                width: "100%",
                display: "flex",
                gap: "3px",
                color: driver.isSelected ? "#111" : "#fff",
                fontWeight: driver.isSelected ? "bold" : "normal",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: driver.isSelected ? 10 : 1,
                position: "relative",
              }}
            >
              {/* Driver position number */}
              <div
                style={{
                  border: driver.isSelected
                    ? "3px solid rgba(255,255,255,0.4)"
                    : "3px solid rgba(64,64,64,0.6)",
                  width: "57px",
                  height: "100%",
                  boxSizing: "border-box",
                  fontWeight: "bold",
                  background: driver.isSelected
                    ? "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)"
                    : "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)",
                  color: driver.isSelected ? "#111" : "#fff",
                  flexShrink: "0",
                  borderRadius: "4px 0 0 4px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Subtle shine effect for selected */}
                {driver.isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                      animation: "shine 2s infinite",
                    }}
                  />
                )}

                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {driver.position}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  flexGrow: "1",
                  background: driver.isSelected
                    ? "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)"
                    : "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)",
                  boxSizing: "border-box",
                  paddingLeft: "11px",
                  paddingRight: "11px",
                  color: driver.isSelected ? "#111" : "#fff",
                  minWidth: "0",
                  borderRadius: "0 4px 4px 0",
                  backdropFilter: "blur(1px)",
                  border: driver.isSelected
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "1px solid rgba(255,255,255,0.1)",
                  borderLeft: "none",
                }}
              >
                {/* Driver name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "100%",
                    flexGrow: "1",
                    minWidth: "0",
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                      flex: "1",
                      minWidth: "0",
                      verticalAlign: "bottom",
                      textShadow: driver.isSelected
                        ? "none"
                        : "0 1px 2px rgba(0,0,0,0.8)",
                    }}
                  >
                    {driver.firstName?.[0] || ""}
                    {driver.firstName?.[0] && ". "}
                    {driver.lastName}
                  </span>
                </div>

                {/* Driver stats */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                    fontSize: "18px",
                    flexShrink: "0",
                  }}
                >
                  {/* Safety Rating / License */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                      gap: "3px",
                    }}
                  >
                    {/* License name */}
                    {driver.iRacingLicString && (
                      <div
                        style={{
                          width: "20px",
                          height: "22px",
                          background: driver.isSelected
                            ? "rgba(200,200,200,0.6)"
                            : "rgba(152,152,152,0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: driver.isSelected ? "#111" : "#fff",
                          borderRadius: "2px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        {driver.iRacingLicString}
                      </div>
                    )}

                    {/* License level */}
                    {driver.iRacingLicSubLevel !== undefined && (
                      <div
                        style={{
                          color: driver.isSelected ? "#111" : "#fff",
                          textShadow: driver.isSelected
                            ? "none"
                            : "0 1px 2px rgba(0,0,0,0.8)",
                        }}
                      >
                        {driver.iRacingLicSubLevel.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Driver rating */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginLeft: "10px",
                    }}
                  >
                    <div
                      style={{
                        color: driver.isSelected ? "#111" : "#fff",
                        minWidth: "40px",
                        textAlign: "right",
                        textShadow: driver.isSelected
                          ? "none"
                          : "0 1px 2px rgba(0,0,0,0.8)",
                      }}
                    >
                      {driver.iRating}
                    </div>
                    {driver.iRatingChange !== undefined && (
                      <div
                        style={{
                          fontWeight: 600,
                          color:
                            driver.iRatingChange > 0
                              ? "#7ADD9B"
                              : driver.iRatingChange < 0
                                ? "#DD7A7A"
                                : driver.isSelected
                                  ? "#111"
                                  : "#fff",
                          minWidth: "32px",
                          textAlign: "right",
                          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                        }}
                      >
                        {driver.iRatingChange > 0
                          ? "+"
                          : driver.iRatingChange < 0
                            ? "-"
                            : ""}
                        {Math.abs(Math.round(driver.iRatingChange))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      <style>{`
        @keyframes shine {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
