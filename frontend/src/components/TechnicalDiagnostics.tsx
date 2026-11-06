import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Stack,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TerminalIcon from '@mui/icons-material/Terminal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyIcon from '@mui/icons-material/Key';
import type { HealthResponse } from '../services/api';

interface TechnicalDiagnosticsProps {
  health: HealthResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export const TechnicalDiagnostics: React.FC<TechnicalDiagnosticsProps> = ({
  health,
  loading,
  onRefresh,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isDbConnected = health?.database?.connected ?? false;
  const isServerActive = health?.server?.status === 'active';

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        borderRadius: 3,
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
            : '0 2px 10px rgba(56, 32, 100, 0.03)',
        '&:before': { display: 'none' },
        mt: 4,
        mb: 2,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%', pr: 2 }}>
          <TerminalIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Panel de Diagnóstico Técnico y Estado del Sistema (Desarrollo)
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            size="small"
            label={isServerActive ? 'API: ACTIVO' : 'API: INACTIVO'}
            color={isServerActive ? 'success' : 'error'}
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
          <Chip
            size="small"
            label={isDbConnected ? 'BD: CONECTADA' : 'BD: CONFIGURACIÓN PENDIENTE'}
            color={isDbConnected ? 'success' : 'warning'}
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 1, pb: 3, px: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Este apartado es exclusivo para revisión técnica de la infraestructura local y no forma parte del flujo
          vocacional de los estudiantes.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Tarjeta Servidor */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.05)' : '#F7F7FC'),
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Servidor Web FastAPI
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                <strong>Puerto / Servicio:</strong> {health?.server?.port || 8002}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                <strong>Versión:</strong> {health?.server?.version || '0.3.0'} {health?.server?.commit ? `(commit ${health.server.commit})` : ''} | Entorno: {health?.server?.environment || 'development'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Endpoints de diagnóstico: <code>/salud</code> y <code>/health</code>
              </Typography>
            </Paper>
          </Grid>

          {/* Tarjeta Base de Datos */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.05)' : '#F7F7FC'),
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                {isDbConnected ? (
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                ) : (
                  <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  PostgreSQL (orientacion_vocacional_db)
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: isDbConnected ? 'success.main' : 'warning.main', fontWeight: 600 }}>
                {health?.database?.message || 'Estado no verificado'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Base exclusiva del proyecto. No modifica KASH ni otras bases existentes.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Guía para configurar contraseña localmente */}
        {!isDbConnected && (
          <Alert
            severity="info"
            icon={<KeyIcon sx={{ color: 'primary.main' }} />}
            sx={{
              bgcolor: 'secondary.main',
              color: 'text.primary',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              ¿Cómo configurar su contraseña local de PostgreSQL?
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              1. Abra el archivo <code>backend/.env</code> en su editor de código.
              <br />
              2. Localice la variable <code>DB_PASSWORD=</code> y escriba su contraseña personal de PostgreSQL local.
              <br />
              3. Guarde el archivo (nunca comparta su clave en el chat; se guarda solo en su equipo local).
              <br />
              4. Ejecute en PowerShell: <code>python scripts/setup_db.py</code> y <code>alembic upgrade head</code>.
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              fontWeight: 600,
            }}
          >
            Actualizar Diagnóstico
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
