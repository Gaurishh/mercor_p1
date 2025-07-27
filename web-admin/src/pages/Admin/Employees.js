import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createInputStyle, createBadgeStyle } from '../../styles';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:4000/api/employees';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ fullName: '', email: '' });
  const [workingStatus, setWorkingStatus] = useState({});

  useEffect(() => {
    fetchEmployees();
    fetchWorkingStatus();
    
    // Refresh working status every 2 seconds
    const interval = setInterval(() => {
      fetchWorkingStatus();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchEmployees = async () => {
    const res = await axios.get(API);
    // Filter out admin users and sort by active status (active first, then inactive)
    const nonAdminEmployees = res.data
      .filter(emp => !emp.isAdmin) // Only show non-admin employees
      .sort((a, b) => {
        // Sort by active status: active employees first, then inactive
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        // If both have same active status, sort by name
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    setEmployees(nonAdminEmployees);
  };

  const fetchWorkingStatus = async () => {
    try {
      const res = await axios.get(`${API}/working-status`);
      setWorkingStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch working status:', err);
    }
  };

  const handleSelect = (emp) => {
    setSelected(emp);
  };

  const handleToggleActive = async (emp) => {
    await axios.put(`${API}/${emp._id}`, { isActive: !emp.isActive });
    fetchEmployees();
    if (selected && selected._id === emp._id) {
      setSelected({ ...emp, isActive: !emp.isActive });
    }
  };

  // Refresh working status (can be called periodically or on specific events)
  const refreshWorkingStatus = () => {
    fetchWorkingStatus();
  };

  const handleEmployeeClick = (employeeId) => {
    navigate(`/admin/dashboard/employee/${employeeId}`);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const activationLink = `http://localhost:3000/activate?token=${token}`;
      
      // Send email with activation link
      try {
        await axios.post('http://localhost:4000/api/auth/send-activation-email', {
        email: inviteForm.email,
          fullName: inviteForm.fullName,
          token: token
      });
        console.log('Activation email sent successfully');
      } catch (emailErr) {
        console.error('Failed to send activation email:', emailErr);
      }
      
      // Employee will be created when they activate their account
      setShowInviteModal(false);
      setInviteForm({ fullName: '', email: '' });
      alert('Invitation sent successfully! The employee will receive an email to complete their account setup.');
    } catch (err) {
      console.error('Failed to send invitation:', err);
      console.error('Error details:', err.response?.data);
      console.error('Status:', err.response?.status);
      alert(`Failed to send invitation: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div style={{ fontFamily: typography.fontFamily.primary }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[8],
        paddingBottom: spacing[6],
        borderBottom: `1px solid ${colors.gray[200]}`,
      }}>
        <div>
          <h1 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.gray[900],
            margin: 0,
            marginBottom: spacing[2],
            letterSpacing: '-0.025em',
          }}>
            Employees
          </h1>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.gray[600],
            margin: 0,
          }}>
            Manage your team members and their access ({employees.length} employees)
          </p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          style={{
            ...createButtonStyle('primary', 'md'),
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Invite Employee
        </button>
      </div>

      {/* Employee List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: spacing[6],
        marginBottom: spacing[8],
      }}>
        {employees.map((emp) => (
          <div
            key={emp._id}
            style={{
              background: colors.background.primary,
              borderRadius: borderRadius.xl,
              padding: spacing[6],
              border: `1px solid ${colors.gray[200]}`,
              boxShadow: shadows.sm,
              cursor: 'pointer',
              transition: `all ${transitions.base}`,
              '&:hover': {
                boxShadow: shadows.md,
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => handleEmployeeClick(emp._id)}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = shadows.md;
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = shadows.sm;
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[4],
            }}>
              <div style={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                borderRadius: borderRadius.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: typography.fontWeight.bold,
                fontSize: typography.fontSize.lg,
              }}>
                {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
              </div>
              <div style={{ display: 'flex', gap: spacing[2] }}>
                {workingStatus[emp._id] && (
                  <span style={{
                    backgroundColor: colors.error[500],
                    color: 'white',
                    fontSize: typography.fontSize.xs,
                    padding: `${spacing[1]} ${spacing[2]}`,
                    borderRadius: borderRadius.full,
                    fontWeight: typography.fontWeight.medium,
                  }}>
                    Working
                  </span>
                )}
                <span style={{
                  ...createBadgeStyle(emp.isActive ? 'success' : 'error'),
                  fontSize: typography.fontSize.xs,
                }}>
                  {emp.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.gray[900],
              margin: 0,
              marginBottom: spacing[2],
            }}>
              {emp.firstName} {emp.lastName}
            </h3>
            
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray[600],
              margin: 0,
              marginBottom: spacing[4],
            }}>
              {emp.email}
            </p>
            
            <div style={{ display: 'flex', gap: spacing[2] }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActive(emp);
                }}
                style={{
                  ...createButtonStyle(emp.isActive ? 'secondary' : 'success', 'sm'),
                  flex: 1,
                }}
              >
                {emp.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Employee Details */}
      {selected && (
        <div style={{
          background: colors.background.primary,
          borderRadius: borderRadius.xl,
          padding: spacing[8],
          border: `1px solid ${colors.gray[200]}`,
          boxShadow: shadows.lg,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[4],
            marginBottom: spacing[6],
            paddingBottom: spacing[6],
            borderBottom: `1px solid ${colors.gray[200]}`,
          }}>
            <div style={{
              width: 64,
              height: 64,
              background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
              borderRadius: borderRadius.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: typography.fontWeight.bold,
              fontSize: typography.fontSize['2xl'],
            }}>
              {selected.firstName.charAt(0)}{selected.lastName.charAt(0)}
            </div>
            <div>
              <h2 style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.gray[900],
                margin: 0,
                marginBottom: spacing[1],
              }}>
                {selected.firstName} {selected.lastName}
              </h2>
              <p style={{
                fontSize: typography.fontSize.base,
                color: colors.gray[600],
                margin: 0,
              }}>
                {selected.email}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: spacing[2] }}>
              {workingStatus[selected._id] && (
                <span style={{
                  backgroundColor: colors.error[500],
                  color: 'white',
                  fontSize: typography.fontSize.sm,
                  padding: `${spacing[2]} ${spacing[3]}`,
                  borderRadius: borderRadius.full,
                  fontWeight: typography.fontWeight.medium,
                }}>
                  Working
                </span>
              )}
              <span style={{
                ...createBadgeStyle(selected.isActive ? 'success' : 'error'),
                fontSize: typography.fontSize.sm,
                padding: `${spacing[2]} ${spacing[3]}`,
              }}>
                {selected.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing[6],
            marginBottom: spacing[6],
          }}>
            <div>
              <h4 style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700],
                margin: 0,
                marginBottom: spacing[2],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Status
              </h4>
              <p style={{
                fontSize: typography.fontSize.base,
                color: colors.gray[900],
                margin: 0,
              }}>
                {selected.isActive ? 'Active Member' : 'Inactive Member'}
                {workingStatus[selected._id] && (
                  <span style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    color: colors.error[600],
                    fontWeight: typography.fontWeight.medium,
                    marginTop: spacing[1],
                  }}>
                    Currently Working
                  </span>
                )}
              </p>
            </div>
            <div>
              <h4 style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700],
                margin: 0,
                marginBottom: spacing[2],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Role
              </h4>
              <p style={{
                fontSize: typography.fontSize.base,
                color: colors.gray[900],
                margin: 0,
              }}>
                {selected.isAdmin ? 'Administrator' : 'Employee'}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: spacing[3] }}>
            <button
              onClick={() => handleToggleActive(selected)}
              style={{
                ...createButtonStyle(selected.isActive ? 'secondary' : 'success', 'md'),
              }}
            >
              {selected.isActive ? 'Deactivate Account' : 'Activate Account'}
            </button>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: spacing[4],
        }}>
          <div style={{
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius['2xl'],
            padding: spacing[8],
            width: '100%',
            maxWidth: '480px',
            boxShadow: shadows['2xl'],
            border: `1px solid ${colors.gray[200]}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              marginBottom: spacing[6],
            }}>
              <div style={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                borderRadius: borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: typography.fontWeight.bold,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              <h2 style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.gray[900],
                margin: 0,
              }}>
                Invite Employee
              </h2>
            </div>
            
            <form onSubmit={handleInviteSubmit}>
              <div style={{ marginBottom: spacing[6] }}>
                <label style={{
                  display: 'block',
                  marginBottom: spacing[2],
                  color: colors.gray[700],
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={inviteForm.fullName}
                  onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                  required
                  style={createInputStyle()}
                  placeholder="Enter full name"
                />
              </div>
              <div style={{ marginBottom: spacing[8] }}>
                <label style={{
                  display: 'block',
                  marginBottom: spacing[2],
                  color: colors.gray[700],
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                  style={createInputStyle()}
                  placeholder="Enter email address"
                />
              </div>
              <div style={{ display: 'flex', gap: spacing[3] }}>
                <button
                  type="submit"
                  style={{
                    ...createButtonStyle('primary', 'md'),
                    flex: 1,
                  }}
                >
                  Send Invitation
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  style={{
                    ...createButtonStyle('secondary', 'md'),
                    flex: 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees; 