import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyHistory, fetchMySummary } from '../../store/slices/attendanceSlice';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const AttendanceHistory = () => {
  const dispatch = useDispatch();
  const { history, summary, loading } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    dispatch(fetchMyHistory({ month, year }));
    dispatch(fetchMySummary({ month, year }));
  }, [dispatch, month, year]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // Build calendar
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const calendarDays = [];

  // Empty slots for first week
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = history?.find(r => r.date === dateStr);
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFuture = new Date(year, month - 1, d) > now;

    calendarDays.push({
      day: d,
      date: dateStr,
      record,
      isWeekend,
      isFuture,
      status: isFuture ? '' : isWeekend ? 'weekend' : record ? record.status : 'absent'
    });
  }

  const selectedRecord = selectedDate ? history?.find(r => r.date === selectedDate) : null;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
        <p className="text-gray-500 mt-1">View your attendance calendar and records</p>
      </div>

      {/* Monthly Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{summary.present}</p>
            <p className="text-xs text-green-600">Present</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-700">{summary.absent}</p>
            <p className="text-xs text-red-600">Absent</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-700">{summary.late}</p>
            <p className="text-xs text-yellow-600">Late</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-700">{summary.halfDay}</p>
            <p className="text-xs text-orange-600">Half Day</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{summary.totalHours}h</p>
            <p className="text-xs text-blue-600">Total Hours</p>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <HiOutlineChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">{monthNames[month - 1]} {year}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <HiOutlineChevronRight size={20} />
          </button>
        </div>

        {loading ? <Loader /> : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, i) => {
                if (!cell) return <div key={`empty-${i}`} />;

                const statusColors = {
                  present: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
                  absent: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
                  late: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
                  'half-day': 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
                  weekend: 'bg-gray-50 text-gray-400 border-gray-100',
                  '': 'bg-white text-gray-300 border-gray-100'
                };

                return (
                  <button
                    key={cell.date}
                    onClick={() => !cell.isWeekend && !cell.isFuture && setSelectedDate(cell.date)}
                    className={`p-2 text-center rounded-lg border text-sm transition ${statusColors[cell.status]} ${
                      selectedDate === cell.date ? 'ring-2 ring-primary-500' : ''
                    } ${cell.isWeekend || cell.isFuture ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className="font-medium">{cell.day}</span>
                    {cell.status && !cell.isWeekend && !cell.isFuture && (
                      <p className="text-[10px] capitalize mt-0.5">{cell.status}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Color Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-400" /><span className="text-xs text-gray-500">Present</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-400" /><span className="text-xs text-gray-500">Absent</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-yellow-400" /><span className="text-xs text-gray-500">Late</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-400" /><span className="text-xs text-gray-500">Half Day</span></div>
        </div>
      </div>

      {/* Day Detail */}
      {selectedDate && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          {selectedRecord ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <StatusBadge status={selectedRecord.status} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Check In</p>
                  <p className="font-medium">{selectedRecord.checkInTime ? new Date(selectedRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check Out</p>
                  <p className="font-medium">{selectedRecord.checkOutTime ? new Date(selectedRecord.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="font-medium">{selectedRecord.totalHours ? `${selectedRecord.totalHours.toFixed(1)}h` : '--'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No attendance record for this date.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
