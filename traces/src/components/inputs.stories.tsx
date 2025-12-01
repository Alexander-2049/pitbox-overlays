import { Meta, StoryObj } from "@storybook/react";
import Inputs, { InputsProps } from "./inputs";
import { InputTraceProps } from "./input-traces";

// Mock input data
const mockInput: InputsProps["input"] & { isAbsActive?: boolean } = {
  throttle: 1,
  brake: 0.2,
  clutch: 0.1,
  steeringAnglePct: 0,
  isAbsActive: false,
};

const mockTraceSettings: InputTraceProps["settings"] = {
  includeThrottle: true,
  includeBrake: true,
  includeClutch: true,
  includeSteeringAngle: true,
};

const mockTraceColors: InputTraceProps["colors"] = {
  throttle: "#4caf50",
  brake: "#f44336",
  clutch: "#2196f3",
  steering: "#1e3a8a",
  brakeAbs: "#f7f200ff",
  background: "#202c44",
};

const meta: Meta<InputsProps> = {
  title: "Components/Inputs",
  component: Inputs,
  args: {
    input: mockInput,
    traceSettings: mockTraceSettings,
    colors: mockTraceColors,
    traceHistorySeconds: 5,
    style: { width: 380, height: 120, border: "1px solid #ccc" },
  },
};

export default meta;

type Story = StoryObj<InputsProps>;

export const Default: Story = {};

export const Recolored: Story = {
  args: {
    input: {
      throttle: 0,
      brake: 0.3,
      clutch: 0,
      steeringAnglePct: 0.1,
      isAbsActive: true,
    },
    colors: {
      throttle: "#3cff00ff",
      brake: "#ff4d00ff",
      brakeAbs: "#f799ffff",
    },
  },
};
