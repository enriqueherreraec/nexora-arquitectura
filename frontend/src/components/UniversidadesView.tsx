import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Box,
  Button,
  Stack,
  Chip,
  InputAdornment,
  Divider,
  CircularProgress,
  Pagination,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BadgeIcon from '@mui/icons-material/Badge';
import VerifiedIcon from '@mui/icons-material/Verified';
import PublicIcon from '@mui/icons-material/Public';
import BusinessIcon from '@mui/icons-material/Business';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import { catalogoService, isSameOffer } from '../services/api';
import type { UniversidadPublica, CarreraOferta } from '../services/api';

interface UniversidadesViewProps {
  carrerasSeleccionadas: CarreraOferta[];
  onToggleCarreraComparar: (carrera: CarreraOferta) => void;
  onIrAComparar?: () => void;
  favoritosIds?: number[];
  onToggleFavorito?: (carrera: CarreraOferta) => void;
  usuarioRole?: string;
}

export interface CarreraAgrupada {
  clave: string;
  nombre: string;
  titulo_otorga: string;
  area_vocacional: string;
  duracion_semestres: number;
  es_tercer_nivel: boolean;
  es_posgrado: boolean;
  descripcion: string;
  facultad: string;
  facultadesDisponibles?: string[];
  respaldo_facultad: string;
  enlace_oficial: string;
  ofertas: CarreraOferta[];
  modalidadesDisponibles: string[];
  sedesDisponibles: string[];
}

export interface FacultadAgrupada {
  nombre: string;
  carreras: CarreraAgrupada[];
  totalOfertas: number;
  respaldo?: string;
}

const ITEMS_PER_PAGE = 9;

export const UniversidadesView: React.FC<UniversidadesViewProps> = ({
  carrerasSeleccionadas,
  onToggleCarreraComparar,
  onIrAComparar,
  favoritosIds,
  onToggleFavorito,
  usuarioRole,
}) => {
  // Lista general de universidades públicas
  const [universidades, setUniversidades] = useState<UniversidadPublica[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros de búsqueda en el directorio
  const [search, setSearch] = useState<string>('');
  const [provinciaFiltro, setProvinciaFiltro] = useState<string>('Todas');
  const [ciudadFiltro, setCiudadFiltro] = useState<string>('Todas');
  const [page, setPage] = useState<number>(1);

  // Universidad seleccionada para vista detallada
  const [universidadSeleccionada, setUniversidadSeleccionada] = useState<UniversidadPublica | null>(null);
  const [carrerasUniversidad, setCarrerasUniversidad] = useState<CarreraOferta[]>([]);
  const [loadingCarreras, setLoadingCarreras] = useState<boolean>(false);
  const [errorCarreras, setErrorCarreras] = useState<string | null>(null);

  // Filtros internos dentro del detalle de la universidad
  const [searchCarrera, setSearchCarrera] = useState<string>('');
  const [modalidadFiltro, setModalidadFiltro] = useState<string>('Todas');
  const [nivelFiltro, setNivelFiltro] = useState<string>('Todos');

  // Cargar catálogo de universidades
  useEffect(() => {
    cargarUniversidades();
  }, []);

  const cargarUniversidades = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogoService.getUniversidades();
      setUniversidades(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las universidades públicas.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Cargar carreras cuando se selecciona una universidad
  const handleSeleccionarUniversidad = async (u: UniversidadPublica) => {
    setUniversidadSeleccionada(u);
    setSearchCarrera('');
    setModalidadFiltro('Todas');
    setNivelFiltro('Todos');
    setLoadingCarreras(true);
    setErrorCarreras(null);

    try {
      const carreras = await catalogoService.getCarreras({
        siglas: u.siglas,
      });
      setCarrerasUniversidad(carreras);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las carreras de la institución.';
      setErrorCarreras(msg);
    } finally {
      setLoadingCarreras(false);
    }
  };

  const handleVolverALista = () => {
    setUniversidadSeleccionada(null);
    setCarrerasUniversidad([]);
  };

  // Listas de provincias y ciudades únicas para los filtros del directorio
  const provinciasDisponibles = useMemo(() => {
    const setProvs = new Set<string>();
    universidades.forEach((u) => {
      if (u.provincia_matriz && u.provincia_matriz !== 'No especificada') {
        setProvs.add(u.provincia_matriz);
      }
      u.provincias?.forEach((p) => {
        if (p) setProvs.add(p);
      });
    });
    return ['Todas', ...Array.from(setProvs).sort((a, b) => a.localeCompare(b))];
  }, [universidades]);

  const ciudadesDisponibles = useMemo(() => {
    const setCiuds = new Set<string>();
    universidades.forEach((u) => {
      if (provinciaFiltro !== 'Todas') {
        const pertenece =
          u.provincia_matriz === provinciaFiltro || u.provincias?.includes(provinciaFiltro);
        if (!pertenece) return;
      }
      if (u.ciudad_matriz && u.ciudad_matriz !== 'No especificada') {
        setCiuds.add(u.ciudad_matriz);
      }
      u.ciudades?.forEach((c) => {
        if (c) setCiuds.add(c);
      });
    });
    return ['Todas', ...Array.from(setCiuds).sort((a, b) => a.localeCompare(b))];
  }, [universidades, provinciaFiltro]);

  // Filtrado de universidades en el directorio
  const universidadesFiltradas = useMemo(() => {
    return universidades.filter((u) => {
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchNombre = u.nombre.toLowerCase().includes(query);
        const matchSiglas = u.siglas.toLowerCase().includes(query);
        if (!matchNombre && !matchSiglas) return false;
      }

      if (provinciaFiltro !== 'Todas') {
        const matchProvMatriz = u.provincia_matriz === provinciaFiltro;
        const matchOtrasProvs = u.provincias?.includes(provinciaFiltro);
        if (!matchProvMatriz && !matchOtrasProvs) return false;
      }

      if (ciudadFiltro !== 'Todas') {
        const matchCiudadMatriz = u.ciudad_matriz === ciudadFiltro;
        const matchOtrasCiudades = u.ciudades?.includes(ciudadFiltro);
        if (!matchCiudadMatriz && !matchOtrasCiudades) return false;
      }

      return true;
    });
  }, [universidades, search, provinciaFiltro, ciudadFiltro]);

  // Paginación del directorio
  const totalPages = Math.ceil(universidadesFiltradas.length / ITEMS_PER_PAGE);
  const universidadesPaginadas = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return universidadesFiltradas.slice(start, start + ITEMS_PER_PAGE);
  }, [universidadesFiltradas, page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleResetFiltros = () => {
    setSearch('');
    setProvinciaFiltro('Todas');
    setCiudadFiltro('Todas');
    setPage(1);
  };

  // Filtrado de ofertas individuales según los filtros activos dentro de la universidad
  const ofertasFiltradas = useMemo(() => {
    return carrerasUniversidad.filter((c) => {
      // Omitir ofertas marcadas como no vigentes o duplicados históricos
      if (c.es_vigente === false) return false;

      if (searchCarrera.trim()) {
        const q = searchCarrera.toLowerCase().trim();
        const matchNombre = c.nombre.toLowerCase().includes(q);
        const matchTitulo = (c.titulo_otorga || '').toLowerCase().includes(q);
        const matchFacultad = (c.facultad || '').toLowerCase().includes(q);
        const matchArea = (c.area_vocacional || '').toLowerCase().includes(q);
        if (!matchNombre && !matchTitulo && !matchFacultad && !matchArea) return false;
      }

      if (modalidadFiltro !== 'Todas') {
        if (!c.modalidad.toLowerCase().includes(modalidadFiltro.toLowerCase())) return false;
      }

      if (nivelFiltro !== 'Todos') {
        if (nivelFiltro === 'Grado' && !c.es_tercer_nivel && c.es_posgrado) return false;
        if (nivelFiltro === 'Posgrado' && !c.es_posgrado) return false;
      }

      return true;
    });
  }, [carrerasUniversidad, searchCarrera, modalidadFiltro, nivelFiltro]);

  // =========================================================================
  // =========================================================================
  // AGRUPACIÓN JERÁRQUICA: Universidad → Carrera Única → Ofertas (Presencial / En Línea) → Facultad
  // =========================================================================
  const facultadesConCarreras = useMemo<FacultadAgrupada[]>(() => {
    // 1. Agrupar ofertas filtradas por carrera única (nombre normalizado)
    const mapaCarrerasUnicas = new Map<string, CarreraOferta[]>();
    ofertasFiltradas.forEach((oferta) => {
      const clave = oferta.nombre.trim().toUpperCase();
      if (!mapaCarrerasUnicas.has(clave)) {
        mapaCarrerasUnicas.set(clave, []);
      }
      mapaCarrerasUnicas.get(clave)!.push(oferta);
    });

    // 2. Determinar facultad principal para cada carrera única y construir CarreraAgrupada
    const mapaFacultades = new Map<string, CarreraAgrupada[]>();
    const mapaRespaldo = new Map<string, string>();
    const mapaTotalOfertasFac = new Map<string, number>();

    mapaCarrerasUnicas.forEach((ofertas, clave) => {
      // Priorizar oferta oficial con código NXR- o la primera
      const principal = ofertas.find((o) => o.codigo_oferta && o.codigo_oferta.startsWith('NXR-')) || ofertas[0];

      const modalidadesSet = new Set<string>();
      const sedesSet = new Set<string>();
      const facultadesSet = new Set<string>();

      ofertas.forEach((o) => {
        if (o.modalidad) modalidadesSet.add(o.modalidad);
        const ubic = o.campus || o.ciudad || o.canton;
        if (ubic) sedesSet.add(ubic);
        const f = (o.facultad || '').trim();
        if (f && !f.toLowerCase().includes('no especificada') && !f.toLowerCase().includes('no verificada')) {
          facultadesSet.add(f);
        }
      });

      const facultadesLista = Array.from(facultadesSet);

      // Facultad asignada: preferir facultad sustantiva (no de modalidad virtual/distancia si tiene facultad presencial)
      let facPrimaria = (principal.facultad || '').trim();
      if (facultadesLista.length > 1) {
        const facSustantiva = facultadesLista.find(
          (f) => !f.toLowerCase().includes('distancia') && !f.toLowerCase().includes('en línea')
        );
        if (facSustantiva) {
          facPrimaria = facSustantiva;
        } else {
          facPrimaria = facultadesLista[0];
        }
      }

      if (!facPrimaria || facPrimaria.toLowerCase().includes('no especificada') || facPrimaria.toLowerCase().includes('no verificada')) {
        facPrimaria = 'Unidad Académica Institucional';
      }

      const carreraAgrupada: CarreraAgrupada = {
        clave,
        nombre: principal.nombre,
        titulo_otorga: principal.titulo_otorga || principal.nombre,
        area_vocacional: principal.area_vocacional || 'General',
        duracion_semestres: principal.duracion_semestres || 9,
        es_tercer_nivel: principal.es_tercer_nivel ?? true,
        es_posgrado: principal.es_posgrado ?? false,
        descripcion: principal.descripcion || `Carrera de ${principal.nombre} impartida en ${principal.institucion}.`,
        facultad: facPrimaria,
        facultadesDisponibles: facultadesLista.length > 0 ? facultadesLista : [facPrimaria],
        respaldo_facultad: principal.respaldo_facultad || 'Portal oficial institucional',
        enlace_oficial: principal.enlace_oficial || principal.pagina_web || '',
        ofertas,
        modalidadesDisponibles: Array.from(modalidadesSet).sort(),
        sedesDisponibles: Array.from(sedesSet).sort(),
      };

      if (!mapaFacultades.has(facPrimaria)) {
        mapaFacultades.set(facPrimaria, []);
      }
      mapaFacultades.get(facPrimaria)!.push(carreraAgrupada);

      if (principal.respaldo_facultad && !mapaRespaldo.has(facPrimaria)) {
        mapaRespaldo.set(facPrimaria, principal.respaldo_facultad);
      }

      mapaTotalOfertasFac.set(
        facPrimaria,
        (mapaTotalOfertasFac.get(facPrimaria) || 0) + ofertas.length
      );
    });

    const resultado: FacultadAgrupada[] = [];

    mapaFacultades.forEach((carreras, facNombre) => {
      carreras.sort((a, b) => a.nombre.localeCompare(b.nombre));
      resultado.push({
        nombre: facNombre,
        carreras,
        totalOfertas: mapaTotalOfertasFac.get(facNombre) || carreras.length,
        respaldo: mapaRespaldo.get(facNombre),
      });
    });

    // Asegurar que facultades que solo tienen ofertas compartidas o extensiones también aparezcan si tienen respaldo
    carrerasUniversidad.forEach((c) => {
      const f = (c.facultad || '').trim();
      if (f && !resultado.some((res) => res.nombre === f)) {
        resultado.push({
          nombre: f,
          carreras: [],
          totalOfertas: 0,
          respaldo: c.respaldo_facultad || 'Portal oficial institucional',
        });
      }
    });

    // Ordenar facultades alfabéticamente (con carreras primero)
    resultado.sort((a, b) => {
      if (a.carreras.length > 0 && b.carreras.length === 0) return -1;
      if (a.carreras.length === 0 && b.carreras.length > 0) return 1;
      return a.nombre.localeCompare(b.nombre);
    });
    return resultado;
  }, [ofertasFiltradas, carrerasUniversidad]);

  // Modalidades disponibles dentro de la universidad seleccionada
  const modalidadesEnUniversidad = useMemo(() => {
    const setMod = new Set<string>();
    carrerasUniversidad.forEach((c) => {
      if (c.modalidad) setMod.add(c.modalidad);
    });
    return ['Todas', ...Array.from(setMod).sort()];
  }, [carrerasUniversidad]);

  // Conteos globales de la universidad seleccionada
  const totalCarrerasUnicas = useMemo(() => {
    const setNombres = new Set<string>();
    carrerasUniversidad.forEach((c) => setNombres.add(c.nombre.trim().toUpperCase()));
    return setNombres.size;
  }, [carrerasUniversidad]);

  const totalCarrerasUnicasFiltradas = useMemo(() => {
    return facultadesConCarreras.reduce((sum, f) => sum + f.carreras.length, 0);
  }, [facultadesConCarreras]);

  // ==========================================
  // RENDER: VISTA DETALLE DE UNA UNIVERSIDAD
  // ==========================================
  if (universidadSeleccionada) {
    const u = universidadSeleccionada;
    const tieneSitioOficial =
      u.sitio_web &&
      u.sitio_web !== 'Información no disponible' &&
      u.sitio_web.startsWith('http');

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Barra superior de navegación interna */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}
        >
          <Button
            id="btn-volver-universidades"
            startIcon={<ArrowBackIcon />}
            onClick={handleVolverALista}
            variant="outlined"
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              fontWeight: 600,
              alignSelf: 'flex-start',
            }}
          >
            Volver a universidades
          </Button>

          {carrerasSeleccionadas.length > 0 && onIrAComparar && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CompareArrowsIcon />}
              onClick={onIrAComparar}
              sx={{ fontWeight: 700 }}
            >
              Comparar ({carrerasSeleccionadas.length} de 4)
            </Button>
          )}
        </Stack>

        {/* Tarjeta de Encabezado Institucional */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)',
              }}
            >
              <AccountBalanceIcon sx={{ fontSize: 38 }} />
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                <Chip
                  label={u.siglas}
                  color="primary"
                  sx={{ fontWeight: 800, fontSize: '0.95rem', height: 28 }}
                />
                <Chip
                  label={u.tipo || 'Universidad Pública'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, color: 'text.secondary' }}
                />
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '1rem !important' }} />}
                  label="Verificado oficial CES / LOES"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 24 }}
                />
              </Stack>

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  fontSize: { xs: '1.45rem', md: '1.85rem' },
                  mb: 1.5,
                  lineHeight: 1.25,
                }}
              >
                {u.nombre}
              </Typography>

              {/* Sede Matriz vs Ubicaciones de Ofertas */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <LocationOnIcon color="primary" />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                        SEDE PRINCIPAL (MATRIZ)
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {u.ciudad_matriz}, {u.provincia_matriz}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <BusinessIcon color="primary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                        SEDES Y EXTENSIONES
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                        {u.ubicaciones_ofertas && u.ubicaciones_ofertas.length > 0
                          ? u.ubicaciones_ofertas.join(' • ')
                          : u.ciudad_matriz}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Descripción institucional */}
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
                {u.descripcion || 'Institución pública de educación superior de excelencia académica.'}
              </Typography>

              {/* Botón portal institucional y metadatos de verificación */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', pt: 1 }}
              >
                {tieneSitioOficial ? (
                  <Button
                    id="btn-visitar-sitio-oficial"
                    variant="contained"
                    color="primary"
                    startIcon={<PublicIcon />}
                    endIcon={<OpenInNewIcon sx={{ fontSize: 18 }} />}
                    href={u.sitio_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontWeight: 700,
                      px: 3,
                      py: 1,
                      boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
                    }}
                  >
                    Visitar sitio oficial
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    disabled
                    startIcon={<PublicIcon />}
                    sx={{ fontWeight: 600 }}
                  >
                    Sitio oficial: Información no disponible
                  </Button>
                )}

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Fuente: {u.fuente_verificacion || 'Catálogo Oficial CES / LOES'} • Actualizado: {u.fecha_verificacion || '2026-10'}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        {/* Resumen de oferta académica y facultades */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            mb: 4,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2.5 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Carreras y Unidades Académicas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estructura oficial organizada por facultades, departamentos y escuelas de {u.siglas}.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {carrerasUniversidad.length > 0 ? (
                <>
                  <Chip
                    icon={<SchoolIcon />}
                    label={
                      searchCarrera || modalidadFiltro !== 'Todas' || nivelFiltro !== 'Todos'
                        ? `${totalCarrerasUnicasFiltradas} de ${totalCarrerasUnicas} carreras`
                        : `${totalCarrerasUnicas} carreras`
                    }
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    icon={<AccountBalanceIcon />}
                    label={`${u.facultades?.length || facultadesConCarreras.length} facultades oficiales`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </>
              ) : (
                <Chip
                  icon={<AccessTimeIcon />}
                  label="Catálogo pendiente de incorporar"
                  color="warning"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
          </Stack>

          {/* Filtros dentro de la universidad */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar carreras por nombre, título o área dentro de la universidad..."
                value={searchCarrera}
                onChange={(e) => setSearchCarrera(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Modalidad"
                value={modalidadFiltro}
                onChange={(e) => setModalidadFiltro(e.target.value)}
              >
                {modalidadesEnUniversidad.map((mod) => (
                  <MenuItem key={mod} value={mod}>
                    {mod}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Nivel de formación"
                value={nivelFiltro}
                onChange={(e) => setNivelFiltro(e.target.value)}
              >
                <MenuItem value="Todos">Todos los niveles</MenuItem>
                <MenuItem value="Grado">Grado / Tercer Nivel</MenuItem>
                <MenuItem value="Posgrado">Posgrado / Cuarto Nivel</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Estado de carga de carreras */}
        {loadingCarreras && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {errorCarreras && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {errorCarreras}
          </Alert>
        )}

        {/* Estructura Jerárquica: Facultad → Carreras Únicas → Modalidades y Sedes */}
        {!loadingCarreras && !errorCarreras && (
          <>
            {carrerasUniversidad.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 56, color: 'warning.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                  Catálogo pendiente de incorporar
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
                  La oferta académica detallada de {u.nombre} se encuentra en proceso de incorporación y validación oficial. Actualmente el catálogo contiene 21 universidades públicas incorporadas con oferta de tercer nivel verificada.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleVolverALista}
                  startIcon={<ArrowBackIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  Volver al directorio de universidades
                </Button>
              </Paper>
            ) : facultadesConCarreras.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <FilterAltOffIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                  No se encontraron carreras con los filtros seleccionados
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Intente modificar el término de búsqueda o restablecer los filtros de modalidad y nivel.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchCarrera('');
                    setModalidadFiltro('Todas');
                    setNivelFiltro('Todos');
                  }}
                >
                  Restablecer filtros
                </Button>
              </Paper>
            ) : (
              <Stack spacing={2.5}>
                {facultadesConCarreras.map((facultad, idx) => (
                  <Accordion
                    key={facultad.nombre}
                    defaultExpanded={idx === 0 || facultadesConCarreras.length <= 4}
                    elevation={0}
                    sx={{
                      borderRadius: '16px !important',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      overflow: 'hidden',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        px: 3,
                        py: 1.5,
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: 'center', flexWrap: 'wrap', width: '100%', mr: 2 }}
                      >
                        <AccountBalanceIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            flexGrow: 1,
                            fontSize: '1.05rem',
                          }}
                        >
                          {facultad.nombre}
                        </Typography>
                        <Chip
                          label={`${facultad.carreras.length} ${facultad.carreras.length === 1 ? 'carrera' : 'carreras'}`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        />
                      </Stack>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}>
                      {facultad.carreras.length === 0 ? (
                        <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Las carreras gestionadas o impartidas en articulación con esta unidad (ej. Administración de Empresas) se presentan unificadas en su facultad académica sustantiva, detallando todas sus modalidades disponibles (presencial y en línea).
                          </Typography>
                        </Paper>
                      ) : (
                        <Grid container spacing={2.5}>
                          {facultad.carreras.map((carrera) => {
                          const tieneEnlace =
                            carrera.enlace_oficial &&
                            carrera.enlace_oficial !== 'Información no disponible' &&
                            carrera.enlace_oficial.startsWith('http');

                          return (
                            <Grid size={{ xs: 12, md: 6 }} key={carrera.clave}>
                              <Card
                                elevation={0}
                                sx={{
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  borderRadius: 3,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  bgcolor: 'background.paper',
                                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                                  '&:hover': {
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                                    transform: 'translateY(-2px)',
                                    borderColor: 'primary.main',
                                  },
                                }}
                              >
                                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                  {/* Badges de Nivel, Área y Duración */}
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}
                                  >
                                    <Chip
                                      label={carrera.es_posgrado ? 'Posgrado / Cuarto Nivel' : 'Grado / Tercer Nivel'}
                                      size="small"
                                      color={carrera.es_posgrado ? 'secondary' : 'primary'}
                                      variant="outlined"
                                      sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                                    />
                                    {carrera.area_vocacional && (
                                      <Chip
                                        label={carrera.area_vocacional}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: '0.7rem',
                                          height: 22,
                                          borderColor: 'rgba(124, 58, 237, 0.3)',
                                          color: 'text.secondary',
                                        }}
                                      />
                                    )}
                                    <Chip
                                      icon={<AccessTimeIcon sx={{ fontSize: '0.85rem !important' }} />}
                                      label={`${carrera.duracion_semestres} semestres`}
                                      size="small"
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: '0.72rem',
                                        height: 22,
                                        bgcolor: 'action.hover',
                                      }}
                                    />
                                  </Stack>

                                  {/* Nombre de la Carrera Única y Favorito */}
                                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 800,
                                        color: 'text.primary',
                                        fontSize: '1.15rem',
                                        lineHeight: 1.3,
                                        flex: 1,
                                      }}
                                    >
                                      {carrera.nombre}
                                    </Typography>
                                    {onToggleFavorito && carrera.ofertas && carrera.ofertas[0] && (
                                      <IconButton
                                        size="small"
                                        onClick={() => onToggleFavorito(carrera.ofertas[0])}
                                        sx={{
                                          color: favoritosIds?.includes(carrera.ofertas[0].id) ? '#F59E0B' : 'text.disabled',
                                          '&:hover': { color: '#F59E0B' },
                                          ml: 1,
                                          p: 0.5,
                                        }}
                                        title={favoritosIds?.includes(carrera.ofertas[0].id) ? 'Quitar de favoritas' : 'Guardar en favoritas'}
                                      >
                                        {favoritosIds?.includes(carrera.ofertas[0].id) ? (
                                          <StarIcon sx={{ fontSize: 22 }} />
                                        ) : (
                                          <StarBorderIcon sx={{ fontSize: 22 }} />
                                        )}
                                      </IconButton>
                                    )}
                                  </Stack>

                                  {/* Título que otorga */}
                                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', mb: 2 }}>
                                    <BadgeIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                                        Título que otorga:
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                        {carrera.titulo_otorga}
                                      </Typography>
                                    </Box>
                                  </Stack>

                                  {/* SECCIÓN: UNIDADES ACADÉMICAS CORRESPONDIENTES (Si abarca más de una unidad) */}
                                  {carrera.facultadesDisponibles && carrera.facultadesDisponibles.length > 1 && (
                                    <Box
                                      sx={{
                                        mt: 1,
                                        mb: 1.5,
                                        p: 1.25,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(124, 58, 237, 0.08)',
                                        border: '1px solid',
                                        borderColor: 'rgba(124, 58, 237, 0.25)',
                                      }}
                                    >
                                      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                                        <AccountBalanceIcon sx={{ fontSize: 18, color: 'primary.main', mt: 0.2 }} />
                                        <Box>
                                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block' }}>
                                            UNIDADES ACADÉMICAS CORRESPONDIENTES:
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.82rem' }}>
                                            {carrera.facultadesDisponibles.join(' • ')}
                                          </Typography>
                                        </Box>
                                      </Stack>
                                    </Box>
                                  )}

                                  {/* SECCIÓN: MODALIDADES Y SEDES DISPONIBLES */}
                                  <Box
                                    sx={{
                                      mt: 1,
                                      mb: 2,
                                      p: 1.5,
                                      borderRadius: 2.5,
                                      bgcolor: 'action.hover',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                    }}
                                  >
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 800,
                                          color: 'text.secondary',
                                          textTransform: 'uppercase',
                                          letterSpacing: 0.5,
                                        }}
                                      >
                                        MODALIDADES Y SEDES DISPONIBLES
                                      </Typography>
                                    </Stack>

                                    <Stack spacing={1.2}>
                                      {carrera.ofertas.map((of) => {
                                        const ofSeleccionada = carrerasSeleccionadas.some((c) =>
                                          isSameOffer(c, of)
                                        );
                                        const refPuntaje =
                                          of.referencia_puntaje ||
                                          (of.puntaje_referencial
                                            ? `${of.puntaje_referencial} pts`
                                            : 'Referencia oficial');
                                        const ubicacion =
                                          of.campus || of.ciudad || of.canton || u.ciudad_matriz;

                                        return (
                                          <Paper
                                            key={of.codigo_oferta || of.id}
                                            variant="outlined"
                                            sx={{
                                              p: 1.25,
                                              borderRadius: 2,
                                              bgcolor: ofSeleccionada ? 'action.selected' : 'background.paper',
                                              borderColor: ofSeleccionada ? 'primary.main' : 'divider',
                                              display: 'flex',
                                              flexDirection: { xs: 'column', sm: 'row' },
                                              justifyContent: 'space-between',
                                              alignItems: { sm: 'center' },
                                              gap: 1.25,
                                            }}
                                          >
                                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                              <Stack
                                                direction="row"
                                                spacing={1}
                                                sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}
                                              >
                                                <Chip
                                                  label={of.modalidad}
                                                  size="small"
                                                  color={ofSeleccionada ? 'primary' : 'default'}
                                                  variant={ofSeleccionada ? 'filled' : 'outlined'}
                                                  sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                                                />
                                                {of.facultad && (
                                                  <Chip
                                                    label={of.facultad}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                      fontWeight: 600,
                                                      fontSize: '0.7rem',
                                                      height: 22,
                                                      borderColor: 'rgba(124, 58, 237, 0.25)',
                                                      color: 'text.secondary',
                                                      maxWidth: { xs: '100%', sm: 260 },
                                                    }}
                                                  />
                                                )}
                                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                                  <LocationOnIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                                                  <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.82rem' }}
                                                  >
                                                    {ubicacion}
                                                  </Typography>
                                                </Stack>
                                              </Stack>

                                              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                                <Typography variant="caption" color="text.secondary">
                                                  Puntaje ref: <strong>{refPuntaje}</strong>
                                                </Typography>
                                                {of.codigo_oferta && (
                                                  <Typography
                                                    variant="caption"
                                                    sx={{ color: 'text.disabled', fontFamily: 'monospace', fontSize: '0.7rem' }}
                                                  >
                                                    {of.codigo_oferta}
                                                  </Typography>
                                                )}
                                              </Stack>
                                            </Box>

                                            {/* Botones de Favorito y Comparador (Solo Estudiantes) */}
                                            {(!usuarioRole || usuarioRole === 'estudiante') && (
                                              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                                                {onToggleFavorito && (
                                                  <IconButton
                                                    size="small"
                                                    onClick={() => onToggleFavorito(of)}
                                                    sx={{
                                                      color: favoritosIds?.includes(of.id) ? '#F59E0B' : 'text.disabled',
                                                      '&:hover': { color: '#F59E0B' },
                                                      p: 0.5,
                                                    }}
                                                    title={favoritosIds?.includes(of.id) ? 'Quitar de favoritas' : 'Guardar en favoritas'}
                                                  >
                                                    {favoritosIds?.includes(of.id) ? (
                                                      <StarIcon sx={{ fontSize: 20 }} />
                                                    ) : (
                                                      <StarBorderIcon sx={{ fontSize: 20 }} />
                                                    )}
                                                  </IconButton>
                                                )}
                                                <Button
                                                  size="small"
                                                  variant={ofSeleccionada ? 'contained' : 'outlined'}
                                                  color={ofSeleccionada ? 'primary' : 'inherit'}
                                                  startIcon={
                                                    ofSeleccionada ? (
                                                      <CheckCircleIcon sx={{ fontSize: '1rem !important' }} />
                                                    ) : (
                                                      <CompareArrowsIcon sx={{ fontSize: '1rem !important' }} />
                                                    )
                                                  }
                                                  onClick={() => onToggleCarreraComparar(of)}
                                                  sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    flexShrink: 0,
                                                    alignSelf: { xs: 'flex-start', sm: 'center' },
                                                  }}
                                                >
                                                  {ofSeleccionada ? 'Seleccionada' : 'Comparar'}
                                                </Button>
                                              </Stack>
                                            )}
                                          </Paper>
                                        );
                                      })}
                                    </Stack>
                                  </Box>

                                  {/* Pie de tarjeta: Enlace oficial y fuente */}
                                  <Box sx={{ mt: 'auto', pt: 1 }}>
                                    <Divider sx={{ mb: 1.5 }} />
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '65%' }}>
                                        Fuente: {carrera.respaldo_facultad}
                                      </Typography>

                                      {tieneEnlace && (
                                        <Tooltip title="Abrir portal oficial en nueva pestaña">
                                          <Button
                                            size="small"
                                            variant="text"
                                            endIcon={<OpenInNewIcon sx={{ fontSize: '0.9rem !important' }} />}
                                            href={carrera.enlace_oficial}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                              fontSize: '0.8rem',
                                              fontWeight: 600,
                                              textTransform: 'none',
                                            }}
                                          >
                                            Portal oficial
                                          </Button>
                                        </Tooltip>
                                      )}
                                    </Stack>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}
          </>
        )}
      </Container>
    );
  }

  // ==========================================
  // RENDER: LISTADO DE UNIVERSIDADES
  // ==========================================
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado del Directorio */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AccountBalanceIcon />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Universidades e Instituciones Públicas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Directorio oficial de universidades y escuelas politécnicas públicas del Ecuador.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label="33 universidades públicas incorporadas"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
              />
              <Chip
                label="914 carreras de grado verificadas"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Barra de Filtros y Búsqueda */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          mb: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          {/* Búsqueda por nombre o sigla */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="input-buscar-universidad"
              fullWidth
              size="small"
              placeholder="Buscar por nombre o sigla (ej. UTMACH, UNEMI, EPN, UCE)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          {/* Filtro por provincia */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              id="select-provincia-universidad"
              fullWidth
              select
              size="small"
              label="Provincia"
              value={provinciaFiltro}
              onChange={(e) => {
                setProvinciaFiltro(e.target.value);
                setCiudadFiltro('Todas');
                setPage(1);
              }}
            >
              {provinciasDisponibles.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Filtro por ciudad */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              id="select-ciudad-universidad"
              fullWidth
              select
              size="small"
              label="Ciudad / Cantón"
              value={ciudadFiltro}
              onChange={(e) => {
                setCiudadFiltro(e.target.value);
                setPage(1);
              }}
            >
              {ciudadesDisponibles.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Resumen de resultados filtrados */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Typography variant="body2" color="text.secondary">
            Mostrando <strong>{universidadesFiltradas.length}</strong> instituciones públicas encontradas
            {search.trim() ? ` para «${search}»` : ''}
          </Typography>

          {(search.trim() || provinciaFiltro !== 'Todas' || ciudadFiltro !== 'Todas') && (
            <Button
              size="small"
              variant="text"
              onClick={handleResetFiltros}
              startIcon={<FilterAltOffIcon sx={{ fontSize: '1rem' }} />}
              sx={{ fontWeight: 600, color: 'text.secondary' }}
            >
              Limpiar filtros
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sin coincidencias */}
      {!loading && !error && universidadesFiltradas.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <FilterAltOffIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            No se encontraron universidades que coincidan
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mb: 3 }}>
            No hay instituciones públicas que correspondan con los términos de búsqueda o ubicación especificada.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleResetFiltros}
            sx={{ fontWeight: 700 }}
          >
            Restablecer búsqueda y ver todas
          </Button>
        </Paper>
      )}

      {/* Grilla de Tarjetas de Universidades */}
      {!loading && !error && universidadesFiltradas.length > 0 && (
        <>
          <Grid container spacing={3}>
            {universidadesPaginadas.map((univ) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={univ.id || univ.siglas}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header: Siglas y Tipo */}
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Chip
                        label={univ.siglas}
                        color="primary"
                        sx={{ fontWeight: 800, fontSize: '0.9rem', height: 26 }}
                      />
                      <Chip
                        label={univ.tipo || 'Pública'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.72rem', height: 22, color: 'text.secondary' }}
                      />
                    </Stack>

                    {/* Nombre Oficial */}
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 800,
                        color: 'text.primary',
                        fontSize: '1.1rem',
                        lineHeight: 1.35,
                        mb: 2,
                        minHeight: 58,
                      }}
                    >
                      {univ.nombre}
                    </Typography>

                    {/* Ubicación Sede Matriz */}
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', mb: 2 }}>
                      <LocationOnIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.1, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                          Sede Matriz
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {univ.ciudad_matriz}, {univ.provincia_matriz}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Métricas: Carreras únicas y Facultades o Catálogo pendiente */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap' }}>
                      {univ.total_carreras > 0 ? (
                        <>
                          <Chip
                            icon={<SchoolIcon sx={{ fontSize: '0.9rem !important' }} />}
                            label={`${univ.total_carreras} carreras`}
                            size="small"
                            sx={{ fontWeight: 600, bgcolor: 'action.hover' }}
                          />
                          {(univ.total_facultades || 0) > 0 && (
                            <Chip
                              icon={<AccountBalanceIcon sx={{ fontSize: '0.9rem !important' }} />}
                              label={`${univ.total_facultades} facultades`}
                              size="small"
                              sx={{ fontWeight: 600, bgcolor: 'action.hover' }}
                            />
                          )}
                        </>
                      ) : (
                        <Chip
                          icon={<AccessTimeIcon sx={{ fontSize: '0.9rem !important' }} />}
                          label="Catálogo pendiente de incorporar"
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: '0.78rem' }}
                        />
                      )}
                    </Stack>

                    {/* Botón Ver Universidad */}
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                      <Button
                        id={`btn-ver-universidad-${univ.siglas.toLowerCase()}`}
                        fullWidth
                        variant="contained"
                        onClick={() => handleSeleccionarUniversidad(univ)}
                        sx={{
                          fontWeight: 700,
                          py: 1.1,
                          borderRadius: 2.5,
                          background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #6D28D9 0%, #2E1065 100%)',
                          },
                        }}
                      >
                        Ver universidad
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Paginador */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 2, px: 1 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="medium"
                siblingCount={1}
                sx={{
                  '& .MuiPaginationItem-root': {
                    minWidth: { xs: 28, sm: 36 },
                    height: { xs: 28, sm: 36 },
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    margin: { xs: '0 1px', sm: '0 3px' },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};
