import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EmailIcon from '@mui/icons-material/Email';
import type { EmailResponse } from '../services/api';

interface EmailModalProps {
  open: boolean;
  loading: boolean;
  resultado: EmailResponse | null;
  error: string | null;
  userEmail: string;
  onClose: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  open,
  loading,
  resultado,
  error,
  userEmail,
  onClose,
}) => {
  const emailDestino = resultado?.email || userEmail;
  const nombreAdjunto = resultado?.archivo_adjunto || 'Informe_vocacional_Nexora.pdf';

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: { xs: 2, sm: 3 },
            textAlign: 'center',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.18)' : 'rgba(124, 58, 237, 0.15)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark' ? '0 16px 48px rgba(0, 0, 0, 0.7)' : '0 16px 48px rgba(56, 32, 100, 0.18)',
            overflow: 'hidden',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            m: { xs: 1.5, sm: 'auto' },
            width: { xs: 'calc(100% - 24px)', sm: '100%' },
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <IconButton
          aria-label="Cerrar modal"
          onClick={onClose}
          size="small"
          disabled={loading}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, pb: 1 }}>
        {/* ESTADO 1: ENVIANDO / CARGANDO */}
        {loading && (
          <Box sx={{ py: 3 }}>
            <CircularProgress size={52} sx={{ color: '#7C3AED', mb: 2.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Enviando informe por correo...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Conectando con el servidor SMTP y despachando a tu dirección registrada:
            </Typography>
            <Chip
              icon={<EmailIcon sx={{ fontSize: '1rem !important', color: '#7C3AED' }} />}
              label={userEmail}
              size="small"
              sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 700 }}
            />
          </Box>
        )}

        {/* ESTADO 2: ÉXITO REAL (CONFIRMACIÓN DEL SERVIDOR SMTP) */}
        {!loading && resultado && resultado.ok && (
          <Box sx={{ py: 2 }}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                bgcolor: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                border: '2px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 38 }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
              ¡Informe enviado con éxito!
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              El servidor de correo aceptó el mensaje y lo despachó a tu cuenta registrada:
            </Typography>

            <Chip
              label={emailDestino}
              size="medium"
              sx={{
                bgcolor: 'rgba(124, 58, 237, 0.1)',
                color: 'primary.main',
                fontWeight: 800,
                mb: 2.5,
              }}
            />

            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 3,
                borderRadius: 2.5,
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <PictureAsPdfIcon sx={{ color: '#EF4444', fontSize: 20 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Archivo adjunto: <strong>{nombreAdjunto}</strong>
              </Typography>
            </Paper>

            <Button
              variant="contained"
              fullWidth
              onClick={onClose}
              sx={{
                py: 1.2,
                fontWeight: 700,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
              }}
            >
              Entendido
            </Button>
          </Box>
        )}

        {/* ESTADO 3: ERROR CLARO SI FALLA EL ENVÍO */}
        {!loading && error && (
          <Box sx={{ py: 2 }}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                bgcolor: 'rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                border: '2px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <ErrorIcon sx={{ fontSize: 38 }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#DC2626' }}>
              No se pudo enviar el informe
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: 2.5,
                bgcolor: 'rgba(239, 68, 68, 0.04)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                textAlign: 'left',
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
                {error}
              </Typography>
            </Paper>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              Puedes descargar el documento directamente con el botón <strong>«Descargar Informe en PDF»</strong> mientras verificas la configuración del servidor de correo.
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
            >
              Cerrar
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
