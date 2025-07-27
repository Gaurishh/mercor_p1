// Modern Design System for Mercor Desktop App

// Color Palette
export const colors = {
    // Primary Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // Neutral Colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    // Success Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    // Warning Colors
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // Error Colors
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    // Background Colors
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    }
  };
  
  // Typography
  export const typography = {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  };
  
  // Spacing
  export const spacing = {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  };
  
  // Shadows
  export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  };
  
  // Border Radius
  export const borderRadius = {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  };
  
  // Transitions
  export const transitions = {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  };
  
  // Utility Functions
  export const createButtonStyle = (variant = 'primary', size = 'md') => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: borderRadius.lg,
      fontWeight: typography.fontWeight.medium,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.tight,
      padding: `${spacing[3]} ${spacing[4]}`,
      cursor: 'pointer',
      transition: `all ${transitions.base}`,
      textDecoration: 'none',
      outline: 'none',
    };
  
    const variants = {
      primary: {
        backgroundColor: colors.primary[600],
        color: 'white',
        '&:hover': {
          backgroundColor: colors.primary[700],
          transform: 'translateY(-1px)',
          boxShadow: shadows.lg,
        },
      },
      secondary: {
        backgroundColor: colors.gray[100],
        color: colors.gray[700],
        border: `1px solid ${colors.gray[300]}`,
        '&:hover': {
          backgroundColor: colors.gray[200],
          transform: 'translateY(-1px)',
          boxShadow: shadows.md,
        },
      },
      success: {
        backgroundColor: colors.success[600],
        color: 'white',
        '&:hover': {
          backgroundColor: colors.success[700],
          transform: 'translateY(-1px)',
          boxShadow: shadows.lg,
        },
      },
      danger: {
        backgroundColor: colors.error[600],
        color: 'white',
        '&:hover': {
          backgroundColor: colors.error[700],
          transform: 'translateY(-1px)',
          boxShadow: shadows.lg,
        },
      },
    };
  
    const sizes = {
      sm: {
        padding: `${spacing[2]} ${spacing[3]}`,
        fontSize: typography.fontSize.xs,
      },
      md: {
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: typography.fontSize.sm,
      },
      lg: {
        padding: `${spacing[4]} ${spacing[6]}`,
        fontSize: typography.fontSize.base,
      },
    };
  
    return {
      ...baseStyle,
      ...variants[variant],
      ...sizes[size],
    };
  };
  
  export const createCardStyle = () => ({
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.lg,
    border: `1px solid ${colors.gray[200]}`,
    overflow: 'hidden',
  });
  
  export const createBadgeStyle = (variant = 'info') => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${spacing[1]} ${spacing[2]}`,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.tight,
    };
  
    const variants = {
      success: {
        backgroundColor: colors.success[100],
        color: colors.success[800],
      },
      warning: {
        backgroundColor: colors.warning[100],
        color: colors.warning[800],
      },
      error: {
        backgroundColor: colors.error[100],
        color: colors.error[800],
      },
      info: {
        backgroundColor: colors.primary[100],
        color: colors.primary[800],
      },
    };
  
    return {
      ...baseStyle,
      ...variants[variant],
    };
  };

export const createInputStyle = () => ({
  width: '100%',
  padding: `${spacing[3]} ${spacing[4]}`,
  border: `1px solid ${colors.gray[300]}`,
  borderRadius: borderRadius.md,
  fontSize: typography.fontSize.sm,
  color: colors.gray[900],
  backgroundColor: colors.background.primary,
  transition: `all ${transitions.base}`,
  outline: 'none',
  '&:focus': {
    borderColor: colors.primary[500],
    boxShadow: `0 0 0 3px ${colors.primary[100]}`,
  },
  '&:hover': {
    borderColor: colors.gray[400],
  },
  '&::placeholder': {
    color: colors.gray[500],
  },
});