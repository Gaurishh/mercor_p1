import React from 'react';
import { useDispatch } from 'react-redux';
import { colors, typography, spacing, shadows, borderRadius, createButtonStyle } from './styles';
import { clearAuth } from './store';

const AdminRedirect = () => {
  const dispatch = useDispatch();

  const handleOpenWebApp = async () => {
    console.log('Button clicked!');
    console.log('electronAPI available:', !!window.electronAPI);
    
    try {
      // Try electron API first
      if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
        console.log('Using electronAPI.openExternal');
        const result = await window.electronAPI.openExternal('https://localhost:3000');
        console.log('Result:', result);
      } else {
        console.log('electronAPI not available, using fallback');
        // Fallback: try to open using the window.open handler we set up
        const link = document.createElement('a');
        link.href = 'https://localhost:3000';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error opening external URL:', error);
      // Final fallback
      alert('Could not open web app. Please manually navigate to https://localhost:3000');
    }
  };

  const handleSignOut = () => {
    dispatch(clearAuth());
  };

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: '100vw',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.gray[50]} 100%)`,
      padding: spacing[4],
      paddingTop: 'calc(16px)', // Default frame + existing padding
      fontFamily: typography.fontFamily.primary,
      overflow: 'hidden',
    }}>
      <div style={{
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius['2xl'],
        boxShadow: shadows['2xl'],
        padding: spacing[8],
        width: '100%',
        maxWidth: '400px',
        border: `1px solid ${colors.gray[200]}`,
        textAlign: 'center',
      }}>
        {/* Success Icon */}
        <div style={{
          width: 64,
          height: 64,
          background: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
          borderRadius: borderRadius.xl,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          marginBottom: spacing[6],
          boxShadow: shadows.lg,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" stroke="white"/>
          </svg>
        </div>

        {/* Message */}
        <h1 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.gray[900],
          margin: 0,
          marginBottom: spacing[4],
          letterSpacing: '-0.025em',
        }}>
          All Set!
        </h1>
        
        <p style={{
          fontSize: typography.fontSize.base,
          color: colors.gray[600],
          margin: 0,
          marginBottom: spacing[6],
          lineHeight: 1.6,
        }}>
          Please access the admin dashboard on the web app to manage your team and projects.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          <button
            onClick={handleOpenWebApp}
            style={{
              ...createButtonStyle('primary', 'lg'),
              width: '100%',
            }}
          >
            Open Web Admin Dashboard
          </button>
          
          <button
            onClick={handleSignOut}
            style={{
              ...createButtonStyle('secondary', 'md'),
              width: '100%',
            }}
          >
            Sign Out
          </button>
        </div>

        <p style={{
          fontSize: typography.fontSize.sm,
          color: colors.gray[500],
          margin: 0,
          marginTop: spacing[4],
        }}>
          The web app will open in your default browser
        </p>
      </div>
    </div>
  );
};

export default AdminRedirect; 