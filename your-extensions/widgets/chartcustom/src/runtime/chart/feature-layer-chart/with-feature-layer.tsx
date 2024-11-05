import {
  React,
  ReactRedux,
  DataSourceStatus,
  DataSourceManager,
  type FeatureLayerDataSource,
  type IMState,
  type ImmutableObject,
  type UseDataSource,
  type DataSource,
  DataSourceTypes,
  type SceneLayerDataSource,
  type QueriableDataSource,
  type FeatureLayerQueryParams,
  dataSourceUtils,
  hooks,
  type WidgetInitDragCallback,
} from "jimu-core";
import {
  type ChartElementLimit,
  type UnprivilegedChart,
  type WebMapWebChart,
  getSeriesType,
  type WebChartDataFilters,
} from "jimu-ui/advanced/chart";
import { useChartRuntimeDispatch, useChartRuntimeState } from "../../state";
import { type IWebChart } from "../../../config";
import {
  useSelection,
  normalizeSeries,
  getMinSafeValue,
  getChartLimits,
} from "../utils";
import createRecordsFromChartData, {
  getDataItems,
} from "./convert-chart-data-to-records";
import { ChartComponents } from "../components";
import { WebChartCurrentVersion } from "../../../constants";

interface WithFeatureLayerChartProps {
  className?: string;
  widgetId: string;
  webChart: ImmutableObject<IWebChart>;
  useDataSource?: ImmutableObject<UseDataSource>;
  chartLimits?: Partial<ChartElementLimit>;
  onInitDragHandler: WidgetInitDragCallback;
  propsParseDate: any[];
  onLayerStatusChange?: (status: "loading" | "loaded") => void;
}

const useDataSourceFeatureLayer = (
  dataSourceId: string
): __esri.FeatureLayer => {
  const cancelable = hooks.useCancelablePromiseMaker();
  const [layer, setLayer] = React.useState<__esri.FeatureLayer>(null);
  const sourceStatus = ReactRedux.useSelector(
    (state: IMState) => state.dataSourcesInfo?.[dataSourceId]?.instanceStatus
  );
  const sourceVersion = ReactRedux.useSelector(
    (state: IMState) => state.dataSourcesInfo?.[dataSourceId]?.sourceVersion
  );
  React.useEffect(() => {
    if (sourceStatus !== DataSourceStatus.Created) return;
    let dataSource = DataSourceManager.getInstance().getDataSource(
      dataSourceId
    ) as FeatureLayerDataSource;
    if (!dataSource) {
      console.error(`No data source founded for id: ${dataSourceId}`);
      return;
    }
    if ((dataSource as DataSource).type === DataSourceTypes.SceneLayer) {
      dataSource = (
        dataSource as unknown as SceneLayerDataSource
      ).getAssociatedDataSource();
    }
    cancelable(dataSource.createJSAPILayerByDataSource()).then((layer) => {
      layer.definitionExpression = "";
      setLayer(layer);
    });
  }, [cancelable, dataSourceId, sourceStatus, sourceVersion]);
  return layer;
};

const background = [0, 0, 0, 0] as any;

function WithFeatureLayerChart(
  props: WithFeatureLayerChartProps
): React.ReactElement {
  const {
    className,
    widgetId,
    webChart: propWebChart,
    useDataSource,
    chartLimits: defaultChartLimit,
    onInitDragHandler,
    onLayerStatusChange,
    propsParseDate,
  } = props;

  const chartRef = React.useRef<UnprivilegedChart>(null);
  const type = getSeriesType(propWebChart?.series as any);
  const id = widgetId + "-" + (propWebChart?.id ?? "chart");
  const dispatch = useChartRuntimeDispatch();
  const { outputDataSource, dataSource, queryVersion } = useChartRuntimeState();

  const dataSourceId = useDataSource?.dataSourceId;
  const layer = useDataSourceFeatureLayer(dataSourceId);
  const [version, setVersion] = React.useState(0);
  const onLayerStatusChangeRef = hooks.useLatest(onLayerStatusChange);

  const layerLoadedRef = React.useRef(false);
  React.useEffect(() => {
    if (!layerLoadedRef.current) {
      onLayerStatusChangeRef.current?.(layer ? "loaded" : "loading");
    }
    layerLoadedRef.current = !!layer;
  }, [layer, onLayerStatusChangeRef]);

  // Query params
  const queryParams: FeatureLayerQueryParams = React.useMemo(() => {
    const queryParams =
      (dataSource as QueriableDataSource)?.getCurrentQueryParams() ?? {};
    const pageSize = (dataSource as QueriableDataSource)?.getMaxRecordCount();
    queryParams.pageSize = pageSize;
    return queryParams;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, queryVersion]);

  const timeZone = React.useMemo(() => {
    let timeZone = (dataSource as FeatureLayerDataSource)?.getTimezone();
    if (timeZone) {
      timeZone = dataSourceUtils.getTimezoneAPIFromRuntime(timeZone);
    }
    return timeZone;
  }, [dataSource]);

  const { where, geometry, gdbVersion, time, distance, units, pageSize } =
    queryParams;

  const num = getMinSafeValue(
    pageSize,
    propWebChart.dataSource?.query?.pageSize
  );
  const chartLimits = React.useMemo(
    () => getChartLimits(propWebChart?.series, defaultChartLimit, num),
    [defaultChartLimit, num, propWebChart?.series]
  );

  const webMapWebChart = React.useMemo(() => {
    // Setting chart
    let query = propWebChart.dataSource?.query;
    if (query) {
      query = query.set("pageSize", num);
    }
    const series = normalizeSeries(propWebChart.series, query);

    return propWebChart
      .set("version", WebChartCurrentVersion)
      .without("dataSource")
      .set("series", series)
      .set("id", id)
      .set(
        "background",
        background
      ) as unknown as ImmutableObject<WebMapWebChart>;
  }, [id, propWebChart, num]);

  const runtimeDataFilters = React.useMemo(() => {
    const runtimeDataFilters: WebChartDataFilters = {};
    if (where) {
      runtimeDataFilters.where = where;
    }
    if (geometry) {
      runtimeDataFilters.geometry = geometry as any;
      if (distance && units) {
        runtimeDataFilters.distance = distance;
        runtimeDataFilters.units = units as any;
      }
    }
    return Object.keys(runtimeDataFilters).length
      ? runtimeDataFilters
      : undefined;
  }, [where, geometry, distance, units]);

  hooks.useUpdateEffect(() => {
    if (!chartRef.current || !layer) return;
    if (gdbVersion) {
      layer.gdbVersion = gdbVersion;
    }
    if (time) {
      layer.timeExtent = dataSourceUtils.changeJimuTimeToJSAPITimeExtent(time);
    }
    setVersion((v) => v + 1);
  }, [layer, gdbVersion, time]);

  hooks.useEffectOnce(() => {
    onInitDragHandler?.(null, null, () => {
      if (!chartRef.current) return;
      chartRef.current.refresh(false, false);
    });
  });

  const hanldleCreated = React.useCallback(
    (chart: UnprivilegedChart) => {
      chartRef.current = chart;
      dispatch({ type: "SET_CHART", value: chart });
    },
    [dispatch]
  );

  // Function Get Record and send to redux ??
  const handleDataProcessComplete = hooks.useEventCallback((e) => {
    const dataItems = getDataItems(type, e.detail);
    const records = createRecordsFromChartData(dataItems, outputDataSource);

    dispatch({ type: "SET_RECORDS", value: records });
  });

  const handleDataProcessError = hooks.useEventCallback((e) => {
    dispatch({ type: "SET_RECORDS", value: undefined });
    dispatch({ type: "SET_RECORDS_STATUS", value: "error" });
  });

  const [selectionData, handleSelectionChange] = useSelection(
    widgetId,
    outputDataSource,
    propWebChart.series
  );

  return (
    <>
      {layer && (
        <ChartComponents // Hiển thị biểu đồ
          className={className}
          timeZone={timeZone}
          version={version}
          runtimeDataFilters={runtimeDataFilters}
          webMapWebChart={webMapWebChart}
          layer={layer}
          chartLimits={chartLimits}
          ref={hanldleCreated}
          selectionData={selectionData}
          hideEmptySeriesInLegend={false}
          arcgisChartsSelectionComplete={handleSelectionChange}
          arcgisChartsDataProcessComplete={handleDataProcessComplete}
          arcgisChartsDataProcessError={handleDataProcessError}
        />
      )}
    </>
  );
}

export default WithFeatureLayerChart;
