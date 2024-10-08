import { useMemo, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "../../../../node_plugin/node_modules/material-react-table/dist";
import React, { useState } from "react";
import { Box, Chip } from "../../../../node_plugin/node_modules/@mui/material";

const TabTable = ({
  data,
  columnHeader,
  onClickRow = null,
  featureLayerName = "",
  prioritizedFields = [],
  fields = [],
}) => {
  const isLoading = !data || data.length === 0;
  // const isLoading = !data || data.length === 0;

  const [tableData, setTableData] = useState(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const renderCell = (value) => {
    return <Chip label={value} variant='outlined' color='success' />;
  };

  const customColumns = useMemo(() => {
    if (columnHeader.length > 0) {
      const unsortedColumns =
        tableData.length > 0
          ? columnHeader.map((header, index) => {
              const accessorKey = Object.keys(tableData[0])[index];
              const field = fields.find((f) => f.name === accessorKey);

              return {
                accessorKey: accessorKey,
                header: header,
                size: 400,
                Cell: field
                  ? ({ cell }) => {
                      const codedValue = field.domain.codedValues.find(
                        (item) => item.code === cell.getValue()
                      );
                      return codedValue
                        ? renderCell(codedValue.name)
                        : cell.getValue();
                    }
                  : undefined,
              };
            })
          : columnHeader.map((header, index) => ({
              accessorKey: `col${index}`,
              header: header || `Col ${index + 1}`,
              size: 400,
            }));

      const sortedColumns = unsortedColumns.sort((a, b) => {
        const aPriority = prioritizedFields.indexOf(a.accessorKey);
        const bPriority = prioritizedFields.indexOf(b.accessorKey);

        if (aPriority !== -1 && bPriority !== -1) {
          return aPriority - bPriority;
        }
        if (aPriority !== -1) {
          return -1;
        }
        if (bPriority !== -1) {
          return 1;
        }
        return 0;
      });

      return sortedColumns;
    }

    return [];
  }, [tableData, columnHeader, prioritizedFields, fields]);

  const table = useMaterialReactTable({
    columns: customColumns,
    data: tableData,
    paginationDisplayMode: "pages",
    state: { isLoading: isLoading },
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
