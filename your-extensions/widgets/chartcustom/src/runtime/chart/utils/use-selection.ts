import { React, type IMState, ReactRedux, lodash, MessageManager, DataRecordsSelectionChangeMessage, type DataSource, hooks, type DataRecord, type ImmutableArray } from 'jimu-core'
import { type SelectionData, SelectionSource, getSplitByField, type WebChartDataItem } from 'jimu-ui/advanced/chart'
import { type WebChartSeries } from '../../../config'

const isRecordMatch = (rec1: { [x: string]: any }, rec2: { [x: string]: any }): boolean => {
  return Object.keys(rec2).every(key => rec1[key] === rec2[key])
}

const getNormalizedSelectionItems = (selectionItems: Array<{ [x: string]: any }>, splitByField?: string, inlineFormatedField?: string) => {
  return selectionItems.map((item) => {
    const data = { ...item }
    if (inlineFormatedField) {
      // for inline data chart
      if (inlineFormatedField && typeof data[inlineFormatedField + '_original'] !== 'undefined') {
        delete data[inlineFormatedField + '_original']
      }
    }
    if (typeof data.arcgis_charts_slice_id !== 'undefined') {
      delete data.arcgis_charts_slice_id
    }
    if (typeof data.__outputid__ !== 'undefined') {
      delete data.__outputid__
    }
    if (splitByField) {
      delete data[splitByField]
    }
    if (typeof data.arcgis_charts_type_domain_field_name !== 'undefined') {
      const dominField = data.arcgis_charts_type_domain_field_name
      const dominFieldValue = data.arcgis_charts_type_domain_id_value
      data[dominField] = dominFieldValue
    }
    return data
  })
}

const normalizeRecordData = (input: { [x: string]: any }, inlineFormatedField?: string) => {
  let output = input
  output = { ...input }
  if (inlineFormatedField && typeof output[inlineFormatedField] !== 'string') {
    output[inlineFormatedField] = String(output[inlineFormatedField])
  }
  if (inlineFormatedField && typeof output[inlineFormatedField + '_original'] !== 'undefined') {
    delete output[inlineFormatedField + '_original']
  }
  if (typeof output.__outputid__ !== 'undefined') {
    delete output.__outputid__
  }
  if (typeof output.arcgis_charts_slice_id !== 'undefined') {
    delete output.arcgis_charts_slice_id
  }
  return output
}

/**
 * Match the data in the records based on the selected data. If the selected data completely matches the data in some of the records, return them.
 * Note1: The number of fields in record is different from select item. For example, there is `objectid` in record but not in select item.
 * Note2: There is a potential problem with `no aggregation` in this matching pair. There may be two records whose fields (non-objectid) and values are exactly the same.
 */
const getMatchedRecords = (records: DataRecord[], selectionItems: Array<{ [x: string]: any }>, inlineFormatedField?: string) => {
  return records.filter(record => {
    const data = normalizeRecordData(record.getData(), inlineFormatedField)
    return selectionItems.some(item => {
      return isRecordMatch(data, item)
    })
  })
}

/**
 * Get selection items by the selected id from data source.
 */
const getSelectedItems = (
  selectedIds: string[],
  records: DataRecord[],
  inlineFormatedField?: string
): WebChartDataItem[] => {
  const items = selectedIds.map((id) => {
    const record = records.find((record) => record.getId() === id)
    let data = null
    if (record) {
      data = normalizeRecordData(record.getData(), inlineFormatedField)
      if (typeof data.arcgis_charts_type_domain_field_name !== 'undefined') {
        const dominField = data.arcgis_charts_type_domain_field_name
        const dominFieldLabel = data.arcgis_charts_type_domain_id_label
        data[dominField] = dominFieldLabel
      }
    }
    return data
  }).filter((item) => !!item)
  return items
}

/**
 * Keep the selection of chart and output data source, publish message when selection changes.
 * @param widgetId
 * @param outputDataSource
 * @param dataItems
 * @param seriesLength
 */
const useSelection = (
  widgetId: string,
  outputDataSource: DataSource,
  series: ImmutableArray<WebChartSeries>,
  inlineFormatedField?: string
): [SelectionData, (...args: any[]) => any] => {
  const preSelectedIdsRef = React.useRef<string[]>()
  const handleSelectionChange = hooks.useEventCallback((e) => {
    const sourceRecords = outputDataSource?.getSourceRecords()
    if (!sourceRecords?.length) return
    const selectionSource: SelectionSource = e.detail.selectionSource
    // Only trigger selection change message if selection source is from the user operation
    const selectionByUser =
      selectionSource === SelectionSource.SelectionByClick ||
      selectionSource === SelectionSource.SelectionByRange ||
      selectionSource === SelectionSource.ClearSelection
    if (!selectionByUser) return
    const where = series[0].query?.where
    const splitByField = getSplitByField(where)

    const selectionItems = getNormalizedSelectionItems(e.detail.selectionItems ?? [], splitByField, inlineFormatedField)
    const selectedRecords = getMatchedRecords(sourceRecords, selectionItems, inlineFormatedField)
    const selectedIds = selectedRecords.map(record => record.getId())

    preSelectedIdsRef.current = selectedIds

    //Publish records selection change message
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(widgetId, selectedRecords)
    )

    outputDataSource.selectRecordsByIds(selectedIds)
  })

  const originalSelectedIds = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[outputDataSource?.id]?.selectedIds)
  const [selectionItems, setSelectionItems] = React.useState<WebChartDataItem[]>()

  const getSelectionItems = hooks.useEventCallback((selectedIds) => {
    const sourceRecords = outputDataSource?.getSourceRecords()
    if (!sourceRecords?.length) return
    const items = getSelectedItems(selectedIds ?? [], sourceRecords, inlineFormatedField)
    return items
  })

  React.useEffect(() => {
    if (!originalSelectedIds) return
    const mutableSelectionIds = originalSelectedIds.asMutable()
    // if the selected ids is same as the current selected ids, just return.
    if (lodash.isDeepEqual(mutableSelectionIds, preSelectedIdsRef.current)) return
    preSelectedIdsRef.current = mutableSelectionIds
    const selectionItems = getSelectionItems(mutableSelectionIds)
    setSelectionItems(selectionItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalSelectedIds])
  const selectionData = React.useMemo(() => ({ selectionItems }), [selectionItems])
  return [selectionData, handleSelectionChange]
}

export default useSelection
