/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import {
  Button,
  Autocomplete,
  Tooltip,
  TextField,
  Grid,
  Stack,
  InputLabel,
  Drawer,
  Box,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enqueueSnackbar } from "notistack";
import ptBR from "date-fns/locale/pt-BR";
import LoadingOverlay from "./LoadingOverlay";
import { useToken } from "../../../api/TokenContext";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useEffect } from "react";
import axios from "axios";

function ColumnsLayoutsDrawer({
  buttonSx,
  onRiscoCreated,
  processosSelecionados = [],
}) {
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const [nomeRisco, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requisicao] = useState("Criar");
  const [mensagemFeedback] = useState("cadastrado");
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    categoria: "",
    processo: [],
  });

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}categories`,
      setCategorias
    );
    fetchData(
      `${process.env.REACT_APP_API_URL}processes`,
      setProcessos
    );
    window.scrollTo(0, 0);
  }, []);

  const fetchData = async (url, setState) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transformando os dados para alterar idCompany, idLedgerAccount e idProcess -> id, e name -> nome
      const transformedData = response.data.map((item) => ({
        id:
          item.idRisk ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idCategory ||
          item.idRisk ||
          item.idFramework ||
          item.idTreatment ||
          item.idStrategicGuideline ||
          item.idFactor ||
          item.idIncident ||
          item.idCause ||
          item.idImpact ||
          item.idNormative ||
          item.idDepartment ||
          item.idKri ||
          item.idControl ||
          item.idThreat ||
          item.idResponsible ||
          item.idCollaborator,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    if (open) {
      setNome("");
      setCodigo("");
      setFormData((prev) => ({
        ...prev,
        categoria: "",
        processo: processosSelecionados.map((processo) => processo.id),
      }));
      setFormValidation({
        nomeRisco: true,
        codigo: true,
        categoria: true,
        processo: true,
      });
      setHasChanges(false);
    }
  }, [open, processosSelecionados]);

  const [formValidation, setFormValidation] = useState({
    nomeRisco: true,
    codigo: true,
    categoria: true,
  });

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nomeRisco.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeRisco: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (formData.categoria === "") {
      setFormValidation((prev) => ({ ...prev, categoria: false }));
      missingFields.push("Categoria");
    }
    if (missingFields.length > 0) {
      enqueueSnackbar(
        `Os campos ${missingFields.join(" e ")} são obrigatórios!`,
        { variant: "error" }
      );
      return;
    }

    if (requisicao === "Criar") {
      url = `${process.env.REACT_APP_API_URL}risks`;
      method = "POST";
      payload = {
        name: nomeRisco,
        code: codigo,
        idCategory: formData.categoria?.length ? formData.categoria : null,
        idProcesses: formData.processo.length > 0 ? formData.processo : null,
      };
    }

    try {
      setLoading(true);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Não foi possível cadastrar o risco.");
      }

      const data = await response.json();

      if (formData.processo && formData.processo.length > 0) {
        const putPayload = {
          idRisk: data.data.idRisk,
          name: nomeRisco,
          code: codigo,
          idCategory: formData.categoria?.length ? formData.categoria : null,
          idProcesses: formData.processo,
          active: true,
        };

        await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(putPayload),
        });
      }

      enqueueSnackbar(`Risco ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });
      setOpen(false);

      if (onRiscoCreated) {
        const novoRisco = {
          id: data.data.idRisk,
          nome: nomeRisco,
          idProcesses: formData.processo,
        };
        onRiscoCreated(novoRisco);
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Erro ao cadastrar o risco.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Cadastre um risco" arrow placement="top">
        <Button
          variant="contained"
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(true);
          }}
          sx={{ ...buttonSx }}
        >
          <AddIcon sx={{ fontSize: "18px" }} />
        </Button>
      </Tooltip>

      {/* Drawer substituindo Dialog */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
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
              Cadastrar risco
            </Box>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon sx={{ color: "#1C5297", fontSize: "18px" }} />
            </IconButton>
          </Stack>

          <LoadingOverlay isActive={loading} />

          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <Grid container spacing={2} marginTop={2}>
              <Grid item xs={12} mb={3}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Código *
                  </InputLabel>
                  <TextField
                    onChange={(event) => setCodigo(event.target.value)}
                    fullWidth
                    value={codigo}
                    error={!codigo && !formValidation.codigo}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mb={3}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Nome *
                  </InputLabel>
                  <TextField
                    onChange={(event) => setNome(event.target.value)}
                    fullWidth
                    value={nomeRisco}
                    error={!nomeRisco && !formValidation.nomeRisco}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Categoria *
                  </InputLabel>
                  <Autocomplete
                    options={categorias}
                    getOptionLabel={(option) => option.nome}
                    value={
                      categorias.find(
                        (categoria) => categoria.id === formData.categoria
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        categoria: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.categoria &&
                          formValidation.categoria === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Processo
                  </InputLabel>
                  <Autocomplete
                    multiple
                    options={processos}
                    getOptionLabel={(option) => option.nome || ""}
                    value={processos.filter((processo) =>
                      formData.processo.includes(processo.id),
                    )}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        processo: newValue.map((item) => item.id),
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>
            </Grid>
          </LocalizationProvider>

          <Stack direction="row" spacing={2} mt={10} justifyContent="flex-end">
            <Button onClick={() => setOpen(false)} variant="outlined">
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

export default ColumnsLayoutsDrawer;
