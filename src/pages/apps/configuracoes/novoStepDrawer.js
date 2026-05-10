/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Autocomplete,
  Grid,
  Stack,
  InputLabel,
  Drawer,
  Box,
  Tooltip,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import ptBR from "date-fns/locale/pt-BR";
import LoadingOverlay from "./LoadingOverlay";
import FileUploader from "./FileUploader"; // Assumindo que está na mesma pasta, baseado nos imports anteriores
import { useToken } from "../../../api/TokenContext";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useLocation } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { DatePicker } from "@mui/x-date-pickers";
import axios from "axios";

function DrawerAcionista({ acionista, hideButton = false }) {
  // Estado interno para controlar se o drawer está aberto
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [responsaveis, setResponsavel] = useState([]);

  const [statuss] = useState([
    { id: 1, nome: "Não iniciada" },
    { id: 2, nome: "Em andamento" },
    { id: 3, nome: "Em revisão" },
    { id: 4, nome: "Revisado" },
  ]);

  const [formData, setFormData] = useState({
    status: "",
    inicioStep: null,
    finalStep: null,
    finalEfetivoStep: null,
    responsavel: null,
    comentario: "",
    files: [],
  });

  // Buscar responsáveis ao carregar
  useEffect(() => {
    const fetchResponsaveis = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}collaborators/responsibles`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Ajuste de mapeamento se necessário, baseado no exemplo da empresa
        const transformedData = response.data.map((item) => ({
          id: item.id_responsible || item.idCollaborator || item.id,
          nome: item.name,
          ...item,
        }));
        setResponsavel(transformedData);
      } catch (error) {
        console.error("Erro ao buscar responsáveis:", error);
      }
    };

    fetchResponsaveis();
  }, [token]);

  // Quando o prop "acionista" mudar (modo edição), abre o drawer e preenche os campos
  useEffect(() => {
    if (acionista) {
      setNome(acionista.name || "");
      setDescricao(acionista.description || "");
      setFormData((prev) => ({
        ...prev,
        status: acionista.stepStatus || null,
        inicioStep: acionista.startDate ? new Date(acionista.startDate) : null,
        finalStep: acionista.endDate ? new Date(acionista.endDate) : null,
        finalEfetivoStep: acionista.endDateEffective
          ? new Date(acionista.endDateEffective)
          : null,
        responsavel: acionista.idResponsible || null,
        comentario: acionista.note || "",
        files: acionista.files || [],
      }));
      setOpen(true);
    }
  }, [acionista]);

  // Se o drawer for aberto sem edição (novo cadastro), limpa os campos
  useEffect(() => {
    if (open && !acionista) {
      setNome("");
      setDescricao("");
      setFormData((prev) => ({
        ...prev,
        status: null,
        inicioStep: null,
        finalStep: null,
        finalEfetivoStep: null,
        responsavel: null,
        comentario: "",
        files: [],
      }));
    }
  }, [open, acionista]);

  const tratarSubmit = async () => {
    // Verifica se os campos obrigatórios estão preenchidos
    if (!nome.trim() || !formData.inicioStep) {
      enqueueSnackbar("Preencha os campos obrigatórios!", { variant: "error" });
      return;
    }

    if (
      formData.finalEfetivoStep &&
      formData.inicioStep &&
      formData.finalEfetivoStep < formData.inicioStep
    ) {
      enqueueSnackbar(
        "A conclusão efetiva não pode ser menor que o início das atividades.",
        {
          variant: "error",
        }
      );
      return;
    }

    let url = "";
    let method = "";
    let payload = {};

    try {
      setLoading(true);

      // --- Lógica de Upload de Arquivos (Baseada em novaEmpresa.js) ---
      const newFiles = formData.files.filter((file) => file instanceof File);
      const existingFiles = formData.files.filter(
        (file) => !(file instanceof File)
      );

      let uploadFilesResult = { files: [] };
      if (newFiles.length > 0) {
        const formDataUpload = new FormData();
        formDataUpload.append("ContainerFolder", 9); // ID Container para Steps
        // Se estiver editando envia o ID, se criando envia vazio (conforme padrão novaEmpresa)
        formDataUpload.append(
          "IdContainer",
          acionista ? acionista.idActionPlanStep : ""
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

      // Combina arquivos existentes com os novos (que retornam como strings/paths)
      const finalFiles = [...existingFiles, ...uploadFilesResult.files];
      const finalFilesPayload = finalFiles.map((file) => {
        if (typeof file === "string") return file;
        if (file.path) return file.path;
        return file;
      });
      // ----------------------------------------------------------------

      // Montagem do Payload Comum
      const commonPayload = {
        name: nome,
        startDate: formData.inicioStep,
        endDate: formData.finalStep,
        description: descricao,
        endDateEffective: formData.finalEfetivoStep,
        stepStatus:
          formData.status === null || formData.status === ""
            ? 0
            : formData.status,
        idResponsible: formData.responsavel || null,
        note: formData.comentario || "",
        files: finalFilesPayload,
      };

      if (acionista) {
        // Modo edição
        url = `${process.env.REACT_APP_API_URL}action-plans/steps`;
        method = "PUT";
        payload = {
          ...commonPayload,
          idActionPlanStep: acionista.idActionPlanStep,
          idActionPlan: null, // No PUT geralmente null ou mantido se a API exigir
        };

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar os dados do step.");
        }
      } else {
        // Modo cadastro
        url = `${process.env.REACT_APP_API_URL}action-plans/steps`;
        method = "POST";
        payload = {
          ...commonPayload,
          idActionPlan: dadosApi.idActionPlan,
        };

        const postResponse = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!postResponse.ok) {
          throw new Error("Erro ao enviar os dados do step.");
        }

        const postData = await postResponse.json();
        const idActionPlanStep = postData.data.idActionPlanStep;

        // Realiza o PUT para garantir atualização completa (padrão mantido do código original)
        const putPayload = {
          ...commonPayload,
          idActionPlanStep: idActionPlanStep,
          idActionPlan: dadosApi.idActionPlan,
        };

        const putResponse = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(putPayload),
        });

        if (!putResponse.ok) {
          throw new Error("Erro ao atualizar os dados do step após o POST.");
        }
      }

      enqueueSnackbar(
        acionista
          ? "Step atualizado com sucesso!"
          : "Step cadastrado e atualizado com sucesso!",
        { variant: "success" }
      );

      if (window.refreshOrgaos) {
        window.refreshOrgaos();
      }
      if (window.refreshPlanoDates) {
        window.refreshPlanoDates();
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: "error" });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {!hideButton && (
        <Tooltip title="Cadastre um step" arrow placement="top">
          <Button
            variant="contained"
            onClick={handleOpen}
            startIcon={<PlusOutlined />}
            style={{ borderRadius: "20px", height: "32px" }}
          >
            Novo
          </Button>
        </Tooltip>
      )}

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { width: 670 } }}
      >
        <Box sx={{ width: 650, p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box
              component="h2"
              sx={{ color: "#1C5297", fontWeight: 600, fontSize: "16px" }}
            >
              {acionista ? "Editar step" : "Cadastrar step"}
            </Box>
            <IconButton onClick={handleClose}>
              <CloseIcon sx={{ color: "#1C5297", fontSize: "18px" }} />
            </IconButton>
          </Stack>

          <LoadingOverlay isActive={loading} />

          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <Grid container spacing={2} marginTop={2}>
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Nome *
                  </InputLabel>
                  <TextField
                    onChange={(event) => setNome(event.target.value)}
                    fullWidth
                    value={nome}
                  />
                </Stack>
              </Grid>

              {/* Início das atividades */}
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Início das atividades *
                  </InputLabel>
                  <DatePicker
                    value={formData.inicioStep || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        inicioStep: newValue,
                        finalStep:
                          prev.finalStep &&
                          newValue &&
                          prev.finalStep < newValue
                            ? null
                            : prev.finalStep,
                        finalEfetivoStep:
                          prev.finalEfetivoStep &&
                          newValue &&
                          prev.finalEfetivoStep < newValue
                            ? null
                            : prev.finalEfetivoStep,
                      }));
                    }}
                    slotProps={{ textField: { placeholder: "00/00/0000" } }}
                  />
                </Stack>
              </Grid>

              {/* Data de conclusão (Antigo Final do Step) */}
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Data de conclusão *
                  </InputLabel>
                  <DatePicker
                    value={formData.finalStep || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        finalStep: newValue,
                      }));
                    }}
                    minDate={formData.inicioStep || undefined}
                    slotProps={{
                      textField: {
                        placeholder: "00/00/0000",
                        onBlur: () => {
                          const { inicioStep, finalStep } = formData;
                          if (
                            inicioStep &&
                            finalStep &&
                            finalStep < inicioStep
                          ) {
                            enqueueSnackbar(
                              "A data final não pode ser menor que a data inicial.",
                              { variant: "error" }
                            );
                            setFormData((prev) => ({
                              ...prev,
                              finalStep: null,
                            }));
                          }
                        },
                      },
                    }}
                  />
                </Stack>
              </Grid>

              {/* Conclusão efetiva (Antigo Final Efetivo) */}
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Conclusão efetiva
                  </InputLabel>
                  <DatePicker
                    value={formData.finalEfetivoStep || null}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        finalEfetivoStep: newValue,
                      }));
                    }}
                    minDate={formData.inicioStep || undefined}
                    slotProps={{
                      textField: {
                        placeholder: "00/00/0000",
                        onBlur: () => {
                          const { inicioStep, finalEfetivoStep } = formData;
                          if (
                            inicioStep &&
                            finalEfetivoStep &&
                            finalEfetivoStep < inicioStep
                          ) {
                            enqueueSnackbar(
                              "O final efetivo não pode ser menor que a data inicial.",
                              { variant: "error" }
                            );
                            setFormData((prev) => ({
                              ...prev,
                              finalEfetivoStep: null,
                            }));
                          }
                        },
                      },
                    }}
                  />
                </Stack>
              </Grid>

              {/* Responsável */}
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Responsável
                  </InputLabel>
                  <Autocomplete
                    options={responsaveis}
                    getOptionLabel={(option) => option.nome}
                    value={
                      responsaveis.find(
                        (resp) => resp.id === formData.responsavel
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        responsavel: newValue ? newValue.id : null,
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Descrição
                  </InputLabel>
                  <TextField
                    onChange={(event) => setDescricao(event.target.value)}
                    fullWidth
                    value={descricao}
                  />
                </Stack>
              </Grid>

              {/* Comentário do Responsável */}
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Comentário do responsável
                  </InputLabel>
                  <TextField
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        comentario: event.target.value,
                      }))
                    }
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.comentario}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Status
                  </InputLabel>
                  <Autocomplete
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

              {/* Anexos */}
              <Grid item xs={12} mb={1.5}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Anexo
                  </InputLabel>
                  <FileUploader
                    containerFolder={9} // 9 para steps
                    initialFiles={formData.files}
                    onFilesChange={(files) =>
                      setFormData((prev) => ({ ...prev, files }))
                    }
                  />
                </Stack>
              </Grid>
            </Grid>
          </LocalizationProvider>

          <Stack direction="row" spacing={2} mt={5} justifyContent="flex-end">
            <Button onClick={handleClose} variant="outlined">
              Cancelar
            </Button>
            <Button variant="contained" onClick={tratarSubmit}>
              Salvar
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

export default DrawerAcionista;