import {type FeatureLayerDataSource} from 'jimu-arcgis'
import {
  type AllWidgetProps,
  type DataSource,
  DataSourceComponent,
  DataSourceManager, FeatureLayerQueryParams, getAppStore,
  type IMState,
  React,
} from 'jimu-core'
import { Loading } from 'jimu-ui'
import { useSelector} from 'react-redux'
import { type IMConfig } from '../config'
import Chart from './chart'
import { formatDate, formatMonth, formatYear } from './utils'
import PieChart from './configChart/pieChart'

/**
 * Hiện tại bị lỗi phần nếu filter sử dụng trên 2 Feature Layer Datasource, sẽ bị lỗi (do đang lâý datasource đầu tiên)
 */


// Declare Hooks
const { useState, useEffect, useRef } = React
// Widget start here  --------------->

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { config } = props
  const optionSettingChart = config?.optionsChart
  const appToken = useSelector((state: IMState) => state.token)

  const CategoryRef = useRef<DataSource>(null)
  const [isDataSourcesReady, setIsDataSourceReady] = useState(false)
  const [dataCategory, setDataCategory] = useState(null)
  const timeout = null as any
  const [xValue, setXValue] = useState([]) // List of time
  const [yValue, setYValue] = useState([]) // List of counts
  const [serries, setserries] = useState([])

  const category = optionSettingChart?.category?.value
  const categoryType = optionSettingChart?.category?.type
  const categoryDomainCode = optionSettingChart?.category?.domain
  const splitBy = optionSettingChart?.splitBy?.value
  const splitByDomainCode = optionSettingChart?.splitBy?.domain
  const isParseDates = optionSettingChart?.isParseDates
  const isSplitBy = optionSettingChart?.isSplitBy
  const chartType = optionSettingChart?.typechart || 'column'
  const chartHeight = optionSettingChart?.chartHeight || '500px'
  const chartTitle = optionSettingChart?.chartTitle
  const chartSubtitle = optionSettingChart?.chartSubtitle
  const groupBy = optionSettingChart?.parseDate || 'date'
  const isShowValueOnTop = optionSettingChart?.isShowValueOnTop || false
  let serriseColors = optionSettingChart?.serries

  const filterExpression = props.stateProps?.['queryString']
  const colChartParseDateMessage = useSelector(
      () =>
          getAppStore().getState().widgetsState?.["chartParseDate"]?.["colChartParseDate"]
  );
  // console.log(props.stateProps)
  useEffect(() => {
    if (!appToken) return
    clearTimeout(timeout)
    handleGetDatasources()
    return () => {
      clearTimeout(timeout)
    }
  }, [appToken, props.useDataSources])

  //Query data
  useEffect(() => {
    if (CategoryRef.current) {
      handleGetData(CategoryRef.current)
    }
  }, [
    isDataSourcesReady,
    optionSettingChart?.category,
    optionSettingChart?.splitBy,
    props.useDataSources,
    filterExpression,
    colChartParseDateMessage // Bị lỗi show value
  ])

  useEffect(() => {
    if (!dataCategory) return;

    switch (chartType) {
      case "pie":
        handlePieChart(dataCategory);
        break;

      default:
        handleColumnChart(dataCategory, isSplitBy);
        break;
    }
  }, [
    dataCategory,
    chartType,
    isSplitBy,
    isShowValueOnTop,
    groupBy,
    serries,
    serriseColors,
    colChartParseDateMessage
  ]);

  async function handleGetDatasources () {
    const dsArr: DataSource[] = []

    props.useDataSources?.forEach((useDataSource) => {
      const ds = DataSourceManager.getInstance().getDataSource(
        useDataSource?.dataSourceId
      )
      dsArr.push(ds)
    })

    if (dsArr.every((e) => e)) {
      setIsDataSourceReady(true)
      CategoryRef.current = dsArr[0]
      clearTimeout(timeout)
    } else {
      setTimeout(() => handleGetDatasources(), 300)
    }
  }

  const handleColumnChart = (dataCategory: any, isSplitBy: boolean) => {
    const groupedData = groupData(dataCategory, groupBy as any, isSplitBy);
    const dates = Object.keys(groupedData);
    const recordCounts = dates.map((key) => groupedData[key]);

    if (isSplitBy) {
      const { series, categories } = transformToSerialSerries(
          groupedData,
          serries
      );
      setXValue(categories);
      setYValue(series);
    } else {
      const seriesData = [
        {
          type: "column",
          color: "#007bff", // Default color when don't have split by
          data: recordCounts,
          dataLabels: {
            enabled: true,
            style: {
              fontWeight: "normal",
              color: "black",
              fontSize: "12px",
            },
            formatter: function () {
              return isShowValueOnTop ? (this.y > 0 ? this.y : null) : null;
            },
          },
        },
      ];
      setXValue(dates);
      setYValue(seriesData);
    }
  };

  const handlePieChart = (dataCategory: any) => {
    const pieData = transformToPieChartData(dataCategory);

    const xValues = pieData.map((item) => item.name); // Labels for pie slices
    // const yValues = [
    //   {
    //     type: "pie",
    //     data: pieData,
    //     dataLabels: {
    //       enabled: true,
    //       format: "<b>{point.name}</b>: {point.percentage:.1f}%",
    //     },
    //   },
    // ];

    setXValue(xValues);
    setYValue(pieData);

    // console.log("xValues (names):", xValues);
    // console.log("yValues (pie chart data):", yValues);
  };

  const transformToSerialSerries = (groupedData: any, serries: string[]) => {
    const categories = Object.keys(groupedData)
    const result = serries.map((serri) => {
      const data = categories.map((category) => groupedData[category][serri] || 0);
      return {
        name: serri,
        data: data,
        color: serriseColors?.[`${serri}`],
        visible: data.every(value => value === 0) ? false : true, // Nếu tất cả giá trị = 0, ẩn series
        dataLabels: {
          style: {
            fontWeight: 'normal',
            color: 'black',
            fontSize: '12px'
          },
          formatter: function () {
            return isShowValueOnTop ? this.y > 0 ? this.y : null : null;
          },
        },
        marker: {
          symbol: 'square'
        },
        // pointPlacement: -0.2,
        // pointRange: 1
      }
    })
    return { series: result, categories }
  }


  const transformToPieChartData = (
      allRecords: any[],
  ) => {
    const pieData: { name: string; y: number; color?: string }[] = [];
    const groupedData: { [key: string]: number } = {};

    // Nhóm dữ liệu theo category
    allRecords.forEach((record) => {
      const categoryValue = record.getData()[category]; // Lấy giá trị category

      if (!groupedData[categoryValue]) {
        groupedData[categoryValue] = 0;
      }
      groupedData[categoryValue]++;
    });

    // Lấy tên từ categoryDomainCode nếu có, ngược lại sử dụng key (categoryValue)
    Object.entries(groupedData).forEach(([key, value]) => {
      // Tìm tên từ categoryDomainCode nếu có
      let displayName = key;
      // console.log(key)
      if (categoryDomainCode) {
        const codedValue = categoryDomainCode?.["codedValues"].find(
            (item) => item.code === key
        );
        // console.log(categoryDomainCode)
        if (codedValue) {
          displayName = codedValue.name; // Lấy name tương ứng với code
        }
      }
      pieData.push({
        name: displayName,
        y: value,
        color: serriseColors?.[displayName], // Optional: Áp dụng màu nếu có
      });
    });

    return pieData;
  };


  const groupData = (
    allRecords: any[],
    groupBy: 'date' | 'month' | 'year',
    isSplitBy: boolean
  ) => {
    const groupedData = {}

    allRecords.forEach((record) => {
      const timestamp = record.getData()[category]
      const dateKey =
        groupBy === 'month' && isParseDates
          ? formatMonth(timestamp)
          : groupBy === 'year' && isParseDates
            ? formatYear(timestamp)
            : formatDate(timestamp)
      const dateKeyString = dateKey.toString()

      // If client use series
      if (isSplitBy && splitBy) {
        let serri = record.getData()[splitBy] // T G P
        // Convert from code to name
        if (splitByDomainCode?.codedValues) {
          const codeToNameMap = Object.fromEntries(
            splitByDomainCode.codedValues.map((item:any) => [item.code, item.name])
          );
          serri = codeToNameMap[serri] || serri
        }
        // <------------------------->
        if (!groupedData[dateKeyString]) {
          groupedData[dateKeyString] = {}
        }
        if (!groupedData[dateKeyString][serri]) {
          groupedData[dateKeyString][serri] = 0
        }
        groupedData[dateKeyString][serri]++
      } else {
        if (!groupedData[dateKeyString]) {
          groupedData[dateKeyString] = 0
        }
        groupedData[dateKeyString]++
      }
    })
    // console.log(groupedData)
    return groupedData
  }

  const handleGetData = async (ds: DataSource) => {
    const _ds = ds as FeatureLayerDataSource;
    if (_ds && category) {
    // console.log(_ds)
      // Nếu parseType là 'month', tính toán điều kiện lọc theo tháng và năm từ timestamp
      let whereConditions = [
        `${category} is not null`,
        'OBJECTID is not null',
        splitBy && isSplitBy ? `${splitBy} is not null` : null,
        filterExpression ? filterExpression : null
      ]
          .filter(Boolean)
          .join(' AND ');
      // console.log(whereConditions)
      // Chỉ áp dụng khi chartType là 'pie' và parseType là 'month'
      if (chartType === 'pie' && colChartParseDateMessage?.parseType === 'month') {
        const date = new Date(colChartParseDateMessage?.timestamp);
        const year = date.getFullYear();
        const month = date.getMonth(); // Tháng bắt đầu từ 0 (January)

        // Tính toán ngày đầu tháng và ngày cuối tháng
        const startOfMonth = new Date(year, month, 1); // Ngày đầu tháng
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59); // Ngày cuối tháng, giờ 23:59:59

        // Chuyển đổi thành chuỗi theo định dạng 'YYYY-MM-DD HH:MM:SS'
        const startTimestamp = startOfMonth.toISOString().slice(0, 19).replace('T', ' ');
        const endTimestamp = endOfMonth.toISOString().slice(0, 19).replace('T', ' ');
        // console.log(colChartParseDateMessage)
        // Thêm điều kiện lọc theo tháng vào where
        whereConditions += ` AND ${colChartParseDateMessage.category} BETWEEN timestamp '${startTimestamp}' AND timestamp '${endTimestamp}'`;
      }

      if (chartType === 'pie' && colChartParseDateMessage?.parseType === 'year') {
        const date = new Date(colChartParseDateMessage?.timestamp);
        const year = date.getFullYear();

        // Tính toán ngày đầu năm và ngày cuối năm
        const startOfYear = new Date(year, 0, 1); // Ngày đầu năm
        const endOfYear = new Date(year, 11, 31, 23, 59, 59); // Ngày cuối năm, giờ 23:59:59

        // Chuyển đổi thành chuỗi theo định dạng 'YYYY-MM-DD HH:MM:SS'
        const startTimestamp = startOfYear.toISOString().slice(0, 19).replace('T', ' ');
        const endTimestamp = endOfYear.toISOString().slice(0, 19).replace('T', ' ');

        // Thêm điều kiện lọc theo năm vào where
        whereConditions += ` AND ${colChartParseDateMessage.category} BETWEEN timestamp '${startTimestamp}' AND timestamp '${endTimestamp}'`;
      }

      if (chartType === 'pie' && colChartParseDateMessage?.parseType === 'date') {
        const date = new Date(colChartParseDateMessage?.timestamp);

        // Tính toán ngày cụ thể
        const startOfDay = new Date(date.setHours(0, 0, 0, 0)); // Đầu ngày
        const endOfDay = new Date(date.setHours(23, 59, 59, 999)); // Cuối ngày

        // Chuyển đổi thành chuỗi theo định dạng 'YYYY-MM-DD HH:MM:SS'
        const startTimestamp = startOfDay.toISOString().slice(0, 19).replace('T', ' ');
        const endTimestamp = endOfDay.toISOString().slice(0, 19).replace('T', ' ');

        // Thêm điều kiện lọc theo ngày vào where
        whereConditions += ` AND ${colChartParseDateMessage.category} BETWEEN timestamp '${startTimestamp}' AND timestamp '${endTimestamp}'`;
      }

      // console.log(whereConditions)
      const pageSize = 2000;
      const totalRecords = await _ds.queryCount(whereConditions as FeatureLayerQueryParams);
      const totalPages = Math.ceil(totalRecords.count / pageSize);
      const allPromises = [];

      for (let page = 1; page <= totalPages; page++) {
        const queryPromise = _ds.query({
          outFields: [
            `${category}`,
            'OBJECTID',
            ...(isSplitBy && splitBy ? [splitBy] : [])
          ],
          where: whereConditions,
          returnGeometry: false,
          orderByFields: [`${category} ASC`],
          page: page,
          pageSize: pageSize
        }).then((result) => {
          return result.records;
        });

        allPromises.push(queryPromise);
      }

      const allResults = await Promise.all(allPromises);
      const allRecords = allResults.flat();
      setDataCategory(allRecords);

      if (splitBy) {
        const uniqueSerries = allRecords.map((record) => {
          return record.getData()[`${splitBy}`];
        });

        const distinctSerries = [...new Set(uniqueSerries)];

        if (splitByDomainCode?.codedValues) {
          const codeToNameMap = Object.fromEntries(
              splitByDomainCode.codedValues.map((item) => [item.code, item.name])
          );
          const updatedSerries = distinctSerries.map((item) =>
              codeToNameMap[item] || item
          );
          setserries(updatedSerries);
        } else {
          setserries(distinctSerries);
        }
      }
    }
  };
  return (
    <>
      {props.useDataSources?.map((useDataSource, index) => (
        <DataSourceComponent
          key={`data-source-${index}`}
          useDataSource={useDataSource}
          widgetId={props.id}
        />
      ))}
      {/* Chart */}
      {
        xValue && yValue ? (
            chartType !== 'pie' ? (
                <Chart
                    chartType={chartType as any}
                    chartHeight={chartHeight}
                    chartTitle={chartTitle}
                    chartSubtitle={chartSubtitle}
                    xAxisCategories={xValue}
                    seriesData={yValue}
                    tooltipSuffix=""
                    exportingEnabled={true}
                    legendEnabled={isSplitBy}
                    groupBy={isParseDates ? groupBy : 'date'}
                    isSplitBy={isSplitBy}
                    isDateType={categoryType === 'esriFieldTypeDate'}
                    dispatch = {props.dispatch}
                    category={category}
                    previousFilter = {colChartParseDateMessage}
                    // previousFilter = {colChartParseDateMessage}
                />
            ) : (
                <PieChart
                    chartHeight={chartHeight}
                    chartTitle={chartTitle}
                    chartSubtitle={chartSubtitle}
                    seriesData={yValue}
                    exportingEnabled={true}
                    legendEnabled={isSplitBy}
                />
            )
        ) : (
            <Loading />
        )
      }
  </>
  )
}

export default Widget
