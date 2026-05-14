import { Typography, Box } from '@mui/material';
import packageJson from '../../package.json';

const VersionDisplay = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        zIndex: 2000,
        pointerEvents: 'none',
        userSelect: 'none',
        bgcolor: 'background.paper',
        opacity: 0.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '4px',
        px: 0.5,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600 }}>
        v{packageJson.version}
      </Typography>
    </Box>
  );
};

export default VersionDisplay;
