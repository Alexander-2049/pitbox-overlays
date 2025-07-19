import { generateColor } from "../../utils/formatters";
import styles from "./car-number.module.css";

interface Props {
  carNumber: number;
  carClassId?: number;
  fontSize?: number; // Changed to number
}

export const CarNumber = ({ carNumber, carClassId, fontSize }: Props) => {
  const backgroundColor = carClassId ? generateColor(carClassId) : "#ccc"; // Default grey if no class ID

  return (
    <div
      className={styles.carNumberWrapper}
      style={{ backgroundColor: backgroundColor, fontSize: `${fontSize}px` }}
    >
      #{carNumber}
    </div>
  );
};
