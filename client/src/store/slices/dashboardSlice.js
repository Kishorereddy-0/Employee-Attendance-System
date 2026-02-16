import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchEmployeeDashboard = createAsyncThunk('dashboard/employee', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/dashboard/employee');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
  }
});

export const fetchManagerDashboard = createAsyncThunk('dashboard/manager', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/dashboard/manager');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    employeeData: null,
    managerData: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeDashboard.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployeeDashboard.fulfilled, (state, action) => { state.loading = false; state.employeeData = action.payload; })
      .addCase(fetchEmployeeDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchManagerDashboard.pending, (state) => { state.loading = true; })
      .addCase(fetchManagerDashboard.fulfilled, (state, action) => { state.loading = false; state.managerData = action.payload; })
      .addCase(fetchManagerDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export default dashboardSlice.reducer;
