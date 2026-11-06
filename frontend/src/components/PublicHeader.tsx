import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Stack,
  Tooltip,
  Chip,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LoginIcon from '@mui/icons-material/Login';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface PublicHeaderProps {
  onOpenAuth: (modo: 'login' | 'register') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  onOpenAuth,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: darkMode ? '#161120' : '#382064',
        borderBottom: darkMode
          ? '1px solid rgba(185, 149, 255, 0.12)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.2, sm: 2, md: 4 }, minHeight: { xs: 58, sm: 64 } }}>
        {/* Identidad Visual de Nexora */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          <Box
            sx={{
              width: { xs: 34, sm: 38 },
              height: { xs: 34, sm: 38 },
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
              flexShrink: 0,
            }}
          >
            <SchoolIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
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
                  fontSize: { xs: '1rem', sm: '1.25rem' },
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
                display: { xs: 'none', md: 'block' },
              }}
            >
              Orientación Vocacional • Universidades Públicas del Ecuador
            </Typography>
          </Box>
        </Box>

        {/* Únicamente botones Iniciar Sesión y Registrarse, y selector de tema */}
        <Stack direction="row" spacing={{ xs: 0.8, sm: 1.5 }} sx={{ alignItems: 'center' }}>
          <Tooltip title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            <IconButton
              onClick={onToggleDarkMode}
              sx={{
                color: '#EDE9FE',
                bgcolor: 'rgba(237, 233, 254, 0.1)',
                border: '1px solid rgba(237, 233, 254, 0.2)',
                borderRadius: '10px',
                p: { xs: 0.6, sm: 0.8 },
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'rgba(237, 233, 254, 0.2)',
                },
              }}
              aria-label="alternar modo claro y oscuro"
            >
              {darkMode ? (
                <LightModeIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: '#FDE047' }} />
              ) : (
                <DarkModeIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: '#EDE9FE' }} />
              )}
            </IconButton>
          </Tooltip>

          <Button
            id="btn-public-login"
            variant="text"
            size="small"
            startIcon={<LoginIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
            onClick={() => onOpenAuth('login')}
            sx={{
              color: '#EDE9FE',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: { xs: '0.8rem', sm: '0.92rem' },
              px: { xs: 1, sm: 2 },
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: 'rgba(237, 233, 254, 0.12)',
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Iniciar Sesión</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Acceder</Box>
          </Button>

          <Button
            id="btn-public-register"
            variant="contained"
            size="small"
            onClick={() => onOpenAuth('register')}
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: { xs: '0.8rem', sm: '0.92rem' },
              px: { xs: 1.2, sm: 2.5 },
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(124, 58, 237, 0.3)',
            }}
          >
            Registrarse
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
