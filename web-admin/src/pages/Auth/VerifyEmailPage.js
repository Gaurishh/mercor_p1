import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/auth';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get(`${API_BASE}/verify-email/${token}`);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: 40, minWidth: 350, textAlign: 'center' }}>
        {status === 'verifying' && <h2>Verifying...</h2>}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, color: '#28a745', marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#28a745', marginBottom: 12 }}>Email verified successfully!</h2>
            <button onClick={() => navigate('/signin')} style={{ marginTop: 24, padding: '10px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, fontSize: 16, cursor: 'pointer' }}>Go to Sign In</button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, color: '#dc3545', marginBottom: 16 }}>❌</div>
            <h2 style={{ color: '#dc3545', marginBottom: 12 }}>Invalid or expired verification link.</h2>
            <button onClick={() => navigate('/signin')} style={{ marginTop: 24, padding: '10px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, fontSize: 16, cursor: 'pointer' }}>Go to Sign In</button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage; 