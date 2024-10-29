import { ChartLimits } from '../../src/constants'
import { getChartLimits } from '../../src/runtime/chart/utils'

jest.mock('@arcgis/charts-components', () => {
  return {
    setAssetPath: jest.fn()
  }
})
describe('src/runtime/chart/utils/index.ts', () => {
  describe('getChartLimits', () => {
    it('should work well when no `num`', () => {
      let series = [{
        type: 'barSeries'
      }]
      let res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarUniqueSeriesCountTotal: 10000
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarTwoSeriesCountPerSeries: 1000,
        maxBarTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarThreePlusSeriesCountPerSeries: 100,
        maxBarThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineUniqueSeriesCountTotal: 10000
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineTwoSeriesCountPerSeries: 1000,
        maxLineTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineThreePlusSeriesCountPerSeries: 100,
        maxLineThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'pieSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxPieChartSliceCountTotal: 300
      })
    })

    it('should work well when `num` less than defaut limit', () => {
      let series = [{
        type: 'barSeries'
      }]
      let res = getChartLimits(series, ChartLimits, 10)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxBarChartSeriesCount: 100,
        maxBarUniqueSeriesCountTotal: 10
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits, 10)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxBarChartSeriesCount: 100,
        maxBarTwoSeriesCountPerSeries: 10,
        maxBarTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits, 10)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxBarChartSeriesCount: 100,
        maxBarThreePlusSeriesCountPerSeries: 10,
        maxBarThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 100)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxLineChartSeriesCount: 100,
        maxLineUniqueSeriesCountTotal: 100
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 100)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxLineChartSeriesCount: 100,
        maxLineTwoSeriesCountPerSeries: 100,
        maxLineTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 100)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxLineChartSeriesCount: 100,
        maxLineThreePlusSeriesCountPerSeries: 100,
        maxLineThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'pieSeries'
      }]
      res = getChartLimits(series, ChartLimits, 100)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxPieChartSliceCountTotal: 100
      })
    })

    it('should work well when `num` more than defaut limit', () => {
      let series = [{
        type: 'barSeries'
      }]
      let res = getChartLimits(series, ChartLimits, 11000)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarUniqueSeriesCountTotal: 10000
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits, 1100)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarTwoSeriesCountPerSeries: 1000,
        maxBarTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits, 200)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarThreePlusSeriesCountPerSeries: 100,
        maxBarThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 11000)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineUniqueSeriesCountTotal: 10000
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 5100)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineTwoSeriesCountPerSeries: 1000,
        maxLineTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 3500)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineThreePlusSeriesCountPerSeries: 100,
        maxLineThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'pieSeries'
      }]
      res = getChartLimits(series, ChartLimits, 330)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxPieChartSliceCountTotal: 300
      })
    })

    it('should work well for scatter-plot', () => {
      const series = [{
        type: 'scatterSeries'
      }]
      const res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxScatterPointsBeforeAggregation: 10000,
        maxScatterPointsAfterAggregation: 10000
      })
    })
  })
})
