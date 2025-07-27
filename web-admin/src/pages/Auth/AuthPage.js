import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createInputStyle } from '../../styles';

const API_BASE = 'http://localhost:4000/api/auth';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({
    firstName: '', lastName: '', gender: '', email: '', password: '', confirmPassword: '', isAdmin: false, isActive: true
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignInChange = (e) => {
    setSignInForm({ ...signInForm, [e.target.name]: e.target.value });
  };

  const handleSignUpChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSignUpForm({ ...signUpForm, [e.target.name]: value });
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE}/signin`, signInForm);
      const { isAdmin, _id } = res.data.employee;
      localStorage.setItem('isAdmin', isAdmin);
      localStorage.setItem('employeeId', _id);
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/client-ready');
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await axios.post(`${API_BASE}/signup`, signUpForm);
      setMessage('Verification link sent to your email. Please check your inbox.');
      setActiveTab('signin');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.gray[50]} 100%)`,
      padding: spacing[4],
      fontFamily: typography.fontFamily.primary,
    }}>
      <div style={{
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius['2xl'],
        boxShadow: shadows['2xl'],
        padding: spacing[10],
        width: '100%',
        maxWidth: '480px',
        border: `1px solid ${colors.gray[200]}`,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: spacing[8] }}>
          <div style={{
            width: 64,
            height: 64,
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
            borderRadius: borderRadius.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing[4],
            boxShadow: shadows.lg,
          }}>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: typography.fontWeight.bold }}>M</span>
          </div>
          <h1 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.gray[900],
            margin: 0,
            marginBottom: spacing[2],
            letterSpacing: '-0.025em',
          }}>
            Welcome to Mercor
          </h1>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.gray[600],
            margin: 0,
          }}>
            Sign in to your account or create a new one
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          marginBottom: spacing[8],
          borderRadius: borderRadius.lg,
          background: colors.gray[100],
          padding: spacing[1],
        }}>
          <button
            onClick={() => setActiveTab('signin')}
            style={{
              flex: 1,
              padding: `${spacing[3]} ${spacing[4]}`,
              border: 'none',
              borderRadius: borderRadius.md,
              background: activeTab === 'signin' ? colors.background.primary : 'transparent',
              color: activeTab === 'signin' ? colors.gray[900] : colors.gray[600],
              cursor: 'pointer',
              fontWeight: activeTab === 'signin' ? typography.fontWeight.semibold : typography.fontWeight.normal,
              fontSize: typography.fontSize.sm,
              transition: `all ${transitions.base}`,
              boxShadow: activeTab === 'signin' ? shadows.sm : 'none',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            style={{
              flex: 1,
              padding: `${spacing[3]} ${spacing[4]}`,
              border: 'none',
              borderRadius: borderRadius.md,
              background: activeTab === 'signup' ? colors.background.primary : 'transparent',
              color: activeTab === 'signup' ? colors.gray[900] : colors.gray[600],
              cursor: 'pointer',
              fontWeight: activeTab === 'signup' ? typography.fontWeight.semibold : typography.fontWeight.normal,
              fontSize: typography.fontSize.sm,
              transition: `all ${transitions.base}`,
              boxShadow: activeTab === 'signup' ? shadows.sm : 'none',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div style={{
            padding: spacing[4],
            borderRadius: borderRadius.lg,
            marginBottom: spacing[6],
            background: message.includes('Verification') ? colors.success[50] : colors.error[50],
            border: `1px solid ${message.includes('Verification') ? colors.success[200] : colors.error[200]}`,
            color: message.includes('Verification') ? colors.success[800] : colors.error[800],
            fontSize: typography.fontSize.sm,
            textAlign: 'center',
          }}>
            {message}
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignInSubmit}>
            <div style={{ marginBottom: spacing[6] }}>
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
                name="email"
                value={signInForm.email}
                onChange={handleSignInChange}
                required
                style={createInputStyle()}
                placeholder="Enter your email address"
              />
            </div>
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[2],
                color: colors.gray[700],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={signInForm.password}
                onChange={handleSignInChange}
                required
                style={createInputStyle()}
                placeholder="Enter your password"
              />
            </div>
            <div style={{ marginBottom: spacing[6], textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.primary[600],
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                  textDecoration: 'underline',
                  padding: 0,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...createButtonStyle('primary', 'lg'),
                width: '100%',
                marginBottom: spacing[6],
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: colors.gray[600], fontSize: typography.fontSize.sm }}>
                Don't have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.primary[600],
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit}>
            <div style={{ display: 'flex', gap: spacing[4], marginBottom: spacing[6] }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  marginBottom: spacing[2],
                  color: colors.gray[700],
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={signUpForm.firstName}
                  onChange={handleSignUpChange}
                  required
                  style={createInputStyle()}
                  placeholder="First name"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  marginBottom: spacing[2],
                  color: colors.gray[700],
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={signUpForm.lastName}
                  onChange={handleSignUpChange}
                  required
                  style={createInputStyle()}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div style={{ marginBottom: spacing[6] }}>
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
                name="email"
                value={signUpForm.email}
                onChange={handleSignUpChange}
                required
                style={createInputStyle()}
                placeholder="Enter your email address"
              />
            </div>
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[2],
                color: colors.gray[700],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={signUpForm.password}
                onChange={handleSignUpChange}
                required
                style={createInputStyle()}
                placeholder="Create a password"
              />
            </div>
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[2],
                color: colors.gray[700],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={signUpForm.confirmPassword}
                onChange={handleSignUpChange}
                required
                style={createInputStyle()}
                placeholder="Confirm your password"
              />
            </div>
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                color: colors.gray[700],
              }}>
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={signUpForm.isAdmin}
                  onChange={handleSignUpChange}
                  style={{
                    marginRight: spacing[3],
                    width: '16px',
                    height: '16px',
                    accentColor: colors.primary[600],
                  }}
                />
                <span>Is Admin</span>
              </label>
            </div>
            <div style={{ marginBottom: spacing[8] }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                color: colors.gray[700],
              }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={signUpForm.isActive}
                  onChange={handleSignUpChange}
                  style={{
                    marginRight: spacing[3],
                    width: '16px',
                    height: '16px',
                    accentColor: colors.primary[600],
                  }}
                />
                <span>Is Active</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...createButtonStyle('success', 'lg'),
                width: '100%',
                marginBottom: spacing[6],
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: colors.gray[600], fontSize: typography.fontSize.sm }}>
                Already have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.primary[600],
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage; 