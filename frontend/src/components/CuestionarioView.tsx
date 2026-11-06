import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Collapse,
  Divider,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { cuestionarioService, evaluacionesService } from '../services/api';
import type {
  PreguntaVocacional,
  OpcionLikert,
  EvaluacionResultado,
} from '../services/api';

interface CuestionarioViewProps {
  onEvaluacionCompletada: (resultado: EvaluacionResultado) => void;
  onCancelar: () => void;
}

const DESCRIPCIONES_LIKERT_DEFAULT: Record<number, string> = {
  0: 'No me gustaría realizar esta actividad.',
  1: 'Me interesa poco.',
  2: 'Me interesa, pero todavía tengo dudas.',
  3: 'Me gustaría aprender a realizarla.',
  4: 'Me entusiasma aprenderla y dedicarle tiempo.',
};

export const CuestionarioView: React.FC<CuestionarioViewProps> = ({
  onEvaluacionCompletada,
  onCancelar,
}) => {
  const [preguntas, setPreguntas] = useState<PreguntaVocacional[]>([]);
  const [opciones, setOpciones] = useState<OpcionLikert[]>([]);
  const [instrucciones, setInstrucciones] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Página actual de preguntas (1 a 4). 5 preguntas por página.
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [modoRevision, setModoRevision] = useState<boolean>(false);

  // Mapeo estable de respuestas { preguntaId: valor (0..4) }
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});

  // Control independiente de visibilidad de ejemplos por pregunta { preguntaId: boolean }
  const [ejemplosVisibles, setEjemplosVisibles] = useState<Record<number, boolean>>({});

  // Indicador de intento de avance con preguntas pendientes para resaltarlas
  const [alertaPendientes, setAlertaPendientes] = useState<boolean>(false);

  // Referencias a las tarjetas de preguntas para scroll automático a la primera pendiente
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    cuestionarioService
      .getPreguntas()
      .then((data) => {
        // Aseguramos que las preguntas respeten el orden de presentación (1..20)
        const ordenadas = [...data.preguntas].sort(
          (a, b) => (a.orden_presentacion || a.id) - (b.orden_presentacion || b.id)
        );
        setPreguntas(ordenadas);
        setOpciones(data.opciones || []);
        setInstrucciones(data.instrucciones || '');
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Error al cargar el cuestionario vocacional.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Al cambiar de página, limpiar advertencia de pendientes y subir el scroll suavemente
  useEffect(() => {
    setAlertaPendientes(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [paginaActual, modoRevision]);

  const handleSeleccionarOpcion = (preguntaId: number, valor: number) => {
    // Actualización inmediata del estado visual sin perder el contexto de scroll
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: valor,
    }));
  };

  const handleToggleEjemplo = (preguntaId: number) => {
    // Abrir o cerrar el ejemplo no cambia la respuesta ni cuenta como una elección
    setEjemplosVisibles((prev) => ({
      ...prev,
      [preguntaId]: !prev[preguntaId],
    }));
  };

  // Cálculo del progreso
  const totalPreguntas = preguntas.length > 0 ? preguntas.length : 20;
  // Respuestas reales seleccionadas (el valor 0 cuenta como respuesta válida)
  const respondidasCount = Object.keys(respuestas).length;
  // Cada nueva respuesta equivale exactamente al 5% (20 preguntas * 5% = 100%)
  const progresoPorcentaje = Math.min(100, respondidasCount * 5);
  const todasRespondidas = respondidasCount === totalPreguntas;

  // Preguntas de la página actual (5 preguntas por página)
  const preguntasPorPagina = 5;
  const totalPaginas = 4;
  const indiceInicio = (paginaActual - 1) * preguntasPorPagina;
  const preguntasPaginaActual = preguntas.slice(indiceInicio, indiceInicio + preguntasPorPagina);

  // Comprobar si las 5 preguntas de la página actual están respondidas
  const preguntasPendientesPagina = preguntasPaginaActual.filter(
    (p) => respuestas[p.id] === undefined
  );
  const paginaCompleta = preguntasPendientesPagina.length === 0;

  const handleSiguiente = () => {
    if (!paginaCompleta) {
      setAlertaPendientes(true);
      // Hacer scroll suave hacia la primera pregunta pendiente de la página
      const primeraPendiente = preguntasPendientesPagina[0];
      if (primeraPendiente && cardRefs.current[primeraPendiente.id]) {
        cardRefs.current[primeraPendiente.id]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
      return;
    }

    setAlertaPendientes(false);
    if (paginaActual < totalPaginas) {
      setPaginaActual((prev) => prev + 1);
    } else {
      // Al completar la página 4, pasar al modo revisión
      setModoRevision(true);
    }
  };

  const handleAnterior = () => {
    setAlertaPendientes(false);
    if (modoRevision) {
      setModoRevision(false);
      setPaginaActual(totalPaginas);
    } else if (paginaActual > 1) {
      setPaginaActual((prev) => prev - 1);
    }
  };

  const handleIrAPagina = (paginaNum: number) => {
    setModoRevision(false);
    setPaginaActual(paginaNum);
  };

  const handleSubmit = async () => {
    if (!todasRespondidas) {
      setErrorMsg(`Por favor responde las ${totalPreguntas} preguntas antes de finalizar.`);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: Record<string, number> = {};
      Object.entries(respuestas).forEach(([k, v]) => {
        payload[k] = v;
      });

      const res = await evaluacionesService.submitEvaluacion(payload);
      onEvaluacionCompletada(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la evaluación vocacional.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ color: '#7C3AED', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Cargando reactivos vocacionales de Nexora...
        </Typography>
      </Container>
    );
  }

  // Comprobar estado de cada etapa (1 a 4)
  const etapasEstado = [1, 2, 3, 4].map((numEtapa) => {
    const idxInicioEtapa = (numEtapa - 1) * 5;
    const pregsEtapa = preguntas.slice(idxInicioEtapa, idxInicioEtapa + 5);
    const respondidasEtapa = pregsEtapa.filter((p) => respuestas[p.id] !== undefined).length;
    const esCompleta = pregsEtapa.length > 0 && respondidasEtapa === pregsEtapa.length;
    const esActual = !modoRevision && paginaActual === numEtapa;
    return {
      numEtapa,
      respondidasEtapa,
      esCompleta,
      esActual,
    };
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Encabezado del cuestionario */}
      <Box sx={{ mb: 3 }}>
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
            <QuizIcon />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Cuestionario de Intereses Vocacionales
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          20 actividades distribuidas en 4 páginas de 5 preguntas • Opciones de respuesta claras • Reflexión sincera sobre tus preferencias
        </Typography>
      </Box>

      {/* Instrucciones para el estudiante */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon sx={{ color: 'primary.main' }} />}
        sx={{
          mb: 3,
          borderRadius: 3,
          bgcolor: 'secondary.main',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'primary.dark' }}>
          Instrucciones para el estudiante:
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.6, fontStyle: 'italic' }}>
          {instrucciones
            ? `“${instrucciones}”`
            : '“Imagina que puedes aprender a realizar cada actividad, aunque todavía no tengas experiencia, indica cuánto te gustaría participar, no hay respuestas correctas o incorrectas, responde según tus intereses personales y no según lo que otras personas esperan de ti”.'}
        </Typography>
      </Alert>

      {/* 3. BARRA DE PROGRESO CON IDENTIDAD NEXORA */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3.5,
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Fila superior de información: Página, Respondidas y Porcentaje */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1,
            mb: 1.8,
          }}
        >
          <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
            <Chip
              label={modoRevision ? 'Revisión final' : `Página ${paginaActual} de ${totalPaginas}`}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                fontSize: '0.82rem',
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {respondidasCount} de {totalPreguntas} preguntas respondidas
            </Typography>
          </Stack>

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: 'primary.main',
              fontSize: '1rem',
            }}
          >
            {progresoPorcentaje}% completado
          </Typography>
        </Stack>

        {/* Barra de progreso visual con extremos redondeados, fondo lavanda suave y degradado morado */}
        <Box
          sx={{
            width: '100%',
            height: 12,
            borderRadius: '999px',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.2)' : '#EDE9FE'),
            p: '2px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${progresoPorcentaje}%`,
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #7C3AED 0%, #382064 100%)',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </Box>

        {/* 4 Indicadores de etapa visuales (Etapas 1 a 4) */}
        <Box sx={{ mt: 2.2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: { xs: 0.8, sm: 1.5 } }}>
          {etapasEstado.map((etapa) => {
            const isClickable = !submitting;

            return (
              <Box
                key={etapa.numEtapa}
                onClick={() => isClickable && handleIrAPagina(etapa.numEtapa)}
                sx={{
                  p: { xs: 0.8, sm: 1.2 },
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  border: '1.5px solid',
                  borderColor: etapa.esActual
                    ? '#7C3AED'
                    : etapa.esCompleta
                    ? '#10B981'
                    : 'divider',
                  bgcolor: etapa.esActual
                    ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.25)' : '#EDE9FE')
                    : etapa.esCompleta
                    ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)')
                    : 'transparent',
                  '&:hover': {
                    borderColor: '#7C3AED',
                    transform: isClickable ? 'translateY(-2px)' : 'none',
                  },
                }}
              >
                <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', alignItems: 'center', mb: 0.2 }}>
                  {etapa.esCompleta ? (
                    <CheckCircleIcon sx={{ fontSize: { xs: 13, sm: 15 }, color: '#10B981' }} />
                  ) : etapa.esActual ? (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#7C3AED',
                        animation: 'pulse 1.8s infinite',
                      }}
                    />
                  ) : null}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: etapa.esActual ? 800 : 700,
                      color: etapa.esActual
                        ? 'primary.main'
                        : etapa.esCompleta
                        ? '#059669'
                        : 'text.secondary',
                      fontSize: { xs: '0.72rem', sm: '0.8rem' },
                    }}
                  >
                    Pág. {etapa.numEtapa}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontSize: { xs: '0.62rem', sm: '0.72rem' },
                    color: etapa.esCompleta
                      ? '#059669'
                      : etapa.esActual
                      ? 'primary.main'
                      : 'text.secondary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                    {etapa.esCompleta ? 'Lista' : `${etapa.respondidasEtapa}/5`}
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {etapa.esCompleta ? 'Completada' : `${etapa.respondidasEtapa}/5 resp.`}
                  </Box>
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {alertaPendientes && (
        <Alert
          severity="warning"
          icon={<WarningAmberIcon />}
          sx={{ mb: 3, borderRadius: 2.5 }}
        >
          Para continuar debes responder las 5 preguntas de esta página ({preguntasPendientesPagina.length}{' '}
          {preguntasPendientesPagina.length === 1 ? 'pregunta pendiente' : 'preguntas pendientes'}). Recuerda que la opción «Nada» (0 puntos) es una respuesta válida.
        </Alert>
      )}

      {/* VISTA 1: CINCO PREGUNTAS POR PÁGINA (PÁGINAS 1 A 4) */}
      {!modoRevision && (
        <Stack spacing={3} sx={{ mb: 4 }}>
          {preguntasPaginaActual.map((pregunta, indexEnPagina) => {
            const numeroConsecutivo = indiceInicio + indexEnPagina + 1;
            const valorSeleccionado = respuestas[pregunta.id];
            const estaRespondida = valorSeleccionado !== undefined;
            const esPendienteYHuboAlerta = alertaPendientes && !estaRespondida;
            const ejemploAbierto = Boolean(ejemplosVisibles[pregunta.id]);

            return (
              <Card
                key={pregunta.id}
                ref={(el) => {
                  cardRefs.current[pregunta.id] = el;
                }}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  border: '1.5px solid',
                  borderColor: esPendienteYHuboAlerta
                    ? '#F59E0B'
                    : estaRespondida
                    ? 'rgba(124, 58, 237, 0.35)'
                    : 'divider',
                  borderRadius: 3.5,
                  bgcolor: esPendienteYHuboAlerta
                    ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.04)')
                    : 'background.paper',
                  boxShadow: estaRespondida
                    ? '0 4px 20px rgba(124, 58, 237, 0.06)'
                    : 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                }}
              >
                <CardContent sx={{ p: '0 !important' }}>
                  {/* Encabezado de la tarjeta: Número consecutivo 1..20 y Estado (el área NO aparece) */}
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={`Pregunta ${numeroConsecutivo} de ${totalPreguntas}`}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: 'primary.main',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                      }}
                    />

                    {estaRespondida ? (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: '#10B981' }} />}
                        label="Respondida"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(16, 185, 129, 0.12)',
                          color: '#059669',
                          fontWeight: 700,
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      />
                    ) : (
                      <Chip
                        label={esPendienteYHuboAlerta ? '⚠️ Respuesta requerida' : 'Pendiente'}
                        size="small"
                        sx={{
                          color: esPendienteYHuboAlerta ? '#B45309' : 'text.secondary',
                          borderColor: esPendienteYHuboAlerta ? '#F59E0B' : 'divider',
                          borderWidth: 1,
                          borderStyle: 'solid',
                          bgcolor: esPendienteYHuboAlerta ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                          fontWeight: esPendienteYHuboAlerta ? 800 : 500,
                        }}
                      />
                    )}
                  </Stack>

                  {/* Texto completo de la pregunta (sin mostrar el área interna) */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      lineHeight: 1.5,
                      color: 'text.primary',
                    }}
                  >
                    {pregunta.pregunta}
                  </Typography>

                  {/* Botón «Necesito un ejemplo» */}
                  <Box sx={{ mb: 2.5 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LightbulbOutlinedIcon />}
                      onClick={() => handleToggleEjemplo(pregunta.id)}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        borderColor: ejemploAbierto ? 'primary.main' : 'divider',
                        color: ejemploAbierto ? 'primary.main' : 'text.secondary',
                        bgcolor: ejemploAbierto
                          ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.15)' : '#EDE9FE')
                          : 'transparent',
                        '&:hover': {
                          borderColor: 'primary.main',
                          color: 'primary.main',
                        },
                      }}
                    >
                      {ejemploAbierto ? 'Ocultar ejemplo' : 'Necesito un ejemplo'}
                    </Button>

                    <Collapse in={ejemploAbierto}>
                      <Paper
                        variant="outlined"
                        sx={{
                          mt: 1.5,
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#211A2D' : '#F7F7FC'),
                          borderColor: 'primary.light',
                          borderLeft: '4px solid',
                          borderLeftColor: '#7C3AED',
                        }}
                      >
                        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'flex-start' }}>
                          <AutoAwesomeIcon sx={{ fontSize: 18, color: '#7C3AED', mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block' }}>
                              Ejemplo explicativo de la actividad (no altera ni cuenta como respuesta):
                            </Typography>
                            <Typography variant="body2" sx={{ lineHeight: 1.55, color: 'text.primary', mt: 0.4 }}>
                              {pregunta.ejemplo || pregunta.contexto || 'Imagina realizar tareas prácticas relacionadas con esta temática.'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Collapse>
                  </Box>

                  <Divider sx={{ mb: 2.5 }} />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 1.5, fontWeight: 700, letterSpacing: '0.02em' }}
                  >
                    Selecciona tu nivel de interés:
                  </Typography>

                  {/* 4. BOTONES DE RESPUESTA CORREGIDOS (Fondo #7C3AED, Todo Texto #FFFFFF, Marca Visible) */}
                  <Stack spacing={1.2}>
                    {opciones.map((opc) => {
                      const isSelected = valorSeleccionado === opc.valor;
                      const desc = opc.descripcion || DESCRIPCIONES_LIKERT_DEFAULT[opc.valor] || '';

                      return (
                        <Button
                          key={opc.valor}
                          fullWidth
                          variant="outlined"
                          onClick={() => handleSeleccionarOpcion(pregunta.id, opc.valor)}
                          sx={{
                            py: 1.35,
                            px: 2,
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            borderRadius: 2.5,
                            borderWidth: isSelected ? '2px !important' : '1.5px',
                            borderStyle: 'solid',
                            borderColor: isSelected
                              ? '#7C3AED !important'
                              : (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'),
                            bgcolor: isSelected
                              ? '#7C3AED !important'
                              : (theme) => (theme.palette.mode === 'dark' ? '#1B1525' : '#FFFFFF'),
                            color: isSelected ? '#FFFFFF !important' : 'text.primary',
                            boxShadow: isSelected
                              ? '0 4px 16px rgba(124, 58, 237, 0.35)'
                              : 'none',
                            transition: 'all 0.18s ease-in-out',
                            // OBLIGA A TODO ELEMENTO DESCENDIENTE (negrita, textos, números, íconos) A SER BLANCO #FFFFFF AL ESTAR SELECCIONADO
                            '&, & *, & .MuiTypography-root, & b, & strong, & span, & p, & svg': {
                              color: isSelected ? '#FFFFFF !important' : undefined,
                            },
                            '&:hover': {
                              bgcolor: isSelected
                                ? '#6D28D9 !important'
                                : (theme) => (theme.palette.mode === 'dark' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.08)'),
                              borderColor: '#7C3AED !important',
                              '&, & *, & .MuiTypography-root, & b, & strong': {
                                color: isSelected ? '#FFFFFF !important' : undefined,
                              },
                            },
                            '&:focus-visible': {
                              outline: '3px solid #C084FC',
                              outlineOffset: '2px',
                            },
                          }}
                        >
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', width: '100%' }}>
                            {/* Marca de selección visible (Círculo con marca de selección) */}
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: isSelected
                                  ? '#FFFFFF !important'
                                  : (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'),
                                bgcolor: isSelected ? '#FFFFFF' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                mt: 0.3,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {isSelected ? (
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: '#7C3AED !important',
                                  }}
                                />
                              ) : null}
                            </Box>

                            {/* Contenido textual de la opción */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 0.2, sm: 1 }}
                                sx={{ alignItems: { xs: 'flex-start', sm: 'baseline' } }}
                              >
                                <Typography
                                  component="span"
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '0.92rem', sm: '0.96rem' },
                                    color: isSelected ? '#FFFFFF !important' : 'text.primary',
                                  }}
                                >
                                  {opc.etiqueta}
                                </Typography>
                                <Typography
                                  component="span"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.78rem', sm: '0.8rem' },
                                    color: isSelected ? 'rgba(255, 255, 255, 0.9) !important' : 'text.secondary',
                                  }}
                                >
                                  ({opc.valor} {opc.valor === 1 ? 'punto' : 'puntos'})
                                </Typography>
                              </Stack>
                              <Typography
                                component="div"
                                sx={{
                                  fontSize: { xs: '0.82rem', sm: '0.85rem' },
                                  lineHeight: 1.45,
                                  color: isSelected ? '#FFFFFF !important' : 'text.secondary',
                                  mt: 0.3,
                                  wordBreak: 'break-word',
                                }}
                              >
                                {desc}
                              </Typography>
                            </Box>
                          </Stack>
                        </Button>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* VISTA 2: REVISIÓN DE RESPUESTAS (PÁGINA 4 → RESUMEN EDITABLE DE LAS 20 ELECCIONES) */}
      {modoRevision && (
        <Card
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            mb: 4,
            borderRadius: 3.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: '0 !important' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '10px',
                  bgcolor: 'secondary.main',
                  color: 'primary.main',
                  display: 'flex',
                }}
              >
                <AssignmentTurnedInIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Resumen de tus 20 Respuestas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revisa y edita tus elecciones libremente antes de calcular tu afinidad vocacional y recomendaciones de universidades públicas.
                </Typography>
              </Box>
            </Stack>

            {!todasRespondidas && (
              <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
                Faltan {totalPreguntas - respondidasCount} preguntas por responder. Es necesario responder las 20 preguntas para emitir tus resultados oficiales.
              </Alert>
            )}

            <Stack spacing={2} sx={{ mt: 3 }}>
              {preguntas.map((p, idx) => {
                const numConsecutivo = idx + 1;
                const val = respuestas[p.id];
                const contestada = val !== undefined;
                const opcion = opciones.find((o) => o.valor === val);

                return (
                  <Paper
                    key={p.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      borderColor: contestada ? 'divider' : '#F59E0B',
                      bgcolor: contestada ? 'background.paper' : 'rgba(245, 158, 11, 0.05)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 1.5,
                        mb: 1.5,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                          <Chip
                            label={`#${numConsecutivo}`}
                            size="small"
                            sx={{ fontWeight: 800, bgcolor: 'primary.main', color: '#FFFFFF', fontSize: '0.75rem' }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
                            {p.pregunta}
                          </Typography>
                        </Stack>
                        {contestada ? (
                          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block' }}>
                            Respuesta actual: {opcion?.etiqueta} ({val} {val === 1 ? 'punto' : 'puntos'}) — {opcion?.descripcion || DESCRIPCIONES_LIKERT_DEFAULT[val]}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 800 }}>
                            ⚠️ Sin responder (requerida)
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    {/* Selector interactivo editable directo en la revisión para máxima comodidad */}
                    <Box sx={{ pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
                        Modificar respuesta:
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {opciones.map((opc) => {
                          const estaActivo = val === opc.valor;
                          return (
                            <Button
                              key={opc.valor}
                              size="small"
                              variant={estaActivo ? 'contained' : 'outlined'}
                              onClick={() => handleSeleccionarOpcion(p.id, opc.valor)}
                              sx={{
                                py: 0.5,
                                px: 1.5,
                                fontSize: '0.78rem',
                                fontWeight: estaActivo ? 800 : 600,
                                textTransform: 'none',
                                borderRadius: 2,
                                bgcolor: estaActivo ? '#7C3AED !important' : 'transparent',
                                color: estaActivo ? '#FFFFFF !important' : 'text.primary',
                                borderColor: estaActivo ? '#7C3AED !important' : 'divider',
                                '&, & *, & .MuiTypography-root, & b, & strong, & span': {
                                  color: estaActivo ? '#FFFFFF !important' : undefined,
                                },
                                '&:hover': {
                                  bgcolor: estaActivo ? '#6D28D9 !important' : 'rgba(124, 58, 237, 0.08)',
                                  borderColor: '#7C3AED',
                                },
                              }}
                            >
                              {estaActivo && <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5, color: '#FFFFFF !important' }} />}
                              {opc.etiqueta} ({opc.valor})
                            </Button>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* BARRA DE NAVEGACIÓN INFERIOR (ANTERIOR, SIGUIENTE, REVISAR RESPUESTAS, VER MIS RESULTADOS) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {/* Botón Cancelar (solo si en página 1 y sin respuestas) o Anterior */}
          {paginaActual === 1 && !modoRevision ? (
            <Button
              variant="outlined"
              fullWidth
              onClick={onCancelar}
              sx={{ fontWeight: 600, color: 'text.secondary', borderColor: 'divider', py: 1.1 }}
            >
              Cancelar
            </Button>
          ) : (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ArrowBackIcon />}
              onClick={handleAnterior}
              sx={{ fontWeight: 700, borderRadius: 2, py: 1.1 }}
            >
              {modoRevision ? 'Volver a la Página 4' : 'Anterior'}
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {/* Botones de avance según la página */}
          {!modoRevision && (
            <>
              {paginaActual < totalPaginas ? (
                <Button
                  id="btn-siguiente-pagina"
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleSiguiente}
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                    px: { xs: 2, sm: 3.5 },
                    py: 1.1,
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
                  }}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  id="btn-revisar-respuestas"
                  variant="contained"
                  fullWidth
                  endIcon={<AssignmentTurnedInIcon />}
                  onClick={handleSiguiente}
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                    px: { xs: 2, sm: 3.5 },
                    py: 1.1,
                    borderRadius: 2,
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  Revisar respuestas
                </Button>
              )}
            </>
          )}

          {/* Botón final en el modo de revisión: "Ver mis resultados" */}
          {modoRevision && (
            <Button
              id="btn-ver-mis-resultados"
              variant="contained"
              size="large"
              fullWidth
              disabled={!todasRespondidas || submitting}
              onClick={handleSubmit}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
              sx={{
                px: { xs: 2, sm: 4 },
                py: 1.3,
                fontWeight: 800,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                boxShadow: '0 4px 18px rgba(124, 58, 237, 0.35)',
              }}
            >
              {submitting ? 'Calculando afinidad...' : 'Ver mis resultados'}
            </Button>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};
