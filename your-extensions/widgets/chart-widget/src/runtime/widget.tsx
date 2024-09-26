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
} from "../../../../node_plugin/node_modules/@mui/material";
import { useSelector } from "react-redux";
import { MapViewManager } from "jimu-arcgis";
import {
  propsChart_DongHoKhachHang,
  propsChart_DMA,
} from "../../../common/constant";
import ChartComponent from "../../../components/charts";
import { feartureDhkh, feartureDMA } from "./chart";
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

  // Get datasource
  let timeout = null as any;

  // state data of dhkh
  const [dataChart, setDataChart] = useState([]);
  const [filterDataChart, setFilterDataChart] = useState({});

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
          default:
            getDHKHRecords();
            break;
        }
      }
    }
  }, [isDataSourceReady, selectedLayer]);

  useEffect(() => {
    if (dataChart.length > 0) {
      if (selectedLayer === "dhkh") filterDHKH();
      else if (selectedLayer === "dma") filterDMA();
    }
  }, [dataChart]);

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

      // Save 2 ref with datasource
      dhkhRef.current = dsArr[0];
      dmaRef.current = dsArr[1];

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

  // Use simple query to get [records] of 2 type data
  const getDHKHRecords = async () => {
    const records = getRecords(
      dhkhRef.current as FeatureLayerDataSource,
      feartureDhkh
    );
    // setDataChart([]);
    const newData = [];
    (await records).forEach((record) => {
      newData.push(record.getData());
    });
    setDataChart(newData);
  };

  const getdmaRecords = async () => {
    const records = getRecords(
      dmaRef.current as FeatureLayerDataSource,
      feartureDMA
    );
    const newData = [];
    (await records).forEach((record) => {
      newData.push(record.getData());
    });
    setDataChart(newData);
  };

  // Filter data section
  // Function to filter dong ho khach hang, which is count the number of each size [CO DONG HO]

  // Function filter Thuy Dai Data
  const filterDHKH = () => {
    if (dataChart && dataChart.length > 0) {
      const result = {}; // Object to store the count of each 'Cỡ đồng hồ'
      dataChart.forEach((element) => {
        const coDongHo = element[feartureDhkh[0]]; // Get Value

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
        const districtName = String(record[feartureDMA[0]])
          .split("-")[0]
          .trim(); // Get district's name
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

  const handleLayerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLayer(event.target.value); // cập nhật state khi giá trị thay đổi
  };

  return (
    <div>
      {filterDataChart != null ? (
        <>
          <FormControl>
            <FormLabel id='demo-row-radio-buttons-group-label'>
              Choose layer datasource
            </FormLabel>
            <RadioGroup
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
              <FormControlLabel value='dma' control={<Radio />} label='DMA' />
            </RadioGroup>
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
