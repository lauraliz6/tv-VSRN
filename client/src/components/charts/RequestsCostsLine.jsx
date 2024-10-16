import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import theme from "../../StyleGuide.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const multiLineOptions = {
  responsive: true,
  interaction: {
    mode: "index",
    intersect: false,
  },
  stacked: false,
  plugins: {
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || "";

          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null && label === "Costs: ") {
            label += new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }).format(context.parsed.y);
          } else {
            label += new Intl.NumberFormat("en-US").format(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
  scales: {
    y: {
      type: "linear",
      display: true,
      position: "left",
      ticks: {
        // Include a dollar sign in the ticks
        callback: function (value, index, ticks) {
          return "$" + value;
        },
      },
    },
    y1: {
      type: "linear",
      display: true,
      position: "right",
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};

export default function RequestsCostsLine(props) {
  const labels = props.labels;
  const data = {
    labels,
    datasets: [
      {
        label: "Costs",
        data: props.costdata,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        yAxisID: "y",
      },
      {
        label: "Number of Requests",
        data: props.countdata,
        borderColor: theme.palette.primary.dark,
        backgroundColor: theme.palette.primary.dark,
        yAxisID: "y1",
      },
    ],
  };

  return (
    <Line
      options={multiLineOptions}
      data={data}
      style={{ width: 600, height: 400 }}
    />
  );
}
