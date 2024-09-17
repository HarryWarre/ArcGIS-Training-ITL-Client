/**     Step querry data */

/**
 * 1. Create ref từ DataSourceManager instance
 * 2. Lấy DataSource từ id và Tạo ra DataSource
 * 3. Từ ref = DataSource bắt đầu tạo query
 * 4. Kiểm tra dataSouce, tạo query params
 * 5. Thực hiện query
 */
import {
  FeatureLayerDataSource,
  JimuSceneLayerView,
  MapViewManager,
} from "jimu-arcgis";
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
import {
  dmaQueryAtribute,
  delayTime,
  mapWidgetId,
  ProjectGeocodeURL,
  animationDurationTime,
} from "../../../common/constant";
import { IPolygon } from "@esri/arcgis-rest-types";
import {
  mergeGeometry,
  projectPointGeometryPolygon,
} from "../../../common/function";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  // 3 ref datasource
  let DMARef = useRef<DataSource>(null);
  let DHKHRef = useRef<DataSource>(null);
  let ThuyDaiRef = useRef<DataSource>(null);
  // Highlight ref zone
  const highlightHandler = useRef(null);
  //3 Data query
  const [dataDMA, setDataDMA] = useState(null); // ?
  // Default setting query param
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  let timeout = null as any;

  useEffect(() => {
    // Prevent inaccessbility of the widget when the appToken is not avaible
    if (!appToken) return;
    clearTimeout(timeout);
    getDs();

    if (highlightHandler.current) {
      highlightHandler.current?.remove();
    }

    return () => {
      clearTimeout(timeout);
      highlightHandler.current = null;
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
      setTimeout(() => getDs(), delayTime);
    } // Default inteval
  }

  const getDMAData = async (ds: DataSource) => {
    const _ds = ds as FeatureLayerDataSource;

    const countTotal = await _ds?.query({
      // Query params here --------------------> Can Split to const queryParams = {structure of params} if needs
      // outFields: ["*"],
      outFields: dmaQueryAtribute,
      where: "OBJECTID is not null",
      returnGeometry: true,
      page: page,
      pageSize: pageSize,
    });

    const records = countTotal.records.map((element) => ({
      data: element.getData(),
    }));

    setDataDMA(countTotal);
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
    /**
     * Mô tả hàm zoom:
     * Hàm này sẽ nhận một <row data> từ bảng có dữ liệu dma trước đó
     * 1. Get data source của DMA
     * 2. Tìm dữ liệu geometry của DMA bằng mã DMA
     * 3. GetGeometry as IPolygon (type)
     * 4. Lấy JMapView từ widgetId và viewManager
     * 5. Merge Geometries thành một <shape>
     * 6. Sau khi có shape, sử dụng hàm jmapview.goto(target: shape)
     */

    // The record for zoom, this needs info about OBJECTID and MADMA
    const ds = getDataSourceForIndex(1); // Get first datasource (DMA)

    if (!ds) {
      const notify = () => toast.error("Can not get Datasource");
      notify();
      return;
    }
    if (dataDMA) {
      const geometryDMA = dataDMA.records.find(
        (i: any) =>
          Object.fromEntries(Object.entries(i?.feature?.attributes))?.MADMA ==
          rowData?.MADMA
      );

      const geometry = geometryDMA.getGeometry() as IPolygon;

      const jMapView = await getJimuMapView(mapWidgetId, _viewManager); // Declare jMapView
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

      if (highlightHandler.current) {
        highlightHandler.current?.remove();
      }

      const layerView =
        jMapView.jimuLayerViews[
          mapWidgetId + "-" + props.useDataSources?.[2]?.dataSourceId
        ];
      console.log(layerView);
      // console.log("jMapView.jimuLayerViews", jMapView.jimuLayerViews); //  Print layer views

      highlightHandler.current = (
        layerView as JimuSceneLayerView
      ).view.highlight(rowData.OBJECTID);

      console.log(rowData.OBJECTID);
      // Zoom
      await jMapView.view.goTo({ target: mergedGeometry } ?? {}, {
        // The address where map should zoom
        animate: true,
        duration: animationDurationTime,
      });
    }
  };

  return (
    <>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
      <ToastContainer />
      {props.useDataSources?.map((useDataSource, index) => (
        <DataSourceComponent
          key={`data-source-${index}`}
          useDataSource={useDataSource}
          widgetId={props.id}
        />
      ))}
      {/* {console.log(DMAQuery)} */}
      <DMA_Table
        data={
          dataDMA?.records
            ? dataDMA.records.map((element) => ({
                data: element.getData(),
              }))
            : []
        }
        onClickrow={handleSearchOnMap}
      />
    </>
  );
};

export default Widget;
