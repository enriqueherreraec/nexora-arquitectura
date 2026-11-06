import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Snackbar,
  Alert,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import MapIcon from '@mui/icons-material/Map';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircle from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import TuneIcon from '@mui/icons-material/Tune';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthView } from './components/AuthView';
import { PublicHeader } from './components/PublicHeader';
import { ProfileView } from './components/ProfileView';
import { TechnicalDiagnostics } from './components/TechnicalDiagnostics';
import { CuestionarioView } from './components/CuestionarioView';
import { ResultadosView } from './components/ResultadosView';
import { CompararView } from './components/CompararView';
import { CatalogoView } from './components/CatalogoView';
import { UniversidadesView } from './components/UniversidadesView';
import { HistorialView } from './components/HistorialView';
import { FavoritosView } from './components/FavoritosView';
import { GestorAcademicoView } from './components/GestorAcademicoView';
import { AdminUsuariosView } from './components/AdminUsuariosView';
import { HeroVocacional } from './components/HeroVocacional';
import { ComoFuncionaYFaq } from './components/ComoFuncionaYFaq';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getAppTheme } from './theme';
import {
  authService,
  healthService,
  evaluacionesService,
  favoritosService,
  getStoredToken,
  isSameOffer,
} from './services/api';
import type {
  Usuario,
  AuthResponse,
  HealthResponse,
  Carrera,
  CarreraOferta,
  EvaluacionResultado,
} from './services/api';

interface AccesoRestringidoProps {
  titulo?: string;
  mensaje: string;
  onVolver: () => void;
  textoBoton?: string;
  themeMode?: 'light' | 'dark';
}

const AccesoRestringido: React.FC<AccesoRestringidoProps> = ({
  titulo = 'Acceso Restringido (403)',
  mensaje,
  onVolver,
  textoBoton = 'Volver a mi panel',
  themeMode = 'light',
}) => (
  <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, md: 6 },
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: themeMode === 'dark' ? 'rgba(185, 149, 255, 0.15)' : 'rgba(124, 58, 237, 0.15)',
        boxShadow: themeMode === 'dark' ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(56, 32, 100, 0.06)',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: 'rgba(239, 68, 68, 0.12)',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2.5,
        }}
      >
        <SecurityIcon sx={{ fontSize: 32 }} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
        {titulo}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 620, mx: 'auto', lineHeight: 1.7 }}>
        {mensaje}
      </Typography>
      <Button
        variant="contained"
        onClick={onVolver}
        sx={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
          px: 4,
          py: 1.4,
          fontWeight: 700,
          fontSize: '0.95rem',
          boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6D28D9 0%, #2E1065 100%)',
          },
        }}
      >
        {textoBoton}
      </Button>
    </Paper>
  </Container>
);

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('inicio');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(() => Boolean(getStoredToken()));
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Modo claro / oscuro persistido en localStorage
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nexora_theme_mode');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const handleToggleDarkMode = () => {
    setThemeMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('nexora_theme_mode', next);
      return next;
    });
  };

  const [evaluacionActual, setEvaluacionActual] = useState<EvaluacionResultado | null>(null);
  const [carrerasComparar, setCarrerasComparar] = useState<Carrera[]>([]);
  const [favoritosIds, setFavoritosIds] = useState<number[]>([]);

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);

  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Cargar IDs de favoritos del estudiante
  const cargarFavoritosIds = async () => {
    const token = getStoredToken();
    if (!token) {
      setFavoritosIds([]);
      return;
    }
    try {
      const ids = await favoritosService.getFavoritosIds();
      setFavoritosIds(ids);
    } catch {
      setFavoritosIds([]);
    }
  };

  // Cargar usuario inicial si existe token guardado
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setAuthLoading(true);
      authService
        .getMe(() => {
          setToast({
            type: 'info',
            message: 'Su sesión ha expirado. Por favor, ingrese sus credenciales nuevamente.',
          });
          setUsuario(null);
          setEvaluacionActual(null);
          setFavoritosIds([]);
          setActiveView('inicio');
          setAuthLoading(false);
        })
        .then((userData) => {
          setUsuario(userData);
          if (userData.rol === 'gestor') {
            setActiveView('gestor-academico');
          } else if (userData.rol === 'admin') {
            setActiveView('admin-usuarios');
          } else {
            setActiveView('inicio');
            // Cargar última evaluación persistida en base de datos
            evaluacionesService
              .getUltima()
              .then((res) => {
                if (res) setEvaluacionActual(res);
              })
              .catch(() => {});
            // Cargar favoritos
            cargarFavoritosIds();
          }
        })
        .catch(() => {
          setUsuario(null);
          setEvaluacionActual(null);
          setFavoritosIds([]);
          setActiveView('inicio');
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }

    // Cargar diagnóstico de salud
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setHealthLoading(true);
    try {
      const data = await healthService.getHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setSidebarOpen(false);
    setActiveView(mode);
  };

  const handleAuthSuccess = (authData: AuthResponse) => {
    setUsuario(authData.usuario);
    setSidebarOpen(false);
    setCarrerasComparar([]); // Limpia selecciones para evitar conservar elecciones de otra cuenta
    if (authData.usuario.rol === 'estudiante') {
      cargarFavoritosIds();
      evaluacionesService
        .getUltima()
        .then((res) => {
          if (res) setEvaluacionActual(res);
          else setEvaluacionActual(null);
        })
        .catch(() => {
          setEvaluacionActual(null);
        });
      setActiveView('inicio');
    } else if (authData.usuario.rol === 'gestor') {
      setFavoritosIds([]);
      setEvaluacionActual(null);
      setActiveView('gestor-academico');
    } else if (authData.usuario.rol === 'admin') {
      setFavoritosIds([]);
      setEvaluacionActual(null);
      setActiveView('admin-usuarios');
    }
    setToast({
      type: 'success',
      message: `¡Bienvenido, ${authData.usuario.nombre_completo}! Sesión iniciada correctamente.`,
    });
  };

  const handleLogout = () => {
    authService.logout();
    setUsuario(null);
    setEvaluacionActual(null);
    setCarrerasComparar([]); // Limpia las selecciones al cerrar sesión
    setFavoritosIds([]);
    setSidebarOpen(false); // Limpia y cierra el menú del usuario anterior
    setActiveView('inicio');
    setToast({
      type: 'info',
      message: 'Ha cerrado sesión correctamente.',
    });
  };

  const handleToggleFavorito = async (carrera: CarreraOferta) => {
    if (!usuario) {
      setToast({
        type: 'info',
        message: 'Para guardar carreras en tus favoritas, inicia sesión o crea tu cuenta.',
      });
      handleOpenAuth('login');
      return;
    }

    if (usuario.rol === 'gestor' || usuario.rol === 'admin') {
      setToast({
        type: 'info',
        message: 'La función de carreras favoritas es exclusiva para estudiantes.',
      });
      return;
    }

    const isFav = favoritosIds.includes(carrera.id);
    try {
      const res = await favoritosService.toggleFavorito(carrera.id, isFav);
      if (res.favorito) {
        setFavoritosIds((prev) => [...prev, carrera.id]);
        setToast({
          type: 'success',
          message: `«${carrera.nombre}» guardada en tus favoritas ⭐`,
        });
      } else {
        setFavoritosIds((prev) => prev.filter((id) => id !== carrera.id));
        setToast({
          type: 'info',
          message: `«${carrera.nombre}» retirada de tus favoritas.`,
        });
      }
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Error al actualizar favoritas.',
      });
    }
  };

  const handleVolverPanel = () => {
    if (usuario?.rol === 'gestor') {
      setActiveView('gestor-academico');
    } else if (usuario?.rol === 'admin') {
      setActiveView('admin-usuarios');
    } else {
      setActiveView('inicio');
    }
  };

  const getBotonVolverTexto = () => {
    if (usuario?.rol === 'gestor') return 'Volver al Panel Académico';
    if (usuario?.rol === 'admin') return 'Volver al Panel Administrativo';
    return 'Volver al Inicio';
  };

  const handleNavigate = (vista: string) => {
    if (!usuario) {
      if (vista === 'inicio') {
        setActiveView('inicio');
      } else if (vista === 'register') {
        handleOpenAuth('register');
      } else {
        handleOpenAuth('login');
      }
      return;
    }
    setActiveView(vista);
  };

  const handleStartQuestionnaire = () => {
    if (!usuario) {
      setToast({
        type: 'info',
        message: 'Para registrar y conservar su historial vocacional, inicie sesión o cree su cuenta gratuita.',
      });
      handleOpenAuth('register');
    } else {
      setActiveView('cuestionario');
    }
  };

  const handleCuestionarioCompletado = (resultado: EvaluacionResultado) => {
    setEvaluacionActual(resultado);
    setCarrerasComparar([]); // Limpia selección anterior para actualizar con las nuevas recomendaciones
    setActiveView('resultados');
    setToast({
      type: 'success',
      message: '¡Cuestionario completado con éxito! Se han calculado sus afinidades y opciones de universidades públicas.',
    });
  };

  const handleToggleCarreraComparar = (carrera: CarreraOferta) => {
    if (carrera.es_vigente === false) {
      setToast({
        type: 'info',
        message: 'Esta carrera no se encuentra activa en el catálogo.',
      });
      return;
    }
    setCarrerasComparar((prev) => {
      const exists = prev.some((c) => isSameOffer(c, carrera));
      if (exists) {
        return prev.filter((c) => !isSameOffer(c, carrera));
      }
      if (prev.length >= 4) {
        setToast({
          type: 'info',
          message: 'Puedes comparar un máximo de 4 carreras universitarias simultáneamente.',
        });
        return prev;
      }
      return [...prev, carrera];
    });
  };

  const handleRemoverCarreraComparar = (carrera: CarreraOferta) => {
    setCarrerasComparar((prev) => prev.filter((c) => !isSameOffer(c, carrera)));
  };

  const handleLimpiarCarrerasComparar = () => {
    setCarrerasComparar([]);
  };

  const handleCompararCarrera = (carrera: Carrera) => {
    handleToggleCarreraComparar(carrera);
    setActiveView('comparar');
  };

  const currentTheme = getAppTheme(themeMode);

  if (authLoading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            color: 'text.primary',
          }}
        >
          <CircularProgress sx={{ color: '#7C3AED', mb: 3 }} size={50} thickness={4} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 0.5 }}>
            NEXORA
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verificando credenciales y permisos de acceso...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  const renderPrincipios = () => (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 3, md: 4 },
        bgcolor: 'background.paper',
        borderRadius: 3,
        borderColor: themeMode === 'dark' ? 'rgba(185, 149, 255, 0.15)' : 'rgba(124, 58, 237, 0.12)',
        boxShadow: themeMode === 'dark' ? '0 4px 18px rgba(0, 0, 0, 0.3)' : '0 4px 18px rgba(56, 32, 100, 0.03)',
        mb: 4,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 800, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
        Principios Académicos y Compromiso Ético de Nexora
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Reglas que rigen el tratamiento de datos y la naturaleza orientativa de la plataforma:
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <CheckCircle sx={{ color: '#14B8A6', mt: 0.3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                Instrumento vocacional orientativo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Constituye una herramienta pedagógica de autoconocimiento. No debe interpretarse como un
                diagnóstico psicológico clínico estandarizado.
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <CheckCircle sx={{ color: '#14B8A6', mt: 0.3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                Sin garantía de cupo ni puntaje SENESCYT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                El puntaje vocacional representa intereses y preferencias, no un puntaje de admisión ni
                una asignación de cupo en el sistema público.
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <CheckCircle sx={{ color: '#14B8A6', mt: 0.3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                Privacidad y control de evaluaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cada estudiante solo puede consultar sus propias evaluaciones e informes mediante
                autenticación con tokens JWT cifrados.
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <CheckCircle sx={{ color: '#14B8A6', mt: 0.3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                Datos oficiales verificables
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No se inventan carreras ni ofertas de estudio inexistentes; se conserva la institución,
                campus y fuente oficial de corte.
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  if (authLoading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              mb: 2,
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
            }}
          >
            <SchoolIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: themeMode === 'dark' ? '#F3EEFB' : '#382064',
              mb: 1.5,
            }}
          >
            NEXORA
          </Typography>
          <CircularProgress size={28} sx={{ color: '#7C3AED' }} />
        </Box>
      </ThemeProvider>
    );
  }

  if (activeView === 'login' || activeView === 'register') {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <AuthView
          initialMode={activeView === 'register' ? 'register' : 'login'}
          onSuccess={handleAuthSuccess}
          onVolverInicio={() => setActiveView('inicio')}
          themeMode={themeMode}
        />
        {toast && (
          <Snackbar
            open={Boolean(toast)}
            autoHideDuration={4000}
            onClose={() => setToast(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setToast(null)} severity={toast.type} sx={{ width: '100%' }}>
              {toast.message}
            </Alert>
          </Snackbar>
        )}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          transition: 'background-color 0.2s ease, color 0.2s ease',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        {/* Barra y Menú Internos: Visibles ÚNICAMENTE tras validar una sesión activa y conocer el rol */}
        {usuario ? (
          <>
            <Navbar
              usuario={usuario}
              darkMode={themeMode === 'dark'}
              onToggleDarkMode={handleToggleDarkMode}
              onOpenSidebar={() => setSidebarOpen(true)}
              onOpenAuth={handleOpenAuth}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
            <Sidebar
              open={sidebarOpen}
              activeView={activeView}
              onClose={() => setSidebarOpen(false)}
              onNavigate={handleNavigate}
              isAuthenticated={true}
              usuarioRole={usuario.rol}
            />
          </>
        ) : (
          /* Portada pública sin autenticar: únicamente identidad y botones Iniciar sesión / Registrarse */
          <PublicHeader
            onOpenAuth={handleOpenAuth}
            darkMode={themeMode === 'dark'}
            onToggleDarkMode={handleToggleDarkMode}
          />
        )}

      {/* Contenido Principal según vista */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* INICIO - ROL: GESTOR ACADÉMICO */}
        {activeView === 'inicio' && usuario?.rol === 'gestor' && (
          <>
            <Box
              sx={{
                background: themeMode === 'dark'
                  ? 'linear-gradient(180deg, #161120 0%, #100D16 100%)'
                  : 'linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 100%)',
                pt: { xs: 5, md: 8 },
                pb: { xs: 6, md: 8 },
                borderBottom: themeMode === 'dark'
                  ? '1px solid rgba(185, 149, 255, 0.12)'
                  : '1px solid rgba(124, 58, 237, 0.08)',
              }}
            >
              <Container maxWidth="lg">
                <Box sx={{ maxWidth: 880, mx: 'auto', textAlign: 'center' }}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 2.5 }}>
                    <Chip
                      icon={<TuneIcon sx={{ fontSize: '1rem !important', color: themeMode === 'dark' ? '#B995FF' : '#7C3AED' }} />}
                      label="Gestor Académico"
                      size="small"
                      sx={{
                        bgcolor: themeMode === 'dark' ? 'rgba(185, 149, 255, 0.15)' : '#EDE9FE',
                        color: themeMode === 'dark' ? '#F3EEFB' : '#382064',
                        fontWeight: 700,
                        px: 1,
                      }}
                    />
                    <Chip
                      label="Catálogo Oficial IES Ecuador"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(20, 184, 166, 0.12)',
                        color: '#14B8A6',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.2rem' },
                      fontWeight: 800,
                      color: themeMode === 'dark' ? '#F3EEFB' : '#382064',
                      lineHeight: 1.15,
                    }}
                  >
                    Gestión Académica Universitaria
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      color: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                      fontWeight: 700,
                      fontSize: { xs: '1.15rem', md: '1.35rem' },
                      mb: 2.5,
                    }}
                  >
                    Administración del Catálogo de Carreras y Facultades
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.12rem' },
                      lineHeight: 1.7,
                      maxWidth: 760,
                      mx: 'auto',
                      mb: 4.5,
                    }}
                  >
                    Supervisa la oferta académica de tercer nivel, actualiza facultades, sedes y modalidades,
                    y da seguimiento a las carreras con enlaces y vigencia oficial pendiente de verificación.
                  </Typography>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<TuneIcon />}
                      onClick={() => setActiveView('gestor-academico')}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.02rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                        boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)',
                      }}
                    >
                      Ir al Panel Académico
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<SchoolIcon />}
                      onClick={() => setActiveView('universidades')}
                      sx={{
                        py: 1.5,
                        px: 3.5,
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderColor: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                        color: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                      }}
                    >
                      Consultar Universidades
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<AccountBalanceIcon />}
                      onClick={() => setActiveView('oferta')}
                      sx={{
                        py: 1.5,
                        px: 3.5,
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        color: 'text.primary',
                      }}
                    >
                      Ver Catálogo
                    </Button>
                  </Stack>
                </Box>
              </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 6 }}>
              <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                  Herramientas del Gestor Académico
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
                  Funcionalidades especializadas para el mantenimiento de la oferta universitaria pública.
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(124, 58, 237, 0.12)' },
                      }}
                      onClick={() => setActiveView('gestor-academico')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <TuneIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                          Resumen del Catálogo
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Métricas de cobertura de las 31 universidades públicas, total de carreras registradas y registros preliminares.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(20, 184, 166, 0.15)' },
                      }}
                      onClick={() => setActiveView('gestor-academico')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(20, 184, 166, 0.15)', color: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <SchoolIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                          Gestión de Carreras
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Alta y edición de carreras, modalidades (presencial, en línea, híbrida), sedes cantonales y títulos otorgados.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)' },
                      }}
                      onClick={() => setActiveView('gestor-academico')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <BusinessIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                          Facultades y Unidades
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Estructuración de programas por facultades oficiales, estandarización de siglas y asignación por institución.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(245, 158, 11, 0.15)' },
                      }}
                      onClick={() => setActiveView('gestor-academico')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <AssignmentTurnedInIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                          Pendiente de Verificar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Filtro directo de carreras que requieren revisión de vigencia oficial, enlace web institucional o validación de sedes.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(124, 58, 237, 0.15)' },
                      }}
                      onClick={() => setActiveView('universidades')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <AccountBalanceIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                          Consulta de Universidades
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Exploración de las 31 instituciones públicas, campus matrices, sedes provinciales y estadísticas de su oferta.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(185, 149, 255, 0.15)' },
                      }}
                      onClick={() => setActiveView('perfil')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(185, 149, 255, 0.15)', color: '#B995FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <PersonIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                          Perfil del Gestor
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Consulta de credenciales del gestor institucional, correo activo y parámetros de sesión.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {renderPrincipios()}
              <TechnicalDiagnostics health={health} loading={healthLoading} onRefresh={loadHealth} />
            </Container>
          </>
        )}

        {/* INICIO - ROL: ADMINISTRADOR */}
        {activeView === 'inicio' && usuario?.rol === 'admin' && (
          <>
            <Box
              sx={{
                background: themeMode === 'dark'
                  ? 'linear-gradient(180deg, #1A1215 0%, #100D16 100%)'
                  : 'linear-gradient(180deg, #FFFFFF 0%, #FEF2F2 100%)',
                pt: { xs: 5, md: 8 },
                pb: { xs: 6, md: 8 },
                borderBottom: themeMode === 'dark'
                  ? '1px solid rgba(220, 38, 38, 0.2)'
                  : '1px solid rgba(220, 38, 38, 0.1)',
              }}
            >
              <Container maxWidth="lg">
                <Box sx={{ maxWidth: 880, mx: 'auto', textAlign: 'center' }}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 2.5 }}>
                    <Chip
                      icon={<AdminPanelSettingsIcon sx={{ fontSize: '1rem !important', color: '#DC2626' }} />}
                      label="Administración Central"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(239, 68, 68, 0.12)',
                        color: '#DC2626',
                        fontWeight: 700,
                        px: 1,
                      }}
                    />
                    <Chip
                      label="Control Global Nexora"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(124, 58, 237, 0.12)',
                        color: '#7C3AED',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.2rem' },
                      fontWeight: 800,
                      color: themeMode === 'dark' ? '#F3EEFB' : '#1F2937',
                      lineHeight: 1.15,
                    }}
                  >
                    Consola Administrativa Nexora
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      color: '#DC2626',
                      fontWeight: 700,
                      fontSize: { xs: '1.15rem', md: '1.35rem' },
                      mb: 2.5,
                    }}
                  >
                    Gestión de Usuarios, Asignación de Roles y Supervisión del Catálogo
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.12rem' },
                      lineHeight: 1.7,
                      maxWidth: 760,
                      mx: 'auto',
                      mb: 4.5,
                    }}
                  >
                    Administra las cuentas de usuarios y el personal académico, asigna permisos de gestor,
                    audita el catálogo de carreras y supervisa la seguridad del sistema.
                  </Typography>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AdminPanelSettingsIcon />}
                      onClick={() => setActiveView('admin-usuarios')}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: '1.02rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                        boxShadow: '0 6px 20px rgba(220, 38, 38, 0.3)',
                      }}
                    >
                      Usuarios y Roles
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<TuneIcon />}
                      onClick={() => setActiveView('gestor-academico')}
                      sx={{
                        py: 1.5,
                        px: 3.5,
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderColor: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                        color: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                      }}
                    >
                      Gestión del Catálogo
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<SchoolIcon />}
                      onClick={() => setActiveView('universidades')}
                      sx={{
                        py: 1.5,
                        px: 3.5,
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        color: 'text.primary',
                      }}
                    >
                      Consultar Universidades
                    </Button>
                  </Stack>
                </Box>
              </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 6 }}>
              <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: themeMode === 'dark' ? '#F3EEFB' : '#1F2937', mb: 1 }}>
                  Resumen Administrativo y Control
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
                  Herramientas reservadas para la administración integral de la plataforma.
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(220, 38, 38, 0.12)' },
                      }}
                      onClick={() => setActiveView('admin-usuarios')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(220, 38, 38, 0.12)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <GroupsIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#1F2937', mb: 1 }}>
                          Usuarios y Roles
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Administra las cuentas de estudiantes, gestores académicos y administradores. Asigna o modifica roles y estados.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        border: '1px solid rgba(124, 58, 237, 0.2)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(124, 58, 237, 0.12)' },
                      }}
                      onClick={() => setActiveView('gestor-academico')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <TuneIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                          Acceso a la Gestión del Catálogo
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Supervisión y actualización directa de la oferta académica de tercer nivel, facultades y sedes universitarias.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(20, 184, 166, 0.15)' },
                      }}
                      onClick={() => setActiveView('universidades')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(20, 184, 166, 0.15)', color: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <SchoolIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                          Consulta de Universidades
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Directorio de las 31 IES públicas del Ecuador, información institucional y carreras registradas.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(185, 149, 255, 0.15)' },
                      }}
                      onClick={() => setActiveView('perfil')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(185, 149, 255, 0.15)', color: '#B995FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                          <PersonIcon />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                          Perfil del Administrador
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Datos de la cuenta administrativa, credenciales seguras y parámetros institucionales.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {renderPrincipios()}
              <TechnicalDiagnostics health={health} loading={healthLoading} onRefresh={loadHealth} />
            </Container>
          </>
        )}

        {/* INICIO - ROL: ESTUDIANTE / INVITADO */}
        {activeView === 'inicio' && (!usuario || usuario.rol === 'estudiante') && (
          <>
            {/* Portada e Identidad Propia Nexora: Brújula Vocacional y Camino de Descubrimiento */}
            <HeroVocacional
              themeMode={themeMode}
              onStartQuestionnaire={handleStartQuestionnaire}
              onExplorarCarreras={() => {
                if (!usuario) {
                  handleOpenAuth('login');
                } else {
                  setActiveView('oferta');
                }
              }}
            />

            {/* Secciones: Cómo funciona Nexora y Preguntas frecuentes (Público y Estudiante) */}
            <ComoFuncionaYFaq themeMode={themeMode} />

            {/* Contenedor Principal: Módulos y Principios (Exclusivo para estudiantes autenticados) */}
            {usuario?.rol === 'estudiante' && (
              <Container maxWidth="lg" sx={{ py: 6 }}>
              {/* Sección de Módulos del Sistema */}
              <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: themeMode === 'dark' ? '#F3EEFB' : '#382064', mb: 1 }}>
                  Módulos y Arquitectura del Sistema
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
                  Estructura modular orientada a acompañar el proceso de decisión de los futuros universitarios.
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: themeMode === 'dark' ? 'rgba(185, 149, 255, 0.15)' : '#EDE9FE',
                            color: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <SecurityIcon />
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                            Cuentas y Seguridad
                          </Typography>
                          <Chip label="OPERATIVO" size="small" color="success" sx={{ fontSize: '0.65rem', height: 20 }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Registro e inicio de sesión seguro mediante tokens Bearer JWT y hash de contraseñas con
                          Argon2id. Aislamiento total de información personal.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: themeMode === 'dark' ? 'rgba(185, 149, 255, 0.15)' : '#EDE9FE',
                            color: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <PersonIcon />
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                            Perfil y Movilidad
                          </Typography>
                          <Chip label="OPERATIVO" size="small" color="success" sx={{ fontSize: '0.65rem', height: 20 }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Gestión de provincia, ciudad de origen, modalidad preferida (presencial, en línea, etc.)
                          y medio de transporte habitual.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                        },
                      }}
                      onClick={handleStartQuestionnaire}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: themeMode === 'dark' ? 'rgba(185, 149, 255, 0.15)' : '#EDE9FE',
                            color: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <QuizIcon />
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                            Cuestionario Vocacional
                          </Typography>
                          <Chip label="OPERATIVO" size="small" color="success" sx={{ fontSize: '0.65rem', height: 20 }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Instrumento orientativo de exploración de intereses y habilidades académicas con reglas
                          transparentes de ponderación por campo del saber.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                        },
                      }}
                      onClick={() => setActiveView('universidades')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: themeMode === 'dark' ? 'rgba(185, 149, 255, 0.15)' : '#EDE9FE',
                            color: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <SchoolIcon />
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                            Catálogo de Universidades
                          </Typography>
                          <Chip label="EXPLORAR" size="small" color="primary" sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700 }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Directorio de universidades y politécnicas públicas, sedes matrices, campus provinciales y
                          carreras vigentes agrupadas por facultades.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: themeMode === 'dark' ? 'rgba(185, 149, 255, 0.15)' : '#EDE9FE',
                            color: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <MapIcon />
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                            Proximidad y Traslado
                          </Typography>
                          <Chip label="OPERATIVO" size="small" color="success" sx={{ fontSize: '0.65rem', height: 20 }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Ordenamiento geodésico y estimación referencial de distancia y tiempos de viaje según
                          la ubicación del perfil del estudiante.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: themeMode === 'dark' ? 'rgba(185, 149, 255, 0.15)' : '#EDE9FE',
                            color: themeMode === 'dark' ? '#B995FF' : '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <PictureAsPdfIcon />
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                            Informe PDF y Correo
                          </Typography>
                          <Chip label="OPERATIVO" size="small" color="success" sx={{ fontSize: '0.65rem', height: 20 }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Generación automática de reporte vocacional formal mediante ReportLab y opción de despacho
                          directo al correo del estudiante.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                        },
                      }}
                      onClick={() => handleNavigate('favoritas')}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: themeMode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                            color: themeMode === 'dark' ? '#FBBF24' : '#D97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <StarIcon />
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: themeMode === 'dark' ? '#F3EEFB' : '#382064' }}>
                            Mis Carreras Favoritas
                          </Typography>
                          <Chip label="NUEVO" size="small" color="primary" sx={{ fontSize: '0.65rem', height: 20, fontWeight: 800 }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Guarda tus carreras de interés con la estrella ⭐, accede a su detalle completo y contrástalas
                          directamente en el comparador.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {renderPrincipios()}

              {/* Panel de Diagnóstico Técnico (Colocado en sección de desarrollo) */}
              <TechnicalDiagnostics
                health={health}
                loading={healthLoading}
                onRefresh={loadHealth}
              />
            </Container>
            )}
          </>
        )}

        {/* Vista: Mi Perfil */}
        {activeView === 'perfil' && usuario && (
          <ProfileView
            usuario={usuario}
            onProfileUpdated={(updated) => setUsuario(updated)}
            onNavigate={handleNavigate}
          />
        )}

        {/* Vista: Mis Carreras Favoritas */}
        {activeView === 'favoritas' && (
          (usuario?.rol === 'gestor' || usuario?.rol === 'admin') ? (
            <AccesoRestringido
              titulo="Mis Favoritas no disponible para este rol"
              mensaje={`La funcionalidad de guardar y consultar carreras favoritas está reservada exclusivamente para estudiantes. Tu cuenta tiene rol de ${usuario.rol === 'gestor' ? 'Gestor Académico' : 'Administrador'}.`}
              onVolver={handleVolverPanel}
              textoBoton={getBotonVolverTexto()}
              themeMode={themeMode}
            />
          ) : usuario ? (
            <FavoritosView
              onCompararCarrera={handleCompararCarrera}
              onExplorarCatalogo={() => setActiveView('oferta')}
              onIrAComparar={() => setActiveView('comparar')}
              onFavoritoChange={cargarFavoritosIds}
            />
          ) : (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
              <Paper sx={{ p: 5, borderRadius: 4, bgcolor: 'background.paper' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                  Inicia sesión para ver tus favoritas
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Las carreras favoritas se asocian de forma segura a tu cuenta personal para que puedas revisarlas en cualquier momento.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleOpenAuth('login')}
                  sx={{ background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)', px: 4, py: 1.3 }}
                >
                  Iniciar Sesión
                </Button>
              </Paper>
            </Container>
          )
        )}

        {/* Vista: Panel del Gestor Académico */}
        {activeView === 'gestor-academico' && (
          (usuario?.rol === 'gestor' || usuario?.rol === 'admin') ? (
            <GestorAcademicoView />
          ) : (
            <AccesoRestringido
              titulo="Acceso Restringido (403)"
              mensaje="Esta sección está reservada exclusivamente para cuentas con rol Gestor Académico o Administrador."
              onVolver={() => setActiveView('inicio')}
              textoBoton="Volver al Inicio"
              themeMode={themeMode}
            />
          )
        )}

        {/* Vista: Administración de Usuarios y Roles */}
        {activeView === 'admin-usuarios' && (
          usuario?.rol === 'admin' ? (
            <AdminUsuariosView />
          ) : (
            <AccesoRestringido
              titulo="Acceso Restringido (403)"
              mensaje="Esta sección requiere privilegios de Administrador del sistema."
              onVolver={handleVolverPanel}
              textoBoton={getBotonVolverTexto()}
              themeMode={themeMode}
            />
          )
        )}

        {/* Vista: Cuestionario Vocacional */}
        {activeView === 'cuestionario' && (
          (usuario?.rol === 'gestor' || usuario?.rol === 'admin') ? (
            <AccesoRestringido
              titulo="Test Vocacional no disponible para este rol"
              mensaje={`El cuestionario de orientación vocacional está reservado para estudiantes. Tu cuenta tiene rol de ${usuario.rol === 'gestor' ? 'Gestor Académico' : 'Administrador'}.`}
              onVolver={handleVolverPanel}
              textoBoton={getBotonVolverTexto()}
              themeMode={themeMode}
            />
          ) : (
            <CuestionarioView
              onEvaluacionCompletada={handleCuestionarioCompletado}
              onCancelar={() => setActiveView('inicio')}
            />
          )
        )}

        {/* Vista: Resultados de Afinidad */}
        {activeView === 'resultados' && (
          (usuario?.rol === 'gestor' || usuario?.rol === 'admin') ? (
            <AccesoRestringido
              titulo="Resultados vocacionales no disponibles"
              mensaje={`La consulta de afinidades y resultados personales es exclusiva de cuentas de estudiantes. Como ${usuario.rol === 'gestor' ? 'Gestor Académico' : 'Administrador'}, utiliza tu panel para consultar o supervisar el catálogo institucional.`}
              onVolver={handleVolverPanel}
              textoBoton={getBotonVolverTexto()}
              themeMode={themeMode}
            />
          ) : evaluacionActual ? (
            <ResultadosView
              resultado={evaluacionActual}
              userEmail={usuario?.email || ''}
              onNuevoCuestionario={() => setActiveView('cuestionario')}
              carrerasSeleccionadas={carrerasComparar}
              onToggleCarreraComparar={handleToggleCarreraComparar}
              onIrAComparar={() => setActiveView('comparar')}
              favoritosIds={favoritosIds}
              onToggleFavorito={handleToggleFavorito}
            />
          ) : (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
              <Paper sx={{ p: 5, borderRadius: 4, bgcolor: 'background.paper' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                  No hay una evaluación activa
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Complete el cuestionario de intereses o elija una evaluación guardada en su historial para ver sus sugerencias vocacionales y opciones universitarias.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setActiveView('cuestionario')}
                  sx={{ background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)', px: 4, py: 1.3 }}
                >
                  Comenzar Cuestionario
                </Button>
              </Paper>
            </Container>
          )
        )}

        {/* Vista: Comparador de Carreras */}
        {activeView === 'comparar' && (
          (usuario?.rol === 'gestor' || usuario?.rol === 'admin') ? (
            <AccesoRestringido
              titulo="Comparador Estudiantil no disponible"
              mensaje={`El comparador de opciones vocacionales está diseñado para la toma de decisión del estudiante. Como ${usuario.rol === 'gestor' ? 'Gestor Académico' : 'Administrador'}, utiliza las herramientas del panel de catálogo.`}
              onVolver={handleVolverPanel}
              textoBoton={getBotonVolverTexto()}
              themeMode={themeMode}
            />
          ) : (
            <CompararView
              carrerasSeleccionadas={carrerasComparar}
              recomendacionesEvaluacion={evaluacionActual?.carreras_sugeridas || []}
              tieneEvaluacion={Boolean(evaluacionActual)}
              onToggleCarrera={handleToggleCarreraComparar}
              onRemoverCarrera={handleRemoverCarreraComparar}
              onLimpiarSeleccion={handleLimpiarCarrerasComparar}
              onIrACuestionario={() => setActiveView('cuestionario')}
              onVolver={() => setActiveView(evaluacionActual ? 'resultados' : 'inicio')}
            />
          )
        )}

        {/* Vista: Directorio de Universidades e IES Públicas */}
        {activeView === 'universidades' && (
          <UniversidadesView
            carrerasSeleccionadas={carrerasComparar}
            onToggleCarreraComparar={handleToggleCarreraComparar}
            onIrAComparar={() => setActiveView('comparar')}
            favoritosIds={favoritosIds}
            onToggleFavorito={handleToggleFavorito}
            usuarioRole={usuario?.rol}
          />
        )}

        {/* Vista: Catálogo de Oferta Académica */}
        {activeView === 'oferta' && (
          <CatalogoView
            onCompararCarrera={handleCompararCarrera}
            favoritosIds={favoritosIds}
            onToggleFavorito={handleToggleFavorito}
            usuarioRole={usuario?.rol}
          />
        )}

        {/* Vista: Historial de Evaluaciones */}
        {activeView === 'historial' && (
          (usuario?.rol === 'gestor' || usuario?.rol === 'admin') ? (
            <AccesoRestringido
              titulo="Historial de evaluaciones no disponible"
              mensaje="El historial de evaluaciones vocacionales corresponde a cuentas de estudiantes."
              onVolver={handleVolverPanel}
              textoBoton={getBotonVolverTexto()}
              themeMode={themeMode}
            />
          ) : (
            <HistorialView
              userEmail={usuario?.email || ''}
              onVerDetalle={(evaluacion) => {
                setEvaluacionActual(evaluacion);
                setActiveView('resultados');
              }}
              onNuevoCuestionario={() => setActiveView('cuestionario')}
            />
          )
        )}
      </Box>

      {/* Pie de Página */}
      <Box
        component="footer"
        sx={{
          bgcolor: themeMode === 'dark' ? '#161120' : '#382064',
          color: '#EDE9FE',
          py: 4,
          px: 2,
          mt: 'auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            NEXORA &copy; {new Date().getFullYear()} — Sistema Web de Orientación Vocacional y Consulta de Universidades Públicas del Ecuador
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(237, 233, 254, 0.7)', display: 'block', mt: 0.5 }}>
            Monolito Modular por Capas • React 19 + TypeScript + Vite + FastAPI + PostgreSQL + Argon2id + JWT
          </Typography>
        </Container>
      </Box>

      {/* Feedback Toast */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert
            severity={toast.type}
            onClose={() => setToast(null)}
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(56, 32, 100, 0.15)',
              bgcolor: toast.type === 'success' ? (themeMode === 'dark' ? 'rgba(20, 184, 166, 0.18)' : '#F0FDF4') : undefined,
              color: toast.type === 'success' ? (themeMode === 'dark' ? '#2DD4BF' : '#065F46') : undefined,
            }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default App;
