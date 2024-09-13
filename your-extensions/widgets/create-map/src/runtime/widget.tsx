import MapView from "@arcgis/core/views/MapView";
import { MapViewManager, WebMapDataSource } from "jimu-arcgis";
import {
  AllWidgetProps,
  DataSourceComponent,
  IMUrlParameters,
  jimuHistory,
} from "jimu-core";
import { Loading, LoadingType, Toast, ToastType } from "jimu-ui";
import React, { FC, useState } from "react";
import Extent from "esri/geometry/Extent";

//  The Extension widget map will follow this step:
/**
 * 1. Create the WebMap with the portalItem Id
 * 2. Create the MapView, load the Webmap into
 * 3. Declare mvManage, is the Map view manager can control the map view
 * 4. mvManager.createJumuMapView: Create the Jimu Map view with loading MapView in the props
 */

interface ExtraProps {
  queryObject: IMUrlParameters;
}
// Interface for Toast
interface IErrorToast {
  isError: boolean;
  message: string;
}

// Inherit Toast
const DEFAULT_ERROR: IErrorToast = {
  isError: false,
  message: "",
};
const Widget: FC<AllWidgetProps<unknown> & ExtraProps> = (props) => {
  const { useDataSources, id, queryObject } = props;
  const [isLoading, setIsLoading] = useState(false); // State for Loading
  const [error, setError] = useState<IErrorToast>(DEFAULT_ERROR);

  let mapContainer = React.createRef<HTMLDivElement>(); // Create element Div contain the map
  let extentWatch: __esri.WatchHandle;
  let mvManager: MapViewManager = MapViewManager.getInstance(); // Declare map view manager, which is INSTANCE

  const onCreated = (webmapDs: WebMapDataSource) => {
    if (!webmapDs) {
      setIsLoading(false);
      return;
    }

    const idMapRef = mvManager.getJimuMapViewById(id);

    console.log("idMapRefRef", idMapRef);

    if (!idMapRef) {
      // Create Options Properties for the map
      const options: __esri.MapViewProperties = {
        map: webmapDs.map,
        container: mapContainer.current,
      };

      const queryObjectId = queryObject?.[id];
      if (queryObjectId) {
        const extentStr = queryObjectId.substr("extent=".length);
        let extent;
        try {
          extent = new Extent(JSON.parse(extentStr));
        } catch (err) {
          setError({
            isError: true,
            message: "Bad extent URL parameter.",
          });
        }

        if (extent) {
          options.extent = extent;
        }
      }

      mvManager
        .createJimuMapView({
          // Create the Jimu map view
          mapWidgetId: id,
          view: new MapView(options),
          dataSourceId: webmapDs.id,
          isActive: true,
          mapViewManager: mvManager,
        })
        .then((jimuMapView) => {
          if (!extentWatch) {
            extentWatch = jimuMapView.view.watch(
              "extent",
              (extent: __esri.Extent) => {
                jimuHistory.changeQueryObject({
                  [id]: `extent=${JSON.stringify(extent.toJSON())}`,
                });
              }
            );
          }
        })
        .catch((_) => {
          setError({
            isError: true,
            message: "Create Map Error",
          });
        });
    }
    setIsLoading(false);
  };

  if (!useDataSources || !useDataSources.length) {
    return <div>Webmap is not selected</div>; // Return alert when the web map is not selected
  }

  return (
    <div className= 'position-relative h-100'>
      {/* Use DataSourceComponent, which can be get the data source (Web map) */}
      <DataSourceComponent
        onDataSourceCreated={onCreated}
        useDataSource={useDataSources[0]}>
        <div
          className='widget-map'
          style={{ width: "100%", height: "100%" }}
          ref={mapContainer}
        />
      </DataSourceComponent>

      {isLoading && (
        <div
          style={{ top: 0, left: 0, backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          className='api-loader position-absolute w-100 h-100 d-flex justify-content-center align-items-center'>
          <Loading type={LoadingType.Secondary}></Loading>
        </div>
      )}
      <Toast open={error.isError} type={ToastType.Error} text={error.message} />
    </div>
  );
};

export default Widget;
