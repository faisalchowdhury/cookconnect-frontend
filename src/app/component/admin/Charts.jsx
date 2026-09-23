"use client";

// The two charts on the admin dashboard, drawn as plain SVG.
//
// Deliberately dependency-free. Recharts/Chart.js would add ~150 kB of client
// JavaScript to render two static series that never animate, never stream and
// never need a tooltip engine; the Figma asks for one smooth area curve and one
// labelled bar column, both of which are a path and a rect.
//
// Layout note: each chart draws into a fixed viewBox and scales with
// `w-full h-auto`, so the geometry is computed once at authoring size and the
// browser handles responsiveness. That keeps the label font size proportional
// to the plot instead of drifting as the container narrows.
//
// Both charts stay `dir="ltr"` even under Arabic: the x axis is a time series,
// and January belongs on the left whichever way the surrounding page reads.

const PAD = { top: 16, right: 16, bottom: 34, left: 38 };

/** Rounds to at most 2 decimals without trailing zeros — 86.89, 68, 10.97. */
const fmt = (n) => String(Math.round(n * 100) / 100);

/**
 * Y-axis ticks from 0 to `max`, `steps` intervals apart.
 * Returned top-down so they can be mapped straight onto rows.
 */
const ticks = (max, steps) =>
  Array.from({ length: steps + 1 }, (_, i) => (max / steps) * (steps - i));

/**
 * Catmull-Rom through every point, converted to cubic béziers.
 *
 * A polyline would read as a jagged sawtooth at this density (12 monthly
 * points across ~640px), which is not what the design shows. Catmull-Rom is
 * used rather than a generic smoothing pass because it is *interpolating*: the
 * curve passes exactly through each month's value, so the peak the eye lands on
 * is the real September figure and not a smoothed approximation of it.
 *
 * `tension` 6 is the standard uniform Catmull-Rom denominator; the endpoints
 * duplicate their neighbour so the curve starts and ends flat instead of
 * overshooting past the plot area.
 */
function smoothPath(pts) {
  if (pts.length < 2) return "";

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function Grid({ w, h, rows }) {
  return (
    <g>
      {rows.map((value, i) => {
        const y = PAD.top + ((h - PAD.top - PAD.bottom) / (rows.length - 1)) * i;
        return (
          <g key={value}>
            <line
              x1={PAD.left}
              x2={w - PAD.right}
              y1={y}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-gray-400"
              fontSize="11"
            >
              {fmt(value)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function AxisLabels({ w, h, labels }) {
  const plot = w - PAD.left - PAD.right;
  // Points sit at band centres, matching how the bars and curve are placed.
  const step = plot / labels.length;
  return (
    <g>
      {labels.map((label, i) => (
        <text
          key={label + i}
          x={PAD.left + step * i + step / 2}
          y={h - PAD.bottom + 18}
          textAnchor="middle"
          className="fill-gray-500"
          fontSize="11"
        >
          {label}
        </text>
      ))}
    </g>
  );
}

function Legend({ label, color, shape = "line" }) {
  return (
    <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-600">
      {shape === "line" ? (
        <span className="flex items-center gap-1" aria-hidden>
          <span className="h-px w-3" style={{ backgroundColor: color }} />
          <span
            className="h-2 w-2 rounded-full border-2 bg-white"
            style={{ borderColor: color }}
          />
          <span className="h-px w-3" style={{ backgroundColor: color }} />
        </span>
      ) : (
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </div>
  );
}

/**
 * Filled area chart with a smooth curve and a point marker per value —
 * the "Cook Growth" panel.
 */
export function AreaChart({
  points,
  labels,
  legend,
  max = 100,
  color = "#8B8BE8",
  height = 300,
  width = 720,
}) {
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const step = plotW / points.length;
  const baseline = height - PAD.bottom;

  const coords = points.map((v, i) => ({
    x: PAD.left + step * i + step / 2,
    y: baseline - Math.min(v / max, 1) * plotH,
    v,
  }));

  const line = smoothPath(coords);
  // Close the curve down to the baseline for the gradient fill.
  const area = `${line} L ${coords[coords.length - 1].x} ${baseline} L ${coords[0].x} ${baseline} Z`;
  const gradientId = `area-${color.replace("#", "")}`;

  return (
    <div dir="ltr">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={legend}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <Grid w={width} h={height} rows={ticks(max, 4)} />

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />

        {coords.map((p) => (
          <circle
            key={p.x}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="#fff"
            stroke={color}
            strokeWidth="1.5"
          />
        ))}

        <AxisLabels w={width} h={height} labels={labels} />
      </svg>

      {legend && <Legend label={legend} color={color} shape="line" />}
    </div>
  );
}

/**
 * Column chart with the value printed above each bar — the "Restaurant Growth"
 * panel.
 */
export function BarChart({
  points,
  labels,
  legend,
  max = 100,
  color = "#F08A82",
  height = 300,
  width = 720,
}) {
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const step = plotW / points.length;
  // Leave a gutter either side of each column so the bars read as separate.
  const barW = Math.min(step * 0.42, 26);
  const baseline = height - PAD.bottom;

  return (
    <div dir="ltr">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={legend}
      >
        <Grid w={width} h={height} rows={ticks(max, 5)} />

        {points.map((v, i) => {
          const h = Math.min(v / max, 1) * plotH;
          const x = PAD.left + step * i + step / 2 - barW / 2;
          const y = baseline - h;
          return (
            <g key={labels[i] + i}>
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-gray-700"
                fontSize="10.5"
              >
                {fmt(v)}
              </text>
              <rect x={x} y={y} width={barW} height={h} rx="3" fill={color} />
            </g>
          );
        })}

        <AxisLabels w={width} h={height} labels={labels} />
      </svg>

      {legend && <Legend label={legend} color={color} shape="square" />}
    </div>
  );
}
