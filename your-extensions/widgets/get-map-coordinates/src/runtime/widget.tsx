import { React, type AllWidgetProps } from "jimu-core";

import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";
import Point from "esri/geometry/Point";
const { useState } = React;

const Widget = (props: AllWidgetProps<any>) => {
  const [latitude, setLatitude] = useState<String>("");
  const [longtitude, setLongtitude] = useState<String>("");

  const activeViewChangeHandle = (jmv: JimuMapView) => {
    if (jmv) {
      //When the pointer moves, take the pointer location and create a Point
      //Geometry out of it ('view.toMap(...)') then update the state

      jmv.view.on("pointer-move", (evt) => {
        const point: Point = jmv.view.toMap({
          x: evt.x,
          y: evt.y,
        });

        setLatitude(point.latitude.toFixed(3));
        setLongtitude(point.longitude.toFixed(3));
      });
    }
  };

  return (
    <div className='widget-stater jimu-widget'>
      {props.useMapWidgetIds && props.useMapWidgetIds.length === 1 && (
        <JimuMapViewComponent
          useMapWidgetId={props.useMapWidgetIds?.[0]}
          onActiveViewChange={activeViewChangeHandle}
        />
      )}
      <p>
        Lat/Lon: {latitude} {longtitude}
      </p>
    </div>
  );
};

export default Widget;
