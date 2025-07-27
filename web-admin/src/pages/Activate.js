import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createInputStyle } from '../styles';

const API = 'http://localhost:4000/api/auth';

const Activate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, form, success, error
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('Invalid activation link');
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API}/verify-activation-token/${token}`);
      if (response.data.valid) {
        setStatus('form');
      } else {
        setStatus('error');
        setMessage('Invalid or expired activation link');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Invalid or expired activation link');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!formData.gender) {
      setMessage('Please select your gender');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/activate-account/${token}`, {
        password: formData.password,
        gender: formData.gender
      });
      
      setStatus('success');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to activate account');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.gray[50]} 100%)`,
        fontFamily: typography.fontFamily.primary,
      }}>
        <div style={{
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows['2xl'],
          padding: spacing[10],
          textAlign: 'center',
          border: `1px solid ${colors.gray[200]}`,
        }}>
          <div style={{
            width: 64,
            height: 64,
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
            borderRadius: borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing[6],
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <h2 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.gray[900],
            margin: 0,
            marginBottom: spacing[4],
          }}>
            Verifying...
          </h2>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.gray[600],
            margin: 0,
          }}>
            Please wait while we verify your activation link
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.gray[50]} 100%)`,
        fontFamily: typography.fontFamily.primary,
      }}>
        <div style={{
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows['2xl'],
          padding: spacing[10],
          textAlign: 'center',
          border: `1px solid ${colors.gray[200]}`,
        }}>
          <div style={{
            width: 64,
            height: 64,
            background: `linear-gradient(135deg, ${colors.error[500]} 0%, ${colors.error[600]} 100%)`,
            borderRadius: borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing[6],
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <h2 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.error[700],
            margin: 0,
            marginBottom: spacing[4],
          }}>
            Invalid Link
          </h2>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.gray[600],
            margin: 0,
            marginBottom: spacing[6],
          }}>
            {message}
          </p>
          <button
            onClick={() => navigate('/signin')}
            style={createButtonStyle('primary', 'md')}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.gray[50]} 100%)`,
        fontFamily: typography.fontFamily.primary,
      }}>
        <div style={{
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows['2xl'],
          padding: spacing[10],
          textAlign: 'center',
          border: `1px solid ${colors.gray[200]}`,
        }}>
          <div style={{
            width: 64,
            height: 64,
            background: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
            borderRadius: borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing[6],
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <h2 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.success[700],
            margin: 0,
            marginBottom: spacing[4],
          }}>
            Account Activated!
          </h2>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.gray[600],
            margin: 0,
            marginBottom: spacing[6],
          }}>
            Your account has been successfully activated. You can now sign in.
          </p>
          <button
            onClick={() => navigate('/signin')}
            style={createButtonStyle('primary', 'md')}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

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
            marginBottom: spacing[6],
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.gray[900],
            margin: 0,
            marginBottom: spacing[2],
          }}>
            Complete Your Account
          </h1>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.gray[600],
            margin: 0,
          }}>
            Set your password and complete your profile
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              marginBottom: spacing[2],
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: colors.gray[700],
            }}>
              Password
            </label>
              <input
                type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
                required
              style={createInputStyle()}
              placeholder="Enter your password"
              />
            </div>

          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              marginBottom: spacing[2],
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: colors.gray[700],
            }}>
              Confirm Password
            </label>
              <input
                type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
                required
              style={createInputStyle()}
              placeholder="Confirm your password"
              />
            </div>

          <div style={{ marginBottom: spacing[8] }}>
            <label style={{
              display: 'block',
              marginBottom: spacing[2],
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: colors.gray[700],
            }}>
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              style={{
                ...createInputStyle(),
                cursor: 'pointer',
              }}
            >
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

            {message && (
              <div style={{ 
              marginBottom: spacing[6],
              padding: spacing[4],
              background: colors.error[50],
              color: colors.error[700],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.error[200]}`,
              fontSize: typography.fontSize.sm,
              }}>
                {message}
              </div>
            )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...createButtonStyle('primary', 'lg'),
              width: '100%',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Activating...' : 'Activate Account'}
            </button>
          </form>
        </div>
    </div>
  );
};

export default Activate; 