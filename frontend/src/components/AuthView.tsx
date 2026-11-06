import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  IconButton,
  MenuItem,
  Grid,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import DirectionsBusOutlinedIcon from '@mui/icons-material/DirectionsBusOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

import { authService } from '../services/api';
import type { AuthResponse } from '../services/api';

interface AuthViewProps {
  initialMode: 'login' | 'register';
  onSuccess: (authData: AuthResponse) => void;
  onVolverInicio: () => void;
  themeMode?: 'light' | 'dark';
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

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode,
  onSuccess,
  onVolverInicio,
  themeMode = 'light',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Campos Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Campos Registro
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regProvincia, setRegProvincia] = useState('Pichincha');
  const [regCiudad, setRegCiudad] = useState('Quito');
  const [regModalidad, setRegModalidad] = useState('Presencial');
  const [regTransporte, setRegTransporte] = useState('Transporte público');

  useEffect(() => {
    setTab(initialMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialMode]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Por favor ingrese su correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(loginEmail.trim(), loginPassword);
      setSuccessMsg('¡Inicio de sesión exitoso! Bienvenido a Nexora.');
      setTimeout(() => {
        onSuccess(res);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regNombre.trim().length < 3) {
      setErrorMsg('El nombre completo debe tener al menos 3 caracteres.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Por favor ingrese un correo electrónico válido.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMsg('La contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        nombre_completo: regNombre.trim(),
        email: regEmail.trim(),
        password: regPassword,
        provincia: regProvincia,
        ciudad: regCiudad.trim(),
        modalidad_preferida: regModalidad,
        medio_transporte: regTransporte,
      });
      setSuccessMsg('¡Registro completado con éxito! Bienvenido a Nexora.');
      setTimeout(() => {
        onSuccess(res);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(124, 58, 237, 0.02)',
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 58, 237, 0.04)',
      },
      '&.Mui-focused': {
        bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: { xs: 3, sm: 5 },
        px: 2,
        background:
          themeMode === 'dark'
            ? 'radial-gradient(ellipse at 50% 20%, #201633 0%, #0F0A18 100%)'
            : 'radial-gradient(ellipse at 50% 20%, #F5F3FF 0%, #EDE9FE 100%)',
      }}
    >
      <Container maxWidth="sm" sx={{ my: 'auto' }}>
        {/* Ventana de Autenticación Nexora */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 4, sm: 5 },
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor:
              themeMode === 'dark'
                ? 'rgba(185, 149, 255, 0.22)'
                : 'rgba(124, 58, 237, 0.18)',
            boxShadow:
              themeMode === 'dark'
                ? '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(124, 58, 237, 0.18)'
                : '0 24px 60px rgba(56, 32, 100, 0.18), 0 4px 16px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Encabezado con degradado morado, icono de función, título destacado y botón de cierre */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
              p: { xs: 2.5, sm: 3.2 },
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Resplandor decorativo sutil */}
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    bgcolor: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                    flexShrink: 0,
                  }}
                >
                  {tab === 'login' ? (
                    <LockOutlinedIcon sx={{ fontSize: 25 }} />
                  ) : (
                    <PersonAddOutlinedIcon sx={{ fontSize: 25 }} />
                  )}
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                      fontWeight: 900,
                      color: '#FFFFFF',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      fontSize: { xs: '1.25rem', sm: '1.45rem' },
                    }}
                  >
                    {tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.88)',
                      fontWeight: 600,
                      display: 'block',
                      mt: 0.3,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {tab === 'login'
                      ? 'NEXORA • Acceso al Sistema Académico'
                      : 'NEXORA • Registro de Orientación Vocacional'}
                  </Typography>
                </Box>
              </Box>

              {/* Botón de cierre */}
              <IconButton
                aria-label="Cerrar ventana y volver al inicio público"
                onClick={onVolverInicio}
                size="small"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  bgcolor: 'rgba(255, 255, 255, 0.14)',
                  borderRadius: '10px',
                  p: 0.9,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                    transform: 'scale(1.06)',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Selector de pestañas moderno tipo pill */}
          <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: 1 }}>
            <Tabs
              value={tab}
              onChange={(_, val) => {
                setTab(val);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              variant="fullWidth"
              sx={{
                bgcolor:
                  themeMode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(124, 58, 237, 0.06)',
                borderRadius: 3,
                p: 0.6,
                minHeight: 46,
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': {
                  minHeight: 40,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textTransform: 'none',
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: themeMode === 'dark' ? '#7C3AED' : '#FFFFFF',
                    color: themeMode === 'dark' ? '#FFFFFF' : '#382064',
                    boxShadow:
                      themeMode === 'dark'
                        ? '0 4px 14px rgba(0, 0, 0, 0.5)'
                        : '0 2px 10px rgba(56, 32, 100, 0.12)',
                  },
                },
              }}
            >
              <Tab
                value="login"
                icon={<LockOutlinedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Iniciar Sesión"
              />
              <Tab
                value="register"
                icon={<PersonAddOutlinedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Crear Cuenta"
              />
            </Tabs>
          </Box>

          {/* Cuerpo con distribución cómoda y campos con estilo uniforme */}
          <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pb: { xs: 3, sm: 3.5 }, pt: 1.5 }}>
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5, fontWeight: 600 }}>
                {errorMsg}
              </Alert>
            )}

            {successMsg && (
              <Alert
                severity="success"
                icon={<CheckCircle sx={{ color: '#14B8A6' }} />}
                sx={{
                  mb: 2.5,
                  borderRadius: 2.5,
                  fontWeight: 600,
                  bgcolor: themeMode === 'dark' ? 'rgba(20, 184, 166, 0.15)' : '#F0FDF4',
                  color: themeMode === 'dark' ? '#2DD4BF' : '#065F46',
                }}
              >
                {successMsg}
              </Alert>
            )}

            {/* Formulario de Inicio de Sesión */}
            {tab === 'login' && (
              <Box component="form" onSubmit={handleLoginSubmit}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  Ingrese sus credenciales registradas para acceder a su diagnóstico vocacional, carreras favoritas y panel académico.
                </Typography>

                <Stack spacing={2.5}>
                  <TextField
                    id="login-email"
                    label="Correo Electrónico"
                    type="email"
                    required
                    fullWidth
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ejemplo@universidad.edu.ec"
                    autoComplete="email"
                    sx={fieldStyle}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    id="login-password"
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    required
                    fullWidth
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    sx={fieldStyle}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: 'text.secondary' }}
                            >
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  {/* Jerarquía de botones: Acción principal morada y acción secundaria discreta */}
                  <Button
                    id="btn-submit-login"
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{
                      mt: 1.5,
                      py: 1.4,
                      fontWeight: 800,
                      fontSize: '0.98rem',
                      borderRadius: 2.5,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                      boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6D28D9 0%, #2E1065 100%)',
                        boxShadow: '0 8px 24px rgba(124, 58, 237, 0.55)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Acceder al Sistema'}
                  </Button>

                  <Button
                    variant="text"
                    fullWidth
                    onClick={onVolverInicio}
                    startIcon={<ArrowBackIcon fontSize="small" />}
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      borderRadius: 2.5,
                      py: 0.9,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                      },
                    }}
                  >
                    Volver al inicio público
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Formulario de Registro */}
            {tab === 'register' && (
              <Box component="form" onSubmit={handleRegisterSubmit}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  Cree su cuenta gratuita para registrar sus respuestas, recibir su informe vocacional en PDF y consultar universidades afines.
                </Typography>

                <Stack spacing={2.2}>
                  <TextField
                    id="register-nombre"
                    label="Nombres y Apellidos"
                    required
                    fullWidth
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Ej. Mateo Sebastián Morales"
                    sx={fieldStyle}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonAddOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    id="register-email"
                    label="Correo Electrónico"
                    type="email"
                    required
                    fullWidth
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="estudiante@correo.com"
                    sx={fieldStyle}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    id="register-password"
                    label="Contraseña (mínimo 8 caracteres)"
                    type={showPassword ? 'text' : 'password'}
                    required
                    fullWidth
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    helperText="Cifrada con Argon2id de máxima seguridad"
                    sx={fieldStyle}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: 'text.secondary' }}
                            >
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        id="register-provincia"
                        select
                        label="Provincia"
                        fullWidth
                        value={regProvincia}
                        onChange={(e) => setRegProvincia(e.target.value)}
                        sx={fieldStyle}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <MapOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          },
                        }}
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
                        id="register-ciudad"
                        label="Ciudad / Cantón"
                        fullWidth
                        value={regCiudad}
                        onChange={(e) => setRegCiudad(e.target.value)}
                        placeholder="Ej. Quito, Guayaquil, Machala"
                        sx={fieldStyle}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationCityOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        id="register-modalidad"
                        select
                        label="Modalidad Preferida"
                        fullWidth
                        value={regModalidad}
                        onChange={(e) => setRegModalidad(e.target.value)}
                        sx={fieldStyle}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SchoolOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      >
                        <MenuItem value="Presencial">Presencial</MenuItem>
                        <MenuItem value="En Línea">En Línea</MenuItem>
                        <MenuItem value="Semipresencial">Semipresencial</MenuItem>
                        <MenuItem value="Híbrida">Híbrida</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        id="register-transporte"
                        select
                        label="Medio de Transporte"
                        fullWidth
                        value={regTransporte}
                        onChange={(e) => setRegTransporte(e.target.value)}
                        sx={fieldStyle}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <DirectionsBusOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      >
                        <MenuItem value="Transporte público">Transporte público</MenuItem>
                        <MenuItem value="Vehículo propio">Vehículo propio</MenuItem>
                        <MenuItem value="Bicicleta">Bicicleta</MenuItem>
                        <MenuItem value="A pie">A pie</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  {/* Jerarquía de botones: Acción principal morada y acción secundaria discreta */}
                  <Button
                    id="btn-submit-register"
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 1.5,
                      py: 1.4,
                      fontWeight: 800,
                      fontSize: '0.98rem',
                      borderRadius: 2.5,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
                      boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6D28D9 0%, #0D9488 100%)',
                        boxShadow: '0 8px 24px rgba(124, 58, 237, 0.55)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Completar Registro'}
                  </Button>

                  <Button
                    variant="text"
                    fullWidth
                    onClick={onVolverInicio}
                    startIcon={<ArrowBackIcon fontSize="small" />}
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      borderRadius: 2.5,
                      py: 0.9,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                      },
                    }}
                  >
                    Volver al inicio público
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
