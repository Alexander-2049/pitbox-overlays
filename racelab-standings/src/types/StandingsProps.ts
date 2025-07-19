import type { Driver } from "./Driver";
import type { SessionRacing } from "./Session";

export interface StandingsProps {
  drivers: Driver[];
  session: SessionRacing;
  backgroundColor?: string;
  backgroundOpacity?: number;
  textColor?: string;
  headerFontSize?: number;
  groupHeaderFontSize?: number;
  driverNameFontSize?: number;
  positionFontSize?: number;
  carNumberFontSize?: number;
  iRatingFontSize?: number;
  fastestLapFontSize?: number;
  showTopNCount?: number;
  selectedDriverHighlightColor?: string;
  fastestLapHighlightColor?: string;
  groupSeparatorColor?: string;
  isLightTheme?: boolean;
  // New props for all constants, now as numbers
  headerHeightPx?: number;
  groupHeaderMinHeightPx?: number;
  groupHeaderMarginBottomPx?: number;
  groupSeparatorHeightPx?: number;
  groupSeparatorMarginVerticalPx?: number;
  driverRowMinHeightPx?: number;
  driverRowPaddingVerticalPx?: number;
  driverRowBorderBottomPx?: number;
  groupContainerPaddingPx?: number;
  driversSectionPaddingPx?: number;
  groupGapPx?: number;
}
