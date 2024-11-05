export const mapWidgetId = "widget_15";
export const ProjectGeocodeURL =
  "https://cloud.intelli.com.vn/server/rest/services/Utilities/Geometry/GeometryServer/project";
export const dmaQueryAtribute = ["OBJECTID", "MADMA", "TENDMA"];
export const delayTime = 300;
export const debounceTime = 1000;
export const animationDurationTime = 1000;
export const queryAll = {
  outfields: ["*"],
  where: "OBJECTID is not null",
  returnGeometry: true,
};

export const propsChart_DongHoKhachHang = {
  title: "Biểu đồ hiển thị kích cỡ mỗi đồng hồ khách hàng",
  description: "Loại kích cỡ đồng hồ",
};

export const propsChart_DMA = {
  title: "Biểu đồ hiển thị số lượng DMA",
  description: "Số lượng",
};

export const propsChart_ThuyDai = {
  title: "Biểu đồ hiển thị phân loại tình trạng của các thủy đài",
  description: "Loại tình trạng",
};

export const prioritizedFieldsDHKH = [
  "OBJECTID",
  "TINHTRANG",
  "CODONGHO",
  "SOHOSO",
  "DONVICAPNHAT",
];
export const prioritizedFieldsThuyDai = [
  "OBJECTID",
  "TINHTRANG",
  "DONVICAPNHAT",
];

export const BASE_URL_Server =
  "https://cloud.intelli.com.vn/server/rest/services/Devonly/QUANLYTAISAN_GISCHOLON_V1/FeatureServer";

// OBJECT ID
export const layerIds = {
  dma: 26,
  dhkh: 1,
  thuydai: 8,
};
