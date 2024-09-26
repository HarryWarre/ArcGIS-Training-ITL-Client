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
  description: "Số lượng",
};

export const propsChart_DMA = {
  title: "Biểu đồ hiển thị số lượng DMA",
  description: "Số lượng",
};
