import React, { useState, useEffect } from "react";
import Axios from "axios";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChartWt(props) {
  const [dataLabels, setDataLabels] = useState([]);
  const [dataCount, setDataCount] = useState([]);

  useEffect(() => {
    Axios.get("http://localhost:3001/wtDashDataByGroup", {
      headers: {
        writer: props.selectedWT,
        group: props.group,
      },
    }).then((response) => {
      const tempStatusLabels = [];
      const tempStatusCounts = [];
      if (response.data.length > 0) {
        response.data.forEach((el) => {
          tempStatusLabels.push(el[props.group]);
          tempStatusCounts.push(el.Length);
        });
      }
      setDataLabels(tempStatusLabels);
      setDataCount(tempStatusCounts);
    });
  }, [props.group, props.selectedWT]);

  const data = {
    labels: dataLabels,
    datasets: [
      {
        label: props.label,
        data: dataCount,
        backgroundColor: props.colors,
        borderColor: props.colors,
        borderWidth: 1,
      },
    ],
  };
  return <Pie data={data} />;
}
