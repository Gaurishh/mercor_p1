import React, { useEffect } from 'react';
import { colors, typography, spacing, shadows, borderRadius } from './styles';

const Toast = ({ message, isVisible, onClose, duration = 3000 }) => {
  console.log('Toast component render:', { message, isVisible, duration });

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) {
    console.log('Toast not visible, returning null');
    return null;
  }

  console.log('Rendering toast with message:', message);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: spacing[6],
        right: spacing[6],
        backgroundColor: colors.gray[50],
        color: colors.gray[800],
        padding: `${spacing[3]} ${spacing[4]}`,
        borderRadius: borderRadius.lg,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${colors.gray[200]}`,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        zIndex: 1000,
        minWidth: '280px',
        maxWidth: '400px',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing[3],
        backdropFilter: 'none',
        borderLeft: `4px solid ${colors.primary[500]}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], flex: 1 }}>
        {/* Success Icon */}
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: colors.primary[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.primary[600]} strokeWidth="2">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
        </div>
        
        {/* Message */}
        <span style={{ 
          lineHeight: '1.4',
          color: colors.gray[700],
        }}>
          {message}
        </span>
      </div>
      
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: colors.gray[400],
          cursor: 'pointer',
          padding: spacing[2],
          borderRadius: borderRadius.md,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.bold,
          transition: 'all 0.2s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.target.style.color = colors.gray[600];
          e.target.style.backgroundColor = colors.gray[100];
        }}
        onMouseLeave={(e) => {
          e.target.style.color = colors.gray[400];
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default Toast; 