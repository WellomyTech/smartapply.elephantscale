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
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  TimeSeriesScale
);

export default function SubskillSeriesGrid({ data }: { data: any }) {
  const entries: [string, any][] = Object.entries(data.subskills || {});
  if (entries.length === 0) {
    return <div className="text-sm text-slate-500">No sub-skill data.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {entries.map(([key, s]) => {
        const labels = (s.series || []).map((p: any) => p.t);
        const values = (s.series || []).map((p: any) => p.v ?? null);
        return (
          <div key={key} className="border rounded-lg p-3">
            <div className="text-sm font-medium mb-2">{labelize(key)}</div>
            <Line
              data={{
                labels,
                datasets: [
                  {
                    data: values,
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
                plugins: {
                  legend: { display: false },
                  tooltip: { intersect: false, mode: "index" as const },
                },
                scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } },
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
