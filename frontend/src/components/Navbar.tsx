import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Stack,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import StarIcon from '@mui/icons-material/Star';
import TuneIcon from '@mui/icons-material/Tune';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { Usuario } from '../services/api';

const getInitials = (nombre?: string): string => {
  if (!nombre) return 'U';
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const getRoleBadge = (rol?: string, darkMode?: boolean) => {
  switch (rol) {
    case 'admin':
      return {
        label: 'Administrador',
        color: darkMode ? '#FCA5A5' : '#DC2626',
        bgcolor: darkMode ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.08)',
        borderColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
      };
    case 'gestor':
      return {
        label: 'Gestor Académico',
        color: darkMode ? '#D8B4FE' : '#7C3AED',
        bgcolor: darkMode ? 'rgba(185, 149, 255, 0.16)' : 'rgba(124, 58, 237, 0.08)',
        borderColor: darkMode ? 'rgba(185, 149, 255, 0.3)' : 'rgba(124, 58, 237, 0.2)',
      };
    default:
      return {
        label: 'Estudiante',
        color: darkMode ? '#5EEAD4' : '#0D9488',
        bgcolor: darkMode ? 'rgba(20, 184, 166, 0.16)' : 'rgba(20, 184, 166, 0.08)',
        borderColor: darkMode ? 'rgba(20, 184, 166, 0.3)' : 'rgba(20, 184, 166, 0.2)',
      };
  }
};

interface NavbarProps {
  usuario: Usuario | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSidebar: () => void;
  onOpenAuth: (modo: 'login' | 'register') => void;
  onLogout: () => void;
  onNavigate: (vista: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  usuario,
  darkMode,
  onToggleDarkMode,
  onOpenSidebar,
  onOpenAuth,
  onLogout,
  onNavigate,
}) => {
  if (!usuario) {
    return null;
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: darkMode ? '#161120' : '#382064',
        borderBottom: darkMode ? '1px solid rgba(185, 149, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onOpenSidebar}
            sx={{ mr: 0.5, color: '#EDE9FE' }}
            aria-label="abrir menú lateral"
          >
            <MenuIcon />
          </IconButton>

          <Box
            onClick={() => onNavigate('inicio')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
              }}
            >
              <SchoolIcon fontSize="small" />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    color: '#FFFFFF',
                    lineHeight: 1.1,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  }}
                >
                  NEXORA
                </Typography>
                <Chip
                  label="v0.3.0"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(20, 184, 166, 0.25)',
                    color: '#2DD4BF',
                    border: '1px solid rgba(45, 212, 191, 0.4)',
                    px: 0.5,
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: '#EDE9FE',
                  opacity: 0.85,
                  fontSize: '0.72rem',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Orientación Vocacional • Universidades Públicas del Ecuador
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Tooltip title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            <IconButton
              id="btn-toggle-dark-mode"
              onClick={onToggleDarkMode}
              sx={{
                color: '#EDE9FE',
                bgcolor: 'rgba(237, 233, 254, 0.1)',
                border: '1px solid rgba(237, 233, 254, 0.2)',
                borderRadius: '10px',
                p: 0.8,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'rgba(237, 233, 254, 0.2)',
                },
              }}
              aria-label="alternar modo claro y oscuro"
            >
              {darkMode ? (
                <LightModeIcon sx={{ fontSize: 20, color: '#FDE047' }} />
              ) : (
                <DarkModeIcon sx={{ fontSize: 20, color: '#EDE9FE' }} />
              )}
            </IconButton>
          </Tooltip>

          {usuario ? (
            <>
              {/* Trigger del menú de usuario con avatar e indicador desplegable */}
              <Box
                id="btn-menu-usuario"
                onClick={handleOpenMenu}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  pl: 0.75,
                  pr: { xs: 1, sm: 1.5 },
                  py: 0.5,
                  borderRadius: '24px',
                  bgcolor: Boolean(anchorEl)
                    ? 'rgba(237, 233, 254, 0.25)'
                    : 'rgba(237, 233, 254, 0.14)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  border: '1px solid rgba(237, 233, 254, 0.25)',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    bgcolor: 'rgba(237, 233, 254, 0.25)',
                    borderColor: 'rgba(237, 233, 254, 0.4)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                    color: '#FFFFFF',
                    width: 28,
                    height: 28,
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  {usuario.nombre_completo.charAt(0).toUpperCase()}
                </Avatar>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#FFFFFF',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {usuario.nombre_completo.split(' ')[0]}
                </Typography>
                <KeyboardArrowDownIcon
                  sx={{
                    fontSize: 18,
                    color: '#EDE9FE',
                    transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </Box>

              {/* Menú desplegable rediseñado de la cuenta */}
              <Menu
                id="menu-cuenta-usuario"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      borderRadius: '18px',
                      width: { xs: 280, sm: 320 },
                      maxWidth: 'calc(100vw - 24px)',
                      maxHeight: 'calc(100vh - 80px)',
                      mt: 1.5,
                      overflowX: 'hidden',
                      overflowY: 'auto',
                      bgcolor: darkMode ? '#181222' : '#FFFFFF',
                      border: darkMode
                        ? '1px solid rgba(185, 149, 255, 0.18)'
                        : '1px solid rgba(124, 58, 237, 0.12)',
                      boxShadow: darkMode
                        ? '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(124, 58, 237, 0.15)'
                        : '0 16px 40px rgba(56, 32, 100, 0.14), 0 4px 12px rgba(124, 58, 237, 0.08)',
                      p: 0,
                    },
                  },
                }}
              >
                {/* Cabecera con degradado morado suave */}
                <Box
                  sx={{
                    p: 2.25,
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.28) 0%, rgba(56, 32, 100, 0.45) 100%)'
                      : 'linear-gradient(135deg, #F8F4FD 0%, #EDE9FE 100%)',
                    borderBottom: darkMode
                      ? '1px solid rgba(185, 149, 255, 0.14)'
                      : '1px solid rgba(124, 58, 237, 0.1)',
                  }}
                >
                  <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        letterSpacing: '0.03em',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
                        border: darkMode
                          ? '2px solid rgba(185, 149, 255, 0.3)'
                          : '2px solid #FFFFFF',
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(usuario.nombre_completo)}
                    </Avatar>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                          color: darkMode ? '#F3EEFB' : '#382064',
                          lineHeight: 1.25,
                          fontSize: '0.98rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {usuario.nombre_completo}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: darkMode ? '#A89EB9' : '#716B86',
                          display: 'block',
                          fontSize: '0.78rem',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mb: 0.75,
                        }}
                      >
                        {usuario.email}
                      </Typography>
                      <Chip
                        label={getRoleBadge(usuario.rol, darkMode).label}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          bgcolor: getRoleBadge(usuario.rol, darkMode).bgcolor,
                          color: getRoleBadge(usuario.rol, darkMode).color,
                          border: `1px solid ${getRoleBadge(usuario.rol, darkMode).borderColor}`,
                          px: 0.5,
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>

                {/* Lista de Opciones */}
                <Box sx={{ py: 1 }}>
                  {usuario.rol === 'admin' && (
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu();
                        onNavigate('admin-usuarios');
                      }}
                      sx={{
                        px: 2,
                        py: 1.25,
                        mx: 1,
                        my: 0.35,
                        borderRadius: '12px',
                        transition: 'all 0.18s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        color: darkMode ? '#F3EEFB' : '#252238',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(185, 149, 255, 0.12)' : 'rgba(124, 58, 237, 0.08)',
                          color: darkMode ? '#FFFFFF' : '#382064',
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          bgcolor: darkMode ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.08)',
                          color: darkMode ? '#FCA5A5' : '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <AdminPanelSettingsIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        Usuarios y Roles
                      </Typography>
                    </MenuItem>
                  )}

                  {(usuario.rol === 'gestor' || usuario.rol === 'admin') && (
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu();
                        onNavigate('gestor-academico');
                      }}
                      sx={{
                        px: 2,
                        py: 1.25,
                        mx: 1,
                        my: 0.35,
                        borderRadius: '12px',
                        transition: 'all 0.18s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        color: darkMode ? '#F3EEFB' : '#252238',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(185, 149, 255, 0.12)' : 'rgba(124, 58, 237, 0.08)',
                          color: darkMode ? '#FFFFFF' : '#382064',
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          bgcolor: darkMode ? 'rgba(185, 149, 255, 0.16)' : 'rgba(124, 58, 237, 0.08)',
                          color: darkMode ? '#D8B4FE' : '#7C3AED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <TuneIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        Gestor Académico
                      </Typography>
                    </MenuItem>
                  )}

                  {(!usuario.rol || usuario.rol === 'estudiante') && (
                    <MenuItem
                      onClick={() => {
                        handleCloseMenu();
                        onNavigate('favoritas');
                      }}
                      sx={{
                        px: 2,
                        py: 1.25,
                        mx: 1,
                        my: 0.35,
                        borderRadius: '12px',
                        transition: 'all 0.18s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        color: darkMode ? '#F3EEFB' : '#252238',
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(185, 149, 255, 0.12)' : 'rgba(124, 58, 237, 0.08)',
                          color: darkMode ? '#FFFFFF' : '#382064',
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          bgcolor: darkMode ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.1)',
                          color: '#F59E0B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <StarIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        Mis Favoritas
                      </Typography>
                    </MenuItem>
                  )}

                  <MenuItem
                    onClick={() => {
                      handleCloseMenu();
                      onNavigate('perfil');
                    }}
                    sx={{
                      px: 2,
                      py: 1.25,
                      mx: 1,
                      my: 0.35,
                      borderRadius: '12px',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      color: darkMode ? '#F3EEFB' : '#252238',
                      '&:hover': {
                        bgcolor: darkMode ? 'rgba(185, 149, 255, 0.12)' : 'rgba(124, 58, 237, 0.08)',
                        color: darkMode ? '#FFFFFF' : '#382064',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        bgcolor: darkMode ? 'rgba(185, 149, 255, 0.16)' : 'rgba(124, 58, 237, 0.08)',
                        color: darkMode ? '#D8B4FE' : '#7C3AED',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      Mi Perfil
                    </Typography>
                  </MenuItem>

                  {/* Divisor y Cerrar Sesión con acento rojizo discreto */}
                  <Divider
                    sx={{
                      my: 1,
                      borderColor: darkMode
                        ? 'rgba(185, 149, 255, 0.12)'
                        : 'rgba(124, 58, 237, 0.08)',
                    }}
                  />

                  <MenuItem
                    onClick={() => {
                      handleCloseMenu();
                      onLogout();
                    }}
                    sx={{
                      px: 2,
                      py: 1.25,
                      mx: 1,
                      mb: 0.5,
                      borderRadius: '12px',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      color: darkMode ? '#F87171' : '#DC2626',
                      '&:hover': {
                        bgcolor: darkMode
                          ? 'rgba(239, 68, 68, 0.18)'
                          : 'rgba(239, 68, 68, 0.08)',
                        color: darkMode ? '#FCA5A5' : '#B91C1C',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        bgcolor: darkMode
                          ? 'rgba(239, 68, 68, 0.18)'
                          : 'rgba(239, 68, 68, 0.08)',
                        color: darkMode ? '#F87171' : '#DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <LogoutIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      Cerrar Sesión
                    </Typography>
                  </MenuItem>
                </Box>
              </Menu>
            </>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                variant="text"
                size="small"
                startIcon={<LoginIcon />}
                onClick={() => onOpenAuth('login')}
                sx={{
                  color: '#EDE9FE',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(237, 233, 254, 0.1)',
                  },
                }}
              >
                Iniciar Sesión
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => onOpenAuth('register')}
                sx={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              >
                Registrarse
              </Button>
            </Stack>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
