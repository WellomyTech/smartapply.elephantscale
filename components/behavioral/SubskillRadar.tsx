"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar as RadarChart } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function SubskillRadar({ data }: { data: any }) {
  const labels: string[] = Object.keys(data.subskills || {});
  const values = labels.map((k) => data.subskills[k]?.latest ?? 0);

  return (
    <RadarChart
      data={{
        labels,
        datasets: [
          {
            label: "Latest",
            data: values,
            backgroundColor: "rgba(59,130,246,0.2)",
            borderColor: "#3b82f6",
            pointBackgroundColor: "#3b82f6",
          },
        ],
      }}
      options={{
        plugins: { legend: { display: false } },
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 100,
            angleLines: { color: "#e5e7eb" },
          },
        },
      }}
    />
  );
}
