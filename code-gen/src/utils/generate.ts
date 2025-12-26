export interface Field {
  name: string; // "realtime.throttle", "drivers[].lapDistPct"
  type: "number" | "string" | "boolean" | "enum";
  enumValues?: readonly (string | number | boolean)[];
  optional?: boolean;
}

type ParsedField = {
  raw: Field;
  root: string;
  isArray: boolean;
  path: string;
  tsType: string;
};

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

function parseField(field: Field): ParsedField {
  const isArray = field.name.includes("[]");
  const clean = field.name.replace("[]", "");
  const [root, path] = clean.split(".");

  let tsType: string = field.type;
  if (field.type === "enum" && field.enumValues) {
    tsType = field.enumValues.map((v) => JSON.stringify(v)).join(" | ");
  }

  return {
    raw: field,
    root,
    isArray,
    path,
    tsType,
  };
}

export function generateReactHook(fields: Field[]) {
  const parsed = fields.map(parseField);

  // ---------- GROUP ----------
  const grouped = parsed.reduce<Record<string, ParsedField[]>>((acc, f) => {
    (acc[f.root] ??= []).push(f);
    return acc;
  }, {});

  // ---------- PARAMS ----------
  const params = fields.map((f) => `"${f.name}"`).join(",\n      ");

  // ---------- TYPES ----------
  const typeBlocks: string[] = [];

  for (const [root, items] of Object.entries(grouped)) {
    if (items[0].isArray) {
      typeBlocks.push(`
type ${capitalize(root)}Data = {
${items.map((f) => `  ${f.path}: ${f.tsType};`).join("\n")}
};
`);
    } else {
      typeBlocks.push(`
type ${capitalize(root)}Data = {
${items
  .map(
    (f) => `  ${f.path}: ${f.raw.optional ? `${f.tsType} | null` : f.tsType};`
  )
  .join("\n")}
};
`);
    }
  }

  typeBlocks.push(`
export type GameData = {
${Object.entries(grouped)
  .map(([root, items]) =>
    items[0].isArray
      ? `  ${root}: ${capitalize(root)}Data[];`
      : `  ${root}: ${capitalize(root)}Data;`
  )
  .join("\n")}
};
`);

  // ---------- VALIDATOR ----------
  const v: string[] = [];

  v.push(`
function validateGameData(raw: Record<string, unknown>): GameData | null {
  try {
`);

  // ----- NON-ARRAY ROOTS -----
  for (const [root, items] of Object.entries(grouped)) {
    if (items[0].isArray) continue;

    v.push(`
    // --- ${root} ---
`);

    for (const f of items) {
      if (f.raw.type === "enum" && f.raw.enumValues) {
        const checks = f.raw.enumValues
          .map((v) => `${root}_${f.path}Raw === ${JSON.stringify(v)}`)
          .join(" || ");

        v.push(`
    const ${root}_${f.path}Raw = raw["${f.raw.name}"];
    const ${root}_${f.path} =
      typeof ${root}_${f.path}Raw === "string" &&
      (${checks})
        ? ${root}_${f.path}Raw
        : null;
`);
      } else {
        v.push(`
    const ${root}_${f.path} =
      typeof raw["${f.raw.name}"] === "${f.raw.type}"
        ? raw["${f.raw.name}"]
        : null;
`);
      }
    }

    const requiredChecks = items
      .filter((f) => !f.raw.optional)
      .map((f) => `${root}_${f.path} === null`)
      .join(" || ");

    if (requiredChecks) {
      v.push(`
    if (${requiredChecks}) return null;
`);
    }

    v.push(`
    const ${root}: ${capitalize(root)}Data = {
${items.map((f) => `      ${f.path}: ${root}_${f.path},`).join("\n")}
    };
`);
  }

  // ----- ARRAY ROOTS -----
  for (const [root, items] of Object.entries(grouped)) {
    if (!items[0].isArray) continue;

    v.push(`
    // --- ${root}[] ---
`);

    for (const f of items) {
      v.push(`
    const ${f.path}Arr = raw["${f.raw.name}"];
    if (!Array.isArray(${f.path}Arr)) return null;
`);
    }

    const baseLen = `${items[0].path}Arr.length`;
    const lenChecks = items
      .slice(1)
      .map((f) => `${baseLen} !== ${f.path}Arr.length`)
      .join(" || ");

    if (lenChecks) {
      v.push(`
    if (${lenChecks}) return null;
`);
    }

    v.push(`
    const ${root}: ${capitalize(root)}Data[] = [];

    for (let i = 0; i < ${baseLen}; i++) {
`);

    for (const f of items) {
      if (f.raw.type === "enum" && f.raw.enumValues) {
        const checks = f.raw.enumValues
          .map((v) => `${f.path} === ${JSON.stringify(v)}`)
          .join(" || ");

        v.push(`
      const ${f.path} = ${f.path}Arr[i];
      if (
        typeof ${f.path} !== "string" ||
        !(${checks})
      ) continue;
`);
      } else {
        v.push(`
      const ${f.path} = ${f.path}Arr[i];
      if (typeof ${f.path} !== "${f.raw.type}") continue;
`);
      }
    }

    v.push(`
      ${root}.push({
${items.map((f) => `        ${f.path},`).join("\n")}
      });
    }

    if (${root}.length === 0) return null;
`);
  }

  v.push(`
    return {
${Object.keys(grouped)
  .map((r) => `      ${r},`)
  .join("\n")}
    };
  } catch {
    return null;
  }
}
`);

  // ---------- RESULT ----------
  return `
/**
 * @generated
 */

import { useEffect, useMemo, useRef, useState } from "react";

// --- Types ---
${typeBlocks.join("\n")}

// --- Validator ---
${v.join("\n")}

// --- Hook ---
const useGameData = () => {
  const url = "ws://localhost:42049";

  const params = useMemo(
    () => [
      ${params}
    ],
    []
  );

  const isPreview = useMemo(() => {
    const p = new URLSearchParams(window.location.search).get("preview");
    return p === "" || p === "true";
  }, []);

  const [data, setData] = useState<GameData | null>(null);

  const accumulatedRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    const ws = new WebSocket(
      \`\${url}?preview=\${isPreview ? "true" : "false"}&q=\${params.join(",")}\`
    );

    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.success && msg.data) {
        accumulatedRef.current = {
          ...accumulatedRef.current,
          ...Object.fromEntries(msg.data),
        };
        setData(validateGameData(accumulatedRef.current));
      }
    };

    return () => ws.close();
  }, [params, isPreview]);

  return { data };
};

export default useGameData;
`;
}
