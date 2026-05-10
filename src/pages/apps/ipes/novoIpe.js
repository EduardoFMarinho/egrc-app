/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import {
  Button,
  Box,
  Chip,
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
import DrawerAtivo from "../configuracoes/novoAtivoDrawerIpes";
import DrawerProcesso from "../configuracoes/novoProcessoDrawerControles";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [tiposInformacao, setTipoInformacoes] = useState([]);
  const [ativos, setAtivos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [descricaoInformacao, setDescricaoInformacao] = useState("");
  const [descricaoGeracao, setDescricaoGeracao] = useState("");
  const [descricaoAcuracidade, setDescricaoAcuracidade] = useState("");
  const [descricaoCompletude, setDescricaoCompletude] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [localInformacao, setLocalInformacao] = useState("");
  const [financeira, setFinanceira] = useState(false);
  const [critica, setCritica] = useState(false);
  const [processoOrigemMap, setProcessoOrigemMap] = useState({}); // Mapeia ID do Processo -> Array de Nomes de Ativos
  const [processosFiltrados, setProcessosFiltrados] = useState([]); // Lista final para exibir no Autocomplete
  // Estados para o Dialog de Aviso de Mudança de Contexto
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [pendingAtivos, setPendingAtivos] = useState([]); // Guarda a seleção temporariamente
  const [editavel, setEditavel] = useState(false);
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState("Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
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
    tipoInformacao: "",
    processo: [],
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
          item.idInformationType ||
          item.idNormative ||
          item.idDepartment ||
          item.idKri ||
          item.idControl ||
          item.idThreat ||
          item.idObjective ||
          item.idLedgerAccount ||
          item.idInformationActivity ||
          item.idAssertion ||
          item.idRisk ||
          item.idDeficiency ||
          item.idPlatform,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData(`https://api.egrc.homologacao.com.br/api/v1/actives`, setAtivos);
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/processes`,
      setProcessos
    );
    fetchData(
      `https://api.egrc.homologacao.com.br/api/v1/ipe/types`,
      setTipoInformacoes
    );
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      setLoading(true);
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `https://api.egrc.homologacao.com.br/api/v1/ipe/${dadosApi.idInformationActivity}`,
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
          setDescricaoInformacao(data.description);
          setDescricaoAcuracidade(data.generationAccuracy);
          setDescricaoCompletude(data.generationCompleteness);
          setDescricaoGeracao(data.generationDescription);
          setLocalInformacao(data.location)
          setFinanceira(data.financialInformation)
          setCritica(data.criticize)
          setEditavel(data.editable)
          setStatus(data.active)
          setFormData((prev) => ({
            ...prev,
            ativo: Array.isArray(data.platforms)
              ? data.platforms.map((u) => u.idPlatform)
              : [],
            processo: Array.isArray(data.idProcesses) ? data.idProcesses : [],
            tipoInformacao: data.idInformationType || null,
          }));
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
          setLoading(false);
        } finally {
          setLoading(false);
          console.log("Requisição finalizada");
        }
      };

      if (dadosApi.idInformationActivity) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi]);

  const tratarMudancaInputGeral = (field, value) => {
    if (field === "categoria") {
      // Guarde apenas o ID do item selecionado
      setFormData({ ...formData, [field]: value ? value.id : null });
    } else {
      // Para outros campos
      setFormData({ ...formData, [field]: value });
    }
  };


  const handleActiveCreated = (newAtivo) => {
    setAtivos((prevAtivos) => [...prevAtivos, newAtivo]);
    setFormData((prev) => ({
      ...prev,
      ativo: [...prev.ativo, newAtivo.id],
    }));
  };

 const handleProcessCreated = (newProcesso) => {
    const processoNormalizado = {
      ...newProcesso,
      idPlatforms: newProcesso.idPlatforms || [],
    };

    setProcessos((prevProcessos) => [...prevProcessos, processoNormalizado]);
    setFormData((prev) => ({
      ...prev,
      processo: [...new Set([...prev.processo, newProcesso.id])],
    }));
  };

const handleSelectAllAtivos = (event, newValue) => {
    let novosAtivosIds = [];

    // Verifica se clicou na opção "Selecionar todos"
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      
      // Se todos os ativos ATIVOS já estiverem selecionados...
      if (allSelectedAtivos) {
        // Desmarcar tudo (Opcional: você pode querer manter os inativos selecionados. 
        // Aqui, vou limpar tudo para ser consistente com o padrão "Toggle")
        novosAtivosIds = []; 
        
        // OPÇÃO ALTERNATIVA: Se quiser manter os inativos selecionados ao desmarcar o "Todos":
        // novosAtivosIds = formData.ativo.filter(id => !ativosAtivosDisponiveis.find(a => a.id === id));
      } else {
        // Selecionar todos os ativos ATIVOS + Manter os que já estavam selecionados (inclusive inativos)
        const idsAtivos = ativosAtivosDisponiveis.map((ativo) => ativo.id);
        // Cria um Set para unir os novos com os que já existiam (sem duplicar)
        novosAtivosIds = [...new Set([...formData.ativo, ...idsAtivos])];
      }
    } else {
      // Seleção manual item a item
      novosAtivosIds = newValue.map((item) => item.id);
    }

    // --- LÓGICA DE INTERCEPTAÇÃO (Mesma lógica que criamos antes) ---
    if (formData.ativo.length === 0 && novosAtivosIds.length > 0 && formData.processo.length > 0) {
      setPendingAtivos(novosAtivosIds);
      setWarningDialogOpen(true);
      return;
    }

    tratarMudancaInputGeral("ativo", novosAtivosIds);
  };

  const confirmarMudancaDeAtivo = () => {
    // CORREÇÃO: Usamos o callback (prev) para garantir que atualizamos 
    // o ativo E limpamos o processo simultaneamente, sem conflitos de estado.
    setFormData((prev) => ({
      ...prev,
      ativo: pendingAtivos, // Aplica o ID do ativo que estava "na espera"
      processo: [],         // Limpa a lista de processos
    }));

    // Fecha o modal e limpa o estado temporário
    setWarningDialogOpen(false);
    setPendingAtivos([]);
  };

 const handleSelectAllProcessos = (event, newValue) => {
    const lastItem = newValue.length > 0 ? newValue[newValue.length - 1] : null;

    if (lastItem && lastItem.id === "all") {
      const todosIds = processosSelecionaveis.map((processo) => processo.id);
      const todosSelecionados =
        todosIds.length > 0 &&
        todosIds.every((id) => formData.processo.includes(id));

      if (todosSelecionados) {
        setFormData({
          ...formData,
          processo: formData.processo.filter((id) => !todosIds.includes(id)),
        });
      } else {
        const novaSelecao = new Set([...formData.processo, ...todosIds]);
        setFormData({ ...formData, processo: Array.from(novaSelecao) });
      }
      return;
    }

    if (lastItem && lastItem.id === "all_vinculados") {
      const vinculadosIds = processosFiltrados.map((processo) => processo.id);
      const todosVinculadosSelecionados =
        vinculadosIds.length > 0 &&
        vinculadosIds.every((id) => formData.processo.includes(id));

      if (todosVinculadosSelecionados) {
        setFormData({
          ...formData,
          processo: formData.processo.filter((id) => !vinculadosIds.includes(id)),
        });
      } else {
        const novaSelecao = new Set([...formData.processo, ...vinculadosIds]);
        setFormData({ ...formData, processo: Array.from(novaSelecao) });
      }
      return;
    }

    if (lastItem && lastItem.id === "all_outros") {
      const outrosIds = processosOutrosDisponiveis.map((processo) => processo.id);
      const todosOutrosSelecionados =
        outrosIds.length > 0 &&
        outrosIds.every((id) => formData.processo.includes(id));

      if (todosOutrosSelecionados) {
        setFormData({
          ...formData,
          processo: formData.processo.filter((id) => !outrosIds.includes(id)),
        });
      } else {
        const novaSelecao = new Set([...formData.processo, ...outrosIds]);
        setFormData({ ...formData, processo: Array.from(novaSelecao) });
      }
      return;
    }

    tratarMudancaInputGeral(
      "processo",
      newValue
        .filter(
          (item) =>
            item.id !== "all" &&
            item.id !== "all_vinculados" &&
            item.id !== "all_outros",
        )
        .map((item) => item.id),
    );
  };

  // Efeito para buscar e filtrar processos a partir dos Ativos selecionados.
  useEffect(() => {
    const atualizarProcessosPorAtivo = async () => {
      const processosAtivosGlobais = processos.filter((processo) => processo.active === true);

      if (formData.ativo.length === 0) {
        setProcessosFiltrados(processosAtivosGlobais);
        setProcessoOrigemMap({});
        return;
      }

      const novoMapaOrigem = {};
      const idsProcessosPermitidos = new Set();
      const ativosSelecionadosSet = new Set(formData.ativo);

      const registrarProcessoVinculado = (idProcesso, nomeAtivo) => {
        if (!idProcesso) return;
        idsProcessosPermitidos.add(idProcesso);

        if (!novoMapaOrigem[idProcesso]) {
          novoMapaOrigem[idProcesso] = [];
        }

        if (nomeAtivo && !novoMapaOrigem[idProcesso].includes(nomeAtivo)) {
          novoMapaOrigem[idProcesso].push(nomeAtivo);
        }
      };

      const getIdAtivo = (ativo) => {
        if (!ativo) return null;
        if (typeof ativo !== "object") return ativo;
        return ativo.idPlatform || ativo.id || null;
      };

      const getIdProcesso = (processo) => {
        if (!processo) return null;
        if (typeof processo !== "object") return processo;
        return processo.idProcess || processo.id || null;
      };

      const promises = formData.ativo.map((ativoId) =>
        axios.get(`https://api.egrc.homologacao.com.br/api/v1/actives/${ativoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      try {
        const results = await Promise.all(promises);

        results.forEach((response) => {
          const dadosAtivo = response.data;
          const nomeAtivo = dadosAtivo.name;
          const processosDoAtivo = dadosAtivo.processes || dadosAtivo.idProcesses || [];

          processosDoAtivo.forEach((processo) => {
            registrarProcessoVinculado(getIdProcesso(processo), nomeAtivo);
          });
        });

        processosAtivosGlobais.forEach((processo) => {
          const vinculosDoProcesso = [
            ...(Array.isArray(processo.idPlatforms) ? processo.idPlatforms : []),
            ...(Array.isArray(processo.platforms) ? processo.platforms : []),
            ...(Array.isArray(processo.actives) ? processo.actives : []),
          ];

          vinculosDoProcesso.forEach((ativoVinculado) => {
            const idAtivo = getIdAtivo(ativoVinculado);

            if (ativosSelecionadosSet.has(idAtivo)) {
              const ativoEncontrado = ativos.find((ativo) => ativo.id === idAtivo);
              registrarProcessoVinculado(processo.id, ativoEncontrado?.nome || ativoEncontrado?.name);
            }
          });
        });

        const listaFiltrada = processosAtivosGlobais.filter((processo) =>
          idsProcessosPermitidos.has(processo.id),
        );

        setProcessosFiltrados(listaFiltrada);
        setProcessoOrigemMap(novoMapaOrigem);
      } catch (error) {
        console.error("Erro ao buscar detalhes dos ativos:", error);
        enqueueSnackbar("Erro ao carregar processos dos ativos selecionados.", {
          variant: "error",
        });
      }
    };

    atualizarProcessosPorAtivo();
  }, [formData.ativo, processos, ativos, token]);

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
    empresaInferior: true,
    nome: true,
  });

// Filtra apenas os ativos que estão com active: true para exibir na lista de opções
  const ativosAtivosDisponiveis = ativos.filter((ativo) => ativo.active);
  const processosAtivosDisponiveis = processos.filter((processo) => processo.active);
  const possuiAtivoSelecionado = formData.ativo.length > 0;
  const processosVinculadosIds = new Set(processosFiltrados.map((processo) => processo.id));
  const processosOutrosDisponiveis = possuiAtivoSelecionado
    ? processosAtivosDisponiveis.filter((processo) => !processosVinculadosIds.has(processo.id))
    : [];
  const processosSelecionaveis = possuiAtivoSelecionado
    ? [...processosFiltrados, ...processosOutrosDisponiveis]
    : processosAtivosDisponiveis;
  const processosAutocompleteOptions = possuiAtivoSelecionado
    ? [
        ...(processosFiltrados.length > 0
          ? [{ id: "all_vinculados", nome: "Selecionar vinculados" }, ...processosFiltrados]
          : []),
        ...(processosOutrosDisponiveis.length > 0
          ? [{ id: "all_outros", nome: "Selecionar outros" }, ...processosOutrosDisponiveis]
          : []),
      ]
    : [{ id: "all", nome: "Selecionar todos" }, ...processosAtivosDisponiveis];
  
  // Verifica se todos os ativos DISPONÍVEIS estão selecionados (para o checkbox do Select All)
  // Nota: Isso ignora se há ativos inativos selecionados no cálculo do "All"
  const allSelectedAtivos = 
    ativosAtivosDisponiveis.length > 0 && 
    ativosAtivosDisponiveis.every(a => formData.ativo.includes(a.id));
  const allSelectedProcessos = 
    processosSelecionaveis.length > 0 && 
    processosSelecionaveis.every(p => formData.processo.includes(p.id));
  const allSelectedProcessosVinculados =
    processosFiltrados.length > 0 &&
    processosFiltrados.every((p) => formData.processo.includes(p.id));
  const allSelectedProcessosOutros =
    processosOutrosDisponiveis.length > 0 &&
    processosOutrosDisponiveis.every((p) => formData.processo.includes(p.id));
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
    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(" e ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios e devem estar válidos!"
          : "é obrigatório e deve estar válido!";
      enqueueSnackbar(`O campo ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
      });
      return; // Para a execução se a validação falhar
    }

    // Verifica se é para criar ou atualizar
    if (requisicao === "Criar") {
      url = "https://api.egrc.homologacao.com.br/api/v1/ipe";
      method = "POST";
      payload = {
        code: codigo,
        name: nome
      };
    } else if (requisicao === "Editar") {
      url = `https://api.egrc.homologacao.com.br/api/v1/ipe`;
      method = "PUT";
      payload = {
        idInformationActivity: dadosApi?.idInformationActivity,
        code: codigo,
        name: nome,
        description: descricaoInformacao,
        location: localInformacao,
        financialInformation: financeira,
        criticize: critica,
        editable: editavel,
        generationDescription: descricaoGeracao,
        generationAccuracy: descricaoAcuracidade,
        generationCompleteness: descricaoCompletude,
        active: status,
        idInformationType: formData.tipoInformacao ? formData.tipoInformacao : null,
        idProcesses: formData.processo,
        idPlatforms: formData.ativo,
      };
    }

    try {
      setLoading(true);

      // Primeira requisição (POST ou PUT inicial)
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
        enqueueSnackbar(`IPE ${mensagemFeedback} com sucesso!`, {
          variant: "success",
        });
      }

      if (requisicao === "Criar" && data.data.idInformationActivity) {
        setSuccessDialogOpen(true);
      } else {
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar esse ipe.", {
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

          {requisicao === "Editar" && (
            <>
              
              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Tipo da informação</InputLabel>
                  <Autocomplete
                    options={tiposInformacao}
                    getOptionLabel={(option) => option.nome}
                    value={
                      tiposInformacao.find(
                        (tipoInformacao) =>
                          tipoInformacao.id === formData.tipoInformacao
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipoInformacao: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.tipoInformacao &&
                          formValidation.tipoInformacao === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Local da informação</InputLabel>
              <TextField
                onChange={(event) => setLocalInformacao(event.target.value)}
                fullWidth
                value={localInformacao}
              />
            </Stack>
          </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição da informação</InputLabel>
                  <TextField
                    onChange={(event) => setDescricaoInformacao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricaoInformacao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição da geração</InputLabel>
                  <TextField
                    onChange={(event) => setDescricaoGeracao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricaoGeracao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição da acuracidade</InputLabel>
                  <TextField
                    onChange={(event) => setDescricaoAcuracidade(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricaoAcuracidade}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição da completude</InputLabel>
                  <TextField
                    onChange={(event) => setDescricaoCompletude(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricaoCompletude}
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
                    // OPÇÕES: Apenas os ativos com active: true
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...ativosAtivosDisponiveis,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    // VALUE: Busca na lista COMPLETA 'ativos' para garantir que encontra o objeto mesmo se for inativo
                    value={formData.ativo.map(
                      (id) => ativos.find((ativo) => ativo.id === id) || id
                    )}
                    onChange={handleSelectAllAtivos}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    // --- NOVA PROP: RENDER TAGS ---
                    // Customiza a exibição dos chips selecionados
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        // Verifica se o ativo selecionado está inativo
                        // (Nota: 'option' aqui vem do value, ou seja, da lista completa 'ativos')
                        const isInativo = option.active === false;
                        
                        return (
                          <Chip
                            label={
                              isInativo 
                                ? `${option.nome} (Inativo)` // Texto informativo
                                : option.nome
                            }
                            {...getTagProps({ index })}
                            // Estilização visual para diferenciar
                            color={isInativo ? "error" : "default"} 
                            variant={isInativo ? "outlined" : "filled"}
                            sx={isInativo ? { borderColor: 'error.main', color: 'error.main' } : {}}
                          />
                        );
                      })
                    }
                    // -----------------------------
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
                    Processos{" "}
                    <DrawerProcesso
                      buttonSx={{
                        marginLeft: 1.5,
                        height: "20px",
                        minWidth: "20px",
                      }}
                      onProcessCreated={handleProcessCreated}
                      ativosSelecionados={formData.ativo.map(
                        (id) => ativos.find((ativo) => ativo.id === id) || { id },
                      )}
                    />
                  </InputLabel>
                  <Autocomplete
                multiple
                disableCloseOnSelect
                options={processosAutocompleteOptions}
                groupBy={
                  possuiAtivoSelecionado
                    ? (option) => {
                        if (option.id === "all_vinculados" || processosVinculadosIds.has(option.id)) {
                          return "Vinculados ao(s) Ativo(s) Selecionado(s)";
                        }

                        if (option.id === "all_outros" || !processosVinculadosIds.has(option.id)) {
                          return "Outros Processos (Sem Vinculação)";
                        }

                        return "";
                      }
                    : undefined
                }
                noOptionsText="Nenhum processo encontrado"
                getOptionLabel={(option) => option.nome}
                // VALUE: Busca na lista GLOBAL 'processos' para encontrar o objeto, mesmo se for inativo
                value={formData.processo.map(
                  (id) => processos.find((processo) => processo.id === id) || id
                )}
                onChange={handleSelectAllProcessos}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                
                // --- NOVA PROP: RENDER TAGS (IGUAL AO ATIVO) ---
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    // Verifica se o processo é inativo
                    const isInativo = option.active === false;

                    return (
                      <Chip
                        label={
                          isInativo 
                            ? `${option.nome} (Inativo)` 
                            : option.nome
                        }
                        {...getTagProps({ index })}
                        color={isInativo ? "error" : "default"}
                        variant={isInativo ? "outlined" : "filled"}
                        sx={isInativo ? { borderColor: 'error.main', color: 'error.main' } : {}}
                      />
                    );
                  })
                }
                // -----------------------------------------------

                renderOption={(props, option, { selected }) => {
                  const origens = processoOrigemMap[option.id]
                    ? processoOrigemMap[option.id].join(", ")
                    : "";

                  return (
                    <li {...props}>
                      <Grid container alignItems="center">
                        <Grid item>
                          <Checkbox
                            checked={
                              option.id === "all"
                                ? allSelectedProcessos
                                : option.id === "all_vinculados"
                                  ? allSelectedProcessosVinculados
                                  : option.id === "all_outros"
                                    ? allSelectedProcessosOutros
                                    : selected
                            }
                          />
                        </Grid>
                        <Grid item xs>
                          <Typography variant="body1">{option.nome}</Typography>
                          
                          {option.id !== "all" && option.id !== "all_vinculados" && option.id !== "all_outros" && origens && (
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                            >
                              Ativo(s): {origens}
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
                      (formData.processo.length === 0 ||
                        formData.processo.every((val) => val === 0)) &&
                      formValidation.processo === false
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
                    style={{ marginTop: 5 }}
                  >
                    <Switch
                      checked={financeira}
                      onChange={(event) => setFinanceira(event.target.checked)}
                    />
                    <Typography>Financeira</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={1.5}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 5 }}
                  >
                    <Switch
                      checked={critica}
                      onChange={(event) => setCritica(event.target.checked)}
                    />
                    <Typography>Critíca</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={1.5} mb={5}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 5 }}
                  >
                    <Switch
                      checked={editavel}
                      onChange={(event) => setEditavel(event.target.checked)}
                    />
                    <Typography>Editável</Typography>
                  </Stack>
                </Stack>
              </Grid>
              
              <Grid item xs={1.5} mb={5}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    style={{ marginTop: 5 }}
                  >
                    <Switch
                      checked={status}
                      onChange={(event) => setStatus(event.target.checked)}
                    />
                    <Typography>Ativo</Typography>
                  </Stack>
                </Stack>
              </Grid>
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
          {/* Dialog de Aviso de Filtro */}
          <Dialog
            open={warningDialogOpen}
            onClose={() => setWarningDialogOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
              {"Alteração de filtro de Ativos"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Ao selecionar um Ativo, a lista de Processos será filtrada para exibir apenas aqueles pertencentes ao Ativo escolhido.
                <br /><br />
                <strong>Os processos selecionados anteriormente serão removidos.</strong>
                <br /><br />
                Deseja continuar?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setWarningDialogOpen(false)} 
                color="primary"
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmarMudancaDeAtivo} 
                color="error" 
                variant="contained" 
                autoFocus
              >
                Limpar Processos
              </Button>
            </DialogActions>
          </Dialog>
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
              IPE criado com sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                O IPE foi cadastrado com sucesso. Você pode voltar para a
                listagem ou adicionar mais informações a esse IPE.
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
