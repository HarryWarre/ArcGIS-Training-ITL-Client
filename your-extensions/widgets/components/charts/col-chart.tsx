import { React } from "jimu-core";
import Highcharts from "highcharts";
const { useEffect } = React;
export default function ({ title, description, data }) {
  // const getData = data;
  // console.log(data);
  const categories = Object.keys(data);
  const values = Object.values(data);
  useEffect(() => {
    //  We will configure the collumn chart at this option
    const chart = Highcharts.chart("container", {
      chart: {
        type: "column",
      },
      title: {
        text: title, // Config this
        align: "left",
      },
      subtitle: {
        text: null,
      },
      xAxis: {
        categories: categories,
        crosshair: true,
        accessibility: {
          description: description, // Config this
        },
      },
      yAxis: {
        min: 0,
        // title: {
        //   text: "1000 metric tons (MT)", // Config this
        // },
      },
      // tooltip: {
      //   valueSuffix: " (1000 MT)",
      // },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
      },
      series: [
        {
          name: description,
          data: values,
        },
      ],
    });
    return () => {
      if (chart) {
        chart.destroy(); // Destroy to reset chart
      }
    };
  }, [title, description, data]);

  // Cleanup khi component unmount

  return <div id='container'></div>;
}
