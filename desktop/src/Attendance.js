import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createCardStyle, createBadgeStyle } from './styles';
import { startWork, stopWork, setElapsed } from './store';

const API = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api/timelogs`;
const API_BASE = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api`;

const Attendance = ({ isActive }) => {
  const dispatch = useDispatch();
  const { isWorking, timeLogId, elapsed } = useSelector(state => state.timer);
  const { employeeId } = useSelector(state => state.auth);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevIsActive, setPrevIsActive] = useState(isActive);

  // Function to check for an active time log and restore state
  const checkActiveTimeLog = useCallback(async () => {
    try {
      const res = await axios.get(`${API}?employeeId=${employeeId}`);
      const activeLog = res.data.find(log => !log.clockOut);
      if (activeLog) {
        // Calculate elapsed time since clock in
        const clockInTime = new Date(activeLog.clockIn).getTime();
        const now = Date.now();
        const elapsedMs = now - clockInTime;
        dispatch(startWork({ timeLogId: activeLog._id, elapsed: Math.floor(elapsedMs / 1000) }));
      }
    } catch (err) {
      console.error('Failed to check active time log:', err);
    }
  }, [employeeId, dispatch]);

  const fetchTimeLogs = useCallback(async () => {
    try {
              setLoading(true);
        // console.log('Fetching time logs for employeeId:', employeeId);
        const res = await axios.get(`${API}?employeeId=${employeeId}`);
        // console.log('Time logs response:', res.data);
      setTimeLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch timelogs:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // Automatic screenshot function - called every 60 seconds
  const handleAutomaticScreenshot = useCallback(async () => {
    if (!window.electronAPI) {
      // console.log('Electron API not available for automatic screenshot');
      return;
    }
    
    try {
      // console.log('Taking automatic screenshot...');
      
      // 1. Take screenshot locally
      const result = await window.electronAPI.takeScreenshot();
      
      if (!result.success) {
        console.error('Automatic screenshot failed:', result.error);
        return;
      }
      
      // 2. Upload to Cloudinary via backend
      const uploadResponse = await axios.post(`${API_BASE}/screenshots/upload`, {
        filePath: result.filepath,
        employeeId: employeeId,
        filename: result.filename
      }, {
        timeout: 30000, // 30 second timeout
      });
      
      if (!uploadResponse.data.success) {
        console.error('Automatic screenshot upload failed:', uploadResponse.data.error);
        return;
      }
      
      // 3. Save metadata to MongoDB
      const metadata = {
        employeeId: employeeId,
        filename: result.filename,
        localPath: result.filepath,
        cloudUrl: uploadResponse.data.url,
        cloudinaryId: uploadResponse.data.publicId,
        fileSize: uploadResponse.data.size,
        timeLogId: timeLogId, // Current active time log
        metadata: {
          width: uploadResponse.data.width,
          height: uploadResponse.data.height,
          format: uploadResponse.data.format,
          quality: 80,
          compressionRatio: result.fileSize ? (uploadResponse.data.size / result.fileSize).toFixed(2) : null,
          automatic: true // Mark as automatic screenshot
        }
      };
      
      await axios.post(`${API_BASE}/screenshots`, metadata);
      console.log('Automatic screenshot saved successfully');
      
    } catch (error) {
      console.error('Automatic screenshot error:', error.message);
      // Don't show alerts for automatic screenshots to avoid interrupting the user
    }
  }, [employeeId, timeLogId]);

  // Check for active time log on mount and set up timer
  useEffect(() => {
    fetchTimeLogs();
    checkActiveTimeLog();
  }, [fetchTimeLogs, checkActiveTimeLog]); // Add both functions as dependencies

  // Set up timer interval separately
  useEffect(() => {
    const interval = setInterval(() => {
      if (isWorking) {
        const newElapsed = elapsed + 1;
        dispatch(setElapsed(newElapsed));
        
        // Take screenshot every 60 seconds (when elapsed is divisible by 60)
        if (newElapsed > 0 && newElapsed % 60 === 0) {
          console.log(`Taking automatic screenshot at ${newElapsed} seconds`);
          handleAutomaticScreenshot();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorking, elapsed, dispatch, handleAutomaticScreenshot]);

  // Refetch time logs when employee becomes active (after deactivation)
  useEffect(() => {
    if (employeeId) {
      fetchTimeLogs();
    }
  }, [employeeId, fetchTimeLogs]);

  // Detect when employee becomes active and trigger loading
  useEffect(() => {
    if (isActive && !prevIsActive) {
      // Employee just became active, trigger loading
      // console.log('Employee became active, triggering loading...');
      setLoading(true);
      
      // Add a small delay to ensure loading state is visible
      setTimeout(() => {
        fetchTimeLogs();
      }, 100);
    }
    setPrevIsActive(isActive);
  }, [isActive, prevIsActive, fetchTimeLogs]);

  const handleClockIn = async () => {
    try {
      const res = await axios.post(API, { employeeId, taskIds: [] });
      const newTimeLogId = res.data._id;
      dispatch(startWork({ timeLogId: newTimeLogId, elapsed: 0 }));
      fetchTimeLogs();
    } catch (err) {
      console.error('Failed to clock in:', err);
    }
  };

  const handleClockOut = async () => {
    try {
        await axios.patch(`${API}/${timeLogId}/clockout`);
      dispatch(stopWork());
      fetchTimeLogs();
    } catch (err) {
      console.error('Failed to clock out:', err);
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

  const formatTimeOnly = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (milliseconds) => {
    if (!milliseconds || isNaN(milliseconds)) {
      return '00:00:00';
    }
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const groupTimeLogsByDate = (logs) => {
    // console.log('Grouping time logs:', logs);
    const groups = {};
    
    logs.forEach(log => {
      // console.log('Processing log:', log);
      const date = new Date(log.clockIn);
      const dateKey = date.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateLabel: getDateLabel(date),
          logs: [],
          totalDuration: 0
        };
      }
      
      groups[dateKey].logs.push(log);
      
      if (log.clockOut) {
        const clockIn = new Date(log.clockIn).getTime();
        const clockOut = new Date(log.clockOut).getTime();
        const duration = clockOut - clockIn;
        // console.log('Duration calculation:', { 
        //   clockOut: log.clockOut, 
        //   clockIn: log.clockIn, 
        //   clockOutMs: clockOut,
        //   clockInMs: clockIn,
        //   duration 
        // });
        groups[dateKey].totalDuration += duration;
      }
    });
    
    // console.log('Grouped logs:', groups);
    
    // Sort logs within each group by clock in time (newest first)
    Object.values(groups).forEach(group => {
      group.logs.sort((a, b) => new Date(b.clockIn) - new Date(a.clockIn));
    });
    
    // Sort groups by date (newest first)
    return Object.values(groups).sort((a, b) => {
      const dateA = new Date(a.logs[0].clockIn);
      const dateB = new Date(b.logs[0].clockIn);
      return dateB - dateA;
    });
  };

  const getDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: spacing[6],
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}>


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

      {/* Clock In Button */}
      {!isWorking && (
        <button 
          onClick={handleClockIn}
          style={{
            ...createButtonStyle('success', 'lg'),
            fontSize: typography.fontSize.lg,
            padding: `${spacing[4]} ${spacing[8]}`,
            minWidth: '200px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: spacing[3] }}>
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          Clock In
        </button>
      )}

      {/* Clock Out Button */}
      {isWorking && (
        <button 
          onClick={handleClockOut}
          style={{
            ...createButtonStyle('danger', 'lg'),
            fontSize: typography.fontSize.lg,
            padding: `${spacing[4]} ${spacing[8]}`,
            minWidth: '200px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: spacing[3] }}>
            <rect x="6" y="6" width="12" height="12"/>
          </svg>
          Clock Out
        </button>
      )}

      {/* Time Log History */}
      <div style={{
        marginTop: spacing[8],
        marginBottom: spacing[8],
        width: '100%',
        maxWidth: '400px',
      }}>
        <h3 style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.gray[800],
          marginBottom: spacing[4],
          textAlign: 'center',
        }}>
          Time Log History
        </h3>
        
        {loading ? (
          <div style={{
            textAlign: 'center',
            color: colors.gray[500],
            fontSize: typography.fontSize.sm,
            padding: spacing[4],
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing[3],
          }}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ 
                animation: 'spin 1s linear infinite',
                color: colors.primary[500]
              }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            Loading time log history...
          </div>
        ) : timeLogs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: colors.gray[500],
            fontSize: typography.fontSize.sm,
            padding: spacing[4],
          }}>
            No time logs found
          </div>
        ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[4],
        }}>
            {groupTimeLogsByDate(timeLogs).map((dayGroup, index) => (
              <div key={index} style={{
                ...createCardStyle(),
              padding: spacing[4],
              }}>
                {/* Day Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing[3],
                  paddingBottom: spacing[2],
                  borderBottom: `1px solid ${colors.gray[200]}`,
                }}>
                  <span style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.gray[700],
                  }}>
                    {dayGroup.dateLabel}
                  </span>
                  <span style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.gray[600],
                    fontWeight: typography.fontWeight.medium,
                  }}>
                    {formatDuration(dayGroup.totalDuration)} h
                  </span>
                </div>

                {/* Time Log Entries */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing[3],
                }}>
                  {dayGroup.logs.map((log, logIndex) => (
                    <div key={logIndex} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: spacing[3],
                      background: colors.gray[50],
                      borderRadius: borderRadius.md,
                      border: `1px solid ${colors.gray[200]}`,
                    }}>
                      {/* Clock In/Out Times */}
                      <div style={{
                        display: 'flex',
                        gap: spacing[6],
                      }}>
                        <div>
                          <div style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.gray[600],
                            marginBottom: spacing[1],
                          }}>
                            Clock In
                          </div>
                          <div style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.gray[800],
                          }}>
                            {formatTimeOnly(log.clockIn)}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.gray[600],
                            marginBottom: spacing[1],
                          }}>
                            Clock Out
                          </div>
                          <div style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.gray[800],
                          }}>
                            {log.clockOut ? formatTimeOnly(log.clockOut) : '--'}
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.gray[600],
                        fontWeight: typography.fontWeight.medium,
                      }}>
                        {log.clockOut ? `${formatDuration(new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime())} h` : '--'}
                      </div>
            </div>
          ))}
        </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;