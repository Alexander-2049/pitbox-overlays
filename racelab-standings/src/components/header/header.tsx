import type { SessionRacing } from "../../types/Session";
import { formatCurrentTime } from "../../utils/formatters";
import styles from "./header.module.css";
import { Thermometer } from "lucide-react";
import type React from "react";

interface Props {
  session: SessionRacing;
  textColor?: string;
  fontSize?: number; // Changed to number
  isLightTheme?: boolean;
  heightPx?: number; // New prop for height in pixels
}

export const Header = ({
  session,
  textColor,
  fontSize,
  isLightTheme,
  heightPx,
}: Props) => {
  const themeClass = isLightTheme ? styles.lightTheme : "";

  return (
    <div
      className={`${styles.wrapper} ${themeClass}`}
      style={
        {
          color: textColor,
          fontSize: `${fontSize}px`,
          "--header-height": `${heightPx}px`,
        } as React.CSSProperties
      }
    >
      <div className={styles.sessionInfo}>
        {session.sessionType && (
          <div className={styles.sessionType}>{session.sessionType[0]}</div>
        )}
        {session.sessionType && (
          <div className={`${styles.verticalLine} ${themeClass}`} />
        )}
        {session.sessionCurrentTime !== undefined && (
          <div className={styles.currentTime}>
            {formatCurrentTime(session.sessionCurrentTime)}
            {session.sessionDuration !== undefined &&
              ` / ${formatCurrentTime(session.sessionDuration)}`}
          </div>
        )}
      </div>
      {session.driversRegistered !== undefined && (
        <div className={`${styles.driversRegistered} ${themeClass}`}>
          ({session.driversRegistered} drivers)
        </div>
      )}
      {session.temperature !== undefined && (
        <div className={styles.temperature}>
          {session.temperature}{" "}
          <Thermometer size={fontSize ? fontSize * 0.8 : 16} />
        </div>
      )}
    </div>
  );
};
