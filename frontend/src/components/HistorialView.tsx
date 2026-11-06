import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Stack,
  Chip,
  Paper,
  CircularProgress,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { evaluacionesService, informesService } from '../services/api';
import { EmailModal } from './EmailModal';
import { NexoraDialog } from './NexoraDialog';
import type {
  EvaluacionHistorialItem,
  EvaluacionResultado,
  EmailResponse,
} from '../services/api';

interface HistorialViewProps {
  userEmail: string;
  onVerDetalle: (resultado: EvaluacionResultado) => void;
  onNuevoCuestionario: () => void;
}

export const HistorialView: React.FC<HistorialViewProps> = ({
  userEmail,
  onVerDetalle,
  onNuevoCuestionario,
}) => {
  const [historial, setHistorial] = useState<EvaluacionHistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResultado, setEmailResultado] = useState<EmailResponse | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [avisoModal, setAvisoModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
  } | null>(null);

  useEffect(() => {
    evaluacionesService
      .getHistorial()
      .then((data) => setHistorial(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDescargarPdf = async (id: number) => {
    setDownloadingId(id);
    try {
      const blob = await informesService.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexora_informe_vocacional_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setAvisoModal({
        open: true,
        title: 'Error de Descarga',
        message: err.message || 'No se pudo generar o descargar el informe en PDF. Por favor verifica tu conexión e inténtalo nuevamente.',
        severity: 'error',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleEnviarCorreo = async (id: number) => {
    setEmailModalOpen(true);
    setEmailLoading(true);
    setEmailResultado(null);
    setEmailError(null);

    try {
      const res = await informesService.sendEmail(id);
      setEmailResultado(res);
    } catch (err: any) {
      setEmailError(err.message || 'No se pudo enviar el informe, puedes volver a intentarlo.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerDetalleCompleto = async (id: number) => {
    try {
      const detalle = await evaluacionesService.getDetalle(id);
      onVerDetalle(detalle);
    } catch (err: any) {
      setAvisoModal({
        open: true,
        title: 'Error de Consulta',
        message: err.message || 'No se pudo cargar el detalle completo de la evaluación. Por favor inténtalo de nuevo.',
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <EmailModal
        open={emailModalOpen}
        loading={emailLoading}
        resultado={emailResultado}
        error={emailError}
        userEmail={userEmail}
        onClose={() => setEmailModalOpen(false)}
      />

      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: '10px',
              bgcolor: 'secondary.main',
              color: 'primary.main',
              display: 'flex',
            }}
          >
            <HistoryIcon />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.2rem' } }}>
            Historial de Evaluaciones Vocacionales
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Registro cronológico de tus cuestionarios completados. Cada intento conserva su desglose
          de afinidad y su informe formal en PDF disponible para descarga continua.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: '#7C3AED', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Consultando historial de intentos...
          </Typography>
        </Box>
      ) : historial.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Aún no has completado ninguna evaluación vocacional
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Responde el cuestionario para descubrir tus áreas de afinidad y explorar carreras públicas afines.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={onNuevoCuestionario}
            sx={{
              py: 1.2,
              px: 3.5,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
            }}
          >
            Comenzar Cuestionario Ahora
          </Button>
        </Card>
      ) : (
        <Stack spacing={2.5}>
          {historial.map((item, idx) => (
            <Card key={item.id} sx={{ p: { xs: 2, sm: 2.5 } }}>
              <CardContent sx={{ p: '0 !important' }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 1.5 }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip label={`Evaluación #${historial.length - idx}`} size="small" sx={{ fontWeight: 700 }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.creado_en).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}
                    </Typography>
                  </Stack>
                  <Chip
                    label={item.es_empate && item.areas_empatadas && item.areas_empatadas.length > 1
                      ? `Empate: ${item.areas_empatadas.join(' / ')}`
                      : `Área: ${item.area_predominante}`}
                    size="small"
                    sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 700, mt: { xs: 1, sm: 0 } }}
                  />
                </Stack>

                {item.carrera_top && (
                  <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Carrera recomendada más cercana en este intento:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {item.carrera_top.nombre} — {item.carrera_top.institucion} ({item.carrera_top.ciudad})
                    </Typography>
                  </Paper>
                )}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'flex-end', width: '100%', '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleVerDetalleCompleto(item.id)}
                    sx={{ fontWeight: 600, color: 'primary.main', py: 0.9 }}
                  >
                    Ver Resultados
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={downloadingId === item.id ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfIcon />}
                    onClick={() => handleDescargarPdf(item.id)}
                    disabled={downloadingId === item.id}
                    sx={{ fontWeight: 600, py: 0.9 }}
                  >
                    Descargar PDF
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={emailLoading ? <CircularProgress size={14} color="inherit" /> : <EmailIcon />}
                    onClick={() => handleEnviarCorreo(item.id)}
                    disabled={emailLoading}
                    sx={{ fontWeight: 600, py: 0.9 }}
                  >
                    Enviar PDF a mi correo
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {avisoModal && (
        <NexoraDialog
          open={avisoModal.open}
          onClose={() => setAvisoModal(null)}
          title={avisoModal.title}
          message={avisoModal.message}
          severity={avisoModal.severity || 'error'}
          primaryButtonText="Entendido"
        />
      )}
    </Container>
  );
};
