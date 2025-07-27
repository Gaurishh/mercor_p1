import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createCardStyle, createBadgeStyle } from './styles';

const API = 'http://localhost:4000/api/timelogs';
const SCREENSHOTS_API = 'http://localhost:4000/api/screenshots';

const Attendance = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [timeLogId, setTimeLogId] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [employeeId, setEmployeeId] = useState('1'); // Hardcoded for now
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchTimeLogs();
    const interval = setInterval(() => {
      if (isClockedIn) {
        setElapsed(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchTimeLogs = async () => {
    try {
      const res = await axios.get(`${API}?employeeId=${employeeId}`);
      setTimeLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch timelogs:', err);
    }
  };

  const takeScreenshot = async () => {
    try {
      const screenshotDataUrl = await window.electronAPI.takeScreenshot();
      return screenshotDataUrl;
    } catch (err) {
      console.error('Failed to take screenshot:', err);
      return null;
    }
  };

  const uploadScreenshot = async (screenshotDataUrl, timeLogId) => {
    try {
      // Convert data URL to blob
      const response = await fetch(screenshotDataUrl);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('screenshot', blob, 'screenshot.png');
      formData.append('timeLogId', timeLogId);
      formData.append('permissionGranted', 'true');
      
      await axios.post(SCREENSHOTS_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setToast('Screenshot uploaded successfully!');
    } catch (err) {
      console.error('Failed to upload screenshot:', err);
      setToast('Failed to upload screenshot');
    }
  };

  const handleClockInOut = async () => {
    try {
      if (!isClockedIn) {
        const res = await axios.post(API, { employeeId, taskIds: [] });
        const newTimeLogId = res.data._id;
        setTimeLogId(newTimeLogId);
        setIsClockedIn(true);
        setElapsed(0);
        
        // Take and upload screenshot
        const screenshotDataUrl = await takeScreenshot();
        if (screenshotDataUrl) {
          await uploadScreenshot(screenshotDataUrl, newTimeLogId);
        }
      } else {
        await axios.patch(`${API}/${timeLogId}/clockout`);
        setIsClockedIn(false);
        setTimeLogId(null);
        setElapsed(0);
      }
      fetchTimeLogs();
    } catch (err) {
      console.error('Failed to clock in/out:', err);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      padding: spacing[6],
      maxWidth: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: spacing[6],
          right: spacing[6],
          backgroundColor: toast.includes('success') ? colors.success[500] : colors.error[500],
          color: 'white',
          padding: `${spacing[4]} ${spacing[6]}`,
          borderRadius: borderRadius.lg,
          boxShadow: shadows.xl,
          zIndex: 1000,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
        }}>
          {toast}
        </div>
      )}

      {/* Timer Display */}
      <div style={{
        fontSize: '3rem',
        fontFamily: 'monospace',
        fontWeight: typography.fontWeight.bold,
        color: colors.gray[900],
        marginBottom: spacing[8],
        background: colors.gray[50],
        padding: spacing[6],
        borderRadius: borderRadius.xl,
        border: `1px solid ${colors.gray[200]}`,
        textAlign: 'center',
        minWidth: '240px',
      }}>
        {formatTime(elapsed)}
      </div>

      {/* Clock In/Out Button */}
      <button 
        onClick={handleClockInOut}
        style={{
          ...createButtonStyle(isClockedIn ? 'danger' : 'success', 'lg'),
          fontSize: typography.fontSize.lg,
          padding: `${spacing[4]} ${spacing[8]}`,
          minWidth: '200px',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: spacing[3] }}>
          {isClockedIn ? (
            <path d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          ) : (
            <polyline points="20,6 9,17 4,12"/>
          )}
        </svg>
        {isClockedIn ? 'Clock Out' : 'Clock In'}
      </button>
    </div>
  );
};

export default Attendance;