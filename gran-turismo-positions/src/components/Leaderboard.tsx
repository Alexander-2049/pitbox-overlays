import type React from "react";

export interface Driver {
  carId?: number;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  position?: number;
  classPosition?: number;
  isCarOnTrack?: boolean;
  iRating?: number;
  iRatingChange?: number;
  carClassShortName?: string;
  iRacingLicString?: string;
  iRacingLicSubLevel?: number;
  spectateCarId?: number;
}

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
          const isCurrent = driver.carId === driver.spectateCarId;
          return (
            <div
              key={`lb-row-${driver.carId}`}
              style={{
                height: "51px",
                width: "100%",
                display: "flex",
                gap: "3px",
                background: isCurrent ? "rgba(255,255,255,0.9)" : undefined,
                color: isCurrent ? "#111" : "#fff",
                fontWeight: isCurrent ? "bold" : "normal",
                boxShadow: isCurrent
                  ? "0 2px 8px 0 rgba(0,0,0,0.08)"
                  : undefined,
                transition: "background 0.2s,color 0.2s",
              }}
            >
              {/* Driver position number */}
              <div
                style={{
                  border: isCurrent
                    ? "3px solid rgba(255,255,255,0.3)"
                    : "3px solid rgba(64,64,64,0.5)",
                  width: "57px",
                  height: "100%",
                  boxSizing: "border-box",
                  fontWeight: "bold",
                  background: isCurrent
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(0,0,0,0.65)",
                  color: isCurrent ? "#111" : "#fff",
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
                  background: isCurrent
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(0,0,0,0.38)",
                  boxSizing: "border-box",
                  paddingLeft: "11px",
                  paddingRight: "11px",
                  color: isCurrent ? "#111" : "#fff",
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
                  }}
                >
                  {driver.firstName?.[0] || ""}
                  {driver.firstName?.[0] && ". "}
                  {driver.lastName}
                </div>

                {/* Driver stats */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                    fontSize: "18px",
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
                          background: isCurrent
                            ? "rgba(200,200,200,0.4)"
                            : "rgba(152,152,152,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isCurrent ? "#111" : "#fff",
                        }}
                      >
                        {driver.iRacingLicString}
                      </div>
                    )}

                    {/* License level */}
                    {driver.iRacingLicSubLevel !== undefined && (
                      <div style={{ color: isCurrent ? "#111" : "#fff" }}>
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
                        color: isCurrent ? "#111" : "#fff",
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
                                : isCurrent
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

// const Leaderboard: React.FC<Props> = ({
//   drivers,
//   currentDriverCarId = 12,
//   fontSize = {
//     position: "16px",
//     driverName: "14px",
//     safetyRating: "12px",
//     iRating: "12px",
//     iRatingChange: "11px",
//   },
//   backgroundOpacity = 0.7,
// }) => {
//   // License class colors
//   const getLicenseColor = (licString?: string): string => {
//     switch (licString?.toUpperCase()) {
//       case "P":
//       case "PRO":
//         return "#FF6B00"; // Orange
//       case "A":
//         return "#0066FF"; // Blue
//       case "B":
//         return "#00AA00"; // Green
//       case "C":
//         return "#FFAA00"; // Yellow
//       case "D":
//         return "#FF4444"; // Red
//       case "R":
//       case "ROOKIE":
//         return "#888888"; // Gray
//       default:
//         return "#FFFFFF";
//     }
//   };

//   // Sort drivers by position
//   const sortedDrivers = [...drivers].sort(
//     (a, b) => (a.position || 0) - (b.position || 0)
//   );

//   // Find current driver
//   const currentDriverIndex = sortedDrivers.findIndex(
//     (d) => d.spectateCarId === currentDriverCarId
//   );

//   // Get top 3 drivers
//   const top3Drivers = sortedDrivers.slice(0, 3);

//   // Get drivers around current player (2 above, current, 2 below)
//   const contextDrivers = [];
//   if (currentDriverIndex >= 0 && currentDriverIndex > 2) {
//     // Current driver found and not in top 3
//     const start = Math.max(3, currentDriverIndex - 2);
//     const end = Math.min(sortedDrivers.length, currentDriverIndex + 3);
//     contextDrivers.push(...sortedDrivers.slice(start, end));
//   } else {
//     // Current driver not found or in top 3, show drivers 4-8
//     const remainingDrivers = sortedDrivers.slice(
//       3,
//       Math.min(sortedDrivers.length, 8)
//     );
//     contextDrivers.push(...remainingDrivers);
//   }

//   // Format safety rating with decimal
//   const formatSafetyRating = (licString?: string, subLevel?: number) => {
//     if (!licString) return "D 1.0";

//     // Convert sublevel to decimal format (assuming 0-4 range maps to 0.0-4.99)
//     const decimalValue =
//       subLevel !== undefined
//         ? (subLevel + Math.random() * 0.99).toFixed(2)
//         : "1.00";
//     return `${licString} ${decimalValue}`;
//   };

//   const renderDriver = (driver: Driver, _: number, isHighlighted = false) => {
//     const displayName =
//       `${driver.firstName || ""} ${driver.lastName || ""}`.trim() ||
//       `Driver ${driver.carId}`;
//     const safetyRating = formatSafetyRating(
//       driver.iRacingLicString,
//       driver.iRacingLicSubLevel
//     );

//     return (
//       <div
//         key={`${driver.carId}-${driver.position}`}
//         style={{
//           display: "flex",
//           alignItems: "center",
//           padding: "8px 12px",
//           marginBottom: "2px",
//           backgroundColor: isHighlighted
//             ? `rgba(220, 38, 38, ${backgroundOpacity + 0.1})`
//             : `rgba(0, 0, 0, ${backgroundOpacity})`,
//           border: isHighlighted
//             ? "2px solid #DC2626"
//             : "1px solid rgba(255, 255, 255, 0.1)",
//           borderRadius: "4px",
//           color: "#FFFFFF",
//           fontSize: fontSize.driverName,
//           fontWeight: "500",
//           fontFamily: "Arial, sans-serif",
//           minHeight: "40px",
//         }}
//       >
//         {/* Position */}
//         <div
//           style={{
//             width: "30px",
//             textAlign: "center",
//             fontSize: fontSize.position,
//             fontWeight: "bold",
//             color:
//               driver.position && driver.position <= 3 ? "#FFD700" : "#FFFFFF",
//           }}
//         >
//           {driver.position}
//         </div>
//         {/* Driver Name */}
//         <div
//           style={{
//             flex: 1,
//             marginLeft: "12px",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             whiteSpace: "nowrap",
//             fontSize: fontSize.driverName,
//           }}
//         >
//           {displayName}
//         </div>
//         {/* Safety Rating */}
//         <div
//           style={{
//             marginLeft: "8px",
//             padding: "2px 8px",
//             backgroundColor: getLicenseColor(driver.iRacingLicString),
//             borderRadius: "3px",
//             fontSize: fontSize.safetyRating,
//             fontWeight: "bold",
//             color: "#000000",
//             minWidth: "70px",
//             textAlign: "center",
//           }}
//         >
//           {safetyRating}
//         </div>
//         {/* iRating */}
//         <div
//           style={{
//             marginLeft: "8px",
//             fontSize: fontSize.iRating,
//             color: "#CCCCCC",
//             minWidth: "40px",
//             textAlign: "right",
//           }}
//         >
//           {driver.iRating || 1200}
//         </div>
//         {driver.iRatingChange !== undefined && driver.iRatingChange !== 0 && (
//           <div
//             style={{
//               marginLeft: "4px",
//               fontSize: fontSize.iRatingChange,
//               color: driver.iRatingChange > 0 ? "#00FF00" : "#FF4444",
//               fontWeight: "bold",
//               minWidth: "50px",
//               textAlign: "right",
//             }}
//           >
//             {driver.iRatingChange > 0 ? "+" : ""}
//             {Math.round(driver.iRatingChange)}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: "100vh",
//         padding: "16px",
//         backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
//         boxSizing: "border-box",
//         fontFamily: "Arial, sans-serif",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       {/* Top 3 Drivers */}
//       <div style={{ marginBottom: "12px" }}>
//         {top3Drivers.map((driver, index) => renderDriver(driver, index))}
//       </div>

//       {/* Horizontal divider */}
//       <div
//         style={{
//           height: "2px",
//           backgroundColor: "rgba(255, 255, 255, 0.3)",
//           margin: "12px 0",
//         }}
//       />

//       {/* Context Drivers (around current player) */}
//       <div>
//         {contextDrivers.map((driver, index) => {
//           const isCurrentPlayer = driver.spectateCarId === currentDriverCarId;
//           return renderDriver(driver, index + 3, isCurrentPlayer);
//         })}
//       </div>
//     </div>
//   );
// };

export default Leaderboard;
