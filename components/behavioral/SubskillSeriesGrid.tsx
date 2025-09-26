"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  TimeSeriesScale,
  Filler, // add
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import type { TooltipItem } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  TimeSeriesScale,
  Filler // add
);

function parseToDate(value: any): Date | null {
  if (value == null) return null;
  // already a Date
  if (value instanceof Date) {
    if (!isNaN(value.getTime())) return value;
    return null;
  }
  // number (likely ms)
  if (typeof value === "number" && !isNaN(value)) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  // string of digits (ms or seconds)
  if (typeof value === "string") {
    const trimmed = value.trim();
    // numeric strings
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      // if looks like seconds (10 digits), convert to ms
      if (n < 1e12) {
        const d = new Date(n * 1000);
        return isNaN(d.getTime()) ? null : d;
      } else {
        const d = new Date(n);
        return isNaN(d.getTime()) ? null : d;
      }
    }
    // try Date.parse (ISO strings etc)
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }
  // unknown
  return null;
}

export default function SubskillSeriesGrid({ data }: { data: any }) {
  const entries: [string, any][] = Object.entries(data.subskills || {});
  if (entries.length === 0) {
    return <div className="text-sm text-slate-500">No sub-skill data.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {entries.map(([key, s]) => {
        // Normalize any incoming series into { x: time, y: number }
        const points = (s.series || [])
          .map((p: any) => {
            const isNum = (v: any) =>
              typeof v === "number" ||
              (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)));

            // pick the field that parses as a Date for x (time)
            const timeCandidates = [p.t, p.x, p.time, p.timestamp, p.date, p.ts, p.createdAt, p.updatedAt];
            let timeRaw: any = timeCandidates.find((v) => !!parseToDate(v));

            // if none of the usual fields look like time, try v/y as a fallback (handles swapped payloads)
            if (!timeRaw && parseToDate(p.v)) timeRaw = p.v;
            if (!timeRaw && parseToDate(p.y)) timeRaw = p.y;

            // final x value (Date preferred; Chart.js time scale accepts Date/number/ISO)
            const d = parseToDate(timeRaw);
            const x: any = d ?? timeRaw;

            // choose a numeric score for y, avoiding whichever field we used for time
            const valueCandidates = [p.v, p.y, p.value, p.score, p.val, p.result].filter(
              (v) => v !== timeRaw // don’t reuse the time field as y
            );
            let yRaw: any = valueCandidates.find((v) => isNum(v));
            let y =
              yRaw == null
                ? null
                : typeof yRaw === "number"
                ? yRaw
                : Number(String(yRaw).trim());
            if (Number.isNaN(y)) y = null;

            return { x, y };
          })
          // ensure chronological order for time-series
          .sort((a: any, b: any) => {
            const da = parseToDate(a.x)?.getTime() ?? 0;
            const db = parseToDate(b.x)?.getTime() ?? 0;
            return da - db;
          });

        // Quick debug print for you to inspect the actual first point(s)
        // Open browser devtools console to see this.
        // (Remove or comment out once things look correct.)
        // eslint-disable-next-line no-console
        // console.log("DEBUG points sample:", key, points.slice(0, 3)); // remove or comment

        return (
          <div key={key} className="border rounded-lg p-3">
            <div className="text-sm font-medium mb-2">{labelize(key)}</div>

            <Line
              data={{
                datasets: [
                  {
                    data: points,
                    borderColor: "#6366f1",
                    backgroundColor: "rgba(99,102,241,0.15)",
                    pointRadius: 0,
                    fill: true,
                    spanGaps: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                parsing: {
                  xAxisKey: "x",
                  yAxisKey: "y",
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      title: (tooltipItems: TooltipItem<"line">[]) => {
                        const item = tooltipItems?.[0];
                        const xVal = item?.parsed?.x ?? item?.label;
                        const d = parseToDate(xVal);
                        if (!d) return "";
                        return d.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      },
                    },
                  },
                },
                interaction: {
                  mode: "index",
                  intersect: false,
                },
                scales: {
                  x: {
                    type: "timeseries", // was "time"
                    time: {
                      unit: "day",
                      displayFormats: {
                        day: "MMM d",
                      },
                      tooltipFormat: "MMM d",
                    },
                    ticks: {
                      source: "data",
                      callback: function (value) {
                        // value may be a timestamp (number), string, or something else.
                        let d = parseToDate(value);
                        if (!d) {
                          // try using scale's label for value (some Chart versions provide that)
                          try {
                            // @ts-ignore - scale API available at runtime
                            const label = this.getLabelForValue(value);
                            d = parseToDate(label);
                          } catch (e) {
                            d = null;
                          }
                        }
                        if (!d) return "";
                        return d.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      },
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                  y: {
                    min: 0,
                    max: 100,
                    ticks: { stepSize: 20 },
                  },
                },
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function labelize(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
