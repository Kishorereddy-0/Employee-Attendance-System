import { useState, useEffect } from 'react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { HiOutlineDownload } from 'react-icons/hi';

const Reports = () => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await API.get('/attendance/today-status');
        setEmployees(data.data.employees.map(e => e.employee));
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '1000' });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedEmployee !== 'all') params.append('employeeId', selectedEmployee);

      const { data } = await API.get(`/attendance/all?${params.toString()}`);
      setReportData(data.data || []);
    } catch (err) {
      toast.error('Failed to fetch report data');
      setReportData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, selectedEmployee]);

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedEmployee !== 'all') params.append('employeeId', selectedEmployee);

      const response = await API.get(`/attendance/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export attendance reports</p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 text-sm"
        >
          <HiOutlineDownload size={18} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            >
              <option value="all">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {reportData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{reportData.length}</p>
            <p className="text-xs text-blue-600">Total Records</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{reportData.filter(r => r.status === 'present').length}</p>
            <p className="text-xs text-green-600">Present</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-700">{reportData.filter(r => r.status === 'late').length}</p>
            <p className="text-xs text-yellow-600">Late</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-700">{reportData.filter(r => r.status === 'half-day').length}</p>
            <p className="text-xs text-orange-600">Half Day</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{reportData.reduce((s, r) => s + (r.totalHours || 0), 0).toFixed(1)}h</p>
            <p className="text-xs text-purple-600">Total Hours</p>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <Loader /> : (
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
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">No records found for selected filters</td>
                  </tr>
                ) : (
                  reportData.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{record.userId?.name}</td>
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
        )}
      </div>
    </div>
  );
};

export default Reports;
