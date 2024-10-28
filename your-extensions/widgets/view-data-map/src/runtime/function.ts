import Graphic from "esri/Graphic";

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
