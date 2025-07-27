import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createCardStyle, globalStyles } from './styles';
import Attendance from './Attendance';
import Tasks from './Projects';
import AuthPage from './AuthPage';
import AdminRedirect from './AdminRedirect';
import { store } from './store';
import { setAuth, clearAuth } from './store';

// API Configuration
const API_BASE = 'http://localhost:4000/api';

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
  const { isWorking, timeLogId } = useSelector(state => state.timer);
  const [activeTab, setActiveTab] = useState('attendance');
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);

  // Check for existing authentication on app start
  useEffect(() => {
    const storedIsAdmin = localStorage.getItem('isAdmin');
    const storedEmployeeId = localStorage.getItem('employeeId');
    
    if (storedIsAdmin !== null && storedEmployeeId) {
      dispatch(setAuth({ 
        isAdmin: storedIsAdmin === 'true', 
        employeeId: storedEmployeeId 
      }));
    }
  }, [dispatch]);

  // Inject global styles for hidden scrollbar
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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

  useEffect(() => {
    if (employeeId) {
      // Set employee ID in Electron main process for remote screenshot requests
      if (window.electronAPI && window.electronAPI.setEmployeeId) {
        window.electronAPI.setEmployeeId(employeeId);
      }
      
      // Also set via HTTP endpoint as backup
      fetch(`http://localhost:3003/set-employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId })
      }).catch(err => {
        console.log('HTTP set-employee failed (normal if server not ready):', err);
      });
    }
  }, [employeeId]);

  const handleSignOut = () => {
    dispatch(clearAuth());
  };

  const handleTakeScreenshot = async () => {
    if (isTakingScreenshot) return;
    
    if (!window.electronAPI) {
      // Try to use direct IPC if available (fallback for testing)
      if (window.require) {
        try {
          const { ipcRenderer } = window.require('electron');
          
          const result = await ipcRenderer.invoke('take-screenshot');
          if (result.success) {
            alert(`Screenshot saved locally: ${result.filename}\n\nNote: Cloud upload not available in fallback mode.`);
          } else {
            alert(`Screenshot failed: ${result.error}`);
          }
        } catch (fallbackError) {
          alert('Screenshot feature is not available. Please restart the app.');
        }
      } else {
        alert('Screenshot feature is not available. Please restart the app.');
      }
      return;
    }
    
    setIsTakingScreenshot(true);
    try {
      // 1. Take screenshot locally
      const result = await window.electronAPI.takeScreenshot();
      
      if (!result.success) {
        // Check if it's a permission error
        if (result.permissionDenied) {
          // Store permission denied record in database
          try {
            await axios.post(`${API_BASE}/screenshots/permission-denied`, {
              employeeId: employeeId,
              timeLogId: isWorking ? timeLogId : null
            });
          } catch (dbError) {
            // Silent fail for permission denied records
          }
          
          alert(`Screenshot permission denied by Windows.\n\nPlease enable screen recording permissions for this app in Windows Settings.\n\nError: ${result.error}`);
          return;
        }
        
        throw new Error(result.error);
      }
      
      // 2. Upload to Cloudinary via backend
      const uploadResponse = await axios.post(`${API_BASE}/screenshots/upload`, {
        filePath: result.filepath,
        employeeId: employeeId,
        filename: result.filename
      }, {
        timeout: 30000, // 30 second timeout
      });
      
      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.error);
      }
      
      // 3. Save metadata to MongoDB
      const metadata = {
        employeeId: employeeId,
        filename: result.filename,
        localPath: result.filepath,
        cloudUrl: uploadResponse.data.url,
        cloudinaryId: uploadResponse.data.publicId,
        fileSize: uploadResponse.data.size,
        timeLogId: isWorking ? timeLogId : null,
        metadata: {
          width: uploadResponse.data.width,
          height: uploadResponse.data.height,
          format: uploadResponse.data.format,
          quality: 80,
          compressionRatio: result.fileSize ? (uploadResponse.data.size / result.fileSize).toFixed(2) : null
        }
      };
      
      await axios.post(`${API_BASE}/screenshots`, metadata);
      
      // 4. Show success message with details
      const originalSize = result.fileSize ? (result.fileSize / 1024).toFixed(1) : 'Unknown';
      const compressedSize = (uploadResponse.data.size / 1024).toFixed(1);
      const compressionRatio = result.fileSize ? ((result.fileSize - uploadResponse.data.size) / result.fileSize * 100).toFixed(1) : 0;
      
      alert(`Screenshot saved successfully!\n\nLocal: ${result.filename}\nCloud: Optimized & uploaded\nSize: ${originalSize}KB → ${compressedSize}KB (${compressionRatio}% smaller)`);
      
    } catch (error) {
      if (error.message.includes('upload')) {
        alert(`Screenshot saved locally but cloud upload failed.\nError: ${error.message}\n\nYou can find the file in the screenshots folder.`);
      } else {
        alert(`Screenshot failed: ${error.message}`);
      }
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  // Show authentication if not authenticated
  if (!employeeId) {
    return <AuthPage key="auth" />;
  }

  // Show admin redirect if user is admin
  if (isAdmin) {
    return <AdminRedirect key="admin" />;
  }

  // Show main app for regular users
  return (
    <div key="main-app" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      maxWidth: '100vw',
      width: '100%',
      background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.gray[50]} 100%)`,
      fontFamily: typography.fontFamily.primary,
      overflow: 'hidden',
    }}>
      <div style={{
        ...createCardStyle(),
        maxWidth: '800px',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
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
                  {isTakingScreenshot ? 'Capturing & Uploading...' : 'Take Screenshot'}
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
        <div 
          className="hidden-scrollbar"
          style={{ 
            flex: 1, 
            overflow: 'auto',
            paddingTop: '72px', // Account for fixed navigation height
          }}
        >
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