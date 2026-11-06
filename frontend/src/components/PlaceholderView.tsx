import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConstructionIcon from '@mui/icons-material/Construction';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface PlaceholderViewProps {
  id: string;
  titulo: string;
  descripcion: string;
  etapaPrevista: string;
  onVolverInicio: () => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  titulo,
  descripcion,
  etapaPrevista,
  onVolverInicio,
}) => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card
        sx={{
          p: { xs: 2, sm: 4 },
          textAlign: 'center',
          bgcolor: '#FFFFFF',
          borderRadius: 4,
          border: '1px solid rgba(124, 58, 237, 0.12)',
          boxShadow: '0 8px 30px -4px rgba(56, 32, 100, 0.08)',
        }}
      >
        <CardContent>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              bgcolor: '#EDE9FE',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <ConstructionIcon sx={{ fontSize: 32 }} />
          </Box>

          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 1.5 }}>
            <Chip
              label={etapaPrevista}
              size="small"
              sx={{ bgcolor: '#EDE9FE', color: '#382064', fontWeight: 700 }}
            />
            <Chip
              label="Próximamente"
              size="small"
              sx={{ bgcolor: '#F3F4F6', color: '#6B7280', fontWeight: 600 }}
            />
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 800, color: '#382064', mb: 2 }}>
            {titulo}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 620, mx: 'auto', lineHeight: 1.7, mb: 4 }}
          >
            {descripcion}
          </Typography>

          <Alert
            severity="info"
            icon={<InfoOutlinedIcon sx={{ color: '#7C3AED' }} />}
            sx={{
              maxWidth: 580,
              mx: 'auto',
              mb: 4,
              textAlign: 'left',
              bgcolor: '#F5F3FF',
              color: '#382064',
              borderRadius: 2,
              border: '1px solid #DDD6FE',
            }}
          >
            En esta <strong>Etapa 2</strong> se encuentra completamente operativo el sistema de{' '}
            <strong>Cuentas y Autenticación</strong> (Argon2id + JWT) y <strong>Perfiles de Usuario</strong>.
            Esta sección se conectará a la base de datos oficial en su etapa correspondiente.
          </Alert>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onVolverInicio}
            sx={{
              borderColor: '#7C3AED',
              color: '#7C3AED',
              fontWeight: 700,
              px: 3,
              '&:hover': {
                bgcolor: '#EDE9FE',
                borderColor: '#6D28D9',
              },
            }}
          >
            Regresar al Inicio
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};
