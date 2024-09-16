import { JimuMapView, MapViewManager } from "jimu-arcgis";
import { getAppStore, ImmutableObject, JimuMapViewInfo } from "jimu-core";

export function _getActiveViewId(
  mapWidgetId: string, // Id of widget map
  infos: ImmutableObject<{ [getJimuMapViewId: string]: JimuMapViewInfo }> // Object contain Jimumapviews, each viewID (id of jimumapview) => JimuMapViewInfo
): string {
  // Get the list of viewId in infos
  let activeViewId = Object.keys(infos || {}).find(
    (viewId) =>
      infos[viewId].mapWidgetId === mapWidgetId && infos[viewId].isActive
  );
  if (!activeViewId) {
    // This action will find the view Id = mapWidgetId without state is Active
    activeViewId = Object.keys(infos || {}).find(
      (viewId) => infos[viewId].mapWidgetId === mapWidgetId
    );
  }
  return activeViewId;
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
