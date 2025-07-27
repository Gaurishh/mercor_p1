import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createCardStyle } from './styles';
import Attendance from './Attendance';
import Tasks from './Projects';
import AuthPage from './AuthPage';
import AdminRedirect from './AdminRedirect';
import { store } from './store';
import { setAuth, clearAuth } from './store';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // If it's a DOM manipulation error, try to recover
    if (error.message && error.message.includes('removeChild')) {
      console.log('DOM manipulation error detected, attempting recovery...');
      // Force a re-render by updating state
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 100);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: spacing[6],
          textAlign: 'center',
          color: colors.error[600],
        }}>
          <h2>Something went wrong!</h2>
          <p>{this.state.error?.message}</p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={createButtonStyle('primary', 'md')}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Test Component to verify Redux is working
const TestComponent = () => {
  const auth = useSelector(state => state.auth);
  console.log('TestComponent auth state:', auth);
  
  return (
    <div style={{ padding: spacing[4], background: colors.gray[100] }}>
      <h3>Redux Test</h3>
      <p>Auth State: {JSON.stringify(auth)}</p>
    </div>
  );
};

// Navigation component
const Navigation = ({ activeTab, onTabChange, onSignOut, showSideMenu, setShowSideMenu }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottom: `1px solid ${colors.gray[200]}`,
    background: colors.background.primary,
    position: 'relative',
  }}>
    {/* Side Menu Icon */}
    <button
      onClick={() => setShowSideMenu(!showSideMenu)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: spacing[2],
        borderRadius: borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        transition: `all ${transitions.base}`,
        color: colors.gray[600],
        '&:hover': {
          background: colors.gray[100],
        },
      }}
    >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
    </button>
    
    {/* Centered Tab Buttons */}
    <div style={{
      display: 'flex',
      gap: spacing[2],
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
    }}>
      <button
        onClick={() => onTabChange('attendance')}
        style={{
          ...createButtonStyle(activeTab === 'attendance' ? 'primary' : 'secondary', 'sm'),
          minWidth: '120px',
        }}
      >
        Attendance
      </button>
      <button
        onClick={() => onTabChange('projects')}
        style={{
          ...createButtonStyle(activeTab === 'projects' ? 'primary' : 'secondary', 'sm'),
          minWidth: '120px',
        }}
      >
        Tasks
      </button>
        </div>
        
    {/* Spacer to balance the layout */}
    <div style={{ width: '44px' }}></div>
      </div>
);

// Main App component
const App = () => {
  const dispatch = useDispatch();
  const { employeeId, isAdmin } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('attendance');
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);

  console.log('App component rendering:', { employeeId, isAdmin });

  // Check for existing authentication on app start
  useEffect(() => {
    console.log('App useEffect running');
    console.log('window.electronAPI available:', !!window.electronAPI);
    const storedIsAdmin = localStorage.getItem('isAdmin');
    const storedEmployeeId = localStorage.getItem('employeeId');
    
    console.log('Stored values:', { storedIsAdmin, storedEmployeeId });
    
    if (storedIsAdmin !== null && storedEmployeeId) {
      dispatch(setAuth({ 
        isAdmin: storedIsAdmin === 'true', 
        employeeId: storedEmployeeId 
      }));
    }
  }, [dispatch]);

  // Handle click outside side menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSideMenu) {
        const backdrop = event.target.closest('[data-backdrop]');
        if (backdrop) {
          setShowSideMenu(false);
        }
      }
    };

    if (showSideMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSideMenu]);

  const handleSignOut = () => {
    dispatch(clearAuth());
  };

  const handleTakeScreenshot = async () => {
    if (isTakingScreenshot) return;
    
    console.log('handleTakeScreenshot called');
    console.log('window.electronAPI:', window.electronAPI);
    
    if (!window.electronAPI) {
      console.error('electronAPI is not available');
      alert('Screenshot feature is not available. Please restart the app.');
      return;
    }
    
    setIsTakingScreenshot(true);
    try {
      const result = await window.electronAPI.takeScreenshot();
      if (result.success) {
        // Show success feedback (you could add a toast notification here)
        console.log(`Screenshot saved: ${result.filename}`);
        alert(`Screenshot saved successfully!\nFile: ${result.filename}`);
      } else {
        console.error('Screenshot failed:', result.error);
        alert(`Screenshot failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error taking screenshot:', error);
      alert('Failed to take screenshot. Please try again.');
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  console.log('Rendering decision:', { employeeId, isAdmin });

  // Show authentication if not authenticated
  if (!employeeId) {
    console.log('Rendering AuthPage');
    return <AuthPage key="auth" />;
  }

  // Show admin redirect if user is admin
  if (isAdmin) {
    console.log('Rendering AdminRedirect');
    return <AdminRedirect key="admin" />;
  }

  console.log('Rendering main app');

  // Show main app for regular users
  return (
    <div key="main-app" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      maxWidth: '100vw',
      width: '100%',
      background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.gray[50]} 100%)`,
      fontFamily: typography.fontFamily.primary,
      // paddingTop: '16px', // Minimal padding for default window frame
      overflow: 'hidden',
    }}>
      <div style={{
        ...createCardStyle(),
        maxWidth: '800px',
        minHeight: '840px',
        maxHeight: '980px',
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
      }}>
        {/* Fixed Navigation */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: colors.background.primary,
        }}>
          <Navigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onSignOut={handleSignOut}
            showSideMenu={showSideMenu}
            setShowSideMenu={setShowSideMenu}
          />
        </div>
        
        {/* Side Menu Overlay */}
        {showSideMenu && (
          <>
            {/* Backdrop */}
            <div 
              data-backdrop
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
                cursor: 'pointer',
              }}
            />
            
            {/* Side Menu */}
            <div 
              data-side-menu
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: '182px',
                background: colors.background.primary,
                boxShadow: shadows['2xl'],
                zIndex: 1000,
                transform: showSideMenu ? 'translateX(0)' : 'translateX(-100%)',
                transition: `transform ${transitions.base}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{
                padding: spacing[6],
                borderBottom: `1px solid ${colors.gray[200]}`,
                background: colors.primary[50],
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h2 style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.gray[900],
                  margin: 0,
                }}>
                  Menu
                </h2>
                <button
                  onClick={() => setShowSideMenu(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: spacing[1],
                    borderRadius: borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.gray[600],
                    transition: `all ${transitions.base}`,
                    '&:hover': {
                      background: colors.gray[100],
                      color: colors.gray[800],
                    },
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {/* Menu Items */}
              <div style={{
                padding: spacing[4],
                flex: 1,
              }}>
                <button
                  onClick={handleTakeScreenshot}
                  disabled={isTakingScreenshot}
                  style={{
                    ...createButtonStyle('primary', 'md'),
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: spacing[3],
                    marginBottom: spacing[3],
                    opacity: isTakingScreenshot ? 0.6 : 1,
                    cursor: isTakingScreenshot ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isTakingScreenshot ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  )}
                  {isTakingScreenshot ? 'Taking Screenshot...' : 'Take Screenshot'}
                </button>
                
                <button
                  onClick={handleSignOut}
                  style={{
                    ...createButtonStyle('secondary', 'md'),
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: spacing[3],
                    marginBottom: spacing[4],
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* Content */}
        <div style={{ 
          flex: 1, 
          overflow: 'hidden',
          paddingTop: '72px', // Account for fixed navigation height
        }}>
          {activeTab === 'attendance' && <Attendance />}
          {activeTab === 'projects' && <Tasks />}
        </div>
      </div>
    </div>
  );
};

const Root = () => (
  <Provider store={store}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </Provider>
);

export default Root;

// Render the app
const container = document.getElementById('root');
const root = createRoot(container);

try {
  root.render(<Root />);
} catch (error) {
  console.error('Error rendering app:', error);
root.render(
    <div style={{
      padding: spacing[6],
      textAlign: 'center',
      color: colors.error[600],
    }}>
      <h2>Failed to load app!</h2>
      <p>{error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        style={createButtonStyle('primary', 'md')}
      >
        Reload App
      </button>
    </div>
);
}