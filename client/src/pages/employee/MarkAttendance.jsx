import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut, fetchTodayStatus } from '../../store/slices/attendanceSlice';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';

const MarkAttendance = () => {
  const dispatch = useDispatch();
  const { today, loading } = useSelector((state) => state.attendance);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchTodayStatus());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    const result = await dispatch(checkIn());
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Checked in successfully!');
      dispatch(fetchTodayStatus());
    } else {
      toast.error(result.payload || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    const result = await dispatch(checkOut());
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Checked out successfully!');
      dispatch(fetchTodayStatus());
    } else {
      toast.error(result.payload || 'Check-out failed');
    }
  };

  const isCheckedIn = today?.checkInTime && !today?.checkOutTime;
  const isCheckedOut = today?.checkOutTime;
  const notCheckedIn = !today?.checkInTime;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Current Time */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="mb-6">
          <HiOutlineClock className="mx-auto text-primary-600 mb-3" size={48} />
          <p className="text-4xl font-bold text-gray-900">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-gray-500 mt-1">Current Time</p>
        </div>

        {/* Status */}
        <div className="mb-6">
          <StatusBadge status={today?.status || 'not-checked-in'} />
        </div>

        {/* Check In / Out Times */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Check In</p>
            <p className="text-lg font-semibold text-gray-900">
              {today?.checkInTime
                ? new Date(today.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '--:--'}
            </p>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Check Out</p>
            <p className="text-lg font-semibold text-gray-900">
              {today?.checkOutTime
                ? new Date(today.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '--:--'}
            </p>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total Hours</p>
            <p className="text-lg font-semibold text-gray-900">
              {today?.totalHours ? `${today.totalHours.toFixed(1)}h` : '--'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {notCheckedIn && (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-all transform hover:scale-105 flex items-center gap-2 text-lg shadow-lg shadow-green-200"
            >
              <HiOutlineCheckCircle size={24} />
              Check In
            </button>
          )}
          {isCheckedIn && (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-all transform hover:scale-105 flex items-center gap-2 text-lg shadow-lg shadow-red-200"
            >
              <HiOutlineXCircle size={24} />
              Check Out
            </button>
          )}
          {isCheckedOut && (
            <div className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium flex items-center gap-2 text-lg">
              <HiOutlineCheckCircle size={24} className="text-green-500" />
              Attendance Marked for Today
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-400 mt-4">
          {notCheckedIn
            ? 'Click Check In to mark your attendance. Late after 9:30 AM.'
            : isCheckedIn
            ? 'Don\'t forget to check out before leaving!'
            : 'You\'re all done for today. See you tomorrow!'}
        </p>
      </div>
    </div>
  );
};

export default MarkAttendance;
