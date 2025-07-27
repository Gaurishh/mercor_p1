import { configureStore, createSlice } from '@reduxjs/toolkit';

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    employeeId: null,
    isAdmin: false,
  },
  reducers: {
    setAuth: (state, action) => {
      state.employeeId = action.payload.employeeId;
      state.isAdmin = action.payload.isAdmin;
      // Persist to localStorage
      localStorage.setItem('employeeId', action.payload.employeeId);
      localStorage.setItem('isAdmin', action.payload.isAdmin.toString());
    },
    clearAuth: (state) => {
      state.employeeId = null;
      state.isAdmin = false;
      // Clear localStorage
      localStorage.removeItem('employeeId');
      localStorage.removeItem('isAdmin');
    },
  },
});

// Timer slice
const timerSlice = createSlice({
  name: 'timer',
  initialState: {
    isWorking: false,
    timeLogId: null,
    elapsed: 0,
  },
  reducers: {
    startWork: (state, action) => {
      state.isWorking = true;
      state.timeLogId = action.payload.timeLogId;
      state.elapsed = action.payload.elapsed || 0;
    },
    stopWork: (state) => {
      state.isWorking = false;
      state.timeLogId = null;
      state.elapsed = 0;
    },
    setElapsed: (state, action) => {
      state.elapsed = action.payload;
    },
  },
});

// Tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    selectedTasks: [],
    currentTimeLog: null,
    taskStatuses: {}, // Track local task status (Active/Inactive)
  },
  reducers: {
    setSelectedTasks: (state, action) => {
      state.selectedTasks = action.payload;
    },
    setCurrentTimeLog: (state, action) => {
      state.currentTimeLog = action.payload;
    },
    setTaskStatus: (state, action) => {
      const { taskId, status } = action.payload;
      state.taskStatuses[taskId] = status;
    },
    clearTasks: (state) => {
      state.selectedTasks = [];
      state.currentTimeLog = null;
      state.taskStatuses = {};
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export const { startWork, stopWork, setElapsed } = timerSlice.actions;
export const { setSelectedTasks, setCurrentTimeLog, clearTasks, setTaskStatus } = tasksSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    timer: timerSlice.reducer,
    tasks: tasksSlice.reducer,
  },
}); 