/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { API_COMMAND } from "../../../config";
import { Fragment, useMemo, useState, useEffect } from "react";
import Popover from "@mui/material/Popover";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
import CustomerModal from "../../../sections/apps/customer/CustomerModal";
import { enqueueSnackbar } from "notistack";
import AlertCustomerDelete from "../../../sections/apps/customer/AlertCustomerDelete";
import { useGetTeste } from "../../../api/faseTeste";
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
} from "../../../components/third-party/react-table"; import axios from "axios";
import { useToken } from "../../../api/TokenContext";

// assets
import { PlusOutlined } from "@ant-design/icons";

export const fuzzyFilter = (row, columnId, value) => {
  // 1) pega o valor bruto da célula
  let cellValue = row.getValue(columnId);

  // 2) mapeia testPhaseStatus de número → texto
  if (columnId === "testPhaseStatus") {
    const statusLabelMap = {
      1: "Nao Iniciado",
      2: "Em Teste",
      3: "Em Teste",
      4: "Concluido",
      5: "Concluido",
      6: "Em Teste",
    };
    cellValue = statusLabelMap[cellValue] || "";
  }

  // 3) mapeia active de boolean → texto
  if (columnId === "active") {
    cellValue = cellValue ? "Ativo" : "Inativo";
  }

  // 4) caso ainda seja undefined ou filtro vazio
  if (cellValue === undefined || value === undefined) {
    return false;
  }

  // 5) normaliza (remove acentos e caixa)
  const normalize = (str) =>
    str
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  return normalize(cellValue).includes(normalize(value));
};


// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({
  data,
  columns,
  processosTotal,
  isLoading,
  disableCreate = false,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const TesteId = dadosApi.idTest
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const [columnVisibility, setColumnVisibility] = useState({});
  const recordType = "Fases";
  const tableRef = useRef(null);
  const [sorting, setSorting] = useState([{ id: "nome", asc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [isInactiveFilter, setIsInactiveFilter] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigation = useNavigate();

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
              <Tooltip
                title={
                  disableCreate
                    ? "Nao e possivel adicionar novas fases apos a conclusao do teste."
                    : ""
                }
              >
                <span>
                  <Button
                    variant="contained"
                    disabled={disableCreate}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigation(`/fase/criar`, {
                        state: { indoPara: "NovaFaseTeste", TesteId },
                      });
                    }}
                    startIcon={<PlusOutlined />}
                    style={{ borderRadius: "20px", height: "32px" }}
                  >
                    Novo
                  </Button>
                </span>
              </Tooltip>
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
  disableCreate: PropTypes.bool,
  getHeaderProps: PropTypes.func,
  handleAdd: PropTypes.func,
  modalToggler: PropTypes.func,
  renderRowSubComponent: PropTypes.any,
  refreshData: PropTypes.func,
};

function ActionCell({ row, refreshData }) {
  const navigation = useNavigate();
  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const TesteId = dadosApi.idTest
  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState(row.original.active);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

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
    const idProject = row.original.idProject;
    const newStatus = status === true ? "Inativo" : "Ativo";
    
    try {
      // Buscar os dados do departamento pelo ID
      const getResponse = await axios.get(`${process.env.REACT_APP_API_URL}projects/${idProject}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const dadosEndpoint = getResponse.data;
  
      // Definir o novo status do campo "active"
      const dadosAtualizados = { ...dadosEndpoint, active: newStatus === "Ativo" };
  
      // Enviar os dados atualizados via PUT
      await axios.put(`${process.env.REACT_APP_API_URL}projects`, dadosAtualizados, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      // Atualizar o estado e exibir mensagem de sucesso
      setStatus(newStatus);
      const message = `Projeto ${row.original.name} ${newStatus.toLowerCase()}.`;
  
      enqueueSnackbar(message, {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
  
      refreshData();
    } catch (error) {
      console.error("Erro:", error);
      enqueueSnackbar(`Erro: ${error.response?.data || error.message}`, { variant: "error" });
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
            onClick={() => {
              const dadosApi = row.original;
              navigation(`/fase/criar`, {
                state: {
                  indoPara: "NovaFaseTeste",
                  dadosApi, TesteId
                },
              });
              handleClose();
            }}
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
        <DialogTitle
          sx={{
            background: "#ED5565",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
                color: "rgba(255, 255, 255, 1)",
                "&:hover": {
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  color: "white",
                  cursor: "default",
                },
              }}
            >
              <FontAwesomeIcon icon={faBan} />
            </IconButton>

            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Open Sans", Helvetica, sans-serif',
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "21px",
                letterSpacing: "0em",
                textAlign: "left",
                color: "rgba(255, 255, 255, 1)",
                flexGrow: 1,
              }}
            >
              Inativar
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            sx={{
              color: "rgba(255, 255, 255, 1)",
              "&:hover": {
                backgroundColor: "transparent",
                boxShadow: "none",
                color: "white",
              },
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            Tem certeza que deseja inativar o empresa "{row.original.nome}"?
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            Ao inativar, esse empresa não aparecerá mais no cadastro manual do
            processo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={toggleStatus}
            color="primary"
            autoFocus
            style={{
              marginTop: "-55px",
              width: "162px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: "#ED5565",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textTransform: "none",
            }}
          >
            Sim, inativar
          </Button>
          <Button
            onClick={handleDialogClose}
            style={{
              marginTop: "-55px",
              padding: "8px 16px",
              width: "91px",
              height: "32px",
              borderRadius: "4px",
              border: "1px solid rgba(0, 0, 0, 0.40)",
              background: "#FFF",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--label-60, rgba(0, 0, 0, 0.60))",
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
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
        <DialogTitle
          sx={{
            background: "#ED5565",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
                color: "rgba(255, 255, 255, 1)",
                "&:hover": {
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  color: "white",
                  cursor: "default",
                },
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </IconButton>

            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Open Sans", Helvetica, sans-serif',
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "21px",
                letterSpacing: "0em",
                textAlign: "left",
                color: "rgba(255, 255, 255, 1)",
                flexGrow: 1,
              }}
            >
              Excluir
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleDeleteDialogClose}
            sx={{
              color: "rgba(255, 255, 255, 1)",
              "&:hover": {
                backgroundColor: "transparent",
                boxShadow: "none",
                color: "white",
              },
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            Tem certeza que deseja excluir o empresa "{row.original.nome}"?
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            Esse empresa não será mais disponibilizado ao cadastrar um novo
            processo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDelete}
            color="primary"
            autoFocus
            style={{
              marginTop: "-55px",
              width: "162px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: "#ED5565",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textTransform: "none",
            }}
          >
            Sim, excluir
          </Button>
          <Button
            onClick={handleDeleteDialogClose}
            style={{
              marginTop: "-55px",
              padding: "8px 16px",
              width: "91px",
              height: "32px",
              borderRadius: "4px",
              border: "1px solid rgba(0, 0, 0, 0.40)",
              background: "#FFF",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--label-60, rgba(0, 0, 0, 0.60))",
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
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
        <DialogTitle
          sx={{
            background: "#F69B50",
            width: "auto",
            height: "42px",
            borderRadius: "4px 4px 0px 0px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
              aria-label="delete"
              sx={{
                fontSize: "16px",
                marginRight: "2px",
                color: "rgba(255, 255, 255, 1)",
                "&:hover": {
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  color: "white",
                  cursor: "default",
                },
              }}
            >
              <FontAwesomeIcon icon={faExclamation} />
            </IconButton>

            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Open Sans", Helvetica, sans-serif',
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "21px",
                letterSpacing: "0em",
                textAlign: "left",
                color: "rgba(255, 255, 255, 1)",
                flexGrow: 1,
              }}
            >
              Exclusão não permitida
            </Typography>
          </div>
          <IconButton
            aria-label="close"
            onClick={() => setOpenErrorDialog(false)}
            sx={{
              color: "rgba(255, 255, 255, 1)",
              "&:hover": {
                backgroundColor: "transparent",
                boxShadow: "none",
                color: "white",
              },
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            component="div"
            style={{ fontWeight: "bold", marginTop: "35px", color: "#717171" }}
          >
            Não é possível excluir o Empresa.
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            O empresa não pode ser excluído pois está vinculado a processos. É
            possível inativar o empresa nas configurações de edição.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenErrorDialog(false)}
            style={{
              marginTop: "-55px",
              width: "64px",
              height: "32px",
              padding: "8px 16px",
              borderRadius: "4px",
              background: "#F69B50",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              textTransform: "none",
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
};

// ==============================|| LISTAGEM ||============================== //

// Componente principal da página de listagem de registros
const ListagemEmpresa = ({ disableCreate = false }) => {
  const theme = useTheme();
  const navigation = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const TesteId = dadosApi.idTest;
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const {
    acoesJudiciais: lists,
    isLoading,
    refetch,
  } = useGetTeste(formData, dadosApi);
  const processosTotal = lists ? lists.length : 0;
  const [open, setOpen] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDeleteId] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handler para atualizar 'formData' e disparar uma nova consulta
  const refreshOrgaos = () => {
    setFormData((currentData) => ({
      ...currentData,
      refreshCount: currentData.refreshCount + 1,
    }));
    
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

  // Função para fechar modais
  const handleClose = () => {
    setOpen(!open);
  };

  // Função callback para atualizar formData
  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  // Definição das colunas da tabela
  const columns = useMemo(
    () => [
      {
        header: "Fase",
        accessorKey: "name",
        cell: ({ row }) => (
          <Typography
            sx={{ fontSize: "13px", cursor: "pointer" }}
            onClick={() =>
              navigation(`/fase/criar`, {
                state: {
                  indoPara: "NovaFaseTeste",
                  dadosApi: row.original,
                  TesteId
                },
              })
            }
          >
            {row.original.name}
          </Typography>
        ),
      },
      {
        header: "Status Fase",
        accessorKey: "testPhaseStatus",
        cell: ({ row }) => {
          const status = row.original.testPhaseStatus;
          const statusMap = {
            1: { label: "Nao Iniciado", bgColor: theme.palette.grey[400] },
            2: { label: "Em Teste", bgColor: theme.palette.primary.light },
            3: { label: "Em Teste", bgColor: theme.palette.primary.light },
            4: { label: "Concluido", bgColor: theme.palette.success.light },
            5: { label: "Concluido", bgColor: theme.palette.success.light },
            6: { label: "Em Teste", bgColor: theme.palette.primary.light },
          };
          const { label, bgColor } = statusMap[status] || {};
          return (
            <Chip
              label={label}
              sx={{
                backgroundColor: bgColor,
                color: theme.palette.getContrastText(bgColor),
                fontWeight: 600,
                fontSize: "12px",
                height: "28px",
              }}
            />
          );
        },
      },
      {
        header: "Status",
        accessorKey: "active",
        cell: ({ row }) => (
          <Chip
            label={row.original.active === true ? "Ativo" : "Inativo"}
            color={row.original.active === true ? "success" : "error"}
            sx={{
              backgroundColor: "transparent",
              color: "#00000099",
              fontWeight: 600,
              fontSize: "12px",
              height: "28px",
              "& .MuiChip-icon": {
                color:
                  row.original.active === true ? "success.main" : "error.main",
                marginLeft: "4px",
              },
            }}
            icon={
              <span
                style={{
                  backgroundColor:
                    row.original.active === true ? "green" : "red",
                  borderRadius: "50%",
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  marginRight: "-6px",
                  marginLeft: "2px",
                }}
              />
            }
          />
        ),
      },
      {
        header: " ",
        disableSortBy: true,
        cell: ({ row }) => (
          <ActionCell row={row} refreshData={refreshOrgaos} />
        ), // Passa refreshData
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
        <Box>
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
                onFormDataChange: handleFormDataChange,
                isLoading,
                disableCreate,
                refreshData: refreshOrgaos,
              }}
            />
          )}
        </Box>
      )}
      <AlertCustomerDelete
        id={customerDeleteId}
        title={customerDeleteId}
        open={open}
        handleClose={handleClose}
      />
      <CustomerModal
        open={customerModal}
        modalToggler={setCustomerModal}
        customer={selectedCustomer}
      />
    </>
  );
};

ListagemEmpresa.propTypes = {
  disableCreate: PropTypes.bool,
};

ListagemEmpresa.propTypes = {
  disableCreate: PropTypes.bool,
};

export default ListagemEmpresa;
