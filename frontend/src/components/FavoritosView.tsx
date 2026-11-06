import React, { useState, useEffect } from 'react';
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
  IconButton,
  Divider,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import SchoolIcon from '@mui/icons-material/School';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { favoritosService } from '../services/api';
import type { FavoritoItem, CarreraOferta } from '../services/api';

interface FavoritosViewProps {
  onCompararCarrera: (carrera: CarreraOferta) => void;
  onExplorarCatalogo: () => void;
  onIrAComparar: () => void;
  onFavoritoChange?: () => void;
}

export const FavoritosView: React.FC<FavoritosViewProps> = ({
  onCompararCarrera,
  onExplorarCatalogo,
  onIrAComparar,
  onFavoritoChange,
}) => {
  const [favoritos, setFavoritos] = useState<FavoritoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCarrera, setSelectedCarrera] = useState<CarreraOferta | null>(null);

  const cargarFavoritos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await favoritosService.getFavoritos();
      const activas = Array.isArray(data)
        ? data.filter((item) => item.carrera && item.carrera.es_vigente !== false)
        : [];
      setFavoritos(activas);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tus carreras favoritas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFavoritos();
  }, []);

  const handleRemoverFavorito = async (carreraId: number) => {
    try {
      await favoritosService.removeFavorito(carreraId);
      setFavoritos((prev) => prev.filter((item) => item.carrera_id !== carreraId));
      if (onFavoritoChange) {
        onFavoritoChange();
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo retirar de favoritos.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                }}
              >
                <StarIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.2rem' } }}>
                Mis Carreras Favoritas
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Listado personalizado de carreras guardadas. Se conservan de forma permanente en tu cuenta para
              revisión y análisis comparativo.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<SchoolIcon />}
              onClick={onExplorarCatalogo}
              sx={{ fontWeight: 700, borderColor: 'rgba(124, 58, 237, 0.4)', color: 'primary.main', py: 0.9, width: { xs: '100%', sm: 'auto' } }}
            >
              Explorar Catálogo
            </Button>
            {favoritos.length > 0 && (
              <Button
                variant="contained"
                startIcon={<CompareArrowsIcon />}
                onClick={onIrAComparar}
                sx={{
                  fontWeight: 700,
                  py: 0.9,
                  width: { xs: '100%', sm: 'auto' },
                  background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                }}
              >
                Ir al Comparador
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={44} sx={{ color: '#7C3AED', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Cargando tus carreras favoritas...
          </Typography>
        </Box>
      ) : favoritos.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            py: 8,
            px: 4,
            textAlign: 'center',
            borderRadius: 4,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <StarBorderIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Aún no has guardado ninguna carrera favorita
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            Haz clic en la estrella ⭐ de cualquier tarjeta en el Catálogo de Carreras, Universidades o en los
            Resultados de tu Cuestionario Vocacional para tenerla siempre a la mano.
          </Typography>
          <Button
            variant="contained"
            onClick={onExplorarCatalogo}
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
              fontWeight: 700,
              px: 3,
            }}
          >
            Ver Catálogo de Carreras
          </Button>
        </Paper>
      ) : (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: 'text.secondary' }}>
            {favoritos.length} {favoritos.length === 1 ? 'carrera guardada' : 'carreras guardadas'}
          </Typography>

          <Grid container spacing={3}>
            {favoritos.map(({ id: favId, carrera }) => (
              <Grid key={favId} size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(124, 58, 237, 0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Fila superior: Nombre, Siglas y Botón Estrella */}
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1, pr: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                          {carrera.nombre}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mt: 0.5 }}>
                          {carrera.institucion}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <Chip
                          label={carrera.siglas}
                          size="small"
                          sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 800 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoverFavorito(carrera.id)}
                          sx={{
                            color: '#F59E0B',
                            '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.15)' },
                          }}
                          title="Quitar de favoritas"
                        >
                          <StarIcon sx={{ fontSize: 24 }} />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Tags */}
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.6 }}>
                      {carrera.facultad && (
                        <Chip
                          label={carrera.facultad}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 22,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderColor: 'divider',
                          }}
                        />
                      )}
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: '0.85rem !important' }} />}
                        label={carrera.estado_verificacion || 'Catálogo 2026'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: 'rgba(20, 184, 166, 0.12)',
                          color: '#0D9488',
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {carrera.descripcion || 'Carrera de tercer nivel de grado universitario avalada por la institución.'}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Sede / Ciudad:
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {carrera.ciudad}, {carrera.provincia}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Modalidad y Duración:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {carrera.modalidad} ({carrera.duracion_semestres} sem.)
                        </Typography>
                      </Grid>

                      {carrera.referencia_puntaje && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Puntaje referencial de corte:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {carrera.referencia_puntaje}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>

                    {/* Acciones */}
                    <Box
                      sx={{
                        mt: 2.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CompareArrowsIcon />}
                          onClick={() => onCompararCarrera(carrera)}
                          sx={{ fontWeight: 600 }}
                        >
                          Comparar
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<InfoOutlinedIcon />}
                          onClick={() => setSelectedCarrera(carrera)}
                          sx={{ fontWeight: 600 }}
                        >
                          Detalle
                        </Button>
                      </Stack>

                      {(carrera.pagina_web || carrera.enlace_oficial) && (
                        <Button
                          size="small"
                          variant="text"
                          endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                          href={carrera.pagina_web || carrera.enlace_oficial}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
                        >
                          Sitio Web
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Modal de Detalle Completo de Carrera */}
      <Dialog
        open={Boolean(selectedCarrera)}
        onClose={() => setSelectedCarrera(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.18)' : 'rgba(124, 58, 237, 0.15)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark' ? '0 16px 48px rgba(0, 0, 0, 0.7)' : '0 16px 48px rgba(56, 32, 100, 0.18)',
              overflowX: 'hidden',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 32px)',
              m: { xs: 1.5, sm: 'auto' },
              width: { xs: 'calc(100% - 24px)', sm: '100%' },
            },
          },
        }}
      >
        {selectedCarrera && (
          <>
            <DialogTitle
              sx={{
                p: { xs: 2, sm: 2.5 },
                pb: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ pr: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
                  {selectedCarrera.nombre}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mt: 0.5 }}>
                  {selectedCarrera.institucion} ({selectedCarrera.siglas})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <Chip
                  label={selectedCarrera.modalidad}
                  size="small"
                  sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 700 }}
                />
                <IconButton
                  aria-label="Cerrar detalle"
                  onClick={() => setSelectedCarrera(null)}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ py: 2.5, px: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                {selectedCarrera.facultad && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                      FACULTAD / UNIDAD ACADÉMICA
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedCarrera.facultad}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                    DESCRIPCIÓN
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {selectedCarrera.descripcion}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                      UBICACIÓN
                    </Typography>
                    <Typography variant="body2">
                      {selectedCarrera.ciudad}, {selectedCarrera.provincia}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                      DURACIÓN ESTIMADA
                    </Typography>
                    <Typography variant="body2">
                      {selectedCarrera.duracion_semestres} semestres
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                      CAMPUS / SEDES
                    </Typography>
                    <Typography variant="body2">
                      {selectedCarrera.sedes && selectedCarrera.sedes.length > 0
                        ? selectedCarrera.sedes.join(', ')
                        : selectedCarrera.campus || 'Matriz'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                      FUENTE Y VIGENCIA
                    </Typography>
                    <Typography variant="body2">
                      {selectedCarrera.fuente || 'Catálogo Oficial 2026'} ({selectedCarrera.periodo_verificacion || '2026'})
                    </Typography>
                  </Grid>
                </Grid>

                {selectedCarrera.modificado_por && (
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(124, 58, 237, 0.05)', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Última actualización de catálogo registrada por: <strong>{selectedCarrera.modificado_por}</strong>
                      {selectedCarrera.fecha_modificacion && ` el ${new Date(selectedCarrera.fecha_modificacion).toLocaleDateString()}`}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, justifyContent: 'space-between', borderTop: 1, borderColor: 'divider', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1.5, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
              <Button
                variant="contained"
                startIcon={<CompareArrowsIcon />}
                onClick={() => {
                  onCompararCarrera(selectedCarrera);
                  setSelectedCarrera(null);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6D28D9 0%, #2E1065 100%)',
                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.45)',
                  },
                }}
              >
                Agregar al Comparador
              </Button>
              <Button
                variant="text"
                onClick={() => setSelectedCarrera(null)}
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};
