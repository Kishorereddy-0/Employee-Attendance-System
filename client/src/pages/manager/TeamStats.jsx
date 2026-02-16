import { useEffect, useState } from 'react';
import API from '../../services/api';
import Loader from '../../components/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#f97316'];

const TeamStats = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/attendance/summary?month=${month}&year=${year}`);
        setSummaryData(data.data || []);
      } catch (err) {
        toast.error('Failed to load statistics');
        setSummaryData([]);
      }
      setLoading(false);
    };
    fetchData();
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

  // Chart data
  const barChartData = summaryData.map(d => ({
    name: d.employee.name.split(' ')[0],
    present: d.present,
    late: d.late,
    absent: d.absent,
    halfDay: d.halfDay
  }));

  const totals = summaryData.reduce((acc, d) => {
    acc.present += d.present;
    acc.late += d.late;
    acc.absent += d.absent;
    acc.halfDay += d.halfDay;
    return acc;
  }, { present: 0, late: 0, absent: 0, halfDay: 0 });

  const pieData = [
    { name: 'Present', value: totals.present },
    { name: 'Absent', value: totals.absent },
    { name: 'Late', value: totals.late },
    { name: 'Half Day', value: totals.halfDay }
  ].filter(d => d.value > 0);

  // Department aggregation
  const deptMap = {};
  summaryData.forEach(d => {
    const dept = d.employee.department;
    if (!deptMap[dept]) deptMap[dept] = { present: 0, late: 0, absent: 0, halfDay: 0, hours: 0 };
    deptMap[dept].present += d.present;
    deptMap[dept].late += d.late;
    deptMap[dept].absent += d.absent;
    deptMap[dept].halfDay += d.halfDay;
    deptMap[dept].hours += d.totalHours;
  });

  const deptData = Object.entries(deptMap).map(([dept, stats]) => ({
    name: dept,
    ...stats
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Statistics</h1>
          <p className="text-gray-500 mt-1">Detailed team attendance analytics</p>
        </div>
      </div>

      {/* Month Nav */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <HiOutlineChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 w-48 text-center">{monthNames[month - 1]} {year}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <HiOutlineChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{totals.present}</p>
              <p className="text-sm text-green-600">Total Present</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{totals.absent}</p>
              <p className="text-sm text-red-600">Total Absent</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-700">{totals.late}</p>
              <p className="text-sm text-yellow-600">Total Late</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-700">{totals.halfDay}</p>
              <p className="text-sm text-orange-600">Total Half Days</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Per Employee */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Per Employee Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#22c55e" name="Present" stackId="a" />
                  <Bar dataKey="late" fill="#eab308" name="Late" stackId="a" />
                  <Bar dataKey="halfDay" fill="#f97316" name="Half Day" stackId="a" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Overall Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department-wise Statistics</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#22c55e" name="Present" />
                <Bar dataKey="late" fill="#eab308" name="Late" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamStats;
