import { Key, createContext, useState, useMemo, ReactNode } from "react";
import DataGrid, {
  Column,
  SortColumn,
  RowsChangeData,
  textEditor,
  RowRendererProps,
  Row as DataGridRow,
} from "react-data-grid";
import { Select, MenuItem, TextField, Button } from "@mui/material";
import { groupBy } from "lodash";
import { CSVLink } from "react-csv";
import "react-data-grid/lib/styles.css";

import { useAppSelector } from "../../redux/hooks";
import {
  initRows,
  detailColumns,
  groupingOptions,
  getComparator,
  columns as exportColumns,
} from "../../utils/helpers";
import {
  Filter,
  Row,
  Detail,
  Maybe,
  ContextMenu,
  Orientation,
  Unit,
  Size,
} from "../../utils/types";
import FilterField from "../../components/FilterField";
import SublineDetails from "../../components/SublineDetails";
import RowExpander from "../../components/RowExpander";
import GroupingForm from "../../components/GroupingForm";
import SavePDF from "../../components/SavePDF";
import { useConTextMenu } from "../../utils/hooks";
import ContextMenuComponent from "../../components/ContextMenu";
import { LabelKeyObject } from "react-csv/components/CommonPropTypes";
import "./index.css";

const FilterContext = createContext<Filter | undefined>(undefined);
const defaultFilters: Filter = {
  api: "",
  auth: "All",
  category: "All",
  cors: "All",
  description: "",
  https: "All",
  link: "",
};

const Combination = () => {
  //load data from app store
  const data = useAppSelector((state) => state.data.entries);
  const [rows, setRows] = useState(initRows(data));

  //raw data then to be filtered
  const [filters, setFilters] = useState<Filter>(defaultFilters);
  const [filteredRows, setFilteredRows] = useState(rows);

  //const [sortedRows, setSortedRows] = useState(filteredRows);
  //const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

  //filtered data then to be allowed for editing
  const [editedRows, setEditedRows] = useState(filteredRows);

  //filtered data then also to be grouped
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<any>(null);

  //manage right-clicked context menu
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const { clicked, setClicked } = useConTextMenu({
    setContextMenu: setContextMenu,
  });

  //load data everytime the incoming data changes
  useMemo(() => {
    setRows(initRows(data));
  }, [data]);

  //filtering mechanism happens here
  useMemo(() => {
    setFilteredRows(
      rows?.filter((row) => {
        return (
          (filters.api
            ? row.api.toLowerCase().includes(filters.api.toLowerCase())
            : true) &&
          (filters.auth !== "All" ? row.auth === filters.auth : true) &&
          (filters.category !== "All"
            ? row.category === filters.category
            : true) &&
          (filters.cors !== "All" ? row.cors === filters.cors : true) &&
          (filters.description
            ? row.description
                .toLowerCase()
                .includes(filters.description.toLowerCase())
            : true) &&
          (filters.https !== "All" ? row.https === filters.https : true) &&
          (filters.link
            ? row.link.toLowerCase().includes(filters.link.toLowerCase())
            : true)
        );
      })
    );
  }, [rows, filters]);

  /* useMemo(() => {
    setSortedRows(() => {
      if (sortColumns.length === 0) return filteredRows;

      return [...filteredRows].sort((a, b) => {
        for (const sort of sortColumns) {
          const comparator = getComparator(sort.columnKey);
          const compResult = comparator(a, b);
          if (compResult !== 0) {
            return sort.direction === "ASC" ? compResult : -compResult;
          }
        }
        return 0;
      });
    });
  }, [filteredRows, sortColumns]); */

  //only allow filtered data to be edited
  useMemo(() => {
    setEditedRows(filteredRows);
  }, [filteredRows]);

  //data for the subline section
  const details: Detail[] = useMemo(
    () =>
      rows?.map((row) => ({
        type: "detail",
        ...row,
      })),
    [rows]
  );

  //selection options for some input fields
  //specifically Authentication. Cors, HTTPS, Category
  const classifications = useMemo(() => {
    return rows?.reduce(
      (previous, current) => ({
        auth: previous.auth.includes(current.auth)
          ? previous.auth
          : [...previous.auth, current.auth],
        cors: previous.cors.includes(current.cors)
          ? previous.cors
          : [...previous.cors, current.cors],
        https: previous.https.includes(current.https)
          ? previous.https
          : [...previous.https, current.https],
        category: previous.category.includes(current.category)
          ? previous.category
          : [...previous.category, current.category],
      }),
      {
        auth: [] as string[],
        cors: [] as string[],
        https: [] as string[],
        category: [] as string[],
      }
    );
  }, [rows]);

  //add and remove subline section
  const onRowsChange = (rows: Row[], { indexes }: RowsChangeData<Row>) => {
    const row = rows[indexes[0]];
    if (!row.expanded) {
      rows.splice(indexes[0] + 1, 1);
    } else {
      rows.splice(indexes[0] + 1, 0, details[row.id]);
    }
    setRows(rows);
  };

  //define the columns for the data grid, adding filtering fields too.
  const columns = useMemo(
    (): Column<Row>[] => [
      {
        key: "expand",
        name: "",
        minWidth: 30,
        maxWidth: 30,
        colSpan(props) {
          return props.type === "ROW" && props.row.type === "detail"
            ? 8
            : undefined;
        },
        cellClass(row) {
          return row.type === "detail" ? "subline-row" : undefined;
        },
        formatter({ row, isCellSelected, onRowChange }) {
          if (row.type === "detail") {
            return (
              <SublineDetails
                columns={detailColumns}
                rows={[details[row.id]]}
                isRowSelected={isCellSelected}
              />
            );
          }

          return (
            <RowExpander
              row={row}
              isRowSelected={isCellSelected}
              isExpanded={row.expanded || false}
              onRowExpand={() => {
                onRowChange({ ...row, expanded: !row.expanded });
              }}
            />
          );
        },
      },
      {
        key: "api",
        name: "API",
        headerCellClass: "filter-element",
        headerRenderer: (p) => (
          <FilterField<Row, unknown, HTMLInputElement>
            FilterContext={FilterContext}
            {...p}
          >
            {({ filters, ...rest }) => (
              <TextField
                {...rest}
                value={filters.api}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    api: event.target.value,
                  })
                }
              />
            )}
          </FilterField>
        ),
      },
      {
        key: "auth",
        name: "Auth",
        headerCellClass: "filter-element",
        headerRenderer: (p) => (
          <FilterField<Row, unknown, HTMLInputElement>
            FilterContext={FilterContext}
            {...p}
          >
            {({ filters, ...rest }) => (
              <Select
                {...rest}
                value={filters.auth}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    auth: event.target.value,
                  })
                }
              >
                <MenuItem key={"All"} value={"All"}>
                  All
                </MenuItem>
                {classifications.auth.map((element) => (
                  <MenuItem key={element} value={element}>
                    {element}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FilterField>
        ),
      },
      {
        key: "category",
        name: "Category",
        headerCellClass: "filter-element",
        headerRenderer: (p) => (
          <FilterField<Row, unknown, HTMLInputElement>
            FilterContext={FilterContext}
            {...p}
          >
            {({ filters, ...rest }) => (
              <Select
                {...rest}
                value={filters.category}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    category: event.target.value,
                  })
                }
              >
                <MenuItem key={"All"} value={"All"}>
                  All
                </MenuItem>
                {classifications.category.map((element) => (
                  <MenuItem key={element} value={element}>
                    {element}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FilterField>
        ),
      },
      {
        key: "cors",
        name: "Cors",
        headerCellClass: "filter-element",
        headerRenderer: (p) => (
          <FilterField<Row, unknown, HTMLInputElement>
            FilterContext={FilterContext}
            {...p}
          >
            {({ filters, ...rest }) => (
              <Select
                {...rest}
                value={filters.cors}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    cors: event.target.value,
                  })
                }
              >
                <MenuItem key={"All"} value={"All"}>
                  All
                </MenuItem>
                {classifications.cors.map((element) => (
                  <MenuItem key={element} value={element}>
                    {element}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FilterField>
        ),
      },
      {
        key: "description",
        name: "Description",
        headerCellClass: "filter-element",
        headerRenderer: (p) => (
          <FilterField<Row, unknown, HTMLInputElement>
            FilterContext={FilterContext}
            {...p}
          >
            {({ filters, ...rest }) => (
              <TextField
                {...rest}
                value={filters.description}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    description: event.target.value,
                  })
                }
              />
            )}
          </FilterField>
        ),
      },
      {
        key: "https",
        name: "HTTPS",
        headerCellClass: "filter-element",
        headerRenderer: (p) => (
          <FilterField<Row, unknown, HTMLInputElement>
            FilterContext={FilterContext}
            {...p}
          >
            {({ filters, ...rest }) => (
              <Select
                {...rest}
                value={filters.https}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    https: event.target.value,
                  })
                }
              >
                <MenuItem key={"All"} value={"All"}>
                  All
                </MenuItem>
                {classifications.https.map((element) => (
                  <MenuItem key={element} value={element}>
                    {element}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FilterField>
        ),
      },
      {
        key: "link",
        name: "Link",
        headerCellClass: "filter-element",
        headerRenderer: (p) => (
          <FilterField<Row, unknown, HTMLInputElement>
            FilterContext={FilterContext}
            {...p}
          >
            {({ filters, ...rest }) => (
              <TextField
                {...rest}
                value={filters.link}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    link: event.target.value,
                  })
                }
              />
            )}
          </FilterField>
        ),
      },
    ],
    [
      classifications.auth,
      classifications.category,
      classifications.cors,
      classifications.https,
      details,
    ]
  );

  return (
    <div className="root">
      <div className="header">
        <GroupingForm
          options={groupingOptions}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />
        <div className="header-save-reports">
          <Button>
            <CSVLink
              className="csv-btn"
              filename="CSV-Excel-report"
              data={editedRows}
              headers={exportColumns.map(
                (column: Column<Row>) =>
                  ({
                    label: column.name,
                    key: column.key,
                  } as LabelKeyObject)
              )}
            >
              Download CSV file
            </CSVLink>
          </Button>
          <SavePDF
            orientation="p"
            unit="pc"
            size="A4"
            title="API Report"
            headers={[
              exportColumns
                .map((column: Column<Row>) => column.name as string)
                .filter(
                  (header) => header !== "Description" && header !== "Link"
                ),
            ]}
            data={editedRows.map((row: Row) => [
              row.api,
              row.auth,
              row.category,
              row.cors,
              row.https,
            ])}
            fileName="PDF-report"
          />
        </div>
      </div>
      <FilterContext.Provider value={filters}>
        <DataGrid
          columns={columns}
          rows={editedRows}
          groupBy={selectedOptions}
          rowGrouper={groupBy}
          expandedGroupIds={expandedGroup}
          onExpandedGroupIdsChange={setExpandedGroup}
          defaultColumnOptions={{ resizable: true, sortable: true }}
          onRowsChange={onRowsChange}
          rowHeight={(args) =>
            args.type === "ROW" && args.row.type === "detail" ? 120 : 35
          }
          headerRowHeight={100}
          rowKeyGetter={(row) => row.id}
          renderers={{
            //rendering each row with another component which allows right-click
            rowRenderer: ((
              key: Key,
              props: RowRendererProps<typeof DataGridRow, unknown>
            ) => {
              const handleContextMenu = (event: any) => {
                event.preventDefault();
                setClicked(true);
                setContextMenu({
                  rowId: Number.parseInt(key?.toString()),
                  top: event?.clientX,
                  left: event?.clientY,
                });
              };

              return (
                <DataGridRow
                  key={key}
                  onContextMenu={handleContextMenu}
                  {...props}
                />
              );
            }) as unknown as Maybe<
              (key: Key, props: RowRendererProps<Row, unknown>) => ReactNode
            >,
          }}
          //sortColumns={sortColumns}
          //onSortColumnsChange={setSortColumns}
        />
      </FilterContext.Provider>
      {clicked && contextMenu && (
        <ContextMenuComponent
          open={clicked}
          posX={contextMenu.top || 0}
          posY={contextMenu.left || 0}
        />
      )}
    </div>
  );
};

export default Combination;
