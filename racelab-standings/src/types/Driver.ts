export interface Driver {
  carIdx: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  position: number;
  classPosition: number;
  isCarOnTrack: boolean;
  iRating?: number;
  iRatingChange?: number;
  carClassId?: number;
  carClassShortName?: string;
  iRacingLicString?: string;
  iRacingLicSubLevel?: number;
  isSelected?: boolean;
  fastestLap?: number;
}
