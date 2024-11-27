import { CollapsablePanel, NumericInput, Select, Switch, TextInput } from 'jimu-ui';
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components';
import { TextAlignment, TextStyle } from 'jimu-ui/advanced/style-setting-components';
import React from 'react';
import { fontList } from './font';

const AppearanceSetting = ({ config, onConfigChange, onConfigParentChange }) => {
  // Hàm callback tiện ích
  const handleChange = (key, value) => {
    if (onConfigChange) {
      onConfigChange(key, value);
    }
  };

  return (
    <SettingSection>
      <h4>Appearance</h4>
      {/* Numeric Input for chartHeight */}
      <SettingRow flow="wrap" label="Chart Height">
        <NumericInput
          value={config.chartHeight}
          onChange={(value) => handleChange("chartHeight", value)}
          min={100}
          max={1000}
          step={10}
        />
      </SettingRow>
      {/* Toggle Enable Show value on Top of Column */}
      <SettingRow flow="wrap" label="Show Value on Top">
        <Switch
          checked={config.isShowValueOnTop || false}
          onChange={(e) => handleChange("isShowValueOnTop", e.target.checked)}
        />
      </SettingRow>
      <br/>
      {/*Setting chart title */}
      <CollapsablePanel
          label="Title"
          level={0}
          type="default"
          className='mb-4'
        >
        {/* Content */}
        <SettingRow flow="wrap" label="Content Title">
          <TextInput
            value={config.chartTitle.content || ""}
            onChange={(e) => onConfigParentChange("chartTitle","content", e.target.value)}
            placeholder="Enter Chart Title"
          />
        </SettingRow>
        {/* Font Style */}
        <SettingRow flow='wrap' label={'Font Style'}>
          <TextStyle
            bold={config.chartTitle.bold || false}
            color={config.chartTitle.color || "#bababa"}
            italic={config.chartTitle.italic || false}
            size={`${config.chartTitle.size || 10}`}
            strike={config.chartTitle.strike || false}
            underline={config.chartTitle.underline || false}
            onChange={(key, value) => onConfigParentChange("chartTitle", key, value)}
          />
        </SettingRow>
        {/* Font Family */}
        <SettingRow flow="wrap" label="Font">
          <Select
            value={config.chartTitle.font}
            onChange={(e) => onConfigParentChange("chartTitle", "font", e.target.value)}
          >
            {fontList.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </Select>
        </SettingRow>

        {/* Alignment */}
          <SettingRow flow="wrap" label="Text Alignment">
            <TextAlignment
              size="sm"
              textAlign={config.chartTitle.alignment || "left"}
              onChange={(value) => onConfigParentChange("chartTitle", "alignment", value)}
            />
          </SettingRow>
      </CollapsablePanel>

      {/* Setting sub chart title */}
      <CollapsablePanel
          label="Sub Title"
          level={0}
          type="default"
          className="mb-2"
        >
        {/* Text Input for chartSubtitle */}
        <SettingRow flow="wrap" label="Content Subtitle">
          <TextInput
            value={config.chartSubtitle.content || ""}
            onChange={(e) => onConfigParentChange("chartSubtitle","content", e.target.value)}
            placeholder="Enter Chart Subtitle"
          />
        </SettingRow>

        <SettingRow flow='wrap' label={'Font Style'}>
          <TextStyle
            bold={config.chartSubtitle.bold || false}
            color={config.chartSubtitle.color || "#bababa"}
            italic={config.chartSubtitle.italic || false}
            size={`${config.chartSubtitle.size || 10}`}
            strike={config.chartSubtitle.strike || false}
            underline={config.chartSubtitle.underline || false}
            onChange={(key, value) => onConfigParentChange("chartSubtitle", key, value)}
          />
        </SettingRow>

        {/* Font */}
        <SettingRow flow="wrap" label="Font">
          <Select
            value={config.chartSubtitle.font}
            onChange={(e) => onConfigParentChange("chartSubtitle", "font", e.target.value)}
          >
            {fontList.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </Select>
        </SettingRow>

        {/* Alignment */}
        <SettingRow flow="wrap" label="Text Alignment">
          <TextAlignment
            size="sm"
            textAlign={config.chartSubtitle.alignment || "left"}
            onChange={(value) => onConfigParentChange("chartSubtitle", "alignment", value)}
          />
        </SettingRow>
      </CollapsablePanel>


    </SettingSection>
  );
};

export default AppearanceSetting;
