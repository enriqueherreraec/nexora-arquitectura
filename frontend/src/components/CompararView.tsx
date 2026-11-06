import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import { NexoraDialog } from './NexoraDialog';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SwipeIcon from '@mui/icons-material/Swipe';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import type { CarreraOferta } from '../services/api';
import { isSameOffer } from '../services/api';

interface CompararViewProps {
  carrerasSeleccionadas: CarreraOferta[];
  recomendacionesEvaluacion: CarreraOferta[];
  tieneEvaluacion: boolean;
  onToggleCarrera: (carrera: CarreraOferta) => void;
  onRemoverCarrera: (carrera: CarreraOferta) => void;
  onLimpiarSeleccion: () => void;
  onIrACuestionario: () => void;
  onVolver: () => void;
}

export const CompararView: React.FC<CompararViewProps> = ({
  carrerasSeleccionadas,
  recomendacionesEvaluacion,
  tieneEvaluacion,
  onToggleCarrera,
  onRemoverCarrera,
  onLimpiarSeleccion,
  onIrACuestionario,
  onVolver,
}) => {
  const [carreraParaAgregar, setCarreraParaAgregar] = useState<string>('');
  const [modoSeleccionManual, setModoSeleccionManual] = useState<boolean>(false);
  const [avisoModal, setAvisoModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
  } | null>(null);

  // Ofertas no seleccionadas disponibles en las recomendaciones (exclusivamente activas)
  const ofertasDisponibles = recomendacionesEvaluacion.filter(
    (rec) => rec.es_vigente !== false && !carrerasSeleccionadas.some((sel) => isSameOffer(sel, rec))
  );

  const handleAgregarDesdeSelect = () => {
    if (!carreraParaAgregar) return;
    const encontrada = ofertasDisponibles.find(
      (c) => (c.codigo_oferta ? c.codigo_oferta === carreraParaAgregar : c.id.toString() === carreraParaAgregar)
    );
    if (encontrada) {
      if (carrerasSeleccionadas.length >= 4) {
        setAvisoModal({
          open: true,
          title: 'Límite de Comparación',
          message: 'Puedes comparar hasta un máximo de 4 carreras simultáneamente para asegurar una visualización clara y equilibrada de métricas.',
          severity: 'warning',
        });
        return;
      }
      onToggleCarrera(encontrada);
      setCarreraParaAgregar('');
    }
  };

  // CASO 1: El estudiante no tiene evaluaciones registradas
  if (!tieneEvaluacion || recomendacionesEvaluacion.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={onVolver}
          sx={{ mb: 3, color: 'text.secondary', fontWeight: 600 }}
        >
          Volver a la vista anterior
        </Button>

        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            textAlign: 'center',
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 30px rgba(56, 32, 100, 0.06)',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              bgcolor: 'secondary.main',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <QuizIcon sx={{ fontSize: 34 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
            Sin Evaluaciones Vocacionales Registradas
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
            El comparador de Nexora contrasta las carreras universitarias públicas personalizadas para ti
            a partir de tus resultados vocacionales. Para activar el comparador con tus opciones sugeridas,
            completa primero el cuestionario de orientación.
          </Typography>

          <Button
            id="btn-comenzar-cuestionario-comparar"
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={onIrACuestionario}
            sx={{
              px: 4,
              py: 1.4,
              fontWeight: 700,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
            }}
          >
            Comenzar Cuestionario Vocacional
          </Button>
        </Paper>
      </Container>
    );
  }

  // CASO 2: Hay evaluación pero menos de 2 carreras seleccionadas (o modo edición manual activo)
  const debeMostrarSelector = carrerasSeleccionadas.length < 2 || modoSeleccionManual;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado Principal */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={onVolver}
          sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}
        >
          Volver a la vista anterior
        </Button>

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
            <CompareArrowsIcon />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Comparador de Carreras Universitarias Públicas
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Contrasta ofertas académicas personalizadas de universidades y escuelas politécnicas públicas del Ecuador
          analizando afinidad vocacional, sedes, modalidades y puntajes referenciales de admisión.
        </Typography>
      </Box>

      {/* CASO 2.A: Pantalla de Selección guiada cuando hay menos de 2 carreras o se pide cambiar selección */}
      {debeMostrarSelector ? (
        <Box sx={{ mb: 4 }}>
          {/* Barra de Estado y Contador */}
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
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark', mb: 0.5 }}>
                  Selecciona entre 2 y 4 carreras de tus recomendaciones para comparar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Elige las opciones recomendadas de tu evaluación vocacional más reciente que deseas ver frente a frente.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
                <Chip
                  label={`${carrerasSeleccionadas.length} de 4 carreras seleccionadas`}
                  color={carrerasSeleccionadas.length >= 2 ? 'primary' : 'default'}
                  sx={{ fontWeight: 700, fontSize: '0.85rem' }}
                />

                <Button
                  id="btn-comparar-desde-selector"
                  variant="contained"
                  disabled={carrerasSeleccionadas.length < 2}
                  onClick={() => setModoSeleccionManual(false)}
                  startIcon={<CompareArrowsIcon />}
                  sx={{
                    fontWeight: 700,
                    px: 3,
                    background:
                      carrerasSeleccionadas.length >= 2
                        ? 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)'
                        : undefined,
                  }}
                >
                  Comparar seleccionadas
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Grid de Carreras Recomendadas para Selección */}
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
            Recomendaciones de tu última evaluación vocacional ({recomendacionesEvaluacion.length} disponibles):
          </Typography>

          <Grid container spacing={2.5}>
            {recomendacionesEvaluacion.map((c) => {
              const seleccionada = carrerasSeleccionadas.some((sel) => isSameOffer(sel, c));
              const facultadTexto = c.facultad ? c.facultad : 'Sin dato oficial verificado';
              const enlaceOficial = c.pagina_web || c.enlace_oficial;

              return (
                <Grid key={c.codigo_oferta || c.id} size={{ xs: 12, md: 6 }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 3,
                      border: seleccionada ? '2px solid' : '1px solid',
                      borderColor: seleccionada ? 'primary.main' : 'divider',
                      bgcolor: seleccionada ? 'rgba(124, 58, 237, 0.04)' : 'background.paper',
                      boxShadow: seleccionada ? '0 4px 18px rgba(124, 58, 237, 0.15)' : 'none',
                      transition: 'all 0.2s ease',
                      p: 2.5,
                      position: 'relative',
                    }}
                  >
                    <Box>
                      {seleccionada && (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
                          label="Añadida a comparación"
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 800, position: 'absolute', top: 14, right: 14 }}
                        />
                      )}

                      <Typography variant="h6" sx={{ fontWeight: 800, pr: seleccionada ? 14 : 0, mb: 0.5 }}>
                        {c.nombre}
                      </Typography>

                      <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 0.5 }}>
                        {c.institucion} ({c.siglas})
                      </Typography>

                      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: 1.5 }}>
                        <AccountBalanceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          {facultadTexto}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                        {c.descripcion}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Ubicación:
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <LocationOnIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                              {c.ciudad}, {c.provincia}
                            </Typography>
                          </Stack>
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Modalidad:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                            {c.modalidad} ({c.duracion_semestres || 'No disponible'} sem.)
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Interés Vocacional:
                          </Typography>
                          <Chip
                            label={`${c.afinidad_vocacional}% Afinidad`}
                            size="small"
                            sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 700, mt: 0.3 }}
                          />
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Admisión Referencial:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem', mt: 0.3 }}>
                            {c.referencia_puntaje && c.referencia_puntaje !== 'Sin dato oficial verificado'
                              ? c.referencia_puntaje
                              : 'Sin dato oficial verificado'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Botón de Selección */}
                    <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button
                        variant={seleccionada ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        startIcon={seleccionada ? <CheckCircleIcon /> : <CompareArrowsIcon />}
                        onClick={() => onToggleCarrera(c)}
                        disabled={!seleccionada && carrerasSeleccionadas.length >= 4}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '0.82rem',
                          background: seleccionada
                            ? 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)'
                            : undefined,
                        }}
                      >
                        {seleccionada ? 'Quitar de comparación' : 'Añadir a comparación'}
                      </Button>

                      {enlaceOficial ? (
                        <Button
                          size="small"
                          variant="text"
                          endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                          href={enlaceOficial}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}
                        >
                          Sitio Oficial
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No disponible
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ) : (
        /* CASO 2.B: Tabla Comparativa Completa (cuando hay al menos 2 carreras seleccionadas) */
        <Box>
          {/* Barra de Controles y Selector de Adición rápida */}
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                    label={`${carrerasSeleccionadas.length} de 4 carreras seleccionadas`}
                    color="primary"
                    sx={{ fontWeight: 800 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setModoSeleccionManual(true)}
                    sx={{ fontWeight: 700, textTransform: 'none' }}
                  >
                    Modificar selección desde recomendaciones
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlinedIcon />}
                    onClick={onLimpiarSeleccion}
                    sx={{ fontWeight: 700, textTransform: 'none' }}
                  >
                    Limpiar selección
                  </Button>
                </Stack>

                {/* Dropdown para agregar más carreras si hay < 4 y quedan disponibles */}
                {carrerasSeleccionadas.length < 4 && ofertasDisponibles.length > 0 && (
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{ alignItems: { xs: 'stretch', sm: 'center' }, width: { xs: '100%', md: 'auto' } }}
                  >
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 260 } }}>
                      <InputLabel id="select-agregar-recomendacion-label">
                        Añadir otra recomendación ({carrerasSeleccionadas.length}/4)
                      </InputLabel>
                      <Select
                        labelId="select-agregar-recomendacion-label"
                        value={carreraParaAgregar}
                        label={`Añadir otra recomendación (${carrerasSeleccionadas.length}/4)`}
                        onChange={(e) => setCarreraParaAgregar(e.target.value)}
                      >
                        {ofertasDisponibles.map((c) => {
                          const keyVal = c.codigo_oferta || c.id.toString();
                          return (
                            <MenuItem key={keyVal} value={keyVal}>
                              {c.nombre} — {c.siglas} ({c.ciudad})
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!carreraParaAgregar}
                      onClick={handleAgregarDesdeSelect}
                      sx={{
                        fontWeight: 700,
                        py: 0.9,
                        whiteSpace: 'nowrap',
                        background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                      }}
                    >
                      Añadir
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Aviso para celular: desplazamiento horizontal táctil */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              alignItems: 'center',
              gap: 1,
              mb: 1.5,
              color: 'text.secondary',
              fontSize: '0.78rem',
            }}
          >
            <SwipeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <span>Desliza horizontalmente dentro de la tabla para comparar todas las carreras</span>
          </Box>

          {/* Tabla Comparativa con Adaptación Móvil */}
          <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
              <Table sx={{ minWidth: { xs: 560, sm: 750 } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'secondary.main' }}>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        width: '26%',
                        minWidth: 150,
                        color: 'primary.dark',
                        fontSize: '0.88rem',
                        py: 2,
                        position: 'sticky',
                        left: 0,
                        bgcolor: 'secondary.main',
                        zIndex: 2,
                        boxShadow: '2px 0 6px rgba(0,0,0,0.06)',
                      }}
                    >
                      Criterio Comparativo
                    </TableCell>
                    {carrerasSeleccionadas.map((c) => (
                      <TableCell
                        key={c.codigo_oferta || c.id}
                        align="center"
                        sx={{
                          fontWeight: 800,
                          width: `${76 / carrerasSeleccionadas.length}%`,
                          py: 2,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {c.nombre}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
                          {c.siglas} • {c.ciudad}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlinedIcon sx={{ fontSize: 14 }} />}
                          onClick={() => onRemoverCarrera(c)}
                          sx={{ fontSize: '0.72rem', mt: 0.8, py: 0.2, fontWeight: 700 }}
                        >
                          Quitar
                        </Button>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {/* Institución */}
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', position: 'sticky', left: 0, zIndex: 1, minWidth: 150, boxShadow: '2px 0 6px rgba(0,0,0,0.06)' }}>
                      Institución y Siglas
                    </TableCell>
                    {carrerasSeleccionadas.map((c) => (
                      <TableCell key={c.codigo_oferta || c.id} align="center">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {c.institucion || 'No disponible'} ({c.siglas || 'IES'})
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Facultad real */}
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', position: 'sticky', left: 0, zIndex: 1, minWidth: 150, boxShadow: '2px 0 6px rgba(0,0,0,0.06)' }}>
                      Facultad / Unidad Académica
                    </TableCell>
                    {carrerasSeleccionadas.map((c) => (
                      <TableCell key={c.codigo_oferta || c.id} align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: c.facultad ? 'text.primary' : 'text.secondary',
                            fontStyle: c.facultad ? 'normal' : 'italic',
                          }}
                        >
                          {c.facultad ? c.facultad : 'Sin dato oficial verificado'}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Campus y Ubicación */}
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', position: 'sticky', left: 0, zIndex: 1, minWidth: 150, boxShadow: '2px 0 6px rgba(0,0,0,0.06)' }}>
                      Campus y Ubicación
                    </TableCell>
                    {carrerasSeleccionadas.map((c) => (
                      <TableCell key={c.codigo_oferta || c.id} align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {c.campus || 'Campus Matriz'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.ciudad}, {c.provincia}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Modalidad */}
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', position: 'sticky', left: 0, zIndex: 1, minWidth: 150, boxShadow: '2px 0 6px rgba(0,0,0,0.06)' }}>
                      Modalidad
                    </TableCell>
                    {carrerasSeleccionadas.map((c) => (
                      <TableCell key={c.codigo_oferta || c.id} align="center">
                        <Chip
                          label={c.modalidad || 'No disponible'}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Duración */}
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', position: 'sticky', left: 0, zIndex: 1, minWidth: 150, boxShadow: '2px 0 6px rgba(0,0,0,0.06)' }}>
                      Duración Estimada
                    </TableCell>
                    {carrerasSeleccionadas.map((c) => (
                      <TableCell key={c.codigo_oferta || c.id} align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {c.duracion_semestres
                            ? `${c.duracion_semestres} semestres lectivos`
                            : 'No disponible'}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Interés Vocacional (Afinidad por Área) */}
                  <TableRow hover sx={{ bgcolor: 'rgba(124, 58, 237, 0.02)' }}>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', position: 'sticky', left: 0, zIndex: 1, minWidth: 150, boxShadow: '2px 0 6px rgba(0,0,0,0.06)' }}>
                      <Box>
                        <span>Índice de Interés Vocacional</span>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 400 }}>
                          Afinidad calculada en test
                        </Typography>
                      </Box>
                    </TableCell>
                    {carrerasSeleccionadas.map((c) => (
                      <TableCell key={c.codigo_oferta || c.id} align="center">
                        <Chip
                          label={
                            c.afinidad_vocacional !== undefined
                              ? `${c.afinidad_vocacional}% de Afinidad`
                              : 'Calculada en test'
                          }
                          size="small"
                          sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 800, mb: 0.5 }}
                        />
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                          Área: {c.area_vocacional || 'No disponible'}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Puntaje Referencial de Admisión (SENESCYT / IES) */}
                  <TableRow hover sx={{ bgcolor: 'rgba(20, 184, 166, 0.02)' }}>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', position: 'sticky', left: 0, zIndex: 1, minWidth: 150, boxShadow: '2px 0 6px rgba(0,0,0,0.06)' }}>
                      <Box>
                        <span>Puntaje Referencial de Admisión</span>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 400 }}>
                          Corte oficial / SENESCYT
                        </Typography>
                      </Box>
                    </TableCell>
                    {carrerasSeleccionadas.map((c) => {
                      const tienePuntaje =
                        c.referencia_puntaje && c.referencia_puntaje !== 'Sin dato oficial verificado';

                      return (
                        <TableCell key={c.codigo_oferta || c.id} align="center">
                          {tienePuntaje ? (
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                {c.referencia_puntaje}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {c.tipo_referencia || 'No disponible'} ({c.periodo_puntaje || 'Periodo verificado'})
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                Fuente: {c.puntaje_fuente || 'No disponible'}
                              </Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Chip
                                label="Sin dato oficial verificado"
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20, borderColor: 'divider', color: 'text.secondary' }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                                {c.tipo_referencia || 'No disponible'}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* Tiempo Estimado de Traslado */}
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', position: 'sticky', left: 0, zIndex: 1, minWidth: 150, boxShadow: '2px 0 6px rgba(0,0,0,0.06)' }}>
                      Tiempo Estimado de Viaje
                    </TableCell>
                    {carrerasSeleccionadas.map((c) => (
                      <TableCell key={c.codigo_oferta || c.id} align="center">
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {c.tiempo_traslado || 'No disponible'}
                          </Typography>
                        </Stack>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Enlace Oficial */}
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper', position: 'sticky', left: 0, zIndex: 1, minWidth: 150, boxShadow: '2px 0 6px rgba(0,0,0,0.06)' }}>
                      Enlace Oficial de la Oferta
                    </TableCell>
                    {carrerasSeleccionadas.map((c) => {
                      const link = c.pagina_web || c.enlace_oficial;

                      return (
                        <TableCell key={c.codigo_oferta || c.id} align="center">
                          {link ? (
                            <Button
                              size="small"
                              variant="outlined"
                              endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                            >
                              Sitio Oficial
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No disponible
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Aclaración Metodológica y Ética */}
          <Alert severity="info" sx={{ borderRadius: 2.5 }}>
            <strong>Distinción importante:</strong> El <em>Índice de Interés Vocacional</em> mide tu grado de concordancia reflexiva con cada campo del conocimiento según tus respuestas en el cuestionario. Es totalmente independiente del <em>Puntaje Referencial de Admisión</em>, el cual recopila cortes históricos oficiales de la SENESCYT y las IES y no constituye una promesa o garantía de asignación de cupos.
          </Alert>
        </Box>
      )}

      {avisoModal && (
        <NexoraDialog
          open={avisoModal.open}
          onClose={() => setAvisoModal(null)}
          title={avisoModal.title}
          message={avisoModal.message}
          severity={avisoModal.severity || 'warning'}
          primaryButtonText="Entendido"
        />
      )}
    </Container>
  );
};
