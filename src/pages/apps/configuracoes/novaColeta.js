/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Box,
  TextField,
  Autocomplete,
  Grid,
  Stack,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  FormControl,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Switch,
  RadioGroup,
  Tooltip,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import LoadingOverlay from "./LoadingOverlay";
import FileUploader from "./FileUploader";
import ptBR from "date-fns/locale/pt-BR";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import { API_URL } from "../../../config";
import {
  format,
  getYear,
  addDays,
  startOfWeek,
  addWeeks,
  getISOWeek,
  addMonths,
  getQuarter,
  addQuarters,
  addYears,
  getMonth,
  getDate,
} from "date-fns";

const frequenciasColeta = [
  { id: 1, nome: "Diário" },
  { id: 2, nome: "Semanal" },
  { id: 3, nome: "Quinzenal" },
  { id: 4, nome: "Mensal" },
  { id: 5, nome: "Bimestral" },
  { id: 6, nome: "Trimestral" },
  { id: 7, nome: "Semestral" },
  { id: 8, nome: "Anual" },
  { id: 9, nome: "Bienal" },
  { id: 10, nome: "Inativa" },
];

const tiposMeta = [
  { id: 1, nome: "Absoluta (ou total)" },
  { id: 2, nome: "Intensiva (ou relativa)" },
  { id: 3, nome: "Percentual" },
  { id: 4, nome: "Qualitativa" },
  { id: 5, nome: "Neutra / Compensada" },
];

// Função de Regra de Negócio: Calcular o Período de Referência Inicial
const calcularPeriodoReferenciaInicial = (frequencia, dataInicio) => {
  if (!frequencia || !dataInicio) return "";

  let proximoPeriodo = dataInicio;

  switch (frequencia.nome.toLowerCase()) {
    case "diário":
      // O período de referência é o mesmo dia da data de início da coleta.
      proximoPeriodo = dataInicio;
      return `DIA${format(proximoPeriodo, "yyyyMMdd")}`;

    case "semanal":
      // Primeiro período completo após a data de início (próxima semana)
      // startOfWeek(dataInicio, { weekStartsOn: 1 }) retorna o início da semana atual (segunda-feira)
      // addWeeks(..., 1) avança para o início da próxima semana
      let periodoReferencia;

      // Se a data de início for um dia da semana atual, o período de referência é a semana atual.
      // Se a data de início for anterior ao início da semana, o período de referência é a semana atual.
      // A única forma de o próximo período completo ser a próxima semana é se a data de início for o último dia da semana atual (domingo),
      // o que não acontece com weekStartsOn: 1 (segunda).
      // Portanto, para qualquer data dentro de uma semana, o período de referência é a semana atual.
      periodoReferencia = dataInicio; // O período de referência é a semana que contém a data de início.

      const semana = getISOWeek(periodoReferencia);
      const anoSemana = getYear(periodoReferencia);
      return `SEM${anoSemana}${String(semana).padStart(2, "0")}`;

    case "quinzenal":
      // Para quinzenal, o período de referência é a próxima quinzena, a menos que a data seja o início de uma.
      const ano = getYear(dataInicio);
      const mes = getMonth(dataInicio);
      const dia = getDate(dataInicio);

      // Calcula a quinzena atual do ano (1 a 24)
      const quinzenaAtual = mes * 2 + (dia <= 15 ? 1 : 2);

      // Verifica se a data de início é o primeiro dia da quinzena
      const isStartOfFortnight = dia === 1 || dia === 16;

      let targetFortnight;
      let targetYear = ano;

      if (isStartOfFortnight) {
        // Se for o início, usa a quinzena atual
        targetFortnight = quinzenaAtual;
      } else {
        // Caso contrário, avança para a próxima quinzena
        targetFortnight = quinzenaAtual + 1;
      }

      // Se a próxima quinzena ultrapassar 24, ela se torna a primeira do próximo ano
      if (targetFortnight > 24) {
        targetFortnight = 1;
        targetYear = ano + 1;
      }

      return `QUI${targetYear}${String(targetFortnight).padStart(2, "0")}`;

    case "mensal":
      // O período de referência é sempre o mês que contém a data de início.
      proximoPeriodo = dataInicio;
      return `MEN${getYear(proximoPeriodo)}${String(
        getMonth(proximoPeriodo) + 1
      ).padStart(2, "0")}`;

    case "bimestral":
      // O período de referência é o bimestre que contém a data de início.
      const mesAtualBimestral = getMonth(dataInicio);
      const bimestre = Math.floor(mesAtualBimestral / 2) + 1; // 1 (Jan/Fev), 2 (Mar/Abr), etc.
      proximoPeriodo = dataInicio;
      return `BIM${getYear(proximoPeriodo)}${String(bimestre).padStart(
        2,
        "0"
      )}`;

    case "trimestral":
      // O período de referência é o trimestre que contém a data de início.
      proximoPeriodo = dataInicio;
      return `TRI${getYear(proximoPeriodo)}${String(
        getQuarter(proximoPeriodo)
      ).padStart(2, "0")}`;

    case "semestral":
      // O período de referência é o semestre que contém a data de início.
      const semestre = getMonth(dataInicio) < 6 ? 1 : 2;
      proximoPeriodo = dataInicio;
      return `SET${getYear(proximoPeriodo)}${String(semestre).padStart(
        2,
        "0"
      )}`;

    case "anual":
      // O período de referência é sempre o ano que contém a data de início.
      proximoPeriodo = dataInicio;
      return `ANU${getYear(proximoPeriodo)}`;

    case "bienal":
      // O período de referência é o biênio que contém a data de início.
      const anoInicioBienal = getYear(dataInicio);
      const anoInicialBienio =
        anoInicioBienal % 2 === 0 ? anoInicioBienal : anoInicioBienal - 1; // Início do biênio (ano par)
      const anoFinalBienio = anoInicialBienio + 1;
      proximoPeriodo = dataInicio;
      return `BIE${anoInicialBienio}${String(anoFinalBienio).slice(2)}`;

    default:
      return "";
  }
};

// Função de Regra de Negócio: Gerar Coletas por Período
const gerarColetasPorPeriodo = (
  frequenciaNome,
  dataInicio,
  quantidade,
  diasColeta,
  diasPrazo
) => {
  if (!frequenciaNome || !dataInicio || quantidade <= 0) return [];

  const coletas = [];
  let dataAtual = dataInicio;
  let periodoId = 1;

  for (let i = 0; i < quantidade; i++) {
    let proximoPeriodo;
    let dataEnvio;
    let dataLimite;
    let periodoReferencia;

    // 1. Calcular o Início do Período (dataAtual) e o Período de Referência
    let dataFimPeriodo; // Novo: Data de fechamento do período de coleta
    let dataCriacaoColeta; // Novo: Data real de criação/envio da coleta

    switch (frequenciaNome.toLowerCase()) {
      case "diário":
        // O período de coleta é o dia atual (dataAtual + i dias)
        proximoPeriodo = addDays(dataAtual, i);
        // O período de coleta termina no final do dia
        dataFimPeriodo = proximoPeriodo;
        periodoReferencia = `DIA${format(proximoPeriodo, "yyyyMMdd")}`;
        break;
      case "semanal":
        // O período de coleta é a semana que contém proximoPeriodo
        proximoPeriodo = addWeeks(dataAtual, i);
        // O período de coleta termina no domingo da semana (se weekStartsOn=1, domingo é o 7º dia)
        dataFimPeriodo = addDays(
          startOfWeek(proximoPeriodo, { weekStartsOn: 1 }),
          6
        );
        const semana = getISOWeek(proximoPeriodo);
        const anoSemana = getYear(proximoPeriodo);
        periodoReferencia = `SEM${anoSemana}${String(semana).padStart(2, "0")}`;
        break;
      case "quinzenal":
        // Lógica de avanço quinzenal
        proximoPeriodo = addDays(dataAtual, i * 15);
        const ano = getYear(proximoPeriodo);
        const mes = getMonth(proximoPeriodo);
        const dia = getDate(proximoPeriodo);
        const quinzenaAtual = mes * 2 + (dia <= 15 ? 1 : 2);

        // Determinar o fim da quinzena
        if (dia <= 15) {
          // Primeira quinzena: termina no dia 15 do mês
          dataFimPeriodo = new Date(ano, mes, 15);
        } else {
          // Segunda quinzena: termina no último dia do mês
          dataFimPeriodo = new Date(ano, mes + 1, 0); // Dia 0 do próximo mês = último dia do mês atual
        }

        periodoReferencia = `QUI${getYear(proximoPeriodo)}${String(
          quinzenaAtual
        ).padStart(2, "0")}`;
        break;
      case "mensal":
        // O período de coleta é o mês que contém proximoPeriodo
        proximoPeriodo = addMonths(dataAtual, i);
        // O período de coleta termina no último dia do mês
        dataFimPeriodo = new Date(
          getYear(proximoPeriodo),
          getMonth(proximoPeriodo) + 1,
          0
        );
        periodoReferencia = `MEN${getYear(proximoPeriodo)}${String(
          getMonth(proximoPeriodo) + 1
        ).padStart(2, "0")}`;
        break;
      case "bimestral":
        // O período de coleta é o bimestre que contém proximoPeriodo
        proximoPeriodo = addMonths(dataAtual, i * 2);
        const bimestre = Math.floor(getMonth(proximoPeriodo) / 2) + 1;

        // Determinar o fim do bimestre (último dia do segundo mês)
        const mesFimBimestre = bimestre * 2 - 1; // 1 -> 1 (Fev), 2 -> 3 (Abr), etc.
        dataFimPeriodo = new Date(
          getYear(proximoPeriodo),
          mesFimBimestre + 1,
          0
        );

        periodoReferencia = `BIM${getYear(proximoPeriodo)}${String(
          bimestre
        ).padStart(2, "0")}`;
        break;
      case "trimestral":
        // O período de coleta é o trimestre que contém proximoPeriodo
        proximoPeriodo = addQuarters(dataAtual, i);
        const trimestre = getQuarter(proximoPeriodo);

        // Determinar o fim do trimestre (último dia do terceiro mês do trimestre)
        const mesFimTrimestre = trimestre * 3 - 1; // 1 -> 2 (Mar), 2 -> 5 (Jun), etc.
        dataFimPeriodo = new Date(
          getYear(proximoPeriodo),
          mesFimTrimestre + 1,
          0
        );

        periodoReferencia = `TRI${getYear(proximoPeriodo)}${String(
          trimestre
        ).padStart(2, "0")}`;
        break;
      case "semestral":
        // O período de coleta é o semestre que contém proximoPeriodo
        proximoPeriodo = addMonths(dataAtual, i * 6);
        const semestre = getMonth(proximoPeriodo) < 6 ? 1 : 2;

        // Determinar o fim do semestre (último dia do sexto mês do semestre)
        const mesFimSemestre = semestre === 1 ? 5 : 11; // Junho (5) ou Dezembro (11)
        dataFimPeriodo = new Date(
          getYear(proximoPeriodo),
          mesFimSemestre + 1,
          0
        );

        periodoReferencia = `SET${getYear(proximoPeriodo)}${String(
          semestre
        ).padStart(2, "0")}`;
        break;
      case "anual":
        // O período de coleta é o ano que contém proximoPeriodo
        proximoPeriodo = addYears(dataAtual, i);
        // O período de coleta termina no último dia do ano
        dataFimPeriodo = new Date(getYear(proximoPeriodo), 12, 0);
        periodoReferencia = `ANU${getYear(proximoPeriodo)}`;
        break;
      case "bienal":
        // O período de coleta é o biênio que contém proximoPeriodo
        proximoPeriodo = addYears(dataAtual, i * 2);
        const anoInicialBienio = getYear(proximoPeriodo);
        const anoFinalBienio = anoInicialBienio + 1;

        // Determinar o fim do biênio (último dia do segundo ano)
        dataFimPeriodo = new Date(anoFinalBienio, 12, 0);

        periodoReferencia = `BIE${anoInicialBienio}${String(
          anoFinalBienio
        ).slice(2)}`;
        break;
      default:
        continue;
    }

    // A coleta deve ser criada após o fechamento do período de coleta (dataFimPeriodo)
    // e após a quantidade de dias indicado em "dias para criação da coleta" (diasColeta).
    // Se dataFimPeriodo não foi definida (ex: Diário), usa proximoPeriodo como fallback.
    const dataBaseParaCriacao = dataFimPeriodo || proximoPeriodo;

    // 2. Calcular Data de Envio (Data de Criação da Coleta) e Data Limite
    dataCriacaoColeta = addDays(dataBaseParaCriacao, diasColeta);
    dataLimite = addDays(dataCriacaoColeta, diasPrazo);

    // O campo data_envio_coleta é a data em que a coleta deve ser criada/enviada,
    // que é a data de criação calculada.
    dataEnvio = dataCriacaoColeta;

    coletas.push({
      id: periodoId++,
      periodo_referencia_coleta: periodoReferencia,
      status_coleta_periodo: "Coleta Não Iniciada", // Status inicial
      data_limite_coleta: dataLimite,
      data_envio_coleta: dataEnvio, // Data real de criação/envio da coleta
      data_fim_periodo: dataFimPeriodo, // Novo: Data de fechamento do período de coleta
      versao_coleta: "v1.0", // Versão inicial
      data_inicio_periodo: proximoPeriodo, // Data de início do período de coleta
      data_conclusao_efetiva: null, // Novo campo
      instrucao_coleta: "", // Será preenchido ao abrir o modal
    });
  }

  return coletas;
};

// ==============================|| COMPONENTE NOVA COLETA COM REGRAS ||==============================
function NovaColetaComRegras() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { coletaDados: stateColetaDados } = location.state || {};
  const [coletaDados, setColetaDados] = useState(stateColetaDados || null);

  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [hasChanges, setHasChanges] = useState(false);
  const [formValidation, setFormValidation] = useState({});

  // Opções para os seletores
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [fatoresEmissaoOptions, setFatoresEmissaoOptions] = useState([]);
  const [fontesDadosOptions, setFontesDadosOptions] = useState([]);
  const [colaboradoresOptions, setColaboradoresOptions] = useState([]);
  const [empresasOptions, setEmpresasOptions] = useState([]);
  const [departamentosOptions, setDepartamentosOptions] = useState([]);
  const [processosOptions, setProcessosOptions] = useState([]);
  const [riscosOptions, setRiscosOptions] = useState([]);
  const [dimensoesOptions, setDimensoesOptions] = useState([]);

  // Fetch options from API
  useEffect(() => {
    const fetchOptions = async () => {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const endpoints = [
          { key: 'units', url: `${API_URL}Measure/enums`, setter: (data) => setUnidadesMedida(data.units || []) },
          { key: 'indicators', url: `${API_URL}Indicator`, setter: setIndicadores },
          { key: 'emissionFactors', url: `${API_URL}EmissionFactorESG`, setter: setFatoresEmissaoOptions },
          { key: 'dataSources', url: `${API_URL}DataSource`, setter: setFontesDadosOptions },
          { key: 'collaborators', url: `${API_URL}collaborators`, setter: setColaboradoresOptions },
          { key: 'companies', url: `${API_URL}companies`, setter: setEmpresasOptions },
          { key: 'departments', url: `${API_URL}departments`, setter: setDepartamentosOptions },
          { key: 'processes', url: `${API_URL}processes`, setter: setProcessosOptions },
          { key: 'risks', url: `${API_URL}risks`, setter: setRiscosOptions },
          { key: 'dimensions', url: `${API_URL}Dimension`, setter: setDimensoesOptions }
        ];

        await Promise.all(endpoints.map(async (ep) => {
          try {
            const res = await axios.get(ep.url, { headers });
            ep.setter(res.data || []);
          } catch (e) {
            console.error(`Error fetching ${ep.key}:`, e);
          }
        }));
      } catch (error) {
        console.error("Error fetching form options:", error);
      }
    };
    fetchOptions();
  }, [token]);

  // Fetch data if edit mode
  useEffect(() => {
    const fetchColetaData = async () => {
      if (id && !coletaDados && token) {
        try {
          setLoading(true);
          const res = await axios.get(`${API_URL}MetricsWithCollector/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data) {
            setColetaDados(res.data);
          } else {
            enqueueSnackbar("Métrica não encontrada", { variant: "error" });
          }
        } catch (error) {
          console.error("Erro ao buscar dados da métrica:", error);
          enqueueSnackbar("Não foi possível carregar os dados da métrica", { variant: "error" });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchColetaData();
  }, [id, token, coletaDados]);

  // Estados para a nova funcionalidade de coleta por período (mantidos do modelo)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false); // Adicionado para o modal de sucesso
  const [iniciarColetaDialogOpen, setIniciarColetaDialogOpen] = useState(false); // Adicionado para o modal de início de coleta
  const [coletasPorPeriodo, setColetasPorPeriodo] = useState([]);
  const [modalColetaPeriodoOpen, setModalColetaPeriodoOpen] = useState(false);
  const [coletaPeriodoSelecionada, setColetaPeriodoSelecionada] =
    useState(null);
  const [dadosColetaPeriodo, setDadosColetaPeriodo] = useState({
    valores: [],
    descricaoQualitativo: "",
    anexos: [],
    links: [],
    revisores: [], // NOVO
    auditores: [],
    provedorResponsavel: null,
    comentarioRevisor: "",
    comentarioAuditor: "",
    dataConclusaoEfetiva: null,
    instrucaoColeta: "", // Novo campo
  });

  // ==============================|| FUNÇÕES DE MODAL E STATUS (ADAPTADAS DO CÓDIGO ANTIGO) ||==============================

  const statusColetaPeriodo = [
    { id: 1, nome: "Coleta Não Iniciada", cor: "#9e9e9e" },
    { id: 2, nome: "Coleta Em Andamento", cor: "#ff9800" },
    { id: 3, nome: "Em Revisão", cor: "#2196f3" },
    { id: 4, nome: "Concluída", cor: "#4caf50" },
  ];

  const obterProximoStatus = (statusAtual) => {
    const statusMap = {
      "Coleta Não Iniciada": "Coleta Em Andamento",
      "Coleta Em Andamento": "Em Revisão",
      "Em Revisão": "Concluída",
      Concluída: "Concluída",
    };
    return statusMap[statusAtual] || statusAtual;
  };

  const obterTextoAcao = (status) => {
    const acaoMap = {
      "Coleta Não Iniciada": "Iniciar Coleta",
      "Coleta Em Andamento": "Enviar para Revisão",
      "Em Revisão": "Concluir e Aprovar",
      Concluída: "Concluído",
    };
    return acaoMap[status] || "Ação";
  };

  const obterIconeAcao = (status) => {
    const iconeMap = {
      "Coleta Não Iniciada": <PlayArrowIcon />,
      "Coleta Em Andamento": <SendIcon />,
      "Em Revisão": <CheckIcon />,
      Concluída: <CheckIcon />,
    };
    return iconeMap[status] || <PlayArrowIcon />;
  };

  const atualizarStatusColetaPeriodo = (coletaId, novoStatus) => {
    setColetasPorPeriodo((prev) =>
      prev.map((coleta) =>
        coleta.id === coletaId
          ? { ...coleta, status_coleta_periodo: novoStatus }
          : coleta
      )
    );
  };

  const iniciarColeta = async () => {
    try {
      setLoading(true);

      // Simular criação das solicitações de coleta por período
      const coletasGeradas = gerarColetasPorPeriodo(
        formData.frequenciaColeta?.nome,
        formData.dataInicioColeta,
        formData.quantidadeColetasCiclo,
        formData.diasColeta,
        formData.diasPrazo
      );
      setColetasPorPeriodo(coletasGeradas);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      enqueueSnackbar(
        "Coleta iniciada! Solicitações de coleta por período foram criadas com sucesso.",
        {
          variant: "success",
        }
      );

      setFormData((prev) => ({
        ...prev,
        statusColetaIndicador: "Em Andamento", // Novo status para indicar que a lista deve aparecer
      }));

      setIniciarColetaDialogOpen(false);
      setSuccessDialogOpen(false); // Fecha o modal de sucesso após iniciar
      navigate("/coleta/lista");
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível iniciar a coleta.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    navigate("/coleta/lista");
  };


  const validatePeriodoReferencia = (frequenciaNome, valor) => {
    if (!frequenciaNome || !valor) return true; // Permite vazio ou se a frequência não estiver selecionada

    const nome = frequenciaNome.toLowerCase();
    let regex;

    switch (nome) {
      case "diário":
        regex = /^DIA\d{8}$/; // DIA + 8 dígitos (AAAA MM DD)
        break;
      case "semanal":
        regex = /^SEM\d{6}$/; // SEM + 4 dígitos do ano + 2 dígitos da semana
        break;
      case "quinzenal":
        regex = /^QUI\d{6}$/; // QUI + 4 dígitos do ano + 2 dígitos da quinzena (01 a 24)
        break;
      case "mensal":
        regex = /^MEN\d{6}$/; // MEN + 4 dígitos do ano + 2 dígitos do mês
        break;
      case "bimestral":
        regex = /^BIM\d{6}$/; // BIM + 4 dígitos do ano + 2 dígitos do bimestre (01 a 06)
        break;
      case "trimestral":
        regex = /^TRI\d{6}$/; // TRI + 4 dígitos do ano + 2 dígitos do trimestre (01 a 04)
        break;
      case "semestral":
        regex = /^SET\d{6}$/; // SET + 4 dígitos do ano + 2 dígitos do semestre (01 a 02)
        break;
      case "anual":
        regex = /^ANU\d{4}$/; // ANU + 4 dígitos do ano
        break;
      case "bienal":
        regex = /^BIE\d{6}$/; // BIE + 4 dígitos do ano inicial + 2 dígitos do ano final
        break;
      default:
        return true; // Sem validação para frequências desconhecidas
    }

    return regex.test(valor);
  };

  const [formData, setFormData] = useState({
    // Campos obrigatórios do modelo
    cicloPriorizacao: null,
    indicador: null,
    quantidadeColetasCiclo: 0,
    instrucaoColeta: "",

    // Novos campos da documentação do Excel
    codigo_metrica: "", // Max 10 chars, não pode repetir
    nome_metrica: "", // Não pode repetir
    descricao: "", // Descrição do indicador
    unidade_medida: null, // Seleção de unidades
    fator_emissao: null, // Fator de conversão
    fonte_dados: null, // Fonte de dados
    formula_calculo: "", // Fórmula (simples ou JSON/SQL)
    provedor_metrica: null, // Provedor dos dados (apenas 1)
    responsavel_metrica: null, // Responsável pela gestão (apenas 1)
    observacoes: "", // Descritivo (longo, max 500)

    // Meta
    nome_meta: "",
    tipo_meta: null, // Depende da tabela de tipos
    valor_meta: "", // Depende do tipo_meta
    prazo_meta: null, // Data final

    // Relacionamentos
    empresa: [], // Vários
    processo: [], // Vários
    departamento: [], // Vários
    risco: [], // Vários

    // Configuração da Coleta
    conexao_coleta: "off-line", // on-line / off-line
    coleta_tipo: "manual", // automático / manual (depende de conexao_coleta)
    natureza: "quantitativo", // quantitativo / qualitativo
    tempo_de_impacto: "leading", // leading / lagging
    coleta_continua: false, // Botão de coleta contínua (s/n)
    dataInicioColeta: new Date(), // Data de início da coleta
    envio_automatico: false, // Envio automático (s/n)
    frequenciaColeta: null, // Frequência de coleta
    periodoReferenciaColetaInicial: "", // Período de referência inicial
    diasColeta: 0, // Dias para criação e envio
    diasPrazo: 0, // Dias para prazo final

    // Valores a serem coletados
    valoresColeta: [],

    // Responsáveis (mantidos e ajustados)
    provedorResponsavel: null, // Provedor dos dados (vindo do indicador, mas pode ser alterado)
    revisores: [], // Responsáveis pela revisão (vários)
    auditores: [], // Responsáveis pela auditoria (vários)
    responsavel_coleta: null, // Responsável pela criação e conclusão (apenas um)
    files: [], // Arquivos anexos

    // Campo de status para controle da listagem
    statusColetaIndicador: "Não Iniciado", // Valores possíveis: "Não Iniciado", "Em Andamento", "Concluído"
  });

  // Lógica de validação do Período de Referência
  const isPeriodoReferenciaValid = useMemo(
    () =>
      validatePeriodoReferencia(
        formData.frequenciaColeta?.nome,
        formData.periodoReferenciaColetaInicial
      ),
    [formData.frequenciaColeta?.nome, formData.periodoReferenciaColetaInicial]
  );

  // Estado para controlar o erro de validação
  const [periodoReferenciaError, setPeriodoReferenciaError] = useState(false);

  useEffect(() => {
    setPeriodoReferenciaError(!isPeriodoReferenciaValid);
  }, [isPeriodoReferenciaValid]);

  const inputLabelCenteredSx = {
    "& .MuiInputLabel-root": {
      top: "50%",
      transform: "translate(14px, -50%)",
      transition: "all .2s ease",
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
      transform: "translate(14px, -9px) scale(0.75)",
      top: 0,
    },
  };

  const fieldSx = {
    ...inputLabelCenteredSx,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
  };

  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  // Em caso de edição
  useEffect(() => {
    if (coletaDados) {
      setRequisicao("Editar");
      setMensagemFeedback("editada");

      const findItem = (list, id, idField = 'id') => {
        if (!id) return null;
        return list.find(item => item[idField] === id) || { [idField]: id, name: `ID: ${id}`, active: true };
      };

      const mapItems = (list, ids, idField = 'id') => {
        if (!ids) return [];
        return ids.map(id => findItem(list, id, idField)).filter(Boolean);
      };

      setFormData({
        codigo_metrica: coletaDados.code || "",
        nome_metrica: coletaDados.name || "",
        unidade_medida: findItem(unidadesMedida, coletaDados.idMeasure),
        indicador: findItem(indicadores, coletaDados.idIndicator),
        fator_emissao: findItem(fatoresEmissaoOptions, coletaDados.idEmissionFactorESG),
        fonte_dados: findItem(fontesDadosOptions, coletaDados.idDataSource),
        descricao: coletaDados.description || "",
        formula_calculo: coletaDados.calcForm || "",
        provedor_metrica: coletaDados.metricProvider || "",
        provedorResponsavel: findItem(colaboradoresOptions, coletaDados.idMetricProviderResponsible, 'idCollaborator'),
        observacoes: coletaDados.metricProviderObservations || "",
        natureza: coletaDados.metricNature === 1 ? "quantitativo" : "qualitativo",
        tempo_de_impacto: coletaDados.impactTime === 1 ? "leading" : "lagging",
        nome_meta: coletaDados.metaName || "",
        tipo_meta: tiposMeta.find(t => t.id === coletaDados.metaType) || null,
        valor_meta: coletaDados.metaValue || "",
        prazo_meta: coletaDados.metaDeadline ? new Date(coletaDados.metaDeadline) : null,
        coleta_continua: coletaDados.collectContinuousActive || false,
        conexao_coleta: coletaDados.collectConnection === 1 ? "on-line" : "off-line",
        coleta_tipo: coletaDados.collectDeliveryMode === 1 ? "automático" : "manual",
        dataInicioColeta: coletaDados.collectInitDate ? new Date(coletaDados.collectInitDate) : new Date(),
        frequenciaColeta: frequenciasColeta.find(f => f.id === coletaDados.collectFrequency) || null,
        periodoReferenciaColetaInicial: coletaDados.collectInitialReference || "",
        diasColeta: coletaDados.collectDaysToCreateEvent || 0,
        diasPrazo: coletaDados.collectDaysToFinishEvent || 0,
        instrucaoColeta: coletaDados.collectInstructions || "",
        empresa: mapItems(empresasOptions, coletaDados.companyIds, 'idCompany'),
        departamento: mapItems(departamentosOptions, coletaDados.departmentIds, 'idDepartment'),
        processo: mapItems(processosOptions, coletaDados.processIds, 'idProcess'),
        risco: mapItems(riscosOptions, coletaDados.riskIds, 'idRisk'),
        revisores: mapItems(colaboradoresOptions, coletaDados.revisorIds, 'idCollaborator'),
        auditores: mapItems(colaboradoresOptions, coletaDados.auditorIds, 'idCollaborator'),
        valoresColeta: (coletaDados.valuesToBeCollected || []).map(v => ({
          ...v,
          idDimension: findItem(dimensoesOptions, v.idDimension)
        })),
        files: coletaDados.files || coletaDados.collectFilesAttached || coletaDados.collectFilesAttachedIds || [],
        statusColetaIndicador: coletaDados.active ? "Em Andamento" : "Não Iniciado"
      });
      setHasChanges(false);
    }
  }, [coletaDados, unidadesMedida, indicadores, fatoresEmissaoOptions, fontesDadosOptions, colaboradoresOptions, empresasOptions, departamentosOptions, processosOptions, riscosOptions, dimensoesOptions]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleMultiSelectChange = (field) => (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
    setHasChanges(true);
  };

  // Regra de Negócio: Atualizar campos automaticamente quando o indicador é selecionado
  useEffect(() => {
    if (formData.indicador) {
      const indicador = formData.indicador;
      const frequencia = frequenciasColeta.find(
        (f) => f.nome?.toLowerCase() === indicador.periodicidade?.toLowerCase()
      );
      const tipoColeta =
        indicador.conexao_coleta === "on-line" ? "automático" : "manual";
      const envioAuto =
        indicador.conexao_coleta === "on-line" || indicador.envio_automatico;

      setFormData((prev) => ({
        ...prev,
// codigo_metrica: indicador.codigo, // Removido por solicitação do usuário
// nome_metrica: indicador.nome, // Removido por solicitação do usuário
// unidade_medida: indicador.unidade_medida, // Removido por solicitação do usuário
        provedor_metrica: indicador.provedorMetrica,
        provedorResponsavel: indicador.provedorMetrica,
        quantidadeColetasCiclo: indicador.quantidadeColetas || 0,
        frequenciaColeta: frequencia || null,
        conexao_coleta: indicador.conexao_coleta,
        coleta_tipo: tipoColeta,
        natureza: indicador.natureza,
        tempo_de_impacto: indicador.tempo_de_impacto,
        coleta_continua: indicador.coleta_continua,
        envio_automatico: envioAuto,
        tipo_meta:
          tiposMeta.find((t) => t.nome.includes(indicador.tipo_meta)) || null,
        valor_meta: indicador.valor_meta || "",
        prazo_meta: indicador.prazo_meta || null,
      }));
    }
  }, [formData.indicador]);

  // Regra de Negócio: Recalcular o período de referência quando a frequência ou a data de início mudam
  useEffect(() => {
    const { frequenciaColeta, dataInicioColeta } = formData;
    if (frequenciaColeta && dataInicioColeta) {
      const periodo = calcularPeriodoReferenciaInicial(
        frequenciaColeta,
        dataInicioColeta
      );
      handleInputChange("periodoReferenciaColetaInicial", periodo);
    }
  }, [formData.frequenciaColeta, formData.dataInicioColeta]); // Mantido dataInicioColeta como dependência para cálculo correto, mas focado na frequência

  // Regra de Negócio: Desabilitar coleta_tipo manual se conexao_coleta for on-line
  useEffect(() => {
    if (formData.conexao_coleta === "on-line") {
      handleInputChange("coleta_tipo", "automático");
    }
  }, [formData.conexao_coleta]);

  // Regra de Negócio: Desabilitar coleta_continua se coleta_tipo for automático
  useEffect(() => {
    if (formData.coleta_tipo === "automático") {
      handleInputChange("coleta_continua", false);
    }
  }, [formData.coleta_tipo]);

  // Regra de Negócio: Desabilitar envio_automatico se coleta_tipo for automático
  useEffect(() => {
    if (formData.coleta_tipo === "automático") {
      handleInputChange("envio_automatico", false);
    }
  }, [formData.coleta_tipo]);

  // Adicionar novo valor para coleta (Mantido do modelo)
  const adicionarValorColeta = () => {
    const novoId = formData.valoresColeta.length > 0 ? Math.max(...formData.valoresColeta.map(v => v.id)) + 1 : 1;
    const novoValor = {
      id: novoId,
      descricaoValor: "",
      idDimension: null,
      valor_obrigatorio: "não",
    };

    setFormData((prev) => ({
      ...prev,
      valoresColeta: [...prev.valoresColeta, novoValor],
    }));
    setHasChanges(true);
  };

  // Remover valor da coleta (Mantido do modelo)
  const removerValorColeta = (valorId) => {
    setFormData((prev) => ({
      ...prev,
      valoresColeta: prev.valoresColeta.filter((valor) => valor.id !== valorId),
    }));
    setHasChanges(true);
  };

  // Atualizar valor específico da coleta (Ajustado para novos campos)
  const atualizarValorColeta = (valorId, campo, novoValor) => {
    setFormData((prev) => ({
      ...prev,
      valoresColeta: prev.valoresColeta.map((valor) =>
        valor.id === valorId ? { ...valor, [campo]: novoValor } : valor
      ),
    }));
    setHasChanges(true);
  };

  // Funções para modal de coleta por período (Mantidos do modelo)
  const abrirModalColetaPeriodo = (coleta) => {
    setColetaPeriodoSelecionada(coleta);

    // Inicializar dados do modal com base nos valores definidos na coleta principal
    const valoresIniciais = formData.valoresColeta.map((valor) => ({
      id: valor.id,
      tipoDimensao: valor.tipoDimensao,
      nomeDimensao: valor.nomeDimensao,
      descricaoValor: valor.descricaoValor,
      valorColetado: "",
    }));

    setDadosColetaPeriodo({
      valores: valoresIniciais,
      descricaoQualitativo: "",
      anexos: [],
      links: [],
      revisores: formData.revisores || [], // NOVO
      auditores: formData.auditores || [], // NOVO
      provedorResponsavel: formData.provedorResponsavel,
      comentarioRevisor: "",
      comentarioAuditor: "",
      dataConclusaoEfetiva: coleta.data_conclusao_efetiva, // Novo campo: data_conclusão_efetiva
      instrucaoColeta: formData.instrucaoColeta, // Novo campo: instrucao_coleta
    });

    setModalColetaPeriodoOpen(true);
  };

  const fecharModalColetaPeriodo = () => {
    setModalColetaPeriodoOpen(false);
    setColetaPeriodoSelecionada(null);
  };

  // ==============================|| FUNÇÕES DE VALIDAÇÃO E SUBMISSÃO ||============================== //

  const isFormValid = useMemo(() => {
    return (
      formData.codigo_metrica &&
      formData.nome_metrica &&
      formData.unidade_medida &&
      formData.indicador &&
      formData.provedorResponsavel &&
      formData.empresa.length > 0 &&
      formData.processo.length > 0 &&
      formData.departamento.length > 0 &&
      formData.risco.length > 0 &&
      formData.revisores.length > 0 &&
      formData.auditores.length > 0 &&
      formData.frequenciaColeta &&
      formData.valoresColeta.length > 0 &&
      formData.dataInicioColeta
    );
  }, [
    formData.codigo_metrica,
    formData.nome_metrica,
    formData.unidade_medida,
    formData.indicador,
    formData.provedorResponsavel,
    formData.empresa,
    formData.processo,
    formData.departamento,
    formData.risco,
    formData.revisores,
    formData.auditores,
    formData.frequenciaColeta,
    formData.valoresColeta,
    formData.dataInicioColeta,
  ]);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (requisicao === "Criar") return isFormValid;
    return isFormValid && hasChanges;
  }, [loading, requisicao, isFormValid, hasChanges]);

  const validateForm = () => {
    let isValid = true;
    const newValidation = {};

    if (!formData.codigo_metrica) {
      newValidation.codigo_metrica = false;
      isValid = false;
    }
    if (!formData.nome_metrica) {
      newValidation.nome_metrica = false;
      isValid = false;
    }
    if (!formData.unidade_medida) {
      newValidation.unidade_medida = false;
      isValid = false;
    }
    if (!formData.indicador) {
      newValidation.indicador = false;
      isValid = false;
    }

    setFormValidation(newValidation);
    return isValid;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      enqueueSnackbar("Preencha todos os campos obrigatórios.", { variant: "error" });
      return;
    }

    try {
      setLoading(true);

      // --- Lógica de arquivos (containerFolder 12) ---
      const metricsFiles = formData.files || [];
      const newFiles = metricsFiles.filter((file) => file instanceof File);
      const existingFiles = metricsFiles.filter((file) => !(file instanceof File));

      let uploadFilesResult = { files: [] };
      if (newFiles.length > 0) {
        const formDataUpload = new FormData();
        formDataUpload.append("ContainerFolder", 12);
        formDataUpload.append(
          "IdContainer",
          requisicao === "Editar" ? id : ""
        );
        newFiles.forEach((file) => {
          formDataUpload.append("Files", file, file.name);
        });

        const uploadResponse = await axios.post(
          `${API_URL}files/uploads`,
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

      // Combina arquivos existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      const payload = {
        code: formData.codigo_metrica || null,
        name: formData.nome_metrica || null,
        idMeasure: formData.unidade_medida?.id || null,
        idIndicator: formData.indicador?.id || null,
        idEmissionFactorESG: formData.fator_emissao?.id || null,
        idDataSource: formData.fonte_dados?.id || null,
        description: formData.descricao || null,
        calcForm: formData.formula_calculo || null,
        metricProvider: formData.provedor_metrica || null,
        idMetricProviderResponsible: formData.provedorResponsavel?.idCollaborator || null,
        metricProviderObservations: formData.observacoes || null,
        metricNature: formData.natureza === "quantitativo" ? 1 : 2,
        impactTime: formData.tempo_de_impacto === "leading" ? 1 : 2,
        metaName: formData.nome_meta || null,
        metaType: formData.tipo_meta?.id || 1,
        metaValue: formData.valor_meta || null,
        metaDeadline: formData.prazo_meta ? formData.prazo_meta.toISOString() : null,
        collectContinuousActive: formData.coleta_continua || false,
        collectConnection: formData.conexao_coleta === "on-line" ? 1 : 2,
        collectDeliveryMode: formData.coleta_tipo === "automático" ? 1 : 2,
        collectInitDate: formData.dataInicioColeta ? formData.dataInicioColeta.toISOString() : null,
        collectFrequency: formData.frequenciaColeta?.id || 1,
        collectInitialReference: formData.periodoReferenciaColetaInicial || null,
        collectDaysToCreateEvent: Number(formData.diasColeta) || 0,
        collectDaysToFinishEvent: Number(formData.diasPrazo) || 0,
        collectInstructions: formData.instrucaoColeta || null,
        collectFilesAttachedIds: finalFilesPayload,
        companyIds: formData.empresa.map(i => i.idCompany || i.id),
        departmentIds: formData.departamento.map(i => i.idDepartment || i.id),
        processIds: formData.processo.map(i => i.idProcess || i.id),
        riskIds: formData.risco.map(i => i.idRisk || i.id),
        revisorIds: formData.revisores.map(i => i.idCollaborator || i.id),
        auditorIds: formData.auditores.map(i => i.idCollaborator || i.id),
        valuesToBeCollected: formData.valoresColeta.map(v => ({
          idDimension: v.idDimension?.id || v.idDimension,
          description: v.descricaoValor,
          required: v.valor_obrigatorio === "sim"
        }))
      };

      if (requisicao === "Criar") {
        payload.active = true;
        await axios.post(`${API_URL}MetricsWithCollector`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        payload.id = id;
        payload.active = true;
        await axios.put(`${API_URL}MetricsWithCollector`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      enqueueSnackbar(`Métrica ${mensagemFeedback} com sucesso!`, { variant: "success" });
      setHasChanges(false);
      
      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(`Erro ao salvar métrica: ${error.response?.data?.message || error.message}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ==============================|| RENDERIZAÇÃO ||============================== //

  return (
    <>
      <LoadingOverlay open={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={3}>

            {/* ==============================|| SEÇÃO 1: CONFIGURAÇÃO DA MÉTRICA ||============================== */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    1. Configuração da Métrica
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Código da Métrica (Preenchido pelo Indicador) */}
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>Código da Métrica *</InputLabel>
                        <TextField
                          fullWidth
                          value={formData.codigo_metrica}
                          onChange={(e) =>
                            handleInputChange("codigo_metrica", e.target.value)
                          }
                          error={!formData.codigo_metrica && formValidation.codigo_metrica === false}
                          helperText={(!formData.codigo_metrica && formValidation.codigo_metrica === false) ? "Campo obrigatório" : "Máx. 10 caracteres, não pode repetir"}
                        />
                      </Stack>
                    </Grid>

                    {/* Nome da Métrica (Preenchido pelo Indicador) */}
                    <Grid item xs={12} md={5}>
                      <Stack spacing={1}>
                        <InputLabel>Nome da Métrica *</InputLabel>
                        <TextField
                          fullWidth
                          value={formData.nome_metrica}
                          onChange={(e) =>
                            handleInputChange("nome_metrica", e.target.value)
                          }
                          error={!formData.nome_metrica && formValidation.nome_metrica === false}
                          helperText={(!formData.nome_metrica && formValidation.nome_metrica === false) ? "Campo obrigatório" : "Não pode repetir"}
                        />
                      </Stack>
                    </Grid>

                    {/* Unidade de Medida (Preenchido pelo Indicador) */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>Unidade de Medida *</InputLabel>
                        <Autocomplete
                          options={unidadesMedida.filter(item => item.active !== false)}
                          getOptionLabel={(option) => option.name || option.nome || ""}
                          onChange={(event, newValue) =>
                            handleInputChange("unidade_medida", newValue)
                          }
                          value={unidadesMedida.find(u => u.id === formData.unidade_medida?.id) || formData.unidade_medida}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              error={!formData.unidade_medida && formValidation.unidade_medida === false}
                              placeholder="Unidade de medida"
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        />
                      </Stack>
                    </Grid>

                    {/* Descrição do Indicador */}
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel>Descrição da métrica</InputLabel>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={formData.descricao}
                          onChange={(e) =>
                            handleInputChange("descricao", e.target.value)
                          }
                          placeholder="Descrição, para que serve, fórmulas, etc."
                        />
                      </Stack>
                    </Grid>

                    {/* Indicador */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>Indicador *</InputLabel>
                        <Autocomplete
                          options={indicadores.filter(item => item.active !== false)}
                          getOptionLabel={(option) => {
                            const code = option.indicatorCode || option.codigo || "";
                            const name = option.indicatorName || option.nome || "";
                            if (code && name) return `${code} - ${name}`;
                            return code || name || "";
                          }}
                          value={indicadores.find(i => i.id === formData.indicador?.id) || formData.indicador}
                          onChange={(event, newValue) =>
                            handleInputChange("indicador", newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              error={
                                !formData.indicador &&
                                formValidation.indicador === false
                              }
                              placeholder="Selecione o indicador"
                              helperText="Apenas um indicador por ciclo"
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        />
                      </Stack>
                    </Grid>

                    {/* Fator de Emissão */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>Fator de Emissão (Conversão)</InputLabel>
                        <Autocomplete
                          options={fatoresEmissaoOptions.filter(item => item.active !== false)}
                          getOptionLabel={(option) => {
                            const name = option.emissionFactorESGName || option.emissionFactorName || option.name || "";
                            const unit = option.originUnitName || option.unit || "";
                            if (name && unit) return `${name} (${unit})`;
                            return name || unit || "";
                          }}
                          value={fatoresEmissaoOptions.find(f => f.id === formData.fator_emissao?.id) || formData.fator_emissao}
                          onChange={(event, newValue) =>
                            handleInputChange("fator_emissao", newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione o fator de conversão"
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        />
                      </Stack>
                    </Grid>

                    {/* Fonte de Dados */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>Fonte de Dados</InputLabel>
                        <Autocomplete
                          options={fontesDadosOptions.filter(item => item.active !== false)}
                          getOptionLabel={(option) => option.dataSourceName || option.nome || ""}
                          value={fontesDadosOptions.find(f => f.id === formData.fonte_dados?.id) || formData.fonte_dados}
                          onChange={(event, newValue) =>
                            handleInputChange("fonte_dados", newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione a fonte de dados"
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        />
                      </Stack>
                    </Grid>

                    {/* Fórmula de Cálculo */}
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel>Fórmula de Cálculo</InputLabel>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={formData.formula_calculo}
                          onChange={(e) =>
                            handleInputChange("formula_calculo", e.target.value)
                          }
                          placeholder="Ex: ((number_of_canceled_clients / total_clients_beginning_of_month) * 100) ou JSON/SQL"
                        />
                      </Stack>
                    </Grid>

                    {/* Provedor da Métrica (Preenchido pelo Indicador) */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>
                          Provedor da Métrica (Dono do Dado)
                        </InputLabel>
                        <Autocomplete
                          options={colaboradoresOptions.filter(item => item.active !== false)}
                          getOptionLabel={(option) => {
                            const name = option.name || "";
                            const dept = option.departmentName || option.departamento || "";
                            return dept ? `${name} (${dept})` : name;
                          }}
                          value={colaboradoresOptions.find(c => c.idCollaborator === formData.provedor_metrica?.idCollaborator) || formData.provedor_metrica}
                          disabled
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Provedor dos dados do indicador"
                            />
                          )}
                          isOptionEqualToValue={(option, value) => (option?.idCollaborator || option?.id) === (value?.idCollaborator || value?.id)}
                        />
                      </Stack>
                    </Grid>

                    {/* Responsável pela Gestão da Métrica */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>
                          Responsável pela Gestão da Métrica
                        </InputLabel>
                        <Autocomplete
                          options={colaboradoresOptions.filter(item => item.active !== false)}
                          getOptionLabel={(option) => {
                            const name = option.name || "";
                            const dept = option.departmentName || option.departamento || "";
                            return dept ? `${name} (${dept})` : name;
                          }}
                          value={colaboradoresOptions.find(c => c.idCollaborator === formData.provedorResponsavel?.idCollaborator) || formData.provedorResponsavel}
                          onChange={(event, newValue) =>
                            handleInputChange("provedorResponsavel", newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Responsável pela gestão"
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option?.idCollaborator === value?.idCollaborator}
                        />
                      </Stack>
                    </Grid>

                    {/* Observações */}
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel>Observações</InputLabel>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={formData.observacoes}
                          onChange={(e) =>
                            handleInputChange("observacoes", e.target.value)
                          }
                          inputProps={{ maxLength: 500 }}
                          helperText={`${formData.observacoes.length}/500 caracteres`}
                        />
                      </Stack>
                    </Grid>

                    {/* Natureza */}
                    <Grid item xs={12} md={4}>
                      <FormLabel component="legend">Natureza</FormLabel>
                      <RadioGroup
                        row
                        name="natureza"
                        value={formData.natureza}
                        onChange={(e) =>
                          handleInputChange("natureza", e.target.value)
                        }
                      >
                        <FormControlLabel
                          value="quantitativo"
                          control={<Radio />}
                          label="Quantitativo"
                        />
                        <FormControlLabel
                          value="qualitativo"
                          control={<Radio />}
                          label="Qualitativo"
                        />
                      </RadioGroup>
                    </Grid>

                    {/* Tempo de Impacto */}
                    <Grid item xs={12} md={4}>
                      <FormLabel component="legend">Tempo de Impacto</FormLabel>
                      <RadioGroup
                        row
                        name="tempo_de_impacto"
                        value={formData.tempo_de_impacto}
                        onChange={(e) =>
                          handleInputChange("tempo_de_impacto", e.target.value)
                        }
                      >
                        <FormControlLabel
                          value="leading"
                          control={<Radio />}
                          label="Leading (Futuro)"
                        />
                        <FormControlLabel
                          value="lagging"
                          control={<Radio />}
                          label="Lagging (Passado)"
                        />
                      </RadioGroup>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* ==============================|| SEÇÃO 2: METAS ||============================== */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
                    2. Meta
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Nome da Meta */}
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>Nome da Meta</InputLabel>
                        <TextField
                          fullWidth
                          value={formData.nome_meta}
                          onChange={(e) =>
                            handleInputChange("nome_meta", e.target.value)
                          }
                          placeholder="Ex: Redução de Consumo de Água"
                        />
                      </Stack>
                    </Grid>

                    {/* Tipo de Meta */}
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>Tipo de Meta</InputLabel>
                        <Autocomplete
                          options={tiposMeta.filter(item => item.active !== false)}
                          getOptionLabel={(option) => option.nome || option.name || ""}
                          value={formData.tipo_meta}
                          onChange={(event, newValue) => {
                            handleInputChange("tipo_meta", newValue);
                            // Regra: Se for Qualitativa ou Neutra, o valor deve ser tratado como texto
                            if (
                              newValue &&
                              (newValue.nome?.includes("Qualitativa") ||
                                newValue.nome?.includes("Neutra"))
                            ) {
                              handleInputChange("valor_meta", ""); // Limpa o valor anterior
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione o tipo"
                            />
                          )}
                        />
                      </Stack>
                    </Grid>

                    {/* Valor da Meta (Depende do Tipo) */}
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>Valor da Meta</InputLabel>
                        <TextField
                          fullWidth
                          type={
                            formData.tipo_meta?.nome.includes("Qualitativa") ||
                            formData.tipo_meta?.nome.includes("Neutra")
                              ? "text"
                              : "number"
                          }
                          value={formData.valor_meta}
                          onChange={(e) =>
                            handleInputChange("valor_meta", e.target.value)
                          }
                          placeholder={
                            formData.tipo_meta?.nome.includes("Qualitativa") ||
                            formData.tipo_meta?.nome.includes("Neutra")
                              ? "Descrição/Texto"
                              : "Valor numérico ou percentual"
                          }
                          disabled={!formData.tipo_meta}
                          // Regra: O campo é alfanumérico se o tipo for Qualitativa ou Neutra
                          inputProps={{
                            inputMode:
                              formData.tipo_meta?.nome.includes(
                                "Qualitativa"
                              ) || formData.tipo_meta?.nome.includes("Neutra")
                                ? "text"
                                : "numeric",
                            pattern:
                              formData.tipo_meta?.nome.includes(
                                "Qualitativa"
                              ) || formData.tipo_meta?.nome.includes("Neutra")
                                ? undefined
                                : "[0-9]*",
                          }}
                        />
                      </Stack>
                    </Grid>

                    {/* Prazo da Meta */}
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <InputLabel>Prazo para Atendimento da Meta</InputLabel>
                        <LocalizationProvider
                          dateAdapter={AdapterDateFns}
                          locale={ptBR}
                        >
                          <DatePicker
                            value={formData.dataInicioColeta}
                            onChange={(newValue) =>
                              handleInputChange("dataInicioColeta", newValue)
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Selecione a data de início"
                              />
                            )}
                            format="dd/MM/yyyy" // Adicionado para forçar o formato PT-BR
                          />
                        </LocalizationProvider>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* ==============================|| SEÇÃO 3: RELACIONAMENTOS ||============================== */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
                    3. Relacionamentos
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Empresas */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>Empresas</InputLabel>
                        <Autocomplete
                          multiple
                          options={empresasOptions.filter(item => item.active !== false)}
                          getOptionLabel={(option) => option.companyName || option.name || option.nome || ""}
                          value={formData.empresa}
                          onChange={handleMultiSelectChange("empresa")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione as empresas"
                            />
                          )}
                          isOptionEqualToValue={(option, value) => (option?.idCompany || option?.id) === (value?.idCompany || value?.id)}
                        />
                      </Stack>
                    </Grid>

                    {/* Processos */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>Processos</InputLabel>
                        <Autocomplete
                          multiple
                          options={processosOptions.filter(item => item.active !== false)}
                          getOptionLabel={(option) => option.processName || option.name || option.nome || ""}
                          value={formData.processo}
                          onChange={handleMultiSelectChange("processo")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione os processos"
                            />
                          )}
                          isOptionEqualToValue={(option, value) => (option?.idProcess || option?.id) === (value?.idProcess || value?.id)}
                        />
                      </Stack>
                    </Grid>

                    {/* Departamentos */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>Departamentos</InputLabel>
                        <Autocomplete
                          multiple
                          options={departamentosOptions.filter(item => item.active !== false)}
                          getOptionLabel={(option) => option.departmentName || option.name || option.nome || ""}
                          value={formData.departamento}
                          onChange={handleMultiSelectChange("departamento")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione os departamentos"
                            />
                          )}
                          isOptionEqualToValue={(option, value) => (option?.idDepartment || option?.id) === (value?.idDepartment || value?.id)}
                        />
                      </Stack>
                    </Grid>

                    {/* Riscos */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>Riscos</InputLabel>
                        <Autocomplete
                          multiple
                          options={riscosOptions.filter(item => item.active !== false)}
                          getOptionLabel={(option) => option.riskName || option.name || option.nome || ""}
                          value={formData.risco}
                          onChange={handleMultiSelectChange("risco")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione os riscos"
                            />
                          )}
                          isOptionEqualToValue={(option, value) => (option?.idRisk || option?.id) === (value?.idRisk || value?.id)}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* ==============================|| SEÇÃO 4: CONFIGURAÇÃO DA COLETA ||============================== */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
                    4. Configuração da Coleta
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Conexão da Coleta */}
                    <Grid item xs={12} md={4}>
                      <FormLabel component="legend">
                        Coleta Contínua
                      </FormLabel>
                      <RadioGroup
                        row
                        name="conexao_coleta"
                        value={formData.conexao_coleta}
                        onChange={(e) =>
                          handleInputChange("conexao_coleta", e.target.value)
                        }
                      >
                        <FormControlLabel
                          value="on-line"
                          control={<Radio />}
                          label="Inativa"
                        />
                        <FormControlLabel
                          value="off-line"
                          control={<Radio />}
                          label="Ativo"
                        />
                      </RadioGroup>
                    </Grid>

                    {/* Tipo de Coleta */}
                    <Grid item xs={12} md={4}>
                      <FormLabel component="legend">Conexão</FormLabel>
                      <RadioGroup
                        row
                        name="coleta_tipo"
                        value={formData.coleta_tipo}
                        onChange={(e) =>
                          handleInputChange("coleta_tipo", e.target.value)
                        }
                      >
                        <FormControlLabel
                          value="automático"
                          control={<Radio />}
                          label="Online"
                          disabled={formData.conexao_coleta === "on-line"}
                        />
                        <FormControlLabel
                          value="manual"
                          control={<Radio />}
                          label="Off-line"
                          disabled={formData.conexao_coleta === "on-line"}
                        />
                      </RadioGroup>
                      {formData.conexao_coleta === "on-line" && (
                        <Typography variant="caption" color="error">
                           Coleta Contínua deve estar ativa.
                        </Typography>
                      )}
                    </Grid>

                    {/* Envio Automático */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>Envio</InputLabel>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>Manual</Typography>
                          <Switch
                            checked={formData.envio_automatico}
                            onChange={(e) =>
                              handleInputChange(
                                "envio_automatico",
                                e.target.checked
                              )
                            }
                            name="envio_automatico"
                            disabled={formData.coleta_tipo === "automático"}
                          />
                          <Typography>Automático</Typography>
                        </Stack>
                        {formData.coleta_tipo === "automático" && (
                          <Typography variant="caption" color="error">
                            Desabilitado para conexão online.
                          </Typography>
                        )}
                      </Stack>
                    </Grid>

                    {/* Data de Início da Coleta */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>Data de Início da Coleta</InputLabel>
                        <DatePicker
                          value={formData.dataInicioColeta}
                          onChange={(newValue) =>
                            handleInputChange("dataInicioColeta", newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione a data de início"
                            />
                          )}
                        />
                      </Stack>
                    </Grid>

                    {/* Frequência de Coleta */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>Frequência de Coleta</InputLabel>
                        <Autocomplete
                          id="frequenciaColeta"
                          options={frequenciasColeta}
                          getOptionLabel={(option) => option.nome}
                          isOptionEqualToValue={(option, value) =>
                            option?.id === value?.id
                          }
                          value={formData.frequenciaColeta}
                          onChange={(event, newValue) =>
                            handleInputChange("frequenciaColeta", newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Selecione a frequência"
                            />
                          )}
                        />
                      </Stack>
                    </Grid>

                    {/* Período de Referência Inicial */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>Período de Referência Inicial</InputLabel>
                        <TextField
                          id="periodoReferenciaColetaInicial"
                          value={formData.periodoReferenciaColetaInicial || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "periodoReferenciaColetaInicial",
                              e.target.value.toUpperCase()
                            )
                          } // Converte para maiúsculas e permite edição
                          placeholder="Ex: MEN202501 (Preenchido automaticamente, mas editável)"
                          error={periodoReferenciaError}
                          helperText={
                            periodoReferenciaError
                              ? "Formato inválido. Siga o padrão da frequência selecionada (Ex: MEN202501)."
                              : "Ex: MEN202501 (Pode ser alterado, mas deve seguir o padrão)."
                          }
                        />
                      </Stack>
                    </Grid>

                    {/* Dias para Criação e Envio da Coleta */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>
                          Dias para Criação e Envio da Coleta
                        </InputLabel>
                        <TextField
                          id="diasColeta"
                          type="number"
                          value={formData.diasColeta || 0}
                          onChange={(e) =>
                            handleInputChange(
                              "diasColeta",
                              parseInt(e.target.value)
                            )
                          }
                          inputProps={{ min: 0 }}
                          helperText="Dias após o fechamento do período de referência"
                        />
                      </Stack>
                    </Grid>

                    {/* Dias para Prazo Final de Entrega */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>
                          Dias para Prazo Final de Entrega
                        </InputLabel>
                        <TextField
                          id="diasPrazo"
                          type="number"
                          value={formData.diasPrazo || 0}
                          onChange={(e) =>
                            handleInputChange(
                              "diasPrazo",
                              parseInt(e.target.value)
                            )
                          }
                          inputProps={{ min: 0 }}
                          helperText="Dias após a criação e envio da coleta"
                        />
                      </Stack>
                    </Grid>

                    {/* Instrução de Coleta */}
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel>Instrução de Coleta *</InputLabel>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={formData.instrucaoColeta}
                          onChange={(e) =>
                            handleInputChange("instrucaoColeta", e.target.value)
                          }
                          error={
                            !formData.instrucaoColeta &&
                            formValidation.instrucaoColeta === false
                          }
                          placeholder="Descreva o que e como os dados devem ser disponibilizados. Ex: informar nos respectivos campos, os funcionários por gênero e cargo"
                        />
                      </Stack>
                    </Grid>

                    {/* Anexos Modelo */}
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel>Anexos Modelo</InputLabel>
                        <FileUploader
                          containerFolder={12}
                          initialFiles={formData.files}
                          onFilesChange={(files) =>
                            setFormData((prev) => ({ ...prev, files }))
                          }
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* ==============================|| SEÇÃO 5: VALORES A SEREM COLETADOS ||============================== */}
            {formData.natureza === "quantitativo" && (
              // ── helpers de estilo: coloque perto dos seus imports/component ─────────────────

              // ── bloco da sua lista ────────────────────────────────────────────────────────
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ mb: 2, px: 2, pt: 2 }}
                  >
                    5. Valores a Serem Coletados (Métrica Quantitativa)
                  </Typography>

                  <CardContent sx={{ pt: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography variant="subtitle1">
                        Definir Valores para Coleta
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={adicionarValorColeta}
                        sx={{ borderRadius: 2 }}
                      >
                        Incluir Valor
                      </Button>
                    </Box>

                    {formData.valoresColeta.length === 0 ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: "center", py: 3 }}
                      >
                        Nenhum valor definido. Clique em &quot;Incluir
                        Valor&quot; para adicionar.
                      </Typography>
                    ) : (
                      <List disablePadding>
                        {formData.valoresColeta.map((valor, index) => {
                          const hasErrorDescricao =
                            formValidation[`valorColeta_${index}`] === false &&
                            !valor.descricaoValor;
                          const hasErrorTipo =
                            formValidation[`valorColeta_${index}`] === false &&
                            !valor.tipoDimensao;
                          const hasErrorNome =
                            formValidation[`valorColeta_${index}`] === false &&
                            !valor.nomeDimensao;

                          return (
                            <Card
                              key={valor.id}
                              sx={{
                                mb: 2,
                                p: 2,
                                border:
                                  formValidation[`valorColeta_${index}`] ===
                                  false
                                    ? "2px solid #ef5350"
                                    : "1px solid #e0e0e0",
                                boxShadow:
                                  formValidation[`valorColeta_${index}`] ===
                                  false
                                    ? "0 0 8px rgba(239, 83, 80, 0.5)"
                                    : "0 1px 3px rgba(0,0,0,0.08)",
                                transition: "box-shadow 0.25s",
                                "&:hover": {
                                  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                                },
                                borderRadius: 2,
                              }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                {/* Ícone e Descrição do Valor */}
                                <Grid item xs={12} md={4}>
                                  <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                  >
                                    <Badge
                                      badgeContent={index + 1}
                                      color="primary"
                                    >
                                      <CheckCircleOutlineIcon color="action" />
                                    </Badge>

                                    <TextField
                                      fullWidth
                                      label="Descrição do Valor *"
                                      value={valor.descricaoValor}
                                      onChange={(e) =>
                                        atualizarValorColeta(
                                          valor.id,
                                          "descricaoValor",
                                          e.target.value
                                        )
                                      }
                                      size="small"
                                      placeholder="Ex: Consumo de água em SP"
                                      error={!!hasErrorDescricao}
                                      helperText={
                                        hasErrorDescricao
                                          ? "Campo obrigatório"
                                          : ""
                                      }
                                      sx={fieldSx}
                                    />
                                  </Stack>
                                </Grid>

                                {/* Tipo Dimensão */}
                                <Grid item xs={12} md={4}>
                                  <Autocomplete
                                    options={dimensoesOptions.filter(item => item.active !== false)}
                                    getOptionLabel={(option) =>
                                      option?.dimensionName ?? option?.name ?? option?.nome ?? ""
                                    }
                                    value={dimensoesOptions.find(d => d.id === valor.idDimension?.id) || valor.idDimension}
                                    onChange={(_, newValue) => {
                                      atualizarValorColeta(
                                        valor.id,
                                        "idDimension",
                                        newValue
                                      );
                                    }}
                                    size="small"
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        label="Tipo Dimensão *"
                                        sx={fieldSx}
                                      />
                                    )}
                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                  />
                                </Grid>

                                {/* Valor Obrigatório e Ações */}
                                <Grid item xs={12} md={4}>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    justifyContent="flex-end"
                                    sx={{ height: "100%" }}
                                  >
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={
                                            valor.valor_obrigatorio === "sim"
                                          }
                                          onChange={(e) =>
                                            atualizarValorColeta(
                                              valor.id,
                                              "valor_obrigatorio",
                                              e.target.checked ? "sim" : "não"
                                            )
                                          }
                                          size="small"
                                          color="primary"
                                        />
                                      }
                                      label="Obrigatório"
                                      componentsProps={{
                                        typography: { variant: "caption" },
                                      }}
                                      sx={{ m: 0 }}
                                    />

                                    <Tooltip title="Remover valor">
                                      <IconButton
                                        color="error"
                                        onClick={() =>
                                          removerValorColeta(valor.id)
                                        }
                                        aria-label="remover valor"
                                        size="small"
                                        sx={{ borderRadius: 2 }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Card>
                          );
                        })}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Seção: Responsáveis pela Coleta */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
                    6. Revisores da coleta
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Revisores */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>Revisor(es)</InputLabel>
                        <Autocomplete
                          multiple
                          options={colaboradoresOptions.filter(item => item.active !== false)}
                          getOptionLabel={(option) => {
                            const name = option.name || "";
                            const dept = option.departmentName || option.departamento || "";
                            if (name && dept) return `${name} (${dept})`;
                            return name || dept || "";
                          }}
                          value={formData.revisores}
                          onChange={handleMultiSelectChange("revisores")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Adicionar um ou mais revisores"
                            />
                          )}
                          helperText="O revisor não pode alterar campos, apenas comentar em caso de recusa."
                          isOptionEqualToValue={(option, value) => (option?.idCollaborator || option?.id) === (value?.idCollaborator || value?.id)}
                        />
                      </Stack>
                    </Grid>

                    {/* Auditores */}
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <InputLabel>Auditor(es)</InputLabel>
                        <Autocomplete
                          multiple
                          options={colaboradoresOptions.filter(item => item.active !== false)}
                          getOptionLabel={(option) => {
                            const name = option.name || "";
                            const dept = option.departmentName || option.departamento || "";
                            if (name && dept) return `${name} (${dept})`;
                            return name || dept || "";
                          }}
                          value={formData.auditores}
                          onChange={handleMultiSelectChange("auditores")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Adicionar um ou mais auditores"
                            />
                          )}
                          helperText="O auditor não pode alterar campos, apenas comentar em caso de recusa."
                          isOptionEqualToValue={(option, value) => (option?.idCollaborator || option?.id) === (value?.idCollaborator || value?.id)}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Seção: Solicitações de Coleta por Período (Listagem) */}
            {formData.statusColetaIndicador === "Em Andamento" &&
              coletasPorPeriodo.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Solicitações de Coleta por Período
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Lista de Coletas por Período (
                          {coletasPorPeriodo.length} coletas)
                        </Typography>

                        <List>
                          {coletasPorPeriodo.map((coleta) => {
                            const statusObj = statusColetaPeriodo.find(
                              (s) => s.nome === coleta.status_coleta_periodo
                            );
                            return (
                              <ListItem key={coleta.id} divider>
                                <ListItemText
                                  primary={
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Badge
                                        sx={{
                                          "& .MuiBadge-badge": {
                                            backgroundColor:
                                              statusObj?.cor || "#9e9e9e",
                                            color: "white",
                                            fontSize: "0.75rem",
                                            height: "20px",
                                            minWidth: "20px",
                                            marginRight: 1,
                                          },
                                        }}
                                        badgeContent=" "
                                        variant="dot"
                                      />
                                      <Typography
                                        variant="body1"
                                        fontWeight="medium"
                                      >
                                        Período:{" "}
                                        {coleta.periodo_referencia_coleta}
                                      </Typography>
                                    </Box>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Status: {coleta.status_coleta_periodo}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Data Limite:{" "}
                                        {format(
                                          coleta.data_limite_coleta,
                                          "dd/MM/yyyy"
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Data Envio:{" "}
                                        {format(
                                          coleta.data_envio_coleta,
                                          "dd/MM/yyyy"
                                        )}
                                      </Typography>
                                    </Box>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<EditIcon />}
                                      onClick={() =>
                                        abrirModalColetaPeriodo(coleta)
                                      }
                                    >
                                      Editar
                                    </Button>
                                    {coleta.status_coleta_periodo !==
                                      "Concluída" && (
                                      <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={obterIconeAcao(
                                          coleta.status_coleta_periodo
                                        )}
                                        onClick={() =>
                                          atualizarStatusColetaPeriodo(
                                            coleta.id,
                                            obterProximoStatus(
                                              coleta.status_coleta_periodo
                                            )
                                          )
                                        }
                                        color={
                                          coleta.status_coleta_periodo ===
                                          "Em Revisão"
                                            ? "success"
                                            : "primary"
                                        }
                                      >
                                        {obterTextoAcao(
                                          coleta.status_coleta_periodo
                                        )}
                                      </Button>
                                    )}
                                  </Box>
                                </ListItemSecondaryAction>
                              </ListItem>
                            );
                          })}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

            {/* Botões de Ação */}
            <Grid item xs={12}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/coleta/lista")}
                  size="large"
                >
                  Cancelar
                </Button>

                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* Botão Iniciar Coleta: aparece se for Criar e o status for Não Iniciado */}
                  {formData.statusColetaIndicador === "Não Iniciado" &&
                    requisicao === "Criar" && (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => setIniciarColetaDialogOpen(true)}
                        size="large"
                        disabled={!canSubmit}
                      >
                        Iniciar Coleta
                      </Button>
                    )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!canSubmit}
                  >
                    {requisicao === "Criar"
                      ? "Cadastrar Coleta"
                      : "Salvar Alterações"}
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Dialog de Sucesso */}
            <Dialog
              open={successDialogOpen}
              onClose={() => setSuccessDialogOpen(false)}
            >
              <DialogTitle>
                <Box display="flex" alignItems="center">
                  <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
                  Coleta Cadastrada com Sucesso!
                </Box>
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  A coleta foi cadastrada com sucesso. Deseja iniciar a coleta
                  agora ou voltar para a listagem?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={voltarParaListagem} color="primary">
                  Voltar para Listagem
                </Button>
                <Button
                  onClick={() => setIniciarColetaDialogOpen(true)}
                  color="primary"
                  variant="contained"
                >
                  Iniciar Coleta Agora
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog de Confirmação de Início de Coleta */}
            <Dialog
              open={iniciarColetaDialogOpen}
              onClose={() => setIniciarColetaDialogOpen(false)}
            >
              <DialogTitle>Confirmação de Início de Coleta</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Ao iniciar a coleta, as {coletasPorPeriodo.length}{" "}
                  solicitações de coleta por período serão criadas e o status da
                  coleta será alterado para "Em Andamento". Deseja prosseguir?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIniciarColetaDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={iniciarColeta}
                  color="primary"
                  variant="contained"
                >
                  Confirmar Início
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Box>

        {/* Modal de Coleta por Período (Mantido do modelo) */}
        <Dialog
          open={modalColetaPeriodoOpen}
          onClose={fecharModalColetaPeriodo}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Coleta de Dados:{" "}
            {coletaPeriodoSelecionada?.periodo_referencia_coleta || "Período"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Preencha os dados quantitativos e/ou qualitativos para o período
              de referência.
            </DialogContentText>

            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* 1) Instrução de Coleta */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Instrução de Coleta
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Instrução de Coleta"
                    value={dadosColetaPeriodo.instrucaoColeta}
                    disabled
                    helperText="Descreve o quê e como os dados devem ser disponibilizados."
                  />
                </CardContent>
              </Card>

              {/* 2) Metadados da Coleta */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Metadados da Coleta
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel shrink>Versão da Coleta</InputLabel>
                        <TextField
                          fullWidth
                          value={
                            coletaPeriodoSelecionada?.versao_coleta || "N/A"
                          }
                          disabled
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel shrink>
                          Data de Conclusão Efetiva
                        </InputLabel>
                        <DatePicker
                          value={dadosColetaPeriodo.dataConclusaoEfetiva}
                          onChange={(newValue) =>
                            setDadosColetaPeriodo((prev) => ({
                              ...prev,
                              dataConclusaoEfetiva: newValue,
                            }))
                          }
                          renderInput={(params) => (
                            <TextField {...params} fullWidth size="small" />
                          )}
                          disabled
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel shrink>Log de Atividades</InputLabel>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value="Log de atividades simulado..."
                          disabled
                          size="small"
                          InputProps={{ readOnly: true }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* 3) Corpo da Coleta (Quantitativo / Qualitativo) */}
              {formData.natureza === "quantitativo" && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Valores Quantitativos
                    </Typography>
                    <Grid container spacing={2}>
                      {dadosColetaPeriodo.valores.map((valor, index) => (
                        <Grid item xs={12} md={6} key={valor.id}>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2">
                              {valor.descricaoValor} ({valor.tipoDimensao?.nome}{" "}
                              — {valor.nomeDimensao?.nome})
                            </Typography>

                            <Grid container spacing={1} alignItems="center">
                              {/* Valor */}
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  inputMode="decimal"
                                  label={`Valor (${formData.unidade_medida?.nome})`}
                                  value={valor.valorColetado}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    const novos = [
                                      ...dadosColetaPeriodo.valores,
                                    ];
                                    novos[index].valorColetado = v;
                                    novos[index].valorConvertido =
                                      formData.fator_emissao
                                        ? v * formData.fator_emissao.valor
                                        : null;
                                    setDadosColetaPeriodo((prev) => ({
                                      ...prev,
                                      valores: novos,
                                    }));
                                  }}
                                  size="small"
                                />
                              </Grid>

                              {/* Valor Convertido */}
                              {formData.fator_emissao && (
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    fullWidth
                                    label={`Valor Convertido (${formData.fator_emissao.unidade})`}
                                    value={valor.valorConvertido ?? "N/A"}
                                    disabled
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                  />
                                </Grid>
                              )}

                              {/* Justificativa obrigatória */}
                              <Grid item xs={12} sm={4}>
                                {(valor.valorColetado === "" ||
                                  Number(valor.valorColetado) === 0) &&
                                  valor.valor_obrigatorio === "sim" && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color="warning"
                                      fullWidth
                                    >
                                      Justificativa (Obrigatório)
                                    </Button>
                                  )}
                              </Grid>
                            </Grid>
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={12} mt={2}>
                    <Stack spacing={1}>
                      <InputLabel>Descrição qualitativa</InputLabel>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={6}
                        value={dadosColetaPeriodo.descricaoQualitativo}
                        onChange={(e) =>
                          setDadosColetaPeriodo((prev) => ({
                            ...prev,
                            descricaoQualitativo: e.target.value,
                          }))
                        }
                        />
                     
                    </Stack>
                  </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {formData.natureza === "qualitativo" && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Descrição Qualitativa
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Descrição Qualitativa"
                      value={dadosColetaPeriodo.descricaoQualitativo}
                      onChange={(e) =>
                        setDadosColetaPeriodo((prev) => ({
                          ...prev,
                          descricaoQualitativo: e.target.value,
                        }))
                      }
                      placeholder="Insira a descrição qualitativa da coleta."
                    />
                  </CardContent>
                </Card>
              )}

              {/* 4) Evidências */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Evidências
                  </Typography>
                  <Stack spacing={2}>
                    <Button variant="outlined" startIcon={<AddIcon />}>
                      Adicionar Anexo
                    </Button>
                    <TextField
                      fullWidth
                      label="Links de Referência (separados por vírgula)"
                      value={dadosColetaPeriodo.links.join(", ")}
                      onChange={(e) =>
                        setDadosColetaPeriodo((prev) => ({
                          ...prev,
                          links: e.target.value.split(",").map((l) => l.trim()),
                        }))
                      }
                      size="small"
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* 5) Comentário do Revisor */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revisão
                  </Typography>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <InputLabel>Revisor(es) do Período</InputLabel>
                      <Autocomplete
                        multiple
                        options={colaboradoresOptions.filter(item => item.active !== false)}
                        getOptionLabel={(option) => {
                          const name = option.name || "";
                          const dept = option.departmentName || option.departamento || "";
                          return dept ? `${name} (${dept})` : name;
                        }}
                        value={dadosColetaPeriodo.revisores}
                        onChange={(_, newValue) =>
                          setDadosColetaPeriodo((prev) => ({
                            ...prev,
                            revisores: newValue,
                          }))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Adicionar revisor(es)"
                          />
                        )}
                        disableCloseOnSelect
                        isOptionEqualToValue={(option, value) => (option?.idCollaborator || option?.id) === (value?.idCollaborator || value?.id)}
                      />
                    </Stack>
                  </Grid>

                  {/* Auditores (por período) */}
                  <Grid item xs={12} md={6} mt={2}>
                    <Stack spacing={1}>
                      <InputLabel>Auditor(es) do Período</InputLabel>
                      <Autocomplete
                        multiple
                        options={colaboradoresOptions.filter(item => item.active !== false)}
                        getOptionLabel={(option) => {
                          const name = option.name || "";
                          const dept = option.departmentName || option.departamento || "";
                          return dept ? `${name} (${dept})` : name;
                        }}
                        value={dadosColetaPeriodo.auditores}
                        onChange={(_, newValue) =>
                          setDadosColetaPeriodo((prev) => ({
                            ...prev,
                            auditores: newValue,
                          }))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Adicionar auditor(es)"
                          />
                        )}
                        disableCloseOnSelect
                        isOptionEqualToValue={(option, value) => (option?.idCollaborator || option?.id) === (value?.idCollaborator || value?.id)}
                      />
                    </Stack>
                  </Grid>

                  {/* Comentário do Revisor */}
                  <Grid item xs={12} mt={2}>
                    <Stack spacing={1}>
                      <InputLabel>Comentário do Revisor</InputLabel>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={6}
                        value={dadosColetaPeriodo.comentarioRevisor}
                        onChange={(e) =>
                          setDadosColetaPeriodo((prev) => ({
                            ...prev,
                            comentarioRevisor: e.target.value,
                          }))
                        }
                        placeholder="Obrigatório quando a coleta for recusada (retornada ao testador)."
                      />
                     
                    </Stack>
                  </Grid>
                  {/* Comentário do Revisor */}
                  <Grid item xs={12} mt={2}>
                    <Stack spacing={1}>
                      <InputLabel>Comentário do Auditor</InputLabel>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={6}
                        value={dadosColetaPeriodo.comentarioAuditor}
                        onChange={(e) =>
                          setDadosColetaPeriodo((prev) => ({
                            ...prev,
                            comentarioAuditor: e.target.value,
                          }))
                        }
                      />
                    </Stack>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={fecharModalColetaPeriodo}>Cancelar</Button>
            <Button
              onClick={() => {
                /* Simulação de salvar */ fecharModalColetaPeriodo();
                enqueueSnackbar("Dados salvos no modal (simulação).", {
                  variant: "info",
                });
              }}
              variant="contained"
              startIcon={<CheckIcon />}
            >
              Salvar Coleta
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

// Adiciona a listagem de gestão de coleta logo abaixo do componente principal
function NovaColetaComRegrasComListagem(props) {
    return (
        <>
            <NovaColetaComRegras {...props} />
        </>
    );
}

export default NovaColetaComRegrasComListagem;
