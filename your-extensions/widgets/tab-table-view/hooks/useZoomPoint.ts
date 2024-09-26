import { DataRecord, React } from "jimu-core";
import { JimuMapView, loadArcGISJSAPIModules } from "jimu-arcgis";
import { __esri } from "esri/core/unitUtils";
import useHighlightLayer from "./useHighLightLayer";
const { useEffect, useRef } = React;

interface IZoomToShape {
  record: DataRecord;
}

const useZoomShape = (jimuMapView: JimuMapView) => {
  const PointRef = useRef<typeof __esri.Point>(null);
  const { hightLightShape } = useHighlightLayer(jimuMapView);

  useEffect(() => {
    if (jimuMapView) return;
    // Load Point module instead of Polygon
    loadArcGISJSAPIModules(["esri/geometry/Point"]).then(([Point]) => {
      PointRef.current = Point;
    });
  }, [jimuMapView]);

  const zoomToPoint = ({ record }: IZoomToShape) => {
    // Get Point class
    const Point = PointRef.current;
    // Map is loaded
    jimuMapView.view.when(function () {
      // Zoom to point
      const point = new Point({
        x: record.getGeometry()["x"],
        y: record.getGeometry()["y"],
        z: record.getGeometry()["z"], // Optional, depending on if `z` exists
        spatialReference: record.getGeometry()["spatialReference"],
      });
      jimuMapView.view.goTo({
        target: point,
        zoom: 50,
        duration: 3000,
        animate: true,
      });

      // Highlight point
      const symbol = {
        type: "simple-marker", // Symbol for point
        style: "circle",
        color: [0, 255, 255, 0.9],
        size: "12px",
        outline: { color: "#00FFFF", width: 2 },
      };
      hightLightShape({ geometry: point, symbol: symbol });
    });
  };

  return { zoomToPoint };
};

export default useZoomShape;
