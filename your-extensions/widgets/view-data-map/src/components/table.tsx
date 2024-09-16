import { useEffect, useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "../../../../node_plugin/node_modules/material-react-table";
import React from "react";
import { DMATable } from "widgets/types/table";
import { IconButton } from "../../../../node_plugin/node_modules/@mui/material";
import { ZoomIn } from "../../../../node_plugin/node_modules/@mui/icons-material";
import { appActions } from "jimu-core";
import { useDispatch } from "react-redux";
import { eDMA } from "../extensions/my-store";
import { JimuMapView } from "jimu-arcgis";
import Geometry from "@arcgis/core/geometry/Geometry";

const useState = React.useState;

const DMA_Table = ({ data, onClickrow }) => {
  const [dataTable, setDataTable] = useState([]);

  useEffect(() => {
    data.forEach((element) => {
      setDataTable((dataTable) => [...dataTable, element["data"]]);
    });
  }, [data]);

  const isLoading = !data || data.length === 0;
  const columns = useMemo<MRT_ColumnDef<DMATable>[]>(
    () => [
      {
        accessorKey: "OBJECTID",
        header: "OBJECTID",
        size: 150,
      },
      {
        accessorKey: "MADMA",
        header: "Mã DMA",
        size: 150,
      },
      {
        accessorKey: "TENDMA",
        header: "Tên DMA",
        size: 150,
      },
    ],
    []
  );

  const dispatch = useDispatch();

  const table = useMaterialReactTable({
    columns,
    data: dataTable,
    enableRowActions: true,
    state: { isLoading: isLoading },
    renderRowActions: ({ row }) => (
      <IconButton onClick={() => onClickrow(row.original)}>
        <ZoomIn />
      </IconButton>
    ),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        const dma = { ...row.original };
        dispatch(
          appActions.widgetStatePropChange(
            eDMA.storeKey, // Widget ID
            eDMA.sectionKey,
            Object.values(dma) // Send Value
          )
        ); // err
      },
      sx: {
        cursor: "pointer", //you might want to change the cursor too when adding an onClick
      },
    }),
  });

  return <MaterialReactTable table={table} />;
};

export default DMA_Table;

// Function to zoom testing
export const zooming = async (jMapView: JimuMapView, geometry: Geometry) => {
  await jMapView.view.goTo(
    {
      target: geometry,
    },
    {
      animate: true,
      duration: 1000,
    }
  );
};
