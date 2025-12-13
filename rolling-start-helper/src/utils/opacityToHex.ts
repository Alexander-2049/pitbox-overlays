export function opacityToHex(value: number): string {
  // clamp to [0, 1]
  const v = Math.min(1, Math.max(0, value));

  // convert to 0–255 and to hex
  const hex = Math.round(v * 255)
    .toString(16)
    .toUpperCase();

  // ensure 2 characters (pad with leading 0)
  return hex.padStart(2, "0");
}
