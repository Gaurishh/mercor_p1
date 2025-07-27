import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle } from '../../styles';

const ClientReadyPage = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('employeeId');
    navigate('/signin');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.gray[50]} 100%)`,
      fontFamily: typography.fontFamily.primary,
    }}>
      {/* Header with Sign Out Button */}
      <header style={{
        width: '100%',
        height: 72,
        background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.primary[100]} 100%)`,
        color: colors.gray[900],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${spacing[8]}`,
        boxShadow: shadows.sm,
        borderBottom: `1px solid ${colors.gray[200]}`,
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
          <div style={{
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
            borderRadius: borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: shadows.md,
          }}>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: typography.fontWeight.bold }}>M</span>
          </div>
          <h1 style={{
            margin: 0,
            fontWeight: typography.fontWeight.bold,
            fontSize: typography.fontSize['2xl'],
            color: colors.gray[900],
            letterSpacing: '-0.025em',
          }}>
            Inciteful Time Tracker
          </h1>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            ...createButtonStyle('danger', 'md'),
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16,17 21,12 16,7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing[4],
      }}>
        <div style={{
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows['2xl'],
          padding: spacing[10],
          minWidth: 400,
          maxWidth: 500,
          textAlign: 'center',
          border: `1px solid ${colors.gray[200]}`,
        }}>
          <div style={{
            width: 80,
            height: 80,
            background: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
            borderRadius: borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing[6],
            boxShadow: shadows.lg,
          }}>
            <span style={{ fontSize: '32px' }}>🎉</span>
          </div>
          
          <h2 style={{
            color: colors.success[600],
            marginBottom: spacing[3],
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            letterSpacing: '-0.025em',
          }}>
            All set!
          </h2>
          
          <p style={{
            color: colors.gray[600],
            marginBottom: spacing[8],
            fontSize: typography.fontSize.lg,
            lineHeight: typography.lineHeight.relaxed,
          }}>
            You're now verified. Download the desktop app below to start logging time.
          </p>
          
          <a 
            href="https://github.com/Gaurishh/mercor_p1-releases/releases/latest/download/Inciteful-Desktop-v1.0.0.zip" 
            download
            style={{
              ...createButtonStyle('primary', 'lg'),
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing[2],
              textDecoration: 'none',
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download for Windows
          </a>
        </div>
      </div>
    </div>
  );
};

export default ClientReadyPage; 