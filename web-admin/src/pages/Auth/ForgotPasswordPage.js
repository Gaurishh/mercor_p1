import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_BACKEND_URL || 'http://localhost:4000';
const API_BASE = `${BACKEND_URL}/api/auth`;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/forgot-password`, { email });
      setMessage('If the email exists, we\'ve sent you a reset link.');
    } catch (err) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: 40, minWidth: 350 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 16
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </form>
        {message && (
          <div style={{ marginTop: 16, padding: 12, background: '#d4edda', color: '#155724', borderRadius: 4, textAlign: 'center' }}>
            {message}
          </div>
        )}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={() => navigate('/signin')}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 