import geometryEngine from "@arcgis/core/geometry/geometryEngine";
import { getAppStore } from "jimu-core";

export async function projectPointGeometryPolygon(
  url: string,
  inputSpatialReference: any,
  outputSpatialReference: any,
  geometry: any
) {
  //   console.log(url);
  //   console.log(inputSpatialReference);
  //   console.log(outputSpatialReference);
  //   console.log(geometry);

  const formData = new FormData(); // Create the form to post
  formData.append("inSR", JSON.stringify(inputSpatialReference));
  formData.append("outSR", JSON.stringify(outputSpatialReference));
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
  formData.append("vertical", "false"); // Dont use z index
  formData.append("f", "pjson"); // pJson  JSON Type
  formData.append("token", getAppStore().getState().token); // Token app

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

export const mergeGeometry = (geometryArr: any[]) => {
  let result: __esri.Geometry;
  result = geometryEngine.union(geometryArr);
  return result;
};
