import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  InputLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ptBR from "date-fns/locale/pt-BR";
import { API_URL } from "config";
import { useToken } from "../../../api/TokenContext";
import useAuth from "../../../hooks/useAuth";
import LoadingOverlay from "./LoadingOverlay";
import DrawerEmpresa from "./novaEmpresaDrawerNormativos";
import DrawerDepartamento from "./novoDepartamentoDrawerNormativas";
import DrawerProcesso from "./novoProcessoDrawerNormativa";
import FileUploader from "./FileUploader";
import DrawerPlanos from "./novoPlanoDrawerNormativa";
import ListagemTrecho from "./listaTrecho";

const FILE_CONTAINER_FOLDER = 6;

const STATUS = {
  ELABORACAO: 1,
  EM_APROVACAO: 2,
  VERSAO_FINAL: 3,
  REVOGADO: 4,
  EM_ALTERACAO: 5,
};

const STATUS_OPTIONS = [
  { id: STATUS.ELABORACAO, nome: "Elaboração" },
  { id: STATUS.EM_APROVACAO, nome: "Em aprovação" },
  { id: STATUS.VERSAO_FINAL, nome: "Versão final" },
  { id: STATUS.REVOGADO, nome: "Revogado" },
  { id: STATUS.EM_ALTERACAO, nome: "Em alteração" },
];

const REVISION_STATUS_OPTIONS = [
  { id: 1, nome: "Revisada" },
  { id: 2, nome: "Próxima da revisão" },
  { id: 3, nome: "Em atraso" },
];

const FREQUENCY_OPTIONS = [
  { id: 1, nome: "Semestral" },
  { id: 2, nome: "Anual" },
  { id: 3, nome: "Bienal" },
];

const RISK_OPTIONS = [
  { id: 1, nome: "Alto" },
  { id: 2, nome: "Médio" },
  { id: 3, nome: "Baixo" },
  { id: "na", nome: "Não aplicável" },
];

const NORMATIVE_INTERN_TYPE = {
  INTERNAL: 1,
  EXTERNAL: 2,
};

const NORMATIVE_ENVIRONMENT_OPTIONS = [
  { id: NORMATIVE_INTERN_TYPE.INTERNAL, nome: "Interno", kind: "internal" },
  { id: NORMATIVE_INTERN_TYPE.EXTERNAL, nome: "Externo", kind: "external" },
];

const INITIAL_FORM_DATA = {
  idNormative: "",
  code: "",
  name: "",
  ambiente: "",
  responsavel: "",
  revisor: "",
  statusNorma: "",
  ativo: true,
  tipoNorma: "",
  regulador: "",
  riscoNorma: null,
  periodicidadeRevisao: "",
  statuRevisao: "",
  normaOrigem: [],
  normaDestino: [],
  empresa: [],
  departamento: [],
  processo: [],
  planoAcao: [],
  aprovador: [],
  dataCadastro: new Date(),
  dataPublicacao: null,
  vigenciaInicial: null,
  ultimaRevisao: null,
  dataRevogacao: null,
  motivoRevogacao: "",
  description: "",
  note: "",
  descriptionReviewer: "",
  files: [],
};

const INITIAL_DRAFT_COMMENTS = {
  description: "",
  note: "",
  descriptionReviewer: "",
};

const INITIAL_FIELD_ERROR_MESSAGES = {
  code: "",
};

function normalizeText(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function buildLocalDate(year, month, day) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function toDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : buildLocalDate(
          value.getFullYear(),
          value.getMonth() + 1,
          value.getDate(),
        );
  }

  if (typeof value === "string") {
    const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      return buildLocalDate(Number(year), Number(month), Number(day));
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : buildLocalDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function toIso(value) {
  const date = toDate(value);
  return date ? date.toISOString() : null;
}

function getTodayDate() {
  return toDate(new Date());
}

function getEntityId(item) {
  return (
    item?.id ||
    item?.idNormative ||
    item?.idDepartment ||
    item?.idProcess ||
    item?.idCompany ||
    item?.idCollaborator ||
    item?.idNormativeType ||
    item?.idRegulatory ||
    item?.idActionPlan ||
    item?.idReviewer ||
    item?.idReviwer ||
    item?.idResponsible
  );
}

function mapOption(item) {
  return {
    id: getEntityId(item),
    nome: item?.nome || item?.name || item?.description || "",
    ...item,
  };
}

function normalizeNormativeInternType(value) {
  const numericValue = Number(value);
  return [NORMATIVE_INTERN_TYPE.INTERNAL, NORMATIVE_INTERN_TYPE.EXTERNAL].includes(
    numericValue,
  )
    ? numericValue
    : "";
}

function getEnvironmentKind(normativeInternType) {
  const normalizedType = normalizeNormativeInternType(normativeInternType);

  if (normalizedType === NORMATIVE_INTERN_TYPE.EXTERNAL) return "external";
  if (normalizedType === NORMATIVE_INTERN_TYPE.INTERNAL) return "internal";
  return "";
}

function toIdArray(value, fallback = []) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return fallback;
}

function normalizeIdValue(value) {
  if (value === null || value === undefined || value === "") return null;

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue) && String(numericValue) === String(value)) {
    return numericValue;
  }

  return value;
}

function normalizeIdArray(value, { exclude = [] } = {}) {
  const excludedValues = new Set((exclude || []).map((item) => String(item)));
  const seenValues = new Set();

  return (Array.isArray(value) ? value : [])
    .map(normalizeIdValue)
    .filter((item) => item !== null && !excludedValues.has(String(item)))
    .filter((item) => {
      const normalizedItem = String(item);
      if (seenValues.has(normalizedItem)) return false;
      seenValues.add(normalizedItem);
      return true;
    });
}

function getConflictingNormativeIds(origins, destinies) {
  const normalizedDestinies = new Set(
    normalizeIdArray(destinies).map((item) => String(item)),
  );

  return normalizeIdArray(origins).filter((originId) =>
    normalizedDestinies.has(String(originId)),
  );
}

function resolveRiskValue(value) {
  const numericValue = Number(value);
  return [1, 2, 3].includes(numericValue) ? numericValue : null;
}

function resolveFrequencyRevisionValue(frequencyRevision, riskValue = null) {
  const derivedFromRisk = resolveRiskValue(riskValue);
  if (derivedFromRisk) return derivedFromRisk;

  const numericValue = Number(frequencyRevision);
  return [1, 2, 3].includes(numericValue) ? numericValue : "";
}

function appendCommentHistory(currentValue, newValue, userName) {
  const trimmedValue = (newValue || "").trim();
  if (!trimmedValue) return currentValue || "";

  const entry = `[${userName}]: ${trimmedValue} - ${new Date().toLocaleString(
    "pt-BR",
  )}`;

  return currentValue ? `${currentValue}\n\n${entry}` : entry;
}

function calculateRevisionFields(lastRevision, frequencyRevision) {
  const revisionDate = toDate(lastRevision);
  const normalizedFrequency = Number(frequencyRevision);
  const daysByFrequency = { 1: 180, 2: 360, 3: 720 };
  const revisionDays = daysByFrequency[normalizedFrequency];

  if (!revisionDate || !revisionDays) {
    return {
      limitDate: null,
      days: "",
      status: "",
    };
  }

  const limitDate = new Date(revisionDate);
  limitDate.setDate(limitDate.getDate() + revisionDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  limitDate.setHours(0, 0, 0, 0);

  const diffMs = limitDate.getTime() - today.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { limitDate, days, status: 3 };
  }

  if (days <= 30) {
    return { limitDate, days, status: 2 };
  }

  return { limitDate, days, status: 1 };
}

function extractApiNotifications(error) {
  return Array.isArray(error?.response?.data?.notifications)
    ? error.response.data.notifications
    : [];
}

function getApiNotificationMessages(error) {
  const messages = extractApiNotifications(error)
    .map((notification) => notification?.message?.trim())
    .filter(Boolean);

  if (messages.length > 0) {
    return messages;
  }

  const fallbackMessage = error?.response?.data?.message?.trim();
  return fallbackMessage ? [fallbackMessage] : [];
}

function resolveNotificationField(notification) {
  const normalizedCode = normalizeText(notification?.code);
  const normalizedMessage = normalizeText(notification?.message);

  if (normalizedCode === "code" || normalizedMessage.includes("codigo")) {
    return "code";
  }

  if (
    normalizedCode === "normativeinterntype" ||
    normalizedMessage.includes("ambiente")
  ) {
    return "ambiente";
  }

  return "";
}

function extractFileList(source) {
  if (!source) return [];

  if (Array.isArray(source.files)) {
    return source.files;
  }

  if (Array.isArray(source.normativeDocuments)) {
    return source.normativeDocuments
      .map((document) => ({
        name: document.name || document.description || "Documento",
        path: document.file,
      }))
      .filter((document) => document.path);
  }

  return [];
}

function extractFilePaths(files) {
  return (files || [])
    .map((file) => {
      if (typeof file === "string") return file;
      if (file?.path) return file.path;
      if (file?.file) return file.file;
      return null;
    })
    .filter(Boolean);
}

function getApproverEmail(approver) {
  return (
    approver?.email ||
    approver?.mail ||
    approver?.emailAddress ||
    approver?.approver?.email ||
    approver?.collaborator?.email ||
    ""
  );
}

function normalizeNormativeApproverEntries(entries) {
  return (entries || [])
    .map((entry) => {
      const email = getApproverEmail(entry);
      const idApprover =
        entry?.idApprover ||
        entry?.approver?.idCollaborator ||
        entry?.collaborator?.idCollaborator ||
        entry?.idCollaborator ||
        entry?.id ||
        "";

      if (!email && !idApprover) return null;

      return {
        idApprover,
        email,
        approved: Boolean(entry?.approved),
      };
    })
    .filter(Boolean);
}

function buildNormativeApproverEntries({
  selectedApproverIds = null,
  approverOptions = [],
  currentApprovers = [],
}) {
  const normalizedCurrentApprovers =
    normalizeNormativeApproverEntries(currentApprovers);
  const hasSelectedApprovers = Array.isArray(selectedApproverIds);
  const normalizedSelectedIds = hasSelectedApprovers
    ? selectedApproverIds.filter(Boolean)
    : [];

  if (!hasSelectedApprovers) {
    return normalizedCurrentApprovers;
  }

  if (normalizedSelectedIds.length === 0) {
    return [];
  }

  const usedCurrentIndexes = new Set();

  return normalizedSelectedIds
    .map((selectedId, index) => {
      const matchedOption =
        approverOptions.find(
          (option) => String(option.id) === String(selectedId),
        ) || null;
      const optionEmail = getApproverEmail(matchedOption);

      let matchedCurrentIndex = normalizedCurrentApprovers.findIndex(
        (approver, currentIndex) => {
          if (usedCurrentIndexes.has(currentIndex)) return false;

          if (
            approver.idApprover &&
            String(approver.idApprover) === String(selectedId)
          ) {
            return true;
          }

          return (
            Boolean(optionEmail) &&
            normalizeText(approver.email) === normalizeText(optionEmail)
          );
        },
      );

      if (
        matchedCurrentIndex === -1 &&
        normalizedCurrentApprovers[index] &&
        !usedCurrentIndexes.has(index)
      ) {
        matchedCurrentIndex = index;
      }

      if (matchedCurrentIndex !== -1) {
        usedCurrentIndexes.add(matchedCurrentIndex);
      }

      const matchedCurrentApprover =
        matchedCurrentIndex === -1
          ? null
          : normalizedCurrentApprovers[matchedCurrentIndex];

      return {
        idApprover: selectedId,
        email: matchedCurrentApprover?.email || optionEmail || "",
        approved: Boolean(matchedCurrentApprover?.approved),
      };
    })
    .filter((approver) => approver.idApprover || approver.email);
}

function serializeNormativeApproverEntries(entries) {
  return normalizeNormativeApproverEntries(entries).map((entry) => ({
    email: entry.email || "",
    approved: Boolean(entry.approved),
  }));
}

function mapNormativeToForm(record) {
  if (!record) return { ...INITIAL_FORM_DATA };

  const normalizedRisk = resolveRiskValue(record.normativeRisk);
  const resolvedFrequencyRevision = resolveFrequencyRevisionValue(
    record.frequencyRevision,
    normalizedRisk,
  );

  return {
    idNormative: record.idNormative || record.id || "",
    code: record.code || "",
    name: record.name || "",
    ambiente: normalizeNormativeInternType(
      record.normativeInternType ??
        record.environment?.id,
    ),
    responsavel:
      record.idResponsible ||
      record.responsible?.idCollaborator ||
      record.responsible?.id ||
      "",
    revisor:
      record.idReviwer ||
      record.idReviewer ||
      record.reviwer?.idCollaborator ||
      record.reviwer?.id ||
      "",
    statusNorma: record.normativeStatus || "",
    ativo: typeof record.active === "boolean" ? record.active : true,
    tipoNorma:
      record.idNormativeType || record.normativeType?.idNormativeType || "",
    regulador: record.idRegulatory || record.regulatory?.idRegulatory || "",
    riscoNorma: normalizedRisk,
    periodicidadeRevisao: resolvedFrequencyRevision,
    statuRevisao: record.normativeRevisionStatus || "",
    normaOrigem: Array.isArray(record.idOrigins)
      ? record.idOrigins.filter(Boolean)
      : toIdArray(
          record.normativeOrigins?.map(
            (origin) =>
              origin.idNormativeOrigin || origin.idNormative || origin.id,
          ),
        ),
    normaDestino: Array.isArray(record.idDestinies)
      ? record.idDestinies.filter(Boolean)
      : toIdArray(
          record.normativeDestinies?.map(
            (destiny) =>
              destiny.idNormativeDestiny || destiny.idNormative || destiny.id,
          ),
        ),
    empresa: Array.isArray(record.idCompanies)
      ? record.idCompanies.filter(Boolean)
      : toIdArray(
          record.normativeCompanies?.map(
            (company) => company.idCompany || company.company?.idCompany,
          ),
        ),
    departamento: Array.isArray(record.idDepartments)
      ? record.idDepartments.filter(Boolean)
      : toIdArray(
          record.normativeDepartments?.map(
            (department) =>
              department.idDepartment || department.department?.idDepartment,
          ),
        ),
    processo: Array.isArray(record.idProcesses)
      ? record.idProcesses.filter(Boolean)
      : Array.isArray(record.idProcess)
        ? record.idProcess.filter(Boolean)
        : toIdArray(
            record.normativeProcess?.map(
              (process) => process.idProcess || process.process?.idProcess,
            ),
          ),
    planoAcao: Array.isArray(record.idActionPlans)
      ? record.idActionPlans.filter(Boolean)
      : toIdArray(
          record.normativeActionPlans?.map(
            (plan) => plan.idActionPlan || plan.actionPlan?.idActionPlan,
          ),
        ),
    aprovador: Array.isArray(record.idApprovers)
      ? record.idApprovers.filter(Boolean)
      : toIdArray(
          record.normativeApprovers?.map(
            (approver) =>
              approver.idApprover || approver.approver?.idCollaborator,
          ),
        ),
    dataCadastro: toDate(record.registerDate) || new Date(),
    dataPublicacao: toDate(record.publishDate),
    vigenciaInicial: toDate(record.initialVigency),
    ultimaRevisao: toDate(record.lastRevision),
    dataRevogacao: toDate(record.revocationDate),
    motivoRevogacao: record.revocationReason || "",
    description: record.description || "",
    note: record.note || "",
    descriptionReviewer: record.descriptionReviewer || record.conclusion || "",
    files: extractFileList(record),
  };
}

function buildNormativeEnvironmentOptions() {
  return NORMATIVE_ENVIRONMENT_OPTIONS.map((option) => mapOption(option));
}

function buildSelectedValues(ids, options) {
  return ids.map(
    (id) =>
      options.find((option) => String(option.id) === String(id)) || {
        id,
        nome: String(id),
      },
  );
}

function CommentCard({
  title,
  placeholder,
  draftValue,
  historyValue,
  onDraftChange,
  onSave,
  disabled,
  loading,
}) {
  return (
    <Stack
      spacing={2}
      sx={{
        backgroundColor: "#f9f9f9",
        padding: 3,
        borderRadius: 2,
        border: "1px solid #eee",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <InputLabel sx={{ m: 0, fontWeight: "bold" }}>{title}</InputLabel>
        <Button
          variant="outlined"
          size="small"
          onClick={onSave}
          disabled={disabled || loading || !draftValue.trim()}
          sx={{ fontWeight: 600, textTransform: "none" }}
        >
          Salvar comentário
        </Button>
      </Stack>

      <TextField
        fullWidth
        multiline
        rows={3}
        value={draftValue}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        sx={{ backgroundColor: "#fff" }}
      />

      {historyValue ? (
        <>
          <InputLabel sx={{ fontWeight: "bold", mt: 1 }}>
            Histórico de comentários
          </InputLabel>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            value={historyValue}
            InputProps={{ readOnly: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f0f7ff",
              },
              "& .MuiInputBase-input": {
                color: "#0d0d0d !important",
                WebkitTextFillColor: "#0d0d0d !important",
              },
            }}
          />
        </>
      ) : null}
    </Stack>
  );
}

function HistoryLogCard({ title, value, placeholder }) {
  return (
    <Stack
      spacing={2}
      sx={{
        backgroundColor: "#f9f9f9",
        padding: 3,
        borderRadius: 2,
        border: "1px solid #eee",
      }}
    >
      <InputLabel sx={{ m: 0, fontWeight: "bold" }}>{title}</InputLabel>
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        value={value || ""}
        placeholder={placeholder}
        InputProps={{ readOnly: true }}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#f0f7ff",
          },
          "& .MuiInputBase-input": {
            color: "#0d0d0d !important",
            WebkitTextFillColor: "#0d0d0d !important",
          },
        }}
      />
    </Stack>
  );
}

function ColumnsLayouts() {
  const { token } = useToken();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const idNormativeFromRoute = dadosApi?.idNormative || "";
  const idUser = localStorage.getItem("id_user");
  const userName = localStorage.getItem("username") || "Usuário";

  const [ambientes] = useState(() => buildNormativeEnvironmentOptions());
  const [departamentos, setDepartamentos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [normaOrigens, setNormaOrigens] = useState([]);
  const [normaDestinos, setNormaDestinos] = useState([]);
  const [planosAcoes, setPlanosAcoes] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [aprovadores, setAprovadores] = useState([]);
  const [reguladores, setReguladores] = useState([]);
  const [tipoNormas, setTipoNormas] = useState([]);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [draftComments, setDraftComments] = useState(INITIAL_DRAFT_COMMENTS);
  const [normativaDados, setNormativaDados] = useState(null);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrorMessages, setFieldErrorMessages] = useState(
    INITIAL_FIELD_ERROR_MESSAGES,
  );
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogMode, setSuccessDialogMode] = useState("create");
  const [confirmRevisorOpen, setConfirmRevisorOpen] = useState(false);
  const [confirmReviewOpen, setConfirmReviewOpen] = useState(false);
  const [confirmRevogOpen, setConfirmRevogOpen] = useState(false);
  const [reviewJustification, setReviewJustification] = useState("");
  const [tempResponsavelId, setTempResponsavelId] = useState(null);
  const [tempRevDate, setTempRevDate] = useState(null);
  const [showJustificativaField, setShowJustificativaField] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [allowPostCreateEditing, setAllowPostCreateEditing] = useState(
    Boolean(dadosApi?.allowPostCreateEditing),
  );
  const [initialResponsibleApplied, setInitialResponsibleApplied] =
    useState(false);
  const topAnchorRef = useRef(null);
  const [formValidation, setFormValidation] = useState({
    code: true,
    name: true,
    ambiente: true,
    revisor: true,
    responsavel: true,
    statusNorma: true,
    ultimaRevisao: true,
  });

  const requisicao = formData.idNormative ? "Editar" : "Criar";
  const feedbackLabel = requisicao === "Criar" ? "cadastrada" : "editada";

  useEffect(() => {
    window.hasChanges = hasChanges;
    return () => {
      window.hasChanges = false;
    };
  }, [hasChanges]);

  useEffect(() => {
    setAllowPostCreateEditing(Boolean(dadosApi?.allowPostCreateEditing));
  }, [dadosApi?.allowPostCreateEditing, idNormativeFromRoute]);

  const withDirty = (updater) => {
    setHasChanges(true);
    setFormData((previous) =>
      typeof updater === "function"
        ? updater(previous)
        : { ...previous, ...updater },
    );
  };

  const keepViewportAtTop = useCallback(({ focusTop = false } = {}) => {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });

      if (focusTop && topAnchorRef.current?.focus) {
        try {
          topAnchorRef.current.focus({ preventScroll: true });
        } catch (error) {
          topAnchorRef.current.focus();
        }
      }
    });
  }, []);

  const clearFieldError = (field) => {
    setFieldErrorMessages((previous) =>
      previous[field]
        ? { ...previous, [field]: INITIAL_FIELD_ERROR_MESSAGES[field] || "" }
        : previous,
    );

    setFormValidation((previous) =>
      previous[field] ? previous : { ...previous, [field]: true },
    );
  };

  const applyApiValidationFeedback = (error) => {
    const notifications = extractApiNotifications(error);

    if (notifications.length === 0) return;

    const validationUpdates = {};
    const messageUpdates = {};

    notifications.forEach((notification) => {
      const field = resolveNotificationField(notification);
      if (!field) return;

      validationUpdates[field] = false;
      messageUpdates[field] = notification.message || "";
    });

    if (Object.keys(validationUpdates).length > 0) {
      setFormValidation((previous) => ({
        ...previous,
        ...validationUpdates,
      }));
    }

    if (Object.keys(messageUpdates).length > 0) {
      setFieldErrorMessages((previous) => ({
        ...previous,
        ...messageUpdates,
      }));
    }
  };

  const loadOptions = useCallback(async () => {
    const endpoints = [
      { url: `${API_URL}departments`, setter: setDepartamentos },
      { url: `${API_URL}normatives/types`, setter: setTipoNormas },
      { url: `${API_URL}normatives/regulatories`, setter: setReguladores },
      { url: `${API_URL}normatives`, setter: setNormaOrigens },
      { url: `${API_URL}normatives`, setter: setNormaDestinos },
      { url: `${API_URL}companies`, setter: setEmpresas },
      { url: `${API_URL}processes`, setter: setProcessos },
      { url: `${API_URL}action-plans`, setter: setPlanosAcoes },
      {
        url: `${API_URL}collaborators/responsibles`,
        setter: setResponsaveis,
      },
      {
        url: `${API_URL}collaborators/responsibles`,
        setter: setAprovadores,
      },
    ];

    await Promise.all(
      endpoints.map(async ({ url, setter, transform }) => {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const mappedOptions = (response.data || []).map(mapOption);
        setter(transform ? transform(mappedOptions) : mappedOptions);
      }),
    );
  }, [token]);

  const loadNormative = useCallback(async (idNormative) => {
    if (!idNormative) return;

    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}normatives/${idNormative}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNormativaDados(response.data);
      setFormData(mapNormativeToForm(response.data));
      setDraftComments(INITIAL_DRAFT_COMMENTS);
      setDeletedFiles([]);
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível carregar a normativa.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        await loadOptions();

        if (idNormativeFromRoute) {
          await loadNormative(idNormativeFromRoute);
        }

        keepViewportAtTop();
      } catch (error) {
        console.error(error);
        enqueueSnackbar("Não foi possível carregar os catálogos da tela.", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [idNormativeFromRoute, keepViewportAtTop, loadNormative, loadOptions, token]);

  useEffect(() => {
    if (initialResponsibleApplied) return;
    if (requisicao !== "Criar") return;
    if (!idUser || responsaveis.length === 0) return;

    const userIsResponsible = responsaveis.some(
      (responsavel) => String(responsavel.id) === String(idUser),
    );

    setInitialResponsibleApplied(true);
    if (!userIsResponsible) return;
    if (formData.responsavel && formData.revisor) return;

    setFormData((previous) => ({
      ...previous,
      responsavel: previous.responsavel || idUser,
      revisor: previous.revisor || idUser,
    }));
  }, [
    formData.responsavel,
    formData.revisor,
    idUser,
    initialResponsibleApplied,
    requisicao,
    responsaveis,
  ]);

  const ambienteKind = useMemo(
    () => getEnvironmentKind(formData.ambiente),
    [formData.ambiente],
  );

  const isExterno = ambienteKind === "external";
  const isInterno = ambienteKind === "internal";
  const currentStatus = formData.statusNorma || "";
  const persistedStatus = normativaDados?.normativeStatus || "";
  const currentNormativeId = formData.idNormative || idNormativeFromRoute;
  const currentUserEmail = normalizeText(user?.email);
  const isPostCreateEditing =
    allowPostCreateEditing &&
    requisicao === "Editar" &&
    currentStatus === STATUS.VERSAO_FINAL;
  const resolvedFrequencyRevision = useMemo(
    () =>
      resolveFrequencyRevisionValue(
        formData.periodicidadeRevisao,
        formData.riscoNorma,
      ),
    [formData.periodicidadeRevisao, formData.riscoNorma],
  );

  const revisionData = useMemo(
    () =>
      calculateRevisionFields(
        formData.ultimaRevisao,
        resolvedFrequencyRevision,
      ),
    [formData.ultimaRevisao, resolvedFrequencyRevision],
  );

  const normativeApproverEntries = useMemo(
    () =>
      buildNormativeApproverEntries({
        selectedApproverIds: formData.aprovador,
        approverOptions: aprovadores,
        currentApprovers: normativaDados?.normativeApprovers,
      }),
    [aprovadores, formData.aprovador, normativaDados?.normativeApprovers],
  );

  const currentPendingApprovalIndex = useMemo(
    () => normativeApproverEntries.findIndex((approver) => !approver.approved),
    [normativeApproverEntries],
  );

  const currentUserApprovalIndex = useMemo(
    () =>
      normativeApproverEntries.findIndex((approver) => {
        if (
          approver.idApprover &&
          String(approver.idApprover) === String(idUser)
        ) {
          return true;
        }

        return (
          Boolean(currentUserEmail) &&
          normalizeText(approver.email) === currentUserEmail
        );
      }),
    [currentUserEmail, idUser, normativeApproverEntries],
  );

  const isFutureApprover = Boolean(
    currentStatus === STATUS.EM_APROVACAO &&
      currentUserApprovalIndex !== -1 &&
      currentPendingApprovalIndex !== -1 &&
      currentUserApprovalIndex > currentPendingApprovalIndex,
  );

  const canReplyApproval =
    currentStatus === STATUS.EM_APROVACAO &&
    currentUserApprovalIndex !== -1 &&
    currentUserApprovalIndex === currentPendingApprovalIndex;

  const isResponsible = String(formData.responsavel) === String(idUser);
  const isReviewer = String(formData.revisor) === String(idUser);
  const canEditGeneralFields =
    requisicao === "Criar" ||
    (((persistedStatus || currentStatus) === STATUS.ELABORACAO ||
      (persistedStatus || currentStatus) === STATUS.EM_ALTERACAO ||
      isPostCreateEditing) &&
      isResponsible &&
      !isFutureApprover);

  const canEditReviewFields =
    requisicao === "Editar" &&
    isReviewer &&
    currentStatus === STATUS.VERSAO_FINAL &&
    !isPostCreateEditing;
  const canEditLastRevision = false;
  const canEditRisk = canEditGeneralFields;
  const canEditApprovalComment = canReplyApproval;
  const canManageAttachments =
    canEditGeneralFields || canEditReviewFields || canReplyApproval;
  const canRevogar =
    requisicao === "Editar" &&
    currentStatus === STATUS.VERSAO_FINAL &&
    isResponsible &&
    !isPostCreateEditing;
  const canAlterar =
    requisicao === "Editar" &&
    currentStatus === STATUS.VERSAO_FINAL &&
    isResponsible &&
    !isPostCreateEditing;
  const canSendElaborated =
    requisicao === "Editar" &&
    currentStatus === STATUS.ELABORACAO &&
    isResponsible;
  const canSendAltered =
    requisicao === "Editar" &&
    currentStatus === STATUS.EM_ALTERACAO &&
    isResponsible;
  const canMarkReviewed =
    requisicao === "Editar" &&
    isReviewer &&
    currentStatus === STATUS.VERSAO_FINAL;

  const showApprovalComment =
    requisicao === "Editar" &&
    (formData.aprovador.length > 0 || Boolean(formData.note));
  const canPersistForm =
    requisicao === "Criar" || canEditGeneralFields || canEditReviewFields;
  const selectedNormaOrigemIds = useMemo(
    () =>
      normalizeIdArray(formData.normaOrigem, {
        exclude: [currentNormativeId],
      }),
    [currentNormativeId, formData.normaOrigem],
  );
  const selectedNormaDestinoIds = useMemo(
    () =>
      normalizeIdArray(formData.normaDestino, {
        exclude: [currentNormativeId],
      }),
    [currentNormativeId, formData.normaDestino],
  );
  const allNormaOrigens = useMemo(
    () =>
      normaOrigens.filter(
        (item) => String(item.id) !== String(currentNormativeId),
      ),
    [currentNormativeId, normaOrigens],
  );
  const allNormaDestinos = useMemo(
    () =>
      normaDestinos.filter(
        (item) => String(item.id) !== String(currentNormativeId),
      ),
    [currentNormativeId, normaDestinos],
  );
  const filteredNormaOrigens = useMemo(
    () =>
      allNormaOrigens.filter(
        (item) =>
          !selectedNormaDestinoIds.some(
            (selectedId) => String(selectedId) === String(item.id),
          ),
      ),
    [allNormaOrigens, selectedNormaDestinoIds],
  );
  const filteredNormaDestinos = useMemo(
    () =>
      allNormaDestinos.filter(
        (item) =>
          !selectedNormaOrigemIds.some(
            (selectedId) => String(selectedId) === String(item.id),
          ),
      ),
    [allNormaDestinos, selectedNormaOrigemIds],
  );
  const selectedAvailableNormaOrigemIds = useMemo(
    () =>
      normalizeIdArray(formData.normaOrigem, {
        exclude: [currentNormativeId, ...selectedNormaDestinoIds],
      }),
    [currentNormativeId, formData.normaOrigem, selectedNormaDestinoIds],
  );
  const selectedAvailableNormaDestinoIds = useMemo(
    () =>
      normalizeIdArray(formData.normaDestino, {
        exclude: [currentNormativeId, ...selectedNormaOrigemIds],
      }),
    [currentNormativeId, formData.normaDestino, selectedNormaOrigemIds],
  );
  const conflictingNormativeIds = useMemo(
    () =>
      getConflictingNormativeIds(
        selectedNormaOrigemIds,
        selectedNormaDestinoIds,
      ),
    [selectedNormaDestinoIds, selectedNormaOrigemIds],
  );

  const visibleStatusOptions = useMemo(() => {
    if (requisicao !== "Criar") {
      return STATUS_OPTIONS;
    }

    if (isExterno) {
      return STATUS_OPTIONS.filter(
        (statusOption) => statusOption.id === STATUS.VERSAO_FINAL,
      );
    }

    if (isInterno) {
      return STATUS_OPTIONS.filter(
        (statusOption) =>
          statusOption.id === STATUS.ELABORACAO ||
          statusOption.id === STATUS.VERSAO_FINAL,
      );
    }

    return STATUS_OPTIONS.filter(
      (statusOption) =>
        statusOption.id === STATUS.ELABORACAO ||
        statusOption.id === STATUS.VERSAO_FINAL,
    );
  }, [isExterno, isInterno, requisicao]);

  const selectedRiskOption =
    RISK_OPTIONS.find((option) =>
      option.id === "na"
        ? resolveRiskValue(formData.riscoNorma) === null
        : option.id === resolveRiskValue(formData.riscoNorma),
    ) || null;

  const buildUpdatePayload = (
    source,
    overrides = {},
    { currentApprovers = normativaDados?.normativeApprovers } = {},
  ) => {
    const base = {
      ...INITIAL_FORM_DATA,
      ...source,
      ...overrides,
    };

    const normalizedRisk = resolveRiskValue(base.riscoNorma);
    const normalizedFrequencyRevision = resolveFrequencyRevisionValue(
      base.periodicidadeRevisao,
      normalizedRisk,
    );
    const normalizedStatus = Number(base.statusNorma) || null;
    const normalizedRevisionStatus = Number(base.statuRevisao) || null;
    const normalizedLastRevision =
      normalizedStatus === STATUS.VERSAO_FINAL
        ? toDate(base.ultimaRevisao) || getTodayDate()
        : toDate(base.ultimaRevisao);
    const shouldFillRevisionWorkflow =
      normalizedStatus === STATUS.VERSAO_FINAL &&
      normalizedRisk !== null &&
      Boolean(normalizedFrequencyRevision);

    const computedRevision = shouldFillRevisionWorkflow
      ? calculateRevisionFields(
          normalizedLastRevision,
          normalizedFrequencyRevision,
        )
      : { limitDate: null, days: "", status: "" };
    const approvalEntries = Array.isArray(base.normativeApprovers)
      ? normalizeNormativeApproverEntries(base.normativeApprovers)
      : buildNormativeApproverEntries({
          selectedApproverIds: base.aprovador,
          approverOptions: aprovadores,
          currentApprovers,
        });

    return {
      idNormative: base.idNormative,
      code: base.code?.trim() || null,
      name: base.name?.trim() || null,
      description: base.description || null,
      note: base.note || null,
      registerDate: toIso(base.dataCadastro),
      publishDate: toIso(base.dataPublicacao),
      initialVigency: toIso(base.vigenciaInicial),
      lastRevision: toIso(normalizedLastRevision),
      conclusion: base.descriptionReviewer || null,
      frequencyRevision: shouldFillRevisionWorkflow
        ? Number(normalizedFrequencyRevision) || null
        : null,
      limitDateRevision: shouldFillRevisionWorkflow
        ? toIso(computedRevision.limitDate)
        : null,
      daysRevision:
        shouldFillRevisionWorkflow && computedRevision.days !== ""
          ? String(computedRevision.days)
          : null,
      revocationDate: toIso(base.dataRevogacao),
      revocationReason: base.motivoRevogacao || null,
      normativeStatus: normalizedStatus,
      normativeRevisionStatus:
        normalizedRevisionStatus ||
        (shouldFillRevisionWorkflow ? computedRevision.status || null : null),
      normativeRisk: normalizedRisk,
      descriptionReviewer: base.descriptionReviewer || null,
      active: Boolean(base.ativo),
      idNormativeType: base.tipoNorma || null,
      idRegulatory: base.regulador || null,
      idResponsible: base.responsavel || null,
      normativeInternType: normalizeNormativeInternType(base.ambiente) || null,
      idReviwer: base.revisor || null,
      idOrigins: normalizeIdArray(base.normaOrigem, {
        exclude: [base.idNormative],
      }),
      idDestinies: normalizeIdArray(base.normaDestino, {
        exclude: [base.idNormative],
      }),
      idActionPlans: base.planoAcao,
      idApprovers: base.aprovador,
      emailApprovers: approvalEntries
        .map((approver) => approver.email)
        .filter(Boolean),
      normativeApprovers: serializeNormativeApproverEntries(approvalEntries),
      idCompanies: base.empresa,
      idDepartments: base.departamento,
      idProcesses: base.processo,
      files: extractFilePaths(base.files),
    };
  };

  const uploadCurrentFiles = async (idNormative) => {
    if (deletedFiles.length > 0) {
      const payload = deletedFiles
        .map((file) => file?.name || file?.filename)
        .filter(Boolean);

      if (payload.length > 0) {
        await axios.delete(`${API_URL}files`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            containerFolder: FILE_CONTAINER_FOLDER,
            files: payload,
          },
        });
      }
    }

    const newFiles = formData.files.filter((file) => file instanceof File);
    const existingFiles = formData.files.filter(
      (file) => !(file instanceof File),
    );

    let uploadedFiles = [];

    if (newFiles.length > 0) {
      const formDataUpload = new FormData();
      formDataUpload.append("ContainerFolder", FILE_CONTAINER_FOLDER);

      if (idNormative) {
        formDataUpload.append("IdContainer", idNormative);
      }

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
        },
      );

      uploadedFiles = uploadResponse.data?.files || [];
    }

    return [...existingFiles, ...uploadedFiles];
  };

  const applyDraftComments = (source, fields = Object.keys(draftComments)) => {
    const nextSource = { ...source };

    fields.forEach((field) => {
      const draftValue = draftComments[field]?.trim();
      if (!draftValue) return;

      nextSource[field] = appendCommentHistory(
        nextSource[field],
        draftValue,
        userName,
      );
    });

    return nextSource;
  };

  const clearDraftComments = (fields = Object.keys(draftComments)) => {
    setDraftComments((previous) => {
      const nextDrafts = { ...previous };
      fields.forEach((field) => {
        nextDrafts[field] = "";
      });
      return nextDrafts;
    });
  };

  const validateBaseFields = ({ requireLastRevision = false } = {}) => {
    const nextValidation = {
      code: Boolean(formData.code.trim()),
      name: Boolean(formData.name.trim()),
      ambiente: Boolean(formData.ambiente),
      revisor: Boolean(formData.revisor),
      responsavel: Boolean(formData.responsavel),
      statusNorma: Boolean(formData.statusNorma),
      ultimaRevisao: !requireLastRevision || Boolean(formData.ultimaRevisao),
    };

    setFormValidation(nextValidation);

    const missingLabels = [];

    if (!nextValidation.name) missingLabels.push("Nome");
    if (!nextValidation.code) missingLabels.push("Código");
    if (!nextValidation.ambiente) missingLabels.push("Ambiente");
    if (!nextValidation.revisor) missingLabels.push("Revisor");
    if (!nextValidation.responsavel) missingLabels.push("Responsável");
    if (!nextValidation.statusNorma) missingLabels.push("Status da norma");
    if (!nextValidation.ultimaRevisao) missingLabels.push("Última revisão");

    if (missingLabels.length > 0) {
      enqueueSnackbar(
        `Os campos ${missingLabels.join(", ")} são obrigatórios para continuar.`,
        {
          variant: "error",
        },
      );
      return false;
    }

    if (conflictingNormativeIds.length > 0) {
      enqueueSnackbar(
        "A mesma normativa não pode ser selecionada como origem e destino ao mesmo tempo.",
        {
          variant: "error",
        },
      );
      return false;
    }

    return true;
  };

  const saveCommentField = async (field) => {
    const draftValue = draftComments[field]?.trim();

    if (!draftValue) {
      enqueueSnackbar("Escreva um comentário antes de salvar.", {
        variant: "warning",
      });
      return;
    }

    if (!normativaDados?.idNormative) {
      enqueueSnackbar(
        "O comentário rápido só pode ser salvo após a criação da normativa.",
        {
          variant: "warning",
        },
      );
      return;
    }

    setLoading(true);

    try {
      const baseSource = mapNormativeToForm(normativaDados);
      const updatedValue = appendCommentHistory(
        baseSource[field],
        draftValue,
        userName,
      );

      const payload = buildUpdatePayload(baseSource, {
        [field]: updatedValue,
      });

      await axios.put(`${API_URL}normatives`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNormativaDados((previous) => ({
        ...previous,
        [field]: updatedValue,
        ...(field === "descriptionReviewer" ? { conclusion: updatedValue } : {}),
      }));

      setFormData((previous) => ({
        ...previous,
        [field]: updatedValue,
      }));

      clearDraftComments([field]);

      enqueueSnackbar("Comentário salvo com sucesso.", {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível salvar o comentário.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const putNormativePayload = async (payload) =>
    axios.put(`${API_URL}normatives`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  const fetchNormativeRecord = async (idNormative) => {
    const response = await axios.get(`${API_URL}normatives/${idNormative}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  const syncLinkedNormatives = async ({
    normativeId,
    previousSource,
    nextSource,
  }) => {
    if (!normativeId) return;

    const normalizedNormativeId = normalizeIdValue(normativeId);
    const previousOrigins = normalizeIdArray(previousSource?.normaOrigem);
    const previousDestinies = normalizeIdArray(previousSource?.normaDestino);
    const nextOrigins = normalizeIdArray(nextSource?.normaOrigem, {
      exclude: [normalizedNormativeId],
    });
    const nextDestinies = normalizeIdArray(nextSource?.normaDestino, {
      exclude: [normalizedNormativeId],
    });

    const updatesByNormative = new Map();
    const ensureUpdateBucket = (targetId) => {
      const normalizedTargetId = normalizeIdValue(targetId);

      if (!normalizedTargetId) return null;
      if (String(normalizedTargetId) === String(normalizedNormativeId)) {
        return null;
      }

      const currentBucket = updatesByNormative.get(normalizedTargetId) || {
        addOrigins: new Set(),
        removeOrigins: new Set(),
        addDestinies: new Set(),
        removeDestinies: new Set(),
      };

      updatesByNormative.set(normalizedTargetId, currentBucket);
      return currentBucket;
    };

    nextOrigins.forEach((originId) => {
      const bucket = ensureUpdateBucket(originId);
      if (!bucket) return;
      bucket.addDestinies.add(normalizedNormativeId);
      bucket.removeDestinies.delete(normalizedNormativeId);
    });

    previousOrigins
      .filter(
        (originId) =>
          !nextOrigins.some((item) => String(item) === String(originId)),
      )
      .forEach((originId) => {
        const bucket = ensureUpdateBucket(originId);
        if (!bucket) return;
        bucket.removeDestinies.add(normalizedNormativeId);
        bucket.addDestinies.delete(normalizedNormativeId);
      });

    nextDestinies.forEach((destinyId) => {
      const bucket = ensureUpdateBucket(destinyId);
      if (!bucket) return;
      bucket.addOrigins.add(normalizedNormativeId);
      bucket.removeOrigins.delete(normalizedNormativeId);
    });

    previousDestinies
      .filter(
        (destinyId) =>
          !nextDestinies.some((item) => String(item) === String(destinyId)),
      )
      .forEach((destinyId) => {
        const bucket = ensureUpdateBucket(destinyId);
        if (!bucket) return;
        bucket.removeOrigins.add(normalizedNormativeId);
        bucket.addOrigins.delete(normalizedNormativeId);
      });

    for (const [targetId, changes] of updatesByNormative.entries()) {
      const targetRecord = await fetchNormativeRecord(targetId);
      const targetForm = mapNormativeToForm(targetRecord);

      const nextTargetOrigins = normalizeIdArray(targetForm.normaOrigem, {
        exclude: [targetId],
      }).filter(
        (originId) =>
          !changes.removeOrigins.has(normalizeIdValue(originId)),
      );
      const nextTargetDestinies = normalizeIdArray(targetForm.normaDestino, {
        exclude: [targetId],
      }).filter(
        (destinyId) =>
          !changes.removeDestinies.has(normalizeIdValue(destinyId)),
      );

      changes.addOrigins.forEach((originId) => {
        nextTargetOrigins.push(originId);
      });
      changes.addDestinies.forEach((destinyId) => {
        nextTargetDestinies.push(destinyId);
      });

      const targetPayload = buildUpdatePayload(
        {
          ...targetForm,
          normaOrigem: normalizeIdArray(nextTargetOrigins, {
            exclude: [targetId],
          }),
          normaDestino: normalizeIdArray(nextTargetDestinies, {
            exclude: [targetId],
          }),
        },
        {},
        { currentApprovers: targetRecord?.normativeApprovers },
      );

      await putNormativePayload(targetPayload);
    }
  };

  const createNormative = async () => {
    if (!validateBaseFields()) return;

    setLoading(true);

    try {
      const createPayload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        idReviewer: formData.revisor || null,
        idResponsible: formData.responsavel || null,
        normativeInternType:
          normalizeNormativeInternType(formData.ambiente) || null,
      };

      const createResponse = await axios.post(
        `${API_URL}normatives`,
        createPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const createdId = createResponse.data?.data?.idNormative;

      if (!createdId) {
        throw new Error("A API não retornou o identificador da normativa.");
      }

      const sourceForUpdate = {
        ...formData,
        idNormative: createdId,
        statusNorma:
          formData.statusNorma ||
          (isExterno ? STATUS.VERSAO_FINAL : STATUS.ELABORACAO),
      };

      const payload = buildUpdatePayload(sourceForUpdate);

      await putNormativePayload(payload);

      clearDraftComments();
      setFieldErrorMessages(INITIAL_FIELD_ERROR_MESSAGES);
      setHasChanges(false);
      setAllowPostCreateEditing(
        sourceForUpdate.statusNorma === STATUS.VERSAO_FINAL,
      );
      setSuccessDialogMode("create");
      setSuccessDialogOpen(true);

      navigate(location.pathname, {
        replace: true,
        state: {
          dadosApi: {
            idNormative: createdId,
            allowPostCreateEditing:
              sourceForUpdate.statusNorma === STATUS.VERSAO_FINAL,
          },
        },
      });

      await loadNormative(createdId);
      keepViewportAtTop();

      enqueueSnackbar(`Normativa ${feedbackLabel} com sucesso!`, {
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      applyApiValidationFeedback(error);
      const [apiMessage] = getApiNotificationMessages(error);
      enqueueSnackbar(apiMessage || "Não foi possível cadastrar a normativa.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNormative = async ({
    overrides = {},
    commentFields = Object.keys(draftComments),
    reloadAfter = true,
    successMessage = "Normativa atualizada com sucesso!",
  } = {}) => {
    if (!currentNormativeId) return false;

    const previousSource = normativaDados ? mapNormativeToForm(normativaDados) : null;
    const currentSource = applyDraftComments(
      {
        ...formData,
        ...overrides,
      },
      commentFields,
    );

    setLoading(true);

    try {
      const syncedFiles = await uploadCurrentFiles(currentNormativeId);
      const payload = buildUpdatePayload(
        {
          ...currentSource,
          files: syncedFiles,
        },
        overrides,
      );

      await putNormativePayload(payload);

      let linkedSyncFailed = false;
      try {
        await syncLinkedNormatives({
          normativeId: currentNormativeId,
          previousSource,
          nextSource: currentSource,
        });
      } catch (syncError) {
        linkedSyncFailed = true;
        console.error(syncError);
      }

      clearDraftComments(commentFields);
      setFieldErrorMessages(INITIAL_FIELD_ERROR_MESSAGES);
      setDeletedFiles([]);
      setHasChanges(false);

      if (reloadAfter) {
        await loadNormative(currentNormativeId);
      } else {
        setFormData((previous) => ({
          ...previous,
          ...currentSource,
          files: syncedFiles,
        }));
      }

      enqueueSnackbar(successMessage, {
        variant: "success",
      });

      if (linkedSyncFailed) {
        enqueueSnackbar(
          "A normativa foi salva, mas não foi possível sincronizar todos os vínculos de origem e destino.",
          {
            variant: "warning",
          },
        );
      }

      return true;
    } catch (error) {
      console.error(error);
      applyApiValidationFeedback(error);
      const [apiMessage] = getApiNotificationMessages(error);
      enqueueSnackbar(apiMessage || "Não foi possível atualizar a normativa.", {
        variant: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmRevog = (newDate) => {
    if (!newDate) {
      withDirty({ dataRevogacao: null });
      return;
    }

    setTempRevDate(newDate);
    setShowJustificativaField(!formData.motivoRevogacao.trim());
    setConfirmRevogOpen(true);
  };

  const handleCancelRevog = () => {
    setConfirmRevogOpen(false);
    setTempRevDate(null);
    setShowJustificativaField(false);
  };

  const handleConfirmRevog = async () => {
    if (!formData.motivoRevogacao.trim()) {
      enqueueSnackbar("A justificativa de revogação é obrigatória.", {
        variant: "error",
      });
      return;
    }

    const revocationReason = appendCommentHistory(
      normativaDados?.revocationReason || "",
      formData.motivoRevogacao,
      userName,
    );

    const updated = await updateNormative({
      overrides: {
        statusNorma: STATUS.REVOGADO,
        dataRevogacao: tempRevDate || new Date(),
        motivoRevogacao: revocationReason,
      },
      commentFields: [],
      successMessage: "Normativa revogada com sucesso!",
    });

    if (updated) {
      handleCancelRevog();
    }
  };

  const handleWorkflowSubmit = async (targetStatus) => {
    if (!validateBaseFields()) return;

    const hasApprovers =
      Array.isArray(formData.aprovador) && formData.aprovador.length > 0;

    const finalStatus =
      targetStatus ||
      (hasApprovers ? STATUS.EM_APROVACAO : STATUS.VERSAO_FINAL);
    const nextLastRevision =
      finalStatus === STATUS.VERSAO_FINAL && !formData.ultimaRevisao
        ? getTodayDate()
        : formData.ultimaRevisao;
    const nextFrequencyRevision =
      finalStatus === STATUS.VERSAO_FINAL ? resolvedFrequencyRevision : "";
    const pendingApprovalEntries =
      finalStatus === STATUS.EM_APROVACAO
        ? buildNormativeApproverEntries({
            selectedApproverIds: formData.aprovador,
            approverOptions: aprovadores,
            currentApprovers: [],
          }).map((approver) => ({
            ...approver,
            approved: false,
          }))
        : null;

    const updated = await updateNormative({
      overrides: {
        statusNorma: finalStatus,
        ultimaRevisao: nextLastRevision,
        periodicidadeRevisao: nextFrequencyRevision,
        statuRevisao:
          finalStatus === STATUS.VERSAO_FINAL && nextFrequencyRevision
            ? REVISION_STATUS_OPTIONS[0].id
            : formData.statuRevisao,
        ...(pendingApprovalEntries
          ? { normativeApprovers: pendingApprovalEntries }
          : {}),
      },
      commentFields: [],
      successMessage:
        finalStatus === STATUS.EM_APROVACAO
          ? "Normativa enviada para aprovação."
          : "Normativa finalizada com sucesso!",
    });

    if (!updated) return;

    if (finalStatus === STATUS.EM_APROVACAO) {
      try {
        await axios.put(
          `${API_URL}normatives/${currentNormativeId}/send-mail-in-approver`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } catch (error) {
        console.error(error);
        enqueueSnackbar(
          "A normativa foi atualizada, mas o disparo do e-mail do aprovador falhou.",
          {
            variant: "warning",
          },
        );
      }
    }
  };

  const handleReplyApproval = async (isApproved) => {
    if (!currentNormativeId || !canReplyApproval) return;

    setLoading(true);

    try {
      const updatedApprovalEntries = normativeApproverEntries.map(
        (approver, index) =>
          index === currentUserApprovalIndex
            ? { ...approver, approved: Boolean(isApproved) }
            : approver,
      );
      const sourceWithApprovalComment = applyDraftComments(
        {
          ...formData,
          normativeApprovers: updatedApprovalEntries,
        },
        draftComments.note.trim() ? ["note"] : [],
      );

      const syncedFiles = await uploadCurrentFiles(currentNormativeId);
      const payload = buildUpdatePayload({
        ...sourceWithApprovalComment,
        normativeApprovers: updatedApprovalEntries,
        files: syncedFiles,
      });

      await axios.put(`${API_URL}normatives`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      clearDraftComments(["note"]);
      setDeletedFiles([]);

      await axios.put(
        `${API_URL}normatives/reply-pending-approval-status`,
        {
          idNormative: currentNormativeId,
          isApproved,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await loadNormative(currentNormativeId);
      setHasChanges(false);

      enqueueSnackbar(
        isApproved
          ? "Aprovação enviada com sucesso!"
          : "A normativa foi retornada ao responsável.",
        {
          variant: "success",
        },
      );
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Não foi possível responder a aprovação pendente.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlterar = async () => {
    await updateNormative({
      overrides: {
        statusNorma: STATUS.EM_ALTERACAO,
      },
      commentFields: [],
      successMessage: "Normativa colocada em alteração!",
    });
  };

  const handleOpenConfirmReview = () => {
    if (!currentNormativeId) return;
    setReviewJustification("");
    setConfirmReviewOpen(true);
  };

  const handleCancelReview = () => {
    setConfirmReviewOpen(false);
    setReviewJustification("");
  };

  const handleMarkReviewed = async () => {
    if (!currentNormativeId) return;

    const trimmedJustification = reviewJustification.trim();

    if (!trimmedJustification) {
      enqueueSnackbar("A justificativa da revisao e obrigatoria.", {
        variant: "error",
      });
      return;
    }

    const reviewHistory = appendCommentHistory(
      formData.descriptionReviewer || "",
      trimmedJustification,
      userName,
    );

    const updated = await updateNormative({
      overrides: {
        ultimaRevisao: getTodayDate(),
        statuRevisao: REVISION_STATUS_OPTIONS[0].id,
        periodicidadeRevisao: resolvedFrequencyRevision,
        descriptionReviewer: reviewHistory,
      },
      commentFields: [],
      successMessage: "Revisão registrada com sucesso!",
    });

    if (updated) {
      setFormValidation((previous) => ({
        ...previous,
        ultimaRevisao: true,
      }));
      handleCancelReview();
    }
  };

  const exitPostCreateEditingMode = () => {
    if (!allowPostCreateEditing) return;

    setAllowPostCreateEditing(false);

    if (!currentNormativeId) return;

    navigate(location.pathname, {
      replace: true,
      state: {
        ...(location.state || {}),
        dadosApi: {
          ...((location.state || {}).dadosApi || {}),
          idNormative: currentNormativeId,
          allowPostCreateEditing: false,
        },
      },
    });
  };

  const handleContinueEditing = () => {
    setSuccessDialogOpen(false);

    keepViewportAtTop({ focusTop: true });
  };

  const handleBackToNormativeList = () => {
    setSuccessDialogOpen(false);
    navigate("/normativas/lista");
    window.scrollTo(0, 0);
  };

  const handleExit = () => {
    navigate(-1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (requisicao === "Criar") {
      await createNormative();
      return;
    }

    if (!validateBaseFields()) return;

    const updated = await updateNormative({
      successMessage: `Normativa ${feedbackLabel} com sucesso!`,
    });

    if (updated) {
      exitPostCreateEditingMode();
      setSuccessDialogMode("edit");
      setSuccessDialogOpen(true);
    }
  };

  const handleResponsavelChange = (_, newValue) => {
    const newId = newValue ? newValue.id : "";

    withDirty((previous) => ({
      ...previous,
      responsavel: newId,
    }));

    if (!newId) return;

    setTempResponsavelId(newId);
    setConfirmRevisorOpen(true);
  };

  const handleConfirmReplication = () => {
    withDirty((previous) => ({
      ...previous,
      revisor: tempResponsavelId,
    }));
    setConfirmRevisorOpen(false);
    setTempResponsavelId(null);
  };

  const handleDenyReplication = () => {
    setConfirmRevisorOpen(false);
    setTempResponsavelId(null);
  };

  const handleEnvironmentChange = (_, newValue) => {
    const selectedEnvironmentId = newValue ? newValue.id : "";
    const selectedKind = getEnvironmentKind(selectedEnvironmentId);

    withDirty((previous) => ({
      ...previous,
      ambiente: selectedEnvironmentId,
      statusNorma:
        selectedKind === "external"
          ? STATUS.VERSAO_FINAL
          : selectedKind === "internal"
            ? STATUS.ELABORACAO
            : previous.statusNorma &&
                [STATUS.ELABORACAO, STATUS.VERSAO_FINAL].includes(
                  previous.statusNorma,
                )
              ? previous.statusNorma
              : STATUS.ELABORACAO,
    }));
  };

  const handleRiskChange = (_, newValue) => {
    const nextRisk = resolveRiskValue(newValue?.id);

    withDirty((previous) => ({
      ...previous,
      riscoNorma: nextRisk,
      periodicidadeRevisao: nextRisk || "",
      statuRevisao: nextRisk ? previous.statuRevisao : "",
    }));
  };

  const handleMultiSelectAll =
    (field, options, { excludeIds = [] } = {}) =>
    (_, newValue) => {
      const normalizedExcludeIds = excludeIds.map((item) => String(item));
      const availableIds = normalizeIdArray(
        options.map((option) => option.id),
        { exclude: normalizedExcludeIds },
      );
      const clickedAll = newValue.some((option) => option.id === "all");

      if (clickedAll) {
        withDirty((previous) => {
          const currentSelection = normalizeIdArray(previous[field], {
            exclude: normalizedExcludeIds,
          });

          return {
            ...previous,
            [field]:
              currentSelection.length === availableIds.length ? [] : availableIds,
          };
        });
        return;
      }

      withDirty((previous) => ({
        ...previous,
        [field]: normalizeIdArray(
          newValue.map((option) => option.id),
          { exclude: normalizedExcludeIds },
        ),
      }));
    };

  const handleCompanyCreated = (newCompany) => {
    const mappedCompany = mapOption(newCompany);
    setEmpresas((previous) => [...previous, mappedCompany]);
    withDirty((previous) => ({
      ...previous,
      empresa: [...previous.empresa, mappedCompany.id],
    }));
  };

  const handleDepartmentCreated = (newDepartment) => {
    const mappedDepartment = mapOption(newDepartment);
    setDepartamentos((previous) => [...previous, mappedDepartment]);
    withDirty((previous) => ({
      ...previous,
      departamento: [...previous.departamento, mappedDepartment.id],
    }));
  };

  const handleProcessCreated = (newProcess) => {
    const mappedProcess = mapOption(newProcess);
    setProcessos((previous) => [...previous, mappedProcess]);
    withDirty((previous) => ({
      ...previous,
      processo: [...previous.processo, mappedProcess.id],
    }));
  };

  const handlePlanCreated = (newPlan) => {
    const mappedPlan = mapOption(newPlan);
    setPlanosAcoes((previous) => [...previous, mappedPlan]);
    withDirty((previous) => ({
      ...previous,
      planoAcao: [...previous.planoAcao, mappedPlan.id],
    }));
  };

  const selectedEnvironment =
    ambientes.find((item) => String(item.id) === String(formData.ambiente)) ||
    null;
  const selectedResponsible =
    responsaveis.find(
      (item) => String(item.id) === String(formData.responsavel),
    ) || null;
  const selectedReviewer =
    responsaveis.find((item) => String(item.id) === String(formData.revisor)) ||
    null;
  const selectedStatus =
    STATUS_OPTIONS.find((item) => item.id === formData.statusNorma) || null;
  const selectedNormativeType =
    tipoNormas.find((item) => String(item.id) === String(formData.tipoNorma)) ||
    null;
  const selectedRegulatory =
    reguladores.find((item) => String(item.id) === String(formData.regulador)) ||
    null;
  const selectedFrequency =
    FREQUENCY_OPTIONS.find(
      (item) => item.id === Number(resolvedFrequencyRevision),
    ) || null;
  const selectedRevisionStatus =
    REVISION_STATUS_OPTIONS.find(
      (item) =>
        item.id === Number(formData.statuRevisao || revisionData.status || ""),
    ) || null;

  return (
    <>
      <LoadingOverlay isActive={loading} />

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Box ref={topAnchorRef} tabIndex={-1} sx={{ outline: 0 }} />
        <Grid container spacing={3} sx={{ padding: 3 }}>
          {requisicao === "Editar" ? (
            <Grid
              item
              xs={12}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ borderBottom: "2px solid #e0e0e0", pb: 2, mb: 2 }}
            >
              <Typography variant="h5" fontWeight="bold" color="primary">
                Edição de Normativa
              </Typography>

              <Stack direction="row" alignItems="center" spacing={2}>
                {canSendElaborated ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleWorkflowSubmit()}
                  >
                    ELABORADA
                  </Button>
                ) : null}

                {canSendAltered ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleWorkflowSubmit()}
                  >
                    ALTERADA
                  </Button>
                ) : null}

                {canReplyApproval ? (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleReplyApproval(true)}
                  >
                    APROVADA
                  </Button>
                ) : null}

                {canReplyApproval ? (
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => handleReplyApproval(false)}
                  >
                    RETORNAR
                  </Button>
                ) : null}

                {canAlterar ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAlterar}
                  >
                    ALTERAR
                  </Button>
                ) : null}

                {canRevogar ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleOpenConfirmRevog(new Date())}
                  >
                    REVOGAR
                  </Button>
                ) : null}
              </Stack>
            </Grid>
          ) : null}

          {isFutureApprover ? (
            <Grid item xs={12}>
              <Alert severity="info">
                Esta normativa ainda não está liberada para a sua aprovação.
                Enquanto isso, a tela permanece somente para consulta.
              </Alert>
            </Grid>
          ) : null}

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#555" }}>
              1. Identificação principal
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel>Código *</InputLabel>
              <TextField
                fullWidth
                value={formData.code}
                error={!formValidation.code}
                disabled={!canEditGeneralFields}
                helperText={
                  !formValidation.code
                    ? fieldErrorMessages.code || "Campo obrigatório."
                    : ""
                }
                onChange={(event) => {
                  clearFieldError("code");
                  withDirty({ code: event.target.value });
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel>Nome *</InputLabel>
              <TextField
                fullWidth
                value={formData.name}
                error={!formValidation.name}
                disabled={!canEditGeneralFields}
                onChange={(event) =>
                  withDirty({ name: event.target.value })
                }
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel>Ambiente *</InputLabel>
              <Autocomplete
                options={ambientes}
                getOptionLabel={(option) => option.nome}
                value={selectedEnvironment}
                onChange={handleEnvironmentChange}
                isOptionEqualToValue={(option, value) =>
                  String(option.id) === String(value.id)
                }
                renderInput={(params) => (
                  <TextField {...params} error={!formValidation.ambiente} />
                )}
                disabled={!canEditGeneralFields}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>Responsável (dono da norma) *</InputLabel>
              <Autocomplete
                options={responsaveis}
                getOptionLabel={(option) => option.nome}
                value={selectedResponsible}
                onChange={handleResponsavelChange}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} error={!formValidation.responsavel} />
                )}
                disabled={!canEditGeneralFields}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>Revisor *</InputLabel>
              <Autocomplete
                options={responsaveis}
                getOptionLabel={(option) => option.nome}
                value={selectedReviewer}
                onChange={(_, newValue) =>
                  withDirty({ revisor: newValue ? newValue.id : "" })
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} error={!formValidation.revisor} />
                )}
                disabled={!canEditGeneralFields}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>Status da norma *</InputLabel>
              <Autocomplete
                options={visibleStatusOptions}
                getOptionLabel={(option) => option.nome}
                value={selectedStatus}
                onChange={(_, newValue) =>
                  withDirty({
                    statusNorma: newValue ? newValue.id : "",
                  })
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} error={!formValidation.statusNorma} />
                )}
                disabled={requisicao === "Editar" || !canEditGeneralFields}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={3} display="flex" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 3 }}>
              <Switch
                checked={formData.ativo}
                onChange={(event) =>
                  withDirty({ ativo: event.target.checked })
                }
                disabled={!canEditGeneralFields}
              />
              <Typography>{formData.ativo ? "Ativo" : "Inativo"}</Typography>
            </Stack>
          </Grid>

          {requisicao === "Editar" ? (
            <>
                <Grid item xs={12} mt={2}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#555" }}
                >
                  2. Workflow e comentários
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>Aprovadores</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...aprovadores,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(formData.aprovador, aprovadores)}
                    onChange={handleMultiSelectAll("aprovador", aprovadores)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.aprovador.length ===
                                  aprovadores.length && aprovadores.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>Descrição da norma</InputLabel>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(event) =>
                      withDirty({ description: event.target.value })
                    }
                    disabled={!canEditGeneralFields}
                    placeholder="Descreva a norma, seu objetivo e o contexto de aplicação."
                  />
                </Stack>
              </Grid>

              {showApprovalComment ? (
                <Grid item xs={12}>
                  <CommentCard
                    title="Comentário da aprovação"
                    placeholder="Digite aqui o comentário da aprovação pendente."
                    draftValue={draftComments.note}
                    historyValue={formData.note}
                    onDraftChange={(value) =>
                      setDraftComments((previous) => ({
                        ...previous,
                        note: value,
                      }))
                    }
                    onSave={() => saveCommentField("note")}
                    disabled={!canEditApprovalComment}
                    loading={loading}
                  />
                </Grid>
              ) : null}

              <Grid item xs={12} mt={2}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#555" }}
                >
                  3. Associações e relacionamentos
                </Typography>
                </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>Norma de origem</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...filteredNormaOrigens,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(
                      selectedNormaOrigemIds,
                      allNormaOrigens,
                    )}
                    onChange={handleMultiSelectAll("normaOrigem", filteredNormaOrigens, {
                      excludeIds: [currentNormativeId, ...selectedNormaDestinoIds],
                    })}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? selectedAvailableNormaOrigemIds.length ===
                                  filteredNormaOrigens.length &&
                                filteredNormaOrigens.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>Norma de destino</InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...filteredNormaDestinos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(
                      selectedNormaDestinoIds,
                      allNormaDestinos,
                    )}
                    onChange={handleMultiSelectAll(
                      "normaDestino",
                      filteredNormaDestinos,
                      {
                        excludeIds: [currentNormativeId, ...selectedNormaOrigemIds],
                      },
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? selectedAvailableNormaDestinoIds.length ===
                                  filteredNormaDestinos.length &&
                                filteredNormaDestinos.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    Empresa{" "}
                    {canEditGeneralFields ? (
                      <DrawerEmpresa
                        buttonSx={{ ml: 1, width: 20, height: 20 }}
                        onCompanyCreated={handleCompanyCreated}
                      />
                    ) : null}
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: "all", nome: "Selecionar todos" }, ...empresas]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(formData.empresa, empresas)}
                    onChange={handleMultiSelectAll("empresa", empresas)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.empresa.length === empresas.length &&
                                empresas.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    Departamentos{" "}
                    {canEditGeneralFields ? (
                      <DrawerDepartamento
                        buttonSx={{ ml: 1, width: 20, height: 20 }}
                        onDepartmentCreated={handleDepartmentCreated}
                      />
                    ) : null}
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...departamentos,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(
                      formData.departamento,
                      departamentos,
                    )}
                    onChange={handleMultiSelectAll(
                      "departamento",
                      departamentos,
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.departamento.length ===
                                  departamentos.length &&
                                departamentos.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    Processos{" "}
                    {canEditGeneralFields ? (
                      <DrawerProcesso
                        buttonSx={{ ml: 1, width: 20, height: 20 }}
                        onProcessCreated={handleProcessCreated}
                      />
                    ) : null}
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[{ id: "all", nome: "Selecionar todos" }, ...processos]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(formData.processo, processos)}
                    onChange={handleMultiSelectAll("processo", processos)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.processo.length === processos.length &&
                                processos.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    Plano de ação{" "}
                    {canEditGeneralFields ? (
                      <DrawerPlanos
                        buttonSx={{ ml: 1, width: 20, height: 20 }}
                        onPlansCreated={handlePlanCreated}
                      />
                    ) : null}
                  </InputLabel>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={[
                      { id: "all", nome: "Selecionar todos" },
                      ...planosAcoes,
                    ]}
                    getOptionLabel={(option) => option.nome}
                    value={buildSelectedValues(formData.planoAcao, planosAcoes)}
                    onChange={handleMultiSelectAll("planoAcao", planosAcoes)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={
                            option.id === "all"
                              ? formData.planoAcao.length ===
                                  planosAcoes.length && planosAcoes.length > 0
                              : selected
                          }
                        />
                        {option.nome}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mt={2}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#555" }}
                >
                  4. Classificação e prazos
                </Typography>
                </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>Tipo da norma</InputLabel>
                  <Autocomplete
                    options={tipoNormas}
                    getOptionLabel={(option) => option.nome}
                    value={selectedNormativeType}
                    onChange={(_, newValue) =>
                      withDirty({ tipoNorma: newValue ? newValue.id : "" })
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>Regulador</InputLabel>
                  <Autocomplete
                    options={reguladores}
                    getOptionLabel={(option) => option.nome}
                    value={selectedRegulatory}
                    onChange={(_, newValue) =>
                      withDirty({ regulador: newValue ? newValue.id : "" })
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => <TextField {...params} />}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>Data de cadastro</InputLabel>
                  <DatePicker
                    value={formData.dataCadastro || null}
                    disabled
                    onChange={() => {}}
                    slotProps={{ textField: { placeholder: "00/00/0000" } }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>Data de publicação</InputLabel>
                  <DatePicker
                    value={formData.dataPublicacao || null}
                    onChange={(newValue) =>
                      withDirty({ dataPublicacao: newValue })
                    }
                    slotProps={{ textField: { placeholder: "00/00/0000" } }}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Stack spacing={1}>
                  <InputLabel>Vigência inicial</InputLabel>
                  <DatePicker
                    value={formData.vigenciaInicial || null}
                    onChange={(newValue) =>
                      withDirty({ vigenciaInicial: newValue })
                    }
                    slotProps={{ textField: { placeholder: "00/00/0000" } }}
                    disabled={!canEditGeneralFields}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mt={2}>
                <Accordion
                  sx={{
                    backgroundColor: "#fdfdfd",
                    border: "1px solid #e0e0e0",
                    boxShadow: "none",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      5. Revisão periódica
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {canMarkReviewed ? (
                        <Grid item xs={12}>
                          <Stack direction="row" justifyContent="flex-end">
                            <Button
                              variant="outlined"
                              color="info"
                              onClick={handleOpenConfirmReview}
                              disabled={loading}
                            >
                              REVISADO
                            </Button>
                          </Stack>
                        </Grid>
                      ) : null}
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <InputLabel>Última revisão</InputLabel>
                          <DatePicker
                            value={formData.ultimaRevisao || null}
                            onChange={() => {}}
                            disabled={!canEditLastRevision}
                            slotProps={{
                              textField: {
                                placeholder: "00/00/0000",
                                error: !formValidation.ultimaRevisao,
                                helperText:
                                  currentStatus === STATUS.ELABORACAO ||
                                  currentStatus === STATUS.EM_ALTERACAO
                                    ? "Será preenchida automaticamente quando a normativa ficar em versão final."
                                    : "Campo calculado automaticamente pelo fluxo da normativa.",
                              },
                            }}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <InputLabel>Risco da norma</InputLabel>
                          <Autocomplete
                            options={RISK_OPTIONS}
                            getOptionLabel={(option) => option.nome}
                            value={selectedRiskOption}
                            onChange={handleRiskChange}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => <TextField {...params} />}
                            disabled={!canEditRisk}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Stack spacing={1}>
                          <InputLabel>Status da revisão</InputLabel>
                          <Autocomplete
                            options={REVISION_STATUS_OPTIONS}
                            getOptionLabel={(option) => option.nome}
                            value={selectedRevisionStatus}
                            renderInput={(params) => <TextField {...params} />}
                            disabled
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Stack spacing={1}>
                          <InputLabel>Periodicidade</InputLabel>
                          <Autocomplete
                            options={FREQUENCY_OPTIONS}
                            getOptionLabel={(option) => option.nome}
                            value={selectedFrequency}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => <TextField {...params} />}
                            disabled
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Stack spacing={1}>
                          <InputLabel>Data limite</InputLabel>
                          <DatePicker
                            value={revisionData.limitDate || null}
                            onChange={() => {}}
                            disabled
                            slotProps={{
                              textField: { placeholder: "00/00/0000" },
                            }}
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Stack spacing={1}>
                          <InputLabel>Dias da revisão</InputLabel>
                          <TextField
                            value={
                              revisionData.days === "" ? "" : String(revisionData.days)
                            }
                            disabled
                          />
                        </Stack>
                      </Grid>

                      {requisicao === "Editar" ? (
                        <Grid item xs={12}>
                          <HistoryLogCard
                          title="Comentário da revisão"
                          placeholder="Digite aqui o comentário da revisão periódica."
                          value={formData.descriptionReviewer}
                          />
                        </Grid>
                      ) : null}
                      
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {requisicao === "Editar" ? (
                <Grid item xs={12} mt={2}>
                <Accordion
                  sx={{
                    backgroundColor: "#fff5f5",
                    border: "1px solid #f5c6c6",
                    boxShadow: "none",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="error"
                    >
                      6. Revogação da norma
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Stack spacing={1}>
                          <InputLabel>Data da revogação</InputLabel>
                          <DatePicker
                            value={formData.dataRevogacao || null}
                            onChange={handleOpenConfirmRevog}
                            slotProps={{
                              textField: { placeholder: "00/00/0000" },
                            }}
                            disabled
                          />
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={9}>
                        <Stack spacing={1}>
                          <InputLabel>Motivo da revogação</InputLabel>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.motivoRevogacao}
                            onChange={(event) =>
                              withDirty({
                                motivoRevogacao: event.target.value,
                              })
                            }
                            disabled
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                </Grid>
              ) : null}

              <Grid item xs={12} mt={2}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "#555" }}
                >
                  Anexos
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel>Anexo</InputLabel>
                  <FileUploader
                    containerFolder={FILE_CONTAINER_FOLDER}
                    initialFiles={formData.files}
                    disabled={!canManageAttachments || loading}
                    onFilesChange={(files) => {
                      setHasChanges(true);
                      setFormData((previous) => ({
                        ...previous,
                        files,
                      }));
                    }}
                    onFileDelete={(file) =>
                      setDeletedFiles((previous) => [...previous, file])
                    }
                  />
                </Stack>
              </Grid>

              {requisicao === "Editar" ? (
                <Grid item xs={12}>
                <Accordion sx={{ border: "1px solid #e0e0e0", boxShadow: "none" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Trechos
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ListagemTrecho
                      key={`${currentNormativeId || "novo"}-${currentStatus || "sem-status"}`}
                      normativeId={currentNormativeId}
                      readOnly={!canEditGeneralFields}
                    />
                  </AccordionDetails>
                </Accordion>
                </Grid>
              ) : null}
            </>
          ) : null}

          {canPersistForm || requisicao === "Editar" ? (
            <Grid
              item
              xs={12}
              mt={2}
              mb={5}
              display="flex"
              justifyContent="flex-start"
            >
              <Stack direction="row" spacing={2}>
                {canPersistForm ? (
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ px: 4, py: 1, fontWeight: "bold" }}
                    onClick={handleSubmit}
                  >
                    {requisicao === "Criar"
                      ? "Cadastrar"
                      : "Salvar alterações"}
                  </Button>
                ) : null}

                {requisicao === "Editar" ? (
                  <Button
                    variant="outlined"
                    color="inherit"
                    sx={{ px: 4, py: 1, fontWeight: "bold" }}
                    onClick={handleExit}
                  >
                    Sair
                  </Button>
                ) : null}
              </Stack>
            </Grid>
          ) : null}
        </Grid>

        <Dialog
          open={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          disableRestoreFocus
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
            {successDialogMode === "create"
              ? "Normativa criada com sucesso!"
              : "Alterações salvas com sucesso!"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: "16px", color: "#555", px: 2 }}>
              {successDialogMode === "create"
                ? "A normativa foi cadastrada com sucesso. Você pode voltar para a listagem ou continuar a edição desta normativa."
                : "As alterações da normativa foram salvas. Você deseja permanecer nesta tela ou voltar para a listagem?"}
            </DialogContentText>
          </DialogContent>
          <DialogActions
            sx={{ display: "flex", justifyContent: "center", gap: 2, pb: 2 }}
          >
            <Button
              onClick={handleBackToNormativeList}
              variant="outlined"
              sx={{ borderColor: "#007bff", color: "#007bff", fontWeight: 600 }}
            >
              Voltar para a listagem
            </Button>
            <Button
              onClick={handleContinueEditing}
              variant="contained"
              sx={{ backgroundColor: "#007bff", fontWeight: 600 }}
            >
              {successDialogMode === "create"
                ? "Continuar editando"
                : "Permanecer na tela"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={confirmRevisorOpen} onClose={handleDenyReplication}>
          <DialogTitle>Definir revisor?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Deseja que o responsável selecionado também seja atribuído como
              revisor desta normativa?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDenyReplication}>Não</Button>
            <Button onClick={handleConfirmReplication} autoFocus variant="contained">
              Sim
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={confirmReviewOpen} onClose={handleCancelReview}>
          <DialogTitle>Confirmar revisao</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja registrar a revisao desta norma em{" "}
              {getTodayDate()?.toLocaleDateString("pt-BR")}? Isso definira o
              status da revisao como "Revisada".
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Justificativa da revisao"
              fullWidth
              multiline
              rows={3}
              value={reviewJustification}
              onChange={(event) => setReviewJustification(event.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelReview} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleMarkReviewed} autoFocus disabled={loading}>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={confirmRevogOpen} onClose={handleCancelRevog}>
          <DialogTitle>Confirmar revogação</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja revogar esta norma em{" "}
              {tempRevDate?.toLocaleDateString("pt-BR")}? Isso definirá o status
              como "Revogado" e esta norma não poderá mais ser editada.
            </DialogContentText>

            {showJustificativaField ? (
              <TextField
                autoFocus
                margin="dense"
                label="Justificativa de revogação"
                fullWidth
                multiline
                rows={3}
                value={formData.motivoRevogacao}
                onChange={(event) =>
                  withDirty({
                    motivoRevogacao: event.target.value,
                  })
                }
                sx={{ mt: 2 }}
              />
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelRevog}>Cancelar</Button>
            <Button onClick={handleConfirmRevog} autoFocus>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

export default ColumnsLayouts;
