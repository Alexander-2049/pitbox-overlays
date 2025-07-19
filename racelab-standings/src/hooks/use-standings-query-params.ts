import { useMemo } from "react";
import type { StandingsProps } from "../types/StandingsProps";

// Define default values for props that can be controlled by query parameters
// These should match the defaults in src/components/standings.tsx
const DEFAULT_STANDINGS_PROPS = {
  backgroundOpacity: 0.7,
  headerFontSize: 13,
  groupHeaderFontSize: 13,
  driverNameFontSize: 13,
  positionFontSize: 13,
  carNumberFontSize: 13,
  iRatingFontSize: 13,
  fastestLapFontSize: 13,
  showTopNCount: 3,
  isLightTheme: false,
  headerHeightPx: 40,
  groupHeaderMinHeightPx: 20,
  groupHeaderMarginBottomPx: 8,
  // Removed groupSeparatorHeightPx: 1,
  // Removed groupSeparatorMarginVerticalPx: 4,
  driverRowMinHeightPx: 25,
  driverRowPaddingVerticalPx: 3,
  driverRowBorderBottomPx: 1,
  groupContainerPaddingPx: 10,
  driversSectionPaddingPx: 10,
  groupGapPx: 2,
  gapBetweenTopNAndRestPx: 10, // Default value for the new gap
  // For colors, the component handles defaults based on theme,
  // but for query params, we expect hex strings if provided.
  // If not provided, the component's internal logic will apply its defaults.
  backgroundColor: undefined, // Let component handle default based on theme
  textColor: undefined, // Let component handle default based on theme
  selectedDriverHighlightColor: undefined, // Let component handle default based on theme
  fastestLapHighlightColor: undefined, // Let component handle default based on theme
  groupSeparatorColor: undefined, // Let component handle default based on theme
};

type StandingsQueryParams = Omit<StandingsProps, "drivers" | "session">;

export const useStandingsQueryParams = (): StandingsQueryParams => {
  const queryParams = useMemo(() => {
    if (typeof window === "undefined") {
      return new URLSearchParams();
    }
    return new URLSearchParams(window.location.search);
  }, []);

  const getParam = (
    key: string,
    parser: (value: string) => any | undefined,
    defaultValue: any
  ): any => {
    const value = queryParams.get(key);
    if (value === null) {
      return defaultValue;
    }
    const parsed = parser(value);
    return parsed !== undefined ? parsed : defaultValue;
  };

  const parseNumber = (value: string): number | undefined => {
    const num = Number.parseFloat(value);
    return isNaN(num) ? undefined : num;
  };

  const parseBoolean = (value: string): boolean | undefined => {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
    return undefined;
  };

  const parseString = (value: string): string | undefined => {
    return value || undefined;
  };

  return {
    backgroundColor: getParam(
      "backgroundColor",
      parseString,
      DEFAULT_STANDINGS_PROPS.backgroundColor
    ),
    backgroundOpacity: getParam(
      "backgroundOpacity",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.backgroundOpacity
    ),
    textColor: getParam(
      "textColor",
      parseString,
      DEFAULT_STANDINGS_PROPS.textColor
    ),
    headerFontSize: getParam(
      "headerFontSize",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.headerFontSize
    ),
    groupHeaderFontSize: getParam(
      "groupHeaderFontSize",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.groupHeaderFontSize
    ),
    driverNameFontSize: getParam(
      "driverNameFontSize",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.driverNameFontSize
    ),
    positionFontSize: getParam(
      "positionFontSize",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.positionFontSize
    ),
    carNumberFontSize: getParam(
      "carNumberFontSize",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.carNumberFontSize
    ),
    iRatingFontSize: getParam(
      "iRatingFontSize",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.iRatingFontSize
    ),
    fastestLapFontSize: getParam(
      "fastestLapFontSize",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.fastestLapFontSize
    ),
    showTopNCount: getParam(
      "showTopNCount",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.showTopNCount
    ),
    selectedDriverHighlightColor: getParam(
      "selectedDriverHighlightColor",
      parseString,
      DEFAULT_STANDINGS_PROPS.selectedDriverHighlightColor
    ),
    fastestLapHighlightColor: getParam(
      "fastestLapHighlightColor",
      parseString,
      DEFAULT_STANDINGS_PROPS.fastestLapHighlightColor
    ),
    groupSeparatorColor: getParam(
      "groupSeparatorColor",
      parseString,
      DEFAULT_STANDINGS_PROPS.groupSeparatorColor
    ),
    isLightTheme: getParam(
      "isLightTheme",
      parseBoolean,
      DEFAULT_STANDINGS_PROPS.isLightTheme
    ),
    headerHeightPx: getParam(
      "headerHeightPx",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.headerHeightPx
    ),
    groupHeaderMinHeightPx: getParam(
      "groupHeaderMinHeightPx",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.groupHeaderMinHeightPx
    ),
    groupHeaderMarginBottomPx: getParam(
      "groupHeaderMarginBottomPx",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.groupHeaderMarginBottomPx
    ),
    // Removed groupSeparatorHeightPx: getParam(
    //   "groupSeparatorHeightPx",
    //   parseNumber,
    //   DEFAULT_STANDINGS_PROPS.groupSeparatorHeightPx,
    // ),
    // Removed groupSeparatorMarginVerticalPx: getParam(
    //   "groupSeparatorMarginVerticalPx",
    //   parseNumber,
    //   DEFAULT_STANDINGS_PROPS.groupSeparatorMarginVerticalPx,
    // ),
    driverRowMinHeightPx: getParam(
      "driverRowMinHeightPx",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.driverRowMinHeightPx
    ),
    driverRowPaddingVerticalPx: getParam(
      "driverRowPaddingVerticalPx",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.driverRowPaddingVerticalPx
    ),
    driverRowBorderBottomPx: getParam(
      "driverRowBorderBottomPx",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.driverRowBorderBottomPx
    ),
    groupContainerPaddingPx: getParam(
      "groupContainerPaddingPx",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.groupContainerPaddingPx
    ),
    driversSectionPaddingPx: getParam(
      "driversSectionPaddingPx",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.driversSectionPaddingPx
    ),
    groupGapPx: getParam(
      "groupGapPx",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.groupGapPx
    ),
    gapBetweenTopNAndRestPx: getParam(
      "gapBetweenTopNAndRestPx",
      parseNumber,
      DEFAULT_STANDINGS_PROPS.gapBetweenTopNAndRestPx
    ),
  };
};
