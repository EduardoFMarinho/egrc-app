import * as React from "react";
import {
  Button,
  Box,
  TextField,
  Autocomplete,
  Grid,
  Stack,
  Checkbox,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import DrawerDepartamento from "../configuracoes/novoDepartamentoDrawerIncidentes";
import DrawerProcesso from "../configuracoes/novoProcessoDrawerIncidentes";
import DrawerRisco from "../configuracoes/novoRiscoDrawerIncidentes";
import { NumericFormat } from "react-number-format";

function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [valor, setValor] = useState("");
  const [valorRecuperado, setValorRecuperado] = useState("");
  const [tiposIncidentes, setTipoIncidentes] = useState([]);
  const [riscos, setRiscoAssociados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [riscosFiltrados, setRiscosFiltrados] = useState([]);
  const [departamentosFiltrados, setDepartamentosFiltrados] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [causaIncidente, setCausaIncidente] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [baseOrigem, setBaseOrigem] = useState("");
  const incidentLevels = [
    { id: 1, nome: "Primário" },
    { id: 2, nome: "Movimentação" },
  ];
  const [outrasInformacoes, setOutrasInformacoes] = useState("");
  const [status] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [incidenteDados, setIncidenteDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [openProcessDialog, setOpenProcessDialog] = useState(false);
  const [pendingProcessChange, setPendingProcessChange] = useState(null);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    diretriz: [],
    fator: [],
    controle: [],
    kri: [],
    incidentLevel: null,
    impacto: [],
    plano: [],
    causa: [],
    ameaca: [],
    normativa: [],
    incidente: [],
    departamento: [],
    tipoIncidente: "",
    processo: [],
    risco: [],
    conta: [],
    responsavel: "",
    dataIndice: null,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const transformedData = response.data.map((item) => ({
        id:
          item.idIncident ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.idRisk ||
          item.idCategory ||
          item.idIncident ||
          item.idFramework ||
          item.idTreatment ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idNormative ||
          item.idDepartment ||
          item.idKri ||
          item.idControl ||
          item.idThreat ||
          item.idIncidentType,
        nome: item.name,
        ...item,
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const extractRelationIds = (items = [], keys = []) => {
    if (!Array.isArray(items)) return [];

    return items
      .map((item) => {
        if (!item) return null;
        if (typeof item !== "object") return item;

        for (const key of keys) {
          if (item[key]) {
            return item[key];
          }
        }

        return item.id || null;
      })
      .filter(Boolean);
  };

  const isOrphan = (item, keys) => {
    let hasField = false;

    for (const key of keys) {
      if (item[key] !== undefined) {
        hasField = true;

        if (Array.isArray(item[key]) && item[key].length > 0) {
          return false;
        }
      }
    }

    return hasField;
  };

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}incidents/types`,
      setTipoIncidentes,
    );
    fetchData(`${process.env.REACT_APP_API_URL}departments`, setDepartamentos);
    fetchData(`${process.env.REACT_APP_API_URL}risks`, setRiscoAssociados);
    fetchData(`${process.env.REACT_APP_API_URL}processes`, setProcessos);
    window.scrollTo(0, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dadosApi) {
      setLoading(true);
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}incidents/${dadosApi.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados de empresas");
          }

          const data = await response.json();
          setRequisicao("Editar");
          setMensagemFeedback("editado");
          setNome(data.name);
          setCodigo(data.code);
          setDescricao(data.description);
          setValor(data.value);
          setValorRecuperado(data.recoveredValue);
          setCausaIncidente(data.cause);
          setOutrasInformacoes(data.information);
          setBaseOrigem(data.origin);
          setFormData((prev) => ({
            ...prev,
            incidentLevel: data.incidentLevel ?? null,
            causa: Array.isArray(data.causes)
              ? data.causes.map((u) => u.idCause)
              : [],
            departamento: Array.isArray(data.idDepartments)
              ? data.idDepartments
              : [],
            fator: Array.isArray(data.factors)
              ? data.factors.map((u) => u.idFactor)
              : [],
            impacto: Array.isArray(data.impacts)
              ? data.impacts.map((u) => u.idImpact)
              : [],
            incidente: Array.isArray(data.incidents)
              ? data.incidents.map((u) => u.idIncident)
              : [],
            kri: Array.isArray(data.krises)
              ? data.krises.map((u) => u.idKri)
              : [],
            normativa: Array.isArray(data.normatives)
              ? data.normatives.map((u) => u.idNormative)
              : [],
            diretriz: Array.isArray(data.strategicGuidelines)
              ? data.strategicGuidelines.map((u) => u.idStrategicGuideline)
              : [],
            tipoIncidente: data.idIncidentType || null,
            controle: data.idControls || null,
            framework: data.idFramework || null,
            processo: Array.isArray(data.idProcesses) ? data.idProcesses : [],
            responsavel: data.idResponsible || null,
            risco: Array.isArray(data.idRisks) ? data.idRisks : [],
            ameaca: data.idThreats || null,
            tratamento: data.idTreatment || null,
          }));

          setFormData((prev) => ({
            ...prev,
            dataIndice: data.date ? new Date(data.date) : null,
          }));

          setIncidenteDados(data);
        } catch (err) {
          setLoading(false);
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          setLoading(false);
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.id) {
        fetchEmpresaDados();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dadosApi]);

  useEffect(() => {
    const atualizarDependentesPorProcesso = async () => {
      const processosSelecionados = Array.isArray(formData.processo)
        ? formData.processo
        : [];

      if (processosSelecionados.length === 0) {
        setRiscosFiltrados(riscos);
        setDepartamentosFiltrados(departamentos);
        return;
      }

      try {
        const processResponses = await Promise.all(
          processosSelecionados.map((id) =>
            axios.get(`${process.env.REACT_APP_API_URL}processes/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ),
        );

        const idsRiscoPermitidos = new Set();
        const idsDepartamentoPermitidos = new Set();

        processResponses.forEach((response) => {
          extractRelationIds(
            response.data.risks || response.data.idRisks || [],
            ["idRisk"],
          ).forEach((idRisco) => idsRiscoPermitidos.add(idRisco));

          extractRelationIds(
            response.data.departments || response.data.idDepartments || [],
            ["idDepartment"],
          ).forEach((idDepartamento) =>
            idsDepartamentoPermitidos.add(idDepartamento),
          );
        });

        const isLinkedLocally = (item) => {
          const idsProcessosRelacionados = extractRelationIds(
            item.idProcesses || item.processes || [],
            ["idProcess"],
          );

          return idsProcessosRelacionados.some((id) =>
            processosSelecionados.includes(id),
          );
        };

        setRiscosFiltrados(
          riscos.filter(
            (risco) =>
              idsRiscoPermitidos.has(risco.id) ||
              isOrphan(risco, ["processes", "idProcesses"]) ||
              isLinkedLocally(risco),
          ),
        );

        setDepartamentosFiltrados(
          departamentos.filter(
            (departamento) =>
              idsDepartamentoPermitidos.has(departamento.id) ||
              isOrphan(departamento, ["processes", "idProcesses"]) ||
              isLinkedLocally(departamento),
          ),
        );
      } catch (error) {
        console.error("Erro ao filtrar riscos e departamentos do incidente:", error);
        setRiscosFiltrados(riscos);
        setDepartamentosFiltrados(departamentos);
      }
    };

    if (riscos.length > 0 || departamentos.length > 0) {
      atualizarDependentesPorProcesso();
    }
  }, [formData.processo, riscos, departamentos, token]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "tipoIncidente") {
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleDepartmentCreated = (newDepartamento) => {
    const departamentoNormalizado = {
      ...newDepartamento,
      idProcesses: newDepartamento.idProcesses || [],
    };

    setDepartamentos((prevDepartamentos) => [
      ...prevDepartamentos,
      departamentoNormalizado,
    ]);
    setFormData((prev) => ({
      ...prev,
      departamento: [...prev.departamento, newDepartamento.id],
    }));
  };

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]);
    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id],
    }));
  };

  const handleRiskCreated = (newRisco) => {
    const riscoNormalizado = {
      ...newRisco,
      idProcesses: newRisco.idProcesses || [],
    };

    setRiscoAssociados((prevRiscos) => [...prevRiscos, riscoNormalizado]);
    setFormData((prev) => ({
      ...prev,
      risco: [...prev.risco, newRisco.id],
    }));
  };

  const handleSelectAll = (event, newValue) => {
    const lastItem = newValue.length > 0 ? newValue[newValue.length - 1] : null;

    if (lastItem && lastItem.id === "all_vinculadas") {
      const vinculadasIds = riscosFiltrados.map((risco) => risco.id);
      const allVinculadasSelected =
        vinculadasIds.length > 0 &&
        vinculadasIds.every((id) => formData.risco.includes(id));

      if (allVinculadasSelected) {
        setFormData({
          ...formData,
          risco: formData.risco.filter((id) => !vinculadasIds.includes(id)),
        });
      } else {
        const newSelection = new Set([...formData.risco, ...vinculadasIds]);
        setFormData({ ...formData, risco: Array.from(newSelection) });
      }
    } else if (lastItem && lastItem.id === "all_outras") {
      const vinculadasIds = new Set(riscosFiltrados.map((risco) => risco.id));
      const outrasIds = riscos
        .map((risco) => risco.id)
        .filter((id) => !vinculadasIds.has(id));
      const allOutrasSelected =
        outrasIds.length > 0 &&
        outrasIds.every((id) => formData.risco.includes(id));

      if (allOutrasSelected) {
        setFormData({
          ...formData,
          risco: formData.risco.filter((id) => !outrasIds.includes(id)),
        });
      } else {
        const newSelection = new Set([...formData.risco, ...outrasIds]);
        setFormData({ ...formData, risco: Array.from(newSelection) });
      }
    } else if (lastItem && lastItem.id === "all") {
      if (formData.risco.length === riscos.length) {
        setFormData({ ...formData, risco: [] });
      } else {
        setFormData({ ...formData, risco: riscos.map((risco) => risco.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "risco",
        newValue
          .filter(
            (item) => item.id !== "all_vinculadas" && item.id !== "all_outras" && item.id !== "all",
          )
          .map((item) => item.id),
      );
    }
  };

  const handleSelectAllDepartamentos = (event, newValue) => {
    const lastItem = newValue.length > 0 ? newValue[newValue.length - 1] : null;

    if (lastItem && lastItem.id === "all_vinculadas") {
      const vinculadasIds = departamentosFiltrados.map(
        (departamento) => departamento.id,
      );
      const allVinculadasSelected =
        vinculadasIds.length > 0 &&
        vinculadasIds.every((id) => formData.departamento.includes(id));

      if (allVinculadasSelected) {
        setFormData({
          ...formData,
          departamento: formData.departamento.filter(
            (id) => !vinculadasIds.includes(id),
          ),
        });
      } else {
        const newSelection = new Set([
          ...formData.departamento,
          ...vinculadasIds,
        ]);
        setFormData({ ...formData, departamento: Array.from(newSelection) });
      }
    } else if (lastItem && lastItem.id === "all_outras") {
      const vinculadasIds = new Set(
        departamentosFiltrados.map((departamento) => departamento.id),
      );
      const outrasIds = departamentos
        .map((departamento) => departamento.id)
        .filter((id) => !vinculadasIds.has(id));
      const allOutrasSelected =
        outrasIds.length > 0 &&
        outrasIds.every((id) => formData.departamento.includes(id));

      if (allOutrasSelected) {
        setFormData({
          ...formData,
          departamento: formData.departamento.filter(
            (id) => !outrasIds.includes(id),
          ),
        });
      } else {
        const newSelection = new Set([
          ...formData.departamento,
          ...outrasIds,
        ]);
        setFormData({ ...formData, departamento: Array.from(newSelection) });
      }
    } else if (lastItem && lastItem.id === "all") {
      if (formData.departamento.length === departamentos.length) {
        setFormData({ ...formData, departamento: [] });
      } else {
        setFormData({
          ...formData,
          departamento: departamentos.map((departamento) => departamento.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "departamento",
        newValue
          .filter(
            (item) => item.id !== "all_vinculadas" && item.id !== "all_outras" && item.id !== "all",
          )
          .map((item) => item.id),
      );
    }
  };

  const handleSelectAll2 = (event, newValue) => {
    const novosIds =
      newValue.length > 0 && newValue[newValue.length - 1].id === "all"
        ? formData.processo.length === processos.length
          ? []
          : processos.map((processo) => processo.id)
        : newValue.map((item) => item.id);

    const processosAtuais = Array.isArray(formData.processo)
      ? formData.processo
      : [];
    const houveRemocao = processosAtuais.some((id) => !novosIds.includes(id));
    const possuiDependentesSelecionados =
      (Array.isArray(formData.risco) && formData.risco.length > 0) ||
      (Array.isArray(formData.departamento) && formData.departamento.length > 0);

    if (houveRemocao && possuiDependentesSelecionados) {
      setPendingProcessChange(novosIds);
      setOpenProcessDialog(true);
      return;
    }

    tratarMudancaInputGeral("processo", novosIds);
  };

  const trocarProcessoLimpar = () => {
    setFormData((prev) => ({
      ...prev,
      processo: pendingProcessChange || [],
      risco: [],
      departamento: [],
    }));
    setPendingProcessChange(null);
    setOpenProcessDialog(false);
  };

  const trocarProcessoManter = () => {
    setFormData((prev) => ({
      ...prev,
      processo: pendingProcessChange || [],
    }));
    setPendingProcessChange(null);
    setOpenProcessDialog(false);
  };

  const fecharDialogoProcesso = () => {
    setPendingProcessChange(null);
    setOpenProcessDialog(false);
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
  };

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
  };

  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    voltarParaCadastroMenu();
  };

  const [formValidation, setFormValidation] = useState({
    empresaInferior: true,
    nome: true,
    dataIndice: true,
    tiposIncidentes: true,
  });

  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (!formData.dataIndice) {
      setFormValidation((prev) => ({ ...prev, dataIndice: false }));
      missingFields.push("Data");
    }
    if (!formData.tipoIncidente) {
      setFormValidation((prev) => ({ ...prev, tipoIncidente: false }));
      missingFields.push("Tipo do Incidente");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
      });
      return;
    }

    if (requisicao === "Criar") {
      url = `${process.env.REACT_APP_API_URL}incidents`;
      method = "POST";
      payload = {
        code: codigo,
        name: nome,
        date: formData.dataIndice ? formData.dataIndice.toISOString() : null,
        idIncidentType:
          formData.tipoIncidente && formData.tipoIncidente !== ""
            ? formData.tipoIncidente
            : null,
      };
    } else if (requisicao === "Editar") {
      url = `${process.env.REACT_APP_API_URL}incidents`;
      method = "PUT";
      payload = {
        idIncident: incidenteDados?.idIncident,
        code: codigo,
        name: nome,
        description: descricao,
        date: formData.dataIndice ? formData.dataIndice.toISOString() : null,
        active: status,
        value: valor,
        incidentLevel: formData.incidentLevel ?? null,
        recoveredValue: valorRecuperado,
        cause: causaIncidente,
        information: outrasInformacoes,
        origin: baseOrigem,
        idIncidentType:
          formData.tipoIncidente && formData.tipoIncidente !== ""
            ? formData.tipoIncidente
            : null,
        idDepartments: formData.departamento?.length
          ? formData.departamento
          : null,
        idProcesses: formData.processo?.length ? formData.processo : null,
        idRisks: formData.risco?.length ? formData.risco : null,
      };
    }

    try {
      setLoading(true);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      } else {
        enqueueSnackbar(`Incidente ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idIncident) {
        setIncidenteDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse incidente.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Código *</InputLabel>
              <TextField
                onChange={(event) => setCodigo(event.target.value)}
                fullWidth
                value={codigo}
                error={!codigo && formValidation.codigo === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                onChange={(event) => setNome(event.target.value)}
                fullWidth
                value={nome}
                error={!nome && formValidation.nome === false}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Data *</InputLabel>
              <DatePicker
                value={formData.dataIndice || null}
                onChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    dataIndice: newValue,
                  }));
                }}
                slotProps={{
                  textField: {
                    placeholder: "00/00/0000",
                  },
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Tipo do Incidente *</InputLabel>
              <Autocomplete
                options={tiposIncidentes}
                getOptionLabel={(option) => option.nome}
                value={
                  tiposIncidentes.find(
                    (tipoIncidente) =>
                      tipoIncidente.id === formData.tipoIncidente,
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    tipoIncidente: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.tipoIncidente &&
                      formValidation.tipoIncidente === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
            <>
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Valor</InputLabel>
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    value={
                      valor !== "" && !isNaN(Number(valor))
                        ? Number(valor).toFixed(2).replace(".", ",")
                        : ""
                    }
                    onValueChange={(values) => {
                      setValor(values.value);
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    allowNegative={true}
                    inputProps={{ inputMode: "decimal" }}
                  />
                </Stack>
              </Grid>

              {}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Valor Recuperado</InputLabel>
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    value={
                      valorRecuperado !== "" && !isNaN(Number(valorRecuperado))
                        ? Number(valorRecuperado).toFixed(2).replace(".", ",")
                        : ""
                    }
                    onValueChange={(values) => {
                      setValorRecuperado(values.value);
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    allowNegative={true}
                    inputProps={{ inputMode: "decimal" }}
                  />
                </Stack>
              </Grid>
              {}

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição</InputLabel>
                  <TextField
                    onChange={(event) => setDescricao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Causa do Incidente</InputLabel>
                  <TextField
                    onChange={(event) => setCausaIncidente(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={causaIncidente}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Nível do incidente</InputLabel>
                  <Autocomplete
                    options={incidentLevels}
                    getOptionLabel={(option) => option.nome}
                    value={
                      incidentLevels.find(
                        (lvl) => lvl.id === formData.incidentLevel,
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        incidentLevel: newValue ? newValue.id : null,
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Processos{" "}
                    <DrawerProcesso
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onProcessCreated={handleProcessCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={
                      processos.length > 0
                        ? [
                            { id: "all", nome: "Selecionar todas" },
                            ...processos,
                          ]
                        : []
                    }
                    getOptionLabel={(option) => option.nome}
                    value={formData.processo.map(
                      (id) =>
                        processos.find((processo) => processo.id === id) || id,
                    )}
                    onChange={handleSelectAll2}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all" ? allSelected2 : selected
                              }
                            />
                          </Grid>
                          <Grid item xs>
                            {option.nome}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.processo.length === 0 ||
                            formData.processo.every((val) => val === 0)) &&
                          formValidation.processo === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ display: "flex", alignItems: "center" }}>
                    Riscos{" "}
                    <Tooltip
                      title="O preenchimento deste campo e seu cadastro rápido são vinculados aos processos selecionados."
                      arrow
                    >
                      <InfoOutlinedIcon
                        sx={{ fontSize: 16, ml: 0.5, color: "text.secondary" }}
                      />
                    </Tooltip>
                    <DrawerRisco
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      processosSelecionados={processos.filter((processo) =>
                        formData.processo.includes(processo.id),
                      )}
                      onRiscoCreated={handleRiskCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    noOptionsText="Nenhum risco encontrado"
                    multiple
                    disableCloseOnSelect
                    options={
                      riscos.length > 0
                        ? formData.processo.length > 0
                          ? [
                              ...(riscosFiltrados.length > 0
                                ? [
                                    {
                                      id: "all_vinculadas",
                                      nome: "Selecionar todos vinculados",
                                    },
                                  ]
                                : []),
                              {
                                id: "all_outras",
                                nome: "Selecionar todos sem vinculação",
                              },
                              ...riscos,
                            ].sort((a, b) => {
                              const isAVinculada =
                                a.id === "all_vinculadas" ||
                                riscosFiltrados.some((risco) => risco.id === a.id);
                              const isBVinculada =
                                b.id === "all_vinculadas" ||
                                riscosFiltrados.some((risco) => risco.id === b.id);

                              if (isAVinculada && !isBVinculada) return -1;
                              if (!isAVinculada && isBVinculada) return 1;
                              if (a.id === "all_vinculadas") return -1;
                              if (b.id === "all_vinculadas") return 1;
                              if (a.id === "all_outras") return -1;
                              if (b.id === "all_outras") return 1;

                              return 0;
                            })
                          : [{ id: "all", nome: "Selecionar todos" }, ...riscos]
                        : []
                    }
                    groupBy={
                      formData.processo.length > 0
                        ? (option) => {
                            const isVinculada =
                              option.id === "all_vinculadas" ||
                              riscosFiltrados.some(
                                (risco) => risco.id === option.id,
                              );

                            return isVinculada
                              ? "Vinculados aos Processos Selecionados"
                              : "Outros Riscos (Sem Vinculação)";
                          }
                        : undefined
                    }
                    getOptionLabel={(option) => option.nome}
                    value={formData.risco.map(
                      (id) => riscos.find((risco) => risco.id === id) || id,
                    )}
                    onChange={handleSelectAll}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => {
                      let isChecked = selected;

                      if (option.id === "all_vinculadas") {
                        const vinculadasIds = riscosFiltrados.map(
                          (risco) => risco.id,
                        );
                        isChecked =
                          vinculadasIds.length > 0 &&
                          vinculadasIds.every((id) =>
                            formData.risco.includes(id),
                          );
                      } else if (option.id === "all_outras") {
                        const vinculadasIds = new Set(
                          riscosFiltrados.map((risco) => risco.id),
                        );
                        const outrasIds = riscos
                          .map((risco) => risco.id)
                          .filter((id) => !vinculadasIds.has(id));
                        isChecked =
                          outrasIds.length > 0 &&
                          outrasIds.every((id) => formData.risco.includes(id));
                      } else if (option.id === "all") {
                        isChecked =
                          riscos.length > 0 &&
                          riscos.every((risco) =>
                            formData.risco.includes(risco.id),
                          );
                      }

                      return (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item>
                              <Checkbox checked={isChecked} />
                            </Grid>
                            <Grid item xs>
                              {option.nome}
                            </Grid>
                          </Grid>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.risco.length === 0 ||
                            formData.risco.every((val) => val === 0)) &&
                          formValidation.risco === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel sx={{ display: "flex", alignItems: "center" }}>
                    Departamentos afetados{" "}
                    <Tooltip
                      title="O preenchimento deste campo e seu cadastro rápido são vinculados aos processos selecionados."
                      arrow
                    >
                      <InfoOutlinedIcon
                        sx={{ fontSize: 16, ml: 0.5, color: "text.secondary" }}
                      />
                    </Tooltip>
                    <DrawerDepartamento
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      processosSelecionados={processos.filter((processo) =>
                        formData.processo.includes(processo.id),
                      )}
                      onDepartmentCreated={handleDepartmentCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    noOptionsText="Nenhum departamento encontrado"
                    multiple
                    disableCloseOnSelect
                    options={
                      departamentos.length > 0
                        ? formData.processo.length > 0
                          ? [
                              ...(departamentosFiltrados.length > 0
                                ? [
                                    {
                                      id: "all_vinculadas",
                                      nome: "Selecionar todos vinculados",
                                    },
                                  ]
                                : []),
                              {
                                id: "all_outras",
                                nome: "Selecionar todos sem vinculação",
                              },
                              ...departamentos,
                            ].sort((a, b) => {
                              const isAVinculado =
                                a.id === "all_vinculadas" ||
                                departamentosFiltrados.some(
                                  (departamento) => departamento.id === a.id,
                                );
                              const isBVinculado =
                                b.id === "all_vinculadas" ||
                                departamentosFiltrados.some(
                                  (departamento) => departamento.id === b.id,
                                );

                              if (isAVinculado && !isBVinculado) return -1;
                              if (!isAVinculado && isBVinculado) return 1;
                              if (a.id === "all_vinculadas") return -1;
                              if (b.id === "all_vinculadas") return 1;
                              if (a.id === "all_outras") return -1;
                              if (b.id === "all_outras") return 1;

                              return 0;
                            })
                          : [
                              { id: "all", nome: "Selecionar todos" },
                              ...departamentos,
                            ]
                        : []
                    }
                    groupBy={
                      formData.processo.length > 0
                        ? (option) => {
                            const isVinculado =
                              option.id === "all_vinculadas" ||
                              departamentosFiltrados.some(
                                (departamento) =>
                                  departamento.id === option.id,
                              );

                            return isVinculado
                              ? "Vinculados aos Processos Selecionados"
                              : "Outros Departamentos (Sem Vinculação)";
                          }
                        : undefined
                    }
                    getOptionLabel={(option) => option.nome}
                    value={formData.departamento.map(
                      (id) =>
                        departamentos.find(
                          (departamento) => departamento.id === id,
                        ) || id,
                    )}
                    onChange={handleSelectAllDepartamentos}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => {
                      let isChecked = selected;

                      if (option.id === "all_vinculadas") {
                        const vinculadasIds = departamentosFiltrados.map(
                          (departamento) => departamento.id,
                        );
                        isChecked =
                          vinculadasIds.length > 0 &&
                          vinculadasIds.every((id) =>
                            formData.departamento.includes(id),
                          );
                      } else if (option.id === "all_outras") {
                        const vinculadasIds = new Set(
                          departamentosFiltrados.map(
                            (departamento) => departamento.id,
                          ),
                        );
                        const outrasIds = departamentos
                          .map((departamento) => departamento.id)
                          .filter((id) => !vinculadasIds.has(id));
                        isChecked =
                          outrasIds.length > 0 &&
                          outrasIds.every((id) =>
                            formData.departamento.includes(id),
                          );
                      } else if (option.id === "all") {
                        isChecked =
                          departamentos.length > 0 &&
                          departamentos.every((departamento) =>
                            formData.departamento.includes(departamento.id),
                          );
                      }

                      return (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item>
                              <Checkbox checked={isChecked} />
                            </Grid>
                            <Grid item xs>
                              {option.nome}
                            </Grid>
                          </Grid>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.departamento.length === 0 ||
                            formData.departamento.every((val) => val === 0)) &&
                          formValidation.departamento === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Base de origem</InputLabel>
                  <TextField
                    onChange={(event) => setBaseOrigem(event.target.value)}
                    fullWidth
                    value={baseOrigem}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Outras informações</InputLabel>
                  <TextField
                    onChange={(event) =>
                      setOutrasInformacoes(event.target.value)
                    }
                    fullWidth
                    multiline
                    rows={4}
                    value={outrasInformacoes}
                  />
                </Stack>
              </Grid>
            </>
          )}

          {}
          <Grid item xs={12} mt={-1}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "8px",
                marginRight: "20px",
                marginTop: 5,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                style={{
                  width: "91px",
                  height: "32px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
                onClick={tratarSubmit}
              >
                Atualizar
              </Button>
            </Box>
          </Grid>
          <Dialog
            open={successDialogOpen}
            onClose={voltarParaListagem}
            sx={{
              "& .MuiDialog-paper": {
                padding: "24px",
                borderRadius: "12px",
                width: "400px",
                textAlign: "center",
              },
            }}
          >
            {}
            <Box display="flex" justifyContent="center" mt={2}>
              <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#28a745" }} />
            </Box>

            {}
            <DialogTitle
              sx={{ fontWeight: 600, fontSize: "20px", color: "#333" }}
            >
              Incidente Criado com Sucesso!
            </DialogTitle>

            {}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O incidente foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse incidente.
              </DialogContentText>
            </DialogContent>

            {}
            <DialogActions
              sx={{ display: "flex", justifyContent: "center", gap: 2, pb: 2 }}
            >
              <Button
                onClick={voltarParaListagem}
                variant="outlined"
                sx={{
                  borderColor: "#007bff",
                  color: "#007bff",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "rgba(0, 123, 255, 0.1)",
                  },
                }}
              >
                Voltar para a listagem
              </Button>
              <Button
                onClick={continuarEdicao}
                variant="contained"
                sx={{
                  backgroundColor: "#007bff",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#0056b3",
                  },
                }}
                autoFocus
              >
                Adicionar mais informações
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={openProcessDialog}
            onClose={fecharDialogoProcesso}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle
              sx={{
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Alteração de Processos
              <Button
                onClick={fecharDialogoProcesso}
                sx={{
                  minWidth: "auto",
                  p: 0,
                  color: "text.primary",
                }}
              >
                ×
              </Button>
            </DialogTitle>
            <DialogContent dividers>
              <DialogContentText>
                Deseja manter os campos de riscos e departamentos selecionados?
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: "center", gap: 2 }}>
              <Button
                onClick={trocarProcessoLimpar}
                color="error"
                variant="outlined"
              >
                Limpar Campos
              </Button>
              <Button
                onClick={trocarProcessoManter}
                color="primary"
                variant="contained"
              >
                Manter Campos
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;
