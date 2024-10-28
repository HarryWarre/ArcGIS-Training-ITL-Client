import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import geometryEngine from "@arcgis/core/geometry/geometryEngine";
import {
  FeatureLayerDataSource,
  JimuMapView,
  MapViewManager,
} from "jimu-arcgis";
import { DataRecord, JimuMapViewInfo, getAppStore } from "jimu-core";
import { ImmutableObject } from "seamless-immutable";
// import { vanBoundaryLayerId } from "./types";
// import { eVHV } from "./vhv";
import { DataSource } from "jimu-core";
import {
  dhkhPointSymbol,
  thuydaiPointSymbol,
} from "../../../../widgets/common/symbols";
const defaultDsInterval = 2000;
//#region map related
export function _getActiveViewId(
  mapWidgetId: string,
  infos: ImmutableObject<{ [jimuMapViewId: string]: JimuMapViewInfo }>
): string {
  let activeViewId = Object.keys(infos || {}).find(
    (viewId) =>
      infos[viewId].mapWidgetId === mapWidgetId && infos[viewId].isActive
  );
  if (!activeViewId) {
    activeViewId = Object.keys(infos || {}).find(
      (viewId) => infos[viewId].mapWidgetId === mapWidgetId
    );
  }
  return activeViewId;
}

export async function getJimuMapView(
  mapWidgetId: string,
  _viewManager: MapViewManager
) {
  const activeViewId = _getActiveViewId(
    mapWidgetId,
    getAppStore().getState().jimuMapViewsInfo
  );
  const jimuMapView: JimuMapView =
    _viewManager.getJimuMapViewById(activeViewId);

  return await jimuMapView?.whenJimuMapViewLoaded();
}

export async function highlight_point_on_map_by_graphic(
  mapWidgetId: string,
  _viewManager: MapViewManager,
  geometry: __esri.Geometry,
  delay: number = 300
) {
  const mapView = await getJimuMapView(mapWidgetId, _viewManager);
  /*************************
   * Create a point graphic
   *************************/
  // remove the existing graphic
  mapView?.view?.graphics?.removeAll();

  // First create a point geometry (this is the location of the Titanic)
  const point = {
    type: "point", // autocasts as new Point()
    ...geometry,
  };

  // Create a symbol for drawing the point
  const markerSymbol = {
    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    color: [0, 255, 255, 0.5],
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: [0, 255, 255],
      width: 1.5,
    },
  };

  // Create a graphic and add the geometry and symbol to it
  const pointGraphic = new Graphic({
    geometry: point as __esri.Point,
    // symbol: markerSymbol,
    symbol: dhkhPointSymbol,
  });

  // Add the graphic to the view with delay
  setTimeout(() => {
    mapView?.view?.graphics?.add(pointGraphic);
    console.log("flashss");
  }, delay);
}

export async function clearMapSelectionAndHighlight(
  mapWidgetId: string,
  _viewManager: any
) {
  const mapView = await getJimuMapView(mapWidgetId, _viewManager);

  // for graphic only
  mapView?.clearSelectedFeatures();
  mapView?.view?.graphics?.removeAll();
}

export async function projectPointGeometry(
  url: string,
  inputSpatialReference: any,
  outputSpatialReference: any,
  geometry: any
) {
  const formData = new FormData();
  formData.append("inSR", JSON.stringify(inputSpatialReference));
  formData.append("outSR", JSON.stringify(outputSpatialReference));
  formData.append("geometries", `${geometry?.x},${geometry?.y}`);
  formData.append("transformation", "");
  formData.append("transformForward", "true");
  formData.append("vertical", "false");
  formData.append("f", "pjson");
  formData.append("token", getAppStore().getState().token);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

export async function projectPolygonGeometry(
  url: string,
  inputSpatialReference: any,
  outputSpatialReference: any,
  geometry: any
) {
  const formData = new FormData();
  formData.append("inSR", JSON.stringify(inputSpatialReference));
  formData.append("outSR", JSON.stringify(outputSpatialReference));
  // formData.append('geometries', `${geometry?.x},${geometry?.y}`);
  formData.append(
    "geometries",
    `{
    "geometryType": "esriGeometryPolygon",
    "geometries": [
      {
        "rings" : ${JSON.stringify(geometry)}
      }
    ]
  }`
  );
  formData.append("transformation", "");
  formData.append("transformForward", "true");
  formData.append("vertical", "false");
  formData.append("f", "pjson");
  formData.append("token", getAppStore().getState().token);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

export const mergeGeometry = (geometryArr: any[]) => {
  let result: __esri.Geometry;
  // console.log({geometryArr});

  result = geometryEngine.union(geometryArr);
  return result;
};

export function retrieveAttributesInProxy(record: DataRecord) {
  const result: {
    [key: string]: any;
  } = {};
  const proxy = record?.getData();
  for (let key in proxy) {
    result[key] = proxy[key];
  }
  return result;
}

export function retrieveGeometryInProxy(record: DataRecord) {
  const result: {
    [key: string]: any;
  } = {};
  const proxy = record?.getGeometry();
  for (let key in proxy) {
    result[key] = proxy[key];
  }
  return result;
}

export function zoomToMapByExtent(
  extent: __esri.Extent,
  _viewManager: MapViewManager,
  mapWidgetId: string
) {
  const mapView = getJimuMapView(mapWidgetId, _viewManager);

  mapView.then((jmv) => {
    jmv?.view?.goTo(extent);
  });
}

// export function drawAffectedAreaByGraphic(
//   featureGraphics: __esri.Graphic[],
//   _viewManager: MapViewManager,
//   mapWidgetId: string,
//   removePrevious: boolean = false
// ) {
//   const arg = featureGraphics.map((feature) => {
//     // console.log('feature', feature);
//     feature.symbol = {
//       type: "simple-line",
//       color: [128, 0, 128] as any, // Purple color
//       width: 2,
//     } as __esri.SimpleLineSymbol;
//     feature.geometry = {
//       ...feature.geometry?.toJSON(),
//       type: "polygon",
//     } as any;

//     return feature;
//   });

//   const mapView = getJimuMapView(mapWidgetId, _viewManager);

//   mapView.then((jmv) => {
//     const affectedLayer = jmv.view.map.findLayerById(
//       vanBoundaryLayerId
//     ) as __esri.GraphicsLayer;
//     affectedLayer?.removeAll();
//     affectedLayer?.addMany(arg);
//   });
// }

export function debounce(func, delay) {
  let timerId;

  return function (...args) {
    const context = this;

    clearTimeout(timerId);

    timerId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}
//#endregion

//#region math
export function mathRound(rawNumber: number, roundedNumber: number = 2) {
  return (
    Math.round((rawNumber + Number.EPSILON) * Math.pow(10, roundedNumber)) /
    Math.pow(10, roundedNumber)
  );
}
export function numberWithCommas(n: number) {
  if (n == null) return "";
  var parts = n.toString().split(".");
  return (
    parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (parts[1] ? "." + parts[1] : "")
  );
}

//#endregion

//#region event
export function createEventListener<T>(
  event: string,
  callback: (data: T) => void
): EventListenerOrEventListenerObject {
  const listener = (e: CustomEvent<T>) => callback(e.detail);
  document.addEventListener(event, listener);
  return listener;
}

export function dispatchEvent(event: string, data: any) {
  document.dispatchEvent(new CustomEvent(event, { detail: data }));
}

export function removeEventListener(
  event: string,
  callback: EventListenerOrEventListenerObject
) {
  document.removeEventListener(event, callback);
}
//#endregion

//#region others
// export function getSavedNguoiBao() {
//   // get saved NguoiBao from localStorage
//   const savedNguoiBao = localStorage.getItem(eVHV.NguoiBaoKey);
//   if (savedNguoiBao) {
//     return savedNguoiBao;
//   }
//   return "";
// }
//#endregion

export function getCodeOptionsByDataSource(ds: DataSource, fieldName: string) {
  // get fields
  const fields = (ds as FeatureLayerDataSource)?.getLayerDefinition()?.fields;

  const options =
    fields?.find((field) => field.name === fieldName)?.domain?.codedValues ||
    [];
  return options;
}

export async function showAreaOnMap(
  jimuMapView: JimuMapView,
  point: any,
  blinkTimeNumber: number = 2
) {
  if (!jimuMapView) return;
  jimuMapView.view.graphics.removeAll();

  // Create a symbol for rendering the graphic
  let points: any = {
    type: "point",
    longitude: point.x,
    latitude: point.y,
    spatialReference: point.spatialReference,
  };

  console.log(points);

  // Create a symbol for rendering the graphic
  let markerSymbol = {
    type: "simple-marker",
    color: [230, 233, 22, 0.8],
    outline: {
      cap: "round",
      color: [230, 233, 22, 0.8],
      join: "round",
      miterLimit: 1,
      width: 2,
    },
  };

  // Add the geometry and symbol to a new graphic
  const pointGraphic = new Graphic({
    geometry: points,
    symbol: markerSymbol,
    // symbol: dhkhPointSymbol,
  });

  console.log(pointGraphic);

  // Add the graphics to the view's graphics layer
  const blinkTime = blinkTimeNumber;
  jimuMapView.view.graphics.add(pointGraphic);
  // console.log(jimuMapView.view.graphics);
  if (blinkTime > 1) {
    for (let i = 0; i < blinkTime; i++) {
      await new Promise((resolve) => setTimeout(resolve, defaultDsInterval));
      jimuMapView.view.graphics.remove(pointGraphic);
      console.log("Graphics before adding:", jimuMapView.view.graphics);
      await new Promise((resolve) => setTimeout(resolve, defaultDsInterval));
      jimuMapView.view.graphics.add(pointGraphic);
      console.log("Graphics after adding:", jimuMapView.view.graphics);
    }
  }
}

export function getPageName() {
  const pathname = window.location.pathname;
  const pageSegment = pathname.split("/page/")[1];
  const decodedPageSegment = decodeURIComponent(pageSegment).replace(/\/$/, "");

  return decodedPageSegment;
}
