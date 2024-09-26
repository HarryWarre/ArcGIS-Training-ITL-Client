import { JimuMapView, loadArcGISJSAPIModules } from "jimu-arcgis";
import { DataRecord, React } from "jimu-core";
import { __esri } from "esri/core/unitUtils";
import useHighLightLayer from "./useHighLightLayer";
import { animationDurationTime } from "../../common/constant";

const { useRef, useEffect } = React;
interface IZoomShape {
  record: DataRecord;
}

const useZoomShape = (jimuMapView: JimuMapView) => {
  const PolygonRef = useRef<typeof __esri.Polygon>(null);
    
  const { hightLightShape } = useHighLightLayer(jimuMapView);

  useEffect(() => {
    if (!jimuMapView) return;

    // Load the polygon module
    loadArcGISJSAPIModules(["esri/geometry/Polygon"]).then(([Polygon]) => {
      PolygonRef.current = Polygon;
    });
  }, [jimuMapView]);

  const zoomToPolygon = ({ record }: IZoomShape) => {
    const Polygon = PolygonRef.current;
    console.log(record);
    jimuMapView.view.when(function () {
      // Zoom to shape
      const polygon = new Polygon({
        rings: record["GEOMETRY"]["rings"],
        spatialReference: record["GEOMETRY"]["spatialReference"],
      });

      jimuMapView.view.goTo(polygon, { duration: animationDurationTime });

      // Highlight Shape
      const symbol = {
        type: "simple-fill",
        style: "solid",
        color: [0, 255, 255, 0.3],
        outline: { color: "#00FFFF", width: 2 },
      };

      hightLightShape({ geometry: polygon, symbol: symbol });
    });
  };

  return { zoomToPolygon };
};

export default useZoomShape;
