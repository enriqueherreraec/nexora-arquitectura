import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
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
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { authService } from '../services/api';
import type { AuthResponse } from '../services/api';

interface AuthModalProps {
  open: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (authData: AuthResponse) => void;
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

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  initialMode,
  onClose,
  onSuccess,
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

  // Sincronizar tab si initialMode cambia
  React.useEffect(() => {
    setTab(initialMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialMode, open]);

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
      setSuccessMsg('¡Inicio de sesión exitoso! Bienvenido de nuevo a Nexora.');
      setTimeout(() => {
        onSuccess(res);
        onClose();
      }, 700);
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
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: { xs: 1, sm: 2 },
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            m: { xs: 1.5, sm: 'auto' },
            width: { xs: 'calc(100% - 24px)', sm: '100%' },
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 40px rgba(0, 0, 0, 0.6)'
                : '0 12px 40px rgba(56, 32, 100, 0.18)',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0 }}>
        {/* Selector de pestañas */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, val) => {
              setTab(val);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              value="login"
              icon={<LockOutlinedIcon />}
              iconPosition="start"
              label="Iniciar Sesión"
              sx={{ fontWeight: 700, fontSize: '0.95rem' }}
            />
            <Tab
              value="register"
              icon={<PersonAddOutlinedIcon />}
              iconPosition="start"
              label="Crear Cuenta"
              sx={{ fontWeight: 700, fontSize: '0.95rem' }}
            />
          </Tabs>
        </Box>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {successMsg && (
          <Alert
            severity="success"
            icon={<CheckCircle sx={{ color: '#14B8A6' }} />}
            sx={{
              mb: 2.5,
              borderRadius: 2,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(20, 184, 166, 0.15)' : '#F0FDF4',
              color: (theme) => theme.palette.mode === 'dark' ? '#2DD4BF' : '#065F46',
            }}
          >
            {successMsg}
          </Alert>
        )}

        {/* Formulario de Inicio de Sesión */}
        {tab === 'login' && (
          <Box component="form" onSubmit={handleLoginSubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Ingrese las credenciales de su cuenta académica de Nexora para acceder a sus evaluaciones y perfil.
            </Typography>

            <Stack spacing={2.2}>
              <TextField
                id="login-email"
                label="Correo Electrónico"
                type="email"
                required
                fullWidth
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="ejemplo@universidad.edu.ec"
              />

              <TextField
                id="login-password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                id="btn-submit-login"
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.3,
                  fontWeight: 700,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Acceder al Sistema'}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Formulario de Registro */}
        {tab === 'register' && (
          <Box component="form" onSubmit={handleRegisterSubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Cree su cuenta para guardar su historial de evaluaciones vocacionales y consultar universidades públicas afines.
            </Typography>

            <Stack spacing={2}>
              <TextField
                id="register-nombre"
                label="Nombres y Apellidos"
                required
                fullWidth
                value={regNombre}
                onChange={(e) => setRegNombre(e.target.value)}
                placeholder="Ej. Mateo Sebastián Morales"
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
              />

              <TextField
                id="register-password"
                label="Contraseña (mínimo 8 caracteres)"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                helperText="Protegida criptográficamente con Argon2id"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
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
                    label="Provincia de Residencia"
                    fullWidth
                    value={regProvincia}
                    onChange={(e) => setRegProvincia(e.target.value)}
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
                    label="Ciudad o Cantón"
                    fullWidth
                    value={regCiudad}
                    onChange={(e) => setRegCiudad(e.target.value)}
                    placeholder="Ej. Quito, Guayaquil, Cuenca"
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
                  >
                    <MenuItem value="Transporte público">Transporte público</MenuItem>
                    <MenuItem value="Vehículo propio">Vehículo propio</MenuItem>
                    <MenuItem value="Bicicleta">Bicicleta</MenuItem>
                    <MenuItem value="A pie">A pie</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Button
                id="btn-submit-register"
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.3,
                  fontWeight: 700,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Completar Registro'}
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
