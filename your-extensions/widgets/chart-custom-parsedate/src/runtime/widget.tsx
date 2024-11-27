import {type FeatureLayerDataSource} from 'jimu-arcgis'
import {
  type AllWidgetProps,
  type DataSource,
  DataSourceComponent,
  DataSourceManager, FeatureLayerQueryParams,
  type IMState,
  React,
} from 'jimu-core'
import { Loading } from 'jimu-ui'
import { useSelector} from 'react-redux'
import { type IMConfig } from '../config'
import Chart from './chart'
import { formatDate, formatMonth, formatYear } from './utils'

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
  console.log(props.stateProps)
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
    filterExpression
  ])

  useEffect(() => {
    if (dataCategory) {
      const groupedData = groupData(dataCategory, groupBy as any, isSplitBy)
      const dates = Object.keys(groupedData)
      const recordCounts = dates.map((key) => groupedData[key])
      const { series, categories } = transformToHighchartsSeries(
        groupedData,
        serries
      )
      if (isSplitBy) {
        setXValue(categories)
        setYValue(series)
      } else {
        const seriesData = [
          {
            // name: "Tổng số lượng",
            type: 'column',
            color: '#007bff', // Default color when don't have split by
            data: recordCounts,
            dataLabels: {
              enabled: true,
              style: {
                  fontWeight: 'normal',
                  color: 'black',
                  fontSize: '12px'
              },
              formatter: function () {
                  // console.log(isShowValueOnTop)
                  return isShowValueOnTop ? this.y > 0 ? this.y : null : null;
              }
            },
          }
        ]
        setXValue(dates)
        setYValue(seriesData)
      }
    }
  }, [
    dataCategory,
    chartType,
    isSplitBy,
    isShowValueOnTop,
    chartTitle,
    groupBy,
    isParseDates,
    optionSettingChart?.category,
    optionSettingChart?.splitBy,
    props.useDataSources,
    serriseColors
  ])

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

  const transformToHighchartsSeries = (groupedData: any, serries: string[]) => {
    const categories = Object.keys(groupedData)
    const result = serries.map((serri) => {
      return {
        name: serri,
        data: categories.map((category) => groupedData[category][serri] || 0),
        color: serriseColors?.[`${serri}`],
        dataLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'normal',
                        color: 'black',
                        fontSize: '12px'
                    },
                    formatter: function () {
                        // console.log(isShowValueOnTop)
                        return isShowValueOnTop ? this.y > 0 ? this.y : null : null;
                    }
                },
        marker: {
          symbol: 'square'
        }
      }
    })
    return { series: result, categories }
  }

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
    const _ds = ds as FeatureLayerDataSource
    if (_ds && category) {
      const whereConditions = [
        `${category} is not null`,
        'OBJECTID is not null',
        splitBy ? `${splitBy} is not null` : null,
        filterExpression ? filterExpression : null
      ]
        .filter(Boolean)
        .join(' AND ')

      const pageSize = 2000
      const totalRecords = await _ds.queryCount(whereConditions as FeatureLayerQueryParams)
      // console.log(count)
      const totalPages = Math.ceil(totalRecords.count / pageSize)
      const allPromises = []
      console.log(totalPages)
      for (let page = 1; page <= totalPages; page++) { // Replace 3 to PageSize if you want to full Pages
        const queryPromise = _ds.query({
          outFields: [`${category}`,'OBJECTID', splitBy ? splitBy :null],
          where: whereConditions,
          returnGeometry: false,
          orderByFields: [`${category} ASC`],
          page: page,
          pageSize: pageSize
        }).then((result) => {
          // console.log(result)
          return result.records
        })

        allPromises.push(queryPromise)
      }

      const allResults = await Promise.all(allPromises)
      const allRecords = allResults.flat()

      setDataCategory(allRecords)

      if (splitBy) {
        const uniqueSerries = allRecords.map((record) => {
          return record.getData()[`${splitBy}`]
        })

        const distinctSerries = [...new Set(uniqueSerries)];

        if (splitByDomainCode?.codedValues) {
          // Convert Code to Name from domain
          const codeToNameMap = Object.fromEntries(
            splitByDomainCode.codedValues.map((item:any) => [item.code, item.name])
          );
          const updatedSerries = distinctSerries.map((item) =>
            codeToNameMap[item] || item
          );
          // console.log(splitByDomainCode?.codedValues)
          setserries(updatedSerries);
        }
        else setserries(distinctSerries)
      }
    }
  }

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
      {xValue && yValue
        ? (
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
        />
          )
        : (
        <Loading />
          )}
    </>
  )
}

export default Widget
