import { Polygon } from "@arcgis/core/geometry";
import Geometry from "@arcgis/core/geometry/Geometry";
import geometryEngine from "@arcgis/core/geometry/geometryEngine";
import { JimuMapView, MapViewManager } from "jimu-arcgis";
import {
  DataRecord,
  getAppStore,
  ImmutableObject,
  JimuMapViewInfo,
} from "jimu-core";

export function _getActiveViewId(
  mapWidgetId: string,
  infos: ImmutableObject<{ [getJimuMapViewId: string]: JimuMapViewInfo }>
): string | undefined {
  return (
    Object.keys(infos ?? {}).find(
      (viewId) =>
        infos[viewId].mapWidgetId === mapWidgetId &&
        (infos[viewId].isActive ?? false)
    ) ??
    Object.keys(infos ?? {}).find(
      (viewId) => infos[viewId].mapWidgetId === mapWidgetId
    )
  );
}

/**
 *
 * @param mapWidgetId : Id of map
 * @param _viewManager : View Manager
 * Function getJimuMapView
 * Get JimyMapView is avtive base on mapWidgetId and MapViewManager (Input)
 */
export async function getJimuMapView(
  mapWidgetId: string,
  _viewManager: MapViewManager
) {
  const activeViewId = _getActiveViewId(
    mapWidgetId,
    getAppStore().getState().jimuMapViewsInfo
  ); // => This will return the active view id

  const jimuMapView: JimuMapView =
    _viewManager.getJimuMapViewById(activeViewId);
  return await jimuMapView?.whenJimuMapViewLoaded();
}
