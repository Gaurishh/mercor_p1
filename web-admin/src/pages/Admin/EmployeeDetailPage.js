import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle } from '../../styles';

const BACKEND_URL = process.env.REACT_BACKEND_URL || 'http://localhost:4000';
const API_BASE = `${BACKEND_URL}/api/employees`;
const SCREENSHOT_API_BASE = `${BACKEND_URL}/api/screenshots`;

const EmployeeDetailPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [activeSection, setActiveSection] = useState('details');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [screenshotsLoading, setScreenshotsLoading] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [workingStatus, setWorkingStatus] = useState(false);
  const [takingScreenshot, setTakingScreenshot] = useState(false);

  useEffect(() => {
    fetchEmployeeData();
    fetchWorkingStatus();
    
    // Set up periodic refresh of working status
    const interval = setInterval(() => {
      fetchWorkingStatus();
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [employeeRes, tasksRes, screenshotsRes] = await Promise.all([
        axios.get(`${API_BASE}/${employeeId}`),
        axios.get(`${API_BASE}/${employeeId}/tasks`),
        axios.get(`${API_BASE}/${employeeId}/screenshots`)
      ]);
      
      setEmployee(employeeRes.data);
      setTasks(tasksRes.data);
      setScreenshots(screenshotsRes.data);
    } catch (err) {
      console.error('Failed to fetch employee data:', err);
      setError(err.response?.data?.error || 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkingStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/working-status`);
      setWorkingStatus(res.data[employeeId] || false);
    } catch (err) {
      console.error('Failed to fetch working status:', err);
      setWorkingStatus(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const res = await axios.get(`${API_BASE}/${employeeId}/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchScreenshots = async () => {
    try {
      setScreenshotsLoading(true);
      const res = await axios.get(`${API_BASE}/${employeeId}/screenshots`);
      setScreenshots(res.data);
    } catch (err) {
      console.error('Failed to fetch screenshots:', err);
    } finally {
      setScreenshotsLoading(false);
    }
  };

  const handleTakeScreenshot = async () => {
    try {
      setTakingScreenshot(true);
      const res = await axios.post(`${SCREENSHOT_API_BASE}/remote-take`, {
        employeeId: employeeId
      });
      
      if (res.data.success) {
        alert('Screenshot taken successfully!');
        // Refresh screenshots to show the new one
        fetchScreenshots();
      } else {
        alert('Failed to take screenshot: ' + res.data.error);
      }
    } catch (err) {
      console.error('Failed to take screenshot:', err);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to take screenshot';
      if (err.response?.status === 404) {
        errorMessage = 'Employee IP address not available. Please ask employee to log in again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    } finally {
      setTakingScreenshot(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await axios.patch(`${API_BASE}/${employeeId}/toggle-status`);
      setEmployee(res.data);
    } catch (err) {
      console.error('Failed to toggle employee status:', err);
      alert('Failed to update employee status');
    }
  };

  const handleBackToEmployees = () => {
    navigate('/admin/dashboard');
  };

  const handleScreenshotClick = (screenshot) => {
    setSelectedScreenshot(screenshot);
  };

  const closeScreenshotModal = () => {
    setSelectedScreenshot(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: colors.background.secondary,
      }}>
        <div>Loading employee data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: colors.background.secondary,
        gap: spacing[4],
      }}>
        <div style={{ color: colors.error[600], fontSize: typography.fontSize.lg }}>
          {error}
        </div>
        <button
          onClick={handleBackToEmployees}
          style={createButtonStyle('secondary', 'md')}
        >
          Back to Employees
        </button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: colors.background.secondary,
        gap: spacing[4],
      }}>
        <div>Employee not found</div>
        <button
          onClick={handleBackToEmployees}
          style={createButtonStyle('secondary', 'md')}
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background.secondary,
      fontFamily: typography.fontFamily.primary,
    }}>
      {/* Header */}
      <div style={{
        background: colors.background.primary,
        borderBottom: `1px solid ${colors.gray[200]}`,
        padding: spacing[6],
        boxShadow: shadows.sm,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[4],
        }}>
          <button
            onClick={handleBackToEmployees}
            style={{
              ...createButtonStyle('secondary', 'md'),
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Employees
          </button>
          <div>
            <h1 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.gray[900],
              margin: 0,
            }}>
              {employee.firstName} {employee.lastName}
            </h1>
            <p style={{
              fontSize: typography.fontSize.base,
              color: colors.gray[600],
              margin: 0,
            }}>
              Employee Details
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 80px)',
      }}>
        {/* Sidebar */}
        <div style={{
          width: 280,
          background: colors.background.primary,
          borderRight: `1px solid ${colors.gray[200]}`,
          padding: spacing[6],
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2],
          }}>
            {[
              { id: 'details', label: 'Details', icon: '👤' },
              { id: 'tasks', label: 'Tasks', icon: '📋' },
              { id: 'screenshots', label: 'Screenshots', icon: '📸' },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: spacing[3],
                  borderRadius: borderRadius.lg,
                  border: 'none',
                  background: activeSection === section.id ? colors.primary[50] : 'transparent',
                  color: activeSection === section.id ? colors.primary[700] : colors.gray[700],
                  cursor: 'pointer',
                  transition: `all ${transitions.base}`,
                  fontSize: typography.fontSize.base,
                  fontWeight: activeSection === section.id ? typography.fontWeight.medium : typography.fontWeight.normal,
                }}
              >
                <span style={{ fontSize: '20px' }}>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: spacing[8],
        }}>
          {activeSection === 'details' && (
            <div>
              <h2 style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.gray[900],
                margin: 0,
                marginBottom: spacing[6],
              }}>
                Employee Details
              </h2>
              
              <div style={{
                background: colors.background.primary,
                borderRadius: borderRadius.xl,
                padding: spacing[6],
                border: `1px solid ${colors.gray[200]}`,
                boxShadow: shadows.sm,
                position: 'relative',
              }}>
                {/* Take Screenshot Button - Top Right */}
                {workingStatus && (
                  <div style={{
                    position: 'absolute',
                    top: spacing[6],
                    right: spacing[6],
                  }}>
                    <button
                      onClick={handleTakeScreenshot}
                      style={{
                        backgroundColor: colors.error[600],
                        color: 'white',
                        border: 'none',
                        borderRadius: borderRadius.md,
                        padding: `${spacing[2]} ${spacing[4]}`,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        cursor: takingScreenshot ? 'not-allowed' : 'pointer',
                        opacity: takingScreenshot ? 0.7 : 1,
                        transition: 'opacity 0.2s',
                      }}
                      disabled={takingScreenshot}
                    >
                      {takingScreenshot ? 'Taking...' : 'Take Screenshot'}
                    </button>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[4],
                  marginBottom: spacing[6],
                }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                    borderRadius: borderRadius.full,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                  }}>
                    {employee.firstName[0]}{employee.lastName[0]}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.gray[900],
                      margin: 0,
                      marginBottom: spacing[1],
                    }}>
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p style={{
                      fontSize: typography.fontSize.base,
                      color: colors.gray[600],
                      margin: 0,
                    }}>
                      {employee.email}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: spacing[4],
                  marginBottom: spacing[6],
                }}>
                  <div>
                    <label style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing[1],
                      display: 'block',
                    }}>
                      STATUS
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                    }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: borderRadius.full,
                        background: employee.isActive ? colors.success[500] : colors.gray[400],
                      }} />
                      <span style={{
                        fontSize: typography.fontSize.base,
                        color: colors.gray[900],
                      }}>
                        {employee.isActive ? 'Active Member' : 'Inactive Member'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing[1],
                      display: 'block',
                    }}>
                      ROLE
                    </label>
                    <span style={{
                      fontSize: typography.fontSize.base,
                      color: colors.gray[900],
                    }}>
                      {employee.isAdmin ? 'Admin' : 'Employee'}
                    </span>
                  </div>

                  <div>
                    <label style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing[1],
                      display: 'block',
                    }}>
                      GENDER
                    </label>
                    <span style={{
                      fontSize: typography.fontSize.base,
                      color: colors.gray[900],
                    }}>
                      {employee.gender}
                    </span>
                  </div>

                  <div>
                    <label style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing[1],
                      display: 'block',
                    }}>
                      IP ADDRESS
                    </label>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: spacing[1],
                    }}>
                      <span style={{
                        fontSize: typography.fontSize.base,
                        color: colors.gray[900],
                      }}>
                        {employee.ipAddress || 'Not available'}
                      </span>
                      {employee.lastLoginAt && (
                        <span style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.gray[500],
                        }}>
                          Last updated: {new Date(employee.lastLoginAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing[1],
                      display: 'block',
                    }}>
                      MAC ADDRESS
                    </label>
                    <span style={{
                      fontSize: typography.fontSize.base,
                      color: colors.gray[900],
                    }}>
                      {employee.macAddress || 'Not available'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggleStatus}
                  style={{
                    ...createButtonStyle(employee.isActive ? 'danger' : 'success', 'md'),
                  }}
                >
                  {employee.isActive ? 'Deactivate Account' : 'Activate Account'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'tasks' && (
            <div>
              <h2 style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.gray[900],
                margin: 0,
                marginBottom: spacing[6],
              }}>
                Assigned Tasks
              </h2>
              
              {tasksLoading ? (
                <div style={{
                  background: colors.background.primary,
                  borderRadius: borderRadius.xl,
                  padding: spacing[8],
                  border: `1px solid ${colors.gray[200]}`,
                  textAlign: 'center',
                  color: colors.gray[600],
                }}>
                  Loading tasks...
                </div>
              ) : tasks.length === 0 ? (
                <div style={{
                  background: colors.background.primary,
                  borderRadius: borderRadius.xl,
                  padding: spacing[8],
                  border: `1px solid ${colors.gray[200]}`,
                  textAlign: 'center',
                  color: colors.gray[600],
                }}>
                  No tasks assigned to this employee
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing[6],
                }}>
                  {(() => {
                    const groupedTasks = tasks.reduce((acc, task) => {
                      const projectName = task.projectId?.name || 'Unknown Project';
                      if (!acc[projectName]) {
                        acc[projectName] = [];
                      }
                      acc[projectName].push(task);
                      return acc;
                    }, {});

                    return Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
                      <div
                        key={projectName}
                        style={{
                          background: colors.background.primary,
                          borderRadius: borderRadius.xl,
                          border: `1px solid ${colors.gray[200]}`,
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{
                          background: colors.gray[50],
                          padding: spacing[4],
                          borderBottom: `1px solid ${colors.gray[200]}`,
                        }}>
                          <h3 style={{
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.gray[900],
                            margin: 0,
                          }}>
                            {projectName}
                          </h3>
                        </div>
                        
                        <div style={{
                          padding: spacing[4],
                        }}>
                          {projectTasks.map((task) => (
                            <div
                              key={task._id}
                              style={{
                                padding: spacing[3],
                                border: `1px solid ${colors.gray[200]}`,
                                borderRadius: borderRadius.lg,
                                marginBottom: spacing[3],
                                background: colors.gray[50],
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: spacing[2],
                              }}>
                                <h4 style={{
                                  fontSize: typography.fontSize.base,
                                  fontWeight: typography.fontWeight.medium,
                                  color: colors.gray[900],
                                  margin: 0,
                                  textDecoration: task.isCompleted ? 'line-through' : 'none',
                                }}>
                                  {task.name}
                                </h4>
                                <span style={{
                                  fontSize: typography.fontSize.sm,
                                  fontWeight: typography.fontWeight.medium,
                                  color: task.isCompleted ? colors.gray[600] : colors.success[600],
                                  background: task.isCompleted ? colors.gray[100] : colors.success[100],
                                  padding: `${spacing[1]} ${spacing[2]}`,
                                  borderRadius: borderRadius.full,
                                }}>
                                  {task.isCompleted ? 'Inactive' : 'Active'}
                                </span>
                              </div>
                              <p style={{
                                fontSize: typography.fontSize.sm,
                                color: colors.gray[600],
                                margin: 0,
                                textDecoration: task.isCompleted ? 'line-through' : 'none',
                              }}>
                                {task.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}

          {activeSection === 'screenshots' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4], marginBottom: spacing[6] }}>
                <h2 style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.gray[900],
                  margin: 0,
                }}>
                  Screenshots
                </h2>
                <button
                  onClick={fetchScreenshots}
                  style={{
                    backgroundColor: colors.primary[600],
                    color: 'white',
                    border: 'none',
                    borderRadius: borderRadius.md,
                    padding: `${spacing[2]} ${spacing[4]}`,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    cursor: screenshotsLoading ? 'not-allowed' : 'pointer',
                    opacity: screenshotsLoading ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                  }}
                  disabled={screenshotsLoading}
                >
                  {screenshotsLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {screenshotsLoading ? (
                <div style={{
                  background: colors.background.primary,
                  borderRadius: borderRadius.xl,
                  padding: spacing[8],
                  border: `1px solid ${colors.gray[200]}`,
                  textAlign: 'center',
                  color: colors.gray[600],
                }}>
                  Loading screenshots...
                </div>
              ) : screenshots.length === 0 ? (
                <div style={{
                  background: colors.background.primary,
                  borderRadius: borderRadius.xl,
                  padding: spacing[8],
                  border: `1px solid ${colors.gray[200]}`,
                  textAlign: 'center',
                  color: colors.gray[600],
                }}>
                  No screenshots found for this employee
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: spacing[4],
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  padding: spacing[2],
                }}>
                  {screenshots.map((screenshot) => (
                    <div
                      key={screenshot._id}
                      style={{
                        aspectRatio: '16/9',
                        borderRadius: borderRadius.lg,
                        overflow: 'hidden',
                        border: `1px solid ${colors.gray[200]}`,
                        cursor: 'pointer',
                        transition: `transform ${transitions.base}`,
                      }}
                      onClick={() => handleScreenshotClick(screenshot)}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      <img
                        src={screenshot.cloudUrl}
                        alt="Screenshot"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: spacing[4],
          }}
          onClick={closeScreenshotModal}
        >
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: borderRadius.lg,
              overflow: 'hidden',
              boxShadow: shadows['2xl'],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedScreenshot.cloudUrl}
              alt="Screenshot"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailPage; 