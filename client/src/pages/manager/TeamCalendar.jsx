import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodayAllStatus } from '../../store/slices/attendanceSlice';
import Loader from '../../components/Loader';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import API from '../../services/api';
import toast from 'react-hot-toast';

const TeamCalendar = () => {
  const dispatch = useDispatch();
  const { todayAllStatus } = useSelector((state) => state.attendance);
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    dispatch(fetchTodayAllStatus());
  }, [dispatch]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/attendance/summary?month=${month}&year=${year}`);
        setCalendarData(data.data || []);
      } catch (err) {
        toast.error('Failed to load team summary');
        setCalendarData([]);
      }
      setLoading(false);
    };
    fetchCalendarData();
  }, [month, year]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Calendar</h1>
        <p className="text-gray-500 mt-1">Monthly team attendance overview</p>
      </div>

      {/* Today's Quick Status */}
      {todayAllStatus && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{todayAllStatus.summary?.total}</p>
            <p className="text-xs text-blue-600">Total</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{todayAllStatus.summary?.present}</p>
            <p className="text-xs text-green-600">Present Today</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-700">{todayAllStatus.summary?.absent}</p>
            <p className="text-xs text-red-600">Absent Today</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-700">{todayAllStatus.summary?.late}</p>
            <p className="text-xs text-yellow-600">Late Today</p>
          </div>
        </div>
      )}

      {/* Monthly Summary Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Emp ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Present</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Late</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Half Day</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Absent</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {calendarData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">No data available</td>
                  </tr>
                ) : (
                  calendarData.map((item) => (
                    <tr key={item.employee._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-semibold text-xs">
                              {item.employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.employee.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.employee.employeeId}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.employee.department}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-medium">{item.present}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">{item.late}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">{item.halfDay}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 text-sm font-medium">{item.absent}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium text-gray-900">{item.totalHours}h</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCalendar;
