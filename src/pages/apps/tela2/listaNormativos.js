/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Mark from "mark.js";
import { enqueueSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "@mui/material/styles";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  InputLabel,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
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

import { useGetNormativos } from "../../../api/normativos";
import { useToken } from "../../../api/TokenContext";
import IconButton from "../../../components/@extended/IconButton";
import MainCard from "../../../components/MainCard";
import ScrollX from "../../../components/ScrollX";
import {
  DebouncedInput,
  EmptyTable,
  HeaderSort,
  RowSelection,
  SelectColumnVisibility,
  TablePagination,
} from "../../../components/third-party/react-table";
import emitter from "./eventEmitter";

const COLUMN_VISIBILITY_STORAGE_KEY = "egrc_table_visibility_normativos";

const NORMATIVE_STATUS_LABELS = {
  1: "Elaboração",
  2: "Em aprovação",
  3: "Versão final",
  4: "Revogado",
  5: "Em alteração",
};

const REVISION_STATUS_LABELS = {
  1: "Revisada",
  2: "Próxima da revisão",
  3: "Em atraso",
};

const NORMATIVE_INTERN_TYPE_LABELS = {
  1: "Interno",
  2: "Externo",
};

const defaultVisibility = {
  date: true,
  code: true,
  name: true,
  normativeStatus: true,
  environment: true,
  regulatory: true,
  type: true,
  responsible: true,
  revisionStatus: true,
  companies: true,
  departments: true,
  actions: true,
};

const getNormativeId = (normative) =>
  normative?.idNormative ?? normative?.id ?? null;

const normalizeText = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const normalizeNormativeInternType = (value) => {
  const numericValue = Number(value);
  return [1, 2].includes(numericValue) ? numericValue : null;
};

const normalizeArrayValue = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap(normalizeArrayValue).filter(Boolean);
  }

  if (value === null || value === undefined || value === "") {
    return [];
  }

  if (typeof value === "object") {
    const candidate =
      value.name ??
      value.nome ??
      value.label ??
      value.value ??
      value.title ??
      value.environmentName ??
      value.normativeInternTypeName ??
      value.normativeInternTypeDescription ??
      value.statusName ??
      value.description ??
      value.code ??
      null;
    return candidate ? [String(candidate)] : [];
  }

  return [String(value)];
};

const formatFieldValue = (value) => {
  const values = normalizeArrayValue(value);
  return values.length > 0 ? values.join(", ") : "-";
};

const formatDateValue = (value) => {
  if (!value) return "-";

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNormativeStatusLabel = (status) =>
  NORMATIVE_STATUS_LABELS[Number(status)] || (status ? String(status) : "-");

const getRevisionStatusLabel = (status) =>
  REVISION_STATUS_LABELS[Number(status)] || (status ? String(status) : "-");

const getNormativeInternTypeLabel = (value) => {
  const normalizedType = normalizeNormativeInternType(value);
  return normalizedType ? NORMATIVE_INTERN_TYPE_LABELS[normalizedType] : null;
};

const resolveNormativeStatusValue = (normative) =>
  normative?.normativeStatus ??
  normative?.statusNorma ??
  normative?.idNormativeStatus ??
  normative?.normativeStatusId ??
  normative?.normativeStatusName ??
  normative?.normativeStatusDescription ??
  normative?.statusDescription ??
  null;

const resolveEnvironmentValue = (normative) =>
  getNormativeInternTypeLabel(
    normative?.normativeInternType ??
      normative?.environment?.id,
  ) ??
  normative?.normativeInternTypeName ??
  normative?.normativeInternTypeDescription ??
  normative?.environment ??
  normative?.environments ??
  normative?.environmentName ??
  normative?.environmentDescription ??
  normative?.environmentLabel ??
  normative?.nameEnvironment ??
  normative?.environmentsName ??
  null;

const getNormativeStatusChipColor = (status) => {
  const numericStatus = Number(status);
  const normalizedStatus = normalizeText(status || "");

  switch (numericStatus) {
    case 1:
      return "warning";
    case 2:
      return "info";
    case 3:
      return "success";
    case 4:
      return "error";
    case 5:
      return "primary";
    default:
      if (normalizedStatus.includes("elabor")) return "warning";
      if (normalizedStatus.includes("aprov")) return "info";
      if (normalizedStatus.includes("vers") || normalizedStatus.includes("final")) {
        return "success";
      }
      if (normalizedStatus.includes("revog")) return "error";
      if (normalizedStatus.includes("alter")) return "primary";
      return "default";
  }
};

const normalizeUploadedFiles = (files) =>
  Array.isArray(files)
    ? files
        .filter(Boolean)
        .map((file) => {
          if (typeof file === "string") return file;

          return (
            file.id ||
            file.fileId ||
            file.idFile ||
            file.idArquivo ||
            file.url ||
            file.path ||
            file.fileName ||
            file.name ||
            ""
          );
        })
        .filter((value) => typeof value === "string" && value.length > 0)
    : [];

const buildNormativeUpdatePayload = (normativeData, nextActive) => {
  const payload = {
    ...normativeData,
    active: nextActive,
  };
  const normalizedInternType = normalizeNormativeInternType(
    payload.normativeInternType ??
      payload.environment?.id,
  );

  if (
    payload.daysRevision !== null &&
    payload.daysRevision !== undefined &&
    payload.daysRevision !== ""
  ) {
    payload.daysRevision = String(payload.daysRevision);
  }

  if (normalizedInternType) {
    payload.normativeInternType = normalizedInternType;
  }

  payload.files = normalizeUploadedFiles(payload.files);

  return payload;
};

export const fuzzyFilter = (row, columnId, value) => {
  const cellValue = row.getValue(columnId);

  if (
    cellValue === undefined ||
    cellValue === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  const cellString = Array.isArray(cellValue)
    ? cellValue.map((item) => normalizeText(item)).join(" ")
    : normalizeText(cellValue);

  const searchTerms = normalizeText(value)
    .split(" ")
    .filter((term) => term.trim() !== "");

  return searchTerms.every((term) => cellString.includes(term));
};

function ReactTable({ data, columns, isLoading, onExportExcel }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const matchDownSM = useMediaQuery(theme.breakpoints.down("sm"));
  const navigation = useNavigate();
  const tableRef = useRef(null);
  const recordType = "Normativos";

  const [columnVisibility, setColumnVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultVisibility;
    } catch (error) {
      console.error("Erro ao carregar visibilidade das colunas", error);
      return defaultVisibility;
    }
  });
  const [sorting, setSorting] = useState([{ id: "date", desc: true }]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [codeOptions, setCodeOptions] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const [normativeStatusOptions, setNormativeStatusOptions] = useState([]);
  const [environmentOptions, setEnvironmentOptions] = useState([]);
  const [regulatoryOptions, setRegulatoryOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [responsibleOptions, setResponsibleOptions] = useState([]);
  const [revisionStatusOptions, setRevisionStatusOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [draftFilters, setDraftFilters] = useState({
    date: [],
    code: [],
    name: [],
    normativeStatus: [],
    environment: [],
    regulatory: [],
    type: [],
    responsible: [],
    revisionStatus: [],
    companies: [],
    departments: [],
  });

  useEffect(() => {
    localStorage.setItem(
      COLUMN_VISIBILITY_STORAGE_KEY,
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);

  useEffect(() => {
    const getUniqueValues = (values) =>
      [...new Set(values.flatMap((value) => normalizeArrayValue(value)))]
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right));

    const getSortedDateOptions = () =>
      [
        ...new Map(
          (data || [])
            .filter((item) => item.date)
            .map((item) => [formatDateValue(item.date), item.date]),
        ).entries(),
      ]
        .sort(
          (left, right) =>
            new Date(right[1]).getTime() - new Date(left[1]).getTime(),
        )
        .map(([label]) => label);

    setDateOptions(getSortedDateOptions());
    setCodeOptions(getUniqueValues((data || []).map((item) => item.code)));
    setNameOptions(getUniqueValues((data || []).map((item) => item.name)));
    setNormativeStatusOptions(
      getUniqueValues(
        (data || []).map((item) =>
          getNormativeStatusLabel(item.normativeStatus),
        ),
      ),
    );
    setEnvironmentOptions(
      getUniqueValues((data || []).map((item) => item.environment)),
    );
    setRegulatoryOptions(
      getUniqueValues((data || []).map((item) => item.regulatory)),
    );
    setTypeOptions(getUniqueValues((data || []).map((item) => item.type)));
    setResponsibleOptions(
      getUniqueValues((data || []).map((item) => item.responsible)),
    );
    setRevisionStatusOptions(
      getUniqueValues(
        (data || []).map((item) =>
          getRevisionStatusLabel(item.revisionStatus),
        ),
      ),
    );
    setCompanyOptions(
      getUniqueValues((data || []).map((item) => item.companies)),
    );
    setDepartmentOptions(
      getUniqueValues((data || []).map((item) => item.departments)),
    );
  }, [data]);

  const toggleDrawer = () => {
    setDrawerOpen((current) => !current);
  };

  const applyFilters = () => {
    const nextFilters = [];

    if (draftFilters.date.length > 0) {
      nextFilters.push({
        type: "Data de Criacao",
        values: draftFilters.date,
      });
    }
    if (draftFilters.code.length > 0) {
      nextFilters.push({ type: "Codigo", values: draftFilters.code });
    }
    if (draftFilters.name.length > 0) {
      nextFilters.push({ type: "Normativa", values: draftFilters.name });
    }
    if (draftFilters.normativeStatus.length > 0) {
      nextFilters.push({
        type: "Status da Norma",
        values: draftFilters.normativeStatus,
      });
    }
    if (draftFilters.environment.length > 0) {
      nextFilters.push({
        type: "Ambiente",
        values: draftFilters.environment,
      });
    }
    if (draftFilters.regulatory.length > 0) {
      nextFilters.push({
        type: "Regulador",
        values: draftFilters.regulatory,
      });
    }
    if (draftFilters.type.length > 0) {
      nextFilters.push({ type: "Tipo", values: draftFilters.type });
    }
    if (draftFilters.responsible.length > 0) {
      nextFilters.push({
        type: "Responsavel",
        values: draftFilters.responsible,
      });
    }
    if (draftFilters.revisionStatus.length > 0) {
      nextFilters.push({
        type: "Status de Revisao",
        values: draftFilters.revisionStatus,
      });
    }
    if (draftFilters.companies.length > 0) {
      nextFilters.push({
        type: "Empresas",
        values: draftFilters.companies,
      });
    }
    if (draftFilters.departments.length > 0) {
      nextFilters.push({
        type: "Departamentos",
        values: draftFilters.departments,
      });
    }

    setSelectedFilters(nextFilters);
    toggleDrawer();
  };

  const removeFilter = (index) => {
    setSelectedFilters((currentFilters) => {
      const filterToRemove = currentFilters[index];
      const filterKeyMap = {
        "Data de Criacao": "date",
        Codigo: "code",
        Normativa: "name",
        "Status da Norma": "normativeStatus",
        Ambiente: "environment",
        Regulador: "regulatory",
        Tipo: "type",
        Responsavel: "responsible",
        "Status de Revisao": "revisionStatus",
        Empresas: "companies",
        Departamentos: "departments",
      };
      const filterKey = filterKeyMap[filterToRemove.type];

      setDraftFilters((currentDraft) => ({
        ...currentDraft,
        [filterKey]: currentDraft[filterKey].filter(
          (value) => !filterToRemove.values.includes(value),
        ),
      }));

      return currentFilters.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleRemoveAllFilters = () => {
    setSelectedFilters([]);
    setGlobalFilter("");
    setDraftFilters({
      date: [],
      code: [],
      name: [],
      normativeStatus: [],
      environment: [],
      regulatory: [],
      type: [],
      responsible: [],
      revisionStatus: [],
      companies: [],
      departments: [],
    });
  };

  const filteredData = useMemo(
    () =>
      (data || []).filter((item) =>
        selectedFilters.every((filter) => {
          if (filter.type === "Data de Criacao") {
            return filter.values.includes(formatDateValue(item.date));
          }
          if (filter.type === "Codigo") return filter.values.includes(item.code);
          if (filter.type === "Normativa") return filter.values.includes(item.name);
          if (filter.type === "Status da Norma") {
            return filter.values.includes(
              getNormativeStatusLabel(item.normativeStatus),
            );
          }
          if (filter.type === "Ambiente") {
            return filter.values.some((value) =>
              normalizeArrayValue(item.environment).includes(value),
            );
          }
          if (filter.type === "Regulador") {
            return filter.values.some((value) =>
              normalizeArrayValue(item.regulatory).includes(value),
            );
          }
          if (filter.type === "Tipo") {
            return filter.values.some((value) =>
              normalizeArrayValue(item.type).includes(value),
            );
          }
          if (filter.type === "Responsavel") {
            return filter.values.includes(item.responsible);
          }
          if (filter.type === "Status de Revisao") {
            return filter.values.includes(
              getRevisionStatusLabel(item.revisionStatus),
            );
          }
          if (filter.type === "Empresas") {
            return filter.values.some((value) =>
              normalizeArrayValue(item.companies).includes(value),
            );
          }
          if (filter.type === "Departamentos") {
            return filter.values.some((value) =>
              normalizeArrayValue(item.departments).includes(value),
            );
          }
          return true;
        }),
      ),
    [data, selectedFilters],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, rowSelection, globalFilter, columnVisibility },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true,
  });

  const getAllColumnsFiltered = () =>
    table
      .getAllLeafColumns()
      .filter((column) => !["actions", "select"].includes(column.id));

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

  const visibleColumnCount =
    table.getVisibleLeafColumns().length || columns.length || 1;

  const verticalDividerStyle = {
    width: "0.5px",
    height: "37px",
    backgroundColor: "#98B3C3",
    opacity: "0.75",
    flexShrink: "0",
    marginLeft: "7px",
  };

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
          <SelectColumnVisibility
            {...{
              getVisibleLeafColumns: table.getVisibleLeafColumns,
              getIsAllColumnsVisible: table.getIsAllColumnsVisible,
              getToggleAllColumnsVisibilityHandler:
                table.getToggleAllColumnsVisibilityHandler,
              getAllColumns: getAllColumnsFiltered,
            }}
          />
          <DebouncedInput
            value={globalFilter ?? ""}
            onFilterChange={(value) => setGlobalFilter(String(value))}
            placeholder="Pesquise por codigo, normativa ou responsavel"
            style={{
              width: "350px",
              height: "33px",
              borderRadius: "8px",
              border: "0.3px solid #00000010",
              backgroundColor: "#FFFFFF",
            }}
          />
          <Button
            onClick={toggleDrawer}
            startIcon={
              <FontAwesomeIcon icon={faFilter} style={{ color: "#00000080" }} />
            }
            style={{
              width: "90px",
              color: "#00000080",
              backgroundColor: "#FFFFFF",
              fontSize: "13px",
              marginLeft: 24,
              fontWeight: 400,
              height: "33px",
              borderRadius: "8px",
              border: "0.6px solid #00000040 ",
            }}
          >
            Filtros
          </Button>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <div style={verticalDividerStyle} />
          <Button
            variant="contained"
            onClick={() =>
              navigation("/normativas/criar", {
                state: { indoPara: "NovaNormativa" },
              })
            }
            startIcon={<PlusOutlined />}
            style={{ borderRadius: "20px", height: "32px" }}
          >
            Nova
          </Button>
          <Button
            variant="outlined"
            onClick={onExportExcel}
            startIcon={<DownloadOutlined />}
            disabled={isLoading}
            style={{ borderRadius: "20px", height: "32px" }}
          >
            Exportar Excel
          </Button>
        </Stack>
      </Stack>

      <Box mb={2}>
        {selectedFilters.map((filter, index) => (
          <Chip
            key={`${filter.type}-${index}`}
            label={
              <Box display="flex" alignItems="center">
                <Typography
                  sx={{ color: "#1C5297", fontWeight: 600, marginRight: "4px" }}
                >
                  {filter.type}:
                </Typography>
                <Typography sx={{ color: "#1C5297", fontWeight: 400 }}>
                  {filter.values.join(", ")}
                </Typography>
              </Box>
            }
            onDelete={() => removeFilter(index)}
            sx={{
              margin: 0.5,
              backgroundColor: "#1C52971A",
              border: "0.7px solid #1C529733",
            }}
          />
        ))}
        {selectedFilters.length > 0 && (
          <Chip
            label="Limpar Filtros"
            onClick={handleRemoveAllFilters}
            sx={{
              margin: 0.5,
              backgroundColor: "transparent",
              color: "#1C5297",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          />
        )}
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{ sx: { width: 670 } }}
      >
        <Box sx={{ width: 650, p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box
              component="h2"
              sx={{ color: "#1C5297", fontWeight: 600, fontSize: "16px" }}
            >
              Filtros
            </Box>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon sx={{ color: "#1C5297", fontSize: "18px" }} />
            </IconButton>
          </Stack>

          <Grid container spacing={2}>
            {[
              ["Data de Criacao", "date", dateOptions],
              ["Codigo", "code", codeOptions],
              ["Normativa", "name", nameOptions],
              ["Status da Norma", "normativeStatus", normativeStatusOptions],
              ["Ambiente", "environment", environmentOptions],
              ["Regulador", "regulatory", regulatoryOptions],
              ["Tipo", "type", typeOptions],
              ["Responsavel", "responsible", responsibleOptions],
              ["Status de Revisao", "revisionStatus", revisionStatusOptions],
              ["Empresas", "companies", companyOptions],
              ["Departamentos", "departments", departmentOptions],
            ].map(([label, key, options]) => (
              <Grid item xs={12} key={key}>
                <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                  {label}
                </InputLabel>
                <FormControl fullWidth margin="normal">
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={options}
                    value={draftFilters[key]}
                    onChange={(_, value) =>
                      setDraftFilters((current) => ({
                        ...current,
                        [key]: value,
                      }))
                    }
                    renderInput={(params) => <TextField {...params} />}
                  />
                </FormControl>
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
            <Button variant="outlined" onClick={toggleDrawer}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={applyFilters}>
              Aplicar
            </Button>
          </Stack>
        </Box>
      </Drawer>

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
                              className: `${
                                header.column.columnDef.meta.className || ""
                              } cursor-pointer prevent-select`,
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
                          colSpan={visibleColumnCount}
                          sx={{ textAlign: "center" }}
                        >
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length > 0 ? (
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
                        </Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={visibleColumnCount}>
                          <EmptyTable msg="Dados nao encontrados" />
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
                    totalItems: filteredData.length,
                    recordType,
                  }}
                />
              </Box>
            </Stack>
          </div>
        </ScrollX>
      </MainCard>
    </>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  onExportExcel: PropTypes.func,
};

function ActionCell({ row, refreshData }) {
  const navigation = useNavigate();
  const { token } = useToken();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [status, setStatus] = useState(
    typeof row.original.active === "boolean" ? row.original.active : null,
  );
  const [isResolvingStatus, setIsResolvingStatus] = useState(false);

  const normalizedNormative = {
    ...row.original,
    idNormative: getNormativeId(row.original),
  };

  useEffect(() => {
    if (typeof row.original.active === "boolean") {
      setStatus(row.original.active);
    }
  }, [row.original.active]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchNormativeDetails = async () => {
    const normativeId = normalizedNormative.idNormative;
    const authToken = token || localStorage.getItem("access_token");

    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}normatives/${normativeId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    return response.data;
  };

  const ensureStatusLoaded = async () => {
    if (typeof status === "boolean") return status;

    setIsResolvingStatus(true);

    try {
      const normativeData = await fetchNormativeDetails();
      const currentStatus = Boolean(normativeData.active);
      setStatus(currentStatus);
      return currentStatus;
    } catch (error) {
      console.error("Erro ao carregar normativa", error);
      enqueueSnackbar(
        error.response?.data?.message ||
          error.response?.data ||
          "Erro ao carregar os dados da normativa.",
        {
          variant: "error",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        },
      );
      return null;
    } finally {
      setIsResolvingStatus(false);
    }
  };

  const handleToggleStatus = async () => {
    handleClose();
    setOpenDialog(false);
    setIsResolvingStatus(true);

    try {
      const normativeData = await fetchNormativeDetails();
      const nextActive = !Boolean(normativeData.active);
      const authToken = token || localStorage.getItem("access_token");
      const payload = buildNormativeUpdatePayload(normativeData, nextActive);

      await axios.put(`${process.env.REACT_APP_API_URL}normatives`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      enqueueSnackbar(
        `Normativa ${normalizedNormative.name} ${
          nextActive ? "ativada" : "inativada"
        } com sucesso.`,
        {
          variant: "success",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        },
      );

      setStatus(nextActive);
      refreshData();
    } catch (error) {
      console.error("Erro ao atualizar normativa", error);
      enqueueSnackbar(
        error.response?.data?.message ||
          error.response?.data?.title ||
          error.response?.data ||
          "Erro ao alterar o status da normativa.",
        {
          variant: "error",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        },
      );
    } finally {
      setIsResolvingStatus(false);
    }
  };

  const buttonStyle = {
    borderRadius: 8,
    backgroundColor: "#1C52970D",
    width: "30px",
    height: "30px",
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? "normative-action-popover" : undefined;
  const statusActionLabel =
    typeof status === "boolean"
      ? status
        ? "Inativar"
        : "Ativar"
      : isResolvingStatus
        ? "Carregando..."
        : "Alterar status";

  return (
    <Stack direction="row" alignItems="center" justifyContent="center">
      <IconButton
        aria-describedby={popoverId}
        color="primary"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        style={buttonStyle}
      >
        <MoreVertIcon />
      </IconButton>

      <Popover
        id={popoverId}
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
              navigation("/normativas/criar", {
                state: {
                  indoPara: "NovaNormativa",
                  dadosApi: {
                    idNormative: normalizedNormative.idNormative,
                  },
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
            disabled={isResolvingStatus}
            onClick={async () => {
              const currentStatus =
                typeof status === "boolean" ? status : await ensureStatusLoaded();

              if (currentStatus === null) return;

              if (currentStatus) {
                setOpenDialog(true);
              } else {
                handleToggleStatus();
              }
            }}
            style={{ color: "#707070", fontWeight: 400 }}
          >
            {statusActionLabel}
          </Button>
        </Stack>
      </Popover>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
              aria-label="status"
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
            onClick={() => setOpenDialog(false)}
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
            Tem certeza que deseja inativar a normativa "{normalizedNormative.name}"?
          </Typography>
          <Typography
            component="div"
            style={{ marginTop: "20px", color: "#717171" }}
          >
            Ao inativar, essa normativa nao aparecera mais no cadastro manual.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleToggleStatus}
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
              color: "#FFFFFF",
              textTransform: "none",
            }}
          >
            Sim, inativar
          </Button>
          <Button
            onClick={() => setOpenDialog(false)}
            style={{
              marginTop: "-55px",
              padding: "8px 16px",
              width: "91px",
              height: "32px",
              borderRadius: "4px",
              border: "1px solid rgba(0, 0, 0, 0.40)",
              background: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              color: "rgba(0, 0, 0, 0.60)",
            }}
          >
            Cancelar
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

const ListagemNormativos = () => {
  const theme = useTheme();
  const navigation = useNavigate();
  const [formData, setFormData] = useState({ refreshCount: 0 });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { acoesJudiciais: resultData, isLoading } = useGetNormativos(formData);

  const lists = useMemo(
    () =>
      (resultData || []).map((normative) => ({
        ...normative,
        idNormative: getNormativeId(normative),
        normativeStatus: resolveNormativeStatusValue(normative),
        environment: resolveEnvironmentValue(normative),
        companies: normalizeArrayValue(normative.companies),
        departments: normalizeArrayValue(normative.departments),
      })),
    [resultData],
  );

  const refreshNormatives = () => {
    setFormData((current) => ({
      ...current,
      refreshCount: current.refreshCount + 1,
    }));
  };

  useEffect(() => {
    const refreshHandler = () => {
      refreshNormatives();
    };

    emitter.on("refreshCustomers", refreshHandler);

    return () => {
      emitter.off("refreshCustomers", refreshHandler);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, isLoading]);

  useEffect(() => {
    if (!isLoading && formData.GenerateExcel) {
      setFormData((current) => {
        if (!current.GenerateExcel) return current;
        const { GenerateExcel, ...nextState } = current;
        return nextState;
      });
    }
  }, [formData.GenerateExcel, isLoading]);

  const handleExportExcel = () => {
    setFormData((current) => ({
      ...current,
      GenerateExcel: true,
      refreshCount: current.refreshCount + 1,
    }));
  };

  const handleOpenNormative = (normative) => {
    navigation("/normativas/criar", {
      state: {
        indoPara: "NovaNormativa",
        dadosApi: {
          idNormative: getNormativeId(normative),
        },
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        header: "Codigo",
        accessorKey: "code",
        cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
            onClick={() => handleOpenNormative(row.original)}
          >
            {row.original.code || "-"}
          </Typography>
        ),
      },
      {
        header: "Normativa",
        accessorKey: "name",
        cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
            onClick={() => handleOpenNormative(row.original)}
          >
            {row.original.name || "-"}
          </Typography>
        ),
      },
      {
        header: "Status da Norma",
        accessorFn: (row) => getNormativeStatusLabel(row.normativeStatus),
        id: "normativeStatus",
        cell: ({ row }) => (
          <Chip
            label={getNormativeStatusLabel(row.original.normativeStatus)}
            color={getNormativeStatusChipColor(row.original.normativeStatus)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        header: "Ambiente",
        accessorFn: (row) => normalizeArrayValue(row.environment).join(", "),
        id: "environment",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatFieldValue(row.original.environment)}
          </Typography>
        ),
      },
      {
        header: "Regulador",
        accessorFn: (row) => normalizeArrayValue(row.regulatory).join(", "),
        id: "regulatory",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatFieldValue(row.original.regulatory)}
          </Typography>
        ),
      },
      {
        header: "Tipo",
        accessorFn: (row) => normalizeArrayValue(row.type).join(", "),
        id: "type",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatFieldValue(row.original.type)}
          </Typography>
        ),
      },
      {
        header: "Responsavel",
        accessorKey: "responsible",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {row.original.responsible || "-"}
          </Typography>
        ),
      },
      {
        header: "Status de Revisao",
        accessorFn: (row) => getRevisionStatusLabel(row.revisionStatus),
        id: "revisionStatus",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {getRevisionStatusLabel(row.original.revisionStatus)}
          </Typography>
        ),
      },
      {
        header: "Empresas",
        accessorFn: (row) => normalizeArrayValue(row.companies).join(", "),
        id: "companies",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatFieldValue(row.original.companies)}
          </Typography>
        ),
      },
      {
        header: "Departamentos",
        accessorFn: (row) => normalizeArrayValue(row.departments).join(", "),
        id: "departments",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatFieldValue(row.original.departments)}
          </Typography>
        ),
      },
      {
        header: "Data de Criacao",
        accessorFn: (row) => row.date || "",
        id: "date",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "13px" }}>
            {formatDateValue(row.original.date)}
          </Typography>
        ),
      },
      {
        header: " ",
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <ActionCell row={row} refreshData={refreshNormatives} />
        ),
      },
    ],
    [theme],
  );

  return isInitialLoad && isLoading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <Box>
      <ReactTable
        data={lists}
        columns={columns}
        isLoading={isLoading}
        onExportExcel={handleExportExcel}
      />
    </Box>
  );
};

export default ListagemNormativos;
