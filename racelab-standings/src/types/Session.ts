import type { SessionCurrentTime } from "./SessionCurrentTime"
import type { SessionDuration } from "./SessionDuration"
import type { SessionType } from "./SessionType"

export interface SessionRacing {
  sessionType?: SessionType
  sessionCurrentTime?: SessionCurrentTime
  sessionDuration?: SessionDuration
  temperature?: number // Added temperature
  driversRegistered?: number // Added driversRegistered
}
