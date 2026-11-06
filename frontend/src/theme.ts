import { createTheme, type Theme } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark'): Theme => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#B995FF' : '#7C3AED',
        dark: isDark ? '#7C3AED' : '#382064',
        light: isDark ? '#D8B4FE' : '#A78BFA',
        contrastText: isDark ? '#100D16' : '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#2E204A' : '#EDE9FE',
        dark: isDark ? '#1F1435' : '#DDD6FE',
        light: isDark ? '#3D2B60' : '#F5F3FF',
        contrastText: isDark ? '#F3EEFB' : '#382064',
      },
      success: {
        main: '#14B8A6',
        light: '#2DD4BF',
        dark: '#0F766E',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? '#100D16' : '#F7F7FC',
        paper: isDark ? '#1B1525' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F3EEFB' : '#252238',
        secondary: isDark ? '#A89EB9' : '#716B86',
      },
      divider: isDark ? 'rgba(185, 149, 255, 0.12)' : 'rgba(56, 32, 100, 0.08)',
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Outfit", "Segoe UI", Roboto, sans-serif',
      h1: {
        fontWeight: 800,
        color: isDark ? '#F3EEFB' : '#382064',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        color: isDark ? '#F3EEFB' : '#382064',
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 700,
        color: isDark ? '#F3EEFB' : '#382064',
      },
      h4: {
        fontWeight: 700,
        color: isDark ? '#F3EEFB' : '#382064',
      },
      h5: {
        fontWeight: 700,
        color: isDark ? '#F3EEFB' : '#382064',
      },
      h6: {
        fontWeight: 600,
        color: isDark ? '#F3EEFB' : '#382064',
      },
      subtitle1: {
        fontWeight: 500,
        color: isDark ? '#F3EEFB' : '#252238',
      },
      subtitle2: {
        fontWeight: 600,
        color: isDark ? '#B995FF' : '#382064',
      },
      body1: {
        color: isDark ? '#F3EEFB' : '#252238',
        lineHeight: 1.6,
      },
      body2: {
        color: isDark ? '#A89EB9' : '#716B86',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 10,
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 22px',
            boxShadow: 'none',
            transition: 'all 0.15s ease-in-out',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
            '&:hover': {
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: isDark ? '#1B1525' : '#FFFFFF',
            border: isDark ? '1px solid rgba(185, 149, 255, 0.15)' : '1px solid rgba(124, 58, 237, 0.08)',
            boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px -2px rgba(56, 32, 100, 0.04)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              transform: 'none !important',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#1B1525' : '#FFFFFF',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#161120' : '#382064',
            color: '#FFFFFF',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.25)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1B1525' : '#FFFFFF',
            borderRight: isDark ? '1px solid rgba(185, 149, 255, 0.12)' : '1px solid rgba(56, 32, 100, 0.08)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#241B32' : '#F5F3FF',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? '1px solid rgba(185, 149, 255, 0.08)' : '1px solid rgba(56, 32, 100, 0.06)',
            color: isDark ? '#F3EEFB' : '#252238',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(185, 149, 255, 0.2)' : 'rgba(56, 32, 100, 0.15)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#B995FF' : '#7C3AED',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#B995FF' : '#7C3AED',
              borderWidth: 2,
            },
          },
          input: {
            color: isDark ? '#F3EEFB' : '#252238',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: isDark ? '#A89EB9' : '#716B86',
            '&.Mui-focused': {
              color: isDark ? '#B995FF' : '#7C3AED',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: {
            color: isDark ? '#B995FF' : '#7C3AED',
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1B1525' : '#FFFFFF',
            borderRadius: '14px !important',
            border: isDark ? '1px solid rgba(185, 149, 255, 0.15)' : '1px solid rgba(124, 58, 237, 0.08)',
            boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 10px rgba(56, 32, 100, 0.03)',
            '&:before': { display: 'none' },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            '& .MuiAccordionSummary-expandIconWrapper': {
              color: isDark ? '#B995FF' : '#7C3AED',
            },
          },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            color: isDark ? '#F3EEFB' : '#252238',
            '&.Mui-selected': {
              backgroundColor: isDark ? '#7C3AED' : '#7C3AED',
              color: '#FFFFFF',
              fontWeight: 700,
              '&:hover': {
                backgroundColor: isDark ? '#6D28D9' : '#6D28D9',
              },
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1B1525' : '#FFFFFF',
            border: isDark ? '1px solid rgba(185, 149, 255, 0.18)' : '1px solid rgba(56, 32, 100, 0.08)',
            boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.6)' : '0 8px 24px rgba(56, 32, 100, 0.12)',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: isDark ? '#F3EEFB' : '#252238',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(185, 149, 255, 0.1)' : 'rgba(124, 58, 237, 0.06)',
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(185, 149, 255, 0.18)' : 'rgba(124, 58, 237, 0.12)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(185, 149, 255, 0.24)' : 'rgba(124, 58, 237, 0.16)',
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1B1525' : '#FFFFFF',
            border: isDark ? '1px solid rgba(185, 149, 255, 0.18)' : '1px solid rgba(56, 32, 100, 0.08)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#2E204A' : '#382064',
            color: '#F3EEFB',
            fontSize: '0.78rem',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
        },
      },
    },
  });
};

export const theme = getAppTheme('light');
export default theme;
