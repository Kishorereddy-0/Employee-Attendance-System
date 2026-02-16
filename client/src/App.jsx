import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import MarkAttendance from './pages/employee/MarkAttendance';
import AttendanceHistory from './pages/employee/AttendanceHistory';
import Profile from './pages/employee/Profile';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import AllAttendance from './pages/manager/AllAttendance';
import TeamCalendar from './pages/manager/TeamCalendar';
import Reports from './pages/manager/Reports';
import TeamStats from './pages/manager/TeamStats';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} /> : <Register />} />

      {/* Employee Routes */}
      <Route path="/employee" element={<PrivateRoute roles={['employee']}><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="attendance" element={<MarkAttendance />} />
        <Route path="history" element={<AttendanceHistory />} />
        <Route path="profile" element={<Profile />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      {/* Manager Routes */}
      <Route path="/manager" element={<PrivateRoute roles={['manager']}><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="attendance" element={<AllAttendance />} />
        <Route path="calendar" element={<TeamCalendar />} />
        <Route path="reports" element={<Reports />} />
        <Route path="stats" element={<TeamStats />} />
        <Route index element={<Navigate to="dashboard" />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={
        user
          ? <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} />
          : <Navigate to="/login" />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
