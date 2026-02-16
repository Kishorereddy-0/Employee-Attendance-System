import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const user = JSON.parse(localStorage.getItem('user') || 'null');

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/register', userData);
    localStorage.setItem('user', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/auth/login', credentials);
    localStorage.setItem('user', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/auth/me');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get user');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await API.put('/auth/profile', profileData);
    // Update localStorage
    const current = JSON.parse(localStorage.getItem('user') || '{}');
    const updated = { ...current, ...data.data };
    localStorage.setItem('user', JSON.stringify(updated));
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Login
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // GetMe
      .addCase(getMe.fulfilled, (state, action) => { state.user = { ...state.user, ...action.payload }; })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => { state.user = { ...state.user, ...action.payload }; });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
