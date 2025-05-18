import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const BASE_WIDTH = 396;
const BASE_HEIGHT = 108;

interface Props {
  speedKph: number;
  speedMph: number;
  displayUnits: "IMPERIAL" | "METRIC";
  gear: number;
  rpm: number;
  rpmStageFirst: number;
  rpmStageShift: number;
  rpmStageLast: number;
  rpmStageBlink: number;
  backgroundOpacity?: number;
  steeringPointPosition?: number | null;
}

const GT7OriginalTelemetry: React.FC<Props> = ({
  speedKph,
  speedMph,
  displayUnits,
  gear,
  rpm,
  rpmStageFirst,
  rpmStageShift,
  rpmStageLast,
  rpmStageBlink,
  backgroundOpacity = 0.4,
  steeringPointPosition = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coloredRpmBlocksAmount, setColoredRpmBlocksAmount] = useState(0);
  const [rpmBarColor, setRpmBarColor] = useState<string>("#fb0004");
  const [isBlinking, setIsBlinking] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  const rpmBackgroundBarColor = "#eeeeee";
  // in range 0 to 1/2 simply #fb0004 red without changing color
  // in range 1/2 to 1 start fading from #fb0004 red to #9c849d white/blue color
  // in above 1 blinking #69c3c2 (1/20 of a second is #69c3c2 and 1/20 is #eeeeee (rpmBackgroundBarColor))

  const speedUnit = displayUnits === "IMPERIAL" ? "mph" : "km/h";
  const speed = displayUnits === "IMPERIAL" ? speedMph : speedKph;

  // Calculate RPM percentage for the progress bar
  const calculateRpmPercentage = useCallback(() => {
    if (rpmStageFirst === 0 || rpmStageLast === 0) return 0;

    // Calculate normalized RPM percentage between first stage and shift stage
    const currentRpm = rpm;
    const rpmRange = rpmStageLast - rpmStageFirst;
    const rpmProgress = (currentRpm - rpmStageFirst) / rpmRange;

    return Math.max(0, Math.min(1, rpmProgress)) * 100;
  }, [rpm, rpmStageFirst, rpmStageLast]);

  useEffect(() => {
    const rpmPercentage = calculateRpmPercentage();
    setColoredRpmBlocksAmount(Math.floor(rpmPercentage));
  }, [rpm, rpmStageFirst, rpmStageShift, calculateRpmPercentage]);

  // Add this useEffect to handle the RPM color logic
  useEffect(() => {
    const rpmPercentage = calculateRpmPercentage() / 100;

    // Check if we're at or above the last stage (blinking threshold)
    if (rpm >= rpmStageBlink) {
      setIsBlinking(true);
    } else if (rpmPercentage <= 0.5) {
      // In range 0 to 1/2: Keep red
      setRpmBarColor("#fb0004");
      setIsBlinking(false);
    } else if (rpmPercentage <= 1) {
      // In range 1/2 to 1: Fade from red to white/blue
      // Calculate how far we are between 0.5 and 1 (0 to 1 range)
      const fadeProgress = (rpmPercentage - 0.5) * 2; // 0 at 0.5 RPM, 1 at 1.0 RPM

      // Interpolate between colors
      const startColor = { r: 251, g: 0, b: 4 }; // #fb0004
      const endColor = { r: 217, g: 196, b: 215 }; // #cf9ccd

      const r = Math.round(
        startColor.r + (endColor.r - startColor.r) * fadeProgress
      );
      const g = Math.round(
        startColor.g + (endColor.g - startColor.g) * fadeProgress
      );
      const b = Math.round(
        startColor.b + (endColor.b - startColor.b) * fadeProgress
      );

      setRpmBarColor(`rgb(${r}, ${g}, ${b})`);
      setIsBlinking(false);
    }
  }, [calculateRpmPercentage, rpm, rpmStageLast, rpmStageBlink]);

  // Add this useEffect for the blinking effect
  useEffect(() => {
    if (!isBlinking) return;

    // Blink between #69c3c2 and background color at 1/20 second intervals
    const blinkInterval = setInterval(() => {
      setRpmBarColor((prev) =>
        prev === "#69c3c2" ? rpmBackgroundBarColor : "#69c3c2"
      );
    }, 50); // 1/20 of a second = 50ms

    return () => clearInterval(blinkInterval);
  }, [isBlinking, rpmBackgroundBarColor]);

  // Example variable for text
  const speedText: string = Math.floor(speed).toString();
  const gearText: string = gear === 0 ? "N" : gear < 0 ? "R" : gear.toString();
  const speedUnitText: string = speedUnit;

  useEffect(() => {
    const font = new FontFace(
      "BunkenTechSansPro",
      "url(BunkenTechSansPro-Light.ttf) format('truetype')"
    );
    font.load().then((loadedFont) => {
      (document.fonts as FontFaceSet).add(loadedFont);
      setFontLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!fontLoaded) return;

    const draw = (
      ctx: CanvasRenderingContext2D,
      scale: number,
      offsetX: number,
      offsetY: number
    ) => {
      ctx.save();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.fillStyle = "#FFFFFF";

      const componentWidth = BASE_WIDTH;
      const componentHeight = BASE_HEIGHT;
      const backgroundWidth = BASE_WIDTH;
      const backgroundHeight = 95;
      const cutSize = backgroundHeight / 2.2;

      const curveTopPoint =
        componentHeight - backgroundHeight - backgroundHeight * 0.15;

      ctx.beginPath();
      ctx.moveTo(0, componentHeight - backgroundHeight * 0.87);
      ctx.quadraticCurveTo(
        componentWidth / 2,
        curveTopPoint,
        backgroundWidth,
        componentHeight - backgroundHeight * 0.87
      );
      ctx.lineTo(backgroundWidth, componentHeight - cutSize);
      ctx.lineTo(backgroundWidth - cutSize, componentHeight);
      ctx.lineTo(cutSize, componentHeight);
      ctx.lineTo(0, componentHeight - cutSize);
      ctx.closePath();

      ctx.fillStyle = "#000000";
      ctx.globalAlpha = backgroundOpacity;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Top line
      // Draw N blocks along the top curve, separated by a gap
      const numBlocks = 90; // Number of blocks (make this a prop or variable as needed)
      const gap = 1.5; // Gap between blocks in px (make this a prop or variable as needed)

      // Calculate the total length of the curve (approximate with straight line for simplicity)
      const startX = 0;
      const startY = componentHeight - backgroundHeight * 0.87;
      const endX = backgroundWidth;
      const endY = componentHeight - backgroundHeight * 0.87;
      const controlX = componentWidth / 2;
      const controlY = curveTopPoint;

      // Approximate curve length (for more accuracy, use curve length calculation)
      const curveLength = backgroundWidth;

      // Calculate block width
      const totalGap = gap * (numBlocks - 1);
      const blockWidth = (curveLength - totalGap) / numBlocks;

      // Helper to get point on quadratic curve at t
      const getQuadPoint = (t: number) => {
        const x =
          (1 - t) * (1 - t) * startX +
          2 * (1 - t) * t * controlX +
          t * t * endX;
        const y =
          (1 - t) * (1 - t) * startY +
          2 * (1 - t) * t * controlY +
          t * t * endY;
        return { x, y };
      };

      // Draw each block
      let currentLength = 0;
      for (let i = 0; i < numBlocks; i++) {
        const t0 = currentLength / curveLength;
        const t1 = (currentLength + blockWidth) / curveLength;

        const p0 = getQuadPoint(t0);
        const p1 = getQuadPoint(t1);

        // Bottom points for block (project vertically down to the same curve)
        // Instead of projecting vertically, use the same curve but offset down by a fixed amount
        const blockHeight = backgroundHeight / 6; // Adjust as needed
        const getBottomQuadPoint = (t: number) => {
          // Offset control point and endpoints downward by blockHeight
          const bx =
            (1 - t) * (1 - t) * startX +
            2 * (1 - t) * t * controlX +
            t * t * endX;
          const by =
            (1 - t) * (1 - t) * (startY + blockHeight) +
            2 * (1 - t) * t * (controlY + blockHeight) +
            t * t * (endY + blockHeight);
          return { x: bx, y: by };
        };
        const b0 = getBottomQuadPoint(t0);
        const b1 = getBottomQuadPoint(t1);

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(b0.x, b0.y);
        ctx.closePath();

        if (i < coloredRpmBlocksAmount) {
          ctx.fillStyle = rpmBarColor;
          ctx.globalAlpha = 1.0;
        } else {
          ctx.fillStyle = rpmBackgroundBarColor;
          ctx.globalAlpha = 0.3;
        }

        ctx.fill();
        ctx.globalAlpha = 1.0;

        currentLength += blockWidth + gap;
      }

      // Vertical line
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(
        BASE_WIDTH / 2 - BASE_WIDTH / 220 / 2, // X
        BASE_HEIGHT / 3, // Y
        BASE_WIDTH / 220, // W
        BASE_HEIGHT / 1.65 // H
      );

      // Draw centered text with custom font
      const drawText = ({
        text,
        fontSize,
        x,
        y,
        color = "#fff",
        opacity = 1,
      }: {
        text: string;
        fontSize: number;
        x: number;
        y: number;
        color?: string;
        opacity?: number;
      }) => {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(x, y);
        ctx.scale(1.65, 1); // Stretch horizontally by 30%
        ctx.font = `${fontSize}px BunkenTechSansPro`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = color;
        ctx.fillText(text, 0, 0);
        ctx.restore();
      };

      // Speed
      drawText({
        text: speedText,
        fontSize: BASE_HEIGHT / 3,
        x: BASE_WIDTH / 2.9,
        y: BASE_HEIGHT / 1.67,
      });

      // Gear
      drawText({
        text: gearText,
        fontSize: BASE_HEIGHT / 1.95,
        x: BASE_WIDTH - BASE_WIDTH / 2.7,
        y: BASE_HEIGHT / 1.45,
      });

      // Units
      drawText({
        text: speedUnitText,
        fontSize: BASE_HEIGHT / 12,
        x: BASE_WIDTH / 2.47,
        y: BASE_HEIGHT / 1.15,
        color: "#fbfbfb",
      });

      if (steeringPointPosition !== null) {
        const drawDotOnCurve = (
          position: number,
          color = "#fb0004",
          globalAlpha = 1
        ) => {
          const startX = 0;
          const startY =
            componentHeight - backgroundHeight * 0.87 - backgroundHeight * 0.07;
          const controlX = componentWidth / 2;
          const controlY = curveTopPoint - backgroundHeight * 0.07;
          const endX = backgroundWidth;
          const endY = startY;

          // Map position [-1, 1] to t in [0, 1]
          const t = (position + 1) / 2;

          // Quadratic Bézier interpolation
          const x =
            (1 - t) * (1 - t) * startX +
            2 * (1 - t) * t * controlX +
            t * t * endX;
          const y =
            (1 - t) * (1 - t) * startY +
            2 * (1 - t) * t * controlY +
            t * t * endY;

          // Draw the dot
          ctx.beginPath();
          ctx.arc(x, y, 2.6, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.globalAlpha = globalAlpha;
          ctx.fill();
        };

        drawDotOnCurve(0, "#ffffff", 0.6);
        drawDotOnCurve(steeringPointPosition);
      }
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const containerWidth = parent.clientWidth;
      const containerHeight = parent.clientHeight;

      const aspectRatio = BASE_WIDTH / BASE_HEIGHT;

      let drawWidth = containerWidth;
      let drawHeight = containerWidth / aspectRatio;

      if (drawHeight > containerHeight) {
        drawHeight = containerHeight;
        drawWidth = drawHeight * aspectRatio;
      }

      // Physically resize canvas to match calculated size
      canvas.width = drawWidth;
      canvas.height = drawHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const scale = drawWidth / BASE_WIDTH;
        const offsetX = 0; // center X if you want: (canvas.width - BASE_WIDTH * scale) / 2
        const offsetY = 0; // center Y if you want: (canvas.height - BASE_HEIGHT * scale) / 2
        draw(ctx, scale, offsetX, offsetY);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [
    coloredRpmBlocksAmount,
    fontLoaded,
    gearText,
    speedText,
    speedUnitText,
    rpmBarColor,
    backgroundOpacity,
    steeringPointPosition,
  ]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
};

export default GT7OriginalTelemetry;
