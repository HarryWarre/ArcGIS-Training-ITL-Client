/**     Step querry data */

/**
 * 1. Create ref từ DataSourceManager instance
 * 2. Lấy DataSource từ id và Tạo ra DataSource
 * 3. Từ ref = DataSource bắt đầu tạo query
 * 4. Kiểm tra dataSouce, tạo query params
 * 5. Thực hiện query
 */
const css = require("./stylePopup.css")
import {
	FeatureLayerDataSource,
	JimuSceneLayerView,
	MapViewManager,
} from "jimu-arcgis"
import {
	AllWidgetProps,
	appActions,
	DataRecord,
	DataSource,
	DataSourceComponent,
	DataSourceManager,
	FeatureLayerQueryParams,
	IMState,
	React,
} from "jimu-core"
import { useSelector, useDispatch } from "react-redux"
import DMA_Table from "../components/table"
import { getJimuMapView } from "../../../common/fucntion-map"
import { queryDMA, _getFeatureLayerDataSource } from "./function"
import {
	dmaQueryAtribute,
	delayTime,
	mapWidgetId,
	ProjectGeocodeURL,
	animationDurationTime,
} from "../../../common/constant"
import { IPolygon } from "@esri/arcgis-rest-types"
import {
	mergeGeometry,
	projectPointGeometryPolygon,
} from "../../../common/function"
import {
	ToastContainer,
	toast,
} from "../../../../node_plugin/node_modules/react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { eDMA } from "../extensions/my-store"

import useSpatialQuery from "../../../tab-table-view/hooks/useSpatialQuery"
import useHighLightLayer from "../../../tab-table-view/hooks/useHighLightLayer"
import { dhkhPointSymbol } from "../../../common/symbols"
import { blinkPolygon, getDHKHIDsInGeometry } from "./function"
import { createTabbedPopup } from "./tabbedPopup"

//Declear Hooks
const useState = React.useState
const useEffect = React.useEffect
const useRef = React.useRef

// Widget start here  --------------->
const Widget = (props: AllWidgetProps<any>) => {
	const dispatch = useDispatch()
	//Get app token
	const appToken = useSelector((state: IMState) => state.token)

	//State get DataSource
	const [isDataSourcesReady, setIsDataSourceReady] = useState(false)
	// Access the map
	const { current: _viewManager } = useRef(MapViewManager.getInstance())
	// 3 ref datasource
	let DMARef = useRef<DataSource>(null)
	let DHKHRef = useRef<DataSource>(null)
	let ThuyDaiRef = useRef<DataSource>(null)
	// Highlight ref zone
	const highlightHandler = useRef(null)
	//3 Data query
	const [dataDMA, setDataDMA] = useState(null) // ?
	// Default setting query param
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(6)
	const [jMapView, setjMapView] = useState(null)

	const { spatialQuery, removeAllPoint } = useSpatialQuery(jMapView)
	const { hightLightShape, removeHighlightShape } = useHighLightLayer(jMapView)

	let timeout = null as any

	useEffect(() => {
		// Prevent inaccessbility of the widget when the appToken is not avaible
		if (!appToken) return
		clearTimeout(timeout)
		getDs()

		if (highlightHandler.current) {
			highlightHandler.current?.remove()
		}

		return () => {
			clearTimeout(timeout)
			highlightHandler.current = null
		}
	}, [appToken])

	useEffect(() => {
		if (DMARef.current) {
			getDMAData(DMARef.current)
			getDMADS()
		}

		getJMapview()
	}, [isDataSourcesReady])

	useEffect(() => {
		if (jMapView) {
			;(() => {
				if (mapWidgetId) {
					const view: __esri.MapView | __esri.SceneView = jMapView?.view
					view.popupEnabled = false
					view?.on("click", (e) => handleLogicWhenOpenPopup(e, view))
				}
			})()
		}

		return () => {
			removeEventListener("click", jMapView)
		}
	}, [jMapView])

	const handleLogicWhenOpenPopup = async (
		event: __esri.ViewClickEvent, // event
		view: __esri.MapView | __esri.SceneView // view from jimumapview
	) => {
		const { dataSourceId } = props.useDataSources?.[0]
		const layerId = mapWidgetId + "-" + dataSourceId
		const layer = jMapView?.jimuLayerViews?.[layerId]?.layer
		console.log(layer)

		const ds: any = DataSourceManager.getInstance().getDataSource(dataSourceId)
		// layer.popupEnabled = false;
		const histTestResp = await view?.hitTest(event) // Response from hitTest function
		console.log("histTestResp", histTestResp) // Return graphic layers

		const graphicHits = histTestResp.results
			?.slice(0, 3) // Get 3 head value
			?.filter(
				({ layer: graphicLayer }: any) =>
					graphicLayer && graphicLayer.id === layer?.id
			)

		if (graphicHits.length) {
			const viewLayerFiter = graphicHits.map((item: any) => item.graphic)

			for (let index = 0; index < viewLayerFiter.length; index++) {
				const item = viewLayerFiter[index]

				const popupOptions = {
					title: "Custom popup",
					location: event.mapPoint,
					content: createTabbedPopup(),
				}
				// view.popup = null;
				view.openPopup(popupOptions)
			}
		}
	}

	const getJMapview = async () => {
		setjMapView(await getJimuMapView(mapWidgetId, _viewManager))
	}

	async function getDs() {
		const dsArr: DataSource[] = []

		props.useDataSources?.forEach((useDataSource, index) => {
			const ds = DataSourceManager.getInstance().getDataSource(
				useDataSource?.dataSourceId
			)
			dsArr.push(ds)
			// console.log(ds)
		})

		if (dsArr.every((e) => e)) {
			setIsDataSourceReady(true)
			DMARef.current = dsArr[2]
			DHKHRef.current = dsArr[0]
			ThuyDaiRef.current = dsArr[1]

			changeDefinitionExpression("", mapWidgetId, "1=0", 2) // DMA
			changeDefinitionExpression("", mapWidgetId, "1=0", 1) // ThuyDai
			changeDefinitionExpression("", mapWidgetId, "1=0", 0) // DHKH

			clearTimeout(timeout)
		} else {
			setTimeout(() => getDs(), delayTime)
		} // Default inteval
	}

	/**
	 *
	 * @param DMZ
	 * @param mapWidgetId to get the layer ID from datasource index
	 * @param baseExpression SQL CLAUSE
	 * @param INDEX_DATA_SOURCE The index of the datasource in list datasources which is enabled in setting
	 */
	const changeDefinitionExpression = async (
		DMZ: string,
		mapWidgetId,
		baseExpression,
		INDEX_DATA_SOURCE
	) => {
		const dsIndex = INDEX_DATA_SOURCE

		await getJimuMapView(mapWidgetId, _viewManager).then((mapView) => {
			const layerId = props.useDataSources?.[dsIndex]?.dataSourceId // Get the layer ID from datasource index
			if (layerId) {
				const layer = mapView?.jimuLayerViews![`${mapWidgetId}-${layerId}`]
					.layer as __esri.Sublayer
				if (layer) {
					layer.definitionExpression = baseExpression
				}
			}
		})
	}

	const getDMAData = async (ds: DataSource) => {
		const _ds = ds as FeatureLayerDataSource
		if (_ds) {
			const countTotal = await _ds.query({
				// Query params here --------------------> Can Split to const queryParams = {structure of params} if needs
				// outFields: ["*"],
				outFields: dmaQueryAtribute,
				where: "OBJECTID is not null",
				returnGeometry: true,
				page: page,
				pageSize: pageSize,
			})
			await queryDMA()
			setDataDMA(countTotal)
		}
	}

	//  Function get Datasource from index
	const getDataSourceForIndex = (index) =>
		_getFeatureLayerDataSource(props.useDataSources?.[index]?.dataSourceId)

	function _getFeatureLayerDataSource(dataSourceId: string) {
		return DataSourceManager.getInstance().getDataSource(dataSourceId) as
			| FeatureLayerDataSource
			| undefined
	}

	const handleSearchOnMap = async (rowData) => {
		/**
		 * Mô tả hàm zoom:
		 * Hàm này sẽ nhận một <row data> từ bảng có dữ liệu dma trước đó
		 * 1. Get data source của DMA
		 * 2. Tìm dữ liệu geometry của DMA bằng mã DMA
		 * 3. GetGeometry as IPolygon (type)
		 * 4. Lấy JMapView từ widgetId và viewManager
		 * 5. Merge Geometries thành một <shape>
		 * 6. Sau khi có shape, sử dụng hàm jmapview.goto(target: shape)
		 */

		// The record for zoom, this needs info about OBJECTID and MADMA
		const ds = getDataSourceForIndex(1) // Get first datasource (DMA)

		if (!ds) {
			const notify = () => toast.error("Can not get Datasource")
			notify()
			return
		}
		if (dataDMA) {
			const geometryDMA = dataDMA.records.find(
				(i: any) =>
					Object.fromEntries(Object.entries(i?.feature?.attributes))?.MADMA ==
					rowData?.MADMA
			)
			// const record = geometryDMA as DataRecord;
			// console.log(record.getGeometry());

			const geometry = geometryDMA.getGeometry() as IPolygon

			// const jMapView = await getJimuMapView(mapWidgetId, _viewManager); // Declare jMapView
			// console.log(jMapView);

			if (jMapView) {
				const { geometries } = await projectPointGeometryPolygon(
					ProjectGeocodeURL,
					geometry?.spatialReference, // Input Spacial
					jMapView?.view?.spatialReference, // Expected Spacial
					geometry?.rings // Point to create the Geometry
				)

				if (!geometries) {
					return
				}
				/**
				 * Merge Geometries to one shape
				 */
				const mergedGeometry = mergeGeometry(
					geometries?.map((geo) => ({
						type: "point",
						...geo,
						spatialReference: jMapView.view.spatialReference,
					}))
				)

				if (!mergedGeometry) {
					return
				}

				if (highlightHandler.current) {
					highlightHandler.current?.remove()
				}
				const layerView =
					jMapView.jimuLayerViews[
						mapWidgetId + "-" + props.useDataSources?.[2]?.dataSourceId // Select Datasource of DMA ***
					]
				// console.log(layerView);
				// console.log("jMapView.jimuLayerViews", jMapView.jimuLayerViews); //  Print layer views

				highlightHandler.current = (
					layerView as JimuSceneLayerView
				).view.highlight(rowData.OBJECTID)
				// console.log(rowData.OBJECTID);
				// Zoom
				await jMapView.view.goTo(
					{ target: mergedGeometry },
					{
						// The address where map should zoom
						animate: true,
						duration: animationDurationTime,
					}
				)
			}

			// Add Point Symbol to each DHKH in Geometry of DMA Selected
			spatialQuery(
				{
					record: geometryDMA as DataRecord,
					datasource: DHKHRef.current as FeatureLayerDataSource,
				},
				dhkhPointSymbol
			)
		}
	}

	const queryWhenDMASelected = async (objectId) => {
		const flDHKH = DHKHRef.current as FeatureLayerDataSource
		const fdDMA = DMARef.current as FeatureLayerDataSource
		const flThuyDai = ThuyDaiRef.current as FeatureLayerDataSource

		if (fdDMA) {
			getGeometryDMA(objectId)
				.then(async (record) => {
					if (!record) {
						throw new Error("Geometry not found")
					}

					// Query DHKH with geometry from DMA
					const geometrySortParams: FeatureLayerQueryParams = {
						where: "",
						outFields: ["*"],
						returnGeometry: true,
						geometry: record.getGeometry(),
					}

					try {
						const dhkhData = await flDHKH?.query(geometrySortParams)
						const thuyDaiData = await flThuyDai?.query(geometrySortParams)

						if (dhkhData && thuyDaiData) {
							// console.log("DHKhData: ", dhkhData); // Log kết quả trước khi dispatch
							dispatch(
								appActions.widgetStatePropChange(
									eDMA.storeKey, // Widget ID
									eDMA.sectionKey,
									dhkhData.records.map((record) => record.getData())
								)
							)

							dispatch(
								appActions.widgetStatePropChange(
									eDMA.storeKey, // Widget ID
									eDMA.sectionKeyThuyDai,
									thuyDaiData.records.map((record) => record.getData())
								)
							)
						}
					} catch (error) {
						console.error("Error querying DHKH:", error)
					}
				})
				.catch((error) => {
					console.error("Error querying DMA:", error)
				})

			// The record for zoom, this needs info about OBJECTID and MADMA
			const ds = getDataSourceForIndex(1) // Get first datasource (DMA)

			if (!ds) {
				const notify = () => toast.error("Can not get Datasource")
				notify()
				return
			}
		}
	}

	const getGeometryDMA = async (objectId: any): Promise<DataRecord | null> => {
		const fdDMA = DMARef.current as FeatureLayerDataSource

		if (fdDMA) {
			try {
				const dmaSelected = await fdDMA.query({
					outFields: ["*"],
					where: `OBJECTID = ${objectId}`,
					returnGeometry: true,
				})

				return dmaSelected.records[0]
			} catch (error) {
				console.error("Error querying DMA:", error)
			}
		}
		return null //
	}

	const displayAllGeometries = async (geometryDMAs) => {
		try {
			// Receieve Promises from getCustomerIDsInGeometry
			const allIDsPromises = geometryDMAs.map((element) =>
				getDHKHIDsInGeometry(element as DataRecord, DHKHRef.current)
			)

			// Chờ tất cả các Promise hoàn thành và ghép tất cả ID lại thành một mảng
			const allIDsArray = await Promise.all(allIDsPromises)
			const allIDs = allIDsArray.flat() // Gộp tất cả mảng ID thành một mảng duy nhất

			// Gọi changeDefinitionExpression với tất cả ID đã ghép
			changeDefinitionExpression(
				"",
				mapWidgetId,
				`OBJECTID IN (${allIDs.join(",")})`,
				0
			)
		} catch (error) {
			console.error("Error displaying geometries:", error)
		}
	}

	const hightlightDMAs = async (listDMAs) => {
		changeDefinitionExpression(
			"",
			mapWidgetId,
			`OBJECTID IN (${listDMAs.join(",")})`,
			2
		)
		/**
		 * Dựa vào list DMA, highlight từng DMA
		 */

		// Lấy JimuMapView từ MapViewManager
		const jMapView = await getJimuMapView(mapWidgetId, _viewManager)

		if (jMapView) {
			jMapView.view.on("click", async (event) => {
				const response = await jMapView.view.hitTest(event)
				if (response.results.length > 0) {
					const graphic = response.results[0]?.["graphic"]
					const polygonGeometry = graphic.geometry

					// Gọi hàm blinkPolygon
					blinkPolygon(jMapView, polygonGeometry, 3) // Nhấp nháy 3 lần
				} else {
					console.error("Không có đồ họa nào tại vị trí này.")
				}
			})

			removeAllPoint()
			if (highlightHandler.current) {
				highlightHandler.current?.remove()
				// highlightHandler.current = null;
			}

			// Lấy layerView dựa trên mapWidgetId và dataSourceId
			const layerView =
				jMapView.jimuLayerViews[
					mapWidgetId + "-" + props.useDataSources?.[2]?.dataSourceId
				]

			// Kiểm tra nếu layerView tồn tại và có thuộc tính view
			if (layerView && (layerView as JimuSceneLayerView).view) {
				highlightHandler.current = (
					layerView as JimuSceneLayerView
				).view.highlight(listDMAs)
			}

			if (dataDMA) {
				const geometryDMAs = dataDMA.records.filter((i: any) =>
					listDMAs.includes(
						Object.fromEntries(Object.entries(i?.feature?.attributes))?.OBJECTID
					)
				)
				// Add Point Symbol to each DHKH in Geometry of DMA Selected
				geometryDMAs.forEach(async (element) => {
					// spatialQuery(
					//   {
					//     record: element as DataRecord,
					//     datasource: DHKHRef.current as FeatureLayerDataSource,
					//   },
					//   dhkhPointSymbol
					// );
				})
				displayAllGeometries(geometryDMAs)
			}
		}
	}

	async function getDMADS() {
		const dmaDS = await (
			_getFeatureLayerDataSource(
				props.useDataSources?.[0]?.dataSourceId // get datasourceid of layer
			) as FeatureLayerDataSource
		).createJSAPILayerByDataSource()
		// Xử lý dmaDS theo nhu cầu của bạn
		// console.log(dmaDS) // => Feature Layer
	}

	return (
		<>
			<ToastContainer
				position='top-right'
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme='light'
			/>
			<ToastContainer />
			{props.useDataSources?.map((useDataSource, index) => (
				<DataSourceComponent
					key={`data-source-${index}`}
					useDataSource={useDataSource}
					widgetId={props.id}
				/>
			))}
			{/* {console.log(DMAQuery)} */}
			<DMA_Table
				data={
					dataDMA?.records
						? dataDMA.records.map((element) => ({
								data: element.getData(),
						  }))
						: []
				}
				queryDHKH={queryWhenDMASelected}
				hightlightDMAs={hightlightDMAs}
				onClickrow={handleSearchOnMap}
			/>
		</>
	)
}

export default Widget
