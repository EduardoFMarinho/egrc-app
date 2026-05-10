/* eslint-disable react-hooks/exhaustive-deps */
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
  Typography,
  Switch,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "config";
import { useToken } from "../../../api/TokenContext";

// Dados mocK apagados

const niveisAvaliacao = [
  { id: 2, nome: "2" },
  { id: 3, nome: "3" },
  { id: 4, nome: "4" },
  { id: 5, nome: "5" },
  { id: 6, nome: "6" },
  { id: 7, nome: "7" },
  { id: 8, nome: "8" },
  { id: 9, nome: "9" },
  { id: 10, nome: "10" },
];

const coresDisponiveis = [
  { id: 1, nome: "Verde Claro", valor: "#61c78e" },
  { id: 2, nome: "Verde Azulado", valor: "#319b88" },
  { id: 3, nome: "Amarelo", valor: "#fad355" },
  { id: 4, nome: "Rosado", valor: "#f28b82" },
  { id: 5, nome: "Vermelho", valor: "#e45b5b" },
  { id: 6, nome: "Roxo", valor: "#a37ce6" },
  { id: 7, nome: "Azul Claro", valor: "#66c2e3" },
  { id: 8, nome: "Laranja", valor: "#f59f64" },
  { id: 9, nome: "Cinza", valor: "#828282" },
  { id: 10, nome: "Rosa Escuro", valor: "#d85786" },
];

const statusPriorizacaoMap = {
  1: { nome: "Em elaboração", cor: "#FFA500" },
  2: { nome: "Concluída", cor: "#28a745" },
  3: { nome: "Revisada", cor: "#007bff" },
};

// ==============================|| PERFIL ESG ||============================== //
function NovoPerfilEsg() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { perfilDados } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [apiData, setApiData] = useState(null);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
  const [stakeholdersOptions, setStakeholdersOptions] = useState([]);
  const [ciclosPriorizacaoOptions, setCiclosPriorizacaoOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!token) return;
      try {
        const [stakeholdersRes, ciclosRes] = await Promise.all([
          axios.get(`${API_URL}Stakeholder`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}PrioritizationCycle`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const actives = (stakeholdersRes.data || []).filter(s => s.active === true);
        setStakeholdersOptions(actives.map(item => ({
          ...item,
          nome: item.name || item.stakeholderName || item.nome || item.id
        })));
        setCiclosPriorizacaoOptions((ciclosRes.data || []).map(item => ({
          ...item,
          nome: item.prioritizationCycleName || item.nome || item.id
        })));
      } catch (error) {
        console.error('Erro ao buscar metadados do formulário:', error);
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, [token]);

  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    nomePerfilCiclo: "",
    cicloPriorizacao: [],
    qtdNiveisAvaliacao: null,
    abrangencia: false,
    urgencia: false,
    partesInteressadas: false,
    stakeholders: [],
    // Níveis de probabilidade
    niveisProbabilidade: [
      { nome: "Muito Baixa", valor: 1, cor: null },
      { nome: "Baixa", valor: 2, cor: null },
      { nome: "Média", valor: 3, cor: null },
      { nome: "Alta", valor: 4, cor: null },
      { nome: "Muito Alta", valor: 5, cor: null },
    ],
    // Níveis de intensidade
    niveisIntensidade: [
      { nome: "Muito Baixa", valor: 1, cor: null },
      { nome: "Baixa", valor: 2, cor: null },
      { nome: "Média", valor: 3, cor: null },
      { nome: "Alta", valor: 4, cor: null },
      { nome: "Muito Alta", valor: 5, cor: null },
    ],
    // Níveis de abrangência
    niveisAbrangencia: [
      { nome: "Local", valor: 1, cor: null },
      { nome: "Regional", valor: 2, cor: null },
      { nome: "Nacional", valor: 3, cor: null },
      { nome: "Internacional", valor: 4, cor: null },
      { nome: "Global", valor: 5, cor: null },
    ],
    // Níveis de urgência/prioridade
    niveisPrioridade: [
      { nome: "Muito Baixa", valor: 1, cor: null },
      { nome: "Baixa", valor: 2, cor: null },
      { nome: "Média", valor: 3, cor: null },
      { nome: "Alta", valor: 4, cor: null },
      { nome: "Muito Alta", valor: 5, cor: null },
    ],
    // Níveis de importância das partes interessadas
    niveisImportanciaPI: [
      { nome: "Baixa", valor: 1, cor: null },
      { nome: "Média", valor: 2, cor: null },
      { nome: "Alta", valor: 3, cor: null },
      { nome: "Crítica", valor: 4, cor: null },
      { nome: "Essencial", valor: 5, cor: null },
    ],
  });

  // Buscando os detalhes da API se for edição
  useEffect(() => {
    const fetchPerfilDetails = async () => {
      if (!token || !perfilDados || !perfilDados.id) return;
      try {
        setLoading(true);
        setRequisicao("Editar");
        setMensagemFeedback("editado");
        
        const response = await axios.get(`${API_URL}ProfileESG/${perfilDados.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setApiData(response.data);
      } catch (error) {
        console.error("Erro ao carregar detalhes do perfil:", error);
        enqueueSnackbar("Erro ao carregar detalhes do perfil ESG.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    
    if (perfilDados) {
       fetchPerfilDetails();
    }
  }, [perfilDados, token]);

  // Handle Edit Mode from State when options are loaded
  useEffect(() => {
    if (apiData && !optionsLoading) {
        const data = apiData;
        const activeLists = data.levelLists ? data.levelLists.filter(l => l.active !== false) : [];
        const listNames = activeLists.map(l => l.levelListName);
        const hasAbrangencia = listNames.includes("Níveis de Abrangência");
        const hasUrgencia = listNames.includes("Níveis de Urgência/Prioridade");
        const hasPI = listNames.includes("Níveis de Importância das Partes Interessadas");
        
        let qtd = null;
        if (activeLists.length > 0) {
           const firstListIndicators = activeLists[0].levelIndicators?.filter(ind => ind.active !== false);
           if (firstListIndicators) {
               qtd = firstListIndicators.length;
           }
        }
        
        const findIndicators = (listName) => {
          const list = activeLists.find(l => l.levelListName === listName);
          if (list && list.levelIndicators && list.levelIndicators.length > 0) {
             const activeIndicators = list.levelIndicators.filter(ind => ind.active !== false);
             if (activeIndicators.length > 0) {
                 return activeIndicators.map(ind => {
                   const corObj = coresDisponiveis.find(c => c.valor === ind.cssColor);
                   return {
                     id: ind.id,
                     nome: ind.levelIndicatorName,
                     valor: ind.value,
                     cor: corObj ? corObj.id : null
                   };
                 }).sort((a,b) => a.valor - b.valor);
             }
          }
          return null;
        };
        
        const findMultiple = (list, ids) => list.filter(item => ids?.includes(item.id));
        const stIds = data.stakeholders?.map(x => x.id) || data.stakeholderIds || data.profileESGStakeholders?.map(x => x.stakeholderId) || [];
        const cyIds = data.prioritizationCycles?.map(c => c.id) || data.prioritizationCycleIds || data.profileESGCycles?.map(c => c.prioritizationCycleId) || [];
        
        setFormData(prev => ({
          ...prev,
          nomePerfilCiclo: data.profileESGName || "",
          cicloPriorizacao: cyIds,
          stakeholders: findMultiple(stakeholdersOptions, stIds),
          qtdNiveisAvaliacao: qtd || prev.qtdNiveisAvaliacao,
          abrangencia: hasAbrangencia,
          urgencia: hasUrgencia,
          partesInteressadas: hasPI,
          niveisProbabilidade: findIndicators("Níveis de Probabilidade") || prev.niveisProbabilidade,
          niveisIntensidade: findIndicators("Níveis de Intensidade") || prev.niveisIntensidade,
          niveisAbrangencia: findIndicators("Níveis de Abrangência") || prev.niveisAbrangencia,
          niveisPrioridade: findIndicators("Níveis de Urgência/Prioridade") || prev.niveisPrioridade,
          niveisImportanciaPI: findIndicators("Níveis de Importância das Partes Interessadas") || prev.niveisImportanciaPI,
        }));
        setHasChanges(false);
    }
  }, [apiData, optionsLoading, stakeholdersOptions]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
    setHasChanges(true);
  };

  const handleSelectAllCiclos = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.cicloPriorizacao.length === ciclosPriorizacaoOptions.length) {
        handleInputChange("cicloPriorizacao", []);
      } else {
        handleInputChange("cicloPriorizacao", ciclosPriorizacaoOptions.map(ciclo => ciclo.id));
      }
    } else {
      handleInputChange("cicloPriorizacao", newValue.map(item => item.id));
    }
  };

  const updateNivelArray = (arrayName, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
    setHasChanges(true);
  };

  const adjustNiveisQuantity = (quantidade) => {
    const createDefaultNiveis = (count, type) => {
      const defaultNames7 = {
        probabilidade: ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta", "Extrema", "Crítica"],
        intensidade: ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta", "Extrema", "Crítica"],
        prioridade: ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta", "Extrema", "Crítica"],
        abrangencia: ["Local", "Regional", "Nacional", "Internacional", "Global", "Nível 6", "Nível 7"],
        importanciaPI: ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta", "Crítica", "Essencial"]
      };

      let names = [];
      let defaultColors = [];

      // Ordem aproximada de severidade (baixo para alto risco)
      const intensityScale = [9, 7, 1, 3, 8, 4, 5, 10, 6, 2];

      if (count === 2) {
        if (type === 'abrangencia') {
          names = ["Local", "Global"];
        } else {
          names = ["Baixa", "Alta"];
        }
        defaultColors = [1, 5]; // Verde e Vermelho
      } else if (count === 3) {
        if (type === 'abrangencia') {
          names = ["Local", "Regional", "Global"];
        } else {
          names = ["Baixa", "Média", "Alta"];
        }
        defaultColors = [1, 3, 5]; // Verde, Amarelo, Vermelho
      } else if (count === 4) {
        if (type === 'abrangencia') {
          names = ["Local", "Regional", "Nacional", "Global"];
        } else if (type === 'importanciaPI') {
          names = ["Baixa", "Média", "Alta", "Crítica"];
        } else {
          names = ["Muito Baixa", "Baixa", "Alta", "Muito Alta"];
        }
        defaultColors = [1, 3, 8, 5]; // Verde, Amarelo, Laranja, Vermelho
      } else if (count === 5) {
        if (type === 'importanciaPI') {
          names = ["Baixa", "Média", "Alta", "Crítica", "Essencial"];
        } else {
          names = defaultNames7[type] ? defaultNames7[type].slice(0, 5) : [];
        }
        defaultColors = [1, 3, 8, 5, 6]; // Verde, Amarelo, Laranja, Vermelho, Roxo
      } else if (count === 7) {
        names = defaultNames7[type] || [];
        defaultColors = [9, 7, 3, 4, 5, 6, 10]; // Parecido com a imagem: Cinza, azul, amarelo, salmão, vermelho, roxo, rosa
      } else {
        names = defaultNames7[type] ? defaultNames7[type].slice(0, count) : [];
        // Preenche interpolando as intensidades para Nível customizado
        defaultColors = Array.from({ length: count }, (_, i) => {
          const idx = Math.floor((i / Math.max(1, count - 1)) * (intensityScale.length - 1));
          return intensityScale[idx];
        });
      }

      return Array.from({ length: count }, (_, i) => ({
        nome: names[i] || `Nível ${i + 1}`,
        valor: i + 1,
        cor: defaultColors[i] || null
      }));
    };

    setFormData(prev => ({
      ...prev,
      qtdNiveisAvaliacao: quantidade,
      niveisProbabilidade: createDefaultNiveis(quantidade, 'probabilidade'),
      niveisIntensidade: createDefaultNiveis(quantidade, 'intensidade'),
      niveisAbrangencia: createDefaultNiveis(quantidade, 'abrangencia'),
      niveisPrioridade: createDefaultNiveis(quantidade, 'prioridade'),
      niveisImportanciaPI: createDefaultNiveis(quantidade, 'importanciaPI'),
    }));
    setHasChanges(true);
  };

  const [formValidation, setFormValidation] = useState({
    nomePerfilCiclo: true,
    qtdNiveisAvaliacao: true,
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

    if (!formData.nomePerfilCiclo.trim()) {
      setFormValidation(prev => ({ ...prev, nomePerfilCiclo: false }));
      missingFields.push("Nome do Perfil do Ciclo");
    }

    if (!formData.qtdNiveisAvaliacao) {
      setFormValidation(prev => ({ ...prev, qtdNiveisAvaliacao: false }));
      missingFields.push("Quantidade de Níveis de Avaliação");
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

      const levelListNames = [
        "Níveis de Probabilidade",
        "Níveis de Intensidade"
      ];
      if (formData.abrangencia) levelListNames.push("Níveis de Abrangência");
      if (formData.urgencia) levelListNames.push("Níveis de Urgência/Prioridade");
      if (formData.partesInteressadas) levelListNames.push("Níveis de Importância das Partes Interessadas");

      let levelListIDsToRemove = [];
      if (requisicao === "Editar" && apiData?.levelLists) {
         levelListIDsToRemove = apiData.levelLists
            .filter(list => !levelListNames.includes(list.levelListName) && list.active !== false)
            .map(list => list.id);
      }

      const profileCode = formData.nomePerfilCiclo.substring(0, 50).toUpperCase().replace(/\s+/g, '-');
      const payload = {
        profileCode: perfilDados?.profileCode || profileCode,
        profileESGName: formData.nomePerfilCiclo,
        profileESGDescription: formData.nomePerfilCiclo,
        active: requisicao === "Editar" ? perfilDados?.active : true,
        levelListNames,
        stakeholderIds: formData.partesInteressadas ? formData.stakeholders.map(s => s.id) : [],
        prioritizationCycleIds: formData.cicloPriorizacao
      };

      if (requisicao === "Editar" && levelListIDsToRemove.length > 0) {
        payload.LevelListIDsToRemove = levelListIDsToRemove;
      }

      let profileId = null;

      if (requisicao === "Editar") {
        payload.id = perfilDados.id;
        await axios.put(`${API_URL}ProfileESG`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        profileId = perfilDados.id;
      } else {
        const response = await axios.post(`${API_URL}ProfileESG`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        profileId = response.data?.data?.idProfileESG || response.data?.idProfileESG;
      }

      if (!profileId) {
         throw new Error("ID do perfil ESG não foi obtido após criação/atualização.");
      }

      // Obter as LevelLists geradas pelo backend
      const profileResponse = await axios.get(`${API_URL}ProfileESG/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const levelLists = profileResponse.data?.levelLists || [];
      const indicatorsToCreate = [];
      const indicatorsToUpdate = [];
      const indicatorsToDelete = [];

      const prepareIndicators = (arrayName, listNameLabel) => {
         const list = levelLists.find(l => l.levelListName === listNameLabel);
         if (!list) return;

         const existingIndicators = list.levelIndicators || [];
         const formIds = formData[arrayName].map(n => n.id).filter(id => id);

         // Mapear exclusões
         existingIndicators.forEach(ind => {
             if (!formIds.includes(ind.id) && ind.active !== false) {
                 indicatorsToDelete.push({
                   id: ind.id,
                   levelIndicatorName: ind.levelIndicatorName,
                   value: ind.value,
                   cssColor: ind.cssColor,
                   active: false
                 });
             }
         });

         // Mapear criações e edições
         formData[arrayName].forEach(nivel => {
            const cssColor = coresDisponiveis.find(c => c.id === nivel.cor)?.valor || "#828282";
            const payload = {
               levelIndicatorName: nivel.nome,
               value: nivel.valor,
               cssColor: cssColor,
               levelListId: list.id,
               active: true
            };

            const existing = existingIndicators.find(e => e.id === nivel.id);

            if (existing) {
               // Update only if something naturally changed
               if (existing.levelIndicatorName !== nivel.nome || 
                   existing.value !== nivel.valor || 
                   existing.cssColor !== cssColor ||
                   existing.active === false) {
                  indicatorsToUpdate.push({ ...payload, id: nivel.id });
               }
            } else {
               indicatorsToCreate.push(payload);
            }
         });
      };

      prepareIndicators("niveisProbabilidade", "Níveis de Probabilidade");
      prepareIndicators("niveisIntensidade", "Níveis de Intensidade");
      if (formData.abrangencia) prepareIndicators("niveisAbrangencia", "Níveis de Abrangência");
      if (formData.urgencia) prepareIndicators("niveisPrioridade", "Níveis de Urgência/Prioridade");
      if (formData.partesInteressadas) prepareIndicators("niveisImportanciaPI", "Níveis de Importância das Partes Interessadas");

      const operations = [
        ...indicatorsToCreate.map(ind => 
          axios.post(`${API_URL}LevelIndicator`, ind, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ),
        ...indicatorsToUpdate.map(ind => 
          axios.put(`${API_URL}LevelIndicator`, ind, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ),
        ...indicatorsToDelete.map(ind => 
          axios.put(`${API_URL}LevelIndicator`, ind, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      ];

      await Promise.all(operations);

      enqueueSnackbar(`Perfil ESG ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível salvar o perfil ESG.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const allSelectedCiclos = formData.cicloPriorizacao.length === ciclosPriorizacaoOptions.length && ciclosPriorizacaoOptions.length > 0;

  const renderNiveisSection = (title, arrayName, isOptional = false, enabled = true) => {
    if (isOptional && !enabled) return null;

    return (
      <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #EBEBEB' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
             <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2196f3', mr: 1 }} />
             {title}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 1, px: 2 }}>
            <Grid item xs={1}><Typography variant="overline" color="textSecondary">#</Typography></Grid>
            <Grid item xs={3}><Typography variant="overline" color="textSecondary">NOME</Typography></Grid>
            <Grid item xs={2}><Typography variant="overline" color="textSecondary" sx={{ ml: -2 }}>VALOR</Typography></Grid>
            <Grid item xs={6}><Typography variant="overline" color="textSecondary">COR</Typography></Grid>
          </Grid>
          
          <Divider sx={{ mb: 2 }} />

          {formData[arrayName].map((nivel, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 1, alignItems: 'center', px: 2, borderBottom: '1px solid #fafafa', pb: 1 }}>
              <Grid item xs={1}>
                <Typography variant="body2" color="textSecondary">{index + 1}</Typography>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  size="small"
                  fullWidth
                  value={nivel.nome}
                  onChange={(e) => updateNivelArray(arrayName, index, 'nome', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#fff' },
                  }}
                />
              </Grid>
              <Grid item xs={2} sx={{ ml: -2 }}>
                <Box
                  sx={{
                    backgroundColor: '#F7F4EB',
                    color: '#8A7A64',
                    fontWeight: 600,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                  }}
                >
                  {nivel.valor}
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 32 }}>
                  {coresDisponiveis.map(cor => (
                    <Box
                      key={cor.id}
                      onClick={() => updateNivelArray(arrayName, index, 'cor', cor.id)}
                      sx={{
                        width: nivel.cor === cor.id ? 26 : 20,
                        height: nivel.cor === cor.id ? 26 : 20,
                        borderRadius: '50%',
                        backgroundColor: nivel.cor === cor.id ? 'transparent' : cor.valor,
                        border: nivel.cor === cor.id ? `2px solid ${cor.valor}` : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {nivel.cor === cor.id && (
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: cor.valor }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <LoadingOverlay isActive={loading || optionsLoading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={3} marginTop={1}>
          {/* Campos básicos */}
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Perfil do Ciclo *</InputLabel>
              <TextField
                fullWidth
                value={formData.nomePerfilCiclo}
                onChange={(e) => handleInputChange('nomePerfilCiclo', e.target.value)}
                error={!formData.nomePerfilCiclo && formValidation.nomePerfilCiclo === false}
                placeholder="Digite o nome do perfil do ciclo"
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Ciclo de Priorização</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={[
                  { id: "all", nome: "Selecionar todos" },
                  ...ciclosPriorizacaoOptions,
                ]}
                getOptionLabel={(option) => option.nome}
                value={formData.cicloPriorizacao.map(
                  (id) => ciclosPriorizacaoOptions.find((ciclo) => String(ciclo.id) === String(id))
                ).filter(Boolean)}
                onChange={handleSelectAllCiclos}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => {
                  const status = statusPriorizacaoMap[option.prioritizationCycleStats];
                  return (
                    <li {...props}>
                      <Grid container alignItems="center">
                        <Grid item>
                          <Checkbox
                            checked={option.id === "all" ? allSelectedCiclos : selected}
                          />
                        </Grid>
                        <Grid item xs>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {option.nome}
                            {option.id !== "all" && status && (
                              <Chip 
                                label={status.nome} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: status.cor, 
                                  color: 'white',
                                  fontSize: '10px',
                                  height: '18px'
                                }} 
                              />
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </li>
                  );
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const status = statusPriorizacaoMap[option.prioritizationCycleStats];
                    return (
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {option.nome}
                            {status && (
                              <Chip 
                                label={status.nome} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: status.cor, 
                                  color: 'white',
                                  fontSize: '9px',
                                  height: '16px'
                                }} 
                              />
                            )}
                          </Box>
                        }
                        size="small"
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    );
                  })
                }
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Quantidade de Níveis para Avaliação *</InputLabel>
              <Autocomplete
                options={niveisAvaliacao}
                getOptionLabel={(option) => option.nome}
                value={niveisAvaliacao.find(nivel => nivel.id === formData.qtdNiveisAvaliacao) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    adjustNiveisQuantity(parseInt(newValue.nome));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.qtdNiveisAvaliacao && formValidation.qtdNiveisAvaliacao === false}
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Switches para opções */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Configurações de Avaliação
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.abrangencia}
                      onChange={handleSwitchChange('abrangencia')}
                    />
                  }
                  label="Abrangência"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.urgencia}
                      onChange={handleSwitchChange('urgencia')}
                    />
                  }
                  label="Urgência"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.partesInteressadas}
                      onChange={handleSwitchChange('partesInteressadas')}
                    />
                  }
                  label="Partes Interessadas"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Partes Interessadas - só aparece se o switch estiver ativo */}
          {formData.partesInteressadas && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tipos de Partes Interessadas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel>Selecione as Partes Interessadas</InputLabel>
                        <Autocomplete
                          multiple
                          filterSelectedOptions
                          options={stakeholdersOptions}
                          getOptionLabel={(option) => option.name || option.nome || ""}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          value={formData.stakeholders || []}
                          onChange={(event, newValue) => {
                            handleInputChange('stakeholders', newValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Pesquise ou selecione"
                            />
                          )}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Seções de Níveis */}
          {formData.qtdNiveisAvaliacao && (
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Definição dos Níveis
              </Typography>

              {renderNiveisSection("Níveis de Probabilidade", "niveisProbabilidade")}
              {renderNiveisSection("Níveis de Intensidade", "niveisIntensidade")}
              {renderNiveisSection("Níveis de Abrangência", "niveisAbrangencia", true, formData.abrangencia)}
              {renderNiveisSection("Níveis de Urgência/Prioridade", "niveisPrioridade", true, formData.urgencia)}
              {renderNiveisSection("Níveis de Importância das Partes Interessadas", "niveisImportanciaPI", true, formData.partesInteressadas)}
            </Grid>
          )}

          {/* Botões de ação */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={tratarSubmit}
                disabled={requisicao === "Editar" && !hasChanges}
                sx={{ minWidth: 120 }}
              >
                {requisicao === "Criar" ? "Criar" : "Atualizar"}
              </Button>
              <Button
                variant="outlined"
                onClick={voltarParaCadastroMenu}
                sx={{ minWidth: 120 }}
              >
                Cancelar
              </Button>
            </Box>
          </Grid>
        </Grid>

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
            Perfil ESG criado com sucesso!
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
              O perfil ESG foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
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

export default NovoPerfilEsg;
