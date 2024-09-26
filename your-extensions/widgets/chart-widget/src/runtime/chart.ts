export enum ChartType {
  line = "line",
  pie = "pie",
  column = "column",
}
export type ModeChartType = ChartType.line | ChartType.pie | ChartType.column;

export const layerDatasource = {
  dma: 0,
  dhkh: 1,
};

export const feartureDhkh = ["CODONGHO"];

export const feartureDMA = ["MADMA", "ShapeArea"];