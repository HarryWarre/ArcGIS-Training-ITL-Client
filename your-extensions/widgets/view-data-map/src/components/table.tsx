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

const useState = React.useState;

const DMA_Table = ({ data, onClickrow }) => {
  const [dataTable, setDataTable] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    setDataTable(data.map((element) => element["data"]));
  }, [data]);

  const columns = useMemo<MRT_ColumnDef<DMATable>[]>(
    () => [
      { accessorKey: "OBJECTID", header: "OBJECTID", size: 150 },
      { accessorKey: "MADMA", header: "Mã DMA", size: 150 },
      { accessorKey: "TENDMA", header: "Tên DMA", size: 150 },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: dataTable,
    enableRowActions: true,
    state: { isLoading: !dataTable.length },
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
