import React from 'react'
import { type Options } from '../../../../node_plugin/node_modules/highcharts'
import HighchartsReact from '../../../../node_plugin/node_modules/highcharts-react-official'
import Highcharts from '../../../../node_plugin/node_modules/highcharts/highstock'
import exporting from '../../../../node_plugin/node_modules/highcharts/modules/exporting'
import {legend} from "../../../chart-custom-parsedate/src/runtime/configChart";
import {appActions} from 'jimu-core'

// Kích hoạt module Exporting
exporting(Highcharts)

// Định nghĩa các Props với giá trị mặc định
interface ColChartProps {
  chartType?: 'column' | 'bar' | 'line'
  chartHeight?: string | number
  chartTitle?: object
  chartSubtitle?: object
  xAxisCategories?: string[]
  seriesData?: Array<{ type: string, color: string, data: number[] }>
  tooltipSuffix?: string
  legendEnabled?: boolean
  exportingEnabled?: boolean
  groupBy?: string
  isSplitBy?: boolean
  isDateType?: boolean
  dispatch?: any,
  category?:any,
  previousFilter
}

const {useState, useEffect}= React
const Chart: React.FC<ColChartProps> = ({
  chartType = 'column',
  chartHeight = '50%',
  chartTitle = {},
  chartSubtitle = {},
  xAxisCategories = [],
  seriesData = [{}],
  tooltipSuffix = '',
  legendEnabled = false,
  exportingEnabled = false,
  groupBy = 'date',
  isSplitBy = false,
  isDateType = false,
  dispatch,
  category,
  previousFilter
}) => {
  const optionsChart: Options = {
    chart: {
      type: chartType,
      height: `${chartHeight}px`,
      alignTicks: false,
      events: {
          load: function () {
            const chart = this
            const gap = 50

            chart.setTitle(
              {},
              {
                y: chart.title.getBBox().height + gap
              }
            )
          },
        render: function (e) {
          const chart = this;
          const lengthDateTime = xAxisCategories.length - 1;
          if (xAxisCategories.length > 0) {
            // Tính khoảng cách (10% tổng độ dài)
            const offset = Math.round(lengthDateTime - 15);

            if (offset > 0 && offset < lengthDateTime) {
              const min = Math.max(0, offset);
              const max = lengthDateTime;
              const currentMin = chart.xAxis[0].min;
              const currentMax = chart.xAxis[0].max;
              // if (currentMin==0 && currentMax) {
              //   chart.xAxis[0].setExtremes(min, max);
              // }
            }
          }

        // //   Hide column has 0 value
        //   this.series.forEach(series => {
        //     series.data.forEach(point => {
        //       if (point.y === 0 && point.graphic) {
        //         // Làm cho cột không hiển thị
        //         point.graphic.attr({
        //           width: 0,            // Đặt chiều rộng về 0
        //           visibility: 'hidden' // Hoặc ẩn hoàn toàn
        //         });
        //       }
        //     });
        //   });
        }
      }
    },
    scrollbar: {
      enabled: true
    },
    title: {
      text: chartTitle?.['content'] || "",
      align: chartTitle?.['alignment'] || 'left',
      style: {
        color: chartTitle?.['color'] || "#bababa",
        fontWeight: chartTitle?.['bold'] ? 'bold' : 'normal', // Bold
        fontStyle: chartTitle?.['italic'] ? 'italic' : 'normal', // Italic
        textDecoration: [
          chartTitle?.['underline'] ? 'underline' : '',
          chartTitle?.['strike'] ? 'line-through' : ''
        ].filter(Boolean).join(' '), // Combine underline and line-through
        fontSize: chartTitle?.['size'] || '10px', // Font size
        fontFamily: chartTitle?.['font'] || "Arial"
      }
    },
    subtitle: {
      text: chartSubtitle?.['content'] || "",
      align: chartSubtitle?.['alignment'] || 'left',
      style: {
        color: chartSubtitle?.['color'] || "#bababa",
        fontWeight: chartSubtitle?.['bold'] ? 'bold' : 'normal', // Bold
        fontStyle: chartSubtitle?.['italic'] ? 'italic' : 'normal', // Italic
        textDecoration: [
          chartSubtitle?.['underline'] ? 'underline' : '',
          chartSubtitle?.['strike'] ? 'line-through' : ''
        ].filter(Boolean).join(' '), // Combine underline and line-through
        fontSize: chartSubtitle?.['size'] || '10px', // Font size
        fontFamily: chartSubtitle?.['font'] || "Arial"
      }
    },
    xAxis: {
      // crosshair: false,
      categories: xAxisCategories,
      minPadding: 0.5,
      maxPadding: 0.5,
      accessibility: {
        description: 'Days'
      },
      type: 'datetime',
      labels: {
        formatter: function () {
          const date = new Date(this.value)
          if (groupBy === 'date') {
            return `${date.getDate()} thg ${
							date.getMonth() + 1
						}, ${date.getFullYear()}`
          }
          if (groupBy === 'year') {
            return `${date.getFullYear()}`
          } else if (groupBy === 'month') {
            return `Thg ${date.getMonth() + 1}, ${date.getFullYear()}`
          }
          return `${date.getDate()} Thg ${date.getMonth() + 1}`
        },
        // rotation: -45, // Đặt góc quay cho nhãn (chéo)
        style: {
          whiteSpace: 'nowrap' // Đảm bảo nhãn không bị cắt xén
        }
      },
      events: { // Show value at top column if zoom to the static level
        afterSetExtremes: function (e) {
            const chart = this.chart;
            const zoomedRange = e.max - e.min;
            // console.log(zoomedRange)
            const threshold = 10; // Mức độ hiển thi label
            // console.log(e.max, e.min) // 17, 11
            chart.series.forEach(series => {
                series.update({
                    type: 'column',
                    dataLabels: {
                        enabled: zoomedRange <= threshold // On/Off based on zoom
                    }
                } as Highcharts.SeriesColumnOptions, false);
            });
            chart.redraw();
        }
      }
    },
    yAxis: {
      visible: true,
      opposite: false,
      min: 0,
      title: {
        text: ''
      },
      labels:{
        enabled: true,
      // formatter: function () {
      //     // Trả về giá trị đầy đủ, không rút gọn
      //     return this.value; // Hiển thị giá trị gốc thay vì "1k"
      // }
        format: '{value}'
      },
    },
    tooltip: {
      formatter: function () {
        const date = new Date(this.x)
        let tooltip = '<b style="display: inline-block;">'
        switch (groupBy) {
          case 'date':
            tooltip += `${date.getDate()} thg ${
							date.getMonth() + 1
						}, ${date.getFullYear()}`
            break
          case 'year':
            tooltip += `${date.getFullYear()}`
            break
          case 'month':
            tooltip += `Thg ${date.getMonth() + 1}, ${date.getFullYear()}`
            break
          default:
            tooltip += `${date.getDate()} Thg ${date.getMonth() + 1}`
            break
        }

        if (isSplitBy) {
          tooltip += '</b><br/>'
          const validPoints = this.points?.filter((point) => point.y > 0)
          if (validPoints && validPoints.length > 0) {
            validPoints.forEach((point) => {
              tooltip += `
						<span style="color:${point.series.color}">●</span>
						${point.series.name}: <b>${point.y}</b><br/>`
            })
          }
        } else {
          tooltip += `: ${this.y}`
        }

        return tooltip
      },
      borderRadius: 1,
      shape: "rect",
      borderColor: 'lightgray',
      shadow: false,
      animation: true,
      // outside: true,
      positioner: function (width, height, point) {
          var x, y;
          var offset = 30;
          if (point.index === 0) {
            x = point.plotX + offset;
          } else {
            x = point.plotX - width - offset;
          }
          y = point.plotY - 70;
          return { x: x, y: y };
        }
    },
    plotOptions: {
      column: {
        // crisp: true,
        // clip: true,
        // relativeXValue: true,
        // pointWidth: 20, // độ rộng của cot
        maxPointWidth: 200, // độ rộng tối đa của cot
        // stacking: false,
        // grouping:false,
        // pointPadding: 0,
        // borderWidth: 0,
        // grouping: true,
        // groupPadding: 0,
        pointRange: 1.5, // Chỉnh độ rộng trong ngày
        // minPointLength: 1,
        // allowPointSelect: true,
        series: {
          dataLabels:{
            enabled:true,
            formatter:function(){
              if(this.y > 0)
                return this.y;
            }
          },
        },
        events: {
          click: function (event) {
            const categoryDate = new Date(event.point.category); // Chuyển chuỗi thành Date
            const timestampCategory = categoryDate.getTime(); // Lấy timestamp
            // console.log("Timestamp của category: " + timestampCategory);
            const messageColumnChart = {
              category: category,
              parseType: groupBy,
              timestamp: timestampCategory
            }
            dispatch(
                appActions.widgetStatePropChange(
                    "chartParseDate",
                    "colChartParseDate",
                    previousFilter !== undefined && previousFilter?.timestamp === messageColumnChart?.timestamp
                        ? undefined
                        : messageColumnChart
                )
            );
          },
        }
      }
    },
    exporting: {
      enabled: true,
        buttons: {
            contextButton: {
                menuItems: [
                    'printChart',     // Tùy chọn in
                    'viewFullscreen'  // Tùy chọn toàn màn hình
                ]
            }
        }
    },
    legend: {
      enabled: legendEnabled,
      ...legend as any // Config setting in file
    },
    series: seriesData as any,
    rangeSelector: {
      buttons:[],
      inputEnabled: false,
      enabled: true,
      selected: 1
    },
    navigator: {
      margin: 2,
      height: 20,
      series: {
        color: "transparent",
        showInNavigator: false,
      },
      xAxis: {
        crosshair: false,
        labels: {
          enabled: false
        },
      },
    },
    credits: {
      enabled: false
    }
  }

  return (
		<div>
			<HighchartsReact
				highcharts={Highcharts}
				options={optionsChart}
				constructorType={'stockChart'}
			/>
		</div>
  )
}

export default Chart
