import type { Driver } from "./Driver" // Assuming Driver is defined in a separate file
import type { SessionRacing } from "./SessionRacing" // Assuming SessionRacing is defined in a separate file

export interface StandingsProps {
  drivers: Driver[]
  session: SessionRacing
  backgroundColor?: string
  backgroundOpacity?: number
  textColor?: string
  headerFontSize?: string
  groupHeaderFontSize?: string
  driverNameFontSize?: string
  positionFontSize?: string
  carNumberFontSize?: string
  iRatingFontSize?: string
  fastestLapFontSize?: string
  showTopNCount?: number // Renamed from topNCount
  selectedDriverHighlightColor?: string
  fastestLapHighlightColor?: string
  groupSeparatorColor?: string
  isLightTheme?: boolean // New prop for light theme
}
