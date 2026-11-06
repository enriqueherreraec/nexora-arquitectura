import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import ExploreIcon from '@mui/icons-material/Explore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StarsIcon from '@mui/icons-material/Stars';

interface HeroVocacionalProps {
  themeMode: 'light' | 'dark';
  onStartQuestionnaire: () => void;
  onExplorarCarreras: () => void;
}

export const HeroVocacional: React.FC<HeroVocacionalProps> = ({
  themeMode,
  onStartQuestionnaire,
  onExplorarCarreras,
}) => {
  const isDark = themeMode === 'dark';

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(ellipse 90% 60% at 50% -10%, #2A1747 0%, #130E1D 60%, #0E0B14 100%)'
          : 'radial-gradient(ellipse 90% 60% at 50% -10%, #F5E8FF 0%, #FAF5FF 45%, #FFFFFF 100%)',
        borderBottom: isDark
          ? '1px solid rgba(185, 149, 255, 0.12)'
          : '1px solid rgba(124, 58, 237, 0.08)',
        pt: { xs: 4, sm: 6, md: 8 },
        pb: { xs: 6, sm: 8, md: 10 },
      }}
    >
      {/* Luces de fondo ambientales */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: { xs: 260, md: 520 },
          height: { xs: 260, md: 520 },
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          right: '5%',
          width: { xs: 240, md: 480 },
          height: { xs: 240, md: 480 },
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(124, 58, 237, 0.10) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 5 }} sx={{ alignItems: 'center' }}>
          {/* COLUMNA IZQUIERDA: MENSAJE E IDENTIDAD NEXORA */}
          <Grid size={{ xs: 12, md: 6.5 }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {/* Badge Identidad Nexora */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  alignItems: 'center',
                  mb: 2.5,
                }}
              >
                <Chip
                  icon={<ExploreIcon sx={{ fontSize: '1rem !important', color: isDark ? '#D8B4FE' : '#7C3AED' }} />}
                  label="NEXORA · TU FUTURO EMPIEZA POR CONOCERTE"
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(185, 149, 255, 0.15)' : '#EDE9FE',
                    color: isDark ? '#F3EEFB' : '#4C1D95',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(185, 149, 255, 0.3)' : 'rgba(124, 58, 237, 0.2)',
                    fontWeight: 800,
                    fontSize: { xs: '0.68rem', sm: '0.75rem' },
                    letterSpacing: 0.8,
                    py: 1.8,
                    px: 0.5,
                  }}
                />
              </Stack>

              {/* Título Principal */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.15rem', sm: '2.9rem', md: '3.4rem' },
                  fontWeight: 900,
                  lineHeight: { xs: 1.18, md: 1.14 },
                  color: isDark ? '#FFFFFF' : '#2E1065',
                  letterSpacing: '-0.02em',
                  mb: 2.5,
                }}
              >
                Descubre lo que te inspira,{' '}
                <Box
                  component="span"
                  sx={{
                    background: isDark
                      ? 'linear-gradient(135deg, #C084FC 0%, #A855F7 50%, #38BDF8 100%)'
                      : 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #0D9488 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline',
                  }}
                >
                  encuentra tu camino
                </Box>
              </Typography>

              {/* Descripción */}
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1.02rem', sm: '1.12rem' },
                  lineHeight: 1.7,
                  color: isDark ? 'rgba(243, 238, 251, 0.82)' : '#4B5563',
                  maxWidth: 620,
                  mx: { xs: 'auto', md: 0 },
                  mb: 4,
                }}
              >
                Explora tus intereses, conoce carreras y universidades públicas del Ecuador y compara opciones para tomar una decisión sobre tu futuro académico.
              </Typography>

              {/* Botones de Acción */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  alignItems: 'center',
                  mb: 4.5,
                }}
              >
                <Button
                  id="btn-descubrir-perfil-vocacional"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={onStartQuestionnaire}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    py: 1.6,
                    px: 3.8,
                    fontSize: '1.02rem',
                    fontWeight: 800,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
                    boxShadow: isDark
                      ? '0 6px 24px rgba(124, 58, 237, 0.45)'
                      : '0 8px 24px rgba(124, 58, 237, 0.32)',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6D28D9 0%, #3B0764 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 28px rgba(124, 58, 237, 0.42)',
                    },
                  }}
                >
                  Descubrir mi perfil vocacional
                </Button>

                <Button
                  id="btn-explorar-carreras-hero"
                  variant="outlined"
                  size="large"
                  startIcon={<SchoolIcon />}
                  onClick={onExplorarCarreras}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    py: 1.5,
                    px: 3.2,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    borderColor: isDark ? 'rgba(185, 149, 255, 0.35)' : 'rgba(124, 58, 237, 0.35)',
                    color: isDark ? '#E9D5FF' : '#6D28D9',
                    bgcolor: isDark ? 'rgba(185, 149, 255, 0.05)' : 'rgba(124, 58, 237, 0.04)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      borderColor: isDark ? '#C084FC' : '#7C3AED',
                      bgcolor: isDark ? 'rgba(185, 149, 255, 0.12)' : 'rgba(124, 58, 237, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Explorar carreras
                </Button>
              </Stack>

              {/* Detalles de apoyo / Micro-beneficios con diseño cuidado */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.2, sm: 2 }}
                sx={{
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  alignItems: { xs: 'center', md: 'center' },
                  flexWrap: 'wrap',
                }}
              >
                <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? 'rgba(243, 238, 251, 0.88)' : '#4B5563',
                      fontSize: '0.82rem',
                    }}
                  >
                    20 preguntas sobre tus intereses
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                  }}
                />

                <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? 'rgba(243, 238, 251, 0.88)' : '#4B5563',
                      fontSize: '0.82rem',
                    }}
                  >
                    Universidades públicas del Ecuador
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                  }}
                />

                <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? 'rgba(243, 238, 251, 0.88)' : '#4B5563',
                      fontSize: '0.82rem',
                    }}
                  >
                    Resultados y recomendaciones
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* COLUMNA DERECHA: COMPOSICIÓN VISUAL CON BRÚJULA VOCACIONAL Y CAMINO DE 3 ELEMENTOS */}
          <Grid size={{ xs: 12, md: 5.5 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 520,
                mx: 'auto',
                minHeight: { xs: 360, sm: 420, md: 450 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 1, sm: 2 },
              }}
            >
              {/* Contenedor Gráfico Central con la Brújula y el Camino */}
              <Paper
                elevation={0}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  minHeight: { xs: 350, sm: 410 },
                  borderRadius: 5,
                  p: 3,
                  bgcolor: isDark ? 'rgba(26, 20, 38, 0.65)' : 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(185, 149, 255, 0.18)' : 'rgba(124, 58, 237, 0.14)',
                  boxShadow: isDark
                    ? '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                    : '0 20px 50px rgba(124, 58, 237, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                {/* SVG Camino Conector Curvo entre los tres hitos */}
                <Box
                  component="svg"
                  viewBox="0 0 420 340"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="caminoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#A855F7" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#0D9488" stopOpacity="0.85" />
                    </linearGradient>
                    <filter id="glowPath" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  {/* Línea curva conectando Intereses (arriba izq) -> Opciones (centro) -> Futuro (abajo der) */}
                  <path
                    d="M 80 70 C 140 70, 160 170, 210 170 C 260 170, 270 270, 340 270"
                    fill="none"
                    stroke="url(#caminoGradient)"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    filter="url(#glowPath)"
                    opacity="0.8"
                  />
                  {/* Nodos de conexión en el camino */}
                  <circle cx="80" cy="70" r="5" fill="#7C3AED" />
                  <circle cx="210" cy="170" r="6" fill="#A855F7" />
                  <circle cx="340" cy="270" r="5" fill="#0D9488" />
                </Box>

                {/* HITO 1: TUS INTERESES (Tarjeta Flotante Superior) */}
                <Paper
                  elevation={0}
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: 260,
                    p: 1.6,
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(38, 28, 56, 0.85)' : '#FFFFFF',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(185, 149, 255, 0.25)' : 'rgba(124, 58, 237, 0.18)',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                      : '0 8px 20px rgba(124, 58, 237, 0.08)',
                    transform: 'rotate(-1.5deg)',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'rotate(0deg) scale(1.02)' },
                  }}
                >
                  <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', mb: 0.8 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(124, 58, 237, 0.35)',
                      }}
                    >
                      <PsychologyIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#7C3AED', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.68rem' }}>
                        Paso 1 · Diagnóstico
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                        Tus intereses
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={0.6} sx={{ flexWrap: 'wrap' }}>
                    <Chip label="Tecnología" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED' }} />
                    <Chip label="Ciencias" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(20, 184, 166, 0.1)', color: '#0D9488' }} />
                    <Chip label="Creatividad" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }} />
                  </Stack>
                </Paper>

                {/* HITO 2: BRÚJULA VOCACIONAL NEXORA Y TUS OPCIONES (Centro de la Composición) */}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 2,
                    my: 1,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                  }}
                >
                  {/* Elemento Gráfico: La Brújula Vocacional */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: isDark
                        ? 'radial-gradient(circle, #25183E 0%, #150E24 100%)'
                        : 'radial-gradient(circle, #FAF5FF 0%, #EDE9FE 100%)',
                      border: '2px solid',
                      borderColor: isDark ? '#A855F7' : '#7C3AED',
                      boxShadow: isDark
                        ? '0 0 25px rgba(168, 85, 247, 0.35), inset 0 0 15px rgba(124, 58, 237, 0.4)'
                        : '0 8px 25px rgba(124, 58, 237, 0.25), inset 0 0 10px rgba(124, 58, 237, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {/* Dial de la brújula y marcas cardinales */}
                    <Box
                      component="svg"
                      viewBox="0 0 100 100"
                      sx={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                      }}
                    >
                      {/* Puntos de orientación */}
                      <circle cx="50" cy="50" r="42" fill="none" stroke={isDark ? "rgba(185, 149, 255, 0.25)" : "rgba(124, 58, 237, 0.25)"} strokeWidth="1" strokeDasharray="2 3" />
                      <circle cx="50" cy="50" r="32" fill="none" stroke={isDark ? "rgba(185, 149, 255, 0.15)" : "rgba(124, 58, 237, 0.15)"} strokeWidth="1" />
                      
                      {/* Marcas de los cuatro cuadrantes */}
                      <text x="50" y="16" fontSize="8" fontWeight="800" textAnchor="middle" fill={isDark ? "#D8B4FE" : "#6D28D9"}>N</text>
                      <text x="86" y="53" fontSize="7" fontWeight="700" textAnchor="middle" fill={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}>E</text>
                      <text x="50" y="90" fontSize="7" fontWeight="700" textAnchor="middle" fill={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}>S</text>
                      <text x="14" y="53" fontSize="7" fontWeight="700" textAnchor="middle" fill={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}>O</text>

                      {/* Aguja magnética vocacional con degradado apuntando hacia el Norte/Futuro */}
                      <polygon points="50,18 45,50 55,50" fill="#7C3AED" opacity="0.95" />
                      <polygon points="50,82 45,50 55,50" fill={isDark ? "#4B5563" : "#CBD5E1"} opacity="0.8" />
                      <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2" />
                    </Box>
                  </Box>

                  {/* Tarjeta Flotante Central: Tus Opciones */}
                  <Paper
                    elevation={0}
                    sx={{
                      maxWidth: 240,
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: isDark ? 'rgba(38, 28, 56, 0.92)' : '#FFFFFF',
                      border: '1px solid',
                      borderColor: '#10B981',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
                      transform: 'scale(1.02)',
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.6 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '8px',
                          bgcolor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 16 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#10B981', display: 'block', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                          Paso 2 · Catálogo Oficial
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', lineHeight: 1.1 }}>
                          Tus opciones
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, fontSize: '0.72rem' }}>
                      Carreras universitarias · IES Públicas
                    </Typography>
                    <Box sx={{ mt: 0.6, display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(16, 185, 129, 0.1)', px: 0.8, py: 0.3, borderRadius: 1.5 }}>
                      <StarsIcon sx={{ fontSize: 13, color: '#10B981' }} />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#10B981', fontSize: '0.68rem' }}>
                        Afinidad calculada
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                {/* HITO 3: TU FUTURO (Tarjeta Flotante Inferior Derecha) */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      maxWidth: 270,
                      p: 1.6,
                      borderRadius: 3,
                      bgcolor: isDark ? 'rgba(38, 28, 56, 0.85)' : '#FFFFFF',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(185, 149, 255, 0.25)' : 'rgba(124, 58, 237, 0.18)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                        : '0 8px 20px rgba(124, 58, 237, 0.08)',
                      transform: 'rotate(1.5deg)',
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'rotate(0deg) scale(1.02)' },
                    }}
                  >
                    <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', mb: 0.8 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(20, 184, 166, 0.35)',
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#0D9488', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.68rem' }}>
                          Paso 3 · Comparación
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                          Tu futuro
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.74rem', lineHeight: 1.4 }}>
                      Decisión académica informada, contrastando sedes, modalidades y afinidad vocacional.
                    </Typography>
                  </Paper>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
