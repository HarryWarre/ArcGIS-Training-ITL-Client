import {
    AbstractMessageAction,
    MessageType,
    type Message,
    getAppStore,
    appActions,
    type MessageDescription, DataSourceManager, FeatureLayerDataSource
} from 'jimu-core'

export default class QueryAction extends AbstractMessageAction {
    filterMessageDescription(messageDescription: MessageDescription): boolean {
        return [
            MessageType.DataSourceFilterChange,
            // MessageType.DataRecordsSelectionChange
        ].includes(messageDescription.messageType);
    }

    filterMessage (message: Message): boolean {
        // console.log(message)
        return true
    }

    onExecute (message: Message, actionConfig?: any): Promise<boolean> | boolean {
        // console.log("actionConfig", actionConfig)
        // console.log(message)
        // const ms  =message as DataRecordsSelectionChangeMessage
        // let q = `${actionConfig.fieldName} = '${message}'`
        const ds = DataSourceManager.getInstance().getDataSource(
            message?.['dataSourceIds']?.[0]
        ) as FeatureLayerDataSource
        let sql
        switch (message.type) {
            case MessageType.DataSourceFilterChange:
                // q = `${actionConfig.fieldName} = '${(message as DataSourceFilterChangeMessage)}'`
                sql = ds.getRuntimeQueryParams()?.['sqlExpression']?.sql
                break
        }

        //Save queryString to store
        getAppStore().dispatch(appActions.widgetStatePropChange(this.widgetId, 'queryString', sql));
        getAppStore().dispatch(appActions.widgetStatePropChange(this.widgetId, 'dataSourceIds', message?.['dataSourceIds']));
        return true
    }
}