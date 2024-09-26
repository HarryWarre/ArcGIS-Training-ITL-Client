import { JimuMapView } from "jimu-arcgis";
import {
  DataRecord,
  FeatureLayerDataSource,
  FeatureLayerQueryParams,
} from "jimu-core";
import useAddLayer from "./useAddLayer";

interface ISpatialQuery {
  record: DataRecord;
  datasource: FeatureLayerDataSource;
}

const useSpatialQuery = (jimuMapView: JimuMapView) => {
  // Use Add Point from hooks useAddLayer
  const { addPoint, removeAllPoint } = useAddLayer(jimuMapView);

  const spatialQuery = (
    { record, datasource }: ISpatialQuery,
    symbol: __esri.Symbol
  ) => {
    removeAllPoint();
    const queryParams: FeatureLayerQueryParams = {
      where: "",
      outFields: ["*"],
      returnGeometry: true,
      geometry: record.getGeometry(),
    };

    datasource
      ?.query(queryParams)
      .then((data) => {
        const records = data.records.map((r: DataRecord) => ({
          data: r.getData(),
          GEOMETRY: r.getGeometry(),
        }));
        // console.log("Length of the records", records.length);
        addPoint({ records }, symbol);
      })
      .catch((e) => console.log(e)); // Error logging
  };

  return { spatialQuery, removeAllPoint };
};

export default useSpatialQuery;
