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
import Toast from './Toast';
import { store } from './store';
import { setAuth, clearAuth, stopWork } from './store';

// API Configuration
const API_BASE = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api`;
const ELECTRON_HTTP_URL = process.env.ELECTRON_HTTP_URL || 'http://localhost:3003';

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

// Deactivation Message Component
const DeactivationMessage = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: spacing[8],
    textAlign: 'center',
  }}>
    <div style={{
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: colors.warning[100],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[6],
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.warning[600]} strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    
    <h2 style={{
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.gray[900],
      margin: 0,
      marginBottom: spacing[4],
    }}>
      Account Deactivated
    </h2>
    
    <p style={{
      fontSize: typography.fontSize.lg,
      color: colors.gray[700],
      margin: 0,
      maxWidth: '500px',
      lineHeight: 1.6,
    }}>
      In order to clock in time or view tasks, activate yourself from the side menu.
    </p>
    
    <div style={{
      marginTop: spacing[6],
      padding: spacing[4],
      background: colors.info[50],
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.info[200]}`,
      maxWidth: '400px',
    }}>
      <p style={{
        fontSize: typography.fontSize.sm,
        color: colors.info[700],
        margin: 0,
        lineHeight: 1.5,
      }}>
        <strong>How to activate:</strong> Click the menu icon (☰) in the top left corner, then click the "Activate" button in the sidebar.
      </p>
    </div>
  </div>
);

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, title, message, onProceed, onCancel }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onCancel}
      >
        {/* Modal */}
        <div 
          style={{
            background: colors.background.primary,
            borderRadius: borderRadius.xl,
            padding: spacing[6],
            maxWidth: '400px',
            width: '90%',
            boxShadow: shadows['2xl'],
            border: `1px solid ${colors.gray[200]}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <h3 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            color: colors.gray[900],
            margin: 0,
            marginBottom: spacing[3],
          }}>
            {title}
          </h3>
          
          {/* Message */}
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.gray[700],
            margin: 0,
            marginBottom: spacing[6],
            lineHeight: 1.5,
          }}>
            {message}
          </p>
          
          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: spacing[3],
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={onCancel}
              style={{
                ...createButtonStyle('secondary', 'md'),
                minWidth: '80px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onProceed}
              style={{
                ...createButtonStyle('danger', 'md'),
                minWidth: '80px',
              }}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </>
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
  const [isActive, setIsActive] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [toast, setToast] = useState({ message: '', isVisible: false });

  // Function to show toast
  const showToast = (message, duration = 3000) => {
    // console.log('showToast called with message:', message, 'duration:', duration);
    setToast({ message, isVisible: true });
    setTimeout(() => {
      // console.log('Auto-dismissing toast');
      setToast({ message: '', isVisible: false });
    }, duration);
  };

  // Function to show sequential screenshot toasts
  const showScreenshotToastSequence = (startMessage, successMessage, errorMessage = null) => {
    // console.log('Starting screenshot toast sequence');
    
    // Show start message for 3 seconds
    showToast(startMessage, 3000);
    
    // After 3 seconds, show success message for another 3 seconds
    setTimeout(() => {
      if (errorMessage) {
        // If there was an error, show error message instead
        showToast(errorMessage, 3000);
      } else {
        // Show success message
        showToast(successMessage, 3000);
      }
    }, 3000);
  };

  // Listen for screenshot toast events
  useEffect(() => {
    // console.log('Setting up screenshot toast listener...');
    // console.log('window.electronAPI available:', !!window.electronAPI);
    // console.log('window.electronAPI.onScreenshotToast available:', !!window.electronAPI?.onScreenshotToast);
    
    if (window.electronAPI && window.electronAPI.onScreenshotToast) {
      const handleScreenshotToast = (event, toastData) => {
        // console.log('Received screenshot toast event:', toastData);
        
        // Handle different toast types
        if (toastData.type === 'start') {
          // For start messages, initiate the sequence
          const isRemote = toastData.message.includes('remote') || toastData.message.includes('Remote');
          const startMessage = toastData.message;
          const successMessage = isRemote ? 'Remote screenshot taken successfully!' : 'Screenshot saved successfully!';
          
          showScreenshotToastSequence(startMessage, successMessage);
        } else if (toastData.type === 'success') {
          // For direct success messages (fallback)
          showToast(toastData.message, 3000);
        } else if (toastData.type === 'error') {
          // For error messages, show immediately
          showToast(toastData.message, 3000);
        } else {
          // Fallback for any other message type
          showToast(toastData.message, 3000);
        }
      };
      
      window.electronAPI.onScreenshotToast(handleScreenshotToast);
      // console.log('Screenshot toast listener set up successfully');
      
      return () => {
        if (window.electronAPI.removeScreenshotToastListener) {
          window.electronAPI.removeScreenshotToastListener(handleScreenshotToast);
          // console.log('Screenshot toast listener cleaned up');
        }
      };
    } else {
      console.error('Screenshot toast listener not available');
    }
  }, []);

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

  // Function to get local IP address
  const getLocalIPAddress = async () => {
    try {
      // Method 1: Use Node.js os module (if available)
      if (window.require) {
        const os = window.require('os');
        const interfaces = os.networkInterfaces();
        
        // console.log('Available network interfaces:', Object.keys(interfaces));
        
        // Priority order: Ethernet, WiFi, then others
        const priorityOrder = ['Ethernet', 'Wi-Fi', 'WiFi', 'WLAN', 'Local Area Connection'];
        
        // First try priority interfaces
        for (const priorityName of priorityOrder) {
          if (interfaces[priorityName]) {
            for (const iface of interfaces[priorityName]) {
              if (iface.family === 'IPv4' && !iface.internal) {
                // console.log(`Found IP on priority interface ${priorityName}:`, iface.address);
                return iface.address;
              }
            }
          }
        }
        
        // Then try all other interfaces
        for (const name of Object.keys(interfaces)) {
          for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
              // console.log(`Found IP on interface ${name}:`, iface.address);
              return iface.address;
            }
          }
        }
        
        // console.log('No suitable local IP found, falling back to localhost');
      }
      
      // Method 2: Try to get local IP via HTTP request to our own server
      try {
        const response = await fetch(`${ELECTRON_HTTP_URL}/health`);
        const data = await response.json();
        if (data.ipAddress && data.ipAddress !== 'localhost') {
          console.log('Got IP from health endpoint:', data.ipAddress);
          return data.ipAddress;
        }
      } catch (healthError) {
        console.log('Health endpoint not available:', healthError.message);
      }
      
      // Method 3: Fallback to localhost (for same-machine testing)
      console.log('Using localhost as fallback');
      return 'localhost';
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return 'localhost'; // Fallback
    }
  };

  // Function to get MAC address
  const getMacAddress = async () => {
    try {
      // console.log('Starting MAC address detection...');
      
      // Method 1: Use Electron API (main process)
      if (window.electronAPI && window.electronAPI.getMacAddress) {
        // console.log('Using Electron API for MAC address detection...');
        const result = await window.electronAPI.getMacAddress();
        
        if (result.success) {
          // console.log('MAC address found via Electron API:', result.macAddress);
          return result.macAddress;
        } else {
          console.log('MAC address not found via Electron API:', result.error);
        }
      } else {
        console.log('Electron API not available for MAC detection');
      }
      
      // Method 2: Try to get MAC via HTTP request to our own server
      try {
        console.log('Trying health endpoint for MAC address...');
        const response = await fetch(`${ELECTRON_HTTP_URL}/health`);
        const data = await response.json();
        if (data.macAddress) {
          console.log('Got MAC from health endpoint:', data.macAddress);
          return data.macAddress;
        }
      } catch (healthError) {
        console.log('Health endpoint not available for MAC:', healthError.message);
      }
      
      // Method 3: Fallback - return null if no MAC found
      console.log('No MAC address available');
      return null;
    } catch (error) {
      console.error('Failed to get MAC address:', error);
      return null; // Fallback
    }
  };

  // Update IP address and MAC address when employee logs in
  const updateEmployeeIP = async (employeeId) => {
    try {
      // console.log('Starting IP and MAC address update for employee:', employeeId);
      
      const [ipAddress, macAddress] = await Promise.all([
        getLocalIPAddress(),
        getMacAddress()
      ]);
      
      // console.log('Detected IP address:', ipAddress);
      // console.log('Detected MAC address:', macAddress);
      
      const requestData = {
        employeeId: employeeId,
        ipAddress: ipAddress
      };
      
      // Add MAC address if available
      if (macAddress) {
        requestData.macAddress = macAddress;
        // console.log('Adding MAC address to request:', macAddress);
      } else {
        console.log('No MAC address available, skipping MAC update');
      }
      
      // console.log('Sending request data:', requestData);
      
      const response = await axios.post(`${API_BASE}/employees/update-ip`, requestData);
      
      // console.log('Server response:', response.data);
      
      if (response.data.success) {
        console.log('IP address updated successfully:', ipAddress);
        if (macAddress) {
          console.log('MAC address updated successfully:', macAddress);
        }
      }
    } catch (error) {
      console.error('Failed to update IP address and MAC:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  // Fetch employee data including active status
  const fetchEmployeeData = async (employeeId) => {
    try {
      const response = await axios.get(`${API_BASE}/employees/${employeeId}`);
      setEmployeeData(response.data);
      setIsActive(response.data.isActive);
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
    }
  };

  // Handle toggle status button click
  const handleToggleStatusClick = () => {
    const action = isActive ? 'deactivate' : 'activate';
    setConfirmationData({
      title: 'Confirm Status Change',
      message: `Are you sure you want to ${action} your account?`,
      action: action
    });
    setShowConfirmation(true);
  };

  // Handle confirmation modal proceed
  const handleConfirmProceed = async () => {
    try {
      // console.log('Starting deactivation process...');
      // console.log('Current timer state:', { isWorking, timeLogId });
      
      const response = await axios.patch(`${API_BASE}/employees/toggle-self-status`, {
        employeeId: employeeId
      });
      
      if (response.data.success) {
        const newIsActive = response.data.employee.isActive;
        // console.log('Status toggle response:', response.data);
        // console.log('New active status:', newIsActive);
        
        setIsActive(newIsActive);
        setEmployeeData(response.data.employee);
        
        // If deactivating, perform automatic clock-out
        if (!newIsActive) {
          console.log('Deactivating - performing automatic clock-out...');
          await performAutomaticClockOut();
        }
        
        alert(`Account ${newIsActive ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setShowConfirmation(false);
      setConfirmationData(null);
    }
  };

  // Handle confirmation modal cancel
  const handleConfirmCancel = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  // Get timer state from Redux
  const { isWorking, timeLogId } = useSelector(state => state.timer);

  // Automatic clock-out function (for use in event listeners)
  const performAutomaticClockOut = async () => {
    try {
      // console.log('performAutomaticClockOut called');
      // console.log('Timer state in performAutomaticClockOut:', { isWorking, timeLogId });
      
      if (isWorking && timeLogId) {
        // console.log('Performing automatic clock-out from event listener...');
        // console.log('Making API call to:', `${API_BASE}/timelogs/${timeLogId}/clockout`);
        
        // Call the clock-out API
        const response = await axios.patch(`${API_BASE}/timelogs/${timeLogId}/clockout`);
        // console.log('Clock-out API response:', response.data);
        
        // Update Redux state to stop work
        dispatch(stopWork());
        
        console.log('Automatic clock-out completed successfully');
      } else {
        console.log('No active timer found - skipping clock-out');
        console.log('isWorking:', isWorking, 'timeLogId:', timeLogId);
      }
    } catch (error) {
      console.error('Failed to perform automatic clock-out:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  // Enhanced sign out with automatic clock-out
  const handleSignOut = async () => {
    try {
      // Perform automatic clock-out first
      await performAutomaticClockOut();
      
      // Then proceed with sign out
      dispatch(clearAuth());
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still proceed with sign out even if clock-out fails
    dispatch(clearAuth());
    }
  };

  useEffect(() => {
    if (employeeId) {
      // Fetch employee data including active status
      fetchEmployeeData(employeeId);
      
      // Update IP address when employee logs in
      updateEmployeeIP(employeeId);
      
      // Set employee ID in Electron main process for remote screenshot requests
      if (window.electronAPI && window.electronAPI.setEmployeeId) {
        window.electronAPI.setEmployeeId(employeeId);
      }
      
      // Also set via HTTP endpoint as backup
      fetch(`${ELECTRON_HTTP_URL}/set-employee`, {
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

  // Handle window close/unload events
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      if (isWorking) {
        // Perform automatic clock-out before the page unloads
        await performAutomaticClockOut();
      }
    };

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isWorking]); // Add isWorking as dependency

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
                {/* Status Section */}
                <div style={{
                  marginBottom: spacing[4],
                  padding: spacing[3],
                  background: colors.gray[50],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.gray[200]}`,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    marginBottom: spacing[3],
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: isActive ? colors.success[500] : colors.error[500],
                    }} />
                    <span style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.gray[700],
                    }}>
                      Status: {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleToggleStatusClick}
                    style={{
                      ...createButtonStyle(isActive ? 'danger' : 'success', 'sm'),
                      width: '100%',
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
                
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
          {isActive ? (
            <>
              {activeTab === 'attendance' && <Attendance isActive={isActive} />}
          {activeTab === 'projects' && <Tasks />}
            </>
          ) : (
            <DeactivationMessage />
          )}
        </div>
        
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          title={confirmationData?.title || ''}
          message={confirmationData?.message || ''}
          onProceed={handleConfirmProceed}
          onCancel={handleConfirmCancel}
        />

        {/* Toast Notification */}
        <Toast 
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast({ message: '', isVisible: false })}
        />
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