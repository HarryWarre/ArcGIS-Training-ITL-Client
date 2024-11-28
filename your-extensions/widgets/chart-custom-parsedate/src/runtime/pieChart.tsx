import React from 'react';
import Highcharts, { type Options } from '../../../../node_plugin/node_modules/highcharts';
import HighchartsReact from '../../../../node_plugin/node_modules/highcharts-react-official';
import exporting from '../../../../node_plugin/node_modules/highcharts/modules/exporting';

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
      text: chartTitle?.['content'] || "",
      align: chartTitle?.['alignment'] || 'center',
      verticalAlign: 'bottom',
      style: {
        color: chartTitle?.['color'] || "#bababa",
        fontWeight: chartTitle?.['bold'] ? 'bold' : 'normal',
        fontStyle: chartTitle?.['italic'] ? 'italic' : 'normal',
        textDecoration: [
          chartTitle?.['underline'] ? 'underline' : '',
          chartTitle?.['strike'] ? 'line-through' : ''
        ].filter(Boolean).join(' '),
        fontSize: chartTitle?.['size'] || '14px',
        fontFamily: chartTitle?.['font'] || "Arial",
      },
    },
    subtitle: {
      text: chartSubtitle?.['content'] || "",
      align: chartSubtitle?.['alignment'] || 'center',
      style: {
        color: chartSubtitle?.['color'] || "#bababa",
        fontWeight: chartSubtitle?.['bold'] ? 'bold' : 'normal',
        fontStyle: chartSubtitle?.['italic'] ? 'italic' : 'normal',
        textDecoration: [
          chartSubtitle?.['underline'] ? 'underline' : '',
          chartSubtitle?.['strike'] ? 'line-through' : ''
        ].filter(Boolean).join(' '),
        fontSize: chartSubtitle?.['size'] || '12px',
        fontFamily: chartSubtitle?.['font'] || "Arial",
      },
    },
    tooltip: {
      pointFormat: `<b>{point.name}</b>: {point.y}</b> ${tooltipSuffix} ({point.percentage:.1f}%)`,
      formatter: function() {
        return `<b>${this.point.name}</b>: ${Highcharts.numberFormat(this.point.y, 0, ',', '.')}${tooltipSuffix} (${this.point.percentage.toFixed(1)}%)`;
      },
      borderRadius: 5,
      shadow: false,
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
            // Chỉ hiển thị nếu phần trăm lớn hơn hoặc bằng 10 %
            return this.percentage >= 10 ? Highcharts.numberFormat(this.percentage, 1) + '%' : null;
          },
          distance: -50,
          style: {
            color: 'black',
            fontSize: '14px',
            fontWeight: 'light',
            textOutline: 'none'
          }
        }
      }
    },
    exporting: {
      enabled: exportingEnabled,
    },
    legend: {
      layout: 'vertical',        // Hiển thị legend theo cột dọc
      align: 'right',            // Căn legend sang phải
      verticalAlign: 'middle',   // Đặt legend giữa theo chiều dọc
      // borderWidth: 1             // (Tùy chọn) Thêm viền nếu cần
      x: -200,
      y: 0,
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
