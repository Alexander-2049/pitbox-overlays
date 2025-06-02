import type { Meta, StoryObj } from "@storybook/react-vite";
import Leaderboard from "./Leaderboard";
import { Driver } from "../types/Driver";

const exampleDrivers: Driver[] = [
  {
    carId: 1,
    firstName: "Lewis",
    lastName: "Hamilton",
    position: 1,
    classPosition: 1,
    isCarOnTrack: true,
    iRating: 9000,
    iRatingChange: 25,
    carClassShortName: "GT3",
    iRacingLicString: "A",
    iRacingLicSubLevel: 3,
    isSelected: false,
  },
  {
    carId: 2,
    firstName: "Max",
    lastName: "Verstappen",
    position: 2,
    classPosition: 2,
    isCarOnTrack: true,
    iRating: 8700,
    iRatingChange: -10,
    carClassShortName: "GT3",
    iRacingLicString: "B",
    iRacingLicSubLevel: 2,
    isSelected: false,
  },
  {
    carId: 3,
    firstName: "Charles",
    lastName: "Leclerc",
    position: 3,
    classPosition: 3,
    isCarOnTrack: true,
    iRating: 8500,
    iRatingChange: 0,
    carClassShortName: "GT3",
    iRacingLicString: "C",
    iRacingLicSubLevel: 1,
    isSelected: false,
  },
  {
    carId: 4,
    firstName: "Lando",
    lastName: "Norris",
    position: 4,
    classPosition: 4,
    isCarOnTrack: true,
    iRating: 8000,
    iRatingChange: 12,
    carClassShortName: "GT3",
    iRacingLicString: "D",
    iRacingLicSubLevel: 0,
    isSelected: false,
  },
  {
    carId: 5,
    firstName: "Fernando",
    lastName: "Alonso",
    position: 5,
    classPosition: 5,
    isCarOnTrack: true,
    iRating: 7800,
    iRatingChange: -5,
    carClassShortName: "GT3",
    iRacingLicString: "R",
    iRacingLicSubLevel: 4,
    isSelected: true,
  },
  {
    carId: 6,
    firstName: "Sebastian",
    lastName: "Vettel",
    position: 6,
    classPosition: 6,
    isCarOnTrack: true,
    iRating: 7600,
    iRatingChange: 0,
    carClassShortName: "GT3",
    iRacingLicString: "A",
    iRacingLicSubLevel: 2,
    isSelected: false,
  },
  {
    carId: 12,
    firstName: "You",
    lastName: "Player",
    position: 7,
    classPosition: 7,
    isCarOnTrack: true,
    iRating: 7400,
    iRatingChange: 8,
    carClassShortName: "GT3",
    iRacingLicString: "B",
    iRacingLicSubLevel: 3,
    isSelected: false,
  },
  {
    carId: 8,
    firstName: "George",
    lastName: "Russell",
    position: 8,
    classPosition: 8,
    isCarOnTrack: true,
    iRating: 7200,
    iRatingChange: -3,
    carClassShortName: "GT3",
    iRacingLicString: "C",
    iRacingLicSubLevel: 1,
    isSelected: false,
  },
];

const meta: Meta<typeof Leaderboard> = {
  title: "Components/Leaderboard",
  component: Leaderboard,
  tags: ["autodocs"],
  argTypes: {
    backgroundOpacity: {
      control: { type: "range", min: 0, max: 1, step: 0.05 },
    },
    fontSize: { control: "object" },
    currentDriverCarId: { control: "number" },
  },
};

export default meta;

type Story = StoryObj<typeof Leaderboard>;

export const Default: Story = {
  args: {
    drivers: exampleDrivers,
    currentDriverCarId: 12,
  },
};

export const CustomFontSize: Story = {
  args: {
    drivers: exampleDrivers,
    currentDriverCarId: 12,
    fontSize: {
      position: "20px",
      driverName: "18px",
      safetyRating: "16px",
      iRating: "16px",
      iRatingChange: "15px",
    },
  },
};

export const LowOpacity: Story = {
  args: {
    drivers: exampleDrivers,
    currentDriverCarId: 12,
    backgroundOpacity: 0.2,
  },
};

export const CurrentDriverNearTop: Story = {
  args: {
    drivers: exampleDrivers,
    currentDriverCarId: 2,
  },
};

export const FewerDrivers: Story = {
  args: {
    drivers: exampleDrivers.slice(0, 5),
    currentDriverCarId: 3,
  },
};
