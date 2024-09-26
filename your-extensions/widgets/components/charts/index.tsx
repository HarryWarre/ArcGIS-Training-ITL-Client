import { ChartType, ModeChartType } from "../../chart-widget/src/runtime/chart";
import LineChart from "./line-chart";
import { React } from "jimu-core";
import ColChart from "./col-chart";
import PieChart from "./pie-chart";
import { Typography } from "jimu-ui";
import {
  Grid,
  FormControlLabel,
  Radio,
} from "../../../node_plugin/node_modules/@mui/material";
const { useState } = React;
const ChartComponent = ({ title, description, data }) => {
  const [mode, setMode] = useState<ModeChartType>(ChartType.column); // Default type chart

  const renderChart = () => {
    switch (mode) {
      case "line":
        return (
          <LineChart title={title} description={description} data={data} />
        );

      case "column":
        return <ColChart title={title} description={description} data={data} />;
      case "pie":
        return <PieChart title={title} description={description} data={data} />;
      default:
        return (
          <Typography component={"p"} color={"red"}>
            Lỗi load chart
          </Typography>
        );
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
        {/* Điều khiển lựa chọn chart */}
        {Object.keys(ChartType).map((r) => (
          <FormControlLabel
            key={r}
            checked={r === mode}
            onChange={() => setMode(r as ModeChartType)}
            value={r}
            control={<Radio />}
            label={r}
          />
        ))}
      </Grid>

      <Grid item xs={12}>
        {/* Render chart tương ứng */}
        {renderChart()}
      </Grid>
    </Grid>
  );
};

export default ChartComponent;
