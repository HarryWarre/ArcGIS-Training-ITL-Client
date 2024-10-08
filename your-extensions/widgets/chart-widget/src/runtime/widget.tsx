import {
  DataRecord,
  DataSource,
  DataSourceManager,
  FeatureLayerDataSource,
  IMState,
  React,
  type AllWidgetProps,
} from "jimu-core";
import { type IMConfig } from "../config";
import {
  FormControl,
  Box,
  CircularProgress,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Autocomplete,
} from "../../../../node_plugin/node_modules/@mui/material";
import { useSelector } from "react-redux";
import { MapViewManager } from "jimu-arcgis";
import {
  propsChart_DongHoKhachHang,
  propsChart_DMA,
  propsChart_ThuyDai,
} from "../../../common/constant";
import ChartComponent from "../../../components/charts";
import { eDMA } from "../../../view-data-map/src/extensions/my-store";
// import { feartureDhkh, feartureDMA } from "./chart";

// Hooks
const { useEffect, useState, useRef } = React;

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const appToken = useSelector((state: IMState) => state.token);
  const { current: _viewManager } = useRef(MapViewManager.getInstance());
  const [isDataSourceReady, setIsDataSourceReady] = useState(false);

  const [propsChart, setPropsChart] = useState(propsChart_DongHoKhachHang);

  const [selectedLayer, setSelectedLayer] = useState("dhkh");

  // 2 Ref of datasource
  const dhkhRef = useRef(null);
  const dmaRef = useRef(null);
  const thuyDaiRef = useRef(null);

  // Get datasource
  let timeout = null as any;

  // state data of dhkh
  const [dataChart, setDataChart] = useState([]);
  const [filterDataChart, setFilterDataChart] = useState({});

  // Get Config
  const [featureDhkh, setFeatureDhkh] = useState<string[]>([]);
  const [featureDMA, setFeatureDMA] = useState<string[]>([]);
  const [featureThuyDai, setFeatureThuyDai] = useState<string[]>([]);

  // Recieve Data from redux
  const dhkhReceive = useSelector(
    (state: IMState) => state.widgetsState?.[`${eDMA.storeKey}`]?.DMAContext
  );

  const thuyDaiReceive = useSelector(
    (state: IMState) => state.widgetsState?.[`${eDMA.storeKey}`]?.ThuyDaiContext
  );

  const options = [
    { value: "dhkh", label: "Đồng hồ khách hàng" },
    { value: "thuydai", label: "Thủy Đài" },
    // { value: 'dma', label: 'DMA' },
  ];

  useEffect(() => {
    // Get value from props config
    const config = props.config.outfieldsSetting;

    if (config) {
      // Get JSON
      const parsedConfig =
        typeof config === "string" ? JSON.parse(config) : config;

      // Access JSON
      setFeatureDhkh(parsedConfig.DHKH || []);
      setFeatureDMA(parsedConfig.DMA || []);
      setFeatureThuyDai(parsedConfig.ThuyDai || []);
    }
  }, [props.config.outfieldsSetting]);
  // Use effect
  // *** ***
  //Get Token
  useEffect(() => {
    if (!appToken) return;
    clearTimeout(timeout);

    // Get datasources
    getDs();

    return () => {
      clearTimeout(timeout);
    };
  }, [appToken]);

  useEffect(() => {
    // setDataChart([]);
    if (isDataSourceReady) {
      if (dhkhRef.current && dmaRef.current) {
        switch (selectedLayer) {
          case "dhkh":
            getDHKHRecords();
            break;
          case "dma":
            getdmaRecords();
            break;
          case "thuydai":
            getThuyDaiRecord();
            break;
          default:
            getDHKHRecords();
            break;
        }
      }
    }
  }, [isDataSourceReady, selectedLayer, dhkhReceive, thuyDaiReceive]);

  useEffect(() => {
    if (dataChart.length >= 0) {
      if (selectedLayer === "dhkh") filterDHKH();
      else if (selectedLayer === "dma") filterDMA();
      else if (selectedLayer === "thuydai") filterThuyDai();
    }
  }, [dataChart]);

  // useEffect(() => {
  //   console.log(filterDataChart);
  // }, [filterDataChart]);

  // Get type data from redux and set the props chart for each chart
  useEffect(() => {
    if (selectedLayer) {
      switch (selectedLayer) {
        case "dhkh":
          setPropsChart(propsChart_DongHoKhachHang);
          break;
        case "dma":
          setPropsChart(propsChart_DMA);
          break;
        case "thuydai":
          setPropsChart(propsChart_ThuyDai);
          break;
        default:
          setPropsChart(propsChart_DongHoKhachHang); // Default
          break;
      }
    }
  }, [selectedLayer]);

  // Get datasource
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

      // Save 3 ref with datasource
      dhkhRef.current = dsArr[0];
      dmaRef.current = dsArr[1];
      thuyDaiRef.current = dsArr[2];

      clearTimeout(timeout);
    } else {
      setTimeout(() => getDs(), 300);
    }
  };

  // Simpe query get records
  const getRecords = async (
    datasource: FeatureLayerDataSource,
    config = null
  ) => {
    const defaultQuery = {
      outfields: config ? config : ["*"],
      where: "OBJECTID is not null",
      returnGeometry: true,
    };
    return (await datasource?.query(defaultQuery)).records;
  };

  // Use simple query to get [records] of 3 type data
  const getDHKHRecords = async () => {
    const records = getRecords(
      dhkhRef.current as FeatureLayerDataSource,
      featureDhkh
    );
    // setDataChart([]);
    const newData = [];
    (await records).forEach((record) => {
      newData.push(record.getData());
    });
    dhkhReceive ? setDataChart(dhkhReceive) : setDataChart(newData);
  };

  const getdmaRecords = async () => {
    const records = getRecords(
      dmaRef.current as FeatureLayerDataSource,
      featureDMA
    );
    const newData = [];
    (await records).forEach((record) => {
      newData.push(record.getData());
    });
    setDataChart(newData);
  };

  const getThuyDaiRecord = async () => {
    const records = getRecords(thuyDaiRef.current as FeatureLayerDataSource);
    const newData = [];
    (await records).forEach((record) => {
      newData.push(record.getData());
    });
    thuyDaiReceive ? setDataChart(thuyDaiReceive) : setDataChart(newData);
  };

  // Filter data section
  // Function to filter dong ho khach hang, which is count the number of each size [CO DONG HO]

  // Function filter Thuy Dai Data
  const filterDHKH = () => {
    if (dataChart && dataChart.length > 0) {
      const result = {}; // Object to store the count of each 'Cỡ đồng hồ'
      dataChart.forEach((element) => {
        const coDongHo = element[featureDhkh[0]]; // Get Value

        if (result[coDongHo]) {
          result[coDongHo] += 1; // Increase when exists
        } else {
          result[coDongHo] = 1; // Create new if not exist with default count
        }
      });
      setFilterDataChart(result);
    }
  };

  const filterDMA = () => {
    if (dataChart && dataChart.length > 0) {
      const filter = dataChart.reduce((acc, record) => {
        const districtName = String(record[featureDMA[0]]).split("-")[0].trim(); // Get district's name
        if (acc[districtName]) {
          acc[districtName] += 1; // If the name exists, increment its count
        } else {
          acc[districtName] = 1; // If the name doesn't exist, create it with a count of 1
        }
        return acc;
      }, {});
      setFilterDataChart(filter);
    }
  };

  // thuydaifilter
  const filterThuyDai = () => {
    if (dataChart && dataChart.length > 0) {
      const result = {}; // Object to store the count of each 'Cỡ đồng hồ'
      dataChart.forEach((element) => {
        const tinhtrang = element[featureThuyDai[0]]; // Get Value

        if (result[tinhtrang]) {
          result[tinhtrang] += 1; // Increase when exists
        } else {
          result[tinhtrang] = 1; // Create new if not exist with default count
        }
      });
      setFilterDataChart(result);
    } else {
      console.log("Test");
      setFilterDataChart({});
    }
  };

  const handleLayerChange = (event, newValue) => {
    setSelectedLayer(newValue ? newValue.value : "dhkh");
  };

  return (
    <div>
      {filterDataChart != null ? (
        <>
          <FormControl sx={{ pl: 1 }}>
            <FormLabel id='demo-row-radio-buttons-group-label'>
              Chọn lớp Datasource
            </FormLabel>
            {/* <RadioGroup
              row
              aria-labelledby='demo-row-radio-buttons-group-label'
              name='row-radio-buttons-group'
              value={selectedLayer}
              onChange={handleLayerChange}>
              <FormControlLabel
                value='dhkh'
                control={<Radio />}
                label='Đồng hồ khách hàng'
              />
              <FormControlLabel
                value='thuydai'
                control={<Radio />}
                label='Thủy Đài'
              />
            </RadioGroup> */}

            <Autocomplete
              sx={{ width: 300 }}
              options={options}
              getOptionLabel={(option) => option.label}
              onChange={handleLayerChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='outlined'
                  label='Đồng hồ khách hàng'
                />
              )}
              // Chỉnh sửa thêm ở đây nếu cần
            />
          </FormControl>

          {/* Render Charts */}
          <ChartComponent
            title={propsChart.title}
            description={propsChart.description}
            data={filterDataChart}
          />
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <CircularProgress />
        </Box>
      )}
    </div>
  );
};

export default Widget;
