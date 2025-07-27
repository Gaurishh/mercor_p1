import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { colors, typography, spacing, shadows, borderRadius, transitions, createButtonStyle, createInputStyle, createBadgeStyle } from '../../styles';

const PROJECTS_API = 'http://localhost:4000/api/projects';
const TASKS_API = 'http://localhost:4000/api/tasks';
const EMPLOYEES_API = 'http://localhost:4000/api/employees';

const Projects = () => {
  // Modal wrapper component for click-outside-to-close functionality
  const ModalWrapper = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: spacing[4],
        }}
        onClick={handleBackdropClick}
      >
        {children}
      </div>
    );
  };

  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [edit, setEdit] = useState(null);
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [editTasks, setEditTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    tasks: [{ name: '', description: '', employeeIds: [] }]
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    const res = await axios.get(PROJECTS_API);
    setProjects(res.data);
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(EMPLOYEES_API);
      // Filter for non-admin, verified, and active employees
      const eligibleEmployees = res.data.filter(emp => 
        !emp.isAdmin && // Not an admin
        emp.emailVerified && // Email is verified
        emp.isActive // Account is active
      );
      setEmployees(eligibleEmployees);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchTasksForProject = async (projectId) => {
    try {
      const res = await axios.get(TASKS_API);
      const projectTasks = res.data.filter(task => task.projectId === projectId);
      setEditTasks(projectTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const handleSelect = async (project) => {
    setSelected(project);
    await fetchTasksForProject(project._id);
    setShowViewModal(true);
  };

  const handleEdit = async (project) => {
    setEditData({ 
      name: project.name, 
      description: project.description,
      _id: project._id 
    });
    await fetchTasksForProject(project._id);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditTaskChange = (index, field, value) => {
    const newTasks = [...editTasks];
    newTasks[index][field] = value;
    setEditTasks(newTasks);
  };

  const handleEditEmployeeChange = async (taskIndex, employeeId) => {
    const newTasks = [...editTasks];
    const currentEmployeeIds = newTasks[taskIndex].employeeIds || [];
    const task = newTasks[taskIndex];
    
    if (currentEmployeeIds.includes(employeeId)) {
      // Remove employee from task
      newTasks[taskIndex].employeeIds = currentEmployeeIds.filter(id => id !== employeeId);
      
      // Remove taskId from employee's taskIds array
      if (task._id) {
        try {
          await axios.put(`${EMPLOYEES_API}/${employeeId}`, {
            $pull: { taskIds: task._id }
          });
        } catch (err) {
          console.error('Failed to remove task from employee:', err);
        }
      }
    } else {
      // Add employee to task
      newTasks[taskIndex].employeeIds = [...currentEmployeeIds, employeeId];
      
      // Add taskId to employee's taskIds array
      if (task._id) {
        try {
          await axios.put(`${EMPLOYEES_API}/${employeeId}`, {
            $addToSet: { taskIds: task._id }
          });
        } catch (err) {
          console.error('Failed to add task to employee:', err);
        }
      }
    }
    
    setEditTasks(newTasks);
  };

  const handleAddEditTask = () => {
    setEditTasks([...editTasks, { 
      name: '', 
      description: '', 
      employeeIds: [], 
      projectId: editData._id,
      isNew: true 
    }]);
  };

  const handleRemoveEditTask = async (index) => {
    const newTasks = [...editTasks];
    const taskToRemove = newTasks[index];
    
    if (taskToRemove._id && !taskToRemove.isNew) {
      try {
        await axios.delete(`${TASKS_API}/${taskToRemove._id}`);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
    
    newTasks.splice(index, 1);
    setEditTasks(newTasks);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update project
      await axios.put(`${PROJECTS_API}/${editData._id}`, {
        name: editData.name,
        description: editData.description
      });

      // Update tasks
      for (const task of editTasks) {
        if (task.isNew) {
          const taskRes = await axios.post(TASKS_API, {
            name: task.name,
            description: task.description,
            projectId: editData._id,
            employeeIds: task.employeeIds
          });

          // Update each assigned employee's taskIds array for new tasks
          if (task.employeeIds && task.employeeIds.length > 0) {
            for (const employeeId of task.employeeIds) {
              try {
                await axios.put(`${EMPLOYEES_API}/${employeeId}`, {
                  $addToSet: { taskIds: taskRes.data._id }
                });
              } catch (err) {
                console.error('Failed to add task to employee:', err);
              }
            }
          }
        } else {
          await axios.put(`${TASKS_API}/${task._id}`, {
            name: task.name,
            description: task.description,
            employeeIds: task.employeeIds
          });
        }
      }

      setShowEditModal(false);
      setEditData({ name: '', description: '' });
      setEditTasks([]);
      fetchProjects();
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await axios.delete(`${PROJECTS_API}/${id}`);
      
      // Close edit menu if the deleted project was being edited
      if (edit === id) {
        setEdit(null);
        setEditData({ name: '', description: '' });
        setEditTasks([]);
      }
      
      fetchProjects();
    }
  };

  const handleAddTask = () => {
    setAddForm({
      ...addForm,
      tasks: [...addForm.tasks, { name: '', description: '', employeeIds: [] }]
    });
  };

  const handleRemoveTask = (index) => {
    const newTasks = [...addForm.tasks];
    newTasks.splice(index, 1);
    setAddForm({ ...addForm, tasks: newTasks });
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...addForm.tasks];
    newTasks[index][field] = value;
    setAddForm({ ...addForm, tasks: newTasks });
  };

  const handleEmployeeChange = (taskIndex, employeeId) => {
    const newTasks = [...addForm.tasks];
    const currentEmployeeIds = newTasks[taskIndex].employeeIds || [];
    
    if (currentEmployeeIds.includes(employeeId)) {
      newTasks[taskIndex].employeeIds = currentEmployeeIds.filter(id => id !== employeeId);
    } else {
      newTasks[taskIndex].employeeIds = [...currentEmployeeIds, employeeId];
    }
    
    setAddForm({ ...addForm, tasks: newTasks });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create project
      const projectRes = await axios.post(PROJECTS_API, {
        name: addForm.name,
        description: addForm.description
      });

      // Create tasks and update employee taskIds
      for (const task of addForm.tasks) {
        const taskRes = await axios.post(TASKS_API, {
          name: task.name,
          description: task.description,
          projectId: projectRes.data._id,
          employeeIds: task.employeeIds
        });

        // Update each assigned employee's taskIds array
        if (task.employeeIds && task.employeeIds.length > 0) {
          for (const employeeId of task.employeeIds) {
            try {
              await axios.put(`${EMPLOYEES_API}/${employeeId}`, {
                $addToSet: { taskIds: taskRes.data._id }
              });
            } catch (err) {
              console.error('Failed to add task to employee:', err);
            }
          }
        }
      }

      setShowAddModal(false);
      setAddForm({
        name: '',
        description: '',
        tasks: [{ name: '', description: '', employeeIds: [] }]
      });
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <div style={{ fontFamily: typography.fontFamily.primary }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[8],
        paddingBottom: spacing[6],
        borderBottom: `1px solid ${colors.gray[200]}`,
      }}>
        <div>
          <h1 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.gray[900],
            margin: 0,
            marginBottom: spacing[2],
            letterSpacing: '-0.025em',
          }}>
            Projects
          </h1>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.gray[600],
            margin: 0,
          }}>
            Manage your projects and tasks
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{
            ...createButtonStyle('success', 'md'),
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Project
        </button>
      </div>

      {/* Project List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: spacing[6],
        marginBottom: spacing[8],
      }}>
        {projects.map((project) => (
          <div
            key={project._id}
            style={{
              background: colors.background.primary,
              borderRadius: borderRadius.xl,
              padding: spacing[6],
              border: `1px solid ${colors.gray[200]}`,
              boxShadow: shadows.sm,
              cursor: 'pointer',
              transition: `all ${transitions.base}`,
            }}
            onClick={() => handleSelect(project)}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = shadows.md;
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = shadows.sm;
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[4],
            }}>
              <div style={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
                borderRadius: borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: typography.fontWeight.bold,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"/>
                </svg>
              </div>
              <div style={{ display: 'flex', gap: spacing[2] }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}
                  style={{
                    ...createButtonStyle('secondary', 'sm'),
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project._id);
                  }}
                  style={{
                    ...createButtonStyle('danger', 'sm'),
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.gray[900],
              margin: 0,
              marginBottom: spacing[2],
            }}>
              {project.name}
            </h3>
            
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.gray[600],
              margin: 0,
              marginBottom: spacing[4],
              lineHeight: typography.lineHeight.relaxed,
            }}>
              {project.description}
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              fontSize: typography.fontSize.xs,
              color: colors.gray[500],
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11H1l8-8 8 8h-8v8z"/>
              </svg>
              <span>{project.taskIds?.length || 0} tasks</span>
            </div>
          </div>
        ))}
      </div>

      {/* View Project Modal */}
      <ModalWrapper isOpen={showViewModal} onClose={() => setShowViewModal(false)}>
        <div style={{
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius['2xl'],
          padding: spacing[8],
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: shadows['2xl'],
          border: `1px solid ${colors.gray[200]}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[4],
            marginBottom: spacing[6],
            paddingBottom: spacing[6],
            borderBottom: `1px solid ${colors.gray[200]}`,
          }}>
            <div style={{
              width: 64,
              height: 64,
              background: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
              borderRadius: borderRadius.xl,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: typography.fontWeight.bold,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.gray[900],
                margin: 0,
                marginBottom: spacing[2],
              }}>
                {selected?.name}
              </h2>
              <p style={{
                fontSize: typography.fontSize.base,
                color: colors.gray[600],
                margin: 0,
                lineHeight: typography.lineHeight.relaxed,
              }}>
                {selected?.description}
              </p>
            </div>
            <div style={{ display: 'flex', gap: spacing[3] }}>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selected);
                }}
                style={{
                  ...createButtonStyle('primary', 'md'),
                }}
              >
                Edit Project
              </button>
            </div>
          </div>
          
          <div>
            <h3 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.gray[900],
              margin: 0,
              marginBottom: spacing[4],
            }}>
              Tasks ({selected?.taskIds?.length || 0})
            </h3>
            <div style={{
              display: 'grid',
              gap: spacing[4],
            }}>
              {(selected?.taskIds || []).map((taskId, index) => (
                <div
                  key={taskId}
                  style={{
                    padding: spacing[4],
                    background: colors.gray[50],
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.gray[200]}`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    marginBottom: spacing[2],
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      background: colors.primary[500],
                      borderRadius: borderRadius.full,
                    }} />
                    <span style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.gray[700],
                    }}>
                      Task {index + 1}
                    </span>
                  </div>
                  <p style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.gray[600],
                    margin: 0,
                  }}>
                    {taskId}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModalWrapper>

      {/* Edit Project Modal */}
      <ModalWrapper isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <div style={{
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius['2xl'],
          padding: spacing[8],
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: shadows['2xl'],
          border: `1px solid ${colors.gray[200]}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            marginBottom: spacing[6],
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${colors.warning[500]} 0%, ${colors.warning[600]} 100%)`,
              borderRadius: borderRadius.lg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: typography.fontWeight.bold,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <h2 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.gray[900],
              margin: 0,
            }}>
              Edit Project
            </h2>
          </div>
          
          <form onSubmit={handleEditSubmit}>
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[2],
                color: colors.gray[700],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
              }}>
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                required
                style={createInputStyle()}
                placeholder="Enter project name"
              />
            </div>
            
            <div style={{ marginBottom: spacing[8] }}>
              <label style={{
                display: 'block',
                marginBottom: spacing[2],
                color: colors.gray[700],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
              }}>
                Description
              </label>
              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                required
                style={{
                  ...createInputStyle(),
                  minHeight: '100px',
                  resize: 'vertical',
                }}
                placeholder="Enter project description"
              />
            </div>

            {/* Tasks Section */}
            <div style={{ marginBottom: spacing[8] }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing[4],
              }}>
                <h3 style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.gray[900],
                  margin: 0,
                }}>
                  Tasks
                </h3>
                <button
                  type="button"
                  onClick={handleAddEditTask}
                  style={{
                    ...createButtonStyle('secondary', 'sm'),
                  }}
                >
                  Add Task
                </button>
              </div>
              
              <div style={{ display: 'grid', gap: spacing[4] }}>
                {editTasks.map((task, index) => (
                  <div
                    key={index}
                    style={{
                      padding: spacing[4],
                      background: colors.gray[50],
                      borderRadius: borderRadius.lg,
                      border: `1px solid ${colors.gray[200]}`,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: spacing[3],
                    }}>
                      <h4 style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.medium,
                        color: colors.gray[900],
                        margin: 0,
                      }}>
                        Task {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditTask(index)}
                        style={{
                          ...createButtonStyle('danger', 'sm'),
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div style={{ marginBottom: spacing[3] }}>
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => handleEditTaskChange(index, 'name', e.target.value)}
                        placeholder="Task name"
                        style={createInputStyle()}
                      />
                    </div>
                    
                    <div style={{ marginBottom: spacing[3] }}>
                      <textarea
                        value={task.description}
                        onChange={(e) => handleEditTaskChange(index, 'description', e.target.value)}
                        placeholder="Task description"
                        style={{
                          ...createInputStyle(),
                          fontFamily: typography.fontFamily.primary,
                          minHeight: '60px',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: spacing[2],
                        color: colors.gray[700],
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                      }}>
                        Assigned Employees
                      </label>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: spacing[2],
                      }}>
                        {employees.map((emp) => (
                          <label
                            key={emp._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing[2],
                              fontSize: typography.fontSize.sm,
                              color: colors.gray[700],
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={(task.employeeIds || []).includes(emp._id)}
                              onChange={() => handleEditEmployeeChange(index, emp._id)}
                              style={{
                                width: '16px',
                                height: '16px',
                                accentColor: colors.primary[600],
                              }}
                            />
                            {emp.firstName} {emp.lastName}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: spacing[3] }}>
              <button
                type="submit"
                style={{
                  ...createButtonStyle('success', 'md'),
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditData({ name: '', description: '' });
                  setEditTasks([]);
                }}
                style={{
                  ...createButtonStyle('secondary', 'md'),
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        </ModalWrapper>

      {/* Add Project Modal */}
      <ModalWrapper isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <div style={{
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius['2xl'],
            padding: spacing[8],
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: shadows['2xl'],
            border: `1px solid ${colors.gray[200]}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              marginBottom: spacing[6],
            }}>
              <div style={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
                borderRadius: borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: typography.fontWeight.bold,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <h2 style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.gray[900],
                margin: 0,
              }}>
                Add New Project
              </h2>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: spacing[6] }}>
                <label style={{
                  display: 'block',
                  marginBottom: spacing[2],
                  color: colors.gray[700],
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  required
                  style={createInputStyle()}
                  placeholder="Enter project name"
                />
              </div>
              
              <div style={{ marginBottom: spacing[8] }}>
                <label style={{
                  display: 'block',
                  marginBottom: spacing[2],
                  color: colors.gray[700],
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}>
                  Description
                </label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  required
                  style={{
                    ...createInputStyle(),
                    minHeight: '100px',
                    resize: 'vertical',
                  }}
                  placeholder="Enter project description"
                />
              </div>

              {/* Tasks Section */}
              <div style={{ marginBottom: spacing[8] }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing[4],
                }}>
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.gray[900],
                    margin: 0,
                  }}>
                    Tasks
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddTask}
                    style={{
                      ...createButtonStyle('secondary', 'sm'),
                    }}
                  >
                    Add Task
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: spacing[4] }}>
                  {addForm.tasks.map((task, index) => (
                    <div
                      key={index}
                      style={{
                        padding: spacing[4],
                        background: colors.gray[50],
                        borderRadius: borderRadius.lg,
                        border: `1px solid ${colors.gray[200]}`,
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: spacing[3],
                      }}>
                        <h4 style={{
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.medium,
                          color: colors.gray[900],
                          margin: 0,
                        }}>
                          Task {index + 1}
                        </h4>
                        {addForm.tasks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTask(index)}
                            style={{
                              ...createButtonStyle('danger', 'sm'),
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div style={{ marginBottom: spacing[3] }}>
                        <input
                          type="text"
                          value={task.name}
                          onChange={(e) => handleTaskChange(index, 'name', e.target.value)}
                          placeholder="Task name"
                          style={createInputStyle()}
                        />
                      </div>
                      
                      <div style={{ marginBottom: spacing[3] }}>
                        <textarea
                          value={task.description}
                          onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                          placeholder="Task description"
                          style={{
                            ...createInputStyle(),
                            fontFamily: typography.fontFamily.primary,
                            minHeight: '60px',
                            resize: 'vertical',
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: spacing[2],
                          color: colors.gray[700],
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                        }}>
                          Assigned Employees
                        </label>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: spacing[2],
                        }}>
                          {employees.map((emp) => (
                            <label
                              key={emp._id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: spacing[2],
                                fontSize: typography.fontSize.sm,
                                color: colors.gray[700],
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={(task.employeeIds || []).includes(emp._id)}
                                onChange={() => handleEmployeeChange(index, emp._id)}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  accentColor: colors.primary[600],
                                }}
                              />
                              {emp.firstName} {emp.lastName}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: spacing[3] }}>
                <button
                  type="submit"
                  style={{
                    ...createButtonStyle('success', 'md'),
                    flex: 1,
                  }}
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    ...createButtonStyle('secondary', 'md'),
                    flex: 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </ModalWrapper>
    </div>
  );
};

export default Projects; 