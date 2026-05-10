/* eslint-disable react-hooks/exhaustive-deps */
import { API_URL } from 'config';
import * as React from "react";
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
  Divider,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";

const eixosEsg = [
  { id: 1, nome: "Ambiental" },    // 1 = Environmental
  { id: 2, nome: "Governança" },   // 2 = Governance
  { id: 3, nome: "Social" },       // 3 = Social
];


// ==============================|| NOVO TEMA ESG ||============================== //
function NovoTema() {
  const { token } = useToken();
  const navigate = useNavigate();
  const { themeCode } = useParams();
  const location = useLocation();
  const { temaDados } = location.state || {};
  const [localTemaDados, setLocalTemaDados] = useState(temaDados || null);

  const [indicadores, setIndicadores] = useState([]);
  const [gruposTema, setGruposTema] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [ods, setOds] = useState([]);
  const [capitais, setCapitais] = useState([]);
  const [esgImpacts, setEsgImpacts] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [riscos, setRiscos] = useState([]);
  const [planosAcao, setPlanosAcao] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [frameworkTopics, setFrameworkTopics] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);

  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    id: "",
    codigoTema: "",
    nomeTema: "",
    descricaoTema: "",
    responsavel: null,
    eixoEsg: null,
    criteriosRelacionadosAvaliados: [],
    grupoTema: [],
    indicadoresTema: [],
    stakeholders: [],
    ods: [],
    capitais: [],
    impactosEsg: [],
    empresaTema: [],
    processoTema: [],
    departamentoTema: [],
    riscoTema: [],
    planoAcao: [],
    frameworks: [],
    frameTopics: [],
    statusTema: true,
  });

  // Fetch all options
  useEffect(() => {
    const fetchOptions = async () => {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const requests = [
          { url: `${API_URL}Indicator`, setter: setIndicadores, nameKey: 'indicatorName' },
          { url: `${API_URL}ThemeGroup`, setter: setGruposTema, nameKey: 'themeGroupName' },
          { url: `${API_URL}SDG`, setter: setOds, nameKey: 'sdgName' },
          { url: `${API_URL}Stakeholder`, setter: setStakeholders, nameKey: 'name', filterActive: true },
          { url: `${API_URL}collaborators`, setter: setColaboradores, nameKey: 'name' },
          { url: `${API_URL}departments`, setter: setDepartamentos, nameKey: 'departmentName' },
          { url: `${API_URL}companies`, setter: setEmpresas, nameKey: 'companyName' },
          { url: `${API_URL}processes`, setter: setProcessos, nameKey: 'processName' },
          { url: `${API_URL}risks`, setter: setRiscos, nameKey: 'riskName' },
          { url: `${API_URL}Framework`, setter: setFrameworks, nameKey: 'frameworkName' },
          { url: `${API_URL}FrameworkTopic`, setter: setFrameworkTopics, nameKey: 'frameworkTopicName' },
          { url: `${API_URL}action-plans`, setter: setPlanosAcao, nameKey: 'name' },
          { url: `${API_URL}ESGImpact`, setter: setEsgImpacts, nameKey: 'impactESGName' },
          { url: `${API_URL}Theme/capitals`, setter: setCapitais, nameKey: 'name' },
        ];

        await Promise.all(requests.map(async (req) => {
          try {
            const res = await axios.get(req.url, { headers });
            let data = res.data || [];
            // Filtra globalmente garantindo que itens com active ou status definidos como false não sejam exibidos nos seletores
            data = data.filter(item => {
              if (item.active !== undefined) return item.active === true;
              if (item.status !== undefined) return item.status === true;
              return true;
            });
            const mappedData = data.map(item => {
              const id = item.id || item.idActionPlan || item.idCompany || item.idProcess || item.idDepartment || item.idRisk || item.idCollaborator || item.idThemeGroup || item.indicatorId || item.sdgId || item.idFramework || item.idFrameworkTopic || item.idStakeholder;
              return {
                ...item,
                id: id,
                nome: item[req.nameKey] || item.nome || item.name || id
              };
            });
            req.setter(mappedData);
          } catch (e) {
            console.error(`Error fetching ${req.url}:`, e);
          }
        }));
        setOptionsLoading(false);
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, [token]);

  // Se não houver temaDados no state, mas houver themeCode no param, buscar da API
  useEffect(() => {
    const fetchByCode = async () => {
      if (themeCode && token) {
        setLoading(true);
        try {
          const res = await axios.get(`${API_URL}Theme/Code/${themeCode}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data) {
            setLocalTemaDados(res.data);
          }
        } catch (error) {
          console.error("Erro ao buscar tema por código:", error);
          enqueueSnackbar("Não foi possível carregar os dados do tema.", { variant: "error" });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchByCode();
  }, [themeCode, token]);

  // Handle Edit Mode from State
  useEffect(() => {
    if (localTemaDados && !optionsLoading) {
      setRequisicao("Editar");
      setMensagemFeedback("editado");

      const findItem = (list, id, key = 'id') => list.find(item => item[key] === id) || null;
      const findMultiple = (list, ids, key = 'id') => list.filter(item => ids?.includes(item[key]));

      setFormData({
        id: localTemaDados.id || "",
        codigoTema: localTemaDados.themeCode || "",
        nomeTema: localTemaDados.themeName || "",
        descricaoTema: localTemaDados.themeDescription || "",
        responsavel: findItem(colaboradores, localTemaDados.responsibleId, 'idCollaborator'),
        eixoEsg: findItem(eixosEsg, localTemaDados.esgAxis),
        grupoTema: findMultiple(gruposTema, localTemaDados.themeThemeGroups?.map(x => x.id) || localTemaDados.themeGroupIds || []),
        indicadoresTema: findMultiple(indicadores, localTemaDados.themeIndicators?.map(x => x.id) || localTemaDados.indicatorIds || []),
        stakeholders: findMultiple(stakeholders, localTemaDados.themeStakeholders?.map(x => x.id) || localTemaDados.stakeholderIds || []),
        ods: findMultiple(ods, localTemaDados.themeSDGs?.map(x => x.id) || localTemaDados.sdgIds || []),
        capitais: findMultiple(capitais, localTemaDados.themeCapitals?.map(x => x.id) || localTemaDados.capitalIds || []),
        impactosEsg: findMultiple(esgImpacts, (localTemaDados.themeESGImpacts || []).map(x => x.esgImpactId)).map(impact => {
          const apiRelation = (localTemaDados.themeESGImpacts || []).find(x => x.esgImpactId === impact.id);
          let context = [];
          if (apiRelation?.isFinancialSignificance) context.push(1);
          if (apiRelation?.isImpactSignificance) context.push(2);
          return { ...impact, significanceContext: context };
        }),
        empresaTema: findMultiple(empresas, localTemaDados.themeCompanies?.map(x => x.id) || localTemaDados.companyIds || []),
        processoTema: findMultiple(processos, localTemaDados.themeProcesses?.map(x => x.id) || localTemaDados.processIds || []),
        departamentoTema: findMultiple(departamentos, localTemaDados.themeDepartments?.map(x => x.id) || localTemaDados.departmentIds || []),
        riscoTema: findMultiple(riscos, localTemaDados.themeRisks?.map(x => x.id) || localTemaDados.riskIds || []),
        planoAcao: findMultiple(planosAcao, localTemaDados.themeActionPlans?.map(x => x.id) || localTemaDados.actionPlanIds || []),
        frameworks: findMultiple(frameworks, localTemaDados.themeFrameworks?.map(x => x.id) || localTemaDados.frameworkIds || []),
        frameTopics: findMultiple(frameworkTopics, localTemaDados.themeFrameTopics?.map(x => x.id) || localTemaDados.frameTopicIds || []),
        statusTema: localTemaDados.active ?? true,
      });
      setHasChanges(false);
    }
  }, [localTemaDados, colaboradores, gruposTema, indicadores, stakeholders, ods, capitais, esgImpacts, empresas, processos, departamentos, riscos, planosAcao, frameworks, frameworkTopics, optionsLoading]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleMultiSelectChange = (field) => (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    setHasChanges(true);
  };


  const [formValidation, setFormValidation] = useState({
    codigoTema: true,
    nomeTema: true,
    descricaoTema: true,
    responsavel: true,
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

  const validarCodigoTema = (codigo) => {
    // Regra: máximo de 10 caracteres e não pode repetir
    if (codigo.length > 10) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const validarNomeTema = (nome) => {
    // Regra: tamanho curto e não pode repetir
    if (nome.length > 100) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const tratarSubmit = async () => {
    const missingFields = [];

    if (!formData.codigoTema.trim() || !validarCodigoTema(formData.codigoTema)) {
      setFormValidation(prev => ({ ...prev, codigoTema: false }));
      missingFields.push("Código do Tema");
    }

    if (!formData.nomeTema.trim() || !validarNomeTema(formData.nomeTema)) {
      setFormValidation(prev => ({ ...prev, nomeTema: false }));
      missingFields.push("Nome do Tema");
    }

    if (!formData.descricaoTema.trim()) {
      setFormValidation(prev => ({ ...prev, descricaoTema: false }));
      missingFields.push("Descrição do Tema");
    }

    if (!formData.responsavel) {
      setFormValidation(prev => ({ ...prev, responsavel: false }));
      missingFields.push("Responsável");
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

      // Helper: extrai IDs válidos, sem nulos e sem duplicatas
      const uniqueIds = (arr) => [...new Set(arr.map(i => i.id).filter(id => id && id !== ''))];

      const payload = {
        id: requisicao === "Editar" ? formData.id : undefined,
        themeCode: formData.codigoTema,
        themeName: formData.nomeTema,
        themeDescription: formData.descricaoTema,
        responsibleId: formData.responsavel?.id || formData.responsavel?.idCollaborator || null,
        esgAxis: formData.eixoEsg?.id || 0,
        active: formData.statusTema,
        frameworkIds: uniqueIds(formData.frameworks),
        frameTopicIds: uniqueIds(formData.frameTopics),
        themeGroupIds: uniqueIds(formData.grupoTema),
        indicatorIds: uniqueIds(formData.indicadoresTema),
        stakeholderIds: uniqueIds(formData.stakeholders),
        sdgIds: uniqueIds(formData.ods),
        capitalIds: uniqueIds(formData.capitais),
        sdgCapitalIds: [],
        themeESGImpacts: (formData.impactosEsg || []).map(i => ({
          esgImpactId: i.id,
          isFinancialSignificance: Array.isArray(i.significanceContext) ? i.significanceContext.includes(1) : (i.significanceContext === 1 || i.significanceContext === 3),
          isImpactSignificance: Array.isArray(i.significanceContext) ? i.significanceContext.includes(2) : (i.significanceContext === 2 || i.significanceContext === 3)
        })),
        companyIds: uniqueIds(formData.empresaTema),
        processIds: uniqueIds(formData.processoTema),
        departmentIds: uniqueIds(formData.departamentoTema),
        riskIds: uniqueIds(formData.riscoTema),
        actionPlanIds: uniqueIds(formData.planoAcao),
      };

      const url = `${API_URL}Theme`;
      const method = requisicao === "Editar" ? "put" : "post";

      await axios({
        method,
        url,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      enqueueSnackbar(`Tema ESG ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar o tema ESG.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isActive={loading || optionsLoading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={3} marginTop={1}>

          {/* Seção: Informações Básicas */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Informações Básicas do Tema
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Código do Tema *</InputLabel>
              <TextField
                fullWidth
                value={formData.codigoTema}
                onChange={(e) => handleInputChange('codigoTema', e.target.value)}
                error={!formData.codigoTema && formValidation.codigoTema === false}
                placeholder="Digite o código do tema (máx. 10 caracteres)"
                inputProps={{ maxLength: 10 }}
                disabled={requisicao === "Editar"}
                helperText={requisicao === "Editar" ? "O código não pode ser alterado na edição." : "Máximo de 10 caracteres. Deve ser único."}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Tema *</InputLabel>
              <TextField
                fullWidth
                value={formData.nomeTema}
                onChange={(e) => handleInputChange('nomeTema', e.target.value)}
                error={!formData.nomeTema && formValidation.nomeTema === false}
                placeholder="Digite o nome do tema"
                helperText="Tamanho curto. Deve ser único."
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Descrição do Tema *</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.descricaoTema}
                onChange={(e) => handleInputChange('descricaoTema', e.target.value)}
                error={!formData.descricaoTema && formValidation.descricaoTema === false}
                placeholder="Digite a descrição detalhada do tema"
                helperText="Descrição longa do tema."
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Padrão/Framework</InputLabel>
              <Autocomplete
                multiple
                options={frameworks}
                getOptionLabel={(option) => option.nome || ""}
                value={formData.frameworks}
                onChange={handleMultiSelectChange('frameworks')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os padrões" />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Tópico do Padrão</InputLabel>
              <Autocomplete
                multiple
                options={frameworkTopics}
                getOptionLabel={(option) => option.nome || ""}
                value={formData.frameTopics}
                onChange={handleMultiSelectChange('frameTopics')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os tópicos" />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Responsável *</InputLabel>
              <Autocomplete
                options={colaboradores}
                getOptionLabel={(option) => option.nome}
                value={formData.responsavel}
                onChange={(event, newValue) => handleInputChange('responsavel', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.responsavel && formValidation.responsavel === false}
                    placeholder="Selecione o responsável"
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Seção: Classificação ESG */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Classificação ESG
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Eixo ESG</InputLabel>
              <Autocomplete
                options={eixosEsg}
                getOptionLabel={(option) => option.nome}
                value={formData.eixoEsg}
                onChange={(event, newValue) => handleInputChange('eixoEsg', newValue)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione o eixo ESG" />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Grupo do Tema</InputLabel>
              <Autocomplete
                multiple
                options={gruposTema}
                getOptionLabel={(option) => option.nome}
                value={formData.grupoTema}
                onChange={handleMultiSelectChange('grupoTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os grupos" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Indicadores do Tema</InputLabel>
              <Autocomplete
                multiple
                options={indicadores}
                getOptionLabel={(option) => option.nome}
                value={formData.indicadoresTema}
                onChange={handleMultiSelectChange('indicadoresTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os indicadores" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          {/* Seção: Stakeholders e Relacionamentos */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Stakeholders e Relacionamentos
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Stakeholders</InputLabel>
              <Autocomplete
                multiple
                options={stakeholders}
                getOptionLabel={(option) => option.nome}
                value={formData.stakeholders}
                onChange={handleMultiSelectChange('stakeholders')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os stakeholders" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>ODS Relacionados</InputLabel>
              <Autocomplete
                multiple
                options={ods}
                getOptionLabel={(option) => option.nome}
                value={formData.ods}
                onChange={handleMultiSelectChange('ods')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os ODS" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Capitais Relacionados</InputLabel>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={capitais}
                getOptionLabel={(option) => option.nome}
                value={formData.capitais}
                onChange={handleMultiSelectChange('capitais')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os capitais" />
                )}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      size="small"
                      checked={selected}
                      style={{ marginRight: 8 }}
                    />
                    {option.nome}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          {/* Seção: Impactos e Significância */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Gestão de Impactos ESG
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Selecione os impactos relacionados a este tema e, em seguida, defina o contexto de significância para cada um.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Impactos ESG Relacionados</InputLabel>
              <Autocomplete
                multiple
                options={esgImpacts}
                getOptionLabel={(option) => option.nome}
                value={formData.impactosEsg || []}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, newValue) => {
                  const merged = newValue.map(item => {
                    const existing = (formData.impactosEsg || []).find(i => i.id === item.id);
                    return existing ? existing : { ...item, significanceContext: [1, 2] }; // Padrão: Ambos
                  });
                  setFormData(prev => ({ ...prev, impactosEsg: merged }));
                  setHasChanges(true);
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Pesquise e adicione impactos" />
                )}
                renderOption={(props, option) => (
                  <li {...props} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ fontWeight: 'bold' }}>{option.nome}</Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {option.impactNature === 1 && <Chip size="small" label="+ Positivo" color="success" variant="outlined" />}
                      {option.impactNature === 2 && <Chip size="small" label="- Negativo" color="error" variant="outlined" />}
                      <Chip size="small" label={option.impactType === 1 ? 'Real' : (option.impactType === 2 ? 'Potencial' : 'Não classificado')} color="default" variant="outlined" />
                    </Box>
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          {formData.impactosEsg?.length > 0 && (
            <Grid item xs={12}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Nome do Impacto</TableCell>
                      <TableCell>Natureza</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="center">Sig. Financeira</TableCell>
                      <TableCell align="center">Sig. de Impacto</TableCell>
                      <TableCell align="center">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.impactosEsg.map((impact) => {
                      const context = impact.significanceContext || [];
                      const isFinancial = context.includes(1);
                      const isImpact = context.includes(2);

                      const handleCheck = (val, checked) => {
                        let newContext = [...context];
                        if (checked) {
                          if (!newContext.includes(val)) newContext.push(val);
                        } else {
                          newContext = newContext.filter(v => v !== val);
                        }
                        setFormData(prev => ({
                          ...prev,
                          impactosEsg: prev.impactosEsg.map(i => i.id === impact.id ? { ...i, significanceContext: newContext } : i)
                        }));
                        setHasChanges(true);
                      };

                      return (
                        <TableRow key={impact.id} hover>
                          <TableCell sx={{ fontWeight: '500' }}>{impact.nome}</TableCell>
                          <TableCell>
                            {impact.impactNature === 1 && <Chip size="small" label="+ Positivo" sx={{ bgcolor: '#dcedc8', color: '#33691e', fontWeight: 'bold' }} />}
                            {impact.impactNature === 2 && <Chip size="small" label="- Negativo" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 'bold' }} />}
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={impact.impactType === 1 ? 'Real' : (impact.impactType === 2 ? 'Potencial' : 'Não classificado')} variant="outlined" />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox 
                              color="primary" 
                              checked={isFinancial} 
                              onChange={(e) => handleCheck(1, e.target.checked)} 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox 
                              color="primary" 
                              checked={isImpact} 
                              onChange={(e) => handleCheck(2, e.target.checked)} 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  impactosEsg: prev.impactosEsg.filter(i => i.id !== impact.id)
                                }));
                                setHasChanges(true);
                              }}
                            >
                              <DeleteOutlineIcon color="error" fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {/* Seção: Organização e Gestão */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Organização e Gestão
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Empresa</InputLabel>
              <Autocomplete
                multiple
                options={empresas}
                getOptionLabel={(option) => option.nome}
                value={formData.empresaTema}
                onChange={handleMultiSelectChange('empresaTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione as empresas" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Processo</InputLabel>
              <Autocomplete
                multiple
                options={processos}
                getOptionLabel={(option) => option.nome}
                value={formData.processoTema}
                onChange={handleMultiSelectChange('processoTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os processos" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Departamento</InputLabel>
              <Autocomplete
                multiple
                options={departamentos}
                getOptionLabel={(option) => option.nome}
                value={formData.departamentoTema}
                onChange={handleMultiSelectChange('departamentoTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os departamentos" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Riscos</InputLabel>
              <Autocomplete
                multiple
                options={riscos}
                getOptionLabel={(option) => option.nome}
                value={formData.riscoTema}
                onChange={handleMultiSelectChange('riscoTema')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os riscos" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Plano de Ação</InputLabel>
              <Autocomplete
                multiple
                options={planosAcao}
                getOptionLabel={(option) => option.nome}
                value={formData.planoAcao}
                onChange={handleMultiSelectChange('planoAcao')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecione os planos de ação" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Stack>
          </Grid>

          {/* Seção: Informações Automáticas */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Histórico de priorização
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Ciclo de Priorização</InputLabel>
              <TextField
                fullWidth
                value={formData.cicloPriorizacao || "Será definido automaticamente"}
                InputProps={{ readOnly: true }}
                helperText="Campo preenchido automaticamente na tela de priorização"
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Status do Tema</InputLabel>
              <TextField
                fullWidth
                value={formData.statusTema ? "Ativo" : "Inativo"}
                InputProps={{ readOnly: true }}
                helperText="Status baseado na última priorização realizada"
              />
            </Stack>
          </Grid>

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
                sx={{ minWidth: 120 }}
                disabled={
                  (requisicao === "Editar" && !hasChanges) ||
                  (requisicao === "Criar" && (!formData.codigoTema.trim() || !formData.nomeTema.trim() || !formData.descricaoTema.trim() || !formData.responsavel))
                }
              >
                {requisicao === "Criar" ? "Criar" : "Salvar"}
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
            Tema ESG criado com sucesso!
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
              O tema ESG foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
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

export default NovoTema;

