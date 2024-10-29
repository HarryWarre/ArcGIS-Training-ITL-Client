import Graphic from "esri/Graphic";
import { DataRecord, FeatureLayerQueryParams } from "jimu-core";

export async function blinkPolygon(
  jimuMapView,
  polygonGeometry,
  blinkTimeNumber = 3
) {
  if (!jimuMapView || !polygonGeometry) return;

  jimuMapView.view.graphics.removeAll();

  // Create polygon
  const polygonSymbol = {
    type: "simple-fill",
    color: [230, 0, 0, 0.5], // Màu và độ trong suốt của polygon
    outline: {
      color: [255, 255, 255],
      width: 2,
    },
  };

  // Create graphics
  const polygonGraphic = new Graphic({
    geometry: polygonGeometry,
    symbol: polygonSymbol,
  });

  // Add graphic to view
  jimuMapView.view.graphics.add(polygonGraphic);

  // Blink blink polygon
  for (let i = 0; i < blinkTimeNumber; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s each actions
    jimuMapView.view.graphics.remove(polygonGraphic);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    jimuMapView.view.graphics.add(polygonGraphic);
  }
}

export const getDHKHIDsInGeometry = async (
  record: DataRecord,
  datasource: any // Thay 'any' bằng kiểu của datasource nếu biết
): Promise<string[]> => {
  const queryParams: FeatureLayerQueryParams = {
    where: "",
    outFields: ["*"],
    returnGeometry: true,
    geometry: record.getGeometry(),
  };

  try {
    const data = await datasource?.query(queryParams);
    const customerIDs = data.records.map(
      (r: DataRecord) => r.getData()["OBJECTID"]
    );

    return customerIDs;
  } catch (error) {
    console.log("Error fetching customer IDs:", error);
    return [];
  }
};
