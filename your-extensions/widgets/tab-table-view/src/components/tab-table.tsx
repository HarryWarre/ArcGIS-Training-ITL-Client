import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "../../../../node_plugin/node_modules/material-react-table/dist";
import React from "react";

const TabTable = ({ data, columnHeader, onClickRow = null, featureLayerName='' }) => {
  const isLoading = !data || data.length === 0;
  const columns = useMemo(() => {
    if (columnHeader.length > 0) {
      return columnHeader.map((header, index) => ({
        accessorKey:
          data.length > 0 ? Object.keys(data[0])[index] : `col${index}`,
        header: header || `Col ${index + 1}`,
        size: 400,
      }));
    }
    return [];
  }, [data, columnHeader]);

  const table = useMaterialReactTable({
    columns,
    data: data,
    paginationDisplayMode: "pages",
    state: { isLoading: isLoading }, // Loading
    enableColumnPinning: true,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        if (onClickRow) {
          onClickRow(row.original, featureLayerName);
        }
      },
    }),

    initialState: {
      pagination: {
        pageSize: 5,
        pageIndex: 0,
      },
    },
    muiSkeletonProps: {
      animation: "wave",
    },
    muiLinearProgressProps: {
      color: "secondary",
    },
    muiCircularProgressProps: {
      color: "secondary",
    },
  });

  return <MaterialReactTable table={table} />;
};

export default TabTable;
