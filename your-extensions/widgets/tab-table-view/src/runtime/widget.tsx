import {
  AllWidgetProps,
  appActions,
  DataRecord,
  DataSource,
  DataSourceManager,
  FeatureLayerQueryParams,
  IMState,
  React,
} from "jimu-core";
import { useSelector } from "react-redux";
import {
  Box,
  Tabs,
  Tab,
} from "../../../../node_plugin/node_modules/@mui/material";
import { FeatureLayerDataSource, MapViewManager } from "jimu-arcgis";
import useSpatialQuery from "../../../tab-table-view/hooks/useSpatialQuery";
import { getJimuMapView } from "../../../common/fucntion-map";
import {
  mapWidgetId,
  prioritizedFieldsDHKH,
  prioritizedFieldsThuyDai,
  queryAll,
} from "../../../common/constant";
import useZoomPoint from "../../../tab-table-view/hooks/useZoomPoint";
import { thuydaiPointSymbol } from "../../../common/symbols";
import TabTable from "../components/tab-table";
import useAddLayer from "../../../tab-table-view/hooks/useAddLayer";
import { useDispatch } from "react-redux";
import { eDMA } from "../../../view-data-map/src/extensions/my-store";
import { showAreaOnMap, zoomToMapByExtent } from "./function";
import Point from "@arcgis/core/geometry/Point";
import { Extent } from "@arcgis/core/geometry";

const useState = React.useState;
const useRef = React.useRef;
const useEffect = React.useEffect;

// Widget ---------------->
const Widget = (props: AllWidgetProps<any>) => {
  const dhkhReceive = useSelector(
    (state: IMState) => state.widgetsState?.[`${eDMA.storeKey}`]?.DMAContext
  );

  const thuyDaiReceive = useSelector(
    (state: IMState) => state.widgetsState?.[`${eDMA.storeKey}`]?.ThuyDaiContext
  );

  const [tabValue, setTabValue] = useState("dhkh");
  const dispatch = useDispatch();
  // Create 2 ref contain data source
  let dhkhRef = useRef<DataSource>(null);
  let thuyDaiRef = useRef<DataSource>(null);
  // Create 2 state contain data from query
  const [dhkhQuery, setDHKHQuery] = useState([]);
  const [thuyDaiQuery, setThuyDaiQuery] = useState([]);
  const [headerHDKH, setHeaderHDKH] = useState([]);
  const [headerThuyDai, setHeaderThuyDai] = useState([]);
  const [jMapView, setjMapView] = useState(null);
  const [mapingFieldsDHKH, setmapingFieldsDHKH] = useState(null);
  const [mapingFieldsThuyDai, setmapingFieldsThuyDai] = useState(null);
  const [codeFieldsDHKH, setCodeFieldsDHKH] = useState(null);
  const [codeFieldsThuyDai, setCodeFieldsThuyDai] = useState(null);

  // Get the data from datasource
  //1. Get token
  const appToken = useSelector((state: IMState) => state.token);
  //2. State get DataSource
  const [isDataSourcesReady, setIsDataSourceReady] = useState(false);
  //3. Access the map
  const { current: _viewManager } = useRef(MapViewManager.getInstance());
  // Use hooks
  const { addPoint, removeAllPoint } = useAddLayer(jMapView);
  const { zoomToPoint } = useZoomPoint(jMapView);

  let timeout = null as any;

  useEffect(() => {
    // Prevent inaccessbility of the widget when the appToken is not avaible
    if (!appToken) return;
    clearTimeout(timeout);

    //Get datasources
    getDs();

    return () => {
      clearTimeout(timeout);
    };
  }, [appToken]);

  // Get data from query function
  useEffect(() => {
    if (isDataSourcesReady) {
      // Use function get DHKH
      if (dhkhRef.current) {
        getDHKHData();
      }
      // Usse function get ThuyDai
      if (thuyDaiRef.current) {
        getThuyDaiData();
      }

      getJMapview();
    }
  }, [isDataSourcesReady, jMapView]);

  useEffect(() => {
    if (mapingFieldsDHKH) {
      if (mapingFieldsDHKH.length > 0) {
        // Lọc những field có giá trị trong codevalues
        const validFields = mapingFieldsDHKH.filter(
          (field) => field?.domain?.codedValues
        );

        // Lưu các field hợp lệ vào state
        setCodeFieldsDHKH(validFields);
      }
    }

    if (mapingFieldsThuyDai) {
      if (mapingFieldsThuyDai.length > 0) {
        // Lọc những field có giá trị trong codevalues
        const validFields = mapingFieldsThuyDai.filter(
          (field) => field?.domain?.codedValues
        );

        // Lưu các field hợp lệ vào state
        setCodeFieldsThuyDai(validFields);
      }
    }
  }, [mapingFieldsDHKH, mapingFieldsThuyDai]);

  useEffect(() => {
    if (codeFieldsDHKH) {
      console.log(codeFieldsDHKH[0]);
    }
    if (codeFieldsThuyDai) {
      console.log(codeFieldsThuyDai[0]);
    }
  }, [codeFieldsDHKH, codeFieldsThuyDai]);

  const getJMapview = async () => {
    setjMapView(await getJimuMapView(mapWidgetId, _viewManager));
  };

  // Function get datasources from props
  const getDs = async () => {
    const dsArr: DataSource[] = [];

    props.useDataSources?.forEach((useDataSource, index) => {
      const ds = DataSourceManager.getInstance().getDataSource(
        useDataSource?.dataSourceId
      );
      dsArr.push(ds);
    });

    if (dsArr.every((e) => e)) {
      setIsDataSourceReady(true);
      //Save 2 ref with datasource
      dhkhRef.current = dsArr[0];
      thuyDaiRef.current = dsArr[1];

      // Get list header for table
      const fieldsHDKH = (await dhkhRef.current.fetchSchema()).fields;
      const fieldsThuyDai = (await thuyDaiRef.current.fetchSchema()).fields;

      // Get list alias
      const aliasDHKHArray = Object.values(fieldsHDKH).map(
        (field) => field.alias
      );

      const aliasThuyDaiArray = Object.values(fieldsThuyDai).map(
        (field) => field.alias
      );

      setHeaderHDKH(aliasDHKHArray);
      setHeaderThuyDai(aliasThuyDaiArray);
      setmapingFieldsDHKH(dsArr[1]["layerDefinition"]["fields"]);
      setmapingFieldsThuyDai(dsArr[0]["layerDefinition"]["fields"]);
      clearTimeout(timeout);
    } else {
      setTimeout(() => getDs(), 300);
    } // Default inteval
  };

  //Function query Dong Ho Khach Hang data from datasource (ref)
  const getDHKHData = async () => {
    if (isDataSourcesReady) {
      const featureLayer = dhkhRef.current as FeatureLayerDataSource;
      const queryParams: FeatureLayerQueryParams = {
        where: "",
        outFields: ["*"],
        returnGeometry: true,
      };

      const dataQuery = await featureLayer?.query(queryParams);
      dataQuery.records.forEach((element) => {
        setDHKHQuery((prevDHKHQuery) => [...prevDHKHQuery, element.getData()]);
      });
    }
  };

  //Function query Thuy Dai data from datasource (ref)
  const getThuyDaiData = async () => {
    // console.log(jMapView);
    const featureLayer = thuyDaiRef.current as FeatureLayerDataSource;
    const dataQuery = await featureLayer?.query(queryAll);

    dataQuery.records.forEach((record) => {
      setThuyDaiQuery((prevThuyDaiQuery) => [
        ...prevThuyDaiQuery,
        record.getData(),
      ]);
    });
  };

  // Zoom to a specific feature on the map based on the selected row data
  const handleZoomOnMap = async (rowData, featureLayerName) => {
    let featureLayer: FeatureLayerDataSource;
    switch (featureLayerName) {
      case "dhkh":
        featureLayer = dhkhRef.current as FeatureLayerDataSource;
        break;
      case "thuydai":
        featureLayer = thuyDaiRef.current as FeatureLayerDataSource;
        break;
      default:
        featureLayer = dhkhRef.current as FeatureLayerDataSource;
        break;
    }
    const dataQuery = await featureLayer.query(queryAll);

    const record = dataQuery.records.find(
      (r) => r.getData().OBJECTID === rowData.OBJECTID
    );

    // jMapView && zoomToPoint({ record });

    const point = new Point({
      x: record.getGeometry()["x"],
      y: record.getGeometry()["y"],
      z: record.getGeometry()["z"], // Optional
      spatialReference: record.getGeometry()["spatialReference"],
    });

    const buffer = 1;

    if (jMapView && _viewManager) {
      const extent = new Extent({
        xmin: point.x - buffer,
        ymin: point.y - buffer,
        xmax: point.x + buffer,
        ymax: point.y + buffer,
        spatialReference: point.spatialReference,
      });

      await zoomToMapByExtent(extent, _viewManager, mapWidgetId);
      // zoomToPoint({ record });
      await showAreaOnMap(jMapView, point, 5);
    }
  };

  // Handle tab change between DHKH and Thuy Dai
  const handleChangeTab = async (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setTabValue(newValue);
    if (isDataSourcesReady) {
      switch (newValue) {
        case "dhkh":
          removeAllPoint();
          dispatch(
            appActions.widgetStatePropChange(
              "widget14",
              "typeChartData",
              "dhkh"
            )
          );
          break;
        case "thuydai":
          removeAllPoint();
          dispatch(
            appActions.widgetStatePropChange(
              "widget14",
              "typeChartData",
              "thuydai"
            )
          );
          const thuydaiFeatureLayer =
            thuyDaiRef.current as FeatureLayerDataSource;
          await thuydaiFeatureLayer
            ?.query(queryAll)
            .then((data) => {
              const records = data.records.map((r: DataRecord) => ({
                data: r.getData(),
                GEOMETRY: r.getGeometry(),
              }));
              // console.log("Length of the records", records.length);
              addPoint({ records }, thuydaiPointSymbol);
            })
            .catch((e) => console.log(e));

          break;
        default:
      }
    }
  };

  return (
    <>
      <Box>
        <Tabs value={tabValue} onChange={handleChangeTab}>
          <Tab value='dhkh' label='Đồng Hồ Khách hàng' />
          <Tab value='thuydai' label='Thủy Đài' />
        </Tabs>

        <TabPanel value={tabValue} index='dhkh'>
          <TabTable
            data={dhkhReceive ? dhkhReceive : dhkhQuery}
            columnHeader={headerHDKH}
            onClickRow={handleZoomOnMap}
            featureLayerName='dhkh'
            prioritizedFields={prioritizedFieldsDHKH}
            fields={codeFieldsDHKH}
          />
        </TabPanel>

        <TabPanel value={tabValue} index='thuydai'>
          <TabTable
            data={
              thuyDaiReceive && Object.keys(thuyDaiReceive).length > 0
                ? thuyDaiReceive
                : thuyDaiQuery
            }
            columnHeader={headerThuyDai}
            featureLayerName='thuydai'
            onClickRow={handleZoomOnMap}
            prioritizedFields={prioritizedFieldsThuyDai}
            fields={codeFieldsThuyDai}
          />
        </TabPanel>
      </Box>
    </>
  );
};

export default Widget;

// Create Tab Panel ---------------->
interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
