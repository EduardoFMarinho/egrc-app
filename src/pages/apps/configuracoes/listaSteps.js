/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { API_COMMAND } from "../../../config";
import { Fragment, useMemo, useState, useEffect } from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
import CustomerModal from "../../../sections/apps/customer/CustomerModal";
import ColumnsLayoutsDrawer from "./novoStepDrawer";
import { enqueueSnackbar } from "notistack";
import AlertCustomerDelete from "../../../sections/apps/customer/AlertCustomerDelete";
import { useAvaliacoesMock } from "../../../api/steps";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";
import emitter from "./eventEmitter";
// project import
import MainCard from "../../../components/MainCard";

// material-ui
import { useTheme } from "@mui/material/styles";

import {
  Box,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  Switch,
  DialogContent,
  DialogTitle,
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
import CustomizedSteppers from "../../extra-pages/stepper";
import CircularProgress from "@mui/material/CircularProgress";
import Mark from "mark.js";
import {
  faXmark,
  faBan,
  faTrash,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";

import {
  DebouncedInput,
  HeaderSort,
  EmptyTable,
  RowSelection,
  TablePagination,
} from "../../../components/third-party/react-table";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";

import DrawerAcionista from "./novoStepDrawer";

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

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({
  data,
  columns,
  processosTotal,
  isLoading,
  actionPlanId,
  refreshData,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState({});
  const recordType = "Steps";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "nome", asc: true }]);
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
    []
  );

  const verticalDividerStyle = {
    width: "0.5px",
    height: "37px",
    backgroundColor: "#98B3C3",
    opacity: "0.75",
    flexShrink: "0",
    marginRight: "0px",
    marginLeft: "7px",
  };

  let headers = [];
  table.getVisibleLeafColumns().map((columns) =>
    headers.push({
      label:
        typeof columns.columnDef.header === "string"
          ? columns.columnDef.header
          : "#",
      key: columns.columnDef.accessorKey,
    })
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
        <Stack direction="row" spacing={1} alignItems="center">
          <DebouncedInput
            value={globalFilter ?? ""}
            onFilterChange={(value) => setGlobalFilter(String(value))}
            placeholder={`Pesquise pelo nome`}
            style={{
              width: "350px",
              height: "33px",
              borderRadius: "8px",
              border: "0.3px solid #00000010",
              backgroundColor: "#FFFFFF",
            }}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <div style={verticalDividerStyle}></div>

          <Stack direction="row" spacing={2} alignItems="center">
            {/* Inserir o botão aqui */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                ml: 0.75,
              }}
            >
              <DrawerAcionista
                actionPlanId={actionPlanId}
                processoSelecionadoId={actionPlanId}
                onStepCreated={refreshData}
                buttonSx={{
                  marginLeft: 1.5,
                  height: "20px",
                  minWidth: "20px",
                }}
              />
            </Box>
          </Stack>
        </Stack>
      </Stack>
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
                                      header.getContext()
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
                        table.getRowModel().rows.map((row, index) => (
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
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
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
  actionPlanId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function ActionCell({ row, refreshData, onEdit }) {
  const navigation = useNavigate();
  const { token } = useToken();
  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState(row.original.active);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

  // Função para buscar os dados atualizados do step e chamar onEdit
  const handleEditStep = async () => {
    try {
      const getResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}action-plans/steps/${row.original.idActionPlanStep}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Chama a função de edição com os dados retornados do endpoint
      onEdit(getResponse.data);
      handleClose();
    } catch (error) {
      console.error("Erro ao buscar dados do step para edição:", error);
      // Aqui você pode tratar o erro, por exemplo, exibindo um snackbar
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    handleClose();
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    handleClose();
  };

  const toggleStatus = async () => {
    // Define o novo status: se estiver ativo, inativa; se estiver inativo, ativa
    const newStatusBool = !status;
    const newStatusText = newStatusBool ? "Ativo" : "Inativo";

    try {
      // Consulta o endpoint para obter os dados atuais do step
      const getResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}action-plans/steps/${row.original.idActionPlanStep}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clona a resposta e altera o campo "active"
      const dadosStep = getResponse.data;
      const dadosAtualizados = {
        ...dadosStep,
        active: newStatusBool,
      };

      // Envia a requisição PUT com o payload atualizado para o endpoint de edição
      const putResponse = await axios.put(
        `${process.env.REACT_APP_API_URL}action-plans/steps`,
        dadosAtualizados,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (putResponse.status === 204) {
        setStatus(newStatusBool);
        const message = `Step ${row.original.name} ${newStatusText.toLowerCase()}.`;
        enqueueSnackbar(message, {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        refreshData();
      } else {
        throw new Error(`Falha ao atualizar: ${putResponse.status}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      enqueueSnackbar(
        `Erro: ${error.response?.data || error.message}`,
        { variant: "error" }
      );
    }

    handleDialogClose();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_COMMAND}/api/Orgao/${row.original.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        enqueueSnackbar(`Empresa ${row.original.nome} excluído.`, {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });
        refreshData();
      } else {
        const errorBody = await response.text();
        throw new Error(
          `Falha ao excluir o empresa: ${response.status} ${response.statusText} - ${errorBody}`
        );
      }
    } catch (error) {
      console.error("Erro:", error);
      setOpenErrorDialog(true);
    }

    handleDeleteDialogClose();
  };

  const buttonStyle = {
    borderRadius: 8,
    backgroundColor: "#1C52970D",
    width: "30px",
    height: "30px",
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

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
        style={buttonStyle}
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
            onClick={handleEditStep}
            color="primary"
            style={{ color: "#707070", fontWeight: 400 }}
          >
            Editar
          </Button>

          <Button
            onClick={() => {
              if (row.original.active === true) handleDialogOpen();
              else toggleStatus();
            }}
            style={{ color: "#707070", fontWeight: 400 }}
          >
            {row.original.active === true ? "Inativar" : "Ativar"}
          </Button>
        </Stack>
      </Popover>
      {/* Diálogos e demais componentes permanecem inalterados */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        sx={{
          "& .MuiPaper-root": {
            width: "547px",
            height: "290px",
            maxWidth: "none",
          },
        }}
      >
        {/* Conteúdo do diálogo de inativação */}
      </Dialog>
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        sx={{
          "& .MuiPaper-root": {
            width: "547px",
            height: "290px",
            maxWidth: "none",
          },
        }}
      >
        {/* Conteúdo do diálogo de exclusão */}
      </Dialog>
      <Dialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        sx={{
          "& .MuiPaper-root": {
            width: "547px",
            height: "290px",
            maxWidth: "none",
          },
        }}
      >
        {/* Conteúdo do diálogo de erro */}
      </Dialog>
    </Stack>
  );
}

ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
};


ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
};

// ==============================|| LISTAGEM ||============================== //

// Componente principal da página de listagem de registros
const ListagemAvaliacoes = ({ actionPlanId: actionPlanIdProp }) => {
  const { token } = useToken();
  const theme = useTheme();
  const location = useLocation();
  const { processoSelecionadoId } = location.state || {};
  const actionPlanId = actionPlanIdProp ?? processoSelecionadoId;
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const {
    steps: lists,
    isLoading,
    refetch,
  } = useAvaliacoesMock(formData, actionPlanId);
  const processosTotal = lists ? lists.length : 0;
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDeleteId] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAcionista, setSelectedAcionista] = useState(null);

  const handleOpenDrawer = () => {
    setSelectedAcionista(null); // Para cadastro novo, sem dados
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleStepClick = async (stepId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}action-plans/steps/${stepId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar os dados do step');
      }
      const data = await response.json();
      // Envia os dados retornados do endpoint para a função que abre o drawer
      handleEditAcionista(data);
    } catch (error) {
      console.error("Erro ao buscar os dados do step:", error);
      // Aqui você pode tratar o erro (exibir mensagem, etc)
    }
  };
  
  

  useEffect(() => {
    window.refreshOrgaos = refreshOrgaos; // Torna a função global
    const refreshHandler = () => {
      refreshOrgaos();
    };

    emitter.on("refreshCustomers", refreshHandler);

    return () => {
      emitter.off("refreshCustomers", refreshHandler);
      delete window.refreshOrgaos; // Remove quando não necessário
    };
  }, []);

  // Handler para atualizar 'formData' e disparar uma nova consulta
  const refreshOrgaos = () => {
    setFormData((currentData) => ({
      ...currentData,
      refreshCount: currentData.refreshCount + 1,
    }));
    if (window.refreshPlanoDates) {
      window.refreshPlanoDates();
    }
  };

  const handleEditAcionista = (acionista) => {
    setSelectedAcionista(acionista);
    setDrawerOpen(true);
  };

  useEffect(() => {
    const refreshHandler = () => {
      refreshOrgaos();
    };

    emitter.on("refreshCustomers", refreshHandler);

    return () => {
      emitter.off("refreshCustomers", refreshHandler);
    };
  }, []);

  // Filtra a lista para incluir somente os clientes com 'marco' como true
  const marcoTrueLists = useMemo(() => {
    if (lists && lists.length) {
      return lists.filter((item) => item.marco === true);
    }
    return [];
  }, [lists]);

  // Função para fechar modais
  const handleClose = () => {
    setOpen(!open);
  };

  // Função callback para atualizar formData
  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}


  // Definição das colunas da tabela
  const columns = useMemo(
    () => [
      {
        header: "Nome",
        accessorKey: "name",
        cell: ({ row, getValue }) => (
          <Typography
            onClick={() => handleStepClick(row.original.idActionPlanStep)}
            sx={{ cursor: "pointer" }}
          >
            {getValue()}
          </Typography>
        ),
      },

      {
        header: "Data inicial",
        accessorKey: "startDate",
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        header: "Data final",
        accessorKey: "endDate",
        cell: ({ getValue }) => formatDate(getValue()),
      },
      // {
      //   header: "Status",
      //   accessorKey: "ativo",
      //   cell: ({ row }) => (
      //     <Chip
      //       label={row.original.active === true ? "Ativo" : "Inativo"}
      //       color={row.original.active === true ? "success" : "error"}
      //       sx={{
      //         backgroundColor: "transparent",
      //         color: "#00000099",
      //         fontWeight: 600,
      //         fontSize: "12px",
      //         height: "28px",
      //         "& .MuiChip-icon": {
      //           color:
      //             row.original.active === true ? "success.main" : "error.main",
      //           marginLeft: "4px",
      //         },
      //       }}
      //       icon={
      //         <span
      //           style={{
      //             backgroundColor:
      //               row.original.active === true ? "green" : "red",
      //             borderRadius: "50%",
      //             display: "inline-block",
      //             width: "8px",
      //             height: "8px",
      //             marginRight: "-6px",
      //             marginLeft: "2px",
      //           }}
      //         />
      //       }
      //     />
      //   ),
      // },
      {
        header: " ",
        disableSortBy: true,
        cell: ({ row }) => (
          <ActionCell
            row={row}
            refreshData={refreshOrgaos}
            onEdit={handleEditAcionista}
          />
        ),
      },
    ],
    [theme]
  );

  useEffect(() => {
    if (isInitialLoad && !isLoading) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  return (
    <>
      {marcoTrueLists && marcoTrueLists.length > 0 && (
        <CustomizedSteppers andamentosTimeline={marcoTrueLists} />
      )}

      {isInitialLoad && isLoading ? (
        // Exibir indicador de carregamento apenas no carregamento inicial
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
          {lists && (
            <ReactTable
              {...{
                data: lists,
                columns,
                modalToggler: () => {
                  setCustomerModal(true);
                  setSelectedCustomer(null);
                },
                processosTotal,
                actionPlanId,
                onFormDataChange: handleFormDataChange,
                isLoading,
                refreshData: refreshOrgaos,
              }}
            />
          )}
        </Box>
      )}

      {/* Renderiza o Drawer passando os dados necessários */}
      <ColumnsLayoutsDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        acionista={selectedAcionista}
        actionPlanId={actionPlanId}
        processoSelecionadoId={actionPlanId}
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

ListagemAvaliacoes.propTypes = {
  actionPlanId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ListagemAvaliacoes;
