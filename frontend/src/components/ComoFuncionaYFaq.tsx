import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';

interface ComoFuncionaYFaqProps {
  themeMode: 'light' | 'dark';
}

const PASOS_NEXORA = [
  {
    numero: '01',
    titulo: 'Descubre tus intereses',
    descripcion:
      'Completa las 20 preguntas del test vocacional y conoce las áreas que más coinciden con tus preferencias',
    icon: PsychologyOutlinedIcon,
  },
  {
    numero: '02',
    titulo: 'Explora tus opciones',
    descripcion:
      'Consulta las carreras y universidades públicas del Ecuador, revisa sus modalidades, sedes y duración',
    icon: SchoolOutlinedIcon,
  },
  {
    numero: '03',
    titulo: 'Compara y decide',
    descripcion:
      'Selecciona entre dos y cuatro opciones para comparar sus características y elegir con más información',
    icon: CompareArrowsIcon,
  },
];

const PREGUNTAS_FRECUENTES = [
  {
    id: 'faq-1',
    pregunta: '¿El resultado determina qué carrera debo estudiar?',
    respuesta:
      'El resultado sirve como orientación sobre tus intereses, la decisión también requiere considerar tus habilidades, circunstancias y objetivos personales',
  },
  {
    id: 'faq-2',
    pregunta: '¿Puedo repetir el test?',
    respuesta:
      'Sí, puedes realizar una nueva evaluación y consultar las anteriores en tu historial',
  },
  {
    id: 'faq-3',
    pregunta: '¿Qué diferencia existe entre presencial, semipresencial y en línea?',
    respuesta:
      'La modalidad presencial requiere asistir al campus, la semipresencial combina actividades presenciales y virtuales, la modalidad en línea utiliza entornos virtuales, revisa los requisitos específicos de cada universidad',
  },
  {
    id: 'faq-4',
    pregunta: '¿El puntaje referencial garantiza un cupo?',
    respuesta:
      'No, es un dato orientativo que puede variar según el periodo, la demanda y las reglas de admisión de cada institución',
  },
  {
    id: 'faq-5',
    pregunta: '¿Nexora permite postular a una universidad?',
    respuesta:
      'Nexora permite explorar y comparar opciones, la inscripción y postulación se realizan mediante los canales oficiales de cada universidad',
  },
  {
    id: 'faq-6',
    pregunta: '¿Dónde confirmo los requisitos y las fechas de admisión?',
    respuesta:
      'En el portal oficial de la universidad, puedes acceder desde el enlace disponible en el catálogo',
  },
];

export const ComoFuncionaYFaq: React.FC<ComoFuncionaYFaqProps> = ({ themeMode }) => {
  const isDark = themeMode === 'dark';
  const [expandedFaq, setExpandedFaq] = useState<string | false>('faq-1');

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedFaq(isExpanded ? panel : false);
    };

  return (
    <Box sx={{ width: '100%' }}>
      {/* ============================================================== */}
      {/* SECCIÓN 1: 🧭 Cómo funciona Nexora */}
      {/* ============================================================== */}
      <Box
        component="section"
        id="como-funciona"
        sx={{
          py: { xs: 6, sm: 8, md: 10 },
          px: { xs: 2, sm: 3 },
          position: 'relative',
          bgcolor: isDark ? 'transparent' : 'rgba(250, 245, 255, 0.45)',
          borderBottom: isDark
            ? '1px solid rgba(185, 149, 255, 0.08)'
            : '1px solid rgba(124, 58, 237, 0.06)',
        }}
      >
        <Container maxWidth="lg">
          {/* Encabezado de la sección */}
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 }, maxWidth: 760, mx: 'auto' }}>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 1.5 }}>
              <Chip
                icon={<ExploreOutlinedIcon sx={{ fontSize: '1rem !important', color: isDark ? '#D8B4FE' : '#7C3AED' }} />}
                label="GUÍA PASO A PASO"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(185, 149, 255, 0.12)' : 'rgba(124, 58, 237, 0.08)',
                  color: isDark ? '#D8B4FE' : '#7C3AED',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  border: isDark ? '1px solid rgba(185, 149, 255, 0.2)' : '1px solid rgba(124, 58, 237, 0.15)',
                  px: 0.5,
                }}
              />
            </Stack>

            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 800,
                color: isDark ? '#F3EEFB' : '#382064',
                fontSize: { xs: '1.75rem', sm: '2.15rem', md: '2.45rem' },
                lineHeight: 1.25,
                mb: 1.5,
              }}
            >
              🧭 Cómo funciona Nexora
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: isDark ? '#A89EB9' : '#716B86',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                lineHeight: 1.6,
              }}
            >
              Conoce el recorrido simple y transparente diseñado para orientar tu vocación y facilitarte la elección universitaria.
            </Typography>
          </Box>

          {/* Tarjetas de los 3 pasos */}
          <Grid container spacing={{ xs: 3, md: 3.5 }} sx={{ alignItems: 'stretch' }}>
            {PASOS_NEXORA.map((paso) => {
              const IconComponent = paso.icon;
              return (
                <Grid key={paso.numero} size={{ xs: 12, md: 4 }}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      p: { xs: 3, sm: 3.5 },
                      bgcolor: isDark ? '#1B1525' : '#FFFFFF',
                      border: isDark
                        ? '1px solid rgba(185, 149, 255, 0.16)'
                        : '1px solid rgba(124, 58, 237, 0.12)',
                      boxShadow: isDark
                        ? '0 4px 20px rgba(0, 0, 0, 0.25)'
                        : '0 4px 20px rgba(124, 58, 237, 0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: isDark ? '#B995FF' : '#7C3AED',
                        boxShadow: isDark
                          ? '0 12px 28px -4px rgba(124, 58, 237, 0.35)'
                          : '0 12px 28px -4px rgba(124, 58, 237, 0.15)',
                      },
                    }}
                  >
                    {/* Acento superior de gradiente */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'linear-gradient(90deg, #7C3AED, #B995FF)',
                      }}
                    />

                    {/* Cabecera de la tarjeta: Icono + Número distintivo */}
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: isDark ? 'rgba(185, 149, 255, 0.14)' : '#EDE9FE',
                          color: isDark ? '#D8B4FE' : '#7C3AED',
                        }}
                      >
                        <IconComponent sx={{ fontSize: '1.75rem' }} />
                      </Box>

                      {/* Badge con número de paso */}
                      <Box
                        sx={{
                          px: 1.75,
                          py: 0.5,
                          borderRadius: 2.5,
                          background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          letterSpacing: '0.04em',
                          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                        }}
                      >
                        Paso {paso.numero}
                      </Box>
                    </Stack>

                    {/* Contenido: Título y texto */}
                    <CardContent sx={{ p: 0, flexGrow: 1, '&:last-child': { pb: 0 } }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 700,
                          color: isDark ? '#F3EEFB' : '#382064',
                          fontSize: { xs: '1.15rem', sm: '1.25rem' },
                          mb: 1.25,
                        }}
                      >
                        {paso.titulo}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: isDark ? '#A89EB9' : '#716B86',
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          lineHeight: 1.65,
                        }}
                      >
                        {paso.descripcion}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ============================================================== */}
      {/* SECCIÓN 2: ❓ Preguntas frecuentes */}
      {/* ============================================================== */}
      <Box
        component="section"
        id="preguntas-frecuentes"
        sx={{
          py: { xs: 6, sm: 8, md: 10 },
          px: { xs: 2, sm: 3 },
          position: 'relative',
        }}
      >
        <Container maxWidth="md">
          {/* Encabezado de Preguntas frecuentes */}
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 }, maxWidth: 700, mx: 'auto' }}>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 1.5 }}>
              <Chip
                icon={<HelpOutlinedIcon sx={{ fontSize: '1rem !important', color: isDark ? '#D8B4FE' : '#7C3AED' }} />}
                label="RESOLVEMOS TUS DUDAS"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(185, 149, 255, 0.12)' : 'rgba(124, 58, 237, 0.08)',
                  color: isDark ? '#D8B4FE' : '#7C3AED',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  border: isDark ? '1px solid rgba(185, 149, 255, 0.2)' : '1px solid rgba(124, 58, 237, 0.15)',
                  px: 0.5,
                }}
              />
            </Stack>

            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 800,
                color: isDark ? '#F3EEFB' : '#382064',
                fontSize: { xs: '1.75rem', sm: '2.15rem', md: '2.45rem' },
                lineHeight: 1.25,
                mb: 1.5,
              }}
            >
              ❓ Preguntas frecuentes
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: isDark ? '#A89EB9' : '#716B86',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                lineHeight: 1.6,
              }}
            >
              Encuentra respuestas claras a las dudas más habituales sobre la evaluación, la oferta académica y la admisión.
            </Typography>
          </Box>

          {/* Acordeones */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {PREGUNTAS_FRECUENTES.map((faq) => {
              const isItemExpanded = expandedFaq === faq.id;
              return (
                <Accordion
                  key={faq.id}
                  expanded={isItemExpanded}
                  onChange={handleAccordionChange(faq.id)}
                  elevation={0}
                  disableGutters
                  sx={{
                    borderRadius: '16px !important',
                    overflow: 'hidden',
                    bgcolor: isDark ? '#1B1525' : '#FFFFFF',
                    border: isItemExpanded
                      ? isDark
                        ? '1px solid rgba(185, 149, 255, 0.4)'
                        : '1px solid rgba(124, 58, 237, 0.35)'
                      : isDark
                      ? '1px solid rgba(185, 149, 255, 0.14)'
                      : '1px solid rgba(124, 58, 237, 0.12)',
                    boxShadow: isItemExpanded
                      ? isDark
                        ? '0 8px 24px rgba(124, 58, 237, 0.18)'
                        : '0 8px 24px rgba(124, 58, 237, 0.08)'
                      : isDark
                      ? '0 2px 10px rgba(0, 0, 0, 0.2)'
                      : '0 2px 8px rgba(124, 58, 237, 0.04)',
                    transition: 'all 0.2s ease',
                    '&:before': {
                      display: 'none',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon
                        sx={{
                          color: isDark ? '#B995FF' : '#7C3AED',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    }
                    sx={{
                      px: { xs: 2.25, sm: 3 },
                      py: { xs: 1.25, sm: 1.75 },
                      minHeight: 64,
                      '& .MuiAccordionSummary-content': {
                        my: { xs: 1, sm: 1.25 },
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '0.98rem', sm: '1.05rem' },
                        color: isItemExpanded
                          ? isDark
                            ? '#D8B4FE'
                            : '#7C3AED'
                          : isDark
                          ? '#F3EEFB'
                          : '#382064',
                        pr: 1.5,
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {faq.pregunta}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails
                    sx={{
                      px: { xs: 2.25, sm: 3 },
                      pt: 0,
                      pb: { xs: 2.5, sm: 3 },
                      borderTop: isDark
                        ? '1px solid rgba(185, 149, 255, 0.08)'
                        : '1px solid rgba(124, 58, 237, 0.06)',
                    }}
                  >
                    <Typography
                      sx={{
                        color: isDark ? '#D1C4E9' : '#5B5370',
                        fontSize: { xs: '0.9rem', sm: '0.96rem' },
                        lineHeight: 1.7,
                        pt: 1.5,
                      }}
                    >
                      {faq.respuesta}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
