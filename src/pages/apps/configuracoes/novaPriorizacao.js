/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Typography,
  Switch,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fab,
  Badge,
  Alert,
  AlertTitle,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import { isBefore } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "config";
import { useToken } from "../../../api/TokenContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Chart from "react-apexcharts";

// Dados mock para os selects
const perfisEsg = [
  { id: 1, nome: "Perfil ESG 2024" },
  { id: 2, nome: "Perfil ESG Completo" },
  { id: 3, nome: "Perfil ESG Simplificado" },
];

const ciclosAnteriores = [
  { id: 1, nome: "Ciclo 2023" },
  { id: 2, nome: "Ciclo 2022" },
  { id: 3, nome: "Ciclo 2021" },
];

const colaboradores = [
  { id: 1, nome: "João Silva", avatar: "JS" },
  { id: 2, nome: "Maria Santos", avatar: "MS" },
  { id: 3, nome: "Pedro Oliveira", avatar: "PO" },
  { id: 4, nome: "Ana Costa", avatar: "AC" },
  { id: 5, nome: "Carlos Ferreira", avatar: "CF" },
];

const statusPriorizacao = [
  { id: 1, nome: "Em elaboração", cor: "#FFA500" },
  { id: 2, nome: "Concluída", cor: "#28a745" },
  { id: 3, nome: "Revisada", cor: "#007bff" },
];

const eixosEsg = [
  { id: 1, nome: "Ambiental", cor: "#4CAF50", icon: "🌱" },
  { id: 2, nome: "Social", cor: "#2196F3", icon: "👥" },
  { id: 3, nome: "Governança", cor: "#FF9800", icon: "⚖️" },
];

// Dados mock para a tabela de temas
const temasMock = [
  {
    codigo: 1,
    tema: "Emissões de gás carbônico",
    eixo: "Ambiental",
    impactosPositivos: [
      { nome: "Redução de emissões", tipo: "Ambiental" },
      { nome: "Economia de energia", tipo: "Econômico" }
    ],
    impactosNegativos: [
      { nome: "Poluição do ar", tipo: "Ambiental" },
      { nome: "Mudanças climáticas", tipo: "Social" }
    ],
    probabilidade: 3,
    intensidade: 2,
    abrangencia: 3,
    urgencia: 2,
    significanciaImpacto: 2.5,
    significanciaFinanceira: 3,
    partesInteressadas: {
      clientes: 2,
      fornecedores: 1,
      ongsAssociacoes: 2,
      sociedade: 0,
      conselheiros: 5,
      colaboradores: 5,
      reguladores: 5,
      investidores: 4
    },
    importanciaPI: 4.2,
    priorizacao: 3.5,
    status: "Priorizado",
    observacao: "Tema acima do limite de materialidade definido pela empresa"
  },
  {
    codigo: 2,
    tema: "Gestão de resíduos",
    eixo: "Ambiental",
    impactosPositivos: [
      { nome: "Reciclagem", tipo: "Ambiental" }
    ],
    impactosNegativos: [
      { nome: "Contaminação do solo", tipo: "Ambiental" }
    ],
    probabilidade: 4,
    intensidade: 3,
    abrangencia: 2,
    urgencia: 3,
    significanciaImpacto: 3.0,
    significanciaFinanceira: 2.5,
    partesInteressadas: {
      clientes: 3,
      fornecedores: 2,
      ongsAssociacoes: 4,
      sociedade: 3,
      conselheiros: 3,
      colaboradores: 4,
      reguladores: 5,
      investidores: 2
    },
    importanciaPI: 3.3,
    priorizacao: 2.9,
    status: "Monitorado",
    observacao: "Tema importante para comunidade local"
  },
  {
    codigo: 3,
    tema: "Diversidade e inclusão",
    eixo: "Social",
    impactosPositivos: [
      { nome: "Ambiente inclusivo", tipo: "Social" },
      { nome: "Inovação", tipo: "Econômico" }
    ],
    impactosNegativos: [
      { nome: "Discriminação", tipo: "Social" }
    ],
    probabilidade: 2,
    intensidade: 4,
    abrangencia: 4,
    urgencia: 3,
    significanciaImpacto: 3.3,
    significanciaFinanceira: 3.8,
    partesInteressadas: {
      clientes: 4,
      fornecedores: 3,
      ongsAssociacoes: 5,
      sociedade: 5,
      conselheiros: 4,
      colaboradores: 5,
      reguladores: 3,
      investidores: 4
    },
    importanciaPI: 4.1,
    priorizacao: 3.7,
    status: "Priorizado",
    observacao: "Fundamental para cultura organizacional"
  },
  {
    codigo: 4,
    tema: "Transparência e ética",
    eixo: "Governança",
    impactosPositivos: [
      { nome: "Confiança", tipo: "Social" },
      { nome: "Reputação", tipo: "Econômico" }
    ],
    impactosNegativos: [
      { nome: "Corrupção", tipo: "Governança" }
    ],
    probabilidade: 3,
    intensidade: 5,
    abrangencia: 5,
    urgencia: 4,
    significanciaImpacto: 4.0,
    significanciaFinanceira: 4.5,
    partesInteressadas: {
      clientes: 5,
      fornecedores: 4,
      ongsAssociacoes: 3,
      sociedade: 4,
      conselheiros: 5,
      colaboradores: 4,
      reguladores: 5,
      investidores: 5
    },
    importanciaPI: 4.4,
    priorizacao: 4.3,
    status: "Não Priorizado",
    observacao: "Crítico para sustentabilidade do negócio"
  },
  {
    codigo: 5,
    tema: "Segurança e saúde ocupacional",
    eixo: "Social",
    impactosPositivos: [
      { nome: "Bem-estar", tipo: "Social" }
    ],
    impactosNegativos: [
      { nome: "Acidentes", tipo: "Social" },
      { nome: "Doenças ocupacionais", tipo: "Social" }
    ],
    probabilidade: 2,
    intensidade: 4,
    abrangencia: 3,
    urgencia: 5,
    significanciaImpacto: 3.5,
    significanciaFinanceira: 3.2,
    partesInteressadas: {
      clientes: 2,
      fornecedores: 3,
      ongsAssociacoes: 3,
      sociedade: 3,
      conselheiros: 4,
      colaboradores: 5,
      reguladores: 5,
      investidores: 3
    },
    importanciaPI: 3.5,
    priorizacao: 3.4,
    status: "Priorizado",
    observacao: "Prioridade máxima para colaboradores"
  }
];

const steps = [
  { label: 'Configuração Básica', icon: <SettingsIcon /> },
  { label: 'Responsáveis', icon: <PeopleIcon /> },
  { label: 'Avaliação de Temas', icon: <AssessmentIcon /> },
  { label: 'Análises e Gráficos', icon: <TrendingUpIcon /> },
];

const recalcTema = (newTema) => {
  // Helper to get numeric value safely
  const getVal = (ind, fallback) => {
    if (ind && typeof ind === 'object' && typeof ind.value === 'number') return ind.value;
    const num = Number(fallback);
    return isNaN(num) ? 0 : num;
  };

  // Função auxiliar para calcular média ignorando zeros
  const calcAverage = (values) => {
    const validValues = values.filter(v => typeof v === 'number' && !isNaN(v) && v > 0);
    if (validValues.length === 0) return 0;
    const sum = validValues.reduce((a, b) => a + b, 0);
    return sum / validValues.length;
  };

  // Sig. Impacto = média dos indicadores de impacto preenchidos
  const pImp = getVal(newTema.probabilidadeIndicator, newTema.probabilidade);
  const iImp = getVal(newTema.intensidadeIndicator, newTema.intensidade);
  const aImp = getVal(newTema.abrangenciaIndicator, newTema.abrangencia);
  const uImp = getVal(newTema.urgenciaIndicator, newTema.urgencia);
  newTema.significanciaImpacto = calcAverage([pImp, iImp, aImp, uImp]);

  // Sig. Financeira = média dos indicadores financeiros preenchidos
  const pFin = getVal(newTema.probabilidadeFinIndicator, newTema.probabilidadeFin);
  const iFin = getVal(newTema.intensidadeFinIndicator, newTema.intensidadeFin);
  const aFin = getVal(newTema.abrangenciaFinIndicator, newTema.abrangenciaFin);
  const uFin = getVal(newTema.urgenciaFinIndicator, newTema.urgenciaFin);
  newTema.significanciaFinanceira = calcAverage([pFin, iFin, aFin, uFin]);

  // Import. PI = média dos votos de stakeholders
  const stVotes = newTema.stakeholderVotes || {};
  const stValues = Object.values(stVotes)
    .map(v => (v && typeof v === 'object' ? v.value : Number(v)))
    .filter(val => !isNaN(val) && val > 0);
    
  if (stValues.length > 0) {
    const total = stValues.reduce((sum, v) => sum + v, 0);
    newTema.importanciaPI = total / stValues.length;
  } else {
    newTema.importanciaPI = getVal(newTema.importanciaPIIndicator, newTema.importanciaPI);
  }

  // Priorização = média das significâncias que possuem valor > 0
  const sigs = [
    newTema.significanciaImpacto,
    newTema.significanciaFinanceira,
    newTema.importanciaPI
  ].filter(s => s > 0);

  if (sigs.length > 0) {
    newTema.priorizacao = sigs.reduce((a, b) => a + b, 0) / sigs.length;
  } else {
    newTema.priorizacao = 0;
  }

  return newTema;
};

const IndicatorMenuCell = ({ tema, fieldName, listName, perfilEsgDetalhes, formData, handleInputChange, onSelect }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const levelList = perfilEsgDetalhes?.levelLists?.find(l => l.levelListName === listName);
  const indicators = levelList?.levelIndicators?.filter(ind => ind.active !== false) || [];

  const vote = tema.esgProfileVotesLists?.find(v => v.levelListId === levelList?.id);
  
  // Custom logic for stakeholders
  let currentIndicatorId;
  if (fieldName.startsWith('stakeholder_')) {
    const stId = fieldName.replace('stakeholder_', '');
    currentIndicatorId = tema.stakeholderVotes?.[stId]?.id || tema.stakeholderVotes?.[stId];
  } else {
    currentIndicatorId = tema[`${fieldName}Indicator`]?.id || tema[`${fieldName}Indicator`] || vote?.levelIndicatorId;
  }
  
  const currentIndicator = indicators.find(ind => ind.id === currentIndicatorId);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (indicator) => {
    if (onSelect) {
      onSelect(indicator);
      handleClose();
      return;
    }
    const updatedTemas = formData.temas.map(t => {
      if (t.codigo === tema.codigo) {
         const newTema = { 
           ...t, 
           [`${fieldName}Indicator`]: indicator,
           [fieldName]: indicator.value 
         };
         return recalcTema(newTema);
      }
      return t;
    });
    handleInputChange('temas', updatedTemas);
    handleClose();
  };

  return (
    <Box>
      <Box 
        onClick={handleClick}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          cursor: 'pointer',
          padding: '4px 8px',
          border: '1px solid #eee',
          borderRadius: '4px',
          minHeight: '32px',
          '&:hover': { backgroundColor: '#f5f5f5' }
        }}
      >
        {currentIndicator ? (
          <>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: currentIndicator.cssColor || '#ccc' }} />
            <Typography variant="body2">{currentIndicator.levelIndicatorName}</Typography>
          </>
        ) : (
          <Typography variant="body2" color="textSecondary">Selecionar</Typography>
        )}
      </Box>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {indicators.map(ind => (
          <MenuItem key={ind.id} onClick={() => handleSelect(ind)}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: ind.cssColor || '#ccc', mr: 1 }} />
            {ind.levelIndicatorName} ({ind.value})
          </MenuItem>
        ))}
        {indicators.length === 0 && (
          <MenuItem disabled>Selecione um Perfil ESG primeiro</MenuItem>
        )}
      </Menu>
    </Box>
  );
};

// ==============================|| CICLO DE PRIORIZAÇÃO REFATORADO ||============================== //
function NovoCicloPriorizacao() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { cicloDados } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [cicloPriorizacaoDados, setCicloPriorizacaoDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [editingTema, setEditingTema] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTema, setSelectedTema] = useState(null);
  const [avaliacaoTab, setAvaliacaoTab] = useState(0);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    nomeCiclo: "",
    descricaoCiclo: "",
    dataInicio: null,
    dataFim: null,
    perfilPriorizacao: null,
    cicloAnterior: null,
    priorizador: null,
    revisores: [],
    comentarioPriorizador: "",
    comentarioRevisores: "",
    statusPriorizacao: 1, // Em elaboração por padrão
    temas: []
  });

  const { id } = useParams();
  const [temasOptions, setTemasOptions] = useState([]);
  const [colaboradoresOptions, setColaboradoresOptions] = useState([]);
  const [ciclosAnterioresOptions, setCiclosAnterioresOptions] = useState([]);
  const [perfisEsgOptions, setPerfisEsgOptions] = useState([]);
  const [perfilEsgDetalhes, setPerfilEsgDetalhes] = useState(null);
  const [cicloAnteriorDetalhes, setCicloAnteriorDetalhes] = useState(null);
  const [stakeholdersOptions, setStakeholdersOptions] = useState([]);
  const [esgImpactsOptions, setEsgImpactsOptions] = useState([]);

  useEffect(() => {
    let unmounted = false;
    const fetchOptions = async () => {
      if (!token) return;
      try {
        const [temasRes, colabRes, ciclosRes, perfisRes, stakeholdersRes, impactsRes] = await Promise.all([
          axios.get(`${API_URL}Theme`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}collaborators`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}PrioritizationCycle`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}ProfileESG`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}Stakeholder`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}ESGImpact`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (unmounted) return;
        setTemasOptions(temasRes.data || []);
        setEsgImpactsOptions(impactsRes.data || []);
        
        const ativosColab = (colabRes.data || []).map(c => ({
          ...c, 
          id: c.idCollaborator || c.id,
          nome: c.collaboratorName || c.name || c.nome || c.idCollaborator || c.id
        }));
        setColaboradoresOptions(ativosColab);
        
        setCiclosAnterioresOptions((ciclosRes.data || []).map(c => ({
          ...c, nome: c.prioritizationCycleName || c.nome || c.id
        })));
        
        const perfisData = Array.isArray(perfisRes.data) ? perfisRes.data : (perfisRes.data?.data || []);
        setPerfisEsgOptions(perfisData.map(p => ({
          ...p, nome: p.profileESGName || p.nome || p.id
        })));

        const rawStakeholders = Array.isArray(stakeholdersRes.data) ? stakeholdersRes.data : (stakeholdersRes.data?.data || []);
        const stakeholdersData = rawStakeholders.filter(s => s.active === true);
        setStakeholdersOptions(stakeholdersData.map(s => ({
          ...s,
          nome: s.name || s.stakeholderName || s.nome || s.id
        })));
      } catch (err) {
        console.error('Erro ao buscar dados relacionados', err);
      }
    };
    fetchOptions();
    return () => { unmounted = true; };
  }, [token]);

  useEffect(() => {
    let unmounted = false;
    const fetchEdit = async () => {
      if (!token || !id || id === 'criar') return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}PrioritizationCycle/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (unmounted) return;
        const d = res.data;
        setRequisicao('Editar');
        setMensagemFeedback('editado');
        setFormData(prev => ({
          ...prev,
          nomeCiclo: d.prioritizationCycleName || '',
          descricaoCiclo: d.prioritizationCycleDescription || '',
          dataInicio: d.startDate ? new Date(d.startDate) : null,
          dataFim: d.endDate ? new Date(d.endDate) : null,
          priorizador: d.responsibleId || null,
          revisores: d.reviewerIds || [],
          comentarioPriorizador: d.responsibleComment || '',
          statusPriorizacao: (() => {
            const s = d.prioritizationCycleStats;
            if (typeof s === 'number') return s;
            if (typeof s === 'string') {
              const str = s.toLowerCase();
              if (str.includes('elabora')) return 1;
              if (str.includes('conclu')) return 2;
              if (str.includes('revis')) return 3;
            }
            return 1;
          })(),
          perfilPriorizacao: d.profileESGId || null,
          cicloAnterior: d.predecessorIds && d.predecessorIds.length > 0 ? d.predecessorIds[0] : null,
          temas: d.themeEvaluations ? d.themeEvaluations.map(evalItem => ({
            id: evalItem.themeId,
            codigo: evalItem.themeId,
            tema: 'Tema ID ' + evalItem.themeId,
            status: 'Monitorado',
            significanciaImpacto: evalItem.significanciaImpacto || 0,
            significanciaFinanceira: evalItem.significanciaFinanceira || 0,
            importanciaPI: evalItem.importanciaPI || 0,
            priorizacao: evalItem.priorizacao || 0,
            esgProfileVotesLists: evalItem.esgProfileVotesLists || evalItem.esgProfileVotesList || [],
            impactosPositivos: [],
            impactosNegativos: []
          })) : (d.themeIds ? d.themeIds.map(tid => ({ 
            id: tid, 
            codigo: tid, 
            tema: 'Tema ID ' + tid, 
            status: 'Monitorado',
            esgProfileVotesLists: [],
            impactosPositivos: [],
            impactosNegativos: []
          })) : []),
          id: d.id,
          isDisabled: d.isDisabled
        }));
      } catch (err) {
        console.error(err);
      } finally {
        if (!unmounted) setLoading(false);
      }
    };
    fetchEdit();
  }, [id, token]);

  useEffect(() => {
    let unmounted = false;
    if (temasOptions.length > 0 && esgImpactsOptions.length > 0 && formData.temas.length > 0) {
      const needsHydration = formData.temas.some(t => 
        (t.tema && t.tema.startsWith('Tema ID ')) || !t._impactsHydrated
      );
      
      if (needsHydration) {
        const hydrateThemes = async () => {
          const hydratedTemas = await Promise.all(formData.temas.map(async t => {
            if ((t.tema && t.tema.startsWith('Tema ID ')) || !t._impactsHydrated) {
              const realTema = temasOptions.find(opt => opt.id === t.id || String(opt.id) === String(t.codigo));
              if (realTema) {
                const code = realTema.themeCode || (typeof realTema.id === 'string' ? realTema.id.substring(0, 8) : realTema.id);
                
                let themeDetails = null;
                try {
                  const res = await axios.get(`${API_URL}Theme/Code/${code}`, { headers: { Authorization: `Bearer ${token}` } });
                  themeDetails = res.data;
                } catch (e) {
                  console.error('Erro ao buscar detalhes do tema', e);
                }

                const sigImpactIds = (themeDetails?.themeSignificanceImpacts || []).map(i => i.id || i.esgImpactId);
                const finImpactIds = (themeDetails?.themeFinancialSignificances || []).map(i => i.id || i.esgImpactId);

                const themeImpacts = themeDetails?.themeESGImpacts || [];
                const impactsList = themeImpacts.map(ti => {
                  const baseImpact = esgImpactsOptions.find(ei => ei.id === ti.esgImpactId);
                  return baseImpact ? { ...ti, nature: baseImpact.impactNature, type: baseImpact.impactType, nome: baseImpact.impactESGName || baseImpact.name } : null;
                }).filter(Boolean);

                const impactosPositivos = impactsList.filter(i => i.nature === 1);
                const impactosNegativos = impactsList.filter(i => i.nature === 2);

                const axisMap = { 1: "Ambiental", 2: "Social", 3: "Governança" };
                const eixoStr = axisMap[realTema.esgAxis] || "Ambiental";

                return {
                  ...t,
                  tema: realTema.themeName || realTema.nomeTema || realTema.tema || realTema.id,
                  eixo: eixoStr,
                  codigo: code,
                  impactosPositivos,
                  impactosNegativos,
                  sigImpactIds,
                  finImpactIds,
                  _impactsHydrated: true
                };
              }
            }
            return t;
          }));

          if (!unmounted) {
            setFormData(prev => ({ ...prev, temas: hydratedTemas }));
          }
        };

        hydrateThemes();
      }
    }
    return () => { unmounted = true; };
  }, [temasOptions, esgImpactsOptions, formData.temas, token]);

  useEffect(() => {
    let unmounted = false;
    const fetchPerfilDetails = async () => {
      if (!token || !formData.perfilPriorizacao) {
        setPerfilEsgDetalhes(null);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}ProfileESG/${formData.perfilPriorizacao}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!unmounted) {
          const perfilData = res.data?.data || res.data;
          setPerfilEsgDetalhes(perfilData);
          
          // Hydrate themes with indicator objects now that we have the profile details
          setFormData(prev => ({
            ...prev,
            temas: prev.temas.map(t => {
              const newTema = { ...t };
              const votes = t.esgProfileVotesLists || t.esgProfileVotesList || [];
              
              // Map indicators by their expected order in the payload
              const lists = perfilData.levelLists || [];
              
              const findIndicator = (listName, voteIndex) => {
                const list = lists.find(l => l.levelListName === listName);
                const vote = votes[voteIndex];
                if (list && vote) {
                   return list.levelIndicators?.find(ind => ind.id === vote.levelIndicatorId);
                }
                return null;
              };

              // Order sent in tratarSubmit: 
              // 0: Probabilidade (Impacto)
              // 1: Intensidade (Impacto)
              // 2: Abrangência (Impacto)
              // 3: Urgência (Impacto)
              // 4: Importância PI (General)
              // 5: Probabilidade (Financeiro)
              // 6: Intensidade (Financeiro)
              // 7: Abrangência (Financeiro)
              // 8: Urgência (Financeiro)
              // 9+: Stakeholders

              newTema.probabilidadeIndicator = findIndicator("Níveis de Probabilidade", 0);
              newTema.probabilidade = newTema.probabilidadeIndicator?.value || 0;
              
              newTema.intensidadeIndicator = findIndicator("Níveis de Intensidade", 1);
              newTema.intensidade = newTema.intensidadeIndicator?.value || 0;
              
              newTema.abrangenciaIndicator = findIndicator("Níveis de Abrangência", 2);
              newTema.abrangencia = newTema.abrangenciaIndicator?.value || 0;
              
              newTema.urgenciaIndicator = findIndicator("Níveis de Urgência/Prioridade", 3);
              newTema.urgencia = newTema.urgenciaIndicator?.value || 0;
              
              newTema.importanciaPIIndicator = findIndicator("Níveis de Importância das Partes Interessadas", 4);
              newTema.importanciaPI = newTema.importanciaPIIndicator?.value || 0;
              
              newTema.probabilidadeFinIndicator = findIndicator("Níveis de Probabilidade", 5);
              newTema.probabilidadeFin = newTema.probabilidadeFinIndicator?.value || 0;
              
              newTema.intensidadeFinIndicator = findIndicator("Níveis de Intensidade", 6);
              newTema.intensidadeFin = newTema.intensidadeFinIndicator?.value || 0;
              
              newTema.abrangenciaFinIndicator = findIndicator("Níveis de Abrangência", 7);
              newTema.abrangenciaFin = newTema.abrangenciaFinIndicator?.value || 0;
              
              newTema.urgenciaFinIndicator = findIndicator("Níveis de Urgência/Prioridade", 8);
              newTema.urgenciaFin = newTema.urgenciaFinIndicator?.value || 0;

              // Stakeholders - Hydrate stakeholderVotes
              const stIds = perfilData.stakeholders?.map(x => x.id) || perfilData.stakeholderIds || perfilData.profileESGStakeholders?.map(x => x.stakeholderId) || [];
              if (stIds.length > 0) {
                const stVotes = {};
                stIds.forEach((sid, idx) => {
                   const indicator = findIndicator("Níveis de Importância das Partes Interessadas", 9 + idx);
                   if (indicator) stVotes[sid] = indicator;
                });
                newTema.stakeholderVotes = stVotes;
              }

              return recalcTema(newTema);
            })
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do Perfil ESG", err);
      }
    };
    fetchPerfilDetails();
    return () => { unmounted = true; };
  }, [formData.perfilPriorizacao, token]);

  useEffect(() => {
    let unmounted = false;
    const fetchCicloAnterior = async () => {
      if (!token || !formData.cicloAnterior) {
        setCicloAnteriorDetalhes(null);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}PrioritizationCycle/${formData.cicloAnterior}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!unmounted) {
          setCicloAnteriorDetalhes(res.data);
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do Ciclo Anterior", err);
      }
    };
    fetchCicloAnterior();
    return () => { unmounted = true; };
  }, [formData.cicloAnterior, token]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSelectAllRevisores = (event, newValue) => {
    const availableRevisores = colaboradoresOptions;

    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.revisores.length === availableRevisores.length) {
        handleInputChange("revisores", []);
      } else {
        handleInputChange("revisores", availableRevisores.map(colaborador => colaborador.id));
      }
    } else {
      handleInputChange("revisores", newValue.map(item => item.id).filter(id => id !== "all"));
    }
  };

  const handleEditTema = (tema) => {
    setEditingTema({ ...tema });
    setEditDialogOpen(true);
  };

  const handleViewTema = (tema) => {
    setSelectedTema(tema);
    setViewDialogOpen(true);
  };

  const handleSaveTema = () => {
    if (editingTema) {
      const updatedTemas = formData.temas.map(tema => 
        tema.codigo === editingTema.codigo ? editingTema : tema
      );
      handleInputChange('temas', updatedTemas);
      setEditDialogOpen(false);
      setEditingTema(null);
      enqueueSnackbar('Tema atualizado com sucesso!', { variant: 'success' });
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [formValidation, setFormValidation] = useState({
    nomeCiclo: true,
    dataInicio: true,
    dataFim: true,
    perfilPriorizacao: true,
    priorizador: true,
  });

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

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

  const tratarSubmit = async () => {
    const missingFields = [];
    
    if (!formData.nomeCiclo.trim()) {
      setFormValidation(prev => ({ ...prev, nomeCiclo: false }));
      missingFields.push("Nome do Ciclo");
    }
    
    if (!formData.dataInicio) {
      setFormValidation(prev => ({ ...prev, dataInicio: false }));
      missingFields.push("Data de Início");
    }

    if (!formData.dataFim) {
      setFormValidation(prev => ({ ...prev, dataFim: false }));
      missingFields.push("Data de Fim");
    }

    if (!formData.perfilPriorizacao) {
      setFormValidation(prev => ({ ...prev, perfilPriorizacao: false }));
      missingFields.push("Perfil de Priorização");
    }

    if (!formData.priorizador) {
      setFormValidation(prev => ({ ...prev, priorizador: false }));
      missingFields.push("Priorizador");
    }

    if (formData.dataInicio && formData.dataFim && isBefore(formData.dataFim, formData.dataInicio)) {
      enqueueSnackbar("A data de fim não pode ser anterior à data de início!", { variant: "error" });
      return;
    }

    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural = missingFields.length > 1 
        ? "são obrigatórios e devem estar válidos!" 
        : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
      });
      return;
    }

    try {
      setLoading(true);
      
      const reviewerCommentsMapped = formData.revisores.length > 0 
        ? formData.revisores.map(r => ({
            reviewerId: r.id || r,
            comment: formData.comentarioRevisores || null
          }))
        : [];

      const themeEvaluations = formData.temas.map(tema => {
        const esgProfileVotesLists = [];
        
        const addVote = (listName, indicatorObj) => {
           if (!indicatorObj) return;
           const list = perfilEsgDetalhes?.levelLists?.find(l => l.levelListName === listName);
           if (list) {
              esgProfileVotesLists.push({
                 levelListId: list.id,
                 levelIndicatorId: indicatorObj.id || indicatorObj
              });
           }
        };

        addVote("Níveis de Probabilidade", tema.probabilidadeIndicator);
        addVote("Níveis de Intensidade", tema.intensidadeIndicator);
        addVote("Níveis de Abrangência", tema.abrangenciaIndicator);
        addVote("Níveis de Urgência/Prioridade", tema.urgenciaIndicator);
        addVote("Níveis de Importância das Partes Interessadas", tema.importanciaPIIndicator);

        // Votos financeiros (mesmas LevelLists, prefixo Fin)
        addVote("Níveis de Probabilidade", tema.probabilidadeFinIndicator);
        addVote("Níveis de Intensidade", tema.intensidadeFinIndicator);
        addVote("Níveis de Abrangência", tema.abrangenciaFinIndicator);
        addVote("Níveis de Urgência/Prioridade", tema.urgenciaFinIndicator);

        // Votos de stakeholders
        const stakeholderIds = perfilEsgDetalhes?.stakeholders?.map(x => x.id) || perfilEsgDetalhes?.stakeholderIds || perfilEsgDetalhes?.profileESGStakeholders?.map(x => x.stakeholderId) || [];
        if (tema.stakeholderVotes && stakeholderIds.length > 0) {
          stakeholderIds.forEach(sid => {
            const stVote = tema.stakeholderVotes[sid];
            if (stVote) {
              addVote("Níveis de Importância das Partes Interessadas", stVote);
            }
          });
        }

        return {
          themeId: tema.id || tema.codigo,
          significanciaImpacto: tema.significanciaImpacto || 0,
          significanciaFinanceira: tema.significanciaFinanceira || 0,
          importanciaPI: tema.importanciaPI || 0,
          priorizacao: tema.priorizacao || 0,
          esgProfileVotesLists
        };
      });

      const payload = {
        prioritizationCycleName: formData.nomeCiclo,
        startDate: formData.dataInicio ? formData.dataInicio.toISOString() : null,
        endDate: formData.dataFim ? formData.dataFim.toISOString() : null,
        profileESGId: formData.perfilPriorizacao || null,
        prioritizationCycleDescription: formData.descricaoCiclo,
        prioritizationCycleStats: Number(formData.statusPriorizacao) || 1,
        predecessorIds: formData.cicloAnterior ? [formData.cicloAnterior] : [],
        responsibleId: formData.priorizador || null,
        reviewerIds: formData.revisores.map(r => r.id ? r.id : r),
        responsibleComment: formData.comentarioPriorizador || null,
        reviewerComments: reviewerCommentsMapped,
        themeIds: formData.temas.map(t => t.id || t),
        themeEvaluations
      };

      if (requisicao === 'Editar') {
        payload.id = formData.id;
        payload.isDisabled = formData.isDisabled !== undefined ? formData.isDisabled : true;
        await axios.put(`${API_URL}PrioritizationCycle`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      } else {
        await axios.post(`${API_URL}PrioritizationCycle`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      }
      
      enqueueSnackbar(`Ciclo de Priorização ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar o ciclo de priorização.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const allSelectedRevisores = formData.revisores.length === colaboradoresOptions.length && colaboradoresOptions.length > 0;

  // Preparar dados para os gráficos com verificações de segurança
  const prepareMatrizData = () => {
    if (!formData.temas || formData.temas.length === 0) {
      return [];
    }

    return eixosEsg.map(eixo => ({
      name: eixo.nome,
      data: formData.temas
        .filter(tema => tema && tema.eixo === eixo.nome)
        .map(tema => ({
          x: tema.significanciaFinanceira || 0,
          y: tema.significanciaImpacto || 0,
          z: (tema.importanciaPI || 0) * 10,
          codigo: tema.codigo || 0,
          tema: tema.tema || 'Sem nome'
        }))
    })).filter(serie => serie.data.length > 0);
  };

  const prepareRankingData = () => {
    if (!formData.temas || formData.temas.length === 0) {
      return { categories: [], data: [] };
    }

    const sortedTemas = formData.temas
      .filter(tema => tema && typeof tema.tema === 'string' && tema.tema.trim() !== '' && tema.priorizacao !== undefined)
      .sort((a, b) => (b.priorizacao || 0) - (a.priorizacao || 0));

    return {
      categories: sortedTemas.map(tema => tema.tema),
      data: sortedTemas.map(tema => tema.priorizacao || 0)
    };
  };

  const prepareDistribuicaoData = () => {
    if (!formData.temas || formData.temas.length === 0) {
      return [];
    }

    return eixosEsg.map(eixo => 
      formData.temas.filter(tema => tema && tema.eixo === eixo.nome).length
    );
  };

  // Configurações dos gráficos com correções de segurança
  const matrizOptions = {
    chart: {
      type: 'bubble',
      height: 500,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      background: '#fff',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        try {
          const seriesIndex = opts.seriesIndex;
          const dataPointIndex = opts.dataPointIndex;
          const series = opts.w.config.series;
          
          if (series && series[seriesIndex] && series[seriesIndex].data && series[seriesIndex].data[dataPointIndex]) {
            return series[seriesIndex].data[dataPointIndex].codigo || '';
          }
          return '';
        } catch (error) {
          console.warn('Erro no formatter do dataLabels:', error);
          return '';
        }
      },
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        colors: ['#fff']
      },
      background: {
        enabled: true,
        foreColor: '#fff',
        borderRadius: 2,
        padding: 4,
        opacity: 0.9,
        borderWidth: 1,
        borderColor: '#fff'
      }
    },
    xaxis: {
      title: {
        text: 'Significância Financeira (Impacto na Empresa)',
        style: {
          fontSize: '14px',
          fontWeight: 600
        }
      },
      min: 0,
      max: 5,
      tickAmount: 5,
      labels: {
        formatter: function(val) {
          return typeof val === 'number' ? val.toFixed(1) : val;
        }
      }
    },
    yaxis: {
      title: {
        text: 'Significância do Impacto (Impacto da Empresa)',
        style: {
          fontSize: '14px',
          fontWeight: 600
        }
      },
      min: 0,
      max: 5,
      tickAmount: 5,
      labels: {
        formatter: function(val) {
          return typeof val === 'number' ? val.toFixed(1) : val;
        }
      }
    },
    title: {
      text: 'Matriz de Dupla Materialidade ESG',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#263238'
      }
    },
    subtitle: {
      text: 'Tamanho da bolha representa a Importância das Partes Interessadas',
      align: 'center',
      style: {
        fontSize: '12px',
        color: '#666'
      }
    },
    tooltip: {
      custom: function({series, seriesIndex, dataPointIndex, w}) {
        try {
          const seriesData = w.config.series;
          if (!seriesData || !seriesData[seriesIndex] || !seriesData[seriesIndex].data || !seriesData[seriesIndex].data[dataPointIndex]) {
            return '<div style="padding: 12px;">Dados não disponíveis</div>';
          }

          const data = seriesData[seriesIndex].data[dataPointIndex];
          const tema = formData.temas.find(t => t.codigo === data.codigo);
          
          return `
  <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
    <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1976d2;">
      ${data.codigo || 'N/A'}. ${data.tema || 'Sem nome'}
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
      <strong>Eixo:</strong> ${tema?.eixo || 'N/A'}
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
      <strong>Sig. Financeira:</strong> ${(data.x || 0).toFixed(1)}
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
      <strong>Sig. Impacto:</strong> ${(data.y || 0).toFixed(1)}
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
      <strong>Import. PI:</strong> ${((data.z || 0)/10).toFixed(1)}
    </div>
    <div style="font-size: 12px; color: #666;">
      <strong>Status:</strong>
      <span style="color: ${
        tema?.status?.toLowerCase() === 'priorizado'
          ? '#4caf50'
          : (tema?.status?.toLowerCase() === 'Não Priorizado' || tema?.status?.toLowerCase() === 'Não Priorizado')
            ? '#4f0601ff'
            : '#ff9800'
      }">${tema?.status || 'N/A'}</span>
    </div>
  </div>
`;

        } catch (error) {
          console.warn('Erro no tooltip custom:', error);
          return '<div style="padding: 12px;">Erro ao carregar dados</div>';
        }
      }
    },
    grid: {
      show: true,
      borderColor: '#e0e0e0',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    colors: ['#1976d2', '#388e3c', '#f57c00'],
    fill: {
      opacity: 0.8
    },
    annotations: {
      xaxis: [
        {
          x: 2.5,
          borderColor: '#999',
          label: {
            text: 'Limite de Materialidade',
            style: {
              color: '#fff',
              background: '#999'
            }
          }
        }
      ],
      yaxis: [
        {
          y: 2.5,
          borderColor: '#999',
          label: {
            text: 'Limite de Materialidade',
            style: {
              color: '#fff',
              background: '#999'
            }
          }
        }
      ]
    }
  };

  // Gráfico de distribuição por eixo
  const distribuicaoOptions = {
    chart: {
      type: 'donut',
      height: 350,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    labels: eixosEsg.map(eixo => eixo.nome),
    colors: eixosEsg.map(eixo => eixo.cor),
    title: {
      text: 'Distribuição de Temas por Eixo ESG',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#263238'
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        try {
          const label = opts.w.config.labels[opts.seriesIndex] || 'N/A';
          const value = typeof val === 'number' ? val.toFixed(1) : val;
          return `${label}: ${value}%`;
        } catch (error) {
          console.warn('Erro no formatter da distribuição:', error);
          return `${val}%`;
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return `${val} tema${val !== 1 ? 's' : ''}`;
        }
      }
    }
  };

  const distribuicaoSeries = prepareDistribuicaoData();

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderCamposBasicos();
      case 1:
        return renderResponsaveis();
      case 2:
        return renderTabelaTemas();
      case 3:
        return renderGraficos();
      default:
        return null;
    }
  };

  const renderCamposBasicos = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color="primary" />
          Configuração Básica do Ciclo
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Ciclo de Priorização *</InputLabel>
              <TextField
                fullWidth
                disabled={requisicao === 'Editar'}
                value={formData.nomeCiclo}
                onChange={(e) => handleInputChange('nomeCiclo', e.target.value)}
                error={!formData.nomeCiclo && formValidation.nomeCiclo === false}
                placeholder="Ex: Ciclo ESG 2024"
                inputProps={{ maxLength: 50 }}
                helperText={`${formData.nomeCiclo.length}/50 caracteres`}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Perfil de Priorização ESG *</InputLabel>
              <Autocomplete
                options={perfisEsgOptions}
                getOptionLabel={(option) => option?.nome || option?.profileESGName || option?.id || "Sem Nome"}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                value={perfisEsgOptions.find(perfil => perfil.id === formData.perfilPriorizacao) || null}
                onChange={(event, newValue) => {
                  handleInputChange('perfilPriorizacao', newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.perfilPriorizacao && formValidation.perfilPriorizacao === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Data de Início *</InputLabel>
              <DatePicker
                value={formData.dataInicio}
                onChange={(newValue) => handleInputChange('dataInicio', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!formData.dataInicio && formValidation.dataInicio === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Data de Fim *</InputLabel>
              <DatePicker
                value={formData.dataFim}
                minDate={formData.dataInicio}
                onChange={(newValue) => handleInputChange('dataFim', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={(!formData.dataFim && formValidation.dataFim === false) || (formData.dataInicio && formData.dataFim && isBefore(formData.dataFim, formData.dataInicio))}
                    helperText={formData.dataInicio && formData.dataFim && isBefore(formData.dataFim, formData.dataInicio) ? "A data fim deve ser após a data início" : ""}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Descrição do Ciclo</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.descricaoCiclo}
                onChange={(e) => handleInputChange('descricaoCiclo', e.target.value)}
                placeholder="Descreva o objetivo e escopo deste ciclo de priorização"
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.descricaoCiclo.length}/500 caracteres`}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Ciclo de Priorização Anterior</InputLabel>
              <Autocomplete
                options={ciclosAnterioresOptions.filter(ciclo => ciclo.id !== id)}
                getOptionLabel={(option) => option.nome}
                value={ciclosAnterioresOptions.find(ciclo => ciclo.id === formData.cicloAnterior) || null}
                onChange={(event, newValue) => {
                  handleInputChange('cicloAnterior', newValue ? newValue.id : null);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Status da Priorização</InputLabel>
              <Autocomplete
                options={statusPriorizacao}
                getOptionLabel={(option) => option.nome}
                value={statusPriorizacao.find(status => status.id === formData.statusPriorizacao) || null}
                onChange={(event, newValue) => {
                  handleInputChange('statusPriorizacao', newValue ? newValue.id : 1);
                }}
                renderInput={(params) => <TextField {...params} />}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Chip
                      label={option.nome}
                      size="small"
                      sx={{ backgroundColor: option.cor, color: 'white', mr: 1 }}
                    />
                    {option.nome}
                  </Box>
                )}
              />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderResponsaveis = () => {
    const availableRevisores = colaboradoresOptions;
    const availablePriorizadores = colaboradoresOptions;

    return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" />
          Responsáveis pelo Ciclo
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Priorizador *</InputLabel>
              <Autocomplete
                options={availablePriorizadores}
                getOptionLabel={(option) => option?.nome || option?.id || "Sem nome"}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                value={availablePriorizadores.find(colab => colab.id === formData.priorizador) || null}
                onChange={(event, newValue) => {
                  handleInputChange('priorizador', newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.priorizador && formValidation.priorizador === false}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                      {option.nome ? option.nome.substring(0, 2).toUpperCase() : 'JS'}
                    </Avatar>
                    {option.nome}
                  </Box>
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Revisores</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[
                  { id: "all", nome: "Selecionar todos" },
                  ...availableRevisores,
                ]}
                getOptionLabel={(option) => option?.nome || option?.id || "Sem nome"}
                value={formData.revisores.map(
                  (id) => colaboradoresOptions.find((colab) => colab.id === id) || { id, nome: id }
                ).filter(val => val.id !== 'all')}
                onChange={handleSelectAllRevisores}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                renderOption={(props, option, { selected }) => {
                  const isAll = option.id === "all";
                  const isChecked = isAll ? formData.revisores.length === availableRevisores.length && availableRevisores.length > 0 : selected;
                  return (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox checked={isChecked} />
                      </Grid>
                      {!isAll && (
                        <Grid item>
                          <Avatar sx={{ mr: 2, bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                            {option.nome ? option.nome.substring(0, 2).toUpperCase() : 'US'}
                          </Avatar>
                        </Grid>
                      )}
                      <Grid item xs>
                        {option.nome}
                      </Grid>
                    </Grid>
                  </li>
                )}}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Comentário do Priorizador</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.comentarioPriorizador}
                onChange={(e) => handleInputChange('comentarioPriorizador', e.target.value)}
                placeholder="Comentários sobre a priorização"
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.comentarioPriorizador.length}/500 caracteres`}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Comentário dos Revisores</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.comentarioRevisores}
                onChange={(e) => handleInputChange('comentarioRevisores', e.target.value)}
                placeholder="Comentários da revisão"
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.comentarioRevisores.length}/500 caracteres`}
              />
            </Stack>
          </Grid>
        </Grid>

        {/* Lista de responsáveis selecionados */}
        {(formData.priorizador || formData.revisores.length > 0) && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Equipe Selecionada
            </Typography>
            <List>
              {formData.priorizador && (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                      {colaboradoresOptions.find(c => c.id === formData.priorizador)?.nome?.substring(0, 2).toUpperCase() || 'P'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={colaboradoresOptions.find(c => c.id === formData.priorizador)?.nome || 'Sem Nome'}
                    secondary="Priorizador"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Priorizador" color="primary" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
              )}
              {formData.revisores.map(revisorId => {
                const revisor = colaboradoresOptions.find(c => c.id === revisorId);
                return revisor ? (
                  <ListItem key={revisorId}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
                        {revisor.nome ? revisor.nome.substring(0, 2).toUpperCase() : 'R'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={revisor.nome || 'Sem Nome'}
                      secondary="Revisor"
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Revisor" color="secondary" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                ) : null;
              })}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

  const renderTabelaTemas = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            Avaliação de Temas ESG
          </Typography>
          <Badge badgeContent={formData.temas.length} color="primary">
            <Chip label="Temas Cadastrados" variant="outlined" />
          </Badge>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Stack spacing={1}>
            <InputLabel>Adicionar Temas ESG</InputLabel>
            <Autocomplete
              multiple
              options={temasOptions}
              getOptionLabel={(option) => option.themeName || option.nomeTema || option.tema || option.id || "Sem nome"}
              isOptionEqualToValue={(option, value) => option.id === (value.id || value)}
              value={formData.temas.map(t => temasOptions.find(opt => opt.id === (t.id || t.codigo || t)) || { id: t.codigo || t.id || t, themeName: t.tema || 'Carregando...' })}
              onChange={(event, newValue) => {
                const newTemas = newValue.map(temaObj => {
                  const existing = formData.temas.find(t => (t.id || t.codigo || t) === temaObj.id);
                  if (existing && existing.tema !== 'Carregando...') return existing;
                  
                  const axisMap = { 1: "Ambiental", 2: "Social", 3: "Governança" };
                  const eixoStr = axisMap[temaObj.esgAxis] || "Ambiental";

                  return {
                    id: temaObj.id,
                    codigo: temaObj.themeCode || (typeof temaObj.id === 'string' ? temaObj.id.substring(0, 8) : temaObj.id),
                    tema: temaObj.themeName || temaObj.id,
                    eixo: eixoStr,
                    impactosPositivos: [],
                    impactosNegativos: [],
                    probabilidade: 0,
                    intensidade: 0,
                    abrangencia: 0,
                    urgencia: 0,
                    probabilidadeFin: 0,
                    intensidadeFin: 0,
                    abrangenciaFin: 0,
                    urgenciaFin: 0,
                    significanciaImpacto: 0,
                    significanciaFinanceira: 0,
                    importanciaPI: 0,
                    priorizacao: 0,
                    stakeholderVotes: {},
                    status: "Monitorado"
                  };
                });
                handleInputChange('temas', newTemas);
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Pesquise por nome do tema..." />
              )}
            />
          </Stack>
        </Box>

        {/* Resumo por status */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Alert severity="success" sx={{ height: '100%' }}>
                <AlertTitle>Priorizados</AlertTitle>
                {formData.temas.filter(t => t.status === 'Priorizado').length} temas
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="warning" sx={{ height: '100%' }}>
                <AlertTitle>Monitorados</AlertTitle>
                {formData.temas.filter(t => t.status === 'Monitorado').length} temas
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="info" sx={{ height: '100%' }}>
                <AlertTitle>Total</AlertTitle>
                {formData.temas.length} temas avaliados
              </Alert>
            </Grid>
          </Grid>
        </Box>

        {/* Abas de avaliação */}
        {(() => {
          const stakeholderIds = perfilEsgDetalhes?.stakeholders?.map(x => x.id) || perfilEsgDetalhes?.stakeholderIds || perfilEsgDetalhes?.profileESGStakeholders?.map(x => x.stakeholderId) || [];
          const stakeholders = stakeholderIds.map(id => {
            const opt = stakeholdersOptions.find(o => o.id === id);
            return opt || { id, nome: 'Carregando...' };
          });
          const hasStakeholders = stakeholders.length > 0;

          // Define columns for the middle tab section header
          const renderTabHeaders = () => {
            if (avaliacaoTab === 0) {
              return (
                <>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', minWidth: 130 }}>Prob.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', minWidth: 130 }}>Intens.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', minWidth: 130 }}>Abrang.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', minWidth: 130 }}>Urgên.</TableCell>
                </>
              );
            }
            if (avaliacaoTab === 1) {
              return (
                <>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fff3e0', minWidth: 130 }}>Prob.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fff3e0', minWidth: 130 }}>Intens.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fff3e0', minWidth: 130 }}>Abrang.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fff3e0', minWidth: 130 }}>Urgên.</TableCell>
                </>
              );
            }
            if (avaliacaoTab === 2 && hasStakeholders) {
              return stakeholders.map((st, idx) => (
                <TableCell key={st.id || idx} sx={{ fontWeight: 'bold', backgroundColor: '#e8f5e9', minWidth: 130 }}>
                  {st.nome || st.name || st.stakeholderName || `Stakeholder ${idx + 1}`}
                </TableCell>
              ));
            }
            return null;
          };

          // Render middle columns per row based on active tab
          const renderTabCells = (tema) => {
            if (avaliacaoTab === 0) {
              return (
                <>
                  <TableCell sx={{ backgroundColor: '#f5f9ff' }}>
                    <IndicatorMenuCell tema={tema} fieldName="probabilidade" listName="Níveis de Probabilidade" perfilEsgDetalhes={perfilEsgDetalhes} formData={formData} handleInputChange={handleInputChange} />
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f5f9ff' }}>
                    <IndicatorMenuCell tema={tema} fieldName="intensidade" listName="Níveis de Intensidade" perfilEsgDetalhes={perfilEsgDetalhes} formData={formData} handleInputChange={handleInputChange} />
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f5f9ff' }}>
                    <IndicatorMenuCell tema={tema} fieldName="abrangencia" listName="Níveis de Abrangência" perfilEsgDetalhes={perfilEsgDetalhes} formData={formData} handleInputChange={handleInputChange} />
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f5f9ff' }}>
                    <IndicatorMenuCell tema={tema} fieldName="urgencia" listName="Níveis de Urgência/Prioridade" perfilEsgDetalhes={perfilEsgDetalhes} formData={formData} handleInputChange={handleInputChange} />
                  </TableCell>
                </>
              );
            }
            if (avaliacaoTab === 1) {
              return (
                <>
                  <TableCell sx={{ backgroundColor: '#fffbf0' }}>
                    <IndicatorMenuCell tema={tema} fieldName="probabilidadeFin" listName="Níveis de Probabilidade" perfilEsgDetalhes={perfilEsgDetalhes} formData={formData} handleInputChange={handleInputChange} />
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#fffbf0' }}>
                    <IndicatorMenuCell tema={tema} fieldName="intensidadeFin" listName="Níveis de Intensidade" perfilEsgDetalhes={perfilEsgDetalhes} formData={formData} handleInputChange={handleInputChange} />
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#fffbf0' }}>
                    <IndicatorMenuCell tema={tema} fieldName="abrangenciaFin" listName="Níveis de Abrangência" perfilEsgDetalhes={perfilEsgDetalhes} formData={formData} handleInputChange={handleInputChange} />
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#fffbf0' }}>
                    <IndicatorMenuCell tema={tema} fieldName="urgenciaFin" listName="Níveis de Urgência/Prioridade" perfilEsgDetalhes={perfilEsgDetalhes} formData={formData} handleInputChange={handleInputChange} />
                  </TableCell>
                </>
              );
            }
            if (avaliacaoTab === 2 && hasStakeholders) {
              return stakeholders.map((st, idx) => {
                const stId = st.id || idx;
                const stFieldName = `stakeholder_${stId}`;
                return (
                  <TableCell key={stId} sx={{ backgroundColor: '#f5faf5' }}>
                    <IndicatorMenuCell
                      tema={tema}
                      fieldName={stFieldName}
                      listName="Níveis de Importância das Partes Interessadas"
                      perfilEsgDetalhes={perfilEsgDetalhes}
                      formData={formData}
                      handleInputChange={handleInputChange}
                      onSelect={(indicator) => {
                        const updatedTemas = formData.temas.map(t => {
                          if (t.codigo === tema.codigo) {
                            const newTema = {
                              ...t,
                              stakeholderVotes: {
                                ...(t.stakeholderVotes || {}),
                                [stId]: indicator
                              }
                            };
                            return recalcTema(newTema);
                          }
                          return t;
                        });
                        handleInputChange('temas', updatedTemas);
                      }}
                    />
                  </TableCell>
                );
              });
            }
            return null;
          };

          return (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0, display: 'flex', justifyContent: 'center' }}>
                <Tabs
                  value={avaliacaoTab}
                  onChange={(e, newVal) => setAvaliacaoTab(newVal)}
                  centered
                  sx={{
                    '& .MuiTab-root': { 
                      fontWeight: 600, 
                      textTransform: 'none', 
                      fontSize: '0.875rem',
                      minHeight: 48,
                      px: 3,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        opacity: 1
                      }
                    },
                    '& .Mui-selected': { 
                      color: 'primary.main',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      fontWeight: 700
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    }
                  }}
                >
                  <Tab label="Significância de Impacto" sx={{ color: '#1565c0' }} />
                  <Tab label="Significância Financeira" sx={{ color: '#e65100' }} />
                  <Tab 
                    label="Stakeholders" 
                    disabled={!hasStakeholders || formData.temas.length === 0}
                    sx={{ 
                      color: '#2e7d32',
                      '&.Mui-disabled': { color: 'text.disabled', opacity: 0.5 }
                    }} 
                  />
                </Tabs>
              </Box>

              <TableContainer component={Paper} sx={{ maxHeight: 600, borderRadius: '0 0 8px 8px' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {/* Seção Fixa Esquerda */}
                      <TableCell sx={{ fontWeight: 'bold', borderRight: '2px solid #e0e0e0', position: 'sticky', left: 0, zIndex: 3, backgroundColor: '#fafafa' }}>Código</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', borderRight: '2px solid #e0e0e0', backgroundColor: '#fafafa' }}>Tema</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>Eixo</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>Impactos +</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fafafa', borderRight: '2px solid #e0e0e0' }}>Impactos -</TableCell>

                      {/* Seção Mutável (Abas) */}
                      {renderTabHeaders()}

                      {/* Seção Fixa Direita */}
                      <TableCell sx={{ fontWeight: 'bold', borderLeft: '2px solid #e0e0e0', backgroundColor: '#fafafa' }}>Sig. Impacto</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>Sig. Financeira</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>Import. PI</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>Priorização</TableCell>
                      {cicloAnteriorDetalhes && (
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', backgroundColor: '#fafafa' }}>Nota Ant.</TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.temas.map((tema) => (
                      <TableRow key={tema.codigo} hover>
                        {/* Seção Fixa Esquerda */}
                        <TableCell sx={{ borderRight: '2px solid #e0e0e0' }}>
                          <Chip label={tema.codigo} size="small" color="primary" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 200, fontWeight: 500, borderRight: '2px solid #e0e0e0' }}>{tema.tema}</TableCell>
                        <TableCell>
                          <Chip 
                            label={tema.eixo} 
                            size="small"
                            sx={{ 
                              backgroundColor: eixosEsg.find(e => e.nome === tema.eixo)?.cor,
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          {(tema.impactosPositivos || []).filter(impacto => {
                             if (avaliacaoTab === 0) return tema.sigImpactIds?.includes(impacto.esgImpactId || impacto.id);
                             if (avaliacaoTab === 1) return tema.finImpactIds?.includes(impacto.esgImpactId || impacto.id);
                             return true;
                          }).map((impacto, idx) => (
                            <Chip key={idx} label={impacto.nome} size="small" color="success" sx={{ m: 0.25 }} />
                          ))}
                        </TableCell>
                        <TableCell sx={{ minWidth: 120, borderRight: '2px solid #e0e0e0' }}>
                          {(tema.impactosNegativos || []).filter(impacto => {
                             if (avaliacaoTab === 0) return tema.sigImpactIds?.includes(impacto.esgImpactId || impacto.id);
                             if (avaliacaoTab === 1) return tema.finImpactIds?.includes(impacto.esgImpactId || impacto.id);
                             return true;
                          }).map((impacto, idx) => (
                            <Chip key={idx} label={impacto.nome} size="small" color="error" sx={{ m: 0.25 }} />
                          ))}
                        </TableCell>

                        {/* Seção Mutável (Abas) */}
                        {renderTabCells(tema)}

                        {/* Seção Fixa Direita */}
                        <TableCell sx={{ borderLeft: '2px solid #e0e0e0' }}>
                          <Tooltip title="Média: Prob. + Intens. + Abrang. + Urgên. (Impacto)">
                            <Typography variant="body2" fontWeight="bold" sx={{ 
                              color: tema.significanciaImpacto > 0 ? '#1565c0' : 'text.secondary',
                              backgroundColor: tema.significanciaImpacto > 0 ? '#e3f2fd' : 'transparent',
                              borderRadius: '4px', padding: '2px 6px', display: 'inline-block'
                            }}>
                              {tema.significanciaImpacto?.toFixed(1) || "0.0"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Média: Prob. + Intens. + Abrang. + Urgên. (Financeira)">
                            <Typography variant="body2" fontWeight="bold" sx={{
                              color: tema.significanciaFinanceira > 0 ? '#e65100' : 'text.secondary',
                              backgroundColor: tema.significanciaFinanceira > 0 ? '#fff3e0' : 'transparent',
                              borderRadius: '4px', padding: '2px 6px', display: 'inline-block'
                            }}>
                              {tema.significanciaFinanceira?.toFixed(1) || "0.0"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Média dos votos de Stakeholders">
                            <Typography variant="body2" fontWeight="bold" sx={{
                              color: tema.importanciaPI > 0 ? '#2e7d32' : 'text.secondary',
                              backgroundColor: tema.importanciaPI > 0 ? '#e8f5e9' : 'transparent',
                              borderRadius: '4px', padding: '2px 6px', display: 'inline-block'
                            }}>
                              {tema.importanciaPI?.toFixed(1) || "0.0"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="primary" sx={{
                            backgroundColor: '#e8eaf6', borderRadius: '4px', padding: '2px 8px', display: 'inline-block'
                          }}>
                            {tema.priorizacao?.toFixed(1) || "0.0"}
                          </Typography>
                        </TableCell>
                        {cicloAnteriorDetalhes && (
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {(() => {
                                const oldEval = cicloAnteriorDetalhes.themeEvaluations?.find(e => e.themeId === (tema.id || tema.codigo));
                                return oldEval?.priorizacao?.toFixed(1) || "-";
                              })()}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Chip 
                            label={tema.status} 
                            size="small"
                            color={tema.status === 'Priorizado' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Visualizar detalhes">
                              <IconButton size="small" onClick={() => handleViewTema(tema)}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar tema">
                              <IconButton size="small" onClick={() => handleEditTema(tema)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          );
        })()}
      </CardContent>
    </Card>
  );

  const renderGraficos = () => {
    const matrizSeries = prepareMatrizData();
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <TrendingUpIcon color="primary" />
          Análises e Visualizações
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {matrizSeries.length > 0 ? (
                  <Chart
                    options={matrizOptions}
                    series={matrizSeries}
                    type="bubble"
                    height={500}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      Nenhum dado disponível para a matriz
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {requisicao === "Criar" ? "Novo Ciclo de Priorização ESG" : "Editar Ciclo de Priorização ESG"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure e gerencie o ciclo de priorização de temas ESG da sua organização
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === 3 ? (
                    <Typography variant="caption">Última etapa</Typography>
                  ) : null
                }
                icon={step.icon}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? tratarSubmit : handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      startIcon={index === steps.length - 1 ? <SaveIcon /> : null}
                    >
                      {index === steps.length - 1 ? 
                        (requisicao === "Criar" ? "Finalizar Criação" : "Salvar Alterações") : 
                        "Continuar"
                      }
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Voltar
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>Todas as etapas foram concluídas - o ciclo está pronto!</Typography>
            <Button onClick={() => setActiveStep(0)} sx={{ mt: 1, mr: 1 }}>
              Revisar
            </Button>
          </Paper>
        )}

        {/* Dialog para edição de tema */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Editar Tema: {editingTema?.tema}
          </DialogTitle>
          <DialogContent>
            {editingTema && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome do Tema"
                    value={editingTema.tema}
                    onChange={(e) => setEditingTema({...editingTema, tema: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <InputLabel>Probabilidade (Impacto)</InputLabel>
                    <IndicatorMenuCell 
                      tema={editingTema}
                      fieldName="probabilidade"
                      listName="Níveis de Probabilidade"
                      perfilEsgDetalhes={perfilEsgDetalhes}
                      onSelect={(indicator) => {
                        setEditingTema(recalcTema({
                          ...editingTema, 
                          probabilidadeIndicator: indicator, 
                          probabilidade: indicator.value
                        }));
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <InputLabel>Intensidade (Impacto)</InputLabel>
                    <IndicatorMenuCell 
                      tema={editingTema}
                      fieldName="intensidade"
                      listName="Níveis de Intensidade"
                      perfilEsgDetalhes={perfilEsgDetalhes}
                      onSelect={(indicator) => {
                        setEditingTema(recalcTema({
                          ...editingTema, 
                          intensidadeIndicator: indicator, 
                          intensidade: indicator.value
                        }));
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <InputLabel>Abrangência (Impacto)</InputLabel>
                    <IndicatorMenuCell 
                      tema={editingTema}
                      fieldName="abrangencia"
                      listName="Níveis de Abrangência"
                      perfilEsgDetalhes={perfilEsgDetalhes}
                      onSelect={(indicator) => {
                        setEditingTema(recalcTema({
                          ...editingTema, 
                          abrangenciaIndicator: indicator, 
                          abrangencia: indicator.value
                        }));
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <InputLabel>Urgência (Impacto)</InputLabel>
                    <IndicatorMenuCell 
                      tema={editingTema}
                      fieldName="urgencia"
                      listName="Níveis de Urgência/Prioridade"
                      perfilEsgDetalhes={perfilEsgDetalhes}
                      onSelect={(indicator) => {
                        setEditingTema(recalcTema({
                          ...editingTema, 
                          urgenciaIndicator: indicator, 
                          urgencia: indicator.value
                        }));
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Observação"
                    value={editingTema.observacao}
                    onChange={(e) => setEditingTema({...editingTema, observacao: e.target.value})}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTema} variant="contained" startIcon={<SaveIcon />}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para visualização de tema */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Detalhes do Tema: {selectedTema?.tema}
          </DialogTitle>
          <DialogContent>
            {selectedTema && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Eixo ESG</Typography>
                    <Chip 
                      label={selectedTema.eixo} 
                      sx={{ 
                        backgroundColor: eixosEsg.find(e => e.nome === selectedTema.eixo)?.cor,
                        color: 'white',
                        mb: 2
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={selectedTema.status} 
                      color={selectedTema.status === 'Priorizado' ? 'success' : 'warning'}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Observação</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedTema.observacao}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Avaliações
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip label={`Probabilidade: ${selectedTema.probabilidade}`} variant="outlined" />
                      <Chip label={`Intensidade: ${selectedTema.intensidade}`} variant="outlined" />
                      <Chip label={`Abrangência: ${selectedTema.abrangencia}`} variant="outlined" />
                      <Chip label={`Urgência: ${selectedTema.urgencia}`} variant="outlined" />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Resultados Calculados
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip label={`Sig. Impacto: ${selectedTema.significanciaImpacto.toFixed(1)}`} color="info" />
                      <Chip label={`Sig. Financeira: ${selectedTema.significanciaFinanceira.toFixed(1)}`} color="info" />
                      <Chip label={`Import. PI: ${selectedTema.importanciaPI.toFixed(1)}`} color="info" />
                      <Chip label={`Priorização: ${selectedTema.priorizacao.toFixed(1)}`} color="primary" />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Fechar
            </Button>
            <Button 
              onClick={() => {
                setViewDialogOpen(false);
                handleEditTema(selectedTema);
              }} 
              variant="contained"
              startIcon={<EditIcon />}
            >
              Editar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Sucesso */}
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
          <Box display="flex" justifyContent="center" mt={2}>
            <CheckCircleOutlineIcon sx={{ fontSize: 50, color: "#28a745" }} />
          </Box>

          <DialogTitle
            sx={{ fontWeight: 600, fontSize: "20px", color: "#333" }}
          >
            Ciclo de Priorização criado com sucesso!
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
              O ciclo de priorização foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
            </DialogContentText>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", gap: 1 }}>
            <Button
              onClick={continuarEdicao}
              variant="outlined"
              sx={{ minWidth: "120px" }}
            >
              Continuar Editando
            </Button>
            <Button
              onClick={voltarParaListagem}
              variant="contained"
              sx={{ minWidth: "120px" }}
            >
              Voltar para Listagem
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

export default NovoCicloPriorizacao;

