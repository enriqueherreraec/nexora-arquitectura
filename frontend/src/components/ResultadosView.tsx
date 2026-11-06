import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  Stack,
  Chip,
  Paper,
  LinearProgress,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EmailIcon from '@mui/icons-material/Email';
import RefreshIcon from '@mui/icons-material/Refresh';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import { EmailModal } from './EmailModal';
import { NexoraDialog } from './NexoraDialog';
import { informesService, isSameOffer } from '../services/api';
import type {
  EvaluacionResultado,
  EmailResponse,
  CarreraOferta,
} from '../services/api';

interface ResultadosViewProps {
  resultado: EvaluacionResultado;
  userEmail: string;
  onNuevoCuestionario: () => void;
  carrerasSeleccionadas: CarreraOferta[];
  onToggleCarreraComparar: (carrera: CarreraOferta) => void;
  onIrAComparar: () => void;
  favoritosIds?: number[];
  onToggleFavorito?: (carrera: CarreraOferta) => void;
}

export const ResultadosView: React.FC<ResultadosViewProps> = ({
  resultado,
  userEmail,
  onNuevoCuestionario,
  carrerasSeleccionadas,
  onToggleCarreraComparar,
  onIrAComparar,
  favoritosIds,
  onToggleFavorito,
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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

  const handleDescargarPdf = async () => {
    setDownloadingPdf(true);
    try {
      const blob = await informesService.downloadPdf(resultado.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexora_informe_vocacional_${resultado.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setAvisoModal({
        open: true,
        title: 'Error de Descarga',
        message: err.message || 'No se pudo generar o descargar el informe en formato PDF. Por favor verifica tu conexión e inténtalo nuevamente.',
        severity: 'error',
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleAbrirEmailModal = async () => {
    setEmailModalOpen(true);
    setEmailLoading(true);
    setEmailResultado(null);
    setEmailError(null);

    try {
      const res = await informesService.sendEmail(resultado.id);
      setEmailResultado(res);
    } catch (err: any) {
      setEmailError(err.message || 'No se pudo enviar el informe, puedes volver a intentarlo.');
    } finally {
      setEmailLoading(false);
    }
  };

  const puntuacionesMap = resultado.puntuaciones_areas || {};
  const puntuacionesOrdenadas = Object.entries(puntuacionesMap).sort(
    (a, b) => b[1] - a[1]
  );

  const esEmpate = Boolean(resultado.es_empate);
  const areasEmpatadas = resultado.areas_empatadas || [];
  const todasCero = Boolean(resultado.todas_cero) || Object.values(puntuacionesMap).every((v) => v === 0);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Modal de confirmación de correo */}
      <EmailModal
        open={emailModalOpen}
        loading={emailLoading}
        resultado={emailResultado}
        error={emailError}
        userEmail={userEmail}
        onClose={() => setEmailModalOpen(false)}
      />

      {/* Hero de Resultados con identidad Nexora */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '1rem !important', color: '#7C3AED' }} />}
            label="Índice de Interés Vocacional Declarado"
            size="small"
            sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 700 }}
          />
          {resultado.provincia_origen && (
            <Chip
              label={`Ubicación de referencia: ${resultado.provincia_origen}`}
              size="small"
              sx={{ bgcolor: 'rgba(20, 184, 166, 0.12)', color: '#0F766E', fontWeight: 700 }}
            />
          )}
          {resultado.version_cuestionario && (
            <Chip
              label={`Catálogo: ${resultado.version_cuestionario}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.72rem', borderColor: 'divider' }}
            />
          )}
        </Stack>

        {/* Título de Resultados adaptado a casos especiales */}
        {todasCero ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'text.primary', fontSize: { xs: '1.45rem', sm: '2rem', md: '2.5rem' } }}>
              Sin Preferencia Identificada
            </Typography>
            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ maxWidth: 720, mx: 'auto', mt: 2, textAlign: 'left', borderRadius: 2 }}>
              Todas las áreas vocacionales recibieron una puntuación de cero puntos. Todavía no existe un interés declarado predominante.
              Puedes revisar tus respuestas o realizar otro cuestionario para reflexionar sobre tus inclinaciones académicas.
            </Alert>
          </Box>
        ) : esEmpate && areasEmpatadas.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.45rem', sm: '2rem', md: '2.5rem' } }}>
              Empate en Áreas de Mayor Interés
            </Typography>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              {areasEmpatadas.map((area) => (
                <Chip
                  key={area}
                  label={area}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '1rem',
                    py: 2,
                    px: 1,
                  }}
                />
              ))}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Tus respuestas indican el mismo nivel de interés alto en las áreas destacadas sin priorizar arbitrariamente una sobre otra.
            </Typography>
          </Box>
        ) : (
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.45rem', sm: '2rem', md: '2.5rem' } }}>
            Tu Área de Mayor Interés es{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              {resultado.area_predominante}
            </Box>
          </Typography>
        )}

        {/* Aclaración metodológica obligatoria */}
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, mx: 'auto', mb: 3 }}>
          {resultado.nota_metodologica ||
            'Este resultado representa un índice de interés reflexivo declarado según tus respuestas; no constituye una medida validada de aptitud, probabilidad de ingreso ni puntaje de admisión a universidades públicas.'}
        </Typography>

        {/* Barra de Acciones */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button
            variant="contained"
            startIcon={downloadingPdf ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfIcon />}
            onClick={handleDescargarPdf}
            disabled={downloadingPdf}
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
            }}
          >
            {downloadingPdf ? 'Generando PDF...' : 'Descargar Informe en PDF'}
          </Button>

          <Button
            id="btn-enviar-pdf-correo"
            variant="outlined"
            startIcon={emailLoading ? <CircularProgress size={18} color="inherit" /> : <EmailIcon />}
            onClick={handleAbrirEmailModal}
            disabled={emailLoading || downloadingPdf}
            sx={{
              fontWeight: 700,
              borderColor: 'primary.main',
              color: 'primary.main',
            }}
          >
            {emailLoading ? 'Enviando PDF...' : 'Enviar PDF a mi correo'}
          </Button>

          <Button
            id="btn-hero-ir-a-comparar"
            variant="outlined"
            startIcon={<CompareArrowsIcon />}
            onClick={onIrAComparar}
            sx={{
              fontWeight: 700,
              borderColor: 'primary.main',
              color: 'primary.main',
            }}
          >
            {carrerasSeleccionadas.length >= 2
              ? `Comparar seleccionadas (${carrerasSeleccionadas.length}/4)`
              : `Comparador de Carreras (${carrerasSeleccionadas.length}/4)`}
          </Button>

          <Button
            id="btn-realizar-otro-cuestionario"
            variant="text"
            startIcon={<RefreshIcon />}
            onClick={onNuevoCuestionario}
            sx={{ fontWeight: 700, color: 'text.secondary' }}
          >
            Realizar Otro Cuestionario
          </Button>
        </Stack>
      </Box>

      {/* Grid: Desglose de las 10 Áreas + Recomendaciones Pedagógicas */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Desglose de las 10 Áreas Vocacionales */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Índice de Interés en las 10 Áreas Vocacionales
              </Typography>
              {(() => {
                const esVersion3 = resultado.version_cuestionario === '3.0-20preguntas' || resultado.max_puntos_por_area === 8 || (!resultado.version_cuestionario);
                const maxPtsArea = resultado.max_puntos_por_area || (esVersion3 ? 8 : 12);
                return (
                  <>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
                      {esVersion3
                        ? 'Fórmula oficial: Índice de interés = (suma de las dos respuestas del área / 8) × 100'
                        : 'Fórmula histórica: Afinidad = (suma de 3 respuestas / 12) × 100'}
                    </Typography>

                    <Stack spacing={1.8}>
                      {puntuacionesOrdenadas.map(([area, pct]) => {
                        const esTop = (area === resultado.area_predominante && !todasCero) || (esEmpate && areasEmpatadas.includes(area));
                        const puntosEquivalentes = Math.round((pct * maxPtsArea) / 100);

                        return (
                          <Box key={area}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: esTop ? 800 : 600,
                                  color: esTop ? 'primary.main' : 'text.primary',
                                }}
                              >
                                {area} {esTop && '★'}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 800,
                                  color: esTop ? 'primary.main' : 'text.secondary',
                                  fontSize: '0.85rem',
                                }}
                              >
                                {pct}% ({puntosEquivalentes}/{maxPtsArea} pts)
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 7,
                                borderRadius: 3.5,
                                bgcolor: 'secondary.main',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3.5,
                                  background: esTop
                                    ? 'linear-gradient(90deg, #7C3AED 0%, #14B8A6 100%)'
                                    : 'linear-gradient(90deg, #94A3B8 0%, #64748B 100%)',
                                },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>

        {/* Recomendaciones Pedagógicas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Orientación y Recomendaciones
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Sugerencias pedagógicas para enriquecer tu toma de decisión universitaria:
              </Typography>

              <Stack spacing={1.8}>
                {resultado.recomendaciones && resultado.recomendaciones.map((rec, i) => (
                  <Paper
                    key={i}
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      borderLeft: '4px solid',
                      borderLeftColor: 'primary.main',
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {rec}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de Carreras Afines Recomendadas */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <SchoolIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Carreras Universitarias Públicas Afines
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Opciones seleccionadas prioritariamente por tus áreas de interés declarado, modalidad preferida y proximidad geográfica,
          conservando alternativas pertinentes de diversas universidades del país:
        </Typography>

        {/* Panel de Selección y Contador para Comparador */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 3,
            borderRadius: 3,
            borderColor: 'primary.main',
            bgcolor: 'rgba(124, 58, 237, 0.03)',
            boxShadow: '0 2px 12px rgba(124, 58, 237, 0.08)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <CompareArrowsIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Comparador de Ofertas Académicas
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {carrerasSeleccionadas.length < 2
                  ? 'Selecciona entre 2 y 4 carreras recomendadas con el botón «Añadir a comparación» para contrastarlas.'
                  : `¡Listo para contrastar! Tienes ${carrerasSeleccionadas.length} carreras elegidas para analizar lado a lado.`}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{
                alignItems: { xs: 'stretch', sm: 'center' },
                width: { xs: '100%', sm: 'auto' },
                flexShrink: 0,
              }}
            >
              <Chip
                id="contador-carreras-seleccionadas"
                label={`${carrerasSeleccionadas.length} de 4 carreras seleccionadas`}
                color={carrerasSeleccionadas.length >= 2 ? 'primary' : 'default'}
                sx={{ fontWeight: 800, fontSize: '0.85rem' }}
              />
              <Button
                id="btn-comparar-seleccionadas"
                variant="contained"
                disabled={carrerasSeleccionadas.length < 2}
                onClick={onIrAComparar}
                startIcon={<CompareArrowsIcon />}
                sx={{
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  background:
                    carrerasSeleccionadas.length >= 2
                      ? 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)'
                      : undefined,
                  boxShadow:
                    carrerasSeleccionadas.length >= 2
                      ? '0 4px 14px rgba(124, 58, 237, 0.25)'
                      : 'none',
                }}
              >
                Comparar seleccionadas
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {resultado.carreras_sugeridas.map((c, index) => {
          const facultadNombre = c.facultad || 'Unidad Académica';
          const enlaceOficial = c.pagina_web || c.enlace_oficial || 'https://www.ces.gob.ec';
          const tienePuntajeValido = c.referencia_puntaje && c.referencia_puntaje !== 'Sin dato oficial verificado';
          const seleccionada = carrerasSeleccionadas.some((sel) => isSameOffer(sel, c));

          return (
            <Grid key={c.codigo_oferta || c.id} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 3,
                  border: seleccionada ? '2px solid' : (index === 0 ? '2px solid' : '1px solid'),
                  borderColor: seleccionada ? 'primary.main' : (index === 0 ? 'primary.main' : 'divider'),
                  bgcolor: seleccionada ? 'rgba(124, 58, 237, 0.03)' : 'background.paper',
                  boxShadow: seleccionada ? '0 4px 18px rgba(124, 58, 237, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  p: 3,
                }}
              >
                <Box>
                  <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 14, right: 14, flexWrap: 'wrap', justifyContent: 'flex-end', gap: 0.5, alignItems: 'center' }}>
                    {onToggleFavorito && (
                      <IconButton
                        size="small"
                        onClick={() => onToggleFavorito(c)}
                        sx={{
                          color: favoritosIds?.includes(c.id) ? '#F59E0B' : 'text.disabled',
                          '&:hover': { color: '#F59E0B' },
                          p: 0.5,
                        }}
                        title={favoritosIds?.includes(c.id) ? 'Quitar de favoritas' : 'Guardar en favoritas'}
                      >
                        {favoritosIds?.includes(c.id) ? (
                          <StarIcon sx={{ fontSize: 22 }} />
                        ) : (
                          <StarBorderIcon sx={{ fontSize: 22 }} />
                        )}
                      </IconButton>
                    )}
                    {seleccionada && (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
                        label="Añadida a comparación"
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 800 }}
                      />
                    )}
                    {index === 0 && (
                      <Chip
                        label="Opción más cercana"
                        size="small"
                        sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 700 }}
                      />
                    )}
                  </Stack>

                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, pr: seleccionada ? 16 : (index === 0 ? 14 : 0) }}>
                    {c.nombre}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 0.5 }}>
                    {c.institucion} ({c.siglas})
                  </Typography>

                  {/* Facultad real de la universidad */}
                  <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <AccountBalanceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {facultadNombre}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {c.descripcion}
                  </Typography>

                  {/* Motivo pedagógico de la recomendación */}
                  {c.explicacion && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        mb: 2,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        borderLeft: '4px solid',
                        borderLeftColor: '#14B8A6',
                      }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                        <AutoAwesomeIcon sx={{ fontSize: 16, color: '#14B8A6', mt: 0.3 }} />
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F766E', display: 'block' }}>
                            Motivo de pertinencia vocacional:
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.84rem', lineHeight: 1.5, color: 'text.secondary' }}>
                            {c.explicacion}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  <Divider sx={{ my: 1.5 }} />

                  {/* Metadatos detallados */}
                  <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Campus y Ubicación:
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {c.ciudad}, {c.provincia}
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Modalidad:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {c.modalidad} ({c.duracion_semestres} semestres)
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Afinidad Estimada:
                      </Typography>
                      <Chip
                        label={`${c.afinidad_vocacional}% Afinidad`}
                        size="small"
                        sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 700, mt: 0.3 }}
                      />
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Tiempo de Traslado:
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.3 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {c.tiempo_traslado || 'N/D'}
                        </Typography>
                      </Stack>
                    </Grid>

                    {/* Puntaje Referencial con tipo y periodo */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Puntaje Referencial y Respaldo:
                      </Typography>
                      {tienePuntajeValido ? (
                        <Box sx={{ mt: 0.3 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {c.referencia_puntaje}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.tipo_referencia} ({c.periodo_puntaje || 'Periodo verificado'})
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ mt: 0.3 }}>
                          <Chip
                            label="Sin dato oficial verificado"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.72rem', borderColor: 'divider', color: 'text.secondary' }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                            {c.tipo_referencia || 'No se calcula promedio sin datos comparables'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>

                {/* Acciones de la carrera: Comparar y Enlace oficial */}
                <Box
                  sx={{
                    mt: 2,
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 1.5,
                  }}
                >
                  <Button
                    id={`btn-comparar-carrera-${c.codigo_oferta || c.id}`}
                    size="small"
                    variant={seleccionada ? 'contained' : 'outlined'}
                    color="primary"
                    startIcon={seleccionada ? <CheckCircleIcon /> : <CompareArrowsIcon />}
                    onClick={() => onToggleCarreraComparar(c)}
                    disabled={!seleccionada && carrerasSeleccionadas.length >= 4}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.82rem',
                      width: { xs: '100%', sm: 'auto' },
                      background: seleccionada
                        ? 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)'
                        : undefined,
                    }}
                  >
                    {seleccionada ? 'Quitar de comparación' : 'Añadir a comparación'}
                  </Button>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                    <Button
                      size="small"
                      variant="text"
                      endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                      href={enlaceOficial}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'none', fontSize: '0.78rem' }}
                    >
                      Sitio Oficial
                    </Button>
                    {c.codigo_oferta && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                        Cód: {c.codigo_oferta}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Nota ética al pie */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon sx={{ color: 'primary.main' }} />}
        sx={{
          borderRadius: 3,
          p: 2,
          bgcolor: 'secondary.main',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <strong>Aclaración importante:</strong> Los puntajes históricos y mínimos de postulación conservan su fuente oficial y periodo cuando están respaldados. Aquellos valores sin respaldo mantienen su estado de verificación. No constituyen una garantía de admisión ni reemplazan la información de las convocatorias de SENESCYT y las universidades públicas del Ecuador.
      </Alert>

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
