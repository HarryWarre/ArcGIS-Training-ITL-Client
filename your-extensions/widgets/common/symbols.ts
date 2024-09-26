import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";

export const blackPointSymbol = {
  type: "simple-maker",
  color: [226, 119, 40],
  outline: { color: [255, 255, 255], width: 1 },
};

export const thuydaiPointSymbol = new PictureMarkerSymbol({
  url: "https://cdn-icons-png.flaticon.com/512/3144/3144753.png",
  width: "30px",
  height: "30px",
});

export const dhkhPointSymbol = new PictureMarkerSymbol({
  url: "https://cdn-icons-png.flaticon.com/512/2898/2898735.png",
  width: "15px",
  height: "15px",
});
