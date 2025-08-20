import { Meta, StoryObj } from "@storybook/react";
import Inputs, { InputsProps } from "./inputs";
import { InputBarsProps } from "./input-bars";
import { InputTraceProps } from "./input-traces";

// filepath: c:/Users/Alexander/Desktop/Development/pitbox-overlays/input-telemetry/src/components/inputs.stories.tsx

// Mock input data
const mockInput: InputBarsProps["input"] = {
  throttle: 0.7,
  brake: 0.2,
  clutch: 0.1,
  steeringAnglePct: 0.5,
  isAbsActive: false,
};

const mockBarsOrder: InputBarsProps["barsOrder"] = [
  "throttle",
  "brake",
  "clutch",
  "abs",
];
const mockBarColors = {
  throttle: "#4caf50",
  brake: "#f44336",
  clutch: "#2196f3",
  steering: "#ff9800",
};

const mockTraceSettings: InputTraceProps["settings"] = {
  includeThrottle: true,
  includeBrake: true,
  includeClutch: true,
  includeSteeringAngle: true,
};

const mockTraceColors = {
  throttle: "#4caf50",
  brake: "#f44336",
  clutch: "#2196f3",
  steering: "#ff9800",
};

const meta: Meta<InputsProps> = {
  title: "Components/Inputs",
  component: Inputs,
  args: {
    input: mockInput,
    barsOrder: mockBarsOrder,
    barColors: mockBarColors,
    traceSettings: mockTraceSettings,
    traceColors: mockTraceColors,
    traceHistorySeconds: 5,
    orientation: "vertical",
    style: { width: 400, height: 300, border: "1px solid #ccc" },
    tracesFirst: true,
  },
};

export default meta;

type Story = StoryObj<InputsProps>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    style: { width: 800, height: 150, border: "1px solid #ccc" },
  },
};
