import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Stack,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grow,
  Box,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";

const FileUploader = ({
  initialFiles = [],
  containerFolder, // ex.: 1 para empresa, 3 para risco, etc.
  idContainer, // id do registro quando houver
  onFilesChange, // callback para enviar os arquivos para o componente pai
  onFileDelete,
  disabled = false,
  buttonLabel = "Arraste e solte os arquivos ou clique para selecionar",
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [files, setFiles] = useState(initialFiles);

  // Atualiza o estado local quando a lista recebida do pai mudar.
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const notifyFilesChange = useCallback(
    (nextFiles) => {
      if (typeof onFilesChange === "function") {
        onFilesChange(nextFiles);
      }
    },
    [onFilesChange],
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      enqueueSnackbar(`${acceptedFiles.length} documento(s) adicionado(s)!`, {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });

      setFiles((previousFiles) => {
        const nextFiles = [...previousFiles, ...acceptedFiles];
        notifyFilesChange(nextFiles);
        return nextFiles;
      });
    },
    [enqueueSnackbar, notifyFilesChange],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    disabled,
    noClick: true,
    noKeyboard: true,
  });

  const handleOpenPicker = useCallback(
    (event) => {
      event.preventDefault();

      if (!disabled) {
        open();
      }
    },
    [disabled, open],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (disabled) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    },
    [disabled, open],
  );

  const handleDelete = (index) => {
    const fileToDelete = files[index];
    const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);

    setFiles(nextFiles);
    notifyFilesChange(nextFiles);

    // Se for um arquivo ja existente (nao do tipo File), notifica a exclusao.
    if (!(fileToDelete instanceof File) && onFileDelete) {
      onFileDelete(fileToDelete);
    }

    enqueueSnackbar("Documento removido.", {
      variant: "info",
      anchorOrigin: { vertical: "top", horizontal: "right" },
      preventDuplicate: true,
    });
  };

  const getFileURL = (file) => {
    let fileURL;

    // Se o arquivo for uma instancia de File (ex.: vindo do dropzone).
    if (file instanceof File) {
      fileURL = URL.createObjectURL(file);
    }
    // Se o arquivo possuir a propriedade 'path' com uma URL valida.
    else if (file.path && typeof file.path === "string") {
      fileURL = file.path;
    }
    // Verifica se possui a propriedade 'url'.
    else if (file.url) {
      fileURL = file.url;
    }
    // Se for uma string, utiliza-a diretamente.
    else if (typeof file === "string") {
      fileURL = file;
    } else {
      return null;
    }

    if (typeof fileURL === "string") {
      const baseUrl = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.split("api/v")[0]
        : "";

      fileURL = fileURL
        .replace("http://localhost:8080/", baseUrl)
        .replace("https://localhost:8080/", baseUrl);
    }

    return fileURL;
  };

  const handleDownload = async (file) => {
    const fileURL = getFileURL(file);

    if (!fileURL) {
      console.error("Formato do arquivo nao reconhecido para download", file);
      enqueueSnackbar("Formato do arquivo nao reconhecido para download.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    try {
      const response = await fetch(fileURL);
      if (!response.ok) throw new Error("Fetch failed");

      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = localUrl;
      link.setAttribute("download", file.name || file.filename || "download");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(localUrl);
    } catch (error) {
      console.warn("Fallback download via link target blank", error);

      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", file.name || file.filename || "download");
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    if (file instanceof File) {
      URL.revokeObjectURL(fileURL);
    }
  };

  return (
    <Stack spacing={1}>
      <Paper
        variant="outlined"
        {...getRootProps({
          role: "button",
          tabIndex: disabled ? -1 : 0,
          onClick: handleOpenPicker,
          onKeyDown: handleKeyDown,
        })}
        aria-disabled={disabled}
        sx={{
          p: 3,
          textAlign: "center",
          border: "2px dashed #1C5297",
          backgroundColor: isDragActive ? "#e3f2fd" : "#f5f5f5",
          borderRadius: 2,
          cursor: disabled ? "default" : "pointer",
          transition: "all 0.3s ease",
          "&:hover": disabled
            ? {}
            : { backgroundColor: "#e3f2fd", borderColor: "#1976d2" },
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <Box sx={{ mb: 1 }}>
          <CloudUploadIcon
            sx={{ fontSize: 48, color: isDragActive ? "#1976d2" : "#1C5297" }}
          />
        </Box>

        <input {...getInputProps()} />

        <Typography
          variant="h6"
          color={isDragActive ? "primary" : "textSecondary"}
        >
          {isDragActive ? "Solte os arquivos aqui" : buttonLabel}
        </Typography>
      </Paper>

      {files && files.length > 0 && (
        <List>
          {files.map((file, index) => (
            <Grow in key={index} timeout={300}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton
                      edge="end"
                      onClick={() => handleDownload(file)}
                      sx={{ mr: 1 }}
                      title="Baixar arquivo"
                    >
                      <CloudDownloadIcon sx={{ color: "#0d47a1" }} />
                    </IconButton>

                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(index)}
                      disabled={disabled}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={file.name || file.filename || `Arquivo ${index + 1}`}
                />
              </ListItem>
            </Grow>
          ))}
        </List>
      )}
    </Stack>
  );
};

export default FileUploader;
