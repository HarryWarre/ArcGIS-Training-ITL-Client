import { FeatureLayerDataSource, React } from 'jimu-core';
import { Button, Popper, Scrollable } from 'jimu-ui';
import { SettingRow } from 'jimu-ui/advanced/setting-components';
import { ColorPicker } from 'jimu-ui/basic/color-picker';
/**
* Nếu có domain thì không cần phải querries để get Serries
* Nếu không có domain, hiện tại đang query 1 page (2000 records)
    => lấy được các giá trị SplitBy và từ đó set màu như có domain (phương án hiện tại, có thể cải thiện sau)
*/
interface ColorPickerProps {
  splitBy: any;
  onSeriesColorsChange: any,
  id: any
  datasource
  isSplitBy
  serriesColor
  serriesDomain
}

const {useState, useEffect, useRef} = React

export const SeriesColorPicker: React.FC<ColorPickerProps> = (props) => {
  const { splitBy, onSeriesColorsChange, datasource } = props;
  const [series, setSeries] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const reference = useRef();
  useEffect(() => {
    if (datasource && splitBy && !props.serriesDomain) {
      getSeriesData()
    }
    if(props.serriesDomain){
      // console.log(props.serriesDomain)
      setSeries(props.serriesDomain.map(item => item.name))
    }
  }, [datasource, splitBy, props.serriesDomain]);

  // console.log(props.serriesColor?.['G'])
  const getSeriesData = async () => {
    const _ds = datasource as FeatureLayerDataSource;

    try {
      const whereConditions = `${splitBy} is not null`;

      const result = await _ds.query({
        outFields: [splitBy],
        where: whereConditions,
        returnGeometry: false,
        pageSize: 2000,
      });

      const uniqueSeries = result.records.map((record) => record.getData()[splitBy]);
      const distinctSeries = [...new Set(uniqueSeries)];
      console.log(distinctSeries)
      setSeries(distinctSeries)
    } catch (error) {
      console.error('Error fetching series data:', error);
    }
  };

  const handleToggle = () => {
      setOpen((prev) => !prev);
  };

  const handleColorChange = (seriesName, newColor) => {
    onSeriesColorsChange("serries", seriesName, newColor);
  };

  return (
    <div>
      <SettingRow label="Serries Colour">
        <Button ref={reference} onClick={handleToggle}>
          Setting serries color
        </Button>
      </SettingRow>

      <Popper
        open={open}
        reference={reference.current}
        placement={'left'}
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [-0, 30],
            },
          },
          {
            name: "preventOverflow",
            options: {
              boundariesElement: "viewport",
            },
          },
        ]}
      >
        <div
          style={{
            width: 200,
            maxHeight: 500,
            overflowY: "auto",
          }}
          className="border"
        >
          <Scrollable className='p-1'>
            {series.length === 0 ? (
              <div>No series found</div>
            ) : (
              series.map((seriesName) => (
                <div
                  key={seriesName}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "5px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <span>{seriesName}</span>
                  <ColorPicker
                    outline={true}
                    color={props.serriesColor?.[`${seriesName}`]}
                    onChange={(newColor) => handleColorChange(seriesName, newColor)}
                    style={{ marginLeft: "10px" }}
                  />
                </div>
              ))
            )}
          </Scrollable>
        </div>
      </Popper>
    </div>
  );
};
