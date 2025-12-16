interface Props {
  distanceMeters: number;
}

const DistanceFromLeaderToFinish = ({ distanceMeters }: Props) => {
  return <div style={{ fontSize: "100vh" }}>{distanceMeters}</div>;
};

export default DistanceFromLeaderToFinish;
