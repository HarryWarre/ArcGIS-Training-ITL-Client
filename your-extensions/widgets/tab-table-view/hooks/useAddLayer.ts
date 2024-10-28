/**
 * Step tạo một point
 * 1. Load module
 * 2. Vẽ point
 * 2.1. Xóa toàn bộ point trước khi thêm mới
 * 2.2. Khai báo một point mới ở dạng IAddShape (geometry)
 * 2.3 Thêm point mới vào một lớp graphic
 * 2.4 Thên graphic vào một layer
 * 2.5 Thêm layer vào một map
 * Trả về map với layer mới chứa graphic có point
 */

import { IGeometry } from "@esri/arcgis-rest-types";
import { JimuMapView, loadArcGISJSAPIModules } from "jimu-arcgis";
import { React } from "jimu-core";
const { useRef, useEffect } = React;

interface IAddShape {
  records: { GEOMETRY: IGeometry }[];
}

const useAddLayer = (jimuMapView: JimuMapView) => {
  const GraphicsLayerRef = useRef<__esri.GraphicsLayer | null>(null);
  const GraphicRef = useRef<typeof __esri.Graphic | null>(null);
  const PointRef = useRef<typeof __esri.Point | null>(null);

  useEffect(() => {
    if (!jimuMapView) return;

    (() => {
      loadArcGISJSAPIModules([
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/geometry/Point",
      ])
        .then(([GraphicsLayer, Graphic, Point]) => {
          GraphicsLayerRef.current = new GraphicsLayer();
          GraphicRef.current = Graphic;
          PointRef.current = Point;
        })
        .catch((err) => {
          console.error("Error loading ArcGIS modules:", err);
        });
    })();
  }, [jimuMapView]);

  useEffect(() => {
    // Remove all Point first
    if (!jimuMapView) return;
    const handle = jimuMapView.view.on("click", removeAllPoint);
    // return () => handle.remove();
  }, [jimuMapView]);

  const addPoint = ({ records }: IAddShape, symbol: __esri.Symbol) => {
    // Get graphic class
    const graphicsLayer = GraphicsLayerRef.current;
    const Graphic = GraphicRef.current;
    const Point = PointRef.current;
    // removeAllPoint();
    records.forEach((record) => {
      const point = new Point({
        x: record["GEOMETRY"]["x"],
        y: record["GEOMETRY"]["y"],
        spatialReference: record["GEOMETRY"]["spatialReference"],
      });
      // Create the Feature Layer from geometry
      const extentGraphic = new Graphic({
        geometry: point,
        symbol: symbol,
      });
      // Add graphic into the layers
      graphicsLayer.graphics.add(extentGraphic);
      // Add layer to the map
      jimuMapView.view.map.add(graphicsLayer);
    });
  };
  const removeAllPoint = () => {
    // Get the current Graphic layer
    const currentGraphicLayer = GraphicsLayerRef.current;
    // Remove all graphic on Layer
    currentGraphicLayer?.graphics?.removeAll();
    //Remove current layer out of mapview
    jimuMapView?.view.map.remove(currentGraphicLayer);
  };
  return { addPoint, removeAllPoint };
};

export default useAddLayer;
