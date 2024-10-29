import { React, type ImmutableObject, classNames, hooks } from 'jimu-core'
import { defaultMessages as jimuiDefaultMessage, TextInput, Switch } from 'jimu-ui'
import { type DateTimeFormatOptions, type WebChartAxis } from 'jimu-ui/advanced/chart'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../../translations/default'
import { DateFormatSetting } from '../../components'

const ShowDateFormatSetting = false
const DisplayRangeSlider = false

export interface DateAxisProps {
  className?: string
  axis: ImmutableObject<WebChartAxis>
  onChange?: (axis: ImmutableObject<WebChartAxis>) => void
}

export const DateAxis = (props: DateAxisProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessage)
  const { className, axis, onChange } = props
  const titleText = axis.title.content?.text ?? ''
  const valueFormat = axis.valueFormat
  const scrollbarVisible = axis.scrollbarVisible ?? false
  const showGrid = axis.grid?.width > 0

  const handleTitleTextChange = (value: string): void => {
    onChange?.(
      axis.set(
        'title',
        axis.title.set('visible', value !== '').setIn(['content', 'text'], value)
      )
    )
  }

  const handleValueFormatChange = (value: ImmutableObject<DateTimeFormatOptions>): void => {
    onChange?.(axis.set('valueFormat', value))
  }

  const handleShowGridChange = (): void => {
    onChange?.(axis.setIn(['grid', 'width'], showGrid ? 0 : 1))
  }

  const handleScrollbarVisibleChange = (_, scrollbarVisible: boolean): void => {
    onChange?.(axis.set('scrollbarVisible', scrollbarVisible))
  }

  return (
    <div className={classNames('date-axis w-100', className)}>
      <SettingRow label={translate('axisTitle')} flow='wrap' level={2}>
        <TextInput
          size='sm'
          aria-label={translate('axisTitle')}
          defaultValue={titleText}
          className='w-100'
          onAcceptValue={handleTitleTextChange}
        />
      </SettingRow>
      {ShowDateFormatSetting && <SettingRow label={translate('axisLabel')} aria-label={translate('axisLabel')} role='group' flow='wrap' level={2}>
        <DateFormatSetting
          value={valueFormat as ImmutableObject<DateTimeFormatOptions>}
          onChange={handleValueFormatChange}
        />
      </SettingRow>}
      <SettingRow label={translate('axisGrid')} level={2}>
        <Switch aria-label={translate('axisGrid')} checked={showGrid} onChange={handleShowGridChange} />
      </SettingRow>
      {DisplayRangeSlider && <SettingRow label={translate('displayRangeSlider')} level={2}>
        <Switch aria-label={translate('displayRangeSlider')} checked={scrollbarVisible} onChange={handleScrollbarVisibleChange} />
      </SettingRow>}
    </div>
  )
}
