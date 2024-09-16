/**     Step querry data */

/**
 * 1. Create ref từ DataSourceManager instance
 * 2. Lấy DataSource từ id và Tạo ra DataSource
 * 3. Từ ref = DataSource bắt đầu tạo query
 * 4. Kiểm tra dataSouce, tạo query params
 * 5. Thực hiện query
 */
import { FeatureLayerDataSource, MapViewManager } from "jimu-arcgis";
import {
  AllWidgetProps,
  DataSource,
  DataSourceComponent,
  DataSourceManager,
  IMState,
  React,
} from "jimu-core";
import { useSelector } from "react-redux";
import DMA_Table from "../components/table";
import { getJimuMapView } from "../../../common/fucntion-map";
import { mapWidgetId, ProjectGeocodeURL } from "../../../common/constant";
import { IPolygon } from "@esri/arcgis-rest-types";
import {
  mergeGeometry,
  projectPointGeometryPolygon,
} from "../../../common/function";

//Declear Hooks
const useState = React.useState;
const useEffect = React.useEffect;
const useRef = React.useRef;

// Widget start here  --------------->
const Widget = (props: AllWidgetProps<any>) => {
  //Get app token
  const appToken = useSelector((state: IMState) => state.token);

  //State get DataSource
  const [isDataSourcesReady, setIsDataSourceReady] = useState(false);
  // Access the map
  const { current: _viewManager } = useRef(MapViewManager.getInstance());

  const [jimuMapView, setJimuMapView] = useState(null);
  // 3 ref datasource
  let DMARef = useRef<DataSource>(null);
  let DHKHRef = useRef<DataSource>(null);
  let ThuyDaiRef = useRef<DataSource>(null);

  // Highlight ref zone
  // const highlightHandler = useRef(null);

  //3 Data query
  const [DMAQuery, setDMAQuery] = useState([]);
  const [queryDMA, setQueryDMA] = useState(null);
  let timeout = null as any;

  useEffect(() => {
    // Prevent inaccessbility of the widget when the appToken is not avaible
    if (!appToken) return;

    clearTimeout(timeout);
    getDs();

    // if (highlightHandler.current) {
    //   highlightHandler.current?.remove();
    // }

    return () => {
      clearTimeout(timeout);
    };
  }, [appToken]);

  useEffect(() => {
    if (DMARef.current) {
      getDMAData(DMARef.current);
    }
  }, [isDataSourcesReady]);

  async function getDs() {
    const dsArr: DataSource[] = [];

    props.useDataSources?.forEach((useDataSource, index) => {
      const ds = DataSourceManager.getInstance().getDataSource(
        useDataSource?.dataSourceId
      );
      dsArr.push(ds);
    });

    if (dsArr.every((e) => e)) {
      setIsDataSourceReady(true);
      DMARef.current = dsArr[2];
      DHKHRef.current = dsArr[0];
      ThuyDaiRef.current = dsArr[1];
      clearTimeout(timeout);
    } else {
      setTimeout(() => getDs(), 300);
    } // Default inteval
  }

  const getDMAData = async (ds: DataSource) => {
    const _ds = ds as FeatureLayerDataSource;

    const totalDataCount = await _ds?.query({
      // tên biến
      // tên biến count total
      // Query params here --------------------> Can Split to const queryParams = {structure of params} if needs
      // outFields: ["*"],
      outFields: ["OBJECTID", "MADMA", "TENDMA"], // commons => Constant
      where: "OBJECTID is not null",
      returnGeometry: true,
      page: 2, // state
      pageSize: 5,
    });

    const list = totalDataCount.records.map((element) => ({
      data: element.getData(),
    }));

    setQueryDMA(totalDataCount);

    setDMAQuery(list);
  };

  //  Function get Datasource from index
  const getDataSourceForIndex = (index) =>
    _getFeatureLayerDataSource(props.useDataSources?.[index]?.dataSourceId);

  function _getFeatureLayerDataSource(dataSourceId: string) {
    return DataSourceManager.getInstance().getDataSource(dataSourceId) as
      | FeatureLayerDataSource
      | undefined;
  }

  const handleSearchOnMap = async (rowData) => {
    // The record for zoom, this needs info about OBJECTID and MADMA
    const ds = getDataSourceForIndex(0); // Get first datasource (DMA)

    if (!ds) {
      alert("khong lay dc du lieu"); // Tích hợp thư viện notify
      return;
    }

    const geometryDMA = queryDMA.records.find(
      (i: any) =>
        Object.fromEntries(Object.entries(i?.feature?.attributes))?.MADMA ==
        rowData?.MADMA
    );

    const geometry = geometryDMA.getGeometry() as IPolygon;

    const jMapView = await getJimuMapView(mapWidgetId, _viewManager); // Declare jMapView & what is mapWidgetId ??
    // console.log(jMapView);
    const { geometries } = await projectPointGeometryPolygon(
      ProjectGeocodeURL,
      geometry?.spatialReference, // Input Spacial
      jMapView?.view?.spatialReference, // Expected Spacial
      geometry?.rings // Point to create the Geometry
    );

    if (!geometries) {
      return;
    }

    /**
     * Merge Geometries to one shape
     */
    const mergedGeometry = mergeGeometry(
      geometries?.map((geo) => ({
        type: "point",
        ...geo,
        spatialReference: jMapView.view.spatialReference,
      }))
    );

    if (!mergedGeometry) {
      return;
    }

    // if (highlightHandler.current) {
    //   highlightHandler.current?.remove();
    // }

    // console.log("jMapView.jimuLayerViews", jMapView.jimuLayerViews); //  Print layer views

    // const layterView =
    //   jMapView.jimuLayerViews[
    //     mapWidgetId + "-" + props.useDataSources?.[0]?.dataSourceId
    //   ];

    // highlightHandler.current = (
    //   layterView as JimuSceneLayerView
    // ).view.highlight(rowData.OBJECTID);

    // console.log(highlightHandler);
    // console.log(mergeGeometry);

    // Zoom
    await jMapView.view.goTo({ target: mergedGeometry } ?? {}, {
      animate: true,
      duration: 1000,
    });
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
      {/* {console.log(DMAQuery)} */}
      <DMA_Table data={DMAQuery} onClickrow={handleSearchOnMap} />
    </>
  );
};

export default Widget;
