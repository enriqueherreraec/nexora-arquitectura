import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Paper,
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
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

import { adminUsuariosService } from '../services/api';
import type { AdminUsuario, AdminCrearUsuarioRequest } from '../services/api';

const ROLES = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'gestor', label: 'Gestor Académico' },
  { value: 'admin', label: 'Administrador' },
];

export const AdminUsuariosView: React.FC = () => {
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroRol, setFiltroRol] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal para crear usuario
  const [modalCrearOpen, setModalCrearOpen] = useState<boolean>(false);
  const [formCrear, setFormCrear] = useState<AdminCrearUsuarioRequest>({
    nombre_completo: '',
    email: '',
    password: '',
    rol: 'gestor',
  });
  const [guardando, setGuardando] = useState<boolean>(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarUsuarios();
  }, [filtroRol]);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await adminUsuariosService.getUsuarios(filtroRol || undefined);
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error al cargar usuarios.' });
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarRol = async (usuarioId: number, nuevoRol: string) => {
    try {
      await adminUsuariosService.actualizarRol(usuarioId, nuevoRol);
      setToast({ type: 'success', message: `Rol actualizado correctamente a «${nuevoRol}».` });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioId ? { ...u, rol: nuevoRol } : u))
      );
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'No se pudo actualizar el rol.' });
    }
  };

  const handleCambiarEstado = async (usuarioId: number, estadoActual: boolean) => {
    const nuevoEstado = !estadoActual;
    try {
      await adminUsuariosService.actualizarEstado(usuarioId, nuevoEstado);
      setToast({
        type: 'success',
        message: nuevoEstado ? 'Usuario activado exitosamente.' : 'Usuario desactivado exitosamente.',
      });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioId ? { ...u, activo: nuevoEstado } : u))
      );
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'No se pudo actualizar el estado del usuario.' });
    }
  };

  const handleCrearUsuario = async () => {
    const errors: Record<string, string> = {};
    if (!formCrear.nombre_completo.trim()) errors.nombre_completo = 'El nombre es obligatorio.';
    if (!formCrear.email.trim() || !formCrear.email.includes('@')) errors.email = 'Ingrese un email válido.';
    if (!formCrear.password || formCrear.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    if (!formCrear.rol) errors.rol = 'Seleccione un rol.';

    if (Object.keys(errors).length > 0) {
      setErroresForm(errors);
      return;
    }

    setGuardando(true);
    setErroresForm({});
    try {
      await adminUsuariosService.crearUsuario({
        ...formCrear,
        nombre_completo: formCrear.nombre_completo.trim(),
        email: formCrear.email.trim().toLowerCase(),
      });
      setToast({ type: 'success', message: `Usuario «${formCrear.email}» creado con rol «${formCrear.rol}».` });
      setModalCrearOpen(false);
      setFormCrear({ nombre_completo: '', email: '', password: '', rol: 'gestor' });
      cargarUsuarios();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error al crear usuario.' });
    } finally {
      setGuardando(false);
    }
  };

  const getRolChip = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Chip label="Administrador" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#DC2626', fontWeight: 800 }} />;
      case 'gestor':
        return <Chip label="Gestor Académico" size="small" sx={{ bgcolor: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED', fontWeight: 800 }} />;
      default:
        return <Chip label="Estudiante" size="small" sx={{ bgcolor: 'rgba(20, 184, 166, 0.15)', color: '#0D9488', fontWeight: 700 }} />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #DC2626 0%, #7C3AED 100%)',
              color: '#FFFFFF',
              display: 'flex',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.45rem', sm: '2rem' } }}>
              Administración de Usuarios y Roles
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestión centralizada de cuentas de acceso, asignación de privilegios de Gestor Académico y control de estado.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {toast && (
        <Alert severity={toast.type} onClose={() => setToast(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {toast.message}
        </Alert>
      )}

      {/* Barra de Filtros y Acción */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
        <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Filtrar por rol"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <MenuItem value="">Todos los roles</MenuItem>
              {ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                justifyContent: { xs: 'stretch', sm: 'flex-end' },
                '& .MuiButton-root': { flex: { xs: 1, sm: 'none' } },
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={cargarUsuarios}
                sx={{ fontWeight: 700 }}
              >
                Refrescar
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => {
                  setErroresForm({});
                  setModalCrearOpen(true);
                }}
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                }}
              >
                Crear Usuario
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de Usuarios */}
      {loading ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: '#7C3AED', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Consultando usuarios registrados...
          </Typography>
        </Box>
      ) : usuarios.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron usuarios registrados con el criterio seleccionado.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB') }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Rol Actual</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Asignar Rol</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Registrado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {u.nombre_completo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {u.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{getRolChip(u.rol)}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      select
                      value={u.rol}
                      onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                      sx={{ minWidth: 160 }}
                    >
                      {ROLES.map((r) => (
                        <MenuItem key={r.value} value={r.value}>
                          {r.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={u.activo}
                          onChange={() => handleCambiarEstado(u.id, u.activo)}
                          size="small"
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </Typography>
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(u.creado_en).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Crear Usuario */}
      <Dialog
        open={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
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
              <PersonAddIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.2rem' } }}>
              Crear Nueva Cuenta de Usuario
            </Typography>
          </Box>
          <IconButton
            aria-label="Cerrar ventana"
            onClick={() => setModalCrearOpen(false)}
            size="small"
            disabled={guardando}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Nombre Completo"
              value={formCrear.nombre_completo}
              onChange={(e) => setFormCrear({ ...formCrear, nombre_completo: e.target.value })}
              error={Boolean(erroresForm.nombre_completo)}
              helperText={erroresForm.nombre_completo}
              required
            />
            <TextField
              fullWidth
              type="email"
              label="Correo Electrónico"
              value={formCrear.email}
              onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })}
              error={Boolean(erroresForm.email)}
              helperText={erroresForm.email}
              required
            />
            <TextField
              fullWidth
              type="password"
              label="Contraseña"
              value={formCrear.password}
              onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })}
              error={Boolean(erroresForm.password)}
              helperText={erroresForm.password || 'Mínimo 6 caracteres'}
              required
            />
            <TextField
              fullWidth
              select
              label="Rol a Asignar"
              value={formCrear.rol}
              onChange={(e) => setFormCrear({ ...formCrear, rol: e.target.value })}
              required
            >
              <MenuItem value="gestor">Gestor Académico (Administra catálogo y facultades)</MenuItem>
              <MenuItem value="admin">Administrador (Control total del sistema y usuarios)</MenuItem>
              <MenuItem value="estudiante">Estudiante (Acceso a cuestionario y favoritos)</MenuItem>
            </TextField>
          </Stack>
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
            onClick={() => setModalCrearOpen(false)}
            disabled={guardando}
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
            onClick={handleCrearUsuario}
            disabled={guardando}
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
            {guardando ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
