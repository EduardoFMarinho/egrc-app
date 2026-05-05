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
import { useState, useEffect, useMemo } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ptBR from "date-fns/locale/pt-BR";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useToken } from "../../../api/TokenContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ListagemAtributo from "./listaAtributo";
import ListagemResultado from "./listaResultado";

// ==============================|| LAYOUTS - COLUMNS ||============================== //
function ColumnsLayouts() {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasStartedByTester, setHasStartedByTester] = useState(false);
  const idUser = localStorage.getItem("id_user");
  const { dadosApi, TesteId } = location.state || {};
  const [nomeFaseTeste, setNomeFase] = useState("");
  const [populacao, setPopulacao] = useState("");
  const [amostra, setAmostra] = useState("");
  const [descricao, setDescricao] = useState("");
  const [descricaoTestador, setDescricaoTestador] = useState("");
  const [descricaoRevisor, setDescricaoRevisor] = useState("");
  const [testadores, setTestadores] = useState([]);
  const [revisores, setRevisores] = useState([]);
  const [deficiencias, setDeficiencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isInitialEdit = Boolean(dadosApi?.idTestPhase);
  // modo atual do formulário
  const [requisicao, setRequisicao] = useState(
    isInitialEdit ? "Editar" : "Criar"
  );
  // modo *original* (nunca muda)
  const [originalRequisicao] = useState(isInitialEdit ? "Editar" : "Criar");
  const [mensagemFeedback, setMensagemFeedback] = useState("cadastrada");
  const [faseTesteDados, setFaseTesteDados] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedFiles] = useState([]);
  // Para armazenar o valor original vindo da API
  const [originalSample, setOriginalSample] = useState(null);

  // Controle do diálogo de confirmação
  const [confirmSampleOpen, setConfirmSampleOpen] = useState(false);
  const [pendingSampleValue, setPendingSampleValue] = useState("");

  const [statuss] = useState([
    { id: 1, nome: "Não Iniciado" },
    { id: 2, nome: "Em Teste" },
    { id: 3, nome: "Em Revisão" },
    { id: 4, nome: "Concluído" },
    { id: 5, nome: "Revisado" },
  ]);
  const [conclusaoTestes] = useState([
    { id: 1, nome: "Efetivo" },
    { id: 2, nome: "Inefetivo" },
  ]);
  const [tipoTestes] = useState([
    { id: 1, nome: "Desenho" },
    { id: 2, nome: "Operação" },
    { id: 3, nome: "Substantivo" },
  ]);
  const [descricaoMetodologia, setDescricaoMetodologia] = useState("");
  const [dataInicioCobertura, setDataInicioCobertura] = useState(null);
  const [dataFimCobertura, setDataFimCobertura] = useState(null);
  const [dataInicioTeste, setDataInicioTeste] = useState(null);
  const [dataFimTeste, setDataFimTeste] = useState(null);
  const [dataConclusaoEfetiva, setDataConclusaoEfetiva] = useState(null);

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
    elementoContabil: [],
    carv: [],
    plano: [],
    deficiencia: null,
    ameaca: [],
    controle: "",
    tipoTeste: "",
    status: "",
    normativa: [],
    revisor: [],
    assertion: [],
    departamento: [],
    categoria: "",
    conclusaoTeste: "",
    frequencia: "",
    projeto: "",
    testador: idUser,
    execucao: "",
    classificacao: "",
    tiposControle: "",
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
          item.idProject ||
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
        ...item,
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const getPhaseDeficiencyId = (phaseData) => {
    if (!phaseData) return null;
    if (phaseData.idDeficiency != null) return phaseData.idDeficiency;
    if (phaseData.deficiency?.idDeficiency != null) {
      return phaseData.deficiency.idDeficiency;
    }
    if (phaseData.deficiency?.id != null) return phaseData.deficiency.id;
    return null;
  };

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
      setTestadores
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
      setRevisores
    );
    fetchData(`${process.env.REACT_APP_API_URL}deficiencies`, setDeficiencias);
    window.scrollTo(0, 0);
  }, []);

  // Em caso de edição
  useEffect(() => {
    if (dadosApi) {
      setLoading(true);
      const fetchEmpresaDados = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}projects/tests/phases/${dadosApi.idTestPhase}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar os dados");
          }

          const data = await response.json();

          // Atualize os estados para o modo de edição
          setRequisicao("Editar");
          setMensagemFeedback("editada");
          setHasStartedByTester(data.testPhaseStatus > 1);
          // Preenchendo os campos com os dados recebidos
          setFaseTesteDados(data);
          setNomeFase(data.name);
          window.dispatchEvent(new CustomEvent('updateBreadcrumbName', { detail: data.name }));
          setDescricao(data.description || "");
          setPopulacao(data.population ? data.population.toString() : "");
          setAmostra(data.sample ? data.sample.toString() : "");
          setOriginalSample(data.sample);

          setDescricaoMetodologia(data.sampleSelectionMethodology || "");

          // Para os DatePickers, converta as datas se não estiverem nulas
          setDataInicioCobertura(
            data.startDateCoverage ? new Date(data.startDateCoverage) : null
          );
          setDataFimCobertura(
            data.endDateCoverage ? new Date(data.endDateCoverage) : null
          );
          setDataInicioTeste(
            data.startDateTest ? new Date(data.startDateTest) : null
          );
          setDataFimTeste(data.endDateTest ? new Date(data.endDateTest) : null);
          setDataConclusaoEfetiva(
            data.effectiveCompletionDate
              ? new Date(data.effectiveCompletionDate)
              : null
          );

          // Atualiza o formData para os campos que esperam objetos ou arrays
          setFormData((prev) => ({
            ...prev,
            testador: isInitialEdit ? data.idTester : idUser,
            conclusaoTeste: data.testConclusion,
            status: data.testPhaseStatus,
            revisor: data.idReviewers || [],
            deficiencia: getPhaseDeficiencyId(data),
          }));

          setDescricaoRevisor(data.descriptionConclusionReviewer || "");
          setLoading(false);
        } catch (err) {
          console.error("Erro ao buscar os dados:", err.message);
          setLoading(false);
        }
      };

      if (dadosApi.idTestPhase) {
        fetchEmpresaDados();
      }
    }
  }, [dadosApi, token]);

  const handleConfirmSample = async () => {
    setConfirmSampleOpen(false);
    setLoading(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}projects/tests/phases/attributes/result/sample`,
        {
          idTestPhase: faseTesteDados.idTestPhase,
          sample: Number(pendingSampleValue),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOriginalSample(Number(pendingSampleValue));
      enqueueSnackbar("Amostra atualizada com sucesso!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Falha ao atualizar amostra.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll2 = (event, newValue) => {
    if (newValue.length > 0 && newValue[newValue.length - 1].id === "all") {
      if (formData.revisor.length === revisores.length) {
        // Deselect all
        setFormData({ ...formData, revisor: [] });
      } else {
        // Select all
        setFormData({
          ...formData,
          revisor: revisores.map((revisor) => revisor.id),
        });
      }
    } else {
      tratarMudancaInputGeral(
        "revisor",
        newValue.map((item) => item.id)
      );
    }
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

  const voltarParaCadastroMenu = () => {
    navigate(-1);
    window.scrollTo(0, 0);
    // navigate('/apps/revisores/configuracoes-menu', { state: { tab: 'Órgão' } });
  };

  const continuarEdicao = () => {
    setRequisicao("Editar");
    setSuccessDialogOpen(false);
    navigate(location.pathname, {
      replace: true,
      state: { dadosApi, TesteId },
    });
  };

  // Função para voltar para a listagem
  const voltarParaListagem = () => {
    setSuccessDialogOpen(false);
    voltarParaCadastroMenu();
  };

  const [formValidation, setFormValidation] = useState({
    codigo: true,
    nome: true,
    testador: true,
  });

  const allSelected2 =
    formData.revisor.length === revisores.length && revisores.length > 0;

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const { buttonTitle } = useMemo(() => {
    const currentStatus = faseTesteDados?.testPhaseStatus || formData.status;
    const tester = idUser === formData.testador;
    let title = "";
    if (currentStatus === 1 && tester) title = "INICIAR";
    else if (currentStatus === 2 && tester) title = "TESTE REALIZADO";
    else if (currentStatus === 3 && formData.revisor.includes(idUser))
      title = "REVISADO / RETORNAR";
    else if (currentStatus === 5 && formData.revisor.includes(idUser))
      title = "RETORNAR";
    return { buttonTitle: title, isTester: tester };
  }, [idUser, formData, faseTesteDados]);

  const handleStart = async () => {
    let url = "";
    let method = "";
    let payload = {};

    setDataInicioTeste(new Date());

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!formData.testador) {
      setFormValidation((prev) => ({ ...prev, testador: false }));
      missingFields.push("Testador");
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

      // Exclusão de arquivos, se necessário
      if (deletedFiles.length > 0) {
        const deletedFilesPayload = deletedFiles.map((file) => file.name);
        await axios.delete(`${process.env.REACT_APP_API_URL}files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: 4,
            files: deletedFilesPayload,
          },
        });
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
          requisicao === "Editar" ? faseTesteDados?.idTestPhase : ""
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

      // Combinar arquivos existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      if (requisicao === "Editar") {
        const hasReviewers =
          Array.isArray(formData.revisor) && formData.revisor.length > 0;

        url = `${process.env.REACT_APP_API_URL}projects/tests/${TesteId}/phases/${faseTesteDados?.idTestPhase}`;
        method = "PUT";
        payload = {
          idTestPhase: faseTesteDados?.idTestPhase,
          name: nomeFaseTeste,
          description: descricao,
          testPhaseStatus: 2,
          note: faseTesteDados?.note || "",
          startDateCoverage: dataInicioCobertura
            ? new Date(dataInicioCobertura).toISOString()
            : null,
          endDateCoverage: dataFimCobertura
            ? new Date(dataFimCobertura).toISOString()
            : null,
          startDateTest: new Date(),
          endDateTest: dataFimTeste
            ? new Date(dataFimTeste).toISOString()
            : null,
          effectiveCompletionDate: dataConclusaoEfetiva
            ? new Date(dataConclusaoEfetiva).toISOString()
            : null,
          idTest: TesteId,
          idTester: formData.testador,
          idReviewer: hasReviewers ? formData.revisor[0] : null,
          idDeficiency: formData.deficiencia || null,
          descriptionConclusionReviewer: descricaoRevisor,
          population: Number(populacao),
          sample: Number(amostra),
          sampleSelectionMethodology: descricaoMetodologia,
          active: true,
          files: finalFilesPayload,
          testConclusion: formData.conclusaoTeste,
          reviewers: hasReviewers
            ? formData.revisor.map((reviewerId, index) => ({
                order: index,
                idReviewer: reviewerId,
              }))
            : null,
        };
      }

      // Envia a requisição para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta for 204 (sem conteúdo) ou tiver um content-type JSON, tratamos de forma adequada
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      // No caso de criação, podemos esperar que a resposta traga os dados (por exemplo, idTestPhase)
      if (requisicao === "Criar" && data.data && data.data.idTestPhase) {
        setFaseTesteDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        // Para edição, mesmo sem retorno, redirecionamos para a listagem
        setFormData((prev) => ({ ...prev, status: 2 }));
        setFaseTesteDados((prev) => ({ ...prev, testPhaseStatus: 2 }));
        console.log(faseTesteDados);
        setHasStartedByTester(true);
        enqueueSnackbar("Teste iniciado com sucesso!", {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
        // depois do PUT bem‑sucedido
        navigate(location.pathname, {
          replace: true,
          state: { dadosApi, TesteId },
        });

        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar essa fase", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTesteRealizado = async () => {
    let url = "";
    let method = "";
    let payload = {};
    const hasReviewers =
      Array.isArray(formData.revisor) && formData.revisor.length > 0;
    const nextStatus = hasReviewers ? 3 : 4;

    // VALIDAÇÃO CONDICIONAL: Campos obrigatórios quando status for "teste realizado" (3)
    const missingFields = [];
    
    // Campos sempre obrigatórios
    if (!formData.testador) {
      setFormValidation((prev) => ({ ...prev, testador: false }));
      missingFields.push("Testador");
    }
    
    // Campos obrigatórios apenas para status "teste realizado"
    if (!dataConclusaoEfetiva) {
      missingFields.push("Data de conclusão");
    }
    
    if (!formData.conclusaoTeste) {
      missingFields.push("Conclusão do teste");
    }
    
    if (!descricaoTestador || descricaoTestador.trim() === "") {
      missingFields.push("Descrição da conclusão");
    }

    if (missingFields.length > 0) {
      const fieldsMessage = missingFields.join(", ");
      const singularOrPlural =
        missingFields.length > 1
          ? "são obrigatórios para realizar o teste!"
          : "é obrigatório para realizar o teste!";
      enqueueSnackbar(`O(s) campo(s) ${fieldsMessage} ${singularOrPlural}`, {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    try {
      setLoading(true);

      // Exclusão de arquivos, se necessário
      if (deletedFiles.length > 0) {
        const deletedFilesPayload = deletedFiles.map((file) => file.name);
        await axios.delete(`${process.env.REACT_APP_API_URL}files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: 4,
            files: deletedFilesPayload,
          },
        });
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
          requisicao === "Editar" ? faseTesteDados?.idTestPhase : ""
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

      // Combinar arquivos existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      if (requisicao === "Editar") {
        url = `${process.env.REACT_APP_API_URL}projects/tests/${TesteId}/phases/${faseTesteDados?.idTestPhase}`;
        method = "PUT";
        payload = {
          idTestPhase: faseTesteDados?.idTestPhase,
          name: nomeFaseTeste,
          description: descricao,
          testPhaseStatus: nextStatus,
          note: faseTesteDados?.note || "",
          startDateCoverage: dataInicioCobertura
            ? new Date(dataInicioCobertura).toISOString()
            : null,
          endDateCoverage: dataFimCobertura
            ? new Date(dataFimCobertura).toISOString()
            : null,
          startDateTest: new Date(),
          endDateTest: dataFimTeste
            ? new Date(dataFimTeste).toISOString()
            : null,
          effectiveCompletionDate: dataConclusaoEfetiva
            ? new Date(dataConclusaoEfetiva).toISOString()
            : null,
          idTest: TesteId,
          idTester: formData.testador,
          idReviewer: hasReviewers ? formData.revisor[0] : null,
          idDeficiency: formData.deficiencia || null,
          descriptionConclusionReviewer: descricaoRevisor,
          population: Number(populacao),
          sample: Number(amostra),
          sampleSelectionMethodology: descricaoMetodologia,
          active: true,
          files: finalFilesPayload,
          testConclusion: formData.conclusaoTeste,
          reviewers: hasReviewers
            ? formData.revisor.map((reviewerId, index) => ({
                order: index,
                idReviewer: reviewerId,
              }))
            : [],
        };
      }

      // Envia a requisição para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta for 204 (sem conteúdo) ou tiver um content-type JSON, tratamos de forma adequada
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      // No caso de criação, podemos esperar que a resposta traga os dados (por exemplo, idTestPhase)
      if (requisicao === "Criar" && data.data && data.data.idTestPhase) {
        setFaseTesteDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        // Para edição, mesmo sem retorno, redirecionamos para a listagem
        setFormData((prev) => ({ ...prev, status: nextStatus }));
        setFaseTesteDados((prev) => ({ ...prev, testPhaseStatus: nextStatus }));
        setHasStartedByTester(true);
        enqueueSnackbar(
          hasReviewers
            ? "Teste realizado com sucesso!"
            : "Teste concluido com sucesso!",
          {
            variant: "success",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          },
        );
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar essa fase", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirTeste = async () => {
    let url = "";
    let method = "";
    let payload = {};

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!formData.testador) {
      setFormValidation((prev) => ({ ...prev, testador: false }));
      missingFields.push("Testador");
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

      // Exclusão de arquivos, se necessário
      if (deletedFiles.length > 0) {
        const deletedFilesPayload = deletedFiles.map((file) => file.name);
        await axios.delete(`${process.env.REACT_APP_API_URL}files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: 4,
            files: deletedFilesPayload,
          },
        });
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
          requisicao === "Editar" ? faseTesteDados?.idTestPhase : ""
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

      // Combinar arquivos existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      if (requisicao === "Editar") {
        url = `${process.env.REACT_APP_API_URL}projects/tests/${TesteId}/phases/${faseTesteDados?.idTestPhase}`;
        method = "PUT";
        payload = {
          idTestPhase: faseTesteDados?.idTestPhase,
          name: nomeFaseTeste,
          description: descricao,
          testPhaseStatus: 4,
          note: faseTesteDados?.note || "",
          startDateCoverage: dataInicioCobertura
            ? new Date(dataInicioCobertura).toISOString()
            : null,
          endDateCoverage: dataFimCobertura
            ? new Date(dataFimCobertura).toISOString()
            : null,
          startDateTest: new Date(),
          endDateTest: dataFimTeste
            ? new Date(dataFimTeste).toISOString()
            : null,
          effectiveCompletionDate: dataConclusaoEfetiva
            ? new Date(dataConclusaoEfetiva).toISOString()
            : null,
          idTest: TesteId,
          idTester: formData.testador,
          idReviewer:
            formData.revisor && formData.revisor.length > 0
              ? formData.revisor[0]
              : "",
          idDeficiency: formData.deficiencia || null,
          descriptionConclusionReviewer: descricaoRevisor,
          population: Number(populacao),
          sample: Number(amostra),
          sampleSelectionMethodology: descricaoMetodologia,
          active: true,
          files: finalFilesPayload,
          testConclusion: formData.conclusaoTeste,
          reviewers: formData.revisor.map((reviewerId, index) => ({
            order: index,
            idReviewer: reviewerId,
          })),
        };
      }

      // Envia a requisição para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta for 204 (sem conteúdo) ou tiver um content-type JSON, tratamos de forma adequada
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      }

      // No caso de criação, podemos esperar que a resposta traga os dados (por exemplo, idTestPhase)
      if (requisicao === "Criar" && data.data && data.data.idTestPhase) {
        setFaseTesteDados(data.data);
        setSuccessDialogOpen(true);
      } else {
        // Para edição, mesmo sem retorno, redirecionamos para a listagem
        setFormData((prev) => ({ ...prev, status: 4 }));
        setFaseTesteDados((prev) => ({ ...prev, testPhaseStatus: 4 }));
        setHasStartedByTester(true);
        enqueueSnackbar("Teste concluído com sucesso!", {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Não foi possível cadastrar essa fase", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetornar = async () => {
    if (!descricaoRevisor.trim()) {
      enqueueSnackbar("Descrição do revisor é obrigatória para retornar.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }
    try {
      setLoading(true);
      const url = `${process.env.REACT_APP_API_URL}projects/tests/${TesteId}/phases/${faseTesteDados.idTestPhase}`;
      const payload = {
        idTestPhase: faseTesteDados.idTestPhase,
        name: nomeFaseTeste,
        description: descricao,
        testPhaseStatus: 2,
        note: faseTesteDados.note || "",
        startDateCoverage: dataInicioCobertura
          ? new Date(dataInicioCobertura).toISOString()
          : null,
        endDateCoverage: dataFimCobertura
          ? new Date(dataFimCobertura).toISOString()
          : null,
        startDateTest: dataInicioTeste
          ? new Date(dataInicioTeste).toISOString()
          : null,
        endDateTest: dataFimTeste ? new Date(dataFimTeste).toISOString() : null,
        effectiveCompletionDate: dataConclusaoEfetiva
          ? new Date(dataConclusaoEfetiva).toISOString()
          : null,
        idTest: TesteId,
        idTester: formData.testador,
        idReviewer: formData.revisor.length > 0 ? formData.revisor[0] : "",
        idDeficiency: formData.deficiencia || null,
        descriptionConclusionReviewer: descricaoRevisor,
        population: Number(populacao),
        sample: Number(amostra),
        sampleSelectionMethodology: descricaoMetodologia,
        active: true,
        files: formData.files.map((f) => (f.path ? f.path : f)),
        testConclusion: formData.conclusaoTeste,
        reviewers: formData.revisor.map((idR, idx) => ({
          order: idx,
          idReviewer: idR,
        })),
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Erro ao retornar fase");

      setFormData((prev) => ({ ...prev, status: 2 }));
      setFaseTesteDados((prev) => ({ ...prev, testPhaseStatus: 2 }));
      enqueueSnackbar("Fase retornada com sucesso!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível retornar a fase.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    if (Number(amostra) > Number(populacao)) {
      enqueueSnackbar("A amostra não pode ser maior que a população.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    // Validação dos campos obrigatórios
    const missingFields = [];
    if (!nomeFaseTeste) {
      setFormValidation((prev) => ({ ...prev, nomeFaseTeste: false }));
      missingFields.push("Nome");
    }
    if (!formData.testador) {
      setFormValidation((prev) => ({ ...prev, testador: false }));
      missingFields.push("Testador");
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

      // Exclusão de arquivos, se necessário
      if (deletedFiles.length > 0) {
        const deletedFilesPayload = deletedFiles.map((file) => file.name);
        await axios.delete(`${process.env.REACT_APP_API_URL}files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: 4,
            files: deletedFilesPayload,
          },
        });
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
          requisicao === "Editar" ? faseTesteDados?.idTestPhase : ""
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

      // Combinar arquivos existentes com os novos enviados
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });

      // Monta payload para criação e edição
      if (requisicao === "Criar") {
        url = `${process.env.REACT_APP_API_URL}projects/tests/${TesteId}/phases`;
        method = "POST";
        payload = {
          name: nomeFaseTeste,
          population: Number(populacao),
          sample: Number(amostra),
          sampleSelectionMethodology: descricaoMetodologia,
          idTest: TesteId,
          idTester: formData.testador,
          idDeficiency: formData.deficiencia || null,
          reviewers: formData.revisor.map((reviewerId, index) => ({
            order: index,
            idReviewer: reviewerId,
          })),
        };
      } else if (requisicao === "Editar") {
        url = `${process.env.REACT_APP_API_URL}projects/tests/${TesteId}/phases/${faseTesteDados?.idTestPhase}`;
        method = "PUT";
        payload = {
          idTestPhase: faseTesteDados?.idTestPhase,
          name: nomeFaseTeste,
          description: descricao,
          testPhaseStatus: formData.status,
          note: faseTesteDados?.note || "",
          startDateCoverage: dataInicioCobertura
            ? new Date(dataInicioCobertura).toISOString()
            : null,
          endDateCoverage: dataFimCobertura
            ? new Date(dataFimCobertura).toISOString()
            : null,
          startDateTest: dataInicioTeste
            ? new Date(dataInicioTeste).toISOString()
            : null,
          endDateTest: dataFimTeste
            ? new Date(dataFimTeste).toISOString()
            : null,
          effectiveCompletionDate: dataConclusaoEfetiva
            ? new Date(dataConclusaoEfetiva).toISOString()
            : null,
          idTest: TesteId,
          idTester: formData.testador,
          idReviewer:
            formData.revisor && formData.revisor.length > 0
              ? formData.revisor[0]
              : "",
          idDeficiency: formData.deficiencia || null,
          descriptionConclusionReviewer: descricaoRevisor,
          population: Number(populacao),
          sample: Number(amostra),
          sampleSelectionMethodology: descricaoMetodologia,
          active: true,
          files: finalFilesPayload,
          testConclusion: formData.conclusaoTeste,
          reviewers: formData.revisor.map((reviewerId, index) => ({
            order: index,
            idReviewer: reviewerId,
          })),
        };
      }

      // Envia a requisição para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Se a resposta for 204 (sem conteúdo) ou tiver um content-type JSON, tratamos de forma adequada
      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error("O Código informado já foi cadastrado.");
      } else {
        enqueueSnackbar(`Fase ${mensagemFeedback} com sucesso!`, {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      }

      // No caso de criação, podemos esperar que a resposta traga os dados (por exemplo, idTestPhase)
      if (requisicao === "Criar" && data.data && data.data.idTestPhase) {
        setFaseTesteDados(data.data);
        navigate(location.pathname, {
          replace: true,
          state: { dadosApi: data.data, TesteId },
        });
        setSuccessDialogOpen(true);
      } else {
        // Para edição, mesmo sem retorno, redirecionamos para a listagem
        voltarParaCadastroMenu();
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Preencha todos os campos obrigatórios, por favor.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  const isTester = idUser === formData.testador;
  const isReviewer = !isTester && formData.revisor.includes(idUser);
  const status = faseTesteDados?.testPhaseStatus || formData.status;
  const canEditListagem = useMemo(
    () => isTester && (status === 1 || status === 2),
    [isTester, status]
  );

  const creating = originalRequisicao === "Criar";
  const editing = !creating; // originalRequisicao === "Editar"
  const started = hasStartedByTester;

  const fieldPermissions = useMemo(() => {
    // Se for criação, libera tudo
    if (creating) {
      return {
        nomeFaseTeste: true,
        status: true,
        populacao: true,
        tipoTeste: true,
        amostra: true,
        metodologia: true,
        deficiencia: true,
        testador: true, // agora também liberado em "Criar"
        revisores: true,
        descricao: true,
        dataInicioCobertura: true,
        dataFimCobertura: true,
        dataInicioTeste: true,
        dataFimTeste: true,
        dataConclusaoEfetiva: true,
        conclusaoTeste: true,
        descricaoTestador: true,
        descricaoRevisor: true,
      };
    }

    if (status === 4) {
      return {
        nomeFaseTeste: false,
        status: false,
        populacao: false,
        tipoTeste: false,
        amostra: false,
        metodologia: false,
        deficiencia: false,
        testador: false,
        revisores: false,
        descricao: false,
        dataInicioCobertura: false,
        dataFimCobertura: false,
        dataInicioTeste: false,
        dataFimTeste: false,
        dataConclusaoEfetiva: false,
        conclusaoTeste: false,
        descricaoTestador: false,
        descricaoRevisor: false,
      };
    }

    // Caso contrário, aplica as regras de edição
    return {
      nomeFaseTeste: editing && isTester && started && status < 3,
      status: editing && isTester && started && status < 3,
      populacao: editing && isTester && started && status < 3,
      tipoTeste: editing && isTester && started && status < 3,
      amostra: editing && isTester && started && status < 3,
      metodologia: editing && isTester && started && status < 3,
      deficiencia: editing && isTester && started && status < 3,

      // nunca liberar a edição do testador no modo de edição
      testador: false,

      revisores: editing && isTester && started && status < 3,
      descricao: editing && isTester && started && status < 3,
      dataInicioCobertura: editing && isTester && started && status < 3,
      dataFimCobertura: editing && isTester && started && status < 3,
      dataInicioTeste: true,
      dataFimTeste: editing && isTester && started && status < 3,
      dataConclusaoEfetiva: true,
      conclusaoTeste: editing && isTester && started && status < 3,
      descricaoTestador: editing && isTester && started && status < 3,

      // só o revisor pode editar o próprio comentário quando em revisão
      descricaoRevisor: editing && isReviewer && status === 3,
    };
  }, [creating, editing, isTester, isReviewer, started, status]);

  return (
    <>
      <LoadingOverlay isActive={loading} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Grid container spacing={1} marginTop={2}>
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                disabled={!fieldPermissions.nomeFaseTeste}
                onChange={(event) => setNomeFase(event.target.value)}
                fullWidth
                value={nomeFaseTeste}
                error={!nomeFaseTeste && formValidation.nomeFaseTeste === false}
              />
            </Stack>
          </Grid>

          {originalRequisicao === "Editar" && (
            <Grid item xs={3} mt={4} ml={5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {buttonTitle === "INICIAR" ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleStart}
                  >
                    INICIAR
                  </Button>
                ) : buttonTitle === "TESTE REALIZADO" ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleTesteRealizado}
                  >
                    TESTE REALIZADO
                  </Button>
                ) : buttonTitle === "REVISADO / RETORNAR" ? (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleConcluirTeste}
                    >
                      REVISADO
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleRetornar}
                    >
                      RETORNAR
                    </Button>
                  </>
                ) : (
                  buttonTitle && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={tratarSubmit}
                    >
                      {buttonTitle}
                    </Button>
                  )
                )}
              </Stack>
            </Grid>
          )}

          {originalRequisicao === "Editar" && (
            <Grid item xs={6} sx={{ paddingBottom: 5 }}>
              <Stack spacing={1}>
                <InputLabel>Status</InputLabel>
                <Autocomplete
                  disabled={true}
                  options={statuss}
                  getOptionLabel={(option) => option.nome}
                  value={
                    statuss.find((status) => status.id === formData.status) ||
                    null
                  }
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      status: newValue ? newValue.id : "",
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Stack>
            </Grid>
          )}

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              {/* Usando Stack horizontal para juntar o label e a info */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <InputLabel>População</InputLabel>
              </Stack>
              <TextField
                disabled={!fieldPermissions.populacao}
                type="number"
                onChange={(event) => setPopulacao(event.target.value)}
                fullWidth
                value={populacao}
              />
            </Stack>
          </Grid>

          

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Tipo de teste</InputLabel>
              <Autocomplete
                disabled={!fieldPermissions.tipoTeste}
                options={tipoTestes}
                getOptionLabel={(option) => option.nome}
                value={
                  tipoTestes.find(
                    (tipoTeste) => tipoTeste.id === formData.tipoTeste
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    tipoTeste: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          {/* Campo Amostra */}
          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <InputLabel>Amostra</InputLabel>
              </Stack>
              <TextField
                disabled={!fieldPermissions.amostra}
                type="number"
                onChange={(event) => setAmostra(event.target.value)}
                fullWidth
                value={amostra}
                onBlur={() => {
                  if (
                    originalRequisicao === "Editar" &&
                    originalSample !== null &&
                    Number(amostra) !== originalSample
                  ) {
                    setPendingSampleValue(amostra);
                    setConfirmSampleOpen(true);
                  }
                }}
                error={Number(amostra) > Number(populacao) && populacao !== ""}
                helperText={
                  Number(amostra) > Number(populacao) && populacao !== ""
                    ? "A amostra não pode ser maior que a população."
                    : ""
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Metodologia seleção amostra *</InputLabel>
              <TextField
                disabled={!fieldPermissions.metodologia}
                multiline
                rows={2}
                onChange={(event) =>
                  setDescricaoMetodologia(event.target.value)
                }
                fullWidth
                value={descricaoMetodologia}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Testador *</InputLabel>
              <Autocomplete
                disabled={!fieldPermissions.testador}
                options={testadores}
                getOptionLabel={(option) => option.nome}
                value={
                  testadores.find(
                    (testador) => testador.id === formData.testador
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    testador: newValue ? newValue.id : "",
                  }));
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={6} sx={{ paddingBottom: 5 }}>
            <Stack spacing={1}>
              <InputLabel>Revisores</InputLabel>
              <Autocomplete
                multiple
                disabled={!fieldPermissions.revisores}
                disableCloseOnSelect
                options={[
                  { id: "all", nome: "Selecionar todas" },
                  ...revisores,
                ]}
                getOptionLabel={(option) => option.nome}
                value={formData.revisor.map(
                  (id) => revisores.find((revisor) => revisor.id === id) || id
                )}
                onChange={handleSelectAll2}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Checkbox
                      checked={
                        option.id === "all"
                          ? allSelected2
                          : formData.revisor.includes(option.id)
                      }
                      style={{ marginRight: 8 }}
                    />
                    {option.nome}
                  </li>
                )}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          {originalRequisicao === "Editar" && (
            <>
              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição</InputLabel>
                  <TextField
                    disabled={!fieldPermissions.descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    value={descricao}
                  />
                </Stack>
              </Grid>

              <Grid item xs={2.4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data início da cobertura</InputLabel>
                  <DatePicker
                    disabled={!fieldPermissions.dataInicioCobertura}
                    value={dataInicioCobertura}
                    onChange={(newValue) => setDataInicioCobertura(newValue)}
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={2.4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data fim da cobertura</InputLabel>
                  <DatePicker
                    disabled={!fieldPermissions.dataFimCobertura}
                    value={dataFimCobertura}
                    onChange={(newValue) => setDataFimCobertura(newValue)}
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={2.4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data início do teste</InputLabel>
                  <DatePicker
                    disabled={true}
                    value={dataInicioTeste}
                    onChange={(newValue) => setDataInicioTeste(newValue)}
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={2.4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data fim do teste</InputLabel>
                  <DatePicker
                    disabled={!fieldPermissions.dataFimTeste}
                    value={dataFimTeste}
                    onChange={(newValue) => setDataFimTeste(newValue)}
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={2.4} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Data conclusão efetiva *</InputLabel>
                  <DatePicker
                    disabled={!fieldPermissions.dataConclusaoEfetiva}
                    value={dataConclusaoEfetiva}
                    onChange={(newValue) => setDataConclusaoEfetiva(newValue)}
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => (
                      <TextField 
                        fullWidth 
                        {...params}
                        error={!dataConclusaoEfetiva && (faseTesteDados?.testPhaseStatus >= 3 || formData.status >= 3)}
                        helperText={!dataConclusaoEfetiva && (faseTesteDados?.testPhaseStatus >= 3 || formData.status >= 3) ? "Campo obrigatório para teste realizado" : ""}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Conclusão do teste *</InputLabel>
                  <Autocomplete
                    disabled={!fieldPermissions.conclusaoTeste}
                    options={conclusaoTestes}
                    getOptionLabel={(option) => option.nome}
                    value={
                      conclusaoTestes.find(
                        (conclusaoTeste) =>
                          conclusaoTeste.id === formData.conclusaoTeste
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        conclusaoTeste: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params}
                        error={!formData.conclusaoTeste && (faseTesteDados?.testPhaseStatus >= 3 || formData.status >= 3)}
                        helperText={!formData.conclusaoTeste && (faseTesteDados?.testPhaseStatus >= 3 || formData.status >= 3) ? "Campo obrigatório para teste realizado" : ""}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              {requisicao === "Editar" && (
            <Grid item xs={6} sx={{ paddingBottom: 5 }}>
              <Stack spacing={1}>
                <InputLabel>Deficiência</InputLabel>
                <Autocomplete
                  disabled={!fieldPermissions.deficiencia}
                  options={deficiencias}
                  getOptionLabel={(option) => option?.nome || ""}
                  value={
                    deficiencias.find(
                      (deficiencia) => deficiencia.id === formData.deficiencia
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      deficiencia: newValue ? newValue.id : null,
                    }));
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => <TextField {...params} />}
                />
              </Stack>
            </Grid>
          )}

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição conclusão do testador *</InputLabel>
                  <TextField
                    disabled={!fieldPermissions.descricaoTestador}
                    onChange={(event) =>
                      setDescricaoTestador(event.target.value)
                    }
                    fullWidth
                    multiline
                    rows={4}
                    value={descricaoTestador}
                    error={!descricaoTestador.trim() && (faseTesteDados?.testPhaseStatus >= 3 || formData.status >= 3)}
                    helperText={!descricaoTestador.trim() && (faseTesteDados?.testPhaseStatus >= 3 || formData.status >= 3) ? "Campo obrigatório para teste realizado" : ""}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                <Stack spacing={1}>
                  <InputLabel>Descrição conclusão do revisor</InputLabel>
                  <TextField
                    disabled={!fieldPermissions.descricaoRevisor}
                    onChange={(event) =>
                      setDescricaoRevisor(event.target.value)
                    }
                    fullWidth
                    multiline
                    rows={4}
                    value={descricaoRevisor}
                  />
                </Stack>
              </Grid>

              {requisicao === "Editar" && (
                <>
                  <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Atributo</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <ListagemAtributo
                          key={`attr-${refreshKey}`}
                          atributo={dadosApi?.idTestPhase}
                          canEdit={canEditListagem}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  <Grid item xs={12} sx={{ paddingBottom: 5 }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Resultado</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <ListagemResultado
                          key={`res-${refreshKey}`}
                          amostras={amostra}
                          novoOrgao={faseTesteDados?.idTestPhase}
                          canEdit={canEditListagem}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </>
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
            open={confirmSampleOpen}
            onClose={() => setConfirmSampleOpen(false)}
          >
            <DialogTitle>Confirmar alteração de amostras</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Alterar as amostras afetará a listagem de resultados. Deseja
                continuar?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmSampleOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmSample} autoFocus>
                Confirmar
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
              Fase criada com sucesso!
            </DialogTitle>

            {/* Mensagem */}
            <DialogContent>
              <DialogContentText
                sx={{ fontSize: "16px", color: "#555", px: 2 }}
              >
                A fase de teste foi cadastrada com sucesso. Você pode voltar
                para a listagem ou adicionar mais informações a essa fase.
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
