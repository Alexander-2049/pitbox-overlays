export interface Driver {
  carIdx: number
  carNumber: number // Added carNumber
  firstName: string
  lastName: string
  position: number
  classPosition: number
  isCarOnTrack: boolean
  middleName?: string // Optional
  iRating?: number // Optional
  iRatingChange?: number // Optional
  carClassId?: number // Optional
  carClassShortName?: string // Optional
  iRacingLicString?: string // Optional
  iRacingLicSubLevel?: number // Optional
  isSelected?: boolean // Optional
  fastestLap?: number // Optional
}
