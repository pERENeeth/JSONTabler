import { useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "./App.css";

type AppProps = {
  data?: Record<string, any> | Record<string, any>[];
};

const App = ({ data }: AppProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const tableData = useMemo<Record<string, any>[]>(() => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return [data];
    return [];
  }, [data]);

  const columns = useMemo<ColumnDef<Record<string, any>>[]>(() => {
    if (!tableData.length) return [];

    return Object.keys(tableData[0]).map((key) => ({
      accessorKey: key,
      header: () =>
        key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      enableSorting: true,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        const value = row.getValue(columnId);
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
      },
      size: 160,
      minSize: 20,
      maxSize: 320,
      cell: ({ getValue }) => {
        const value = getValue();
        if (value == null) {
          return <span className="cell-null">—</span>;
        }
        return String(value);
      },
    }));
  }, [tableData]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: "onChange",
  });

  if (!tableData.length) {
    return (
      <div className="no-data">
        <h3>No valid data received from the extension</h3>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table style={{ width: table.getTotalSize() }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    <div
                      className="th-content"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      <span className="sort-indicator">
                        {{
                          asc: "▲",
                          desc: "▼",
                        }[header.column.getIsSorted() as string] ?? ""}
                      </span>
                    </div>

                    {header.column.getCanFilter() && (
                      <input
                        className="column-filter"
                        value={
                          (header.column.getFilterValue() as string) ?? ""
                        }
                        onChange={(e) =>
                          header.column.setFilterValue(e.target.value)
                        }
                        placeholder="Filter..."
                      />
                    )}

                    <div
                      className={`resizer ${
                        header.column.getIsResizing() ? "isResizing" : ""
                      }`}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr key={row.id} className={idx % 2 === 0 ? "even-row" : ""}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} title={String(cell.getValue() ?? "")}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
