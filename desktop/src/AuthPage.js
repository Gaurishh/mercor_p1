import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createInputStyle } from './styles';
import { setAuth } from './store';

const API_BASE = 'http://localhost:4000/api/auth';

const AuthPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('signin');
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({
    firstName: '', lastName: '', gender: '', email: '', password: '', confirmPassword: '', isAdmin: false, isActive: true
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
    console.log('Attempting sign in with:', signInForm);
    
    try {
      console.log('Making request to:', `${API_BASE}/signin`);
      
      // Add timeout to prevent hanging
      const res = await axios.post(`${API_BASE}/signin`, signInForm, {
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Sign in response:', res.data);
      
      const { isAdmin, _id } = res.data.employee;
      console.log('Dispatching setAuth with:', { isAdmin, employeeId: _id });
      dispatch(setAuth({ isAdmin, employeeId: _id }));
      
      console.log('Sign in successful');
      
      // Add a small delay to prevent rapid state changes
      setTimeout(() => {
        console.log('Sign in process completed');
      }, 100);
    } catch (err) {
      console.error('Sign in error:', err);
      console.error('Error response:', err.response);
      
      if (err.code === 'ECONNABORTED') {
        setMessage('Request timed out. Please check if the backend server is running.');
      } else if (err.code === 'ERR_NETWORK') {
        setMessage('Network error. Please check if the backend server is running on http://localhost:4000');
      } else {
        setMessage(err.response?.data?.error || 'Sign in failed');
      }
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
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: spacing[6] }}>
          <div style={{
            width: 56,
            height: 56,
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
            borderRadius: borderRadius.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing[4],
            boxShadow: shadows.lg,
          }}>
            <span style={{ color: 'white', fontSize: '20px', fontWeight: typography.fontWeight.bold }}>I</span>
          </div>
          <h1 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.gray[900],
            margin: 0,
            marginBottom: spacing[2],
            letterSpacing: '-0.025em',
          }}>
            Welcome to Inciteful
          </h1>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[600],
            margin: 0,
          }}>
            Sign in to your account or create a new one
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          marginBottom: spacing[6],
          borderRadius: borderRadius.lg,
          background: colors.gray[100],
          padding: spacing[1],
        }}>
          <button
            onClick={() => setActiveTab('signin')}
            style={{
              flex: 1,
              padding: `${spacing[2]} ${spacing[3]}`,
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
              padding: `${spacing[2]} ${spacing[3]}`,
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
            padding: spacing[3],
            borderRadius: borderRadius.lg,
            marginBottom: spacing[4],
            background: message.includes('Verification') ? colors.success[50] : colors.error[50],
            border: `1px solid ${message.includes('Verification') ? colors.success[200] : colors.error[200]}`,
            color: message.includes('Verification') ? colors.success[800] : colors.error[800],
            fontSize: typography.fontSize.xs,
            textAlign: 'center',
          }}>
            {message}
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignInSubmit}>
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[2],
                color: colors.gray[700],
                fontSize: typography.fontSize.xs,
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
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[2],
                color: colors.gray[700],
                fontSize: typography.fontSize.xs,
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
            <button
              type="submit"
              disabled={loading}
              style={{
                ...createButtonStyle('primary', 'md'),
                width: '100%',
                marginBottom: spacing[4],
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: colors.gray[600], fontSize: typography.fontSize.xs }}>
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
                  fontSize: typography.fontSize.xs,
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
            <div style={{ display: 'flex', gap: spacing[3], marginBottom: spacing[4] }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  marginBottom: spacing[2],
                  color: colors.gray[700],
                  fontSize: typography.fontSize.xs,
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
                  fontSize: typography.fontSize.xs,
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
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[2],
                color: colors.gray[700],
                fontSize: typography.fontSize.xs,
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
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[2],
                color: colors.gray[700],
                fontSize: typography.fontSize.xs,
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
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[2],
                color: colors.gray[700],
                fontSize: typography.fontSize.xs,
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
            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: typography.fontSize.xs,
                color: colors.gray[700],
              }}>
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={signUpForm.isAdmin}
                  onChange={handleSignUpChange}
                  style={{
                    marginRight: spacing[2],
                    width: '14px',
                    height: '14px',
                    accentColor: colors.primary[600],
                  }}
                />
                <span>Is Admin</span>
              </label>
            </div>
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: typography.fontSize.xs,
                color: colors.gray[700],
              }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={signUpForm.isActive}
                  onChange={handleSignUpChange}
                  style={{
                    marginRight: spacing[2],
                    width: '14px',
                    height: '14px',
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
                ...createButtonStyle('success', 'md'),
                width: '100%',
                marginBottom: spacing[4],
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: colors.gray[600], fontSize: typography.fontSize.xs }}>
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
                  fontSize: typography.fontSize.xs,
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