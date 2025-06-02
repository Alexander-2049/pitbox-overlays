import type React from "react";
import { Driver } from "../types/Driver";

interface Props {
  drivers: Driver[];
  currentDriverCarId?: number; // ID of the current player
  fontSize?: {
    position?: string;
    driverName?: string;
    safetyRating?: string;
    iRating?: string;
    iRatingChange?: string;
  };
  backgroundOpacity?: number;
}

const Leaderboard: React.FC<Props> = ({
  drivers,
  // fontSize = {
  //   position: "16px",
  //   driverName: "14px",
  //   safetyRating: "12px",
  //   iRating: "12px",
  //   iRatingChange: "11px",
  // },
  // backgroundOpacity = 0.7,
}) => {
  if (!drivers) return;
  const sortedDrivers = drivers
    .filter((driver) => driver.position !== undefined && driver.position > 0)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  if (sortedDrivers.length < 1) return;

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
        fontFamily: "sans-serif",
      }}
    >
      {sortedDrivers.map((driver) => {
        if (driver.carId) {
          return (
            <div
              key={`lb-row-${driver.carId}`}
              style={{
                height: "51px",
                width: "100%",
                display: "flex",
                gap: "3px",
                color: driver.isSelected ? "#111" : "#fff",
                fontWeight: driver.isSelected ? "bold" : "normal",
                boxShadow: driver.isSelected
                  ? "0 2px 8px 0 rgba(0,0,0,0.08)"
                  : undefined,
                transition: "background 0.2s,color 0.2s",
              }}
            >
              {/* Driver position number */}
              <div
                style={{
                  border: driver.isSelected
                    ? "3px solid rgba(255,255,255,0.3)"
                    : "3px solid rgba(64,64,64,0.5)",
                  width: "57px",
                  height: "100%",
                  boxSizing: "border-box",
                  fontWeight: "bold",
                  background: driver.isSelected
                    ? "rgba(255,255,255,0.65)"
                    : "rgba(0,0,0,0.65)",
                  color: driver.isSelected ? "#111" : "#fff",
                  flexShrink: "0",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
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
                    ? "rgba(255,255,255,0.65)"
                    : "rgba(0,0,0,0.38)",
                  boxSizing: "border-box",
                  paddingLeft: "11px",
                  paddingRight: "11px",
                  color: driver.isSelected ? "#111" : "#fff",
                  minWidth: "0", // Allow shrinking
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
                    minWidth: "0", // Allow shrinking
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                      flex: "1",
                      minWidth: "0", // Allow shrinking below content size
                      verticalAlign: "bottom",
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
                            ? "rgba(200,200,200,0.4)"
                            : "rgba(152,152,152,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: driver.isSelected ? "#111" : "#fff",
                        }}
                      >
                        {driver.iRacingLicString}
                      </div>
                    )}

                    {/* License level */}
                    {driver.iRacingLicSubLevel !== undefined && (
                      <div
                        style={{ color: driver.isSelected ? "#111" : "#fff" }}
                      >
                        {driver.iRacingLicSubLevel.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Driver rating */}
                  {/* iRating */}
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
          );
        }
      })}
    </div>
  );
};

export default Leaderboard;
