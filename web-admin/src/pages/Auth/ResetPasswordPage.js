import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
const API_BASE = `${BACKEND_URL}/api/auth`;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${API_BASE}/reset-password/${token}`, { newPassword, confirmPassword });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Invalid or expired reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: 40, minWidth: 350, textAlign: 'center' }}>
        {status === 'idle' && (
          <>
            <h2 style={{ marginBottom: 24 }}>Reset Password</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16, textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 16 }}
                />
              </div>
              <div style={{ marginBottom: 16, textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 16 }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
            {message && (
              <div style={{ marginTop: 16, padding: 12, background: '#f8d7da', color: '#721c24', borderRadius: 4 }}>{message}</div>
            )}
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, color: '#28a745', marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#28a745', marginBottom: 12 }}>Password updated!</h2>
            <p>Please sign in again.</p>
            <button onClick={() => navigate('/signin')} style={{ marginTop: 24, padding: '10px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, fontSize: 16, cursor: 'pointer' }}>Go to Sign In</button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, color: '#dc3545', marginBottom: 16 }}>❌</div>
            <h2 style={{ color: '#dc3545', marginBottom: 12 }}>Invalid or expired reset link.</h2>
            <button onClick={() => navigate('/forgot-password')} style={{ marginTop: 24, padding: '10px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, fontSize: 16, cursor: 'pointer' }}>Request New Link</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage; 