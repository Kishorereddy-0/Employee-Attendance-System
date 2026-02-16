import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const checkIn = createAsyncThunk('attendance/checkIn', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/attendance/checkin');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Check-in failed');
  }
});

export const checkOut = createAsyncThunk('attendance/checkOut', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/attendance/checkout');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Check-out failed');
  }
});

export const fetchTodayStatus = createAsyncThunk('attendance/fetchToday', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/attendance/today');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch today status');
  }
});

export const fetchMyHistory = createAsyncThunk('attendance/fetchMyHistory', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await API.get(`/attendance/my-history?${query}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
  }
});

export const fetchMySummary = createAsyncThunk('attendance/fetchMySummary', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await API.get(`/attendance/my-summary?${query}`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
  }
});

// Manager thunks
export const fetchAllAttendance = createAsyncThunk('attendance/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await API.get(`/attendance/all?${query}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
  }
});

export const fetchEmployeeAttendance = createAsyncThunk('attendance/fetchEmployee', async ({ id, ...params }, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await API.get(`/attendance/employee/${id}?${query}`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee attendance');
  }
});

export const fetchTeamSummary = createAsyncThunk('attendance/fetchTeamSummary', async (params, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await API.get(`/attendance/summary?${query}`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch team summary');
  }
});

export const fetchTodayAllStatus = createAsyncThunk('attendance/fetchTodayAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/attendance/today-status');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch today status');
  }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    today: null,
    history: [],
    summary: null,
    allAttendance: [],
    employeeAttendance: null,
    teamSummary: [],
    todayAllStatus: null,
    pagination: null,
    loading: false,
    error: null
  },
  reducers: {
    clearAttendanceError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkIn.pending, (state) => { state.loading = true; })
      .addCase(checkIn.fulfilled, (state, action) => { state.loading = false; state.today = action.payload; })
      .addCase(checkIn.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(checkOut.pending, (state) => { state.loading = true; })
      .addCase(checkOut.fulfilled, (state, action) => { state.loading = false; state.today = action.payload; })
      .addCase(checkOut.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchTodayStatus.fulfilled, (state, action) => { state.today = action.payload; })

      .addCase(fetchMyHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchMyHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyHistory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchMySummary.fulfilled, (state, action) => { state.summary = action.payload; })

      .addCase(fetchAllAttendance.pending, (state) => { state.loading = true; })
      .addCase(fetchAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.allAttendance = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllAttendance.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchEmployeeAttendance.fulfilled, (state, action) => { state.employeeAttendance = action.payload; })
      .addCase(fetchTeamSummary.fulfilled, (state, action) => { state.teamSummary = action.payload; })
      .addCase(fetchTodayAllStatus.fulfilled, (state, action) => { state.todayAllStatus = action.payload; });
  }
});

export const { clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
