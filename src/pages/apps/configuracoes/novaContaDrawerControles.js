/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import {
  Autocomplete,
  Button,
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
import { useLocation } from "react-router-dom";
import axios from "axios";

function ColumnsLayoutsDrawer({ buttonSx, onAccountCreated, processoSelecionado }) {
  const [open, setOpen] = useState(false);
  const { token } = useToken();
  const location = useLocation();
  const { dadosApi } = location.state || {};
  const [tiposResponsabilidades, setTiposResponsabilidades] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [nomeConta, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [requisicao] = useState("Criar");
  const [mensagemFeedback] = useState("cadastrada");
  const [hasChanges, setHasChanges] = useState(false);
  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  const [formData, setFormData] = useState({
    departamentoInferior: [],
    departamentoLateral: [],
    empresa: [],
    tipoResponsabilidade: "",
    planoAcao: [],
    formatoUnidade: [],
    contaSuperior: "",
    assertion: [],
    departamentoSuperior: "",
    processo: [],
    risco: [],
    conta: [],
    incidente: [],
    responsavel: "",
    dataInicioOperacao: null,
  });

 

  useEffect(() => {
    fetchData(
      `${process.env.REACT_APP_API_URL}ledger-accounts/types`,
      setTiposResponsabilidades
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
          item.idCompany ||
          item.idLedgerAccount ||
          item.idProcess ||
          item.id_responsible ||
          item.idDepartment ||
          item.idRisk ||
          item.idIncident ||
          item.idUnitFormat ||
          item.idResponsabilityType ||
          item.idAssertion ||
          item.idLedgerAccountType,
        nome: item.name,
        ...item, // Mantém os outros campos intactos
      }));

      setState(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  window.hasChanges = hasChanges;
  window.setHasChanges = setHasChanges;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (open) {
      setNome("");
      setCodigo("");
      setFormValidation({ nomeConta: true, codigo: true, processo: true });
      setFormData((prev) => ({
        ...prev,
        processo: processoSelecionado ? [processoSelecionado.id] : [],
      }));
      setHasChanges(false);
    }
  }, [open, processoSelecionado]);

  const [formValidation, setFormValidation] = useState({
    nomeConta: true,
    codigo: true,
  });

  const tratarSubmit = async () => {
    let url = "";
    let method = "";
    let payload = {};

    const missingFields = [];
    if (!nomeConta.trim()) {
      setFormValidation((prev) => ({ ...prev, nomeConta: false }));
      missingFields.push("Nome");
    }
    if (!codigo.trim()) {
      setFormValidation((prev) => ({ ...prev, codigo: false }));
      missingFields.push("Código");
    }
    if (missingFields.length > 0) {
      enqueueSnackbar(
        `Os campos ${missingFields.join(" e ")} são obrigatórios!`,
        { variant: "error" }
      );
      return;
    }

    if (requisicao === "Criar") {
      url = `${process.env.REACT_APP_API_URL}ledger-accounts`;
      method = "POST";
      payload = {
        name: nomeConta,
        code: codigo,
        idLedgerAccountType: formData.tipoResponsabilidade,
        idProcesses: formData.processo.length > 0 ? formData.processo : null,
        active: true,
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
        throw new Error("Não foi possível cadastrar a conta.");
      }

      const data = await response.json();

      if (formData.processo && formData.processo.length > 0) {
        const putPayload = {
          idLedgerAccount: data.data.idLedgerAccount,
          name: nomeConta,
          code: codigo,
          idLedgerAccountType: formData.tipoResponsabilidade,
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

      enqueueSnackbar(`Conta ${mensagemFeedback} com sucesso!`, {
        variant: "success",
      });
      setOpen(false);

      if (onAccountCreated) {
        const novaConta = {
          id: data.data.idLedgerAccount, 
          nome: nomeConta,
          idProcesses: formData.processo,
        };
        onAccountCreated(novaConta);
        setFormData({ ...formData, tipoResponsabilidade: [] })
      }
    } catch (error) {
      console.error(error.message);
      enqueueSnackbar("Erro ao cadastrar a conta.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title="Cadastre uma conta" arrow placement="top">
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
              Cadastrar Conta
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
                    placeholder="Código da conta contábil"
                    value={codigo}
                    error={!codigo && formValidation.codigo === false}
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
                    value={nomeConta}
                    error={!nomeConta && formValidation.nomeConta === false}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mb={3}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Tipos de Conta *
                  </InputLabel>
                  <Autocomplete
                    options={tiposResponsabilidades}
                    getOptionLabel={(option) => option.nome}
                    value={
                      tiposResponsabilidades.find(
                        (tipoResponsabilidade) =>
                          tipoResponsabilidade.id ===
                          formData.tipoResponsabilidade
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        tipoResponsabilidade: newValue ? newValue.id : "",
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={
                          !formData.tipoResponsabilidade &&
                          formValidation.tipoResponsabilidade === false
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} mb={3}>
                <Stack spacing={1}>
                  <InputLabel sx={{ fontSize: "12px", fontWeight: 600 }}>
                    Processo
                  </InputLabel>
                  <Autocomplete
                    multiple
                    options={processos}
                    getOptionLabel={(option) => option.nome || ""}
                    value={processos.filter((p) => formData.processo.includes(p.id))}
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
            <Button onClick={() => {setOpen(false); setFormData({ ...formData, tipoResponsabilidade: [] })}} variant="outlined">
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
