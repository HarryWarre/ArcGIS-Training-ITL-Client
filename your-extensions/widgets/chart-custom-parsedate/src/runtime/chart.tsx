import { Options } from "highcharts"
import exporting from "highcharts/modules/exporting"
import HighchartsReact from "highcharts-react-official"
import Highcharts from "highcharts/highstock"
import React from "react"

// Kích hoạt module Exporting
exporting(Highcharts)

// Định nghĩa các Props với giá trị mặc định
interface ColChartProps {
	chartType?: "column" | "bar" | "line"
	chartHeight?: string | number
	chartTitle?: string
	chartSubtitle?: string
	xAxisCategories?: string[]
	seriesData?: { type: string; color: string; data: number[] }[]
	tooltipSuffix?: string
	legendEnabled?: boolean
	exportingEnabled?: boolean
	groupBy?: string
	isSplitBy?: boolean
}

const Chart: React.FC<ColChartProps> = ({
	chartType = "column",
	chartHeight = "50%",
	chartTitle = "",
	chartSubtitle = "",
	xAxisCategories = [],
	seriesData = [{}],
	tooltipSuffix = "",
	legendEnabled = false,
	exportingEnabled = false,
	groupBy = "date",
	isSplitBy = false,
}) => {
	const optionsChart: Options = {
		chart: {
			type: chartType,
			height: chartHeight,
			// zooming: {
			// 	type: "xy",
			// 	resetButton: {
			// 		position: { align: "right", x: -10, y: 10 },
			// 	},
			// },
			// panning: {
			// 	enabled: true,
			// 	type: "xy",
			// },
			// panKey: "shift",
			events: {
				load: function () {
					const chart = this,
						gap = 40

					chart.setTitle(
						{},
						{
							y: chart.title.getBBox().height + gap,
						}
					)
				},
				// click: function (e) {
				// 	console.log("Zoom reset triggered by click event")
				// },
			},
		},
		scrollbar: {
			enabled: true,
		},
		title: {
			text: chartTitle,
			align: "left",
			style: { color: "#bababa", fontWeight: "lighter", fontSize: "15px" },
		},
		subtitle: {
			text: chartSubtitle,
			align: "left",
			style: {
				color: "#000000",
				fontSize: "25px",
				fontWeight: "bold",
			},
		},
		xAxis: {
			categories: xAxisCategories,
			// crosshair: true,
			accessibility: {
				description: "Days",
			},
			type: "datetime",
			labels: {
				formatter: function () {
					const date = new Date(this.value)
					if (groupBy === "date") {
						return `${date.getDate()} thg ${
							date.getMonth() + 1
						}, ${date.getFullYear()}`
					}
					if (groupBy === "year") {
						return `${date.getFullYear()}`
					} else if (groupBy === "month") {
						return `Thg ${date.getMonth() + 1}, ${date.getFullYear()}`
					}
					return `${date.getDate()} Thg ${date.getMonth() + 1}`
				},
			},
		},
		yAxis: {
			visible: false,
			min: 0,
			title: {
				text: "",
			},
		},
		tooltip: {
			shared: true,
			formatter: function () {
				const date = new Date(this.x)

				let tooltip = `<b style="margin-bottom: 10px; display: inline-block;">`
				if (groupBy === "date") {
					tooltip += `${date.getDate()} thg ${
						date.getMonth() + 1
					}, ${date.getFullYear()}`
				} else if (groupBy === "year") {
					tooltip += `${date.getFullYear()}`
				} else if (groupBy === "month") {
					tooltip += `Thg ${date.getMonth() + 1}, ${date.getFullYear()}`
				} else {
					tooltip += `${date.getDate()} Thg ${date.getMonth() + 1}`
				}
				if (isSplitBy) {
					tooltip += `</b><br/>`
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
			animation: true,
		},
		plotOptions: {
			column: {
				pointPadding: 0.25,
				borderWidth: 0,
			},
		},
		exporting: {
			enabled: false,
			// enabled: exportingEnabled,
		},
		legend: {
			enabled: legendEnabled,
			symbolHeight: 10, // Chiều cao biểu tượng
			symbolWidth: 10, // Chiều rộng biểu tượng
			symbolRadius: 0,
		},
		series: seriesData as any,
		rangeSelector: {
			enabled: false,
			selected: 1,
		},
		navigator: {
			xAxis: {
				labels: {
					enabled: false,
				},
			},
		},
		credits: {
			enabled: false,
		},
	}

	return (
		<div>
			<HighchartsReact
				highcharts={Highcharts}
				options={optionsChart}
				constructorType={"stockChart"}
			/>
		</div>
	)
}

export default Chart
