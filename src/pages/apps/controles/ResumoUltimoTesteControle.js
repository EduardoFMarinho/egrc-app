import PropTypes from "prop-types";
import { Box, Grid, Paper, Typography } from "@mui/material";

const SummaryCard = ({ title, value, accentColor, helperText }) => {
  if (!value || value === "-") return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        height: "100%",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: "100px",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          bgcolor: accentColor || "#d1d5db",
        }}
      />

      <Box sx={{ p: 2, pl: 3 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: 1.2 }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="div"
          sx={{
            mt: 1,
            fontWeight: 700,
            color: "#1f2937",
          }}
        >
          {value}
        </Typography>

        {helperText ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {helperText}
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
};

const ResumoUltimoTesteControle = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: "CONCLUSÃO DO ÚLTIMO TESTE",
      value: summary.conclusionLabel,
      accentColor: summary.conclusionColor,
      helperText: summary.completionDescription,
    },
    {
      title: "DATA DE CONCLUSÃO",
      value: summary.completionDateLabel,
      accentColor: "#2563eb",
    },
  ].filter((item) => item.value && item.value !== "-");

  if (cards.length === 0) return null;

  const gridCols = cards.length === 1 ? 12 : cards.length === 2 ? 6 : 4;

  return (
    <Box sx={{ mb: 3, mt: 1 }}>
      <Typography
        variant="h6"
        sx={{ mb: 1, fontWeight: 600, color: "#374151" }}
      >
        Resumo do Último Teste Concluído
      </Typography>

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} md={gridCols} key={card.title}>
            <SummaryCard {...card} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

SummaryCard.propTypes = {
  accentColor: PropTypes.string,
  helperText: PropTypes.string,
  title: PropTypes.string.isRequired,
  value: PropTypes.string,
};

ResumoUltimoTesteControle.propTypes = {
  summary: PropTypes.shape({
    completionDateLabel: PropTypes.string,
    completionDescription: PropTypes.string,
    conclusionColor: PropTypes.string,
    conclusionLabel: PropTypes.string,
  }),
};

export default ResumoUltimoTesteControle;
