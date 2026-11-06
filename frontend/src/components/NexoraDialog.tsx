import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface NexoraDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  primaryButtonText?: string;
  onPrimaryClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryClick?: () => void;
}

export const NexoraDialog: React.FC<NexoraDialogProps> = ({
  open,
  onClose,
  title,
  message,
  severity = 'info',
  primaryButtonText = 'Aceptar',
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'warning':
        return <WarningAmberIcon sx={{ color: '#F59E0B', fontSize: 24 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#EF4444', fontSize: 24 }} />;
      case 'success':
        return <CheckCircleIcon sx={{ color: '#10B981', fontSize: 24 }} />;
      case 'info':
      default:
        return <InfoOutlinedIcon sx={{ color: '#7C3AED', fontSize: 24 }} />;
    }
  };

  const getIconBg = () => {
    switch (severity) {
      case 'warning':
        return 'rgba(245, 158, 11, 0.12)';
      case 'error':
        return 'rgba(239, 68, 68, 0.12)';
      case 'success':
        return 'rgba(16, 185, 129, 0.12)';
      case 'info':
      default:
        return 'rgba(124, 58, 237, 0.12)';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: { xs: 2, sm: 2.5 },
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(185, 149, 255, 0.18)'
                : 'rgba(124, 58, 237, 0.15)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 16px 48px rgba(0, 0, 0, 0.7)'
                : '0 16px 48px rgba(56, 32, 100, 0.18)',
            backgroundImage: (theme) =>
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.12), transparent 70%)'
                : 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.05), transparent 70%)',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            m: { xs: 1.5, sm: 'auto' },
            width: { xs: 'calc(100% - 24px)', sm: '100%' },
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: getIconBg(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {getIcon()}
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.05rem', sm: '1.2rem' },
              color: 'text.primary',
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
        </Box>
        <IconButton
          aria-label="Cerrar"
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            ml: 1,
            '&:hover': {
              color: 'text.primary',
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, py: 1.5 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.6,
            fontSize: { xs: '0.9rem', sm: '0.95rem' },
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          p: 0,
          pt: 2.5,
          gap: 1.5,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
        }}
      >
        {secondaryButtonText && (
          <Button
            variant="text"
            onClick={onSecondaryClick || onClose}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              px: 2,
              py: 0.8,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'text.primary',
              },
            }}
          >
            {secondaryButtonText}
          </Button>
        )}
        <Button
          variant="contained"
          onClick={onPrimaryClick || onClose}
          sx={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #382064 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            px: 3,
            py: 0.9,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.92rem',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6D28D9 0%, #2E1065 100%)',
              boxShadow: '0 6px 20px rgba(124, 58, 237, 0.45)',
            },
          }}
        >
          {primaryButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
