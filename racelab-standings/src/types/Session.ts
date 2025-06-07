import { SessionCurrentTime } from "./SessionCurrentTime";
import { SessionDuration } from "./SessionDuration";
import { SessionType } from "./SessionType";

export interface SessionRacing {
  sessionType?: SessionType;
  sessionCurrentTime?: SessionCurrentTime;
  sessionDuration?: SessionDuration;
}
