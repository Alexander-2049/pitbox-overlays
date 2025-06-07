import { Driver } from "../../types/Driver";

interface Props {
  drivers: Driver[];
}

export const Drivers = (props: Props) => {
  console.log(props);
  return <div>Test</div>;
};
