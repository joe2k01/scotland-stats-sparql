import { useEffect, useRef, useState } from "react";
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
import { ExtractedData } from "./App";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const randomRGB = () => {
  const channel = () => Math.floor(Math.random() * 255);

  return `rgba(${channel()}, ${channel()}, ${channel()}, 1)`;
};

const chartJsData = (chartData: ExtractedData, yearBounds: number[]) => {
  const colours = Object.keys(chartData).map(() => randomRGB());
  const labels: string[] = [];

  for (let i = yearBounds[0]; i <= yearBounds[1]; i++) {
    labels.push(i.toString());
  }

  return {
    datasets: Object.keys(chartData).map((dataKey, index) => {
      return {
        label: dataKey,
        data: chartData[dataKey].values,
        borderColor: colours[index],
        backgroundColor: colours[index],
      };
    }),
    labels,
  };
};

const chartJsOptions = (chartData: ExtractedData) => {
  const text = () => {
    const keys = Object.keys(chartData);
    if (keys.length > 2) {
      return keys.map((key) => key.split(",")[0]).join(" vs ");
    } else return keys.join(" vs ");
  };
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text,
      },
    },
  };
};

const ChartView: React.FC<{
  chartData: ExtractedData;
  yearBounds: number[];
}> = ({ chartData, yearBounds }) => {
  const [displayData, setDisplayData] = useState<any>(undefined);
  const [options, setOptions] = useState<any>(undefined);
  const chartRef = useRef();
  useEffect(() => {
    setDisplayData(chartJsData(chartData, yearBounds));
    setOptions(chartJsOptions(chartData));
  }, [chartData]);

  return (
    <div className="w-full h-full px-4 py-4">
      {displayData && options && (
        <div className="relative w-[80vw] sm:w-[90vw] md:w-[70vw] h-[80vh] m-auto">
          <Line data={displayData} options={options} ref={chartRef} />
        </div>
      )}
    </div>
  );
};

export default ChartView;
