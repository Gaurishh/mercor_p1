import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createCardStyle, createBadgeStyle } from './styles';
import { startWork, stopWork, setElapsed } from './store';

const API = 'http://localhost:4000/api/timelogs';

const Attendance = () => {
  const dispatch = useDispatch();
  const { isWorking, timeLogId, elapsed } = useSelector(state => state.timer);
  const { employeeId } = useSelector(state => state.auth);
  const [timeLogs, setTimeLogs] = useState([]);

  // Check for active time log on mount
  useEffect(() => {
    fetchTimeLogs();
    checkActiveTimeLog();
    const interval = setInterval(() => {
      if (isWorking) {
        dispatch(setElapsed(elapsed + 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorking, elapsed, dispatch]);

  // Function to check for an active time log and restore state
  const checkActiveTimeLog = async () => {
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
  };

  const fetchTimeLogs = async () => {
    try {
      console.log('Fetching time logs for employeeId:', employeeId);
      const res = await axios.get(`${API}?employeeId=${employeeId}`);
      console.log('Time logs response:', res.data);
      setTimeLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch timelogs:', err);
    }
  };

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
    console.log('Grouping time logs:', logs);
    const groups = {};
    
    logs.forEach(log => {
      console.log('Processing log:', log);
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
        console.log('Duration calculation:', { 
          clockOut: log.clockOut, 
          clockIn: log.clockIn, 
          clockOutMs: clockOut,
          clockInMs: clockIn,
          duration 
        });
        groups[dateKey].totalDuration += duration;
      }
    });
    
    console.log('Grouped logs:', groups);
    
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
          justifyContent: 'center',
            alignItems: 'center',
      height: '100%',
      padding: spacing[6],
      maxWidth: '100%',
      overflow: 'hidden',
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
              <polyline points="20,6 9,17 4,12"/>
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
            <path d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Clock Out
        </button>
      )}

      {/* Time Log History */}
      <div style={{
        marginTop: spacing[8],
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
        
        {timeLogs.length === 0 ? (
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