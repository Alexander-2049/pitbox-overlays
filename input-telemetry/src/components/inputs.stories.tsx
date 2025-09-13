import { Meta, StoryObj } from "@storybook/react";
import Inputs, { InputsProps } from "./inputs";
import { InputBarsProps } from "./input-bars";
import { InputTraceProps } from "./input-traces";

// Mock input data
const mockInput: InputBarsProps["input"] & { isAbsActive?: boolean } = {
  throttle: 0.7,
  brake: 0.2,
  clutch: 0.1,
  steeringAnglePct: 0,
  isAbsActive: false,
};

const mockBarsOrder: InputBarsProps["barsOrder"] = [
  "throttle.bar",
  "brake.bar",
];
const mockBarColors: InputBarsProps["colors"] = {
  throttle: "#4caf50",
  brake: "#f44336",
  clutch: "#2196f3",
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
    orientation: "horizontal",
    elementsOrder: ["traces", "bars"], // required/optional param from InputsProps
    style: { width: 380, height: 120, border: "1px solid #ccc" },
  },
};

export default meta;

type Story = StoryObj<InputsProps>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    style: { width: 800, height: 150, border: "1px solid #ccc" },
    elementsOrder: ["traces", "bars"], // ensure consistent with InputsProps
  },
};
