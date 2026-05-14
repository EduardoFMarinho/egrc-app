import PropTypes from "prop-types";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import MainCard from "../../../components/MainCard";
import ScrollX from "../../../components/ScrollX";
import IconButton from "../../../components/@extended/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Mark from "mark.js";
import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  TablePagination,
} from "../../../components/third-party/react-table";
import { useGetTestesByProjeto } from "../../../api/testes";
import {
  formatTestDate,
  getCompletionDate,
  getTestConclusionLabel,
  getTestDate,
} from "../controles/testeResumoUtils";

export const fuzzyFilter = (row, columnId, value) => {
  let cellValue = row.getValue(columnId);

  if (cellValue === undefined || cellValue === null || value === undefined) {
    return false;
  }

  const normalizeText = (text) =>
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  cellValue = normalizeText(cellValue);
  const valueStr = normalizeText(value);

  return cellValue.includes(valueStr);
};

function ReactTable({ data, columns, totalItems, isLoading, onCreateNovo }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "testDate", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true,
  });
  const rows = table.getRowModel().rows;

  useEffect(() => {
    const markInstance = new Mark(tableRef.current);

    if (globalFilter) {
      markInstance.unmark({
        done: () => {
          markInstance.mark(globalFilter);
        },
      });
    } else {
      markInstance.unmark();
    }
  }, [globalFilter, rows]);

  return (
    <MainCard content={false}>
      <ScrollX>
        <div ref={tableRef}>
          <Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
              sx={{
                backgroundColor: "#F1F1F1E5",
                paddingBottom: 2,
                paddingTop: 2,
                paddingRight: 2,
                paddingLeft: 2,
                marginBottom: 3,
                ...(matchDownSM && {
                  "& .MuiOutlinedInput-root, & .MuiFormControl-root": {
                    width: "110%",
                  },
                }),
              }}
            >
              <DebouncedInput
                value={globalFilter ?? ""}
                onFilterChange={(value) => setGlobalFilter(String(value))}
                placeholder="Pesquise pelo codigo ou nome"
                style={{
                  width: "350px",
                  height: "33px",
                  borderRadius: "8px",
                  border: "0.3px solid #00000010",
                  backgroundColor: "#FFFFFF",
                }}
              />
              <Typography
                sx={{
                  color: "rgba(0, 0, 0, 0.6)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {totalItems} teste(s) vinculado(s)
              </Typography>
              <Button
                variant="contained"
                onClick={onCreateNovo}
                sx={{
                  height: "33px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Novo
              </Button>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      sx={{
                        backgroundColor: isDarkMode ? "#14141" : "#F4F4F4",
                        color: isDarkMode
                          ? "rgba(0, 0, 0, 0.6)"
                          : "rgba(255, 255, 255, 0.87)",
                      }}
                    >
                      {headerGroup.headers.map((header) => {
                        if (
                          header.column.columnDef.meta !== undefined &&
                          header.column.getCanSort()
                        ) {
                          Object.assign(header.column.columnDef.meta, {
                            className:
                              header.column.columnDef.meta.className +
                              " cursor-pointer prevent-select",
                          });
                        }

                        return (
                          <TableCell
                            sx={{
                              fontSize: "11px",
                              color: isDarkMode
                                ? "rgba(255, 255, 255, 0.87)"
                                : "rgba(0, 0, 0, 0.6)",
                            }}
                            key={header.id}
                            {...header.column.columnDef.meta}
                            onClick={header.column.getToggleSortingHandler()}
                            {...(header.column.getCanSort() &&
                              header.column.columnDef.meta === undefined && {
                              className: "cursor-pointer prevent-select",
                            })}
                          >
                            {header.isPlaceholder ? null : (
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Box>
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </Box>
                                {header.column.getCanSort() && (
                                  <HeaderSort column={header.column} />
                                )}
                              </Stack>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        sx={{ textAlign: "center" }}
                      >
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <Fragment key={row.id}>
                        <TableRow
                          sx={{
                            "&:last-child td": { borderBottom: "none" },
                            backgroundColor: isDarkMode ? "#14141" : "#fff",
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              {...cell.column.columnDef.meta}
                              sx={{
                                overflow: "hidden",
                                color: isDarkMode
                                  ? "rgba(255, 255, 255, 0.87)"
                                  : "rgba(0, 0, 0, 0.65)",
                                textOverflow: "ellipsis",
                                fontFamily:
                                  '"Open Sans", Helvetica, sans-serif',
                                fontSize: "13px",
                                fontStyle: "normal",
                                fontWeight: 400,
                                lineHeight: "normal",
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        <EmptyTable msg="Nenhum teste vinculado encontrado" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2 }}>
              <TablePagination
                {...{
                  setPageSize: table.setPageSize,
                  setPageIndex: table.setPageIndex,
                  getState: table.getState,
                  getPageCount: table.getPageCount,
                  totalItems,
                  recordType: "Testes",
                }}
              />
            </Box>
          </Stack>
        </div>
      </ScrollX>
    </MainCard>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  totalItems: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onCreateNovo: PropTypes.func.isRequired,
};

function ActionCell({ row }) {
  const navigation = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openTest = () => {
    navigation("/testes/criar", {
      state: {
        indoPara: "NovoTeste",
        dadosApi: row.original,
      },
    });
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "control-test-actions" : undefined;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={0}
    >
      <IconButton
        aria-describedby={id}
        color="primary"
        onClick={handleClick}
        style={{
          borderRadius: 8,
          backgroundColor: "#1C52970D",
          width: "30px",
          height: "30px",
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Stack>
          <Button
            onClick={openTest}
            color="primary"
            style={{ color: "#707070", fontWeight: 400 }}
          >
            Editar
          </Button>
        </Stack>
      </Popover>
    </Stack>
  );
}

ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
};

const ListaProjetoTestes = ({ projectId }) => {
  const navigation = useNavigate();
  const [formData] = useState({ refreshCount: 0 });
  const { acoesJudiciais: lists = [], isLoading } = useGetTestesByProjeto(
    formData,
    projectId,
  );

  const columns = useMemo(
    () => [
      {
        header: "Controle",
        accessorKey: "name",
        cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 600,
              color: "primary.main",
            }}
            onClick={() => {
              navigation("/testes/criar", {
                state: {
                  indoPara: "NovoTeste",
                  dadosApi: row.original,
                },
              });
            }}
          >
            {row.original.name || row.original.control || "-"}
          </Typography>
        ),
      },
      {
        header: "Data base",
        accessorFn: (row) => getTestDate(row),
        id: "testDate",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatTestDate(getTestDate(row.original))}
          </Typography>
        ),
      },
      {
        header: "Data de conclusao",
        accessorFn: (row) => getCompletionDate(row),
        id: "completionDate",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatTestDate(getCompletionDate(row.original))}
          </Typography>
        ),
      },
      {
        header: "Status",
        accessorFn: (row) => getTestConclusionLabel(row),
        id: "testConclusion",
        cell: ({ row }) => (
          <Chip
            label={getTestConclusionLabel(row.original)}
            sx={{
              backgroundColor: "transparent",
              color: "#00000099",
              fontWeight: 600,
              fontSize: "12px",
              height: "28px",
            }}
          />
        ),
      },
      {
        id: "actions",
        header: " ",
        enableSorting: false,
        cell: ({ row }) => <ActionCell row={row} />,
      },
    ],
    [navigation],
  );

  const handleCreateNovo = () => {
    navigation("/testes/criar", {
      state: {
        indoPara: "NovoTeste",
        idProject: projectId,
      },
    });
  };

  return (
    <ReactTable
      data={lists}
      columns={columns}
      totalItems={lists.length}
      isLoading={isLoading}
      onCreateNovo={handleCreateNovo}
    />
  );
};

ListaProjetoTestes.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ListaProjetoTestes;
