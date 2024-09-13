import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";
import { React, type AllWidgetProps } from "jimu-core";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
const { useState } = React;

const Widget = (props: AllWidgetProps<any>) => {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>();
  const activeViewChangeHandle = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv);
    }
  };

  const formSubmit = (evt) => {
    evt.preventDefault();

    /* ***  ADD  *** */
    //create a new Feature Layer
    const layer = new FeatureLayer({
      url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0",
    });

    // Add the kayer to the map (accesed through the Experience Builder humuMapView data source)
    jimuMapView.view.map.add(layer);
  };
  return (
    <div className='widget-demo jimu-widget m-2'>
      {props.useMapWidgetIds && props.useMapWidgetIds.length === 1 && (
        <JimuMapViewComponent
          useMapWidgetId={props.useMapWidgetIds?.[0]}
          onActiveViewChange={activeViewChangeHandle}
        />
      )}

      {/* ***  ADD *** */}
      <form onSubmit={formSubmit}>
        <div>
          <button>Add Layer</button>
        </div>
      </form>
    </div>
  );
};

export default Widget;
