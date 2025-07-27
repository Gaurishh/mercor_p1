import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createCardStyle, createBadgeStyle } from './styles';

const API_BASE = 'http://localhost:4000/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentTimeLog, setCurrentTimeLog] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    // Get employee ID from localStorage
    const storedEmployeeId = localStorage.getItem('employeeId');
    setEmployeeId(storedEmployeeId);
    
    if (storedEmployeeId) {
      fetchEmployeeTasks(storedEmployeeId);
      fetchCurrentTimeLog(storedEmployeeId);
    }
  }, []);

  const fetchEmployeeTasks = async (empId) => {
    try {
      setLoading(true);
      
      // Fetch all tasks
      const tasksRes = await axios.get(`${API_BASE}/tasks`);
      const allTasks = tasksRes.data;
      
      // Filter tasks for this employee
      const employeeTasks = allTasks.filter(task => 
        task.employeeIds && task.employeeIds.includes(empId)
      );
      
      setTasks(employeeTasks);
      
      // Fetch projects for these tasks
      const projectIds = [...new Set(employeeTasks.map(task => task.projectId))];
      const projectsRes = await axios.get(`${API_BASE}/projects`);
      const allProjects = projectsRes.data;
      
      // Filter projects that have tasks for this employee
      const relevantProjects = allProjects.filter(project => 
        projectIds.includes(project._id)
      );
      
      setProjects(relevantProjects);
      
    } catch (err) {
      console.error('Failed to fetch employee tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentTimeLog = async (empId) => {
    try {
      const res = await axios.get(`${API_BASE}/timelogs?employeeId=${empId}`);
      const activeLog = res.data.find(log => !log.clockOut);
      setCurrentTimeLog(activeLog);
      setSelectedTasks(activeLog ? activeLog.taskIds : []);
    } catch (err) {
      console.error('Failed to fetch current timelog:', err);
    }
  };

  const handleTaskToggle = async (taskId) => {
    try {
      const newSelectedTasks = selectedTasks.includes(taskId)
        ? selectedTasks.filter(id => id !== taskId)
        : [...selectedTasks, taskId];
      
      setSelectedTasks(newSelectedTasks);
      
      if (currentTimeLog) {
        await axios.patch(`${API_BASE}/timelogs/${currentTimeLog._id}`, {
          taskIds: newSelectedTasks
        });
      }
    } catch (err) {
      console.error('Failed to update timelog tasks:', err);
      // Revert on error
      setSelectedTasks(selectedTasks);
    }
  };

  // Group tasks by project
  const tasksByProject = projects.map(project => ({
    ...project,
    tasks: tasks.filter(task => task.projectId === project._id)
  }));

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: spacing[6],
      }}>
        <div style={{
          fontSize: typography.fontSize.base,
          color: colors.gray[600],
        }}>
          Loading tasks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: spacing[6],
      }}>
        <div style={{
          fontSize: typography.fontSize.base,
          color: colors.error[600],
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: `0 ${spacing[6]}`,
      maxWidth: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Status Alert */}
      {!currentTimeLog && (
        <div style={{
          padding: spacing[4],
          background: colors.warning[50],
          border: `1px solid ${colors.warning[200]}`,
          borderRadius: borderRadius.lg,
          marginBottom: spacing[6],
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: colors.warning[600] }}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6m0 0v6"/>
            </svg>
            <span style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.warning[800],
            }}>
              No active time log. Please clock in first to manage tasks.
            </span>
          </div>
        </div>
      )}

      {/* Tasks by Project */}
      <div style={{
        display: 'grid',
        gap: spacing[6],
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        {tasksByProject.map((project) => (
          <div key={project._id} style={{
            ...createCardStyle(),
            padding: spacing[6],
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: spacing[4],
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.gray[900],
                  margin: 0,
                  marginBottom: spacing[2],
                }}>
                  {project.name}
                </h3>
                <p style={{
                  fontSize: typography.fontSize.base,
                  color: colors.gray[600],
                  margin: 0,
                  lineHeight: typography.lineHeight.relaxed,
                }}>
                  {project.description}
                </p>
              </div>
              <span style={createBadgeStyle('info')}>
                {project.tasks.length} tasks
              </span>
            </div>

            <div>
              <h4 style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[700],
                margin: 0,
                marginBottom: spacing[3],
              }}>
                Your Tasks:
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing[2],
              }}>
                {project.tasks.map((task) => (
                  <label key={task._id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: spacing[3],
                    background: colors.gray[50],
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.gray[200]}`,
                    cursor: currentTimeLog ? 'pointer' : 'not-allowed',
                    opacity: currentTimeLog ? 1 : 0.6,
                    transition: `all ${transitions.base}`,
                    '&:hover': currentTimeLog ? {
                      background: colors.gray[100],
                      transform: 'translateY(-1px)',
                      boxShadow: shadows.sm,
                    } : {},
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task._id)}
                      onChange={() => handleTaskToggle(task._id)}
                      disabled={!currentTimeLog}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: spacing[3],
                        accentColor: colors.primary[600],
                      }}
                    />
                    <div>
                      <span style={{
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        color: colors.gray[700],
                      }}>
                        {task.name || `Task ${task._id.slice(-6)}`}
                      </span>
                      {task.description && (
                        <div style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.gray[500],
                          marginTop: spacing[1],
                        }}>
                          {task.description}
                        </div>
                      )}
                      {selectedTasks.includes(task._id) && (
                        <span style={{
                          ...createBadgeStyle('success'),
                          marginLeft: spacing[2],
                        }}>
                          Selected
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {tasksByProject.length === 0 && (
          <div style={{
            ...createCardStyle(),
            padding: spacing[8],
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: typography.fontSize.base,
              color: colors.gray[600],
            }}>
              No tasks assigned to you yet.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;