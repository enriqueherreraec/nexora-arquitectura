import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import TuneIcon from '@mui/icons-material/Tune';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

interface SidebarProps {
  open: boolean;
  activeView: string;
  onClose: () => void;
  onNavigate: (vista: string) => void;
  isAuthenticated: boolean;
  usuarioRole?: string;
}

interface MenuItemData {
  id: string;
  label: string;
  icon: React.ReactNode;
  available: boolean;
  requiresAuth?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  activeView,
  onClose,
  onNavigate,
  isAuthenticated,
  usuarioRole,
}) => {
  if (!isAuthenticated || !usuarioRole) {
    return null;
  }

  let menuItems: MenuItemData[] = [];

  if (usuarioRole === 'admin') {
    menuItems = [
      { id: 'inicio', label: 'Resumen Administrativo', icon: <HomeIcon />, available: true },
      { id: 'admin-usuarios', label: 'Usuarios y Roles', icon: <AdminPanelSettingsIcon sx={{ color: '#DC2626' }} />, available: true, requiresAuth: true },
      { id: 'gestor-academico', label: 'Gestión del Catálogo', icon: <TuneIcon sx={{ color: '#7C3AED' }} />, available: true, requiresAuth: true },
      { id: 'universidades', label: 'Universidades', icon: <AccountBalanceIcon />, available: true },
      { id: 'oferta', label: 'Catálogo de Carreras', icon: <SchoolIcon />, available: true },
      { id: 'perfil', label: 'Mi Perfil', icon: <PersonIcon />, available: true, requiresAuth: true },
    ];
  } else if (usuarioRole === 'gestor') {
    menuItems = [
      { id: 'inicio', label: 'Resumen del Catálogo', icon: <HomeIcon />, available: true },
      { id: 'gestor-academico', label: 'Gestión Académica', icon: <TuneIcon sx={{ color: '#7C3AED' }} />, available: true, requiresAuth: true },
      { id: 'universidades', label: 'Consulta de Universidades', icon: <AccountBalanceIcon />, available: true },
      { id: 'oferta', label: 'Catálogo de Carreras', icon: <SchoolIcon />, available: true },
      { id: 'perfil', label: 'Mi Perfil', icon: <PersonIcon />, available: true, requiresAuth: true },
    ];
  } else {
    menuItems = [
      { id: 'inicio', label: 'Inicio', icon: <HomeIcon />, available: true },
      { id: 'cuestionario', label: 'Test Vocacional', icon: <QuizIcon />, available: true },
      { id: 'resultados', label: 'Mis Resultados', icon: <AssessmentIcon />, available: true },
      { id: 'historial', label: 'Historial', icon: <HistoryIcon />, available: true, requiresAuth: true },
      { id: 'universidades', label: 'Universidades', icon: <AccountBalanceIcon />, available: true },
      { id: 'oferta', label: 'Oferta Académica', icon: <SchoolIcon />, available: true },
      { id: 'comparar', label: 'Comparador', icon: <CompareArrowsIcon />, available: true },
      { id: 'favoritas', label: 'Mis Favoritas', icon: <StarIcon sx={{ color: '#F59E0B' }} />, available: true, requiresAuth: true },
      { id: 'perfil', label: 'Mi Perfil', icon: <PersonIcon />, available: true, requiresAuth: true },
    ];
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '84vw', sm: 290 },
            maxWidth: 310,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        },
      }}
    >
      <Box>
        {/* Encabezado del menú */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.15rem' }}>
              NEXORA
            </Typography>
          </Stack>

          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Lista de navegación */}
        <List sx={{ px: 1.5, py: 2 }}>
          {menuItems.map((item) => {
            const isSelected = activeView === item.id;
            const isLocked = item.requiresAuth && !isAuthenticated;

            return (
              <ListItemButton
                key={item.id}
                selected={isSelected}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.8,
                  py: 1.2,
                  px: 2,
                  color: isSelected ? 'primary.main' : 'text.primary',
                  bgcolor: isSelected ? 'secondary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: isSelected ? 'secondary.main' : (theme) => theme.palette.mode === 'dark' ? 'rgba(185, 149, 255, 0.08)' : 'rgba(124, 58, 237, 0.04)',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'secondary.main',
                    fontWeight: 700,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isSelected ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: '0.92rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
                {!item.available && (
                  <Chip
                    label="Pronto"
                    size="small"
                    sx={{
                      fontSize: '0.65rem',
                      height: 20,
                      bgcolor: 'action.disabledBackground',
                      color: 'text.disabled',
                      fontWeight: 600,
                    }}
                  />
                )}
                {isLocked && (
                  <Chip
                    label="Acceso"
                    size="small"
                    color="secondary"
                    sx={{
                      fontSize: '0.65rem',
                      height: 20,
                      fontWeight: 600,
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Pie del Menú Lateral */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : '#F7F7FC' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
          Nexora Vocacional • v0.2.0
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          IES Públicas del Ecuador (LOES/SENESCYT)
        </Typography>
      </Box>
    </Drawer>
  );
};
