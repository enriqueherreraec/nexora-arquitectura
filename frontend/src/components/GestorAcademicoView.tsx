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
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DomainIcon from '@mui/icons-material/Domain';
import CloseIcon from '@mui/icons-material/Close';

import { gestorService, catalogoService } from '../services/api';
import type {
  GestorResumen,
  CarreraOferta,
  FacultadItem,
  UniversidadPublica,
  CarreraGestorCreate,
  CarreraGestorUpdate,
} from '../services/api';

const MODALIDADES = ['Presencial', 'En Línea', 'Semipresencial', 'Híbrida', 'A Distancia'];

export const GestorAcademicoView: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  // Métricas de resumen
  const [resumen, setResumen] = useState<GestorResumen | null>(null);
  const [loadingResumen, setLoadingResumen] = useState<boolean>(true);

  // Lista de universidades para selects
  const [universidades, setUniversidades] = useState<UniversidadPublica[]>([]);

  // Filtros de carreras
  const [carreras, setCarreras] = useState<CarreraOferta[]>([]);
  const [loadingCarreras, setLoadingCarreras] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedUniId, setSelectedUniId] = useState<number | ''>('');
  const [selectedModalidad, setSelectedModalidad] = useState<string>('');

  // Lista de facultades
  const [facultades, setFacultades] = useState<FacultadItem[]>([]);
  const [loadingFacultades, setLoadingFacultades] = useState<boolean>(false);

  // Feedback y errores
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Crear / Editar Carrera
  const [modalCarreraOpen, setModalCarreraOpen] = useState<boolean>(false);
  const [carreraEnEdicion, setCarreraEnEdicion] = useState<CarreraOferta | null>(null);
  const [formCarrera, setFormCarrera] = useState<{
    nombre: string;
    universidad_id: number | '';
    facultad: string;
    modalidad: string;
    sedesStr: string;
    duracion_semestres: number;
    campo_amplio: string;
    campo_especifico: string;
    enlace_oficial: string;
    fuente: string;
    periodo_verificacion: string;
    es_vigente: boolean;
  }>({
    nombre: '',
    universidad_id: '',
    facultad: '',
    modalidad: 'Presencial',
    sedesStr: '',
    duracion_semestres: 9,
    campo_amplio: '',
    campo_especifico: '',
    enlace_oficial: '',
    fuente: 'Portal Oficial Institucional',
    periodo_verificacion: '2026-1',
    es_vigente: true,
  });
  const [guardandoCarrera, setGuardandoCarrera] = useState<boolean>(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});

  // Modal Renombrar Facultad
  const [modalFacultadOpen, setModalFacultadOpen] = useState<boolean>(false);
  const [facultadEnEdicion, setFacultadEnEdicion] = useState<FacultadItem | null>(null);
  const [nuevoNombreFacultad, setNuevoNombreFacultad] = useState<string>('');
  const [guardandoFacultad, setGuardandoFacultad] = useState<boolean>(false);

  // Carga inicial
  useEffect(() => {
    cargarResumen();
    cargarUniversidades();
    cargarCarreras();
    cargarFacultades();
  }, []);

  const cargarResumen = async () => {
    setLoadingResumen(true);
    try {
      const data = await gestorService.getResumen();
      setResumen(data);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error al cargar resumen métrico.' });
    } finally {
      setLoadingResumen(false);
    }
  };

  const cargarUniversidades = async () => {
    try {
      const data = await catalogoService.getUniversidades();
      setUniversidades(data);
    } catch (err) {
      console.error('Error cargando universidades:', err);
    }
  };

  const cargarCarreras = async () => {
    setLoadingCarreras(true);
    try {
      const data = await gestorService.getCarreras({
        search: search || undefined,
        universidad_id: selectedUniId !== '' ? selectedUniId : undefined,
        modalidad: selectedModalidad || undefined,
      });
      const list = Array.isArray(data) ? data : (data as any)?.carreras || [];
      setCarreras(list.filter((c: CarreraOferta) => c.es_vigente !== false));
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error al consultar carreras.' });
      setCarreras([]);
    } finally {
      setLoadingCarreras(false);
    }
  };

  const cargarFacultades = async (siglas?: string) => {
    setLoadingFacultades(true);
    try {
      const data = await gestorService.getFacultades(siglas);
      setFacultades(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error al listar facultades.' });
      setFacultades([]);
    } finally {
      setLoadingFacultades(false);
    }
  };

  // Abrir modal de creación
  const handleOpenCrearCarrera = () => {
    setCarreraEnEdicion(null);
    setFormCarrera({
      nombre: '',
      universidad_id: selectedUniId !== '' ? selectedUniId : (universidades[0]?.id ? Number(universidades[0].id) : ''),
      facultad: '',
      modalidad: 'Presencial',
      sedesStr: 'Matriz',
      duracion_semestres: 9,
      campo_amplio: '',
      campo_especifico: '',
      enlace_oficial: '',
      fuente: 'Portal Oficial Institucional',
      periodo_verificacion: '2026-1',
      es_vigente: true,
    });
    setErroresForm({});
    setModalCarreraOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEditarCarrera = (c: CarreraOferta) => {
    setCarreraEnEdicion(c);
    setFormCarrera({
      nombre: c.nombre,
      universidad_id: c.universidad_id || '',
      facultad: c.facultad || '',
      modalidad: c.modalidad || 'Presencial',
      sedesStr: c.sedes && c.sedes.length > 0 ? c.sedes.join(', ') : (c.campus || 'Matriz'),
      duracion_semestres: c.duracion_semestres || 9,
      campo_amplio: c.campo_conocimiento_ces || '',
      campo_especifico: '',
      enlace_oficial: c.enlace_oficial || c.pagina_web || '',
      fuente: c.fuente || 'Portal Oficial Institucional',
      periodo_verificacion: c.periodo_verificacion || '2026-1',
      es_vigente: c.es_vigente !== undefined ? c.es_vigente : true,
    });
    setErroresForm({});
    setModalCarreraOpen(true);
  };

  // Guardar Carrera (Crear o Actualizar)
  const handleGuardarCarrera = async () => {
    // Validaciones
    const errors: Record<string, string> = {};
    if (!formCarrera.nombre.trim()) errors.nombre = 'El nombre de la carrera es obligatorio.';
    if (!formCarrera.universidad_id) errors.universidad_id = 'Debe seleccionar una universidad.';
    if (!formCarrera.facultad.trim()) errors.facultad = 'La facultad o unidad académica es obligatoria.';
    if (!formCarrera.modalidad) errors.modalidad = 'La modalidad es obligatoria.';
    if (!formCarrera.duracion_semestres || formCarrera.duracion_semestres <= 0) {
      errors.duracion_semestres = 'La duración debe ser mayor a 0 semestres.';
    }

    if (Object.keys(errors).length > 0) {
      setErroresForm(errors);
      return;
    }

    setGuardandoCarrera(true);
    setErroresForm({});
    try {
      const sedesArray = formCarrera.sedesStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => Boolean(s));

      if (carreraEnEdicion) {
        // Actualizar
        const updatePayload: CarreraGestorUpdate = {
          nombre: formCarrera.nombre.trim(),
          universidad_id: Number(formCarrera.universidad_id),
          facultad: formCarrera.facultad.trim(),
          modalidad: formCarrera.modalidad,
          sedes: sedesArray.length > 0 ? sedesArray : ['Matriz'],
          duracion_semestres: Number(formCarrera.duracion_semestres),
          campo_amplio: formCarrera.campo_amplio.trim() || undefined,
          enlace_oficial: formCarrera.enlace_oficial.trim() || undefined,
          fuente: formCarrera.fuente.trim() || undefined,
          periodo_verificacion: formCarrera.periodo_verificacion.trim() || undefined,
          es_vigente: formCarrera.es_vigente,
        };
        await gestorService.actualizarCarrera(carreraEnEdicion.id, updatePayload);
        setToast({ type: 'success', message: `Carrera «${formCarrera.nombre}» actualizada exitosamente.` });
      } else {
        // Crear
        const createPayload: CarreraGestorCreate = {
          nombre: formCarrera.nombre.trim(),
          universidad_id: Number(formCarrera.universidad_id),
          facultad: formCarrera.facultad.trim(),
          modalidad: formCarrera.modalidad,
          sedes: sedesArray.length > 0 ? sedesArray : ['Matriz'],
          duracion_semestres: Number(formCarrera.duracion_semestres),
          campo_amplio: formCarrera.campo_amplio.trim() || undefined,
          enlace_oficial: formCarrera.enlace_oficial.trim() || undefined,
          fuente: formCarrera.fuente.trim() || 'Portal Oficial Institucional',
          periodo_verificacion: formCarrera.periodo_verificacion.trim() || '2026-1',
          es_vigente: formCarrera.es_vigente,
        };
        await gestorService.crearCarrera(createPayload);
        setToast({ type: 'success', message: `Carrera «${formCarrera.nombre}» agregada al catálogo exitosamente.` });
      }

      setModalCarreraOpen(false);
      cargarCarreras();
      cargarResumen();
      cargarFacultades();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error al guardar la carrera.' });
    } finally {
      setGuardandoCarrera(false);
    }
  };

  // Desactivar carrera (al desactivarla desaparece de las vistas habituales)
  const handleToggleEstadoCarrera = async (c: CarreraOferta) => {
    try {
      await gestorService.cambiarEstadoCarrera(c.id, false);
      setCarreras((prev) => prev.filter((item) => item.id !== c.id));
      setToast({
        type: 'success',
        message: `Carrera «${c.nombre}» desactivada y retirada del catálogo visible (registros históricos conservados).`,
      });
      cargarResumen();
      cargarFacultades();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'No se pudo desactivar la carrera.' });
    }
  };

  // Abrir modal renombrar facultad
  const handleOpenRenombrarFacultad = (fac: FacultadItem) => {
    setFacultadEnEdicion(fac);
    setNuevoNombreFacultad(fac.facultad);
    setModalFacultadOpen(true);
  };

  // Guardar renombre de facultad
  const handleGuardarRenombreFacultad = async () => {
    if (!facultadEnEdicion || !nuevoNombreFacultad.trim()) return;
    setGuardandoFacultad(true);
    try {
      const sig = facultadEnEdicion.siglas || facultadEnEdicion.universidad_siglas || '';
      const res = await gestorService.renombrarFacultad(
        sig,
        facultadEnEdicion.facultad,
        nuevoNombreFacultad.trim()
      );
      setToast({
        type: 'success',
        message: `${res.message || 'Facultad renombrada'}. Se actualizaron ${res.affected_carreras} carreras asociadas.`,
      });
      setModalFacultadOpen(false);
      cargarFacultades();
      cargarCarreras();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error al renombrar facultad.' });
    } finally {
      setGuardandoFacultad(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
              color: '#FFFFFF',
              display: 'flex',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
            }}
          >
            <TuneIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Panel del Gestor Académico
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administración oficial de universidades, carreras de tercer nivel, facultades y vigencia del catálogo.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Alerta / Notificación Toast */}
      {toast && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      )}

      {/* Tarjetas KPI de Resumen (Únicamente carreras activas del catálogo) */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: 'rgba(124, 58, 237, 0.1)',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccountBalanceIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                    UNIVERSIDADES
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {loadingResumen ? '...' : (resumen?.total_universidades ?? 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    color: '#0D9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SchoolIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                    CARRERAS ÚNICAS
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {loadingResumen ? '...' : (resumen?.total_carreras_unicas ?? 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: 'rgba(34, 197, 94, 0.1)',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                    OFERTAS ACTIVAS
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#16A34A' }}>
                    {loadingResumen ? '...' : (resumen?.total_ofertas_activas ?? 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WarningAmberIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                    PENDIENTES VERIFICAR
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#D97706' }}>
                    {loadingResumen ? '...' : (resumen?.total_pendientes_verificacion ?? resumen?.pendientes_verificar ?? 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pestañas de Navegación del Panel */}
      <Paper variant="outlined" sx={{ borderRadius: 3, mb: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, val) => setTabIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: { xs: 1, sm: 2 },
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', py: 2, minHeight: 48 },
          }}
        >
          <Tab icon={<SchoolIcon sx={{ mr: 1 }} />} iconPosition="start" label="Catálogo de Carreras" />
          <Tab icon={<DomainIcon sx={{ mr: 1 }} />} iconPosition="start" label="Facultades y Unidades Académicas" />
        </Tabs>

        {/* TAB 0: GESTIÓN DE CARRERAS */}
        {tabIndex === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Barra de Filtros y Botón Nueva Carrera */}
            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 3.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar carrera o código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && cargarCarreras()}
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Universidad"
                  value={selectedUniId}
                  onChange={(e) => setSelectedUniId(e.target.value as number | '')}
                >
                  <MenuItem value="">Todas las universidades</MenuItem>
                  {universidades.map((u) => (
                    <MenuItem key={u.id} value={Number(u.id)}>
                      {u.siglas} — {u.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Modalidad"
                  value={selectedModalidad}
                  onChange={(e) => setSelectedModalidad(e.target.value)}
                >
                  <MenuItem value="">Todas las modalidades</MenuItem>
                  {MODALIDADES.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    justifyContent: { xs: 'stretch', md: 'flex-end' },
                    '& .MuiButton-root': { flex: { xs: 1, md: 'none' } },
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={cargarCarreras}
                    startIcon={<RefreshIcon />}
                    sx={{ fontWeight: 700 }}
                  >
                    Filtrar
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddCircleIcon />}
                    onClick={handleOpenCrearCarrera}
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Nueva Carrera
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Tabla de Carreras */}
            {loadingCarreras ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={36} sx={{ color: '#7C3AED', mb: 1.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Cargando catálogo académico...
                </Typography>
              </Box>
            ) : (!Array.isArray(carreras) || carreras.length === 0) ? (
              <Paper variant="outlined" sx={{ py: 6, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  No se encontraron carreras con los filtros seleccionados
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Intenta cambiar el término de búsqueda o limpiar los filtros.
                </Typography>
              </Paper>
            ) : (
              <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
                <Table size="small" sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Carrera y Universidad</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Facultad</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Modalidad y Duración</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Auditoría</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(Array.isArray(carreras) ? carreras : []).map((c) => {
                      return (
                        <TableRow
                          key={c.id}
                          hover
                        >
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {c.nombre}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                              {c.institucion} ({c.siglas})
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {c.facultad || 'Sin facultad asignada'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {c.modalidad}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {c.duracion_semestres} semestres • {c.ciudad}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Activa"
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                bgcolor: 'rgba(20, 184, 166, 0.15)',
                                color: '#0D9488',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {c.modificado_por || 'Sistema inicial'}
                            </Typography>
                            {c.fecha_modificacion && (
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                                {new Date(c.fecha_modificacion).toLocaleDateString()}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                              <Tooltip title="Editar detalles de la carrera">
                                <IconButton size="small" onClick={() => handleOpenEditarCarrera(c)}>
                                  <EditIcon fontSize="small" sx={{ color: '#7C3AED' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Desactivar carrera del catálogo visible">
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleEstadoCarrera(c)}
                                  sx={{ color: '#DC2626' }}
                                >
                                  <VisibilityOffIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* TAB 1: GESTIÓN DE FACULTADES */}
        {tabIndex === 1 && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Unidades Académicas y Facultades Registradas
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => cargarFacultades()}
              >
                Actualizar Lista
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Modificar el nombre oficial de una facultad actualiza de forma automática y consistente todas las carreras
              pertenecientes a esa universidad.
            </Typography>

            {loadingFacultades ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={36} sx={{ color: '#7C3AED', mb: 1.5 }} />
              </Box>
            ) : (!Array.isArray(facultades) || facultades.length === 0) ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No hay facultades registradas actualmente.
                </Typography>
              </Paper>
            ) : (
              <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
                <Table size="small" sx={{ minWidth: 620 }}>
                  <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Universidad</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Nombre de la Facultad</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Carreras Asociadas</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(Array.isArray(facultades) ? facultades : []).map((fac, idx) => (
                      <TableRow key={`${fac.siglas || fac.universidad_siglas}-${fac.facultad}-${idx}`} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {fac.siglas || fac.universidad_siglas}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fac.institucion || fac.universidad_nombre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {fac.facultad}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${fac.total_carreras} carreras`}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenRenombrarFacultad(fac)}
                            sx={{ fontWeight: 600 }}
                          >
                            Renombrar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      {/* Modal Crear / Editar Carrera */}
      <Dialog
        open={modalCarreraOpen}
        onClose={() => setModalCarreraOpen(false)}
        maxWidth="md"
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
              overflow: 'hidden',
              maxHeight: 'calc(100vh - 32px)',
              m: { xs: 1.5, sm: 'auto' },
              width: { xs: 'calc(100% - 24px)', sm: '100%' },
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            p: { xs: 2, sm: 2.5 },
            pb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: 'rgba(124, 58, 237, 0.12)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <SchoolIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.2rem' } }}>
              {carreraEnEdicion ? `Editar Carrera: ${carreraEnEdicion.nombre}` : 'Registrar Nueva Carrera de Grado'}
            </Typography>
          </Box>
          <IconButton
            aria-label="Cerrar ventana"
            onClick={() => setModalCarreraOpen(false)}
            size="small"
            disabled={guardandoCarrera}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Nombre Oficial de la Carrera"
                value={formCarrera.nombre}
                onChange={(e) => setFormCarrera({ ...formCarrera, nombre: e.target.value })}
                error={Boolean(erroresForm.nombre)}
                helperText={erroresForm.nombre}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Universidad"
                value={formCarrera.universidad_id}
                onChange={(e) => setFormCarrera({ ...formCarrera, universidad_id: Number(e.target.value) })}
                error={Boolean(erroresForm.universidad_id)}
                helperText={erroresForm.universidad_id}
                required
              >
                {universidades.map((u) => (
                  <MenuItem key={u.id} value={Number(u.id)}>
                    {u.siglas} — {u.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Facultad o Unidad Académica"
                value={formCarrera.facultad}
                onChange={(e) => setFormCarrera({ ...formCarrera, facultad: e.target.value })}
                error={Boolean(erroresForm.facultad)}
                helperText={erroresForm.facultad || 'Nombre oficial de la facultad en la universidad'}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Modalidad"
                value={formCarrera.modalidad}
                onChange={(e) => setFormCarrera({ ...formCarrera, modalidad: e.target.value })}
                required
              >
                {MODALIDADES.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Duración (Semestres)"
                value={formCarrera.duracion_semestres}
                onChange={(e) => setFormCarrera({ ...formCarrera, duracion_semestres: Number(e.target.value) })}
                error={Boolean(erroresForm.duracion_semestres)}
                helperText={erroresForm.duracion_semestres}
                slotProps={{ htmlInput: { min: 1, max: 14 } }}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Sedes / Campus (Separadas por coma)"
                value={formCarrera.sedesStr}
                onChange={(e) => setFormCarrera({ ...formCarrera, sedesStr: e.target.value })}
                helperText="Ejemplo: Matriz Quito, Campus Sur"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Campo de Conocimiento / Área"
                value={formCarrera.campo_amplio}
                onChange={(e) => setFormCarrera({ ...formCarrera, campo_amplio: e.target.value })}
                placeholder="Ingeniería y Tecnología, Ciencias de la Salud..."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Enlace Oficial (Web de la Carrera)"
                value={formCarrera.enlace_oficial}
                onChange={(e) => setFormCarrera({ ...formCarrera, enlace_oficial: e.target.value })}
                placeholder="https://..."
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Fuente Oficial"
                value={formCarrera.fuente}
                onChange={(e) => setFormCarrera({ ...formCarrera, fuente: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Periodo de Verificación"
                value={formCarrera.periodo_verificacion}
                onChange={(e) => setFormCarrera({ ...formCarrera, periodo_verificacion: e.target.value })}
                placeholder="2026-1"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formCarrera.es_vigente}
                    onChange={(e) => setFormCarrera({ ...formCarrera, es_vigente: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Carrera Activa y Vigente (visible en el catálogo de estudiantes)
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            gap: 1,
            borderTop: 1,
            borderColor: 'divider',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button
            variant="text"
            onClick={() => setModalCarreraOpen(false)}
            disabled={guardandoCarrera}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              px: 2.5,
              py: 0.9,
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarCarrera}
            disabled={guardandoCarrera}
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 0.9,
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6D28D9 0%, #2E1065 100%)',
                boxShadow: '0 6px 20px rgba(124, 58, 237, 0.45)',
              },
            }}
          >
            {guardandoCarrera ? 'Guardando...' : carreraEnEdicion ? 'Actualizar Carrera' : 'Crear Carrera'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Renombrar Facultad */}
      <Dialog
        open={modalFacultadOpen}
        onClose={() => setModalFacultadOpen(false)}
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
              overflow: 'hidden',
              maxHeight: 'calc(100vh - 32px)',
              m: { xs: 1.5, sm: 'auto' },
              width: { xs: 'calc(100% - 24px)', sm: '100%' },
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            p: { xs: 2, sm: 2.5 },
            pb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: 'rgba(124, 58, 237, 0.12)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <DomainIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.2rem' } }}>
              Renombrar Facultad o Unidad Académica
            </Typography>
          </Box>
          <IconButton
            aria-label="Cerrar ventana"
            onClick={() => setModalFacultadOpen(false)}
            size="small"
            disabled={guardandoFacultad}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
          {facultadEnEdicion && (
            <Stack spacing={2.5}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.12)' : 'rgba(124, 58, 237, 0.05)',
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.15)' : 'rgba(124, 58, 237, 0.12)',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                  INSTITUCIÓN:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {facultadEnEdicion.institucion || facultadEnEdicion.universidad_nombre} ({facultadEnEdicion.siglas || facultadEnEdicion.universidad_siglas})
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Carreras que serán actualizadas: <strong>{facultadEnEdicion.total_carreras}</strong>
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Nombre Oficial de la Facultad"
                value={nuevoNombreFacultad}
                onChange={(e) => setNuevoNombreFacultad(e.target.value)}
                required
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            gap: 1,
            borderTop: 1,
            borderColor: 'divider',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button
            variant="text"
            onClick={() => setModalFacultadOpen(false)}
            disabled={guardandoFacultad}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              px: 2.5,
              py: 0.9,
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarRenombreFacultad}
            disabled={guardandoFacultad || !nuevoNombreFacultad.trim()}
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 0.9,
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6D28D9 0%, #2E1065 100%)',
                boxShadow: '0 6px 20px rgba(124, 58, 237, 0.45)',
              },
            }}
          >
            {guardandoFacultad ? 'Guardando...' : 'Confirmar y Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
