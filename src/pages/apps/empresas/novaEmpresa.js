/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Autocomplete,
  Grid,
  Switch,
  Stack,
  Typography,
  Checkbox,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import FileUploader from "../configuracoes/FileUploader";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import DrawerProcesso from "../configuracoes/novoProcessoDrawerEmpresa";
import DrawerConta from "../configuracoes/novaContaDrawer";
import ListagemAcionistas from "../configuracoes/listaAcionistas";
import axios from "axios";
import InputMask from "react-input-mask";
import { useToken } from "../../../api/TokenContext";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  areAllVisibleOptionsSelected,
  buildActiveOptionsWithSelected,
  buildInactiveSelectionHelperText,
  dedupeOptionsById,
  findSelectedOption,
  findSelectedOptions,
  getOptionDisplayLabel,
  SELECT_ALL_AUTOCOMPLETE_ID,
  withSelectAllOption,
} from "../../../utils/activeAutocomplete";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [empresasInferiores, setEmprasasInferiores] = useState([]);
  const [empresasSuperiores, setEmpresasSuperiores] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [updateProcessos] = useState(false);
  const [contas, setContas] = useState([]);
  const [updateContas] = useState(false);
  const [nomeEmpresa, setNomeOrgao] = useState("");
  const [responsaveis, setResponsavel] = useState([]);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [cnpjEmpresa, setCnpjParte] = useState("");
  const [empresaDados, setEmpresaDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [cnpjError, setCnpjError] = useState(false);
  const [cnpjTouched, setCnpjTouched] = useState(false);

  // Novos estados para os campos adicionados
  const [linhasNegocio, setLinhasNegocio] = useState([]);
  const [orgaosReguladores, setOrgaosReguladores] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [naturezasJuridicas, setNaturezasJuridicas] = useState([]);
  const [regimesTributacao, setRegimesTributacao] = useState([]);

  // --- Processo é o filtro pai de Conta ---
  const [contasFiltradas, setContasFiltradas] = useState([]);
  const [contaOrigemMap, setContaOrigemMap] = useState({});
  const [openProcessDialog, setOpenProcessDialog] = useState(false);
  const [pendingProcessChange, setPendingProcessChange] = useState([]);
  // ---------------------------------------

  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    files: [],
    empresaSuperior: "",
    processo: [],
    conta: [],
    responsavel: "",
    dataInicioOperacao: null,
    linhaNegocio: "",
    orgaoRegulador: [],
    classificacao: "",
    naturezaJuridica: "",
    regimeTributacao: "",
  });

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      const fetchEmpresaDados = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}companies/${dadosApi.idCompany}`,
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
          const empresaInferiorIds = Array.isArray(data.companyBottoms)
            ? [...new Set(data.companyBottoms.map((u) => u.idCompanyBottom).filter(Boolean))]
            : [];
          setRequisicao("Editar");
          setMensagemFeedback("editada");
          setNomeOrgao(data.name);
          setStatus(data.active);
          setCnpjParte(data.document);
          localStorage.setItem("idCompany", dadosApi.idCompany);

          // Atualiza os demais campos, incluindo os arquivos já cadastrados (se houver)
          setFormData((prev) => {
            const idProcs = data.idProcesses || [];
            const idContas = data.idLedgerAccounts || [];

            return {
              ...prev,
              empresaInferior: empresaInferiorIds,
              empresaSuperior: data.idCompanySuperior || null,
              responsavel: data.idResponsible || null,
              processo: idProcs,
              conta: idContas,
              files: data.files || [],
              dataInicioOperacao: data.startDate
                ? new Date(data.startDate)
                : null,
              linhaNegocio: data.idBusinessLine || "",
              orgaoRegulador: data.idRegulatories || [],
              classificacao: data.idClassification || "",
              naturezaJuridica: data.idLegalNature || "",
              regimeTributacao: data.idTaxRegime || "",
            };
          });

          setEmpresaDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
        } finally {
          setLoading(false);
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idCompany) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi, token]);

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}companies`,
      setEmprasasInferiores,
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies`,
      setEmpresasSuperiores,
    );

    fetchData(
      `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
      setResponsavel,
    );

    // Buscar dados dos novos campos
    fetchData(
      `${process.env.REACT_APP_API_URL}companies/business-lines`,
      setLinhasNegocio,
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies/regulatories`,
      setOrgaosReguladores,
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}controls/classifications/2`,
      setClassificacoes,
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies/legal-nature`,
      setNaturezasJuridicas,
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}companies/tax-regime`,
      setRegimesTributacao,
    );

    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}processes`, setProcessos);
  }, [updateProcessos]);

  useEffect(() => {
    fetchData(`${process.env.REACT_APP_API_URL}ledger-accounts`, setContas);
  }, [updateContas]);

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]); // Adiciona o novo processo à lista
    setFormData((prev) => ({
      ...prev,
      processo: [...prev.processo, newProcesso.id], // Seleciona o novo processo automaticamente
    }));
  };

  const handleAccountCreated = (newConta) => {
    const contaNormalizada = {
      ...newConta,
      idProcesses: newConta.idProcesses || [],
    };

    setContas((prevConta) => [...prevConta, contaNormalizada]);
    setFormData((prev) => ({
      ...prev,
      conta: [...prev.conta, newConta.id],
    }));
  };

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idCompany, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id:
          item.idCompany ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idCollaborator ||
          item.idBusinessLine ||
          item.idRegulatory ||
          item.idClassification ||
          item.idLegalNature ||
          item.idTaxRegime ||
          item.id,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(dedupeOptionsById(transformedData));
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
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

  // Função para validar o CNPJ
  const validarCnpj = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, ""); // Remove caracteres não numéricos

    if (cnpj.length !== 14) return false;

    // Elimina CNPJs inválidos conhecidos
    if (
      cnpj === "00000000000000" ||
      cnpj === "11111111111111" ||
      cnpj === "22222222222222" ||
      cnpj === "33333333333333" ||
      cnpj === "44444444444444" ||
      cnpj === "55555555555555" ||
      cnpj === "66666666666666" ||
      cnpj === "77777777777777" ||
      cnpj === "88888888888888" ||
      cnpj === "99999999999999"
    ) {
      return false;
    }

    // Validação dos dígitos verificadores
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho++;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  };

  // Função utilitária para normalizar o nome removendo espaços e convertendo para minúsculo
  const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();

  useEffect(() => {
    const nomeDigitado = formatarNome(nomeEmpresa);

    // Verifica se a empresa superior selecionada conflita com o nome digitado (ignorando espaços)
    const superiorSelecionada = empresasSuperiores.find(
      (empresa) => empresa.id === formData.empresaSuperior,
    );
    if (
      superiorSelecionada &&
      formatarNome(superiorSelecionada.nome) === nomeDigitado
    ) {
      setFormData((prev) => ({
        ...prev,
        empresaSuperior: null,
      }));
    }

    // Atualiza a lista de empresas inferiores removendo aquelas cujo nome conflita
    const inferioresAtualizadas = [...new Set(formData.empresaInferior)].filter((id) => {
      const empresaInferior = empresasInferiores.find(
        (empresa) => empresa.id === id,
      );
      if (!empresaInferior) return true;
      return formatarNome(empresaInferior.nome) !== nomeDigitado;
    });
    if (inferioresAtualizadas.length !== formData.empresaInferior.length) {
      setFormData((prev) => ({
        ...prev,
        empresaInferior: inferioresAtualizadas,
      }));
    }
  }, [
    nomeEmpresa,
    empresasSuperiores,
    empresasInferiores,
    formData.empresaSuperior,
    formData.empresaInferior,
  ]);

  const handleCnpjChange = (event) => {
    const value = event.target.value;
    setCnpjParte(value);

    // Valida o CNPJ somente quando o comprimento está completo
    if (value.length === 18) {
      setCnpjError(!validarCnpj(value));
    } else {
      setCnpjError(false); // Remove o erro se o campo não estiver completo
    }
  };

  const handleCnpjBlur = () => {
    setCnpjTouched(true);

    // Revalida no blur se o campo estiver completo
    if (cnpjEmpresa.length === 18) {
      setCnpjError(!validarCnpj(cnpjEmpresa));
    }
  };

  const tratarMudancaInputGeral = (field, value) => {
    if (
      field === "empresaSuperior" ||
      field === "linhaNegocio" ||
      field === "classificacao" ||
      field === "naturezaJuridica" ||
      field === "regimeTributacao"
    ) {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  useEffect(() => {
    const atualizarContasPorProcesso = async () => {
      if (!formData.processo || formData.processo.length === 0) {
        // Sem processo selecionado, não existe vínculo de referência para agrupar.
        // Mantém todas as contas disponíveis, mas sem marcá-las como vinculadas.
        setContasFiltradas([]);
        setContaOrigemMap({});
        return;
      }

      try {
        const novoMapaConta = {};
        const idsContaPermitidos = new Set();
        const processosSelecionadosIds = new Set(formData.processo);

        const promises = formData.processo.map((id) =>
          axios.get(`${process.env.REACT_APP_API_URL}processes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        );

        const results = await Promise.all(promises);
        results.forEach((res) => {
          const nomeProc = res.data.name;
          const ledgerAccounts =
            res.data.ledgerAccounts || res.data.idLedgerAccounts || [];

          ledgerAccounts.forEach((ledger) => {
            const idConta =
              typeof ledger === "object"
                ? ledger.idLedgerAccount || ledger.id
                : ledger;

            if (idConta) {
              idsContaPermitidos.add(idConta);
              if (!novoMapaConta[idConta]) novoMapaConta[idConta] = [];
              if (!novoMapaConta[idConta].includes(nomeProc)) {
                novoMapaConta[idConta].push(nomeProc);
              }
            }
          });
        });

        const isLinkedLocally = (item) => {
          const hasInIdProcesses =
            Array.isArray(item.idProcesses) &&
            item.idProcesses.some((p) =>
              processosSelecionadosIds.has(
                typeof p === "object" ? p.idProcess || p.id : p,
              ),
            );

          const hasInProcesses =
            Array.isArray(item.processes) &&
            item.processes.some((p) =>
              processosSelecionadosIds.has(
                typeof p === "object" ? p.idProcess || p.id : p,
              ),
            );

          return hasInIdProcesses || hasInProcesses;
        };

        const novasContasFiltradas = contas.filter(
          (conta) =>
            idsContaPermitidos.has(conta.id) ||
            isOrphan(conta, ["processes", "idProcesses"]) ||
            isLinkedLocally(conta),
        );

        setContasFiltradas(novasContasFiltradas);
        setContaOrigemMap(novoMapaConta);
      } catch (error) {
        console.error("Erro ao buscar contas vinculadas ao processo:", error);
      }
    };

    if (contas.length > 0 || processos.length > 0) {
      atualizarContasPorProcesso();
    }
  }, [formData.processo, contas, processos, token]);

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      // Usa o mesmo filtro aplicado nas opções do Autocomplete
      const filteredInferiores = empresasInferiores.filter(
        (empresa) =>
          empresa.id !== formData.empresaSuperior &&
          formatarNome(empresa.nome) !== formatarNome(nomeEmpresa),
      );
      if (formData.empresaInferior.length === filteredInferiores.length) {
        // Deselect all
        setFormData({ ...formData, empresaInferior: [] });
      } else {
        // Select only the filtered options
        setFormData({
          ...formData,
          empresaInferior: filteredInferiores.map(
            (empresaInferior) => empresaInferior.id,
          ),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "empresaInferior",
        newValue.map((item) => item.id),
      );
    }
  };

  const handleSelectAll2 = (event, newValue) => {
    let novosIds = [];

    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.processo.length === processos.length) novosIds = [];
      else novosIds = processos.map((p) => p.id);
    } else {
      novosIds = newValue
        .filter((item) => item.id !== "all")
        .map((item) => item.id);
    }

    const houveMudanca =
      novosIds.length !== formData.processo.length ||
      novosIds.some((id) => !formData.processo.includes(id));

    if (houveMudanca && formData.conta.length > 0) {
      setPendingProcessChange(novosIds);
      setOpenProcessDialog(true);
      return;
    }

    tratarMudancaInputGeral("processo", novosIds);
  };

  const handleSelectAllConta = (event, newValue) => {
    const lastItem = newValue.length > 0 ? newValue[newValue.length - 1] : null;

    if (lastItem && lastItem.id === "all") {
      const allContasSelected =
        contas.length > 0 && contas.every((idConta) =>
          formData.conta.includes(idConta.id),
        );

      if (allContasSelected) {
        setFormData({ ...formData, conta: [] });
      } else {
        setFormData({ ...formData, conta: contas.map((conta) => conta.id) });
      }
    } else if (lastItem && lastItem.id === "all_vinculadas") {
      const vinculadasIds = contasFiltradas.map((c) => c.id);
      const allVinculadasSelected =
        vinculadasIds.length > 0 &&
        vinculadasIds.every((id) => formData.conta.includes(id));

      if (allVinculadasSelected) {
        setFormData({
          ...formData,
          conta: formData.conta.filter((id) => !vinculadasIds.includes(id)),
        });
      } else {
        const newSelection = new Set([...formData.conta, ...vinculadasIds]);
        setFormData({ ...formData, conta: Array.from(newSelection) });
      }
    } else if (lastItem && lastItem.id === "all_outras") {
      const vinculadasIds = new Set(contasFiltradas.map((c) => c.id));
      const outrasIds = contas
        .map((c) => c.id)
        .filter((id) => !vinculadasIds.has(id));
      const allOutrasSelected =
        outrasIds.length > 0 &&
        outrasIds.every((id) => formData.conta.includes(id));

      if (allOutrasSelected) {
        setFormData({
          ...formData,
          conta: formData.conta.filter((id) => !outrasIds.includes(id)),
        });
      } else {
        const newSelection = new Set([...formData.conta, ...outrasIds]);
        setFormData({ ...formData, conta: Array.from(newSelection) });
      }
    } else {
      tratarMudancaInputGeral(
        "conta",
        newValue
          .filter(
            (item) =>
              item.id !== "all" &&
              item.id !== "all_vinculadas" &&
              item.id !== "all_outras",
          )
          .map((item) => item.id),
      );
    }
  };

  const trocarProcessoLimpar = () => {
    setFormData((prev) => ({
      ...prev,
      processo: pendingProcessChange,
      conta: [],
    }));
    setOpenProcessDialog(false);
    setPendingProcessChange([]);
  };

  const trocarProcessoManter = () => {
    setFormData((prev) => ({
      ...prev,
      processo: pendingProcessChange,
    }));
    setOpenProcessDialog(false);
    setPendingProcessChange([]);
  };

  // Função para lidar com seleção múltipla de órgãos reguladores
  const handleSelectAllOrgaoRegulador = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.orgaoRegulador.length === orgaosReguladores.length) {
        // Deselect all
        setFormData({ ...formData, orgaoRegulador: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          orgaoRegulador: orgaosReguladores.map((orgao) => orgao.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "orgaoRegulador",
        newValue.map((item) => item.id),
      );
    }
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
    // navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Órgão' } });
  };

  const [formValidation, setFormValidation] = useState({
    empresaInferior: true,
    nomeEmpresa: true,
  });

  const empresaSuperiorSelecionada = findSelectedOption(
    empresasSuperiores,
    formData.empresaSuperior,
  );
  const empresasInferioresSelecionadas = findSelectedOptions(
    empresasInferiores,
    formData.empresaInferior,
  );
  const empresasSuperioresDisponiveis = buildActiveOptionsWithSelected(
    empresasSuperiores,
    formData.empresaSuperior,
    (empresa) =>
      !formData.empresaInferior.includes(empresa.id) &&
      formatarNome(empresa.nome) !== formatarNome(nomeEmpresa),
  );
  const empresasInferioresDisponiveis = buildActiveOptionsWithSelected(
    empresasInferiores,
    formData.empresaInferior,
    (empresa) =>
      empresa.id !== formData.empresaSuperior &&
      formatarNome(empresa.nome) !== formatarNome(nomeEmpresa),
  );
  const empresaSuperiorHelperText = buildInactiveSelectionHelperText(
    empresaSuperiorSelecionada ? [empresaSuperiorSelecionada] : [],
    {
      singular:
        "Empresa superior selecionada est\u00e1 inativa. Voc\u00ea pode mant\u00ea-la ou remov\u00ea-la.",
    },
  );
  const empresasInferioresHelperText = buildInactiveSelectionHelperText(
    empresasInferioresSelecionadas,
    {
      singular:
        "Empresa inferior selecionada est\u00e1 inativa. Voc\u00ea pode mant\u00ea-la ou remov\u00ea-la.",
      plural:
        "Algumas empresas inferiores selecionadas est\u00e3o inativas. Voc\u00ea pode mant\u00ea-las ou remov\u00ea-las.",
    },
  );
  const handleSelectAllEmpresasInferiores = (event, newValue) => {
    if (
      newValue.length > 0 &&
      newValue[newValue.length - 1].id === SELECT_ALL_AUTOCOMPLETE_ID
    ) {
      if (allSelected) {
        setFormData({ ...formData, empresaInferior: [] });
      } else {
        setFormData({
          ...formData,
          empresaInferior: empresasInferioresDisponiveis.map(
            (empresaInferior) => empresaInferior.id,
          ),
        });
      }
      return;
    }

    handleSelectAll(event, newValue);
  };
  const allSelected = areAllVisibleOptionsSelected(
    empresasInferioresDisponiveis,
    formData.empresaInferior,
  );
  const allSelectedOrgaoRegulador =
    formData.orgaoRegulador.length === orgaosReguladores.length &&
    orgaosReguladores.length > 0;

  const allSelected2 =
    formData.processo.length === processos.length && processos.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!nomeEmpresa.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeEmpresa: false }));
      missingFields.push("Empresa");
    }
    if (!cnpjEmpresa.trim() || cnpjError) {
      setCnpjError(true);
      setCnpjTouched(true);
      missingFields.push("CNPJ");
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

    try {
      setLoading(true);

      // Separe os arquivos novos dos já existentes:
      const newFiles = formData.files.filter((file) => file instanceof File);
      const existingFiles = formData.files.filter(
        (file) => !(file instanceof File),
      );

      // Realiza upload dos novos arquivos, se houver
      let uploadFilesResult = { files: [] };
      if (newFiles.length > 0) {
        const formDataUpload = new FormData();
        formDataUpload.append("ContainerFolder", 1); // 1 para empresa
        // Em edição, já temos o id da empresa; em criação, envia string vazia
        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? empresaDados?.idCompany : "",
        );
        newFiles.forEach((file) => {
          formDataUpload.append("Files", file, file.name);
        });

        const uploadResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}files/uploads`,
          formDataUpload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        uploadFilesResult = uploadResponse.data; // Supõe-se que seja um objeto do tipo { files: [...] }
      }

      // Combina os arquivos já existentes com os novos enviados (retornados pelo endpoint)
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];

      // Transforma cada item para que o payload contenha somente a URL (string)
      const finalFilesPayload = finalFiles.map((file) => {
        // Se for uma string já, retorna-a; se for objeto e tiver a propriedade "path", retorna o valor dela.
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      // Configuração da URL, método e payload conforme a operação
      if (requisicao === "Criar") {
        url = `${process.env.REACT_APP_API_URL}companies`;
        method = "POST";
        payload = {
          name: nomeEmpresa,
          document: cnpjEmpresa,
          files: finalFilesPayload,
          startDate: formData.dataInicioOperacao
            ? formData.dataInicioOperacao.toISOString()
            : null,
          active: status,
          idCompanySuperior:
            formData.empresaSuperior === "" ? null : formData.empresaSuperior,
          idResponsible:
            formData.responsavel === "" ? null : formData.responsavel,
          idCompanyBottoms: formData.empresaInferior,
          idProcess: formData.processo,
          idLedgerAccounts: formData.conta,
          // Novos campos
          idBusinessLine:
            formData.linhaNegocio === "" ? null : formData.linhaNegocio,
          idRegulatories: formData.orgaoRegulador,
          idClassification:
            formData.classificacao === "" ? null : formData.classificacao,
          idLegalNature:
            formData.naturezaJuridica === "" ? null : formData.naturezaJuridica,
          idTaxRegime:
            formData.regimeTributacao === "" ? null : formData.regimeTributacao,
        };
      } else if (requisicao === "Editar") {
        url = `${process.env.REACT_APP_API_URL}companies`;
        method = "PUT";
        payload = {
          idCompany: empresaDados?.idCompany,
          name: nomeEmpresa,
          document: cnpjEmpresa,
          startDate: formData.dataInicioOperacao
            ? formData.dataInicioOperacao.toISOString()
            : null,
          active: status,
          idCompanySuperior:
            formData.empresaSuperior === "" ? null : formData.empresaSuperior,
          idResponsible:
            formData.responsavel === "" ? null : formData.responsavel,
          idCompanyBottoms: formData.empresaInferior,
          idProcess: formData.processo,
          idLedgerAccounts: formData.conta,
          files: finalFilesPayload,
          // Novos campos
          idBusinessLine:
            formData.linhaNegocio === "" ? null : formData.linhaNegocio,
          idRegulatories: formData.orgaoRegulador,
          idClassification:
            formData.classificacao === "" ? null : formData.classificacao,
          idLegalNature:
            formData.naturezaJuridica === "" ? null : formData.naturezaJuridica,
          idTaxRegime:
            formData.regimeTributacao === "" ? null : formData.regimeTributacao,
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta não for ok, tenta extrair a mensagem de erro
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignora se não houver corpo na resposta
        }
        throw new Error(errorData.message || "Erro ao cadastrar a empresa.");
      }

      // Determina o id da empresa a partir da resposta
      let companyId;
      if (requisicao === "Editar" && response.status === 204) {
        companyId = empresaDados?.idCompany;
        enqueueSnackbar(`Empresa ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      } else {
        const data = await response.json();
        companyId = data.data.idCompany;
        localStorage.setItem("idCompany", companyId);
        enqueueSnackbar(`Empresa ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      // Se for criação, atualiza o estado e exibe o diálogo de sucesso;
      // Se for edição, volta para a listagem.
      if (requisicao === "Criar") {
        setEmpresaDados((prev) => ({ ...prev, idCompany: companyId }));
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("O CNPJ informado já foi cadastrado.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
  };

  // Função para voltar para a listagem
  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    voltarParaCadastroMenu();
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>
          {/* Nome e Status lado a lado */}
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Empresa *</InputLabel>
              <TextField
                onChange={(event) => setNomeOrgao(event.target.value)}
                fullWidth
                placeholder="Digite o nome da empresa"
                value={nomeEmpresa}
                error={!nomeEmpresa && formValidation.nomeEmpresa === false}
              />
            </Stack>
          </Grid>

          <Grid
            item
            xs={requisicao !== "Editar" ? 6 : 3}
            sx={{ paddingBottom: 5 }}
          >
            <Stack spacing={1}>
              <InputLabel>CNPJ *</InputLabel>
              <TextField
                fullWidth
                value={cnpjEmpresa}
                onChange={handleCnpjChange}
                onBlur={handleCnpjBlur}
                error={cnpjTouched && cnpjError}
                helperText={
                  cnpjTouched && cnpjError && cnpjEmpresa.length === 18
                    ? "CNPJ inválido"
                    : ""
                }
                InputProps={{
                  inputComponent: InputMask,
                  inputProps: {
                    mask: "99.999.999/9999-99",
                    maskPlaceholder: null,
                  },
                }}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
            <>
              <Grid item xs={3}>
                <Stack spacing={1}>
                  <InputLabel>Início da operação</InputLabel>
                  <DatePicker
                    value={formData.dataInicioOperacao || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        dataInicioOperacao: newValue,
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

              {/* Linha de Negócio */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Linha de Negócio</InputLabel>
                  <Autocomplete
                    options={linhasNegocio}
                    getOptionLabel={(option) => option.nome}
                    value={
                      linhasNegocio.find(
                        (linha) => linha.id === formData.linhaNegocio,
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      tratarMudancaInputGeral("linhaNegocio", newValue);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              {/* Órgão Regulador */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Órgão Regulador</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...orgaosReguladores,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.orgaoRegulador.map(
                      (id) =>
                        orgaosReguladores.find((orgao) => orgao.id === id) ||
                        id,
                    )}
                    onChange={handleSelectAllOrgaoRegulador}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all"
                                  ? allSelectedOrgaoRegulador
                                  : selected
                              }
                            />
                          </Grid>
                          <Grid item xs>
                            {option.nome}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              {/* Classificação */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Classificação</InputLabel>
                  <Autocomplete
                    options={classificacoes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      classificacoes.find(
                        (classificacao) =>
                          classificacao.id === formData.classificacao,
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      tratarMudancaInputGeral("classificacao", newValue);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              {/* Natureza Jurídica */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Natureza Jurídica</InputLabel>
                  <Autocomplete
                    options={naturezasJuridicas}
                    getOptionLabel={(option) => option.nome}
                    value={
                      naturezasJuridicas.find(
                        (natureza) => natureza.id === formData.naturezaJuridica,
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      tratarMudancaInputGeral("naturezaJuridica", newValue);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              {/* Regime de Tributação */}
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Regime de Tributação</InputLabel>
                  <Autocomplete
                    options={regimesTributacao}
                    getOptionLabel={(option) => option.nome}
                    value={
                      regimesTributacao.find(
                        (regime) => regime.id === formData.regimeTributacao,
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      tratarMudancaInputGeral("regimeTributacao", newValue);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Empresa superior</InputLabel>
                  <Autocomplete
                    options={empresasSuperioresDisponiveis}
                    getOptionLabel={(option) =>
                      getOptionDisplayLabel(option, "Inativa")
                    }
                    value={empresaSuperiorSelecionada}
                    onChange={(event, newValue) => {
                      setFormData((prev) => {
                        // Remove a empresa selecionada dos inferiores, caso exista
                        const inferiorAtualizado = prev.empresaInferior.filter(
                          (id) => (newValue ? id !== newValue.id : true),
                        );
                        return {
                          ...prev,
                          empresaSuperior: newValue ? newValue.id : "",
                          empresaInferior: inferiorAtualizado,
                        };
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.empresaSuperior &&
                          formValidation.empresaSuperior === false
                        }
                        helperText={empresaSuperiorHelperText}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Empresas Inferiores</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={withSelectAllOption(
                      empresasInferioresDisponiveis,
                      "Selecionar todas",
                    )}
                    getOptionLabel={(option) =>
                      option.id === SELECT_ALL_AUTOCOMPLETE_ID
                        ? option.nome
                        : getOptionDisplayLabel(option, "Inativa")
                    }
                    value={empresasInferioresSelecionadas}
                    onChange={handleSelectAllEmpresasInferiores}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const isInativa = option.active === false;

                        return (
                          <Chip
                            label={getOptionDisplayLabel(option, "Inativa")}
                            {...getTagProps({ index })}
                            color={isInativa ? "error" : "default"}
                            variant={isInativa ? "outlined" : "filled"}
                            sx={
                              isInativa
                                ? {
                                    borderColor: "error.main",
                                    color: "error.main",
                                  }
                                : {}
                            }
                          />
                        );
                      })
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === SELECT_ALL_AUTOCOMPLETE_ID
                                  ? allSelected
                                  : selected
                              }
                            />
                          </Grid>
                          <Grid item xs>
                            {option.id === SELECT_ALL_AUTOCOMPLETE_ID
                              ? option.nome
                              : getOptionDisplayLabel(option, "Inativa")}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.empresaInferior.length === 0 ||
                            formData.empresaInferior.every(
                              (val) => val === 0,
                            )) &&
                          formValidation.empresaInferior === false
                        }
                        helperText={empresasInferioresHelperText}
                      />
                    )}
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
                        ? [{ id: "all", nome: "Selecionar todas" }, ...processos]
                        : []
                    }
                    noOptionsText="Nenhum processo encontrado"
                    getOptionLabel={(option) => option.nome || ""}
                    value={formData.processo
                      .map((id) =>
                        processos.find((processo) => processo.id === id),
                      )
                      .filter(Boolean)}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={handleSelectAll2}
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

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel sx={{ display: "flex", alignItems: "center" }}>
                    Conta{" "}
                    <Tooltip
                      title="O preenchimento deste campo e seu cadastro rápido são vinculados ao(s) processo(s) selecionado(s)."
                      arrow
                    >
                      <InfoOutlinedIcon
                        sx={{ fontSize: 16, ml: 0.5, color: "text.secondary" }}
                      />
                    </Tooltip>
                    <DrawerConta
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      processosSelecionados={processos.filter((p) =>
                        formData.processo.includes(p.id),
                      )}
                      onAccountCreated={handleAccountCreated}
                    />{" "}
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={
                      contas.length > 0
                        ? formData.processo.length > 0
                          ? [
                              ...(contasFiltradas.length > 0
                                ? [
                                    {
                                      id: "all_vinculadas",
                                      nome: "Selecionar todas vinculadas",
                                    },
                                  ]
                                : []),
                              {
                                id: "all_outras",
                                nome: "Selecionar todas sem vinculação",
                              },
                              ...contas,
                            ].sort((a, b) => {
                              const isAVinculada =
                                a.id === "all_vinculadas" ||
                                contasFiltradas.some((c) => c.id === a.id);
                              const isBVinculada =
                                b.id === "all_vinculadas" ||
                                contasFiltradas.some((c) => c.id === b.id);

                              if (isAVinculada && !isBVinculada) return -1;
                              if (!isAVinculada && isBVinculada) return 1;

                              if (a.id === "all_vinculadas") return -1;
                              if (b.id === "all_vinculadas") return 1;
                              if (a.id === "all_outras") return -1;
                              if (b.id === "all_outras") return 1;

                              return 0;
                            })
                          : [{ id: "all", nome: "Selecionar todas" }, ...contas]
                        : []
                    }
                    groupBy={
                      formData.processo.length > 0
                        ? (option) => {
                            const isVinculada =
                              option.id === "all_vinculadas" ||
                              contasFiltradas.some((c) => c.id === option.id);
                            return isVinculada
                              ? "Vinculadas ao(s) Processo(s) Selecionado(s)"
                              : "Outras Contas (Sem Vinculação)";
                          }
                        : undefined
                    }
                    noOptionsText="Nenhuma conta encontrada"
                    getOptionLabel={(option) => option.nome || ""}
                    value={formData.conta.map(
                      (id) => contas.find((conta) => conta.id === id) || id,
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={handleSelectAllConta}
                    renderOption={(props, option, { selected }) => {
                      let isChecked = selected;
                      const origens = contaOrigemMap[option.id]
                        ? contaOrigemMap[option.id].join(", ")
                        : "";

                      if (option.id === "all") {
                        isChecked =
                          contas.length > 0 &&
                          contas.every((conta) =>
                            formData.conta.includes(conta.id),
                          );
                      } else if (option.id === "all_vinculadas") {
                        const vinculadasIds = contasFiltradas.map((c) => c.id);
                        isChecked =
                          vinculadasIds.length > 0 &&
                          vinculadasIds.every((id) =>
                            formData.conta.includes(id),
                          );
                      } else if (option.id === "all_outras") {
                        const vinculadasIds = new Set(
                          contasFiltradas.map((c) => c.id),
                        );
                        const outrasIds = contas
                          .map((c) => c.id)
                          .filter((id) => !vinculadasIds.has(id));
                        isChecked =
                          outrasIds.length > 0 &&
                          outrasIds.every((id) => formData.conta.includes(id));
                      }

                      return (
                        <li {...props}>
                          <Grid container alignItems="center">
                            <Grid item>
                              <Checkbox checked={isChecked} />
                            </Grid>
                            <Grid item xs>
                              <Typography variant="body1">
                                {option.nome}
                              </Typography>
                              {option.id !== "all" &&
                                option.id !== "all_vinculadas" &&
                                option.id !== "all_outras" &&
                                origens && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{
                                      color: "text.secondary",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    Processo(s): {origens}
                                  </Typography>
                                )}
                            </Grid>
                          </Grid>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.conta.length === 0 ||
                            formData.conta.every((val) => val === 0)) &&
                          formValidation.conta === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Responsável</InputLabel>
                  <Autocomplete
                    options={responsaveis}
                    getOptionLabel={(option) => option.nome}
                    value={
                      responsaveis.find(
                        (responsavel) =>
                          responsavel.id === formData.responsavel,
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        responsavel: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.responsavel &&
                          formValidation.responsavel === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Anexo</InputLabel>
                  <FileUploader
                    containerFolder={1}
                    initialFiles={formData.files}
                    onFilesChange={(files) =>
                      setFormData((prev) => ({ ...prev, files }))
                    }
                  />
                </Stack>
              </Grid>

              <Grid item xs={4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 0.5 }}
                  >
                    <Switch
                      checked={status}
                      onChange={(event) => setStatus(event.target.checked)}
                    />
                    <Typography>{status ? "Ativo" : "Inativo"}</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Participantes</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ListagemAcionistas />
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={voltarParaCadastroMenu}
                sx={{ minWidth: 120 }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={tratarSubmit}
                sx={{ minWidth: 120 }}
              >
                {requisicao === "Editar" ? "Atualizar" : requisicao}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Dialog de sucesso */}
        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "12px",
              padding: "16px",
            },
          }}
        >
          {/* Ícone de sucesso */}
          <DialogTitle
            sx={{
              textAlign: "center",
              paddingBottom: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CheckCircleOutlineIcon
              sx={{ fontSize: 60, color: "#4caf50", marginBottom: 1 }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "#333", marginTop: 1 }}
            >
              Empresa cadastrada com sucesso!
            </Typography>
          </DialogTitle>

          {/* Conteúdo */}
          <DialogContent sx={{ textAlign: "center", paddingTop: 0 }}>
            <DialogContentText sx={{ fontSize: "16px", color: "#555", px: 2 }}>
              A empresa foi cadastrada com sucesso. Você pode voltar para a
              listagem ou adicionar mais informações a essa empresa.
            </DialogContentText>
          </DialogContent>

          {/* Botões */}
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
          onClose={() => setOpenProcessDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            Alteração de Processo
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText>
              Deseja manter as contas selecionadas?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "center", gap: 2 }}>
            <Button
              onClick={trocarProcessoLimpar}
              color="error"
              variant="outlined"
            >
              Limpar Contas
            </Button>
            <Button
              onClick={trocarProcessoManter}
              color="primary"
              variant="contained"
            >
              Manter Contas
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;
