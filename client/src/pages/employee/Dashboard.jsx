import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeDashboard } from '../../store/slices/dashboardSlice';
import { checkIn, checkOut, fetchTodayStatus } from '../../store/slices/attendanceSlice';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineCalendar
} from 'react-icons/hi';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { employeeData, loading } = useSelector((state) => state.dashboard);
  const { today, loading: attendanceLoading } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchEmployeeDashboard());
    dispatch(fetchTodayStatus());
  }, [dispatch]);

  const handleCheckIn = async () => {
    const result = await dispatch(checkIn());
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Checked in successfully!');
      dispatch(fetchEmployeeDashboard());
    } else {
      toast.error(result.payload || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    const result = await dispatch(checkOut());
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Checked out successfully!');
      dispatch(fetchEmployeeDashboard());
    } else {
      toast.error(result.payload || 'Check-out failed');
    }
  };

  if (loading && !employeeData) return <Loader />;

  const data = employeeData;
  const todayStatus = today || data?.today;
  const isCheckedIn = todayStatus?.checkInTime && !todayStatus?.checkOutTime;
  const isCheckedOut = todayStatus?.checkOutTime;
  const notCheckedIn = !todayStatus?.checkInTime;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Quick Check In/Out */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={todayStatus?.status || 'not-checked-in'} />
              {todayStatus?.checkInTime && (
                <span className="text-sm text-gray-500">
                  In: {new Date(todayStatus.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {todayStatus?.checkOutTime && (
                <span className="text-sm text-gray-500">
                  Out: {new Date(todayStatus.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {notCheckedIn && (
              <button
                onClick={handleCheckIn}
                disabled={attendanceLoading}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2"
              >
                <HiOutlineCheckCircle size={20} />
                Check In
              </button>
            )}
            {isCheckedIn && (
              <button
                onClick={handleCheckOut}
                disabled={attendanceLoading}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition flex items-center gap-2"
              >
                <HiOutlineXCircle size={20} />
                Check Out
              </button>
            )}
            {isCheckedOut && (
              <div className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-medium flex items-center gap-2">
                <HiOutlineCheckCircle size={20} className="text-green-500" />
                Day Complete | {todayStatus?.totalHours?.toFixed(1)}h
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Present Days"
          value={data?.monthly?.present || 0}
          subtitle="This month"
          icon={HiOutlineCheckCircle}
          color="green"
        />
        <StatCard
          title="Absent Days"
          value={data?.monthly?.absent || 0}
          subtitle="This month"
          icon={HiOutlineXCircle}
          color="red"
        />
        <StatCard
          title="Late Arrivals"
          value={data?.monthly?.late || 0}
          subtitle="This month"
          icon={HiOutlineClock}
          color="yellow"
        />
        <StatCard
          title="Hours Worked"
          value={`${data?.monthly?.totalHours || 0}h`}
          subtitle="This month"
          icon={HiOutlineCalendar}
          color="blue"
        />
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days</h3>
        <div className="grid grid-cols-7 gap-2">
          {data?.recentAttendance?.map((day) => (
            <div
              key={day.date}
              className="text-center p-3 rounded-lg border border-gray-100"
            >
              <p className="text-xs text-gray-500 font-medium">{day.dayName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{day.date.split('-')[2]}</p>
              <div className="mt-2">
                <StatusBadge status={day.status} />
              </div>
              {day.totalHours > 0 && (
                <p className="text-xs text-gray-500 mt-1">{day.totalHours.toFixed(1)}h</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
