"use client";
import { useEffect, useState } from "react";

const levels = 7;
const triangleSize = 40;
const halfTriangleSize = triangleSize / 2;
const height = halfTriangleSize * Math.sqrt(3);

type TriangleProps = {
  up: boolean;
  x: number;
  y: number;
  color: string;
  onClick: () => void;
};

const downPoints = (x = 0, y = 0) =>
  `${x},${y} ${x + halfTriangleSize},${y + height} ${x - halfTriangleSize},${
    y + height
  }`;
const upPoints = (x = 0, y = 0) =>
  `${x - halfTriangleSize},${y} ${x + halfTriangleSize},${y} ${x},${
    y + height
  }`;

function Triangle({ up, x, y, color, onClick }: TriangleProps) {
  return (
    <polygon
      points={up ? upPoints(x, y) : downPoints(x, y)}
      fill={color || "lightgray"}
      onClick={onClick}
      style={{ cursor: "pointer" }}
      stroke="white"
      strokeWidth={2}
      strokeLinejoin="round"
    />
  );
}

const generateHexagon = () => ({
  slices: Array.from({ length: 6 }).map(() => ({
    levels: Array.from({ length: levels }).map((_, level) => ({
      tiles: Array.from({ length: level * 2 + 1 }).map(() => ""),
    })),
  })),
});

type Hexagon = ReturnType<typeof generateHexagon>;

const getHexagon = () => {
  const hexagon =
    typeof localStorage === "undefined"
      ? null
      : localStorage.getItem("hexagon");
  return hexagon ? (JSON.parse(hexagon) as Hexagon) : generateHexagon();
};

const COLORS = {
  GOLD: "#edbe62",
  BLACK: "#4a4246",
  WHITE: "#f0e6da",
};

export default function Home() {
  const availableColors = [
    [COLORS.GOLD, COLORS.BLACK],
    [COLORS.BLACK, COLORS.WHITE],
    [COLORS.WHITE, COLORS.BLACK],
  ];
  const [currentColor, setCurrentColor] = useState(availableColors[0][0]);
  const [symmetryMode, setSymmetryMode] = useState(false);
  const [hexagon, setHexagon] = useState<Hexagon>({ slices: [] });

  // save to local storage
  useEffect(() => {
    if (!hexagon.slices.length) return;
    localStorage.setItem("hexagon", JSON.stringify(hexagon));
  }, [hexagon]);

  useEffect(() => {
    setHexagon(getHexagon());
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-12">
      <h1 className="text-3xl font-bold text-center tracking-tight leading-10">
        tile designer
      </h1>
      <p>
        for kiwico&apos;s{" "}
        <a
          style={{
            textDecoration: "underline",
            textDecorationColor: COLORS.GOLD,
          }}
          href="https://www.kiwico.com/us/store/dp/geometric-tiled-tray-project-kit/3854"
          target="_blank"
        >
          geometric tiled tray
        </a>{" "}
        kit
      </p>
      {/* color chooser */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center gap-1">
          <div>mirror mode:</div>
          <button
            onClick={() => setSymmetryMode((s) => !s)}
            className={`w-14 h-8 rounded-full border-2 border-grey shadow`}
          >
            {symmetryMode ? "ON" : "OFF"}
          </button>
        </div>
        {availableColors.map((color) => (
          <button
            key={color[0]}
            onClick={() => setCurrentColor(color[0])}
            className={`w-14 h-8 rounded-full transition-all ${
              color[0] === currentColor ? "border-2 shadow-lg" : "scale-75 hover:scale-90"
            } drop-shadow-sm decoration-white`}
            style={{
              backgroundColor: color[0],
              color: color[1],
              borderColor: color[1],
            }}
          >
            {
              //  count all colors
              hexagon.slices
                .map((s) => s.levels.map((l) => l.tiles))
                .flat(3)
                .filter((tile) => tile === color[0]).length
            }
          </button>
        ))}
      </div>
      <div className="max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -250 600 500">
          <g id="hexagon">
            {hexagon.slices.map((slice, i) => {
              return (
                <g key={`slice-${i}`} transform={`rotate(${i * 60})`}>
                  {slice.levels.map((level, j) => {
                    const rowWidthOffset = -halfTriangleSize * j;
                    return level.tiles.map((_, k) => (
                      <Triangle
                        key={`triangle-${i}-${j}-${k}`}
                        up={k % 2 !== 0}
                        x={rowWidthOffset + halfTriangleSize * k}
                        y={height * j}
                        color={hexagon.slices[i].levels[j].tiles[k]}
                        onClick={() => {
                          setHexagon((h) => ({
                            ...h,
                            slices: h.slices.map((slice, si) => {
                              if (!symmetryMode && si !== i) return slice;
                              return {
                                ...slice,
                                levels: slice.levels.map((l, li) => {
                                  if (li !== j) return l;
                                  return {
                                    ...l,
                                    tiles: l.tiles.map((t, ti) => {
                                      if (ti !== k) return t;
                                      return currentColor;
                                    }),
                                  };
                                }),
                              };
                            }),
                          }));
                        }}
                      />
                    ));
                  })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </main>
  );
}
