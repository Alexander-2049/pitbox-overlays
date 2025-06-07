import { Driver } from "../types/Driver";
import { SessionRacing } from "../types/Session";
import { Drivers } from "./drivers/drivers";
import { Header } from "./header";
import styles from "./Standings.module.css";

interface Props {
  drivers: Driver[];
  session: SessionRacing;
}

const Standings = (props: Props) => {
  console.log(props);
  return (
    <div className={styles.wrapper}>
      <Header session={props.session} />
      <Drivers drivers={props.drivers} />
    </div>
  );
};

export default Standings;
