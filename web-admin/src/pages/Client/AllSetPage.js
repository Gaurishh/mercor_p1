import React from 'react';

const AllSetPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
    <div style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: 40, minWidth: 350, textAlign: 'center' }}>
      <h2 style={{ color: '#28a745', marginBottom: 16 }}>All Set!</h2>
      <p>You are ready to use the app.</p>
      <a href="https://github.com/Gaurishh/mercor_p1/releases/download/v2.0.0/Inciteful-Desktop-v2.0.0.rar" download style={{ display: 'inline-block', marginTop: 24, padding: '10px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, fontSize: 16, textDecoration: 'none' }}>
        Download for Windows
      </a>
    </div>
  </div>
);

export default AllSetPage; 