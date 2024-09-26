const path = require("path");
module.exports = function (webpackConfig) {
  /**
   * If you need to change the widget webpack config, you can change the webpack config here and return the changed config.
   *
   */

  Object.assign(webpackConfig.resolve.alias, {
    lodash: path.resolve(
      __dirname,
      "../your-extensions/node_plugin/node_modules/lodash/"
    ),
    "material-react-table": path.resolve(
      __dirname,
      "../your-extensions/node_plugin/node_modules/material-react-table"
    ),
    "@mui/material": path.resolve(
      __dirname,
      "../your-extensions/node_plugin/node_modules/@mui/material"
    ),
    "@mui/icons-material": path.resolve(
      __dirname,
      "../your-extensions/node_plugin/node_modules/@mui/icons-material"
    ),
    "@mui/x-date-pickers": path.resolve(
      __dirname,
      "../your-extensions/node_plugin/node_modules/@mui/x-date-pickers"
    ),
    "@mui": path.resolve(
      __dirname,
      "../your-extensions/node_plugin/node_modules/@mui"
    ),
    "react-toastify": path.resolve(
      __dirname,
      "../your-extensions/node_plugin/node_modules/react-toastify"
    ),
    highchart: path.resolve(
      __dirname,
      "../your-extensions/node_plugin/node_modules/highcharts"
    ),
    components: path.resolve(__dirname, "../your-extensons/widgets/common/"),
  });

  return webpackConfig;
};
