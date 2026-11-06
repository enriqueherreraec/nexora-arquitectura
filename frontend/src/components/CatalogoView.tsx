import React, { useState, useEffect } from 'react';
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
  IconButton,
  Pagination,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { catalogoService } from '../services/api';
import type { CarreraOferta } from '../services/api';

interface CatalogoViewProps {
  onCompararCarrera: (carrera: CarreraOferta) => void;
  favoritosIds?: number[];
  onToggleFavorito?: (carrera: CarreraOferta) => void;
  usuarioRole?: string;
}

const ITEMS_PER_PAGE = 16;

const AREAS = [
  'Todas',
  'Ingeniería y Tecnología',
  'Ciencias de la Salud',
  'Ciencias Administrativas y Económicas',
  'Derecho y Ciencias Sociales',
  'Educación y Pedagogía',
  'Ciencias Agropecuarias y Veterinaria',
  'Ciencias Naturales y Matemáticas',
  'Artes y Humanidades',
  'Arquitectura y Diseño',
  'Comunicación',
];

const MODALIDADES = ['Todas', 'Presencial', 'En Línea', 'Semipresencial', 'Híbrida'];
const NIVELES = ['Todos', 'Grado / Tercer Nivel', 'Posgrado / Cuarto Nivel'];

export const CatalogoView: React.FC<CatalogoViewProps> = ({
  onCompararCarrera,
  favoritosIds,
  onToggleFavorito,
  usuarioRole,
}) => {
  const [carreras, setCarreras] = useState<CarreraOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('Todas');
  const [modalidad, setModalidad] = useState('Todas');
  const [nivel, setNivel] = useState('Todos');

  const cargarOferta = () => {
    setLoading(true);
    setPage(1);
    catalogoService
      .getCarreras({
        area: area !== 'Todas' ? area : undefined,
        modalidad: modalidad !== 'Todas' ? modalidad : undefined,
        nivel: nivel !== 'Todos' ? nivel : undefined,
        search: search.trim() ? search.trim() : undefined,
      })
      .then((data) => setCarreras(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarOferta();
  }, [area, modalidad, nivel]);

  const handleBuscarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cargarOferta();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            <SchoolIcon />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.2rem' } }}>
            Oferta Universitaria Pública del Ecuador
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Explora la oferta académica de Universidades y Escuelas Politécnicas Públicas oficiales,
          sedes matrices, campus provinciales, puntajes de referencia y estados de nivelación.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.8 }}>
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '1rem !important' }} />}
            label="Catálogo nacional completo: 33 universidades públicas • 914 carreras de grado"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
          <Chip
            label="Consulta oficial CES / LOES 2026 verificada"
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Stack>
      </Box>

      {/* Barra de Filtros y Búsqueda */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box component="form" onSubmit={handleBuscarSubmit}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 3.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar carrera, universidad o sigla (ej. Software, EPN, UTMACH)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.8 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Área Vocacional"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  {AREAS.map((a) => (
                    <MenuItem key={a} value={a}>
                      {a}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2.2 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Modalidad"
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value)}
                >
                  {MODALIDADES.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2.3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Nivel Académico"
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                >
                  {NIVELES.map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 1.2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    fontWeight: 700,
                    height: 40,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                  }}
                >
                  Buscar
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Resultados de Carreras */}
      {loading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: '#7C3AED', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Consultando oferta académica pública...
          </Typography>
        </Box>
      ) : (() => {
        const totalPaginas = Math.ceil(carreras.length / ITEMS_PER_PAGE);
        const carrerasPaginadas = carreras.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

        return (
          <>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {carreras.length} carreras encontradas {totalPaginas > 1 && `(Página ${page} de ${totalPaginas})`}
              </Typography>
              {totalPaginas > 1 && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, carreras.length)} de {carreras.length}
                </Typography>
              )}
            </Stack>

            <Grid container spacing={3}>
              {carrerasPaginadas.map((c) => (
              <Grid key={c.id} size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, flex: 1, pr: 1 }}>
                        {c.nombre}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        {(!usuarioRole || usuarioRole === 'estudiante') && onToggleFavorito && (
                          <IconButton
                            size="small"
                            onClick={() => onToggleFavorito(c)}
                            sx={{
                              color: favoritosIds?.includes(c.id) ? '#F59E0B' : 'text.disabled',
                              '&:hover': { color: '#F59E0B' },
                            }}
                            title={favoritosIds?.includes(c.id) ? 'Quitar de favoritas' : 'Guardar en favoritas'}
                          >
                            {favoritosIds?.includes(c.id) ? <StarIcon sx={{ fontSize: 22 }} /> : <StarBorderIcon sx={{ fontSize: 22 }} />}
                          </IconButton>
                        )}
                        <Chip
                          label={c.siglas}
                          size="small"
                          sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 800 }}
                        />
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.6 }}>
                      {c.nivel_academico && (
                        <Chip
                          label={c.nivel_academico}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            bgcolor: c.es_posgrado ? 'rgba(124, 58, 237, 0.12)' : 'rgba(20, 184, 166, 0.12)',
                            color: c.es_posgrado ? '#7C3AED' : '#0D9488',
                          }}
                        />
                      )}
                      {c.estado_verificacion === 'Oferta de 2026 consultada' || (c.periodo_puntaje && (c.periodo_puntaje.includes('2026-1') || c.periodo_puntaje.includes('2026-2')) && !c.periodo_puntaje.includes('por confirmar')) ? (
                        <Chip
                          icon={<VerifiedIcon sx={{ fontSize: '0.85rem !important' }} />}
                          label="Vigencia verificada 2026"
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: 'rgba(20, 184, 166, 0.12)',
                            color: '#0D9488',
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<AccessTimeIcon sx={{ fontSize: '0.85rem !important' }} />}
                          label="Datos importados del catálogo"
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            borderColor: 'divider',
                            color: 'text.secondary',
                          }}
                        />
                      )}
                    </Stack>

                    <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 0.5 }}>
                      {c.institucion}
                    </Typography>

                    {c.facultad && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                        {c.facultad}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {c.descripcion}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Sede / Campus:
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
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
                          {c.modalidad} ({c.duracion_semestres} sem.)
                        </Typography>
                      </Grid>

                      {/* Puntaje Referencial */}
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Puntaje Referencial y Respaldo:
                        </Typography>
                        {c.referencia_puntaje && c.referencia_puntaje !== 'Sin dato oficial verificado' ? (
                          <Box sx={{ mt: 0.2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                              {c.referencia_puntaje}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {c.tipo_referencia || 'Referencial'} ({c.periodo_puntaje || 'Periodo verificado'})
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ mt: 0.2 }}>
                            <Chip
                              label="Sin dato oficial verificado"
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.68rem', height: 20, borderColor: 'divider', color: 'text.secondary' }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                              {c.tipo_referencia || 'No se calcula promedio sin datos comparables'}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {(!usuarioRole || usuarioRole === 'estudiante') && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CompareArrowsIcon />}
                          onClick={() => onCompararCarrera(c)}
                          sx={{ fontWeight: 600 }}
                        >
                          Comparar
                        </Button>
                      )}

                      <Button
                        size="small"
                        variant="text"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                        href={c.pagina_web || c.enlace_oficial}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
                      >
                        Sitio Oficial
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPaginas > 1 && (
            <Box sx={{ mt: 5, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <Pagination
                count={totalPaginas}
                page={page}
                onChange={(_, value) => {
                  setPage(value);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                color="primary"
                size="medium"
                shape="rounded"
                siblingCount={1}
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 700,
                    fontSize: { xs: '0.8rem', sm: '0.92rem' },
                    minWidth: { xs: 28, sm: 36 },
                    height: { xs: 28, sm: 36 },
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', px: 1 }}>
                Página {page} de {totalPaginas} — Mostrando {(page - 1) * ITEMS_PER_PAGE + 1} a {Math.min(page * ITEMS_PER_PAGE, carreras.length)} de {carreras.length} carreras vigentes
              </Typography>
            </Box>
          )}
        </>
      );
    })()}
  </Container>
  );
};
