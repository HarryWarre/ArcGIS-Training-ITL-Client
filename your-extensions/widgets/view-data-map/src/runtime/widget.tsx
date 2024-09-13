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

  // Declare Geometry
  // const [geometry, setGeometry] = useState<IPolygon | null>(null);

  // 3 ref datasource
  let DMARef = useRef<DataSource>(null);
  let DHKHRef = useRef<DataSource>(null);
  let ThuyDaiRef = useRef<DataSource>(null);

  //3 Data query
  const [DMAQuery, setDMAQuery] = useState([]);

  let timeout = null as any;

  useEffect(() => {
    // Prevent inaccessbility of the widget when the appToken is not avaible
    if (!appToken) return;

    clearTimeout(timeout);
    getDs();

    return () => {
      clearTimeout(timeout);
    };
  }, [appToken]);

  useEffect(() => {
    if (DMARef.current) {
      getDMAData(DMARef.current);
    }
  }, [isDataSourcesReady, DMAQuery]);

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
      // Query params here --------------------> Can Split to const queryParams = {structure of params} if needs
      // outFields: ["*"],
      outFields: ["OBJECTID", "MADMA", "TENDMA"],
      where: "OBJECTID is not null",
      returnGeometry: true,
      page: 2,
      pageSize: 5,
    });
    const list = []; // The list will contain records with type JSON
    totalDataCount.records.forEach((element) => {
      list.push(element.getData()); // The function retrive data from proxy will convert the Proxy to JSON
    });
    // console.log(list);
    setDMAQuery(list);
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

      {DMAQuery.length > 0 ? <DMA_Table data={DMAQuery} /> : <p>Loading...</p>}
    </>
  );
};

export default Widget;
