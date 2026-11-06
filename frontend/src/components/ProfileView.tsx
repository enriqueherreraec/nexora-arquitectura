import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircle from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import TuneIcon from '@mui/icons-material/Tune';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { profileService } from '../services/api';
import type { Usuario } from '../services/api';

interface ProfileViewProps {
  usuario: Usuario;
  onProfileUpdated: (updatedUser: Usuario) => void;
  onNavigate?: (vista: string) => void;
}

const PROVINCIAS_ECUADOR = [
  'Azuay',
  'Bolívar',
  'Cañar',
  'Carchi',
  'Chimborazo',
  'Cotopaxi',
  'El Oro',
  'Esmeraldas',
  'Galápagos',
  'Guayas',
  'Imbabura',
  'Loja',
  'Los Ríos',
  'Manabí',
  'Morona Santiago',
  'Napo',
  'Orellana',
  'Pastaza',
  'Pichincha',
  'Santa Elena',
  'Santo Domingo de los Tsáchilas',
  'Sucumbíos',
  'Tungurahua',
  'Zamora Chinchipe',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  usuario,
  onProfileUpdated,
  onNavigate,
}) => {
  const [provincia, setProvincia] = useState(usuario.perfil?.provincia || 'Pichincha');
  const [ciudad, setCiudad] = useState(usuario.perfil?.ciudad || 'Quito');
  const [modalidad, setModalidad] = useState(usuario.perfil?.modalidad_preferida || 'Presencial');
  const [transporte, setTransporte] = useState(usuario.perfil?.medio_transporte || 'Transporte público');

  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedbackMsg(null);
    try {
      const updatedPerfil = await profileService.updateProfile({
        provincia,
        ciudad,
        modalidad_preferida: modalidad,
        medio_transporte: transporte,
      });
      onProfileUpdated({
        ...usuario,
        perfil: updatedPerfil,
      });
      setFeedbackMsg({
        type: 'success',
        text: 'Preferencias de perfil y movilidad actualizadas correctamente.',
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al actualizar el perfil.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
            <PersonIcon />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.45rem', sm: '2rem' } }}>
            Mi Perfil de Estudiante
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Configure su ubicación y preferencias de transporte para recibir recomendaciones precisas y
          estimaciones de recorrido hacia los campus de las universidades públicas.
        </Typography>
      </Box>

      {feedbackMsg && (
        <Alert
          severity={feedbackMsg.type}
          icon={feedbackMsg.type === 'success' ? <CheckCircle sx={{ color: 'success.main' }} /> : undefined}
          sx={{
            mb: 3,
            borderRadius: 2,
            bgcolor: feedbackMsg.type === 'success' ? (theme) => theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.15)' : '#F0FDF4' : undefined,
            color: feedbackMsg.type === 'success' ? (theme) => theme.palette.mode === 'dark' ? '#2DD4BF' : '#065F46' : undefined,
          }}
        >
          {feedbackMsg.text}
        </Alert>
      )}

      {/* Tarjeta de Información General */}
      <Card sx={{ mb: 4, bgcolor: 'background.paper', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
            Datos de la Cuenta Académica
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.05)' : '#F7F7FC'),
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Nombre Completo
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {usuario.nombre_completo}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.05)' : '#F7F7FC'),
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Correo Electrónico
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {usuario.email}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.05)' : '#F7F7FC'),
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Estado de Cuenta
                </Typography>
                <Chip label="ACTIVO" size="small" color="success" sx={{ fontWeight: 700, mt: 0.5 }} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.05)' : '#F7F7FC'),
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Rol en la Plataforma
                </Typography>
                <Chip
                  label={
                    usuario.rol === 'admin'
                      ? 'Administrador'
                      : usuario.rol === 'gestor'
                      ? 'Gestor Académico'
                      : 'Estudiante'
                  }
                  size="small"
                  sx={{
                    fontWeight: 800,
                    mt: 0.5,
                    bgcolor:
                      usuario.rol === 'admin'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : usuario.rol === 'gestor'
                        ? 'rgba(124, 58, 237, 0.15)'
                        : 'rgba(20, 184, 166, 0.15)',
                    color:
                      usuario.rol === 'admin'
                        ? '#DC2626'
                        : usuario.rol === 'gestor'
                        ? '#7C3AED'
                        : '#0D9488',
                  }}
                />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.05)' : '#F7F7FC'),
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Fecha de Registro
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', mt: 0.5 }}>
                  {new Date(usuario.creado_en).toLocaleDateString('es-EC', { dateStyle: 'long' })}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Accesos Rápidos según Rol */}
      {onNavigate && (
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {/* Opciones de Estudiante */}
          {(!usuario.rol || usuario.rol === 'estudiante') && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#F59E0B',
                      boxShadow: '0 6px 18px rgba(245, 158, 11, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => onNavigate('favoritas')}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(245, 158, 11, 0.15)',
                          color: '#F59E0B',
                          display: 'flex',
                        }}
                      >
                        <StarIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Mis Favoritas
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ver carreras guardadas y comparar
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </Stack>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#7C3AED',
                      boxShadow: '0 6px 18px rgba(124, 58, 237, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => onNavigate('historial')}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(124, 58, 237, 0.15)',
                          color: '#7C3AED',
                          display: 'flex',
                        }}
                      >
                        <PersonIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Historial Vocacional
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Revisar evaluaciones anteriores
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </Stack>
                </Card>
              </Grid>
            </>
          )}

          {/* Opciones de Gestor */}
          {usuario.rol === 'gestor' && (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#7C3AED',
                      boxShadow: '0 6px 18px rgba(124, 58, 237, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => onNavigate('gestor-academico')}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(124, 58, 237, 0.15)',
                          color: '#7C3AED',
                          display: 'flex',
                        }}
                      >
                        <TuneIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Gestor Académico
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Carreras y facultades
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </Stack>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#14B8A6',
                      boxShadow: '0 6px 18px rgba(20, 184, 166, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => onNavigate('universidades')}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(20, 184, 166, 0.15)',
                          color: '#0D9488',
                          display: 'flex',
                        }}
                      >
                        <LocationOnIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Universidades
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Directorio de 33 IES
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </Stack>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#7C3AED',
                      boxShadow: '0 6px 18px rgba(124, 58, 237, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => onNavigate('oferta')}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(124, 58, 237, 0.1)',
                          color: '#7C3AED',
                          display: 'flex',
                        }}
                      >
                        <TuneIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Catálogo Visible
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Oferta académica activa
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </Stack>
                </Card>
              </Grid>
            </>
          )}

          {/* Opciones de Administrador */}
          {usuario.rol === 'admin' && (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#DC2626',
                      boxShadow: '0 6px 18px rgba(220, 38, 38, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => onNavigate('admin-usuarios')}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(239, 68, 68, 0.15)',
                          color: '#DC2626',
                          display: 'flex',
                        }}
                      >
                        <AdminPanelSettingsIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Usuarios y Roles
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Control de accesos y permisos
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </Stack>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#7C3AED',
                      boxShadow: '0 6px 18px rgba(124, 58, 237, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => onNavigate('gestor-academico')}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(124, 58, 237, 0.15)',
                          color: '#7C3AED',
                          display: 'flex',
                        }}
                      >
                        <TuneIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Gestión de Catálogo
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Panel oficial de carreras
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </Stack>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#14B8A6',
                      boxShadow: '0 6px 18px rgba(20, 184, 166, 0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => onNavigate('oferta')}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(20, 184, 166, 0.15)',
                          color: '#0D9488',
                          display: 'flex',
                        }}
                      >
                        <LocationOnIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Catálogo General
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Oferta académica nacional
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </Stack>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      )}

      {/* Formulario de Preferencias y Movilidad (Solo Estudiantes) */}
      {(!usuario.rol || usuario.rol === 'estudiante') && (
      <Card sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <LocationOnIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Preferencias Geográficas y de Estudio
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="profile-provincia"
                  select
                  label="Provincia de Residencia"
                  fullWidth
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                >
                  {PROVINCIAS_ECUADOR.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="profile-ciudad"
                  label="Cantón / Ciudad"
                  fullWidth
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Ej. Quito, Loja, Cuenca"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="profile-modalidad"
                  select
                  label="Modalidad de Estudio Preferida"
                  fullWidth
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value)}
                >
                  <MenuItem value="Presencial">Presencial</MenuItem>
                  <MenuItem value="En Línea">En Línea</MenuItem>
                  <MenuItem value="Semipresencial">Semipresencial</MenuItem>
                  <MenuItem value="Híbrida">Híbrida</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="profile-transporte"
                  select
                  label="Medio de Transporte Habitual"
                  fullWidth
                  value={transporte}
                  onChange={(e) => setTransporte(e.target.value)}
                >
                  <MenuItem value="Transporte público">Transporte público (Metro/Bus)</MenuItem>
                  <MenuItem value="Vehículo propio">Vehículo propio</MenuItem>
                  <MenuItem value="Bicicleta">Bicicleta</MenuItem>
                  <MenuItem value="A pie">A pie / Proximidad</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, mt: 2, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
                  <Button
                    id="btn-guardar-perfil"
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    sx={{
                      px: 4,
                      py: 1.2,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                    }}
                  >
                    Guardar Cambios
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      )}
    </Container>
  );
};
