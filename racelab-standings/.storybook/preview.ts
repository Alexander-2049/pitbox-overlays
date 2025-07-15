import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "Dark",
      values: [
        { name: "Dark", value: "#333" },
        { name: "Light", value: "#F7F9F2" },
        { name: "Maroon", value: "#400" },
        { name: "Gray", value: "#888" },
        { name: "White", value: "#fff" },
      ],
    },
    layout: "fullscreen",
  },
};

export default preview;
