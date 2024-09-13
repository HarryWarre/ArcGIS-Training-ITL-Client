import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "../../../../node_plugin/node_modules/material-react-table";
import React from "react";
import { DHKHTable } from "widgets/types/table";
import { IconButton } from "../../../../node_plugin/node_modules/@mui/material";
import { ZoomIn } from "../../../../node_plugin/node_modules/@mui/icons-material";
import { appActions, getAppStore, IMState } from "jimu-core";
import { useSelector } from "react-redux/es/exports";
// import { MyDMA, setDMA } from "../extensions/my-store";
import { useDispatch } from "react-redux";
import { stringify } from "querystring";

const DHKH_Table = ({ data }) => {
  const columns = useMemo(() => {
    if (data.length > 0) {
      return Object.keys(data[0]).map((key) => ({
        accessorKey: key,
        header: key.charAt(0).toUpperCase() + key.slice(1), // Optional: Capitalize header
        size: 400,
      }));
    }
    return [];
  }, [data]);

  //   const dispatch = useDispatch();

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnPinning: true,
    paginationDisplayMode: "pages",
    initialState: {
      pagination: {
        pageSize: 5,
        pageIndex: 0,
      },
    },
    // enableColumnResizing: true,
    // enableColumnVirtualization: true,

    // enableRowActions: true,
    // renderRowActions: ({ row }) => (
    //   <IconButton onClick={() => console.info("Edit")}>
    //     <ZoomIn />
    //   </IconButton>
    // ),
    // muiTableBodyRowProps: ({ row }) => ({
    //   onClick: (event) => {
    //     // dispatch({ type: "MyDMA" });
    //     const dma = { ...row.original };
    //   },
    //   sx: {
    //     cursor: "pointer", //you might want to change the cursor too when adding an onClick
    //   },
    // }),
  });

  return <MaterialReactTable table={table} />;
};

export default DHKH_Table;
