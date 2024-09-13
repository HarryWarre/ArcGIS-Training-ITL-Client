import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "../../../../node_plugin/node_modules/material-react-table";
import React from "react";
import { DMATable } from "widgets/types/table";
import { IconButton } from "../../../../node_plugin/node_modules/@mui/material";
import { ZoomIn } from "../../../../node_plugin/node_modules/@mui/icons-material";
import { appActions, getAppStore, IMState } from "jimu-core";
import { useSelector } from "react-redux/es/exports";
import { MyDMA, setDMA } from "../extensions/my-store";
import { useDispatch } from "react-redux";
import { stringify } from "querystring";

const DMA_Table = ({ data }) => {
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
    data,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <IconButton onClick={() => console.info("Edit")}>
        <ZoomIn />
      </IconButton>
    ),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        // dispatch({ type: "MyDMA" });
        const dma = { ...row.original };
        dispatch(setDMA(Object.values(dma))); // err
      },
      sx: {
        cursor: "pointer", //you might want to change the cursor too when adding an onClick
      },
    }),
  });

  return <MaterialReactTable table={table} />;
};

export default DMA_Table;
