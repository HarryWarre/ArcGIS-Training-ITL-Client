import { type IMFeatureLayerQueryParams, Immutable, type ImmutableArray, type ImmutableObject, type WidgetUpgradeInfo, WidgetVersionManager } from 'jimu-core'
import { getSeriesType, WebChartTypes, type WebChartPieChartSeries, type WebChartBarChartSeries, type WebChartPieChartLegend } from 'jimu-ui/advanced/chart'
import { CategoryType, type IWebChart, type IMConfig, type WebChartSeries } from './config'
import { ByFieldSeriesX, ByFieldSeriesY, PieSliceGroupingSliceId } from './constants'
import { capitalizeString } from './utils/common'
import { getCategoryType } from './utils/common/serial'
import { DefaultPieLegendLabelMaxWidth, getFillSymbol, isSerialSeries } from './utils/default'

/**
 * Function merging multiple `outStatistics` properties.
 * @param uniqueQuery
 * @param series
 */
const mergeOutStatistics = (uniqueQuery: IMFeatureLayerQueryParams, series: ImmutableArray<WebChartSeries>) => {
  series.slice(1).forEach((serie) => {
    const outStatistics = (uniqueQuery.outStatistics ?? []).concat(serie.query?.outStatistics ?? [])
    uniqueQuery = uniqueQuery.set('outStatistics', outStatistics)
  })
  return uniqueQuery
}

/**
 * Function building a unique query based on the chart series config.
 * Note: all queries have the same onStatisticsField, so they can be combined into one query.
 */
export const buildUniqueQuery = (series: ImmutableArray<WebChartSeries>): IMFeatureLayerQueryParams => {
  if (!series?.length) return null
  let uniqueQuery: IMFeatureLayerQueryParams = series[0].query
  if (!uniqueQuery.outStatistics?.length) return null
  if (uniqueQuery?.groupByFieldsForStatistics?.length) {
    uniqueQuery = mergeOutStatistics(uniqueQuery, series)
  }
  return uniqueQuery
}

/**
 * Use the numeric field as the id of the serie.
 */
export const setSeriesIdWithNumericField = (series: ImmutableArray<WebChartSeries>): ImmutableArray<WebChartSeries> => {
  return series?.map((serie) => {
    if (!serie.query?.groupByFieldsForStatistics?.length) {
      return serie
    } else {
      const numericField = serie.query?.outStatistics?.[0]?.onStatisticField
      const id = serie.id
      if (numericField && numericField !== id) {
        serie = Immutable.set(serie, 'id', numericField)
      }
      return serie
    }
  }) as unknown as ImmutableArray<WebChartSeries>
}

export const upgradeColorMatch = (oldConfig: IMConfig): IMConfig => {
  if (!oldConfig) return oldConfig
  let series = oldConfig.webChart?.series
  if (!series?.length) return oldConfig
  const seriesType = getSeriesType(series as any)
  if (seriesType !== 'pieSeries') return oldConfig
  const colorType = series[0].colorType
  if (colorType !== 'colorMatch') return oldConfig
  let dataSource = oldConfig.webChart.dataSource
  const colorMatch = dataSource?.colorMatch
  if (!colorMatch) return oldConfig

  const colorMatches = colorMatch.colorMatches
  const defaultFillSymbol = (series[0] as unknown as WebChartPieChartSeries).fillSymbol
  const slices = Object.entries(colorMatches).map(([key, match]) => {
    const sliceId = key
    const color = match._fillColor
    const fillSymbol = getFillSymbol(color, defaultFillSymbol.outline?.width ?? 0, defaultFillSymbol.outline?.color as any)
    return { sliceId, fillSymbol }
  })
  series = Immutable.setIn(series, ['0', 'slices'], slices)
  dataSource = dataSource.without('colorMatch')
  const newConfig: IMConfig = oldConfig.setIn(['webChart', 'series'], series)
    .setIn(['webChart', 'dataSource'], dataSource)
  return newConfig
}

export const upgradeByField = (oldConfig: IMConfig): IMConfig => {
  if (!oldConfig) return oldConfig
  let query = oldConfig.webChart?.dataSource?.query
  let series = oldConfig.webChart?.series
  const seriesType = getSeriesType(series as any)
  if (seriesType !== 'pieSeries' && !isSerialSeries(seriesType)) return oldConfig
  const categoryType = getCategoryType(query)
  if (categoryType !== CategoryType.ByField) return oldConfig
  const statisticType = query?.outStatistics?.[0]?.statisticType ?? 'sum'
  series = series.map(serie => {
    let x = serie.x
    let y = (serie as any).y
    let id = (serie as any).y
    if (x === 'FieldName') {
      x = ByFieldSeriesX
      serie = serie.set('x', x)
    }
    if (y === 'FieldValue') {
      y = ByFieldSeriesY
      serie = serie.set('y', y)
    }
    if (id === 'FieldValue') {
      id = ByFieldSeriesY
      serie = serie.set('id', id)
    }
    if (serie.name === 'Sum of value') {
      const name = `${capitalizeString(statisticType)} of value`
      serie = serie.set('name', name)
    }
    return serie
  }) as any
  const orderByField = query.orderByFields?.[0]
  if (orderByField?.includes('FieldName')) {
    query = query.set('orderByFields', [orderByField.replace('FieldName', ByFieldSeriesX)])
  } else if (orderByField?.includes('FieldValue')) {
    query = query.set('orderByFields', [orderByField.replace('FieldValue', ByFieldSeriesY)])
  }
  const newConfig: IMConfig = oldConfig.setIn(['webChart', 'series'], series)
    .setIn(['webChart', 'dataSource', 'query'], query)
  return newConfig
}

/**
 * For Bar, Line charts, this function will
 * - Move the optional `rotated` property from the series to the chart object if the chart object does not contain this property.
 * - Remove all series' rotated property.
 * @param webChartToUpdate config to update
 * @returns the updated config
 * Used in version 1.12.0
 */
const moveSeriesRotatedPropToChart = (webChartToUpdate: ImmutableObject<IWebChart>): ImmutableObject<IWebChart> => {
  let updatedWebChart = webChartToUpdate

  if (webChartToUpdate?.series?.length) {
    const seriesType = getSeriesType(webChartToUpdate.series as any)
    const isBarOrLine = seriesType === WebChartTypes.BarSeries || seriesType === WebChartTypes.LineSeries
    if (isBarOrLine && webChartToUpdate.rotated === undefined) {
      // if the chart rotated property is not set, set it using the first series' rotated property or use the default value
      const rotated = (webChartToUpdate.series[0] as ImmutableObject<WebChartBarChartSeries>).rotated ?? false
      updatedWebChart = updatedWebChart.set('rotated', rotated)
      const series = updatedWebChart.series.map((serie: any) => {
        if (serie.rotated !== undefined) {
          serie = serie.without('rotated')
        }
        return serie as ImmutableObject<WebChartSeries>
      })
      updatedWebChart = updatedWebChart.set('series', series)
    }
  }
  return updatedWebChart
}

class VersionManager extends WidgetVersionManager {
  versions = [{
    version: '1.6.0',
    description: 'Rename `multipleBarType` to `stackedType`',
    upgrader: (oldConfig: IMConfig) => {
      if (!oldConfig) return oldConfig
      let series = oldConfig.webChart?.series
      if (!series?.length) return oldConfig
      series = series.map((serie) => {
        serie = (serie as any).set('stackedType', (serie as any).multipleBarType)
        serie = (serie as any).without('multipleBarType')
        return serie as unknown as WebChartSeries
      })
      const newConfig: IMConfig = oldConfig.setIn(['webChart', 'series'], series)
      return newConfig
    }
  }, {
    version: '1.7.0',
    description: 'Use the `numericField` as the `id` of serie, build the `query` in the `series` as a data source',
    upgrader: (oldConfig: IMConfig) => {
      if (!oldConfig) return oldConfig
      let series = oldConfig.webChart?.series
      if (!series?.length) return oldConfig
      series = setSeriesIdWithNumericField(series)
      const query = buildUniqueQuery(series)
      series = series.map(serie => Immutable.without(serie, 'query')) as unknown as ImmutableArray<WebChartSeries>
      const dataSource = { query }
      const newConfig: IMConfig = oldConfig.setIn(['webChart', 'series'], series)
        .setIn(['webChart', 'dataSource'], dataSource)
      return newConfig
    }
  }, {
    version: '1.8.0',
    description: '',
    upgrader: (oldConfig: IMConfig) => {
      return oldConfig
    }
  }, {
    version: '1.9.0',
    description: '',
    upgrader: (oldConfig: IMConfig) => {
      return oldConfig
    }
  }, {
    version: '1.10.0',
    description: 'Upgrade `config.colorMatch` to `series[0].slices` for pie chart.',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig = upgradeColorMatch(oldConfig)
      newConfig = upgradeByField(newConfig)
      return newConfig
    }
  }, {
    version: '1.11.0',
    description: '',
    upgrader: (oldConfig) => {
      return oldConfig
    }
  }, {
    version: '1.12.0',
    description: 'Upgrade web-chart version and upgrade the numeric type in the slice id of the pie chart to a string type, feature layer data source only supports the latter.',
    upgrader: (oldConfig: IMConfig) => {
      if (!oldConfig || !oldConfig.webChart) return oldConfig
      //upgrade to web-chart version 6.2.1
      let newConfig: IMConfig = oldConfig.setIn(['webChart', 'version'], '6.2.1')
      //move series rotated to web-chart level
      const webChart = moveSeriesRotatedPropToChart(newConfig.webChart)
      newConfig = newConfig.set('webChart', webChart)

      const series = newConfig.webChart?.series
      if (!series?.length) return newConfig
      const seriesType = getSeriesType(series as any)
      if (seriesType !== 'pieSeries') return newConfig

      //upgrade sliceGrouping of pie series
      let serie = series[0] as ImmutableObject<WebChartPieChartSeries>
      let sliceGrouping = serie.sliceGrouping
      sliceGrouping = sliceGrouping.set('sliceId', PieSliceGroupingSliceId).set('label', (sliceGrouping as any).groupName)
      sliceGrouping = (sliceGrouping as any).without('groupName')
      serie = serie.set('sliceGrouping', sliceGrouping)

      //upgrade the sliceId of pie slices from numeric type to string type
      const pieSlices = serie.slices
      if (pieSlices?.length) {
        const slices = pieSlices.map((slice) => {
          if (typeof slice.sliceId === 'number') {
            slice = slice.set('sliceId', slice.sliceId + '')
          }
          return slice
        })
        serie = serie.set('slices', slices)
      }

      // `series.slices` can customize the color of each pie slice
      // it is not necessary to set the `colorType` to `colorMatch`, it will read the layer rendering color and cause unexpected changes
      if (serie.colorType === 'colorMatch') {
        serie = serie.set('colorType', 'singleColor')
      }

      newConfig = newConfig.setIn(['webChart', 'series', '0'], serie)
      return newConfig
    }
  }, {
    version: '1.13.0',
    description: 'Upgrade series dataTooltipVisible to true, sortLabelsBy to originalValue, support max-length for the label of pie legend',
    upgrader: (oldConfig: IMConfig) => {
      if (!oldConfig) return oldConfig
      let series = oldConfig.webChart?.series
      if (!series?.length) return oldConfig
      series = series.map((serie) => {
        serie = serie.set('dataTooltipVisible', true)
        return serie as unknown as WebChartSeries
      })
      let newConfig: IMConfig = oldConfig.setIn(['webChart', 'series'], series).setIn(['webChart', 'sortLabelsBy'], 'originalValue')
      const seriesType = getSeriesType(series as any)
      if (seriesType === 'pieSeries' && newConfig.webChart.legend) {
        let legend: ImmutableObject<WebChartPieChartLegend> = newConfig.webChart.legend
        legend = legend.set('labelMaxWidth', DefaultPieLegendLabelMaxWidth)
        newConfig = newConfig.setIn(['webChart', 'legend'], legend)
      }
      return newConfig
    }
  }, {
    version: '1.14.0',
    description: 'Upgrade the use-fields of the use data source for by-field mode',
    upgradeFullInfo: true,
    upgrader: async (oldInfo: WidgetUpgradeInfo) => {
      const oldWidgetJson = oldInfo.widgetJson
      const oldConfig = oldWidgetJson.config as IMConfig
      if (!oldConfig) return oldInfo
      const query = oldConfig.webChart?.dataSource?.query
      const series = oldConfig.webChart?.series
      const seriesType = getSeriesType(series as any)
      if (seriesType !== 'pieSeries' && !isSerialSeries(seriesType)) return oldInfo
      const categoryType = getCategoryType(query)
      if (categoryType !== CategoryType.ByField) return oldInfo

      const outStatistics = query.outStatistics
      const originFields = outStatistics.map((outStatistic) => outStatistic.onStatisticField).asMutable({ deep: true })
      let useDataSource = oldWidgetJson.useDataSources[0]
      if (!useDataSource.fields?.length) {
        useDataSource = useDataSource.set('fields', originFields)
        const widgetJson = oldWidgetJson.set('useDataSources', [useDataSource])
        const widgetInfo = { ...oldInfo, widgetJson }
        return widgetInfo
      }
      return oldInfo
    }
  }]
}

export const versionManager = new VersionManager()
