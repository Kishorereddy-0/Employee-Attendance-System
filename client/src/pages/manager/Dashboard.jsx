import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchManagerDashboard } from '../../store/slices/dashboardSlice';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import { HiOutlineUsers, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#a855f7'];

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { managerData, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchManagerDashboard());
  }, [dispatch]);

  if (loading && !managerData) return <Loader />;

  const data = managerData;

  const weeklyChartData = data?.weeklyTrend?.map(d => ({
    name: d.dayName,
    present: d.present,
    absent: d.absent
  })) || [];

  const deptChartData = data?.departmentStats?.map(d => ({
    name: d.department,
    value: d.total,
    present: d.present,
    absent: d.absent,
    total: d.total
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={data?.totalEmployees || 0} icon={HiOutlineUsers} color="blue" />
        <StatCard title="Present Today" value={data?.todayStats?.present || 0} subtitle={`of ${data?.totalEmployees || 0}`} icon={HiOutlineCheckCircle} color="green" />
        <StatCard title="Absent Today" value={data?.todayStats?.absent || 0} icon={HiOutlineXCircle} color="red" />
        <StatCard title="Late Today" value={data?.todayStats?.late || 0} icon={HiOutlineClock} color="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="present" fill="#22c55e" name="Present" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department-wise */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Attendance (Today)</h3>
          {deptChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={deptChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, present, total }) => `${name}: ${present}/${total}`}
                >
                  {deptChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, _, payload) => {
                  const row = payload?.payload;
                  if (!row) return value;
                  return [`${row.present} present / ${row.total} total`, row.name];
                }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400">No data available</div>
          )}
        </div>
      </div>

      {/* Absent Employees */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Absent Employees Today</h3>
        {data?.absentEmployees?.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">All employees are present today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.absentEmployees?.map((emp) => (
              <div key={emp._id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-700 font-semibold text-xs">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.employeeId} | {emp.department}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
