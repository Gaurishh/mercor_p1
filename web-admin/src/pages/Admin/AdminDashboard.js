import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Projects from '../Client/Projects';
import Employees from './Employees';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle } from '../../styles';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('projects');
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('employeeId');
    navigate('/signin');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: colors.background.secondary,
      width: '100%',
      overflowX: 'hidden',
      fontFamily: typography.fontFamily.primary,
    }}>
      {/* Header Bar */}
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
        position: 'relative',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
          <div style={{
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
            borderRadius: borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: shadows.md,
          }}>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: typography.fontWeight.bold }}>A</span>
          </div>
          <h1 style={{
            margin: 0,
            fontWeight: typography.fontWeight.bold,
            fontSize: typography.fontSize['2xl'],
            color: colors.gray[900],
            letterSpacing: '-0.025em',
          }}>
            Admin Dashboard
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
      
      <div style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
        <Sidebar onNavigate={setActiveView} activeView={activeView} lightMode />
        <main style={{
          flex: 1,
          padding: spacing[10],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          minHeight: 'calc(100vh - 72px)',
          background: 'none',
          boxSizing: 'border-box',
          overflowX: 'auto',
          minWidth: 0,
        }}>
          <div style={{
            background: colors.background.primary,
            borderRadius: borderRadius['2xl'],
            boxShadow: shadows.xl,
            border: `1px solid ${colors.gray[200]}`,
            padding: spacing[8],
            minHeight: 600,
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            boxSizing: 'border-box',
            position: 'relative',
          }}>
            {activeView === 'projects' && <Projects />}
            {activeView === 'employees' && <Employees />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 