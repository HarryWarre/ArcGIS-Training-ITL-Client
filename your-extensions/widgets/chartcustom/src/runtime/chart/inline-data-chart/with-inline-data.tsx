import { React, type ImmutableObject, useIntl, hooks, type WidgetInitDragCallback } from 'jimu-core'
import {
  type ChartElementLimit,
  type WebMapWebChart,
  type UnprivilegedChart,
  type PreRenderCallback,
  type WebChartPieChartSeries,
  type WebChart,
  getSeriesType
} from 'jimu-ui/advanced/chart'
import { useChartRuntimeDispatch, useChartRuntimeState } from '../../state'
import { type IWebChart } from '../../../config'
import convertRecordsToInlineData from './convert-utils'
import { defaultMessages as jimuUiMessages } from 'jimu-ui'
import defaultMessages from '../../translations/default'
import { normalizePieSlices, normalizeSeriesName } from './utils'
import { ChartComponents } from '../components'
import { useSelection, normalizeSeries } from '../utils'
import { WebChartCurrentVersion } from '../../../constants'
import { getCategoryField } from '../../../utils/common'

interface WithInlineDataChartProps {
  className?: string
  widgetId: string
  webChart: ImmutableObject<IWebChart>
  chartLimits?: Partial<ChartElementLimit>
  onInitDragHandler: WidgetInitDragCallback
}

const background = [0, 0, 0, 0] as any

function WithInlineDataChart (
  props: WithInlineDataChartProps
): React.ReactElement {
  const { className, widgetId, webChart: propWebChart, chartLimits, onInitDragHandler } = props
  const { outputDataSource, records, recordsStatus } = useChartRuntimeState()
  const dispatch = useChartRuntimeDispatch()

  const chartRef = React.useRef<UnprivilegedChart>(null)
  const id = widgetId + '-' + (propWebChart?.id ?? 'chart')
  const intl = useIntl()
  const translate = hooks.useTranslation(defaultMessages, jimuUiMessages)
  const webMapWebChartRef = React.useRef<ImmutableObject<WebMapWebChart>>(null)
  let webChart = React.useMemo(() => propWebChart.set('version', WebChartCurrentVersion).without('dataSource').set('id', id).set('background', background) as unknown as ImmutableObject<WebMapWebChart>, [id, propWebChart])

  const type = getSeriesType(propWebChart.series as any)
  const query = propWebChart?.dataSource?.query
  const categoryField = getCategoryField(query)
  const propSeries = propWebChart?.series as any

  const [inlineData, dataItems] = React.useMemo(
    () =>
      convertRecordsToInlineData(
        type,
        records,
        query,
        propSeries,
        intl
      ),
    [type, records, query, propSeries, intl]
  )

  let series = React.useMemo(() => normalizeSeries(propSeries, query), [propSeries, query])
  series = React.useMemo(() => normalizePieSlices(series, query, dataItems), [dataItems, query, series])
  series = React.useMemo(() => normalizeSeriesName(series, query, translate), [series, query, translate])
  webChart = React.useMemo(() => webChart.set('series', series), [webChart, series])

  const webMapWebChart = React.useMemo(() => {
    // Ensure that the chart is rendered after the data is loaded
    if (recordsStatus !== 'loaded') {
      return webMapWebChartRef.current
    } else {
      webMapWebChartRef.current = webChart
      return webChart
    }
  }, [recordsStatus, webChart])

  const hanldleCreated = React.useCallback(
    (chart: UnprivilegedChart) => {
      chartRef.current = chart
      dispatch({ type: 'SET_CHART', value: chart })
    },
    [dispatch]
  )

  const [selectionData, handleSelectionChange] = useSelection(
    widgetId,
    outputDataSource,
    propSeries,
    categoryField
  )

  const chartWillRender: PreRenderCallback = React.useCallback(async (props) => {
    const { chartConfig, slices: usedSlices } = props
    let slices = (chartConfig?.series?.[0] as WebChartPieChartSeries)?.slices
    let alteredConfig: WebChart = chartConfig as WebChart
    if (slices?.length) {
      slices = slices.map((slice) => {
        const id = slice.sliceId
        const usedSliceId = usedSlices?.find((usedSlice) => usedSlice.originalLabel === id)?.sliceId
        if (usedSliceId) {
          return {
            ...slice,
            sliceId: usedSliceId
          }
        }
        return slice
      })
      alteredConfig = {
        ...chartConfig,
        series: [{
          ...chartConfig.series[0],
          slices
        }] as WebChartPieChartSeries[]
      } as WebChart
    }
    return alteredConfig
  }, [])

  hooks.useEffectOnce(() => {
    onInitDragHandler?.(null, null, () => {
      if (!chartRef.current) return
      chartRef.current.refresh()
    })
  })

  return (
    <>
      {webMapWebChart && <ChartComponents
        ref={hanldleCreated}
        className={className}
        webMapWebChart={webMapWebChart}
        inlineData={inlineData}
        chartWillRender={chartWillRender}
        hideLoaderAnimation={true}
        chartLimits={chartLimits}
        selectionData={selectionData}
        hideEmptySeriesInLegend={false}
        arcgisChartsSelectionComplete={handleSelectionChange}
      />}
    </>
  )
}

export default WithInlineDataChart
