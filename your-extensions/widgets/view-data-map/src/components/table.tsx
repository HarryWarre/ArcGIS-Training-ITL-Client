import { useEffect, useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
} from "../../../../node_plugin/node_modules/material-react-table";
import React from "react";
import { DMATable } from "widgets/types/table";
import { IconButton } from "../../../../node_plugin/node_modules/@mui/material";
import { ZoomIn } from "../../../../node_plugin/node_modules/@mui/icons-material";

const useState = React.useState;

const DMA_Table = ({
  data,
  onClickrow,
  geometry = [],
  queryDHKH,
  hightlightDMAs,
}) => {
  const [dataTable, setDataTable] = useState([]);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [listSelectedDMA, setListSelectedDMA] = useState([]);
  useEffect(() => {
    setDataTable(data.map((element) => element["data"]));
  }, [data, geometry]);

  // Log OBJECTID of selected row
  useEffect(() => {
    const selectedObjectIDs = Object.keys(rowSelection)
      .filter((rowId) => rowSelection[rowId])
      .map((rowId) => {
        const row = table.getRow(rowId); // Get row from table
        return row?.original?.OBJECTID; // Return OBJECTID
      })
      .filter(Boolean); // Sort undefined value

    setListSelectedDMA(selectedObjectIDs);
  }, [rowSelection]);

  // Log list DMA
  useEffect(() => {
    // Hightlight DMA in list
    const useHightlight = async () => {
      await hightlightDMAs(listSelectedDMA);
    };

    useHightlight();
  }, [listSelectedDMA]);

  const columns = useMemo<MRT_ColumnDef<DMATable>[]>(
    () => [
      { accessorKey: "OBJECTID", header: "OBJECTID", size: 150 },
      { accessorKey: "MADMA", header: "Mã DMA", size: 150 },
      { accessorKey: "TENDMA", header: "Tên DMA", size: 150 },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns: columns,
    data: dataTable,
    enableRowActions: true,
    state: { isLoading: !dataTable.length, rowSelection },
    renderRowActions: ({ row }) => (
      <IconButton
        onClick={(event) => {
          if (rowSelection[row.id] == true) {
            event.stopPropagation(); // Prevent click to row function below
          }
          onClickrow(row.original);
        }}>
        <ZoomIn />
      </IconButton>
    ),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        // 1. Query DHKH dựa trên Geometry
        // 2. Lưu vào redux
        // 3. Gọi bên tab-table, nếu tồn tại thì dùng, không thì sử dụng query mặc định
        // const dma = { ...row.original };
        // const rowIndex = row.index; // Get index
        setRowSelection((prev) => ({
          ...prev,
          [row.id]: !prev[row.id],
        }));
        if (rowSelection[row.id] !== true) {
          console.log(rowSelection[row.id]);
          queryDHKH(row.original["OBJECTID"]);
        }
      },
      selected: !!rowSelection[row.id],
      sx: {
        cursor: "pointer",
      },
    }),
    onRowSelectionChange: setRowSelection,
    positionToolbarAlertBanner: "none",
  });

  return <MaterialReactTable table={table} />;
};

export default DMA_Table;
