import "./index.css";
import Standings from "./components/standings";
import { useStandingsQueryParams } from "./hooks/use-standings-query-params";
import type { Driver } from "./types/Driver";
import type { SessionRacing } from "./types/Session";

// Placeholder data for drivers and session, as they will be handled by another hook later.
// This ensures the Standings component can render even without live data.
const exampleDrivers: Driver[] = [
  {
    carIdx: 1,
    carNumber: 34,
    firstName: "Matthew",
    lastName: "Naylor",
    position: 1,
    classPosition: 1,
    isCarOnTrack: true,
    iRating: 1800,
    carClassShortName: "GT3",
    carClassId: 101,
    isSelected: false,
    fastestLap: 98.021, // 01:38.021
  },
  {
    carIdx: 2,
    carNumber: 1,
    firstName: "Sindre",
    lastName: "Setsaas",
    position: 2,
    classPosition: 2,
    isCarOnTrack: true,
    iRating: 8000,
    carClassShortName: "GT3",
    carClassId: 101,
    isSelected: false,
    fastestLap: 98.635, // 01:38.635
  },
  {
    carIdx: 3,
    carNumber: 4,
    firstName: "Samuel",
    lastName: "Libeert",
    position: 3,
    classPosition: 3,
    isCarOnTrack: true,
    iRating: 6800,
    carClassShortName: "GT3",
    carClassId: 101,
    isSelected: false,
    fastestLap: 99.281, // 01:39.281
  },
  {
    carIdx: 4,
    carNumber: 6,
    firstName: "Antti",
    lastName: "Terho",
    position: 4,
    classPosition: 4,
    isCarOnTrack: true,
    iRating: 6400,
    carClassShortName: "GT3",
    carClassId: 101,
    isSelected: false,
    fastestLap: 99.209, // 01:39.209
  },
  {
    carIdx: 5,
    carNumber: 7,
    firstName: "Fernando",
    lastName: "Alonso",
    position: 5,
    classPosition: 5,
    isCarOnTrack: true,
    iRating: 7800,
    carClassShortName: "GT3",
    carClassId: 101,
    isSelected: false,
    fastestLap: 100.0,
  },
  {
    carIdx: 6,
    carNumber: 10,
    firstName: "Sebastian",
    lastName: "Vettel",
    position: 6,
    classPosition: 6,
    isCarOnTrack: true,
    iRating: 7600,
    carClassShortName: "GT3",
    carClassId: 101,
    isSelected: false,
    fastestLap: 101.0,
  },

  // GT4 class
  {
    carIdx: 7,
    carNumber: 7,
    firstName: "Renan",
    lastName: "Azeredo",
    position: 7,
    classPosition: 1,
    isCarOnTrack: true,
    iRating: 6300,
    carClassShortName: "GT4",
    carClassId: 202,
    isSelected: false,
    fastestLap: 102.198, // 01:42.198
  },
  {
    carIdx: 8,
    carNumber: 5,
    firstName: "Marco",
    lastName: "Acunto",
    position: 8,
    classPosition: 2,
    isCarOnTrack: true,
    iRating: 6600,
    carClassShortName: "GT4",
    carClassId: 202,
    isSelected: false,
    fastestLap: 102.089, // 01:42.089 (fastest in this group)
  },
  {
    carIdx: 9,
    carNumber: 17,
    firstName: "Fabian",
    lastName: "Seischegg",
    position: 9,
    classPosition: 3,
    isCarOnTrack: true,
    iRating: 4400,
    carClassShortName: "GT4",
    carClassId: 202,
    isSelected: false,
    fastestLap: 102.702, // 01:42.702
  },
  {
    carIdx: 10,
    carNumber: 13,
    firstName: "Adaildo",
    lastName: "Vieira",
    position: 10,
    classPosition: 4, // Corrected class position
    isCarOnTrack: true,
    iRating: 5200,
    carClassShortName: "GT4",
    carClassId: 202,
    isSelected: false,
    fastestLap: 102.278, // 01:42.278
  },
  {
    carIdx: 11,
    carNumber: 27,
    firstName: "Neil",
    lastName: "Cooper",
    position: 11,
    classPosition: 5, // Corrected class position
    isCarOnTrack: true,
    iRating: 2500,
    carClassShortName: "GT4",
    carClassId: 202,
    isSelected: false,
    fastestLap: 104.002, // 01:44.002
  },
  {
    carIdx: 12,
    carNumber: 32,
    firstName: "Rick",
    lastName: "Zieten",
    position: 12,
    classPosition: 6, // Corrected class position
    isCarOnTrack: true,
    iRating: 1900,
    carClassShortName: "GT4",
    carClassId: 202,
    isSelected: false,
    fastestLap: 104.059, // 01:44.059
  },
  {
    carIdx: 13,
    carNumber: 30,
    firstName: "Istvan",
    lastName: "Fodor",
    position: 13,
    classPosition: 7, // Corrected class position
    isCarOnTrack: true,
    iRating: 2200,
    carClassShortName: "GT4",
    carClassId: 202,
    isSelected: true, // This driver is selected
    fastestLap: 105.035, // 01:45.035
  },
  {
    carIdx: 14,
    carNumber: 36,
    firstName: "Alexandr",
    lastName: "Fescov",
    position: 14,
    classPosition: 8, // Corrected class position
    isCarOnTrack: true,
    iRating: 1700,
    carClassShortName: "GT4",
    carClassId: 202,
    isSelected: false,
    fastestLap: 105.482, // 01:45.482
  },
  {
    carIdx: 15,
    carNumber: 33,
    firstName: "Marius",
    lastName: "Rieck",
    position: 15,
    classPosition: 9, // Corrected class position
    isCarOnTrack: true,
    iRating: 1900,
    carClassShortName: "GT4",
    carClassId: 202,
    isSelected: false,
    fastestLap: 104.754, // 01:44.754
  },
  {
    carIdx: 16,
    carNumber: 28,
    firstName: "Preston",
    lastName: "Perlmutter",
    position: 16,
    classPosition: 10, // Corrected class position
    isCarOnTrack: true,
    iRating: 2400,
    carClassShortName: "GT4",
    carClassId: 202,
    isSelected: false,
    fastestLap: 103.111, // 01:43.111
  },
  // LMP class
  {
    carIdx: 17,
    carNumber: 99,
    firstName: "Max",
    lastName: "Verstappen",
    position: 17,
    classPosition: 1,
    isCarOnTrack: true,
    iRating: 9000,
    carClassShortName: "LMP",
    carClassId: 303,
    isSelected: false,
    fastestLap: 90.0, // 01:30.000
  },
  {
    carIdx: 18,
    carNumber: 23,
    firstName: "Lewis",
    lastName: "Hamilton",
    position: 18,
    classPosition: 2,
    isCarOnTrack: true,
    iRating: 8800,
    carClassShortName: "LMP",
    carClassId: 303,
    isSelected: false,
    fastestLap: 90.5, // 01:30.500
  },
  {
    carIdx: 19,
    carNumber: 11,
    firstName: "Charles",
    lastName: "Leclerc",
    position: 19,
    classPosition: 3,
    isCarOnTrack: true,
    iRating: 8700,
    carClassShortName: "LMP",
    carClassId: 303,
    isSelected: false,
    fastestLap: 91.0, // 01:31.000
  },
  {
    carIdx: 20,
    carNumber: 44,
    firstName: "George",
    lastName: "Russell",
    position: 20,
    classPosition: 4,
    isCarOnTrack: true,
    iRating: 8500,
    carClassShortName: "LMP",
    carClassId: 303,
    isSelected: false,
    fastestLap: 91.5, // 01:31.500
  },
  {
    carIdx: 21,
    carNumber: 16,
    firstName: "Carlos",
    lastName: "Sainz",
    position: 21,
    classPosition: 5,
    isCarOnTrack: true,
    iRating: 8400,
    carClassShortName: "LMP",
    carClassId: 303,
    isSelected: false,
    fastestLap: 92.0, // 01:32.000
  },
  {
    carIdx: 22,
    carNumber: 55,
    firstName: "Sergio",
    lastName: "Perez",
    position: 22,
    classPosition: 6,
    isCarOnTrack: true,
    iRating: 8300,
    carClassShortName: "LMP",
    carClassId: 303,
    isSelected: false,
    fastestLap: 92.5, // 01:32.500
  },
];

const sessionExample: SessionRacing = {
  sessionCurrentTime: 124, // 00:02:04
  sessionDuration: 2700, // 00:45:00
  sessionType: "RACE",
  temperature: 36, // Added temperature
  driversRegistered: 20, // Added driversRegistered
};

const App = () => {
  const standingsProps = useStandingsQueryParams();

  return (
    <Standings
      drivers={exampleDrivers} // Placeholder, will be replaced by another hook
      session={sessionExample} // Placeholder, will be replaced by another hook
      {...standingsProps}
    />
  );
};

export default App;
