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
  Chip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { API_URL } from 'config';

// ==============================|| NOVO PADRÕES E FRAMEWORKS ||============================== //
function NovoPadroesFrameworks() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { padraoFrameworkDados } = location.state || {};
  const { topicCode: routeTopicCode } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);

  const [orgaosReguladores, setOrgaosReguladores] = useState([]);
  const [niveisTopico, setNiveisTopico] = useState([]);
  const [pilaresTopico, setPilaresTopico] = useState([
    { id: 1, nome: "Ambiental" },
    { id: 2, nome: "Social" },
    { id: 3, nome: "Governança" },
  ]);
  const [gruposTopico, setGruposTopico] = useState([]);
  const [temasEsg, setTemasEsg] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [motivosRevogacao, setMotivosRevogacao] = useState([]);
  const [topicosSuperior, setTopicosSuperior] = useState([]);
  const [topicosInferior, setTopicosInferior] = useState([]);
  
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    // Campos obrigatórios do tópico
    codigoTopico: "",
    nomeTopico: "",
    descricaoTopico: "",
    requisitos: "",
    orientacoes: "",
    
    // Campos obrigatórios do padrão ESG
    codigoPadraoEsg: "",
    nomePadraoEsg: "",
    descricaoPadraoEsg: "",
    
    // Campos de seleção
    nomeOrgaoRegulador: null,
    nivelTopico: null,
    topicoSuperior: null,
    topicoInferior: [],
    pilarTopico: null,
    grupoTopico: [],
    temaEsg: [],
    responsavel: null,
    indicador: [],
    
    // Campos de texto longo
    requisitos: "",
    orientacoes: "",
    
    // Campos de data
    dataPublicacao: null,
    dataRevogacao: null,
    motivoRevogacao: null,
    
    // Anexos
    anexos: [],
  });

  // Fetch all options
  useEffect(() => {
    const fetchOptions = async () => {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch specific configs
        try {
           const configsRes = await axios.get(`${API_URL}Framework/configs`, { headers });
           const cData = configsRes.data || {};
           if (cData.regulatoryBodies) setOrgaosReguladores(cData.regulatoryBodies.map(i => ({...i, nome: i.name})));
           if (cData.topicLevels) setNiveisTopico(cData.topicLevels.map(i => ({...i, nome: i.name})));
           if (cData.topicGroups) setGruposTopico(cData.topicGroups.map(i => ({...i, nome: i.name})));
           if (cData.revocationReasons) setMotivosRevogacao(cData.revocationReasons.map(i => ({...i, nome: i.name})));
           // if topics are also here:
           if (cData.topics) {
               setTopicosSuperior(cData.topics.map(i => ({...i, nome: i.topicName})));
               setTopicosInferior(cData.topics.map(i => ({...i, nome: i.topicName})));
           }
        } catch (e) {
           console.error("Error fetching configs:", e);
        }

        const requests = [
          { url: `${API_URL}Theme`, setter: setTemasEsg, nameKey: 'themeName' },
          { url: `${API_URL}Indicator`, setter: setIndicadores, nameKey: 'indicatorName' },
          { url: `${API_URL}collaborators`, setter: setColaboradores, nameKey: 'name' }
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
              const id = item.id || item.idCollaborator || item.indicatorId || item.idTheme;
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

  // Em caso de edição
  useEffect(() => {
    const fetchEditData = async () => {
      const code = routeTopicCode || padraoFrameworkDados?.topicCode || padraoFrameworkDados?.codigoTopico;
      if (code && token && !optionsLoading) {
        setRequisicao("Editar");
        setMensagemFeedback("editado");
        setLoading(true);
        try {
          const res = await axios.get(`${API_URL}Framework/topic/code/${code}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = res.data;
          if (data) {
            const findItem = (list, id, key = 'id') => list.find(item => item[key] === id) || null;
            const findMultiple = (list, ids, key = 'id') => list.filter(item => ids?.includes(item[key]));

            setFormData({
              id: data.id || "",
              codigoTopico: data.topicCode || "",
              nomeTopico: data.topicName || "",
              descricaoTopico: data.topicDescription || "",
              requisitos: data.requirements || "",
              orientacoes: data.guidelines || "",
              codigoPadraoEsg: data.frameworkCode || "",
              nomePadraoEsg: data.frameworkName || "",
              descricaoPadraoEsg: data.frameworkDescription || "",
              nomeOrgaoRegulador: findItem(orgaosReguladores, data.regulatoryBodyId),
              nivelTopico: findItem(niveisTopico, data.topicLevelId),
              topicoSuperior: findItem(topicosSuperior, data.parentTopicId),
              topicoInferior: findMultiple(topicosInferior, data.childTopicIds || []),
              pilarTopico: pilaresTopico.find(p => p.id === data.topicPillar || p.nome === data.topicPillar) || null,
              grupoTopico: findMultiple(gruposTopico, data.topicGroupIds || []),
              temaEsg: findMultiple(temasEsg, data.themeIds || []),
              responsavel: findItem(colaboradores, data.responsibleId),
              indicador: findMultiple(indicadores, data.indicatorIds || []),
              dataPublicacao: data.publicationDate ? new Date(data.publicationDate) : null,
              dataRevogacao: data.revocationDate ? new Date(data.revocationDate) : null,
              motivoRevogacao: findItem(motivosRevogacao, data.revocationReasonId),
              anexos: data.attachments || []
            });
          }
        } catch (e) {
          console.error("Erro ao carregar dados de edição:", e);
          enqueueSnackbar("Não foi possível carregar os dados para edição.", { variant: "error" });
        } finally {
          setLoading(false);
          setHasChanges(false);
        }
      }
    };
    fetchEditData();
  }, [padraoFrameworkDados, token, optionsLoading]);

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

  const handlePilarChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      pilarTopico: newValue,
      grupoTopico: [] // Reset grupos quando muda pilar
    }));
    setHasChanges(true);
  };

  const getGruposPorPilar = () => {
    if (!formData.pilarTopico) return [];
    return gruposTopico.filter(grupo => grupo.pilar === formData.pilarTopico.nome);
  };

  const [formValidation, setFormValidation] = useState({
    codigoTopico: true,
    nomeTopico: true,
    descricaoTopico: true,
    codigoPadraoEsg: true,
    nomePadraoEsg: true,
    descricaoPadraoEsg: true,
    nomeOrgaoRegulador: true,
    requisitos: true,
    orientacoes: true,
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

  const validarCodigoTopico = (codigo) => {
    // Regra: máximo de 10 caracteres e não pode repetir
    if (codigo.length > 10) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const validarNomeTopico = (nome) => {
    // Regra: tamanho curto e não pode repetir
    if (nome.length > 100) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const validarCodigoPadrao = (codigo) => {
    // Regra: máximo de 10 caracteres e não pode repetir
    if (codigo.length > 10) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const validarNomePadrao = (nome) => {
    // Regra: tamanho curto e não pode repetir
    if (nome.length > 100) {
      return false;
    }
    // Aqui você faria a validação de duplicação com a API
    return true;
  };

  const tratarSubmit = async () => {
    const missingFields = [];
    
    if (!formData.codigoTopico.trim() || !validarCodigoTopico(formData.codigoTopico)) {
      setFormValidation(prev => ({ ...prev, codigoTopico: false }));
      missingFields.push("Código do Tópico");
    }
    
    if (!formData.nomeTopico.trim() || !validarNomeTopico(formData.nomeTopico)) {
      setFormValidation(prev => ({ ...prev, nomeTopico: false }));
      missingFields.push("Nome do Tópico");
    }
    
    if (!formData.descricaoTopico.trim()) {
      setFormValidation(prev => ({ ...prev, descricaoTopico: false }));
      missingFields.push("Descrição do Tópico");
    }

    if (!formData.requisitos.trim()) {
      setFormValidation(prev => ({ ...prev, requisitos: false }));
      missingFields.push("Requisitos");
    }

    if (!formData.orientacoes.trim()) {
      setFormValidation(prev => ({ ...prev, orientacoes: false }));
      missingFields.push("Orientações");
    }




    

    
    if (!formData.codigoPadraoEsg.trim() || !validarCodigoPadrao(formData.codigoPadraoEsg)) {
      setFormValidation(prev => ({ ...prev, codigoPadraoEsg: false }));
      missingFields.push("Código do Padrão ESG");
    }
    
    if (!formData.nomePadraoEsg.trim() || !validarNomePadrao(formData.nomePadraoEsg)) {
      setFormValidation(prev => ({ ...prev, nomePadraoEsg: false }));
      missingFields.push("Nome do Padrão ESG");
    }
    
    if (!formData.descricaoPadraoEsg.trim()) {
      setFormValidation(prev => ({ ...prev, descricaoPadraoEsg: false }));
      missingFields.push("Descrição do Padrão ESG");
    }
    
    if (!formData.nomeOrgaoRegulador) {
      setFormValidation(prev => ({ ...prev, nomeOrgaoRegulador: false }));
      missingFields.push("Nome do Órgão Regulador");
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

    // Validação específica: motivo de revogação obrigatório quando há data de revogação
    if (formData.dataRevogacao && !formData.motivoRevogacao) {
      enqueueSnackbar("Motivo de revogação é obrigatório quando há data de revogação!", {
        variant: "error",
      });
      return;
    }

    try {
      setLoading(true);
      
      const uniqueIds = (arr) => [...new Set((arr || []).map(i => i.id).filter(id => id && id !== ''))];
      
      const payload = {
        id: requisicao === "Editar" ? formData.id : undefined,
        topicCode: formData.codigoTopico,
        topicName: formData.nomeTopico,
        topicDescription: formData.descricaoTopico,
        requirements: formData.requisitos,
        guidelines: formData.orientacoes,
        frameworkCode: formData.codigoPadraoEsg,
        frameworkName: formData.nomePadraoEsg,
        frameworkDescription: formData.descricaoPadraoEsg,
        regulatoryBodyId: formData.nomeOrgaoRegulador?.id || null,
        topicLevelId: formData.nivelTopico?.id || null,
        parentTopicId: formData.topicoSuperior?.id || null,
        childTopicIds: uniqueIds(formData.topicoInferior),
        topicPillar: formData.pilarTopico?.id || 0,
        topicGroupIds: uniqueIds(formData.grupoTopico),
        themeIds: uniqueIds(formData.temaEsg),
        responsibleId: formData.responsavel?.id || null,
        indicatorIds: uniqueIds(formData.indicador),
        publicationDate: formData.dataPublicacao ? formData.dataPublicacao.toISOString() : null,
        revocationDate: formData.dataRevogacao ? formData.dataRevogacao.toISOString() : null,
        revocationReasonId: formData.motivoRevogacao?.id || null,
      };

      const url = `${API_URL}Framework/topic`;
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
      
      enqueueSnackbar(`Padrão/Framework ESG ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });

      if (requisicao === "Criar") {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível salvar o padrão/framework ESG.", {
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
        <Grid container spacing={3} marginTop={1}>
          
          {/* Seção: Informações do Tópico */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Informações do Tópico
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Código do Tópico *</InputLabel>
              <TextField
                fullWidth
                value={formData.codigoTopico}
                onChange={(e) => handleInputChange('codigoTopico', e.target.value)}
                error={!formData.codigoTopico && formValidation.codigoTopico === false}
                placeholder="Digite o código do tópico (máx. 10 caracteres)"
                inputProps={{ maxLength: 10 }}
                helperText="Máximo de 10 caracteres. Deve ser único."
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Tópico *</InputLabel>
              <TextField
                fullWidth
                value={formData.nomeTopico}
                onChange={(e) => handleInputChange('nomeTopico', e.target.value)}
                error={!formData.nomeTopico && formValidation.nomeTopico === false}
                placeholder="Digite o nome do tópico"
                helperText="Tamanho curto. Deve ser único."
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Descrição do Tópico *</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.descricaoTopico}
                onChange={(e) => handleInputChange('descricaoTopico', e.target.value)}
                error={!formData.descricaoTopico && formValidation.descricaoTopico === false}
                placeholder="Digite a descrição detalhada do tópico"
                helperText="Descrição longa do tópico."
              />
            </Stack>
          </Grid>


          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Requisitos *</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.requisitos}
                onChange={(e) => handleInputChange('requisitos', e.target.value)}
                error={!formData.requisitos && formValidation.requisitos === false}
                placeholder="Inclua os requisitos que vêm nos frameworks"
                helperText="Requisitos do framework. Campo de texto longo."
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Orientações *</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.orientacoes}
                onChange={(e) => handleInputChange('orientacoes', e.target.value)}
                error={!formData.orientacoes && formValidation.orientacoes === false}
                placeholder="Inclua as orientações que vêm nos frameworks"
                helperText="Orientações do framework. Campo de texto longo."
              />
            </Stack>
          </Grid>

          {/* Seção: Informações do Padrão ESG */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Informações do Padrão ESG
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Código do Padrão ESG *</InputLabel>
              <TextField
                fullWidth
                value={formData.codigoPadraoEsg}
                onChange={(e) => handleInputChange('codigoPadraoEsg', e.target.value)}
                error={!formData.codigoPadraoEsg && formValidation.codigoPadraoEsg === false}
                placeholder="Digite o código do padrão (máx. 10 caracteres)"
                inputProps={{ maxLength: 10 }}
                helperText="Máximo de 10 caracteres. Deve ser único."
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Padrão ESG *</InputLabel>
              <TextField
                fullWidth
                value={formData.nomePadraoEsg}
                onChange={(e) => handleInputChange('nomePadraoEsg', e.target.value)}
                error={!formData.nomePadraoEsg && formValidation.nomePadraoEsg === false}
                placeholder="Digite o nome do padrão"
                helperText="Tamanho curto. Deve ser único."
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Descrição do Padrão ESG *</InputLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.descricaoPadraoEsg}
                onChange={(e) => handleInputChange('descricaoPadraoEsg', e.target.value)}
                error={!formData.descricaoPadraoEsg && formValidation.descricaoPadraoEsg === false}
                placeholder="Digite a descrição detalhada do padrão ou framework"
                helperText="Descrição longa do padrão ou framework."
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nome do Órgão Regulador *</InputLabel>
              <Autocomplete
                options={orgaosReguladores}
                getOptionLabel={(option) => option.nome}
                value={formData.nomeOrgaoRegulador}
                onChange={(event, newValue) => handleInputChange('nomeOrgaoRegulador', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!formData.nomeOrgaoRegulador && formValidation.nomeOrgaoRegulador === false}
                    placeholder="Selecione o órgão regulador"
                    helperText="Ex: GRI, ONU, IFRS, SASB, TCFD, etc."
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Seção: Classificação e Hierarquia */}
          <Grid item xs={12}>
            <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.12)' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: 'rgba(0, 0, 0, 0.85)', 
                mb: 2,
                fontSize: '1.1rem' 
              }}
            >
              Classificação e Hierarquia
            </Typography>
          </Grid>

          {/* Linha 1 */}
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Nível do Tópico</InputLabel>
              <Autocomplete
                options={niveisTopico}
                getOptionLabel={(option) => option.nome}
                value={formData.nivelTopico}
                onChange={(event, newValue) => handleInputChange('nivelTopico', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecione o nível"
                    helperText="Ex: standard, grupo, seção, tópico, requisito, indicador"
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Tópico Superior</InputLabel>
              <Autocomplete
                options={topicosSuperior}
                getOptionLabel={(option) => option.nome}
                value={formData.topicoSuperior}
                onChange={(event, newValue) => handleInputChange('topicoSuperior', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecione o tópico superior"
                    helperText="Indica o tópico superior a este tópico (apenas um)"
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Linha 2 */}
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Tópicos Inferiores</InputLabel>
              <Autocomplete
                multiple
                options={topicosInferior}
                getOptionLabel={(option) => option.nome}
                value={formData.topicoInferior}
                onChange={handleMultiSelectChange('topicoInferior')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecione os tópicos inferiores"
                  />
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
              <InputLabel>Pilar do Tópico</InputLabel>
              <Autocomplete
                options={pilaresTopico}
                getOptionLabel={(option) => option.nome}
                value={formData.pilarTopico}
                onChange={handlePilarChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecione o pilar"
                    helperText="Ex: Ambiental, Social ou Governança"
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Linha 3 */}
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Temas ESG</InputLabel>
              <Autocomplete
                multiple
                options={temasEsg}
                getOptionLabel={(option) => option.nome}
                value={formData.temaEsg}
                onChange={handleMultiSelectChange('temaEsg')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecione os temas ESG"
                    helperText="Indica quais temas estão ligados a este tópico"
                  />
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
              <InputLabel>Indicadores</InputLabel>
              <Autocomplete
                multiple
                options={indicadores}
                getOptionLabel={(option) => option.nome}
                value={formData.indicador}
                onChange={handleMultiSelectChange('indicador')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecione os indicadores"
                    helperText="Conecta indicadores a este padrão/framework"
                  />
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

          {/* Seção: Datas e Responsabilidade */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Datas e Responsabilidade
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Data de Publicação</InputLabel>
              <DatePicker
                value={formData.dataPublicacao}
                onChange={(newValue) => handleInputChange('dataPublicacao', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    placeholder="Selecione a data de publicação"
                    helperText="Data de publicação do padrão"
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Responsável</InputLabel>
              <Autocomplete
                options={colaboradores}
                getOptionLabel={(option) => option.nome}
                value={formData.responsavel}
                onChange={(event, newValue) => handleInputChange('responsavel', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecione o responsável"
                    helperText="Responsável pelo padrão (apenas um)"
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Data de Revogação</InputLabel>
              <DatePicker
                value={formData.dataRevogacao}
                onChange={(newValue) => handleInputChange('dataRevogacao', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    placeholder="Selecione a data de revogação"
                    helperText="Data da revogação da norma (se aplicável)"
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <InputLabel>Motivo da Revogação</InputLabel>
              <Autocomplete
                options={motivosRevogacao}
                getOptionLabel={(option) => option.nome}
                value={formData.motivoRevogacao}
                onChange={(event, newValue) => handleInputChange('motivoRevogacao', newValue)}
                disabled={!formData.dataRevogacao}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Selecione o motivo"
                    helperText="Obrigatório quando há data de revogação"
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Seção: Anexos */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" gutterBottom>
              Anexos
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>Anexos</InputLabel>
              <Box
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "#999",
                    backgroundColor: "#f9f9f9",
                  },
                }}
                onClick={() => {
                  // Aqui você implementaria a lógica de upload de arquivos
                  enqueueSnackbar("Funcionalidade de upload será implementada", {
                    variant: "info",
                  });
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Clique para anexar arquivos em geral
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Permite anexar mais de um arquivo
                </Typography>
              </Box>
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
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={tratarSubmit}
                sx={{ minWidth: "120px" }}
              >
                {requisicao === "Criar" ? "Cadastrar" : "Salvar Alterações"}
              </Button>
              
              <Button
                variant="outlined"
                onClick={voltarParaCadastroMenu}
                sx={{ minWidth: "120px" }}
              >
                Cancelar
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Dialog de sucesso */}
        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: "center", color: "#4caf50" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6">Sucesso!</Typography>
          </DialogTitle>

          <DialogContent>
            <DialogContentText sx={{ color: "#666", fontSize: "14px" }}>
              O padrão/framework ESG foi criado com sucesso. Você pode continuar editando ou voltar para a listagem.
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

export default NovoPadroesFrameworks;

