/** @jsx jsx */
import {
    React,
    jsx,
    Immutable,
    getAppStore,
    type ActionSettingProps,
    type ImmutableObject,
    type IMFieldSchema,
    type UseDataSource,
    type IMUseDataSource,
    type DataSource
} from 'jimu-core';
import { FieldSelector } from 'jimu-ui/advanced/data-source-selector';
import { SettingSection } from 'jimu-ui/advanced/setting-components';

interface Config {
    useDataSource: UseDataSource;
}

export type IMConfig = ImmutableObject<Config>;

const QueryActionSetting: React.FC<ActionSettingProps<IMConfig>> = (props) => {
    const { messageWidgetId, widgetId, config, onSettingChange, actionId } = props;
    React.useEffect(() => {
        const initConfig = getInitConfig();
        onSettingChange({
            actionId,
            config: config.set('useDataSource', initConfig.useDataSource)
        });
    }, []); // Run once on mount

    // console.log(props)
    // Default configuration
    const defaultConfig = Immutable({
        useDataSource: null
    });

    const getInitConfig = () => {
        const appConfig = getAppStore().getState()?.appStateInBuilder?.appConfig;
        const messageWidgetJson = appConfig?.widgets?.[messageWidgetId];
        // console.log(messageWidgetJson)
        let useDataSource: IMUseDataSource = null;
        if (!config.useDataSource) {
            if (messageWidgetJson?.useDataSources?.length === 1) {
                const ds = messageWidgetJson.useDataSources[0];
                useDataSource = Immutable({
                    dataSourceId: ds.dataSourceId,
                    mainDataSourceId: ds.mainDataSourceId,
                    dataViewId: ds.dataViewId,
                    rootDataSourceId: ds.rootDataSourceId
                });
            }
        } else {
            useDataSource = config.useDataSource;
        }

        return {
            useDataSource
        };
    };

    const getDsSelectorSourceData = (widgetId: string) => {
        const appConfig = getAppStore().getState()?.appStateInBuilder?.appConfig;
        const widgetJson = appConfig?.widgets?.[widgetId];
        return widgetJson?.useDataSources || null;
    };

    const onFieldSelected = (allSelectedFields: IMFieldSchema[], ds: DataSource) => {
        const field = allSelectedFields[0];
        if (!field) return;

        if (config.useDataSource) {
            console.log(config)
            onSettingChange({
                actionId,
                config: config
                    .set('fieldName', field.name)
                    .set('useDataSource', {
                        dataSourceId: config.useDataSource.dataSourceId,
                        mainDataSourceId: config.useDataSource.mainDataSourceId,
                        dataViewId: config.useDataSource.dataViewId,
                        rootDataSourceId: config.useDataSource.rootDataSourceId,
                        fields: allSelectedFields.map((f) => f.jimuName)
                    })
            });
        }
    };

    const useDataSources = getDsSelectorSourceData(widgetId);

    return (
        <div>
            <SettingSection title="Select field">
                {useDataSources && useDataSources.length > 0 && (
                    <div className="mt-2">
                        Please choose a Field to query:
                        <FieldSelector
                            useDataSources={useDataSources}
                            onChange={onFieldSelected}
                            selectedFields={
                                config.useDataSource?.fields
                                    ? config.useDataSource.fields
                                    : Immutable([])
                            }
                        />
                    </div>
                )}
            </SettingSection>
        </div>
    );
};

QueryActionSetting.defaultProps = {
    config: Immutable({
        useDataSource: null
    })
};

export default QueryActionSetting;
