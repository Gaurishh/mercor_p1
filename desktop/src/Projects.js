import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createCardStyle, createBadgeStyle } from './styles';
import { setSelectedTasks, setCurrentTimeLog, setTaskStatus } from './store';

const API_BASE = 'http://localhost:4000/api';

const Tasks = () => {
  const dispatch = useDispatch();
  const { selectedTasks, currentTimeLog, taskStatuses } = useSelector(state => state.tasks);
  const { employeeId } = useSelector(state => state.auth);
  const { isWorking } = useSelector(state => state.timer);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeTasks(employeeId);
      fetchCurrentTimeLog(employeeId);
    }
  }, [employeeId]);

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
      
      // Initialize task statuses only if they don't already exist in Redux
      const currentStatuses = taskStatuses;
      const initialStatuses = {};
      employeeTasks.forEach(task => {
        // Only set status if it doesn't already exist in Redux
        if (!currentStatuses[task._id]) {
          initialStatuses[task._id] = 'Inactive';
        }
      });
      
      // Update Redux state with only new statuses
      Object.entries(initialStatuses).forEach(([taskId, status]) => {
        dispatch(setTaskStatus({ taskId, status }));
      });
      
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
      dispatch(setCurrentTimeLog(activeLog));
      dispatch(setSelectedTasks(activeLog ? activeLog.taskIds : []));
    } catch (err) {
      console.error('Failed to fetch current timelog:', err);
    }
  };

  const handleTaskToggle = async (taskId) => {
    try {
      const newSelectedTasks = selectedTasks.includes(taskId)
        ? selectedTasks.filter(id => id !== taskId)
        : [...selectedTasks, taskId];
      
      dispatch(setSelectedTasks(newSelectedTasks));
      
      if (currentTimeLog) {
        await axios.patch(`${API_BASE}/timelogs/${currentTimeLog._id}`, {
          taskIds: newSelectedTasks
        });
      }
    } catch (err) {
      console.error('Failed to update timelog tasks:', err);
      // Revert on error
      dispatch(setSelectedTasks(selectedTasks));
    }
  };

  const handleStatusToggle = async (taskId) => {
    try {
      const currentStatus = taskStatuses[taskId] || 'Inactive';
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      
      // Update local state immediately
      dispatch(setTaskStatus({ taskId, status: newStatus }));
      
      // If switching to Active, add employee to task
      if (newStatus === 'Active') {
        await axios.patch(`${API_BASE}/tasks/${taskId}/assign-employee`, {
          employeeId
        });
        
        // Update local task data to include employee in workedOnBy
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId 
              ? { 
                  ...task, 
                  workedOnBy: task.workedOnBy ? [...task.workedOnBy, employeeId] : [employeeId]
                }
              : task
          )
        );
      } else {
        // If switching to Inactive, remove employee from task
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId 
              ? { 
                  ...task, 
                  workedOnBy: task.workedOnBy ? task.workedOnBy.filter(id => id !== employeeId) : []
                }
              : task
          )
        );
      }
      
      // Don't refresh tasks - keep the Redux state intact
      
    } catch (err) {
      console.error('Failed to toggle task status:', err);
      // Revert on error
      dispatch(setTaskStatus({ taskId, status: currentStatus }));
    }
  };

  const handleTaskComplete = async (taskId, isCompleted) => {
    try {
      if (isCompleted) {
        // Mark as incomplete
        await axios.patch(`${API_BASE}/tasks/${taskId}/uncomplete`, {
          employeeId
        });
      } else {
        // Mark as complete
        await axios.patch(`${API_BASE}/tasks/${taskId}/complete`, {
          employeeId
        });
      }
      
      // Update local task data instead of refreshing
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId 
            ? { 
                ...task, 
                isCompleted: !isCompleted,
                completedAt: !isCompleted ? new Date() : null,
                completedBy: !isCompleted ? employeeId : null
              }
            : task
        )
      );
      
    } catch (err) {
      console.error('Failed to update task completion:', err);
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


      {/* Clock-in Warning */}
      {!isWorking && (
        <div style={{
          ...createCardStyle(),
          padding: spacing[4],
          marginBottom: spacing[4],
          background: colors.warning[50],
          border: `1px solid ${colors.warning[200]}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}>
            <span style={{
              fontSize: typography.fontSize.lg,
              color: colors.warning[600],
            }}>
              ⏰
            </span>
            <span style={{
              fontSize: typography.fontSize.base,
              color: colors.warning[700],
              fontWeight: typography.fontWeight.medium,
            }}>
              Please clock in from the Attendance tab to interact with tasks
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
                {project.tasks.map((task) => {
                  const taskStatus = taskStatuses[task._id] || 'Inactive';
                  const isCompleted = task.isCompleted;
                  const canComplete = task.workedOnBy && task.workedOnBy.includes(employeeId);
                  const canUncomplete = task.completedBy === employeeId;
                  
                  return (
                    <div key={task._id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: spacing[3],
                      background: isCompleted ? colors.gray[100] : colors.gray[50],
                      borderRadius: borderRadius.lg,
                      border: `1px solid ${colors.gray[200]}`,
                      opacity: isCompleted ? 0.7 : 1,
                      transition: `all ${transitions.base}`,
                    }}>
                      {/* Left side - Task info and completion checkbox */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                      }}>
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => handleTaskComplete(task._id, isCompleted)}
                          disabled={!isWorking || !canComplete || (isCompleted && !canUncomplete)}
                          style={{
                            width: '18px',
                            height: '18px',
                            marginRight: spacing[3],
                            accentColor: colors.primary[600],
                            opacity: (!isWorking || isCompleted) ? 0.5 : 1,
                            cursor: (!isWorking || !canComplete || (isCompleted && !canUncomplete)) ? 'not-allowed' : 'pointer',
                          }}
                        />
                        <div style={{
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          color: isCompleted ? colors.gray[500] : colors.gray[700],
                        }}>
                          <span style={{
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.medium,
                          }}>
                            {task.name || `Task ${task._id.slice(-6)}`}
                          </span>
                          {task.description && (
                            <div style={{
                              fontSize: typography.fontSize.xs,
                              color: isCompleted ? colors.gray[400] : colors.gray[500],
                              marginTop: spacing[1],
                            }}>
                              {task.description}
                            </div>
                          )}
                          {isCompleted && (
                            <div style={{
                              fontSize: typography.fontSize.xs,
                              color: colors.success[600],
                              marginTop: spacing[1],
                            }}>
                              Completed {task.completedAt && new Date(task.completedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side - Status button and selection badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[2],
                      }}>
                        {/* Status Toggle Button */}
                        <button
                          onClick={() => handleStatusToggle(task._id)}
                          disabled={!isWorking || isCompleted}
                          style={{
                            ...createButtonStyle(taskStatus === 'Active' ? 'success' : 'secondary', 'sm'),
                            fontSize: typography.fontSize.xs,
                            padding: `${spacing[1]} ${spacing[2]}`,
                            minWidth: '60px',
                            opacity: (!isWorking || isCompleted) ? 0.5 : 1,
                            cursor: (!isWorking || isCompleted) ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {taskStatus}
                        </button>

                        {/* Selection Badge */}
                        {selectedTasks.includes(task._id) && (
                          <span style={{
                            ...createBadgeStyle('info'),
                            fontSize: typography.fontSize.xs,
                          }}>
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
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