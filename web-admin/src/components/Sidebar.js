import React from 'react';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle } from '../styles';

const Sidebar = ({ onNavigate, activeView, lightMode = false }) => {
  // Light mode colors using design system
  const bg = lightMode ? `linear-gradient(180deg, ${colors.primary[50]} 0%, ${colors.gray[50]} 100%)` : colors.gray[900];
  const text = lightMode ? colors.gray[900] : colors.gray[100];
  const activeBg = lightMode ? colors.primary[100] : colors.primary[600];
  const activeColor = lightMode ? colors.primary[800] : colors.white;
  const inactiveColor = lightMode ? colors.gray[600] : colors.gray[300];
  const borderColor = lightMode ? colors.gray[200] : colors.gray[700];

  return (
    <nav style={{
      width: 260,
      background: bg,
      color: text,
      minHeight: '100vh',
      padding: spacing[6],
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      boxShadow: lightMode ? shadows.lg : 'none',
      borderRight: `1px solid ${borderColor}`,
      boxSizing: 'border-box',
      fontFamily: typography.fontFamily.primary,
      flexShrink: 0,
    }}>


      {/* Navigation Menu */}
      <div style={{ flex: 1, width: '100%' }}>
        <h4 style={{
          color: lightMode ? colors.gray[500] : colors.gray[400],
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: spacing[4],
          marginTop: 0,
        }}>
          Navigation
        </h4>
        <ul style={{ listStyle: 'none', padding: 0, width: '100%', margin: 0 }}>
          <li style={{ marginBottom: spacing[2] }}>
            <button
              onClick={() => onNavigate('projects')}
              style={{
                background: activeView === 'projects' ? activeBg : 'transparent',
                color: activeView === 'projects' ? activeColor : inactiveColor,
                border: 'none',
                width: '100%',
                textAlign: 'left',
                padding: `${spacing[3]} ${spacing[4]}`,
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                fontWeight: activeView === 'projects' ? typography.fontWeight.semibold : typography.fontWeight.normal,
                fontSize: typography.fontSize.sm,
                transition: `all ${transitions.base}`,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                '&:hover': {
                  background: activeView === 'projects' ? activeBg : (lightMode ? colors.gray[100] : colors.gray[800]),
                },
              }}
              onMouseEnter={(e) => {
                if (activeView !== 'projects') {
                  e.target.style.background = lightMode ? colors.gray[100] : colors.gray[800];
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'projects') {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"/>
              </svg>
              Projects
            </button>
          </li>
          <li style={{ marginBottom: spacing[2] }}>
            <button
              onClick={() => onNavigate('employees')}
              style={{
                background: activeView === 'employees' ? activeBg : 'transparent',
                color: activeView === 'employees' ? activeColor : inactiveColor,
                border: 'none',
                width: '100%',
                textAlign: 'left',
                padding: `${spacing[3]} ${spacing[4]}`,
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                fontWeight: activeView === 'employees' ? typography.fontWeight.semibold : typography.fontWeight.normal,
                fontSize: typography.fontSize.sm,
                transition: `all ${transitions.base}`,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                '&:hover': {
                  background: activeView === 'employees' ? activeBg : (lightMode ? colors.gray[100] : colors.gray[800]),
                },
              }}
              onMouseEnter={(e) => {
                if (activeView !== 'employees') {
                  e.target.style.background = lightMode ? colors.gray[100] : colors.gray[800];
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== 'employees') {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Employees
            </button>
          </li>
        </ul>
      </div>

      {/* Download Section */}
      <div style={{
        width: '100%',
        paddingTop: spacing[6],
        borderTop: `1px solid ${borderColor}`,
      }}>
        <h4 style={{
          color: lightMode ? colors.gray[500] : colors.gray[400],
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: spacing[4],
          marginTop: 0,
        }}>
          Desktop App
        </h4>
        <a 
          href="/desktop/releases/inciteful-timetracker-setup.exe" 
          download 
          style={{
            ...createButtonStyle('success', 'md'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            width: '100%',
            textDecoration: 'none',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download for Windows
        </a>
      </div>
    </nav>
  );
};

export default Sidebar; 