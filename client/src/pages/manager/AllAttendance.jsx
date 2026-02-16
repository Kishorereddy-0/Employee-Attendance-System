import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAttendance } from '../../store/slices/attendanceSlice';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';

const AllAttendance = () => {
  const dispatch = useDispatch();
  const { allAttendance, pagination, loading } = useSelector((state) => state.attendance);

  const [filters, setFilters] = useState({
    date: '',
    status: '',
    employee: '',
    page: 1
  });

  useEffect(() => {
    const params = {};
    if (filters.date) params.date = filters.date;
    if (filters.status) params.status = filters.status;
    if (filters.employee) params.employee = filters.employee;
    params.page = filters.page;
    dispatch(fetchAllAttendance(params));
  }, [dispatch, filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Employees Attendance</h1>
        <p className="text-gray-500 mt-1">View and filter team attendance records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <HiOutlineFilter className="text-gray-400" size={18} />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => {
                const nextStatus = e.target.value;
                setFilters({
                  ...filters,
                  status: nextStatus,
                  // "All Status" should show all records, not only today's date.
                  date: nextStatus === '' ? '' : filters.date,
                  page: 1
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Search Employee</label>
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={filters.employee}
                onChange={(e) => setFilters({ ...filters, employee: e.target.value, page: 1 })}
                placeholder="Search by name..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <Loader /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Emp ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allAttendance?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">No records found</td>
                    </tr>
                  ) : (
                    allAttendance?.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 font-semibold text-xs">
                                {record.userId?.name?.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{record.userId?.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{record.userId?.employeeId}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{record.userId?.department}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{record.date}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{record.totalHours ? `${record.totalHours.toFixed(1)}h` : '--'}</td>
                        <td className="py-3 px-4"><StatusBadge status={record.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.total > pagination.limit && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllAttendance;
