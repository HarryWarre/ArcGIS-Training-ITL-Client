import {
  AllWidgetProps,
  DataSource,
  DataSourceManager,
  IMState,
  React,
} from "jimu-core";
import { useSelector } from "react-redux";
import { Box, Tabs, Tab } from "@mui/material";
import { FeatureLayerDataSource, MapViewManager } from "jimu-arcgis";
import DHKH_Table from "../components/dhkh-table";
import ThuyDai_Table from "../components/thuy-dai-table";
import { eDMA } from "../../../view-data-map/src/extensions/my-store";

const useState = React.useState;
const useRef = React.useRef;
const useEffect = React.useEffect;

// Widget ---------------->
const Widget = (props: AllWidgetProps<any>) => {
  // Create 2 ref contain data source
  let dhkhRef = useRef<DataSource>(null);
  let thuyDaiRef = useRef<DataSource>(null);

  const [tabValue, setTabValue] = useState("dhkh");

  // Create 2 state contain data from query
  const [dhkhQuery, setDHKHQuery] = useState([]);
  const [thuyDaiQuery, setThuyDaiQuery] = useState([]);
  const [headerHDKH, setHeaderHDKH] = useState([]);
  const [headerThuyDai, setHeaderThuyDai] = useState([]);

  // Get the data from datasource
  //1. Get token
  const appToken = useSelector((state: IMState) => state.token);
  //2. State get DataSource
  const [isDataSourcesReady, setIsDataSourceReady] = useState(false);
  //3. Access the map
  const { current: _viewManager } = useRef(MapViewManager.getInstance());

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
    // Use function get DHKH
    if (dhkhRef.current) {
      getDHKHData();
    }
    // Usse function get ThuyDai
    if (thuyDaiRef.current) {
      getThuyDaiData();
    }
  }, [isDataSourcesReady]);

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

      clearTimeout(timeout);
    } else {
      setTimeout(() => getDs(), 300);
    } // Default inteval
  };

  //Function query Dong Ho Khach Hang data from datasource (ref)
  const getDHKHData = async () => {
    const query = {
      outfields: ["*"],
      where: "OBJECTID is not null",
      returnGeometry: true,
      // pageSize: 5,
    };
    const featureLayer = dhkhRef.current as FeatureLayerDataSource;
    const dataQuery = await featureLayer?.query(query);

    dataQuery.records.forEach((element) => {
      setDHKHQuery((prevDHKHQuery) => [...prevDHKHQuery, element.getData()]);
    });
  };

  //Function query Thuy Dai data from datasource (ref)
  const getThuyDaiData = async () => {
    const query = {
      outfields: ["*"],
      where: "OBJECTID is not null",
      returnGeometry: true,
      // pageSize: 5,
    };
    const featureLayer = thuyDaiRef.current as FeatureLayerDataSource;
    const dataQuery = await featureLayer?.query(query);
    dataQuery.records.forEach((element) => {
      setThuyDaiQuery((prefThuyDaiQuery) => [
        ...prefThuyDaiQuery,
        element.getData(),
      ]);
    });
  };

  // const dmaRecieve = useSelector(
  //   (state: IMState) => state.widgetsState?.[`${eDMA.storeKey}`]?.DMAContext // WidgetID.propkey (from table in view-data-map)
  // );
  // if (dmaRecieve !== undefined) {
  //   console.log(dmaRecieve);
  // }

  // Handle Change Tab
  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Box>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          aria-label='secondary tabs example'>
          <Tab value='dhkh' label='Đồng Hồ Khách hàng' />
          <Tab value='thuydai' label='Thủy Đài' />
        </Tabs>

        <TabPanel value={tabValue} index='dhkh'>
          <DHKH_Table data={dhkhQuery} columnHeader={headerHDKH} />
        </TabPanel>

        <TabPanel value={tabValue} index='thuydai'>
          <ThuyDai_Table data={thuyDaiQuery} columnHeader={headerThuyDai} />
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
