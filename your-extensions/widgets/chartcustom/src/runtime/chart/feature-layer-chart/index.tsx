import { React, type ImmutableObject, type UseDataSource, type IMState, ReactRedux, DataSourceStatus, CONSTANTS, type DataSource, type WidgetInitDragCallback, hooks, Immutable } from 'jimu-core'
import { type ChartElementLimit, getSeriesType, getSplitByField } from 'jimu-ui/advanced/chart'
import { type ChartTools, type IWebChart, type TemplateType } from '../../../config'
import WithFeatureLayerChart from './with-feature-layer'
import { useChartRuntimeState } from '../../state'
import { createRuntimeSplitBySeries, getFieldType, getTemplateType, normalizeRuntimeSplitBySeries } from '../../../utils/common'
import { ChartRoot, isWebChartValid, useWarningMessage } from '../components'
import { FeatureLayerDataSourceManager } from '../data-source'
import Tools from '../tools'

interface WebFeatureLayerChartComponentPorps {
  className?: string
  widgetId: string
  webChart: ImmutableObject<IWebChart>
  tools: ImmutableObject<ChartTools>
  enableDataAction: boolean
  chartLimits?: Partial<ChartElementLimit>
  useDataSource: ImmutableObject<UseDataSource>
  defaultTemplateType: TemplateType
  onInitDragHandler: WidgetInitDragCallback
}

const useChartRendered = (dataSourceId: string, webChart: ImmutableObject<IWebChart>) => {
  const status = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[dataSourceId]?.status)
  const instanceStatus = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[dataSourceId]?.instanceStatus)
  const valid = React.useMemo(() => isWebChartValid(webChart), [webChart])
  const render = (status && status !== DataSourceStatus.NotReady) && ((instanceStatus && instanceStatus !== DataSourceStatus.CreateError)) && valid
  return { valid, render }
}

//Check whether the current data source is selected features view has no selection
const useEmptySelectionDataSource = (dataSource?: DataSource) => {
  const sourceVersion = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[dataSource?.id]?.sourceVersion)
  const isSelectionDataSource = dataSource?.isDataView && dataSource?.dataViewId === CONSTANTS.SELECTION_DATA_VIEW_ID
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectionRecordsEmpty = React.useMemo(() => isSelectionDataSource && !dataSource.getRecords().length, [isSelectionDataSource, dataSource, sourceVersion])
  const useEmptySelectionView = dataSource?.useNoSelectionView()
  if (useEmptySelectionView) return false
  return selectionRecordsEmpty
}

const WebFeatureLayerChartComponent = (props: WebFeatureLayerChartComponentPorps) => {
  const {
    widgetId,
    tools: propTools,
    enableDataAction = true,
    webChart,
    chartLimits,
    useDataSource,
    defaultTemplateType,
    onInitDragHandler
  } = props

  const { recordsStatus, dataSource, outputDataSource } = useChartRuntimeState()
  const [loading, setLoading] = React.useState(false)

  const isSelectionDataSourceEmpty = useEmptySelectionDataSource(dataSource)

  const type = getSeriesType(webChart?.series as any)
  const showTools = propTools?.cursorEnable || !!propTools?.filter || enableDataAction
  const { valid, render } = useChartRendered(useDataSource?.dataSourceId, webChart)

  const showPlaceholder = !render || isSelectionDataSourceEmpty || !outputDataSource

  const templateType = getTemplateType(webChart)?.[1] || defaultTemplateType || 'column'
  const [messageType, message] = useWarningMessage(
    type,
    valid,
    useDataSource,
    recordsStatus,
    webChart?.series?.length ?? 0,
    isSelectionDataSourceEmpty
  )

  const tools = showTools
    ? (
      <Tools
        type={type}
        tools={propTools}
        widgetId={widgetId}
        enableDataAction={enableDataAction}
      />
      )
    : null

  const handleLayerStatusChange = (status: 'loading' | 'loaded') => {
    setLoading(status === 'loading')
  }

  return (
    <ChartRoot
      templateType={templateType}
      messageType={messageType}
      message={message}
      showLoading={loading}
      background={webChart?.background}
      className='web-feature-layer-chart'
      showPlaceholder={showPlaceholder}
      tools={tools}
    >
      <WithFeatureLayerChart
        className='web-chart'
        widgetId={widgetId}
        webChart={webChart}
        chartLimits={chartLimits}
        useDataSource={useDataSource}
        onInitDragHandler={onInitDragHandler}
        onLayerStatusChange={handleLayerStatusChange}
      />
    </ChartRoot>
  )
}

interface WebFeatureLayerChartPorps extends WebFeatureLayerChartComponentPorps {
  outputDataSourceId: string
}

const WebFeatureLayerChart = (props: WebFeatureLayerChartPorps) => {
  const {
    widgetId,
    tools,
    enableDataAction = true,
    webChart: propWebChart,
    chartLimits,
    useDataSource,
    outputDataSourceId,
    defaultTemplateType,
    onInitDragHandler
  } = props

  const { chart } = useChartRuntimeState()
  const dataSourceId = useDataSource?.dataSourceId
  const splitByField = getSplitByField(propWebChart?.dataSource?.query?.where, true)
  const query = propWebChart?.dataSource?.query

  const [splitByValues, setSplitByValues] = React.useState<{ [field: string]: Array<string | number> }>()
  const splitByFieldRef = hooks.useLatest(splitByField)

  const series = React.useMemo(() => {
    if (splitByFieldRef.current && splitByValues?.[splitByFieldRef.current]) {
      const splitByFieldType = getFieldType(splitByFieldRef.current, dataSourceId)
      const seriesValues = createRuntimeSplitBySeries(propWebChart.series, query, splitByFieldType, splitByValues[splitByFieldRef.current])
      return Immutable(seriesValues)
    } else {
      const seriesValues = normalizeRuntimeSplitBySeries(propWebChart?.series)
      return seriesValues
    }
  }, [dataSourceId, splitByFieldRef, splitByValues, propWebChart?.series, query])

  const handleSchemaChange = () => {
    chart?.refresh(false, false)
  }

  const webChart = React.useMemo(() => {
    return propWebChart?.set('series', series)
  }, [propWebChart, series])

  return (<>
    <FeatureLayerDataSourceManager
      widgetId={widgetId}
      webChart={propWebChart}
      outputDataSourceId={outputDataSourceId}
      useDataSource={useDataSource}
      onSplitValuesChange={setSplitByValues}
      onSchemaChange={handleSchemaChange}
    />
    <WebFeatureLayerChartComponent
      widgetId={widgetId}
      tools={tools}
      webChart={webChart}
      chartLimits={chartLimits}
      useDataSource={useDataSource}
      enableDataAction={enableDataAction}
      onInitDragHandler={onInitDragHandler}
      defaultTemplateType={defaultTemplateType}
    />
  </>)
}

export default WebFeatureLayerChart