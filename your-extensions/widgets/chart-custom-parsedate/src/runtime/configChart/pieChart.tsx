import React from 'react';
import Highcharts, { type Options } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import exporting from 'highcharts/modules/exporting';
import {DEFAULT_PIE_CHART_SETTINGS} from "./piechartConfig";

// Kích hoạt module Exporting
exporting(Highcharts);

// Định nghĩa các Props với giá trị mặc định
interface PieChartProps {
  chartHeight?: string | number;
  chartTitle?: object;
  chartSubtitle?: object;
  seriesData?: any[]
  tooltipSuffix?: string;
  legendEnabled?: boolean;
  exportingEnabled?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  chartHeight = '50%',
  chartTitle = {},
  chartSubtitle = {},
  seriesData = [],
  tooltipSuffix = '',
  legendEnabled = true,
  exportingEnabled = false,
}) => {
  const optionsChart: Options = {
    chart: {
      type: "pie",
      height: `${chartHeight}px`,
      // height: `${500}px`,
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
    },
    title: {
      text: chartTitle?.['content'] || DEFAULT_PIE_CHART_SETTINGS.title.text,
      align: chartTitle?.['alignment'] || DEFAULT_PIE_CHART_SETTINGS.title.align,
      verticalAlign: DEFAULT_PIE_CHART_SETTINGS.title.verticalAlign as any,
      style: {
        color: chartTitle?.['color'] || DEFAULT_PIE_CHART_SETTINGS.title.style.color,
        fontWeight: chartTitle?.['bold'] ? 'bold' : 'normal',
        fontStyle: chartTitle?.['italic'] ? 'italic' : 'normal',
        textDecoration: [
          chartTitle?.['underline'] ? 'underline' : '',
          chartTitle?.['strike'] ? 'line-through' : ''
        ].filter(Boolean).join(' '),
        fontSize: chartTitle?.['size'] || DEFAULT_PIE_CHART_SETTINGS.title.style.fontSize,
        fontFamily: chartTitle?.['font'] || DEFAULT_PIE_CHART_SETTINGS.title.style.fontFamily,
      },
    },
    subtitle: {
      text: chartSubtitle?.['content'] || DEFAULT_PIE_CHART_SETTINGS.subtitle.text,
      align: chartSubtitle?.['alignment'] || DEFAULT_PIE_CHART_SETTINGS.subtitle.align,
      style: {
        color: chartSubtitle?.['color'] || DEFAULT_PIE_CHART_SETTINGS.subtitle.style.color,
        fontWeight: chartSubtitle?.['bold'] ? 'bold' : 'normal',
        fontStyle: chartSubtitle?.['italic'] ? 'italic' : 'normal',
        textDecoration: [
          chartSubtitle?.['underline'] ? 'underline' : '',
          chartSubtitle?.['strike'] ? 'line-through' : ''
        ].filter(Boolean).join(' '),
        fontSize: chartSubtitle?.['size'] || DEFAULT_PIE_CHART_SETTINGS.subtitle.style.fontSize,
        fontFamily: chartSubtitle?.['font'] || DEFAULT_PIE_CHART_SETTINGS.subtitle.style.fontFamily,
      },
    },
    tooltip: {
      pointFormat: `<b>{point.name}</b>: {point.y}</b> ${tooltipSuffix} ({point.percentage:.1f}%)`,
      formatter: function() {
        return `<b>${this.point.name}</b>: ${Highcharts.numberFormat(this.point.y, 0, ',', '.')}${tooltipSuffix} (${this.point.percentage.toFixed(1)}%)`;
      },
      borderRadius: DEFAULT_PIE_CHART_SETTINGS.tooltip.borderRadius,
      shadow: DEFAULT_PIE_CHART_SETTINGS.tooltip.shadow,
    },
    plotOptions: {
      pie: {
        cursor: 'pointer',
        innerSize: '50%',
        showInLegend: true,
        allowPointSelect: true,
        animation: true,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          formatter: function () {
            return this.percentage >= 10 ? Highcharts.numberFormat(this.percentage, 1) + '%' : null;
          },
          distance: -45, //45 cho height 400px và
          style: {
            color: 'black',
            fontSize: '14px',
            fontWeight: 'light',
            textOutline: 'none'
          }
        },
        states: {
          hover: {
            halo: false,
            enabled: true,
            animation: {
              duration: 150
            }
          }
        },
        point: {
          events: {
            mouseOver: function () {
              // Slice ra với animation
              this.slice(true, true, { duration: 500 });

              if (!this.dataLabel) return;

              // Lưu vị trí ban đầu nếu chưa có
              if (!this.dataLabel.initialPosition) {
                this.dataLabel.initialPosition = {
                  translateX: this.dataLabel.translateX,
                  translateY: this.dataLabel.translateY
                };
              }

              // Tính vị trí mới khi slice
              var x = this.slicedTranslation.translateX + this.dataLabel.translateX;
              var y = this.slicedTranslation.translateY + this.dataLabel.translateY;

              if (this.series.chart.chartWidth >= 500 || this.series.chart.chartHeight > 399) {
                // Animate dataLabel đến vị trí mới
                this.dataLabel.animate({
                  translateX: x,
                  translateY: y
                }, {
                  duration: 500,
                  easing: 'easeOut'
                });
              }
            },
            mouseOut: function () {
              // Thu slice về với animation
              this.slice(false, true, { duration: 500 });

              if (!this.dataLabel) return;

              // Lấy vị trí ban đầu
              var initial = this.dataLabel.initialPosition;

              if (this.series.chart.chartWidth >= 500 || this.series.chart.chartHeight > 399) {
                // Animate dataLabel quay về vị trí ban đầu
                this.dataLabel.animate({
                  translateX: initial.translateX,
                  translateY: initial.translateY
                }, {
                  duration: 500,
                  easing: 'easeOut'
                });
              }
            }
          }
        },
        slicedOffset: 15 // Khoảng cách slice ra ngoài
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
      layout: DEFAULT_PIE_CHART_SETTINGS.legend.layout as any,        // Hiển thị legend theo cột dọc
      align: DEFAULT_PIE_CHART_SETTINGS.legend.align as any,            // Căn legend sang phải
      verticalAlign: DEFAULT_PIE_CHART_SETTINGS.legend.verticalAlign as any,   // Đặt legend giữa theo chiều dọc
      maxHeight: DEFAULT_PIE_CHART_SETTINGS.legend.maxHeight,            // Chieu cao của danh sách legend
      width: DEFAULT_PIE_CHART_SETTINGS.legend.width,
      // borderWidth: 1          // (Tùy chọn) Thêm viền nếu cần
      x: DEFAULT_PIE_CHART_SETTINGS.legend.x,
      y: DEFAULT_PIE_CHART_SETTINGS.legend.y,
    },
    series: [
      {
        name: 'Percentage', // Change
        colorByPoint: true, // Config
        type: "pie",
        data: seriesData,
    ],
    credits: {
      enabled: false,
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[0].condition.maxWidth,
        },
        chartOptions: {
          plotOptions: {
            pie: {
              dataLabels: {
                connectorWidth: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[0].chartOptions.plotOptions.pie.dataLabels.connectorWidth,
                distance: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[0].chartOptions.plotOptions.pie.dataLabels.distance,
                style: {
                  fontSize: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[0].chartOptions.plotOptions.pie.dataLabels.style.fontSize, // Font nhỏ hơn khi màn hình nhỏ
                }
              }
            }
          },
          legend: {
            itemStyle: {
              fontSize: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[0].chartOptions.legend.itemStyle.fontSize, // Font nhỏ hơn trong legend nếu giao diện hẹp
            },
            maxHeight: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[0].chartOptions.legend.maxHeight,
            width: 'auto',
            verticalAlign: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[0].chartOptions.legend.verticalAlign as any,
            layout: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[0].chartOptions.legend.layout as any,
            align: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[0].chartOptions.legend.align as any
          }
        }
      },
        {
          condition: {
            maxHeight: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[1].condition.maxHeight,
          },
          chartOptions: {
            plotOptions: {
              pie: {
                dataLabels: {
                  connectorWidth: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[1].chartOptions.plotOptions.pie.dataLabels.connectorWidth,
                  distance: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[1].chartOptions.plotOptions.pie.dataLabels.distance,
                  style: {
                    fontSize: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[1].chartOptions.plotOptions.pie.dataLabels.style.fontSize, // Font nhỏ hơn khi màn hình nhỏ
                  }
                }
              }
            },
            legend: {
              itemStyle: {
                fontSize: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[1].chartOptions.legend.itemStyle.fontSize, // Font nhỏ hơn trong legend nếu giao diện hẹp
              },
              maxHeight: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[1].chartOptions.legend.maxHeight,
              width: 'auto',
              verticalAlign: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[1].chartOptions.legend.verticalAlign as any,
              layout: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[1].chartOptions.legend.layout as any,
              align: DEFAULT_PIE_CHART_SETTINGS.responsive.rules[1].chartOptions.legend.align as any
            }
          }
        }]
    }
  };

  return (
      <div>
        <HighchartsReact
            highcharts={Highcharts}
            options={optionsChart}
        />
      </div>
  );
};

export default PieChart;
