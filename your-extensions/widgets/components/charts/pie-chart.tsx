import { React } from "jimu-core";
import Highcharts from "highcharts";
const { useEffect } = React;

interface DataType {
  [key: string]: number;
}

export default function PieChart({
  title,
  description,
  data,
}: {
  title?: string;
  description?: string;
  data: DataType;
}) {
  const calculatePercentages = (data: DataType) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    return Object.entries(data).map(([name, value]) => ({
      name,
      y: (value / total) * 100, // Convert to percentage
    }));
  };

  const pieData = calculatePercentages(data);

  useEffect(() => {
    // Configure pie chart
    const chart = Highcharts.chart("container", {
      chart: {
        type: "pie",
      },
      title: {
        text: title || "Egg Yolk Composition", // Allow dynamic title or default value
        align: "center",
      },
      tooltip: {
        formatter: function () {
          // Format tooltip to show percentage rounded to 1 decimal place
          return `<b>${this.point.name}</b>: ${Highcharts.numberFormat(
            this.point.percentage,
            1
          )}%`;
        },
      },
      subtitle: {
        text: description, // Configurable subtitle or default
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "{point.name}: {point.percentage:.1f}%", // Format to display percentages
            style: {
              fontSize: "1.2em",
              textOutline: "none",
              opacity: 0.7,
            },
            filter: {
              operator: ">",
              property: "percentage",
              value: 10,
            },
          },
        },
      },
      series: [
        {
          name: "Phần trăm",
          colorByPoint: true,
          data: pieData.length
            ? pieData
            : [
                { name: "Water", y: 55.02 },
                { name: "Fat", sliced: true, selected: true, y: 26.71 },
                { name: "Carbohydrates", y: 1.09 },
                { name: "Protein", y: 15.5 },
                { name: "Ash", y: 1.68 },
              ], // Dynamic data or default values
        },
      ],
    });

    return () => {
      if (chart) {
        chart.destroy(); // Cleanup on unmount
      }
    };
  }, [title, description, data]);

  return <div id='container'></div>;
}
