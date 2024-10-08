import { React } from "jimu-core";
import Highcharts from "highcharts";
const { useEffect } = React;
export default function ({ title, description, data }) {
  useEffect(() => {
    console.log(data);
    const categories = Object.keys(data);
    const values = Object.values(data);
    //  We will configure the collumn chart at this option
    const chart = Highcharts.chart("container", {
      chart: {
        type: "spline",
      },
      title: {
        text: title,
      },
      subtitle: {
        text: null,
      },
      xAxis: {
        categories: categories
          ? categories
          : [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
        accessibility: {
          description: description,
        },
      },
      yAxis: {
        title: {
          text: "Số lượng",
        },
        labels: {
          format: "{value}°",
        },
      },
      tooltip: {
        crosshairs: true,
        shared: true,
      },
      plotOptions: {
        spline: {
          marker: {
            radius: 4,
            lineColor: "#666666",
            lineWidth: 1,
          },
        },
      },
      series: [
        {
          name: description,
          marker: {
            symbol: "square",
          },
          data: values
            ? values
            : [
                5.2,
                5.7,
                8.7,
                13.9,
                18.2,
                21.4,
                25.0,
                {
                  y: 26.4,
                  // marker: {
                  //   symbol:
                  //     "url(https://www.highcharts.com/samples/graphics/sun.png)",
                  // },
                  accessibility: {
                    description:
                      "Sunny symbol, this is the warmest point in the " +
                      "chart.",
                  },
                },
                22.8,
                17.5,
                12.1,
                7.6,
              ],
        },
      ],
    });
    return () => {
      if (chart) {
        chart.destroy(); // phá hủy biểu đồ nếu component bị hủy
      }
    };
  }, [title, description, data]);

  return <div id='container'></div>;
}
