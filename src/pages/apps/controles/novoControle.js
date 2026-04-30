/* eslint-disable react-hooks/exhaustive-deps */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Box,
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
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import { CONTROL_FREQUENCY_OPTIONS } from "../../../utils/controlFrequency";
import DrawerProcesso from "../configuracoes/novoProcessoDrawerControles";
import DrawerConta from "../configuracoes/novaContaDrawerControles";
import DrawerRisco from "../configuracoes/novoRiscoDrawerControles";
import DrawerAtivo from "../configuracoes/novoAtivoDrawerControles";
import DrawerDeficiencia from "../configuracoes/novaDeficienciaDrawerControles";
import DrawerObjetivo from "../configuracoes/novoObjetivoDrawerControle";
import DrawerIpe from "../configuracoes/novoIpeDrawerControle";
import FileUploader from "../configuracoes/FileUploader";
import ListaControleTestes from "./listaControleTestes";
import ResumoUltimoTesteControleContainer from "./ResumoUltimoTesteControleContainer";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [objetivoControles, setObjetivoControle] = useState([]);
  const [contas, setContas] = useState([]);
  const [contasFiltradas, setContasFiltradas] = useState([]);
  const [tiposControles, setTiposControles] = useState([]);
  const [carvs, setCarvs] = useState([]);
  const [frequencias, setFrequencias] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [execucoes, setExecucoes] = useState([]);
  const [ativos, setAtivos] = useState([]);
  const [ipes, setIpes] = useState([]);
  const [riscos, setRiscoAssociados] = useState([]);
  const [riscosFiltrados, setRiscosFiltrados] = useState([]);
  const [assertions, setAssertions] = useState([]);
  const [deficiencias, setDeficiencias] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [compensadoControles, setCompensadosControles] = useState([]);
  const [compensaControles, setCompensaControles] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [responsaveis, setResponsavel] = useState([]);
  const [chave, setChave] = useState(false);
  const [revisao, setRevisao] = useState(false);
  const [preventivo, setPreventivo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [controleDados, setControleDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedFiles, setDeletedFiles] = useState([]);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    empresaInferior: [],
    ativo: [],
    ipe: [],
    compensadoControle: [],
    compensaControle: [],
    objetivoControle: [],
    kri: [],
    elemento: [],
    carv: [],
    plano: [],
    deficiencia: [],
    ameaca: [],
    normativa: [],
    assertion: [],
    departamento: [],
    categoria: "",
    frequencia: "",
    execucao: "",
    classificacao: "",
    tiposControle: "",
    processo: "",
    files: [],
    risco: [],
    conta: [],
    responsavel: "",
    dataInicioOperacao: null,
  });

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idControl, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id:
          item.idControl ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idCategory ||
          item.idControl ||
          item.idFramework ||
          item.idTreatment ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idNormative ||
          item.idControlType ||
          item.idDepartment ||
          item.idExecution ||
          item.idKri ||
          item.idControl ||
          item.idElementCoso ||
          item.idThreat ||
          item.idObjective ||
          item.idLedgerAccount ||
          item.idInformationActivity ||
          item.idAssertion ||
          item.idCvar ||
          item.idClassification ||
          item.idRisk ||
          item.idDeficiency ||
          item.idCollaborator ||
          item.idPlatform,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
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

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}risks`,
      setRiscoAssociados
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}objective`,
      setObjetivoControle
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}ledger-accounts`,
      setContas
    );
    fetchData(`${process.env.REACT_APP_API_URL}actives`, setAtivos);
    fetchData(`${process.env.REACT_APP_API_URL}ipe`, setIpes);
    fetchData(
      `${process.env.REACT_APP_API_URL}deficiencies`,
      setDeficiencias
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}controls`,
      setCompensadosControles
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}controls`,
      setCompensaControles
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}processes`,
      setProcessos
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}ledger-accounts/assertions`,
      setAssertions
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}controls/types`,
      setTiposControles
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}controls/classifications/2`,
      setClassificacoes
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}controls/cvars`,
      setCarvs
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}controls/element-cosos`,
      setElementos
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}controls/executions`,
      setExecucoes
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
      setResponsavel
    );
    setFrequencias(CONTROL_FREQUENCY_OPTIONS);
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      setLoading(true);
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}controls/${dadosApi.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
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
          setChave(data.meaningfulness);
          setPreventivo(data.preventiveDetective);
          setRevisao(data.revisionControl);
          setFormData((prev) => ({
            ...prev,
            deficiencia: Array.isArray(data.idDeficiencies)
              ? data.idDeficiencies
              : [],
            ipe: Array.isArray(data.idInformationActivities)
              ? data.idInformationActivities
              : [],
            elemento: Array.isArray(data.idControlElementCosos)
              ? data.idControlElementCosos
              : [],
            risco: Array.isArray(data.idRisks) ? data.idRisks : [],
            ativo: Array.isArray(data.idPlatforms) ? data.idPlatforms : [],
            compensaControle: Array.isArray(data.idControlCompensatings)
              ? data.idControlCompensatings
              : [],
            compensadoControle: Array.isArray(data.idControlCompensateds)
              ? data.idControlCompensateds
              : [],
            objetivoControle: Array.isArray(data.idControlObjectives)
              ? data.idControlObjectives
              : [],
            processo: data.idProcess || null,
            responsavel: data.idResponsible || null,
            conta: Array.isArray(data.idControlLedgerAccounts)
              ? data.idControlLedgerAccounts
              : [],
            frequencia: data.frequency || null,
            files: data.files || [],
            tiposControle: data.idControlType || null,
            execucao: data.idControlExecution || null,
            classificacao: data.idClassification || null,
            assertion: Array.isArray(data.idAssertions) ? data.idAssertions : [],
            carv: Array.isArray(data.idCvars) ? data.idCvars : [],
          }));

          setControleDados(data);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
          setLoading(false);
        } finally {
          console.log("Requisição finalizada");
          setLoading(false);
        }
      };

      if (dadosApi.id) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  useEffect(() => {
    const atualizarDependentesPorProcesso = async () => {
      if (!formData.processo) {
        setContasFiltradas(contas);
        setRiscosFiltrados(riscos);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}processes/${formData.processo}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const ledgerAccounts =
          response.data.ledgerAccounts || response.data.idLedgerAccounts || [];
        const processRisks = response.data.risks || response.data.idRisks || [];

        const idsContaPermitidos = new Set(
          ledgerAccounts
            .map((ledger) =>
              typeof ledger === "object"
                ? ledger.idLedgerAccount || ledger.id
                : ledger
            )
            .filter(Boolean)
        );

        const idsRiscoPermitidos = new Set(
          processRisks
            .map((risk) =>
              typeof risk === "object" ? risk.idRisk || risk.id : risk
            )
            .filter(Boolean)
        );

        setContasFiltradas(
          contas.filter(
            (conta) =>
              idsContaPermitidos.has(conta.id) ||
              isOrphan(conta, ["processes", "idProcesses"])
          )
        );

        setRiscosFiltrados(
          riscos.filter(
            (risco) =>
              idsRiscoPermitidos.has(risco.id) ||
              isOrphan(risco, ["processes", "idProcesses"])
          )
        );
      } catch (error) {
        console.error("Erro ao buscar dependências do processo:", error);
      }
    };

    if (contas.length > 0 || riscos.length > 0) {
      atualizarDependentesPorProcesso();
    }
  }, [formData.processo, contas, riscos, token]);

  const formatarNome = (nome) => nome.replace(/\s+/g, "").toLowerCase();

useEffect(() => {
    // PROTEÇÃO: Se as listas ainda não carregaram, não faz a validação para evitar limpar o formData acidentalmente.
    if (compensaControles.length === 0 || compensadoControles.length === 0) {
      return;
    }

    const nomeDigitado = formatarNome(nome);

    // Atualiza os departamentos inferiores removendo os que conflitam
    const inferioresAtualizadas = formData.compensaControle.filter((id) => {
      const compensaControle = compensaControles.find(
        (departamento) => departamento.id === id
      );
      // Se não encontrou o objeto, mas a lista já existe, aí sim removemos (pode ser um ID antigo/inválido)
      // Mas se o ID existe na lista e o nome não conflita, mantemos.
      if (!compensaControle) return false; 
      return formatarNome(compensaControle.nome) !== nomeDigitado;
    });
    
    // Só atualiza o estado se houver diferença de tamanho para evitar loops infinitos
    if (inferioresAtualizadas.length !== formData.compensaControle.length) {
      setFormData((prev) => ({
        ...prev,
        compensaControle: inferioresAtualizadas,
      }));
    }

    // **Novo bloco: Atualiza os departamentos laterais**
    const lateraisAtualizadas = formData.compensadoControle.filter((id) => {
      const compensadoControle = compensadoControles.find(
        (departamento) => departamento.id === id
      );
      if (!compensadoControle) return false;
      return formatarNome(compensadoControle.nome) !== nomeDigitado;
    });

    if (lateraisAtualizadas.length !== formData.compensadoControle.length) {
      setFormData((prev) => ({
        ...prev,
        compensadoControle: lateraisAtualizadas,
      }));
    }
  }, [
    nome,
    compensaControles, // Importante que isso esteja aqui para re-executar quando a lista carregar
    compensadoControles, // Importante que isso esteja aqui para re-executar quando a lista carregar
    formData.compensaControle,
    formData.compensadoControle,
  ]);

  useEffect(() => {
    if (!formData.processo || contas.length === 0) {
      return;
    }

    const idsContaPermitidos = new Set(
      contasFiltradas.map((conta) => conta.id)
    );

    setFormData((prev) => {
      const contasAtuais = Array.isArray(prev.conta) ? prev.conta : [];
      const contasValidas = contasAtuais.filter((id) =>
        idsContaPermitidos.has(id)
      );

      if (contasValidas.length === contasAtuais.length) {
        return prev;
      }

      return {
        ...prev,
        conta: contasValidas,
      };
    });
  }, [formData.processo, contas.length, contasFiltradas]);

  useEffect(() => {
    if (!formData.processo || riscos.length === 0) {
      return;
    }

    const idsRiscoPermitidos = new Set(
      riscosFiltrados.map((risco) => risco.id)
    );

    setFormData((prev) => {
      const riscosAtuais = Array.isArray(prev.risco) ? prev.risco : [];
      const riscosValidos = riscosAtuais.filter((id) =>
        idsRiscoPermitidos.has(id)
      );

      if (riscosValidos.length === riscosAtuais.length) {
        return prev;
      }

      return {
        ...prev,
        risco: riscosValidos,
      };
    });
  }, [formData.processo, riscos.length, riscosFiltrados]);

  const handleProcessCreated = (newProcesso) => {
    setProcessos((prevProcessos) => [...prevProcessos, newProcesso]);

    setFormData((prev) => ({
      ...prev,
      processo: newProcesso.id, // Define o novo processo como o único selecionado
    }));
  };

  const handleAccountCreated = (newConta) => {
    const contaNormalizada = {
      ...newConta,
      idProcesses: newConta.idProcesses || [],
    };

    setContas((prevContas) => [...prevContas, contaNormalizada]);
    setFormData((prev) => ({
      ...prev,
      conta: [...prev.conta, newConta.id],
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

  const handleActiveCreated = (newAtivo) => {
    setAtivos((prevAtivos) => [...prevAtivos, newAtivo]);
    setFormData((prev) => ({
      ...prev,
      ativo: [...prev.ativo, newAtivo.id],
    }));
  };

  const handleDeficiencyCreated = (newDeficiencia) => {
    setDeficiencias((prevDeficiencias) => [
      ...prevDeficiencias,
      newDeficiencia,
    ]);
    setFormData((prev) => ({
      ...prev,
      deficiencia: [...prev.deficiencia, newDeficiencia.id],
    }));
  };

  const handleObjetiveCreated = (newObjetivo) => {
    setObjetivoControle((prevObjetivos) => [...prevObjetivos, newObjetivo]);
    setFormData((prev) => ({
      ...prev,
      objetivoControle: [...prev.objetivoControle, newObjetivo.id],
    }));
  };
  
  const handleIpeCreated = (newIpe) => {
    setIpes((prevIpes) => [...prevIpes, newIpe]);
    setFormData((prev) => ({
      ...prev,
      ipe: [...prev.ipe, newIpe.id],
    }));
  };

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "categoria") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSelectAll = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (allSelected) {
        // Deselect all
        setFormData({ ...formData, risco: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          risco: riscosFiltrados.map((risco) => risco.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "risco",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllDeficiencias = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.deficiencia.length === deficiencias.length) {
        // Deselect all
        setFormData({ ...formData, deficiencia: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          deficiencia: deficiencias.map((deficiencia) => deficiencia.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "deficiencia",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllCarvs = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.carv.length === carvs.length) {
        // Deselect all
        setFormData({ ...formData, carv: [] });
      } else {
        // Select all
        setFormData({ ...formData, carv: carvs.map((carv) => carv.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "carv",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAlloObjetivoControles = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.objetivoControle.length === objetivoControles.length) {
        // Deselect all
        setFormData({ ...formData, objetivoControle: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          objetivoControle: objetivoControles.map(
            (objetivoControle) => objetivoControle.id
          ),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "objetivoControle",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllElementos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.elemento.length === elementos.length) {
        // Deselect all
        setFormData({ ...formData, elemento: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          elemento: elementos.map((elemento) => elemento.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "elemento",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllContas = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (allSelectedContas) {
        // Deselect all
        setFormData({ ...formData, conta: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          conta: contasFiltradas.map((conta) => conta.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "conta",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllCompensadoControles = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      // Aplica o filtro usado no Autocomplete para este campo
      const filteredOptions = compensadoControles.filter((item) => {
        const superiorId = formData.departamentoSuperior; // ou outro campo se necessário
        const inferiorIds = formData.compensaControle || [];
        return (
          item.id !== superiorId &&
          !inferiorIds.includes(item.id) &&
          formatarNome(item.nome) !== formatarNome(nome)
        );
      });
      if (formData.compensadoControle.length === filteredOptions.length) {
        setFormData({ ...formData, compensadoControle: [] });
      } else {
        setFormData({
          ...formData,
          compensadoControle: filteredOptions.map((item) => item.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "compensadoControle",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllCompensaControles = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      // Aplica o mesmo filtro usado no Autocomplete
      const filteredOptions = compensaControles.filter((item) => {
        const superiorId = formData.departamentoSuperior; // ou outro campo se necessário
        const lateralIds = formData.compensadoControle || [];
        return (
          item.id !== superiorId &&
          !lateralIds.includes(item.id) &&
          formatarNome(item.nome) !== formatarNome(nome)
        );
      });
      if (formData.compensaControle.length === filteredOptions.length) {
        // Se já estiverem todos selecionados, deseleciona todos
        setFormData({ ...formData, compensaControle: [] });
      } else {
        // Seleciona somente os itens filtrados
        setFormData({
          ...formData,
          compensaControle: filteredOptions.map((item) => item.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "compensaControle",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllAssertions = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.assertion.length === assertions.length) {
        // Deselect all
        setFormData({ ...formData, assertion: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          assertion: assertions.map((assertion) => assertion.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "assertion",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllAtivos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.ativo.length === ativos.length) {
        // Deselect all
        setFormData({ ...formData, ativo: [] });
      } else {
        // Select all
        setFormData({ ...formData, ativo: ativos.map((ativo) => ativo.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "ativo",
        newValue.map((item) => item.id)
      );
    }
  };

  const handleSelectAllIpes = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.ipe.length === ipes.length) {
        // Deselect all
        setFormData({ ...formData, ipe: [] });
      } else {
        // Select all
        setFormData({ ...formData, ipe: ipes.map((ipe) => ipe.id) });
      }
    } else {
      tratarMudancaInputGeral(
        "ipe",
        newValue.map((item) => item.id)
      );
    }
  };

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
    // navigate('/apps/processos/configuracoes-menu', { state: { tab: 'Órgão' } });
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

  const [formValidation, setFormValidation] = useState({
    codigo: true,
    nome: true,
    processo: true,
  });

  const riscoIdsFiltrados = new Set(
    riscosFiltrados.map((risco) => risco.id)
  );
  const contaIdsFiltrados = new Set(
    contasFiltradas.map((conta) => conta.id)
  );
  const allSelected =
    riscosFiltrados.length > 0 &&
    formData.risco.filter((id) => riscoIdsFiltrados.has(id)).length ===
      riscosFiltrados.length;
  const allSelectedAtivos =
    formData.ativo.length === ativos.length && ativos.length > 0;
  const allSelectedIpes =
    formData.ipe.length === ipes.length && ipes.length > 0;
  const allSelectedAssertions =
    formData.assertion.length === assertions.length && assertions.length > 0;
  const allSelectedDeficiencias =
    formData.deficiencia.length === deficiencias.length &&
    deficiencias.length > 0;
  const allSelectedElementos =
    formData.elemento.length === elementos.length && elementos.length > 0;
  const allSelectedCompensadoControles =
    formData.compensadoControle.length === compensadoControles.length &&
    compensadoControles.length > 0;
  const allSelectedCompensaControles =
    formData.compensaControle.length === compensaControles.length &&
    compensaControles.length > 0;
  const allSelectedContas =
    contasFiltradas.length > 0 &&
    formData.conta.filter((id) => contaIdsFiltrados.has(id)).length ===
      contasFiltradas.length;
  const allSelectedObjetivoControles =
    formData.objetivoControle.length === objetivoControles.length &&
    objetivoControles.length > 0;
  const allSelectedCarvs =
    formData.carv.length === carvs.length && carvs.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const controleAtualId = controleDados?.idControl || dadosApi?.id || null;

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!nome.trim()) {
      setFormValidation((prev) => ({ ...prev, nome: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (!formData.processo) {
      setFormValidation((prev) => ({ ...prev, processo: false }));
      missingFields.push("Processo");
    }
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    try {
      setLoading(true);

      if (deletedFiles.length > 0) {
        // Supondo que deletedFilesPayload deva conter dados relevantes e não apenas o resultado de file instanceof File
        const deletedFilesPayload = deletedFiles.map((file) => file.name); // ajuste conforme a necessidade
        
        await axios.delete(
          `${process.env.REACT_APP_API_URL}files`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: {
              containerFolder: 4,
              files: deletedFilesPayload,
            },
          }
        );
      }
      
      const newFiles = formData.files.filter((file) => file instanceof File);
      const existingFiles = formData.files.filter(
        (file) => !(file instanceof File)
      );

      let uploadFilesResult = { files: [] };
      if (newFiles.length > 0) {
        const formDataUpload = new FormData();
        formDataUpload.append("ContainerFolder", 4); 

        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? controleDados?.idControl : ""
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
          }
        );
        uploadFilesResult = uploadResponse.data; 
      }

      // Combina os arquivos já existentes com os novos enviados (retornados pelo endpoint)
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];

      // Transforma cada item para que o payload contenha somente a URL (string)
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      // --- Configuração do payload e endpoint para CONTROLES ---
      if (requisicao === "Criar") {
        url = `${process.env.REACT_APP_API_URL}controls`;
        method = "POST";
        payload = {
          code: codigo,
          name: nome,
          idProcess: formData.processo,
        };
      } else if (requisicao === "Editar") {
        url = `${process.env.REACT_APP_API_URL}controls`;
        method = "PUT";
        payload = {
          idControl: controleDados?.idControl,
          code: codigo,
          name: nome,
          description: descricao,
          preventiveDetective: preventivo,
          revisionControl: revisao,
          idPlatforms: formData.ativo,
          frequency: formData.frequencia === null || formData.frequencia === '' ? 0 : formData.frequencia,
          idResponsible: formData.responsavel === null || formData.responsavel === '' ? null : formData.responsavel,
          active: true,
          idControlType: formData.tiposControle === null || formData.tiposControle === '' ? null : formData.tiposControle,
          idProcess: formData.processo,
          idControlExecution: formData.execucao === null || formData.execucao === '' ? null : formData.execucao,
          idClassification: formData.classificacao === null || formData.classificacao === '' ? null : formData.classificacao,
          idRisks: formData.risco,
          idInformationActivities: formData.ipe,
          idAssertions: formData.assertion,
          idCvars: formData.carv,
          idDeficiencies: formData.deficiencia,
          idControlCompensatings: formData.compensaControle,
          idControlCompensateds: formData.compensadoControle,
          idControlLedgerAccounts: formData.conta,
          idControlElementCosos: formData.elemento,
          idControlObjectives: formData.objetivoControle,
          files: finalFilesPayload,
          meaningfulness: chave,
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

      let data = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      } else {
        enqueueSnackbar(`Controle ${mensagemFeedback} com sucesso!`, {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      }

      if (requisicao === "Criar" && data.data.idControl) {
        setControleDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse controle.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
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
          {controleAtualId && (
            <Grid item xs={12}>
              <ResumoUltimoTesteControleContainer controlId={controleAtualId} />
            </Grid>
          )}

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
              <InputLabel>
                Processo *{" "}
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
                options={processos}
                getOptionLabel={(option) => option.nome}
                value={
                  processos.find(
                    (processo) => processo.id === formData.processo
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    processo: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={
                      !formData.processo && formValidation.processo === false
                    }
                  />
                )}
              />
            </Stack>
          </Grid>

          {requisicao === "Editar" && (
            <>
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

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Tipo de controle</InputLabel>
                  <Autocomplete
                    options={tiposControles}
                    getOptionLabel={(option) => option.nome}
                    value={
                      tiposControles.find(
                        (tiposControle) =>
                          tiposControle.id === formData.tiposControle
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tiposControle: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.tiposControle &&
                          formValidation.tiposControle === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Compensa os controles</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...compensaControles.filter((departamento) => {
                        // IDs já selecionados em outros autocompletes:
                        const superiorId = formData.departamentoSuperior;
                        const lateralIds = formData.compensadoControle || [];

                        // Se o departamento estiver selecionado neste campo, mantenha-o
                        if (formData.compensaControle.includes(departamento.id))
                          return true;

                        return (
                          departamento.id !== superiorId &&
                          !lateralIds.includes(departamento.id) &&
                          formatarNome(departamento.nome) !== formatarNome(nome)
                        );
                      }),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.compensaControle.map(
                      (id) =>
                        compensaControles.find(
                          (departamento) => departamento.id === id
                        ) || id
                    )}
                    onChange={handleSelectAllCompensaControles}
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
                                  ? allSelectedCompensaControles
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.compensaControle.length === 0 ||
                            formData.compensaControle.every(
                              (val) => val === 0
                            )) &&
                          formValidation.compensaControle === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>Compensado pelos controles</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...compensadoControles.filter((departamento) => {
                        const superiorId = formData.departamentoSuperior;
                        const inferiorIds = formData.compensaControle || [];

                        if (
                          formData.compensadoControle.includes(departamento.id)
                        )
                          return true;

                        return (
                          departamento.id !== superiorId &&
                          !inferiorIds.includes(departamento.id) &&
                          formatarNome(departamento.nome) !== formatarNome(nome)
                        );
                      }),
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.compensadoControle.map(
                      (id) =>
                        compensadoControles.find(
                          (departamento) => departamento.id === id
                        ) || id
                    )}
                    onChange={handleSelectAllCompensadoControles}
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
                                  ? allSelectedCompensadoControles
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.compensadoControle.length === 0 ||
                            formData.compensadoControle.every(
                              (val) => val === 0
                            )) &&
                          formValidation.compensaControle === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Objetivo de controle{" "}
                    <DrawerObjetivo
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onObjetivoCreated={handleObjetiveCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", description: "Selecionar todos" },
                      ...objetivoControles,
                    ]}
                    getOptionLabel={(option) => option.description}
                    value={formData.objetivoControle.map(
                      (id) =>
                        objetivoControles.find(
                          (objetivoControle) => objetivoControle.id === id
                        ) || id
                    )}
                    onChange={handleSelectAlloObjetivoControles}
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
                                  ? allSelectedObjetivoControles
                                  : selected
                              }
                            />
                          </Grid>
                          <Grid item xs>
                            {option.description}
                          </Grid>
                        </Grid>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.objetivoControle.length === 0 ||
                            formData.objetivoControle.every(
                              (val) => val === 0
                            )) &&
                          formValidation.objetivoControle === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Contas{" "}
                    <DrawerConta
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onAccountCreated={handleAccountCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    noOptionsText="Nenhuma conta encontrada"
                    multiple
                    disableCloseOnSelect
                    options={
                      contasFiltradas.length > 0
                        ? [
                            { id: "all", nome: "Selecionar todas" },
                            ...contasFiltradas,
                          ]
                        : []
                    }
                    getOptionLabel={(option) => option.nome}
                    value={formData.conta.map(
                      (id) => contas.find((conta) => conta.id === id) || id
                    )}
                    onChange={handleSelectAllContas}
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
                                  ? allSelectedContas
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
                  <InputLabel>Frequência</InputLabel>
                  <Autocomplete
                    options={frequencias}
                    getOptionLabel={(option) => option.nome}
                    value={
                      frequencias.find(
                        (frequencia) => frequencia.id === formData.frequencia
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        frequencia: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.frequencia &&
                          formValidation.frequencia === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Execução</InputLabel>
                  <Autocomplete
                    options={execucoes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      execucoes.find(
                        (execucao) => execucao.id === formData.execucao
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        execucao: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.execucao &&
                          formValidation.execucao === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Classificação</InputLabel>
                  <Autocomplete
                    options={classificacoes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      classificacoes.find(
                        (classificacao) =>
                          classificacao.id === formData.classificacao
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        classificacao: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.classificacao &&
                          formValidation.classificacao === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Riscos{" "}
                    <DrawerRisco
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onRiscoCreated={handleRiskCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    noOptionsText="Nenhum risco encontrado"
                    multiple
                    disableCloseOnSelect
                    options={
                      riscosFiltrados.length > 0
                        ? [
                            { id: "all", nome: "Selecionar todos" },
                            ...riscosFiltrados,
                          ]
                        : []
                    }
                    getOptionLabel={(option) => option.nome}
                    value={formData.risco.map(
                      (id) => riscos.find((risco) => risco.id === id) || id
                    )}
                    onChange={handleSelectAll}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all" ? allSelected : selected
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
                          (formData.risco.length === 0 ||
                            formData.risco.every((val) => val === 0)) &&
                          formValidation.risco === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                    Ativo{" "}
                    <DrawerAtivo
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onActiveCreated={handleActiveCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...ativos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.ativo.map(
                      (id) => ativos.find((ativo) => ativo.id === id) || id
                    )}
                    onChange={handleSelectAllAtivos}
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
                                  ? allSelectedAtivos
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.ativo.length === 0 ||
                            formData.ativo.every((val) => val === 0)) &&
                          formValidation.ativo === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} mb={5}>
                <Stack spacing={1}>
                  <InputLabel>
                  Informação da atividade (IPE) {" "}
                    <DrawerIpe
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onIpeCreated={handleIpeCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: "all", nome: "Selecionar todos" }, ...ipes]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.ipe.map(
                      (id) => ipes.find((ipe) => ipe.id === id) || id
                    )}
                    onChange={handleSelectAllIpes}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <Checkbox
                              checked={
                                option.id === "all" ? allSelectedIpes : selected
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
                          (formData.ipe.length === 0 ||
                            formData.ipe.every((val) => val === 0)) &&
                          formValidation.ipe === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Assertions</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...assertions,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.assertion.map(
                      (id) =>
                        assertions.find((assertion) => assertion.id === id) ||
                        id
                    )}
                    onChange={handleSelectAllAssertions}
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
                                  ? allSelectedAssertions
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.assertion.length === 0 ||
                            formData.assertion.every((val) => val === 0)) &&
                          formValidation.assertion === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>CAVR</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...carvs,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.carv.map(
                      (id) => carvs.find((carv) => carv.id === id) || id
                    )}
                    onChange={handleSelectAllCarvs}
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
                                  ? allSelectedCarvs
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.carv.length === 0 ||
                            formData.carv.every((val) => val === 0)) &&
                          formValidation.carv === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>
                    Deficiências{" "}
                    <DrawerDeficiencia
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onDeficienciaCreated={handleDeficiencyCreated}
                    />
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todas" },
                      ...deficiencias,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.deficiencia.map(
                      (id) =>
                        deficiencias.find(
                          (deficiencia) => deficiencia.id === id
                        ) || id
                    )}
                    onChange={handleSelectAllDeficiencias}
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
                                  ? allSelectedDeficiencias
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.deficiencia.length === 0 ||
                            formData.deficiencia.every((val) => val === 0)) &&
                          formValidation.deficiencia === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Elemento COSO</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...elementos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={formData.elemento.map(
                      (id) =>
                        elementos.find((elemento) => elemento.id === id) || id
                    )}
                    onChange={handleSelectAllElementos}
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
                                  ? allSelectedElementos
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
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          (formData.elemento.length === 0 ||
                            formData.elemento.every((val) => val === 0)) &&
                          formValidation.elemento === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <InputLabel>Responsável</InputLabel>
                  <Autocomplete
                    options={responsaveis}
                    getOptionLabel={(option) => option.nome}
                    value={
                      responsaveis.find(
                        (responsavel) => responsavel.id === formData.responsavel
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

              <Grid item xs={1.5}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Switch
                      checked={chave}
                      onChange={(event) => setChave(event.target.checked)}
                    />
                    <Typography>Chave</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={1.5}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Switch
                      checked={revisao}
                      onChange={(event) => setRevisao(event.target.checked)}
                    />
                    <Typography>Revisão</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={1.5} mb={5}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Switch
                      checked={preventivo}
                      onChange={(event) => setPreventivo(event.target.checked)}
                    />
                    <Typography>Preventivo</Typography>
                  </Stack>
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
                    onFileDelete={(file) => setDeletedFiles((prev) => [...prev, file])}
                  />
                </Stack>
              </Grid>

              {controleAtualId && (
                <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Testes</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      <ListaControleTestes controlId={controleAtualId} />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </>
          )}

          {/* Botões de ação */}
          <Grid item xs={12} mt={-5}>
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
            {/* Ícone de Sucesso */}
            <Box display="flex" justifyContent="center" mt={2}>
              <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#28a745" }} />
            </Box>

            {/* Título Centralizado */}
            <DialogTitle
              sx={{ fontWeight: 600, fontSize: "20px", color: "#333" }}
            >
              Controle Criado com Sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O controle foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse controle.
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
        </Grid>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;
