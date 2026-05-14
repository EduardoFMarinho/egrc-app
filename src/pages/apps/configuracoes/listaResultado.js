/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { API_COMMAND } from "../../../config";
import {
  Fragment,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ColumnsLayoutsDrawer from "./novoTesteDrawer";
import { enqueueSnackbar } from "notistack";
import AlertCustomerDelete from "../../../sections/apps/customer/AlertCustomerDelete";
import { useGetResultado } from "../../../api/resultado";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import emitter from "./eventEmitter";
// project import
import MainCard from "../../../components/MainCard";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  Switch,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

// third-party
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// project-import
import ScrollX from "../../../components/ScrollX";
import IconButton from "../../../components/@extended/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Mark from "mark.js";
import {
  faXmark,
  faBan,
  faTrash,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";

import {
  HeaderSort,
  EmptyTable,
  RowSelection,
  TablePagination,
} from "../../../components/third-party/react-table";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";

export const fuzzyFilter = (row, columnId, value) => {
  let cellValue = row.getValue(columnId);

  // Se a célula ou o filtro forem undefined ou null, retorna false
  if (
    cellValue === undefined ||
    cellValue === null ||
    value === undefined ||
    value === null
  ) {
    return false;
  }

  // Função que normaliza o texto, tratando também null ou undefined
  const normalizeText = (text) => {
    if (text === null || text === undefined) return "";
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  cellValue = normalizeText(cellValue);
  const valueStr = normalizeText(value);

  return cellValue.includes(valueStr);
};

// ==============================|| COMPONENTE EDITÁVEL PARA TEXTO ||============================== //

const EditableTextCell = ({
  row,
  getValue,
  canEdit = true,
  column: { id },
  onCellValueChange,
}) => {
  const initialValue =
    id === "amostra"
      ? normalizeSampleName(getValue(), row.index)
      : getValue() || "";
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Se não pode editar, renderiza só o texto
  if (!canEdit) {
    return <div style={{ padding: "4px 0" }}>{initialValue}</div>;
  }

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const finishEdit = () => {
    setIsEditing(false);
    const nextValue =
      id === "amostra" ? normalizeSampleName(value, row.index) : value;
    setValue(nextValue);
    if (onCellValueChange) {
      onCellValueChange(row.index, id, nextValue);
    }
  };

  const handleBlur = () => {
    finishEdit();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      finishEdit();
    }
  };

  return isEditing ? (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
      style={{
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "4px",
      }}
    />
  ) : (
    <div
      onDoubleClick={handleDoubleClick}
      style={{ cursor: "pointer", padding: "4px 0" }}
    >
      {value}
    </div>
  );
};

EditableTextCell.propTypes = {
  row: PropTypes.object.isRequired,
  getValue: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  onCellValueChange: PropTypes.func,
};

// ==============================|| COMPONENTE EDITÁVEL PARA SELECT ||============================== //

const EditableSelectCell = ({
  row,
  getValue,
  column: { id },
  onCellValueChange,
  canEdit = true,
}) => {
  const raw = getValue();
  const initialValue = raw === "" ? "" : Number(raw);
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    onCellValueChange?.(row.index, id, newValue);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      variant="outlined"
      size="small"
      fullWidth
      disabled={!canEdit}
      sx={{
        // anula o fade-out do disabled
        "&.Mui-disabled": {
          opacity: 1,
        },
        // anula a cor reduzida do texto quando disabled
        "& .MuiSelect-select.Mui-disabled": {
          color: "inherit !important",
          WebkitTextFillColor: "inherit !important",
          opacity: 1,
        },
        // garante que o ícone não fique acinzentado
        "& .MuiSvgIcon-root": {
          color: "inherit !important",
        },
      }}
    >
      <MenuItem value={1}>
        <Chip
          label="Não testado"
          size="small"
          sx={{ backgroundColor: "#9E9E9E", color: "#fff" }}
        />
      </MenuItem>
      <MenuItem value={2}>
        <Chip
          label="OK"
          size="small"
          sx={{ backgroundColor: "#4CAF50", color: "#fff" }}
        />
      </MenuItem>
      <MenuItem value={3}>
        <Chip
          label="NOK"
          size="small"
          sx={{ backgroundColor: "#F44336", color: "#fff" }}
        />
      </MenuItem>
      <MenuItem value={4}>
        <Chip
          label="Não aplicável"
          size="small"
          sx={{ backgroundColor: "#757575", color: "#fff" }}
        />
      </MenuItem>
    </Select>
  );
};

EditableSelectCell.propTypes = {
  row: PropTypes.object,
  getValue: PropTypes.func,
  column: PropTypes.object,
  onCellValueChange: PropTypes.func,
  canEdit: PropTypes.bool,
};

// ==============================|| REACT TABLE - LISTAGEM ||============================== //

function ReactTable({
  data,
  columns,
  canEdit,
  processosTotal,
  isLoading,
  refreshData,
  onFormDataChange,
  onEditPhase, // Função para abrir o drawer de fases (simulada)
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [columnVisibility, setColumnVisibility] = useState({});
  const recordType = "Resultados";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "amostra", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [isInactiveFilter, setIsInactiveFilter] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleFilterClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "status-filter-popover" : undefined;

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (isActiveFilter && item.active) return true;
      if (isInactiveFilter && !item.active) return true;
      return false;
    });
  }, [data, isActiveFilter, isInactiveFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection, globalFilter, columnVisibility },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true,
    autoResetPageIndex: false,
  });

  useEffect(
    () =>
      setColumnVisibility({
        comarca: false,
        instancia: false,
        dataDistribuicao: false,
        orgao: false,
        valorCausa: false,
        acao: false,
        posicaoProcessual: false,
        area: false,
      }),
    [],
  );

  let headers = [];
  table.getVisibleLeafColumns().map((columns) =>
    headers.push({
      label:
        typeof columns.columnDef.header === "string"
          ? columns.columnDef.header
          : "#",
      key: columns.columnDef.accessorKey,
    }),
  );

  // Função para realizar a marcação de texto
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
  }, [globalFilter, table.getRowModel().rows]);

  return (
    <>
      <MainCard content={false}>
        <ScrollX>
          <div ref={tableRef}>
            <Stack>
              <RowSelection selected={Object.keys(rowSelection).length} />
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
                                  {header.id === "ativo" && (
                                    <Tooltip
                                      title="Mostrar/Esconder Ativos e Inativos"
                                      placement="top"
                                    >
                                      <IconButton onClick={handleFilterClick}>
                                        <MoreVertIcon />
                                      </IconButton>
                                    </Tooltip>
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
                    ) : data ? (
                      data.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                          <Fragment key={row.id}>
                            <TableRow>
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
                            {row.getIsExpanded() && (
                              <TableRow>
                                <TableCell
                                  colSpan={row.getVisibleCells().length}
                                  sx={{ backgroundColor: "#f5f5f5" }}
                                >
                                  <Box sx={{ p: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                      Fases de Teste para: {row.original.name}
                                    </Typography>
                                    {/* Botão para criar uma nova fase */}
                                    <Button
                                      variant="contained"
                                      sx={{ mb: 2 }}
                                      onClick={() =>
                                        onEditPhase({
                                          isNew: true,
                                          registro: row.original,
                                        })
                                      }
                                    >
                                      Nova fase de teste
                                    </Button>
                                    {/* Lista mock de fases de teste */}
                                    {[
                                      {
                                        id: 1,
                                        nome: "Fase 1",
                                        fase: "Inicial",
                                        status: "Ativa",
                                      },
                                      {
                                        id: 2,
                                        nome: "Fase 2",
                                        fase: "Intermediária",
                                        status: "Inativa",
                                      },
                                    ].map((phase) => (
                                      <Box
                                        key={phase.id}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          mb: 1,
                                          p: 1,
                                          border: "1px solid #ddd",
                                          borderRadius: 1,
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{ flex: 1 }}
                                        >
                                          {phase.nome}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{ flex: 1 }}
                                        >
                                          {phase.fase}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{ flex: 1 }}
                                        >
                                          {phase.status}
                                        </Typography>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() =>
                                            onEditPhase({ isNew: false, phase })
                                          }
                                        >
                                          Editar
                                        </Button>
                                      </Box>
                                    ))}
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length}>
                            <EmptyTable msg="Dados não encontrados" />
                          </TableCell>
                        </TableRow>
                      )
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          sx={{ textAlign: "left" }}
                        >
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <TablePagination
                    {...{
                      setPageSize: table.setPageSize,
                      setPageIndex: table.setPageIndex,
                      getState: table.getState,
                      getPageCount: table.getPageCount,
                      totalItems: processosTotal,
                      recordType: recordType,
                    }}
                  />
                </Box>
              </>
            </Stack>
          </div>
        </ScrollX>
      </MainCard>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box p={2} sx={{ width: "200px" }}>
          <Stack direction="column" spacing={2}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography>Ativos</Typography>
              <Switch
                checked={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.checked)}
                name="ativo"
                color="success"
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography>Inativos</Typography>
              <Switch
                checked={isInactiveFilter}
                onChange={(e) => setIsInactiveFilter(e.target.checked)}
                name="inativo"
                color="success"
              />
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  getHeaderProps: PropTypes.func,
  handleAdd: PropTypes.func,
  modalToggler: PropTypes.func,
  renderRowSubComponent: PropTypes.any,
  refreshData: PropTypes.func,
  onEditPhase: PropTypes.func, // nova prop para editar fases
};

// ==============================|| LISTAGEM ||============================== //

function normalizeSampleName(sampleFromApi, index) {
  const fallbackName = `Amostra ${index + 1}`;

  if (sampleFromApi === undefined || sampleFromApi === null) {
    return fallbackName;
  }

  const trimmedSample = String(sampleFromApi).trim();
  if (!trimmedSample) return fallbackName;

  if (/^Amostra\D*\d+\s*$/i.test(trimmedSample)) {
    return fallbackName;
  }

  return trimmedSample;
}

const ListagemResultado = ({ amostras, canEdit, novoOrgao }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    refreshCount: 0,
  });

  const { acoesJudiciais, isLoading: testeLoading } = useGetResultado(
    formData,
    novoOrgao,
  );

  const [open, setOpen] = useState(false);
  const [customerDeleteId] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAcionista, setSelectedAcionista] = useState(null);

  // Estado para armazenar os dados da tabela e preservar as alterações realizadas nas células
  const [tableData, setTableData] = useState([]);

  const computedData = useMemo(() => {
    const sampleCount = Number(amostras) || 0;

    // Se ainda não veio nada do endpoint, só crie linhas com o fallback
    if (!acoesJudiciais) {
      return Array.from({ length: sampleCount }, (_, i) => ({
        amostra: `Amostra ${i + 1}`,
      }));
    }

    return Array.from({ length: sampleCount }, (_, i) => {
      // tenta ler o nome da sample da API
      const sampleFromApi = acoesJudiciais[0]?.results?.[i]?.sample;
      // usa fallback se não existir ou for string vazia
      const sampleName = normalizeSampleName(sampleFromApi, i);

      // monta a linha completa
      const row = { amostra: sampleName };

      acoesJudiciais.forEach((attribute) => {
        row[attribute.idAttribute] =
          attribute.results?.[i]?.attributeResultSample ?? "";
      });

      return row;
    });
  }, [amostras, acoesJudiciais]);

  // Inicializa o estado da tabela somente na primeira carga ou quando os dados forem inicialmente carregados
  useEffect(() => {
    if (computedData.length > 0) {
      setTableData(computedData);
    }
  }, [computedData]);

  const handleCellValueChange = useCallback(
    async (rowIndex, columnId, newValue) => {
      // guarda o estado atual da linha para usar no payload
      const currentRow = tableData[rowIndex];
      const nextValue =
        columnId === "amostra"
          ? normalizeSampleName(newValue, rowIndex)
          : newValue;

      // 1) atualiza imediatamente a UI
      setTableData((prev) => {
        const copy = [...prev];
        copy[rowIndex] = { ...copy[rowIndex], [columnId]: nextValue };
        return copy;
      });

      const token = localStorage.getItem("access_token");
      const url = `${process.env.REACT_APP_API_URL}projects/tests/phases/attributes/result`;

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // se for edição do NOME DA AMOSTRA, propaga para TODOS os atributos daquela linha
      if (columnId === "amostra") {
        const newSample = nextValue;
        acoesJudiciais.forEach(async (attr) => {
          const meta = attr.results[rowIndex];
          const payload = {
            idAttribute: attr.idAttribute,
            idTestPhaseResult: meta.idTestPhaseResult,
            sample: newSample,
            attributeResultSample: meta.attributeResultSample,
          };
          try {
            await axios.put(url, payload, { headers });
          } catch (err) {
            console.error("Erro ao atualizar nome da amostra:", err);
          }
        });
      } else {
        // edição de atributo específico
        const attr = acoesJudiciais.find((a) => a.idAttribute === columnId);
        if (!attr) return;
        const meta = attr.results[rowIndex];
        const payload = {
          idAttribute: attr.idAttribute,
          idTestPhaseResult: meta.idTestPhaseResult,
          sample: normalizeSampleName(currentRow?.amostra, rowIndex),
          attributeResultSample: nextValue,
        };

        try {
          await axios.put(url, payload, { headers });
        } catch (err) {
          console.error("Erro ao atualizar valor do atributo:", err);
        }
      }
    },
    [acoesJudiciais, tableData],
  );

  // dentro de ReactTable({ data, columns, canEdit, ... })
  const dynamicAttributeColumns = useMemo(() => {
    if (!acoesJudiciais) return [];
    return acoesJudiciais.map((attribute) => ({
      header: attribute.name,
      accessorKey: attribute.idAttribute,
      cell: (props) => (
        <EditableSelectCell
          {...props}
          canEdit={canEdit} // <-- aqui
          onCellValueChange={handleCellValueChange}
        />
      ),
    }));
  }, [acoesJudiciais, handleCellValueChange, canEdit]); // <-- adiciona canEdit

  const columns = useMemo(
    () => [
      {
        header: "Amostra",
        accessorKey: "amostra",
        cell: (props) => (
          <EditableTextCell
            {...props}
            canEdit={canEdit} // <-- e aqui
            onCellValueChange={handleCellValueChange}
          />
        ),
      },
      ...dynamicAttributeColumns,
    ],
    [dynamicAttributeColumns, theme, handleCellValueChange, canEdit], // <-- adiciona canEdit
  );

  const refreshOrgaos = () => {
    setFormData((currentData) => ({
      ...currentData,
      refreshCount: currentData.refreshCount + 1,
    }));
  };

  const handleEditAcionista = (item) => {
    setSelectedAcionista(item);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  useEffect(() => {
    window.refreshOrgaos = refreshOrgaos;
    const refreshHandler = () => {
      refreshOrgaos();
    };

    emitter.on("refreshCustomers", refreshHandler);

    return () => {
      emitter.off("refreshCustomers", refreshHandler);
      delete window.refreshOrgaos;
    };
  }, []);

  useEffect(() => {
    if (isInitialLoad && !testeLoading) {
      setIsInitialLoad(false);
    }
  }, [testeLoading, isInitialLoad]);

  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const isLoadingCombined = testeLoading;

  return (
    <>
      {isInitialLoad && isLoadingCombined ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <Box my={4}>
          {dynamicAttributeColumns.length === 0 ? (
            <EmptyTable msg="Dados de atributos não encontrados" />
          ) : (
            <ReactTable
              data={tableData}
              columns={columns}
              modalToggler={() => {}}
              processosTotal={amostras}
              onFormDataChange={handleFormDataChange}
              isLoading={isLoadingCombined}
              refreshData={refreshOrgaos}
              onEditPhase={handleEditAcionista}
              canEdit={canEdit}
            />
          )}
        </Box>
      )}

      <ColumnsLayoutsDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        teste={selectedAcionista}
        hideButton={true}
      />

      <AlertCustomerDelete
        id={customerDeleteId}
        title={customerDeleteId}
        open={open}
        handleClose={handleClose}
      />
    </>
  );
};

ListagemResultado.propTypes = {
  amostras: PropTypes.number,
};

export default ListagemResultado;
