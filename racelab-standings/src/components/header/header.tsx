import { SessionRacing } from "../../types/Session";
import styles from "./header.module.css";

interface Props {
  session: SessionRacing;
}

function formatCurrentTime(timeInSeconds: number) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export const Header = (props: Props) => {
  console.log(props);
  return (
    <div className={styles.wrapper}>
      <div className={styles.sessionType}>
        {props.session.sessionType ? props.session.sessionType[0] : "R"}
      </div>
      {props.session.sessionType && <div className={styles.verticalLine} />}
      {props.session.sessionCurrentTime && (
        <div className={styles.currentSessionTime}>
          {formatCurrentTime(props.session.sessionCurrentTime)}
          {props.session.sessionDuration &&
            ` / ${formatCurrentTime(props.session.sessionDuration)}`}
        </div>
      )}
    </div>
  );
};
