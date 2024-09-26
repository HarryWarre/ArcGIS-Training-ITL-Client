import { IPoint, IPolygon, IPolyline } from "@esri/arcgis-rest-types";
import { JimuMapView, loadArcGISJSAPIModules } from "jimu-arcgis";
import { React } from "jimu-core";
const { useRef, useEffect } = React;
interface IHighLightLayer {
  geometry: IPolygon | IPoint | IPolyline;
  symbol: {
    type: string;
    style: string;
    color: string | number[];
    outline: { color: string; width: number };
  };
}

const useHighLightLayer = (jimuMapView: JimuMapView) => {
  const GraphicsLayerRef = useRef<__esri.GraphicsLayer>(null);
  const GraphicRef = useRef<typeof __esri.Graphic>(null);

  useEffect(() => {
    if (!jimuMapView) return;
    // Load Graphic modules
    loadArcGISJSAPIModules(["esri/layers/GraphicsLayer", "esri/Graphic"]).then(
      ([GraphicsLayer, Graphic]) => {
        GraphicsLayerRef.current = new GraphicsLayer();
        GraphicRef.current = Graphic;
      }
    );
  }, [jimuMapView]);

  useEffect(() => {
    if (!jimuMapView) return;
    const handle = jimuMapView.view.on("click", removeHighlightShape);
    return () => handle.remove();
  }, [jimuMapView]);

  const hightLightShape = ({ geometry, symbol }: IHighLightLayer) => {
    // Get graphic class
    const graphicLayer = GraphicsLayerRef.current;
    const Graphic = GraphicRef.current;

    // Create the feature layer from geometry
    const extentGraphic = new Graphic({ geometry, symbol });
    // Add the graphic to the layer
    removeHighlightShape();
    graphicLayer.graphics.add(extentGraphic);
    jimuMapView.view.map.add(graphicLayer);
  };

  const removeHighlightShape = () => {
    // Get graphic class
    const graphicsLayer = GraphicsLayerRef.current;

    // check
    if (graphicsLayer) {
      // Remove the graphic in the layer
      graphicsLayer.graphics.removeAll();
      // Remove the layer from the map
      jimuMapView.view.map.remove(graphicsLayer);
    } else {
      console.error("GraphicsLayer is not initialized.");
    }
  };

  return { hightLightShape, removeHighlightShape };
};

export default useHighLightLayer;
