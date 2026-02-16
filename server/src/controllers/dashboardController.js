const Attendance = require('../models/Attendance');
const User = require('../models/User');

const getMonthRange = (month, year) => {
  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);
  const lastDay = new Date(normalizedYear, normalizedMonth, 0).getDate();
  return {
    startDate: `${normalizedYear}-${String(normalizedMonth).padStart(2, '0')}-01`,
    endDate: `${normalizedYear}-${String(normalizedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  };
};

// @desc    Get employee dashboard stats
// @route   GET /api/dashboard/employee
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const today = now.toISOString().split('T')[0];

    // Today's status
    const todayRecord = await Attendance.findOne({ userId: req.user._id, date: today });

    // This month's records
    const { startDate, endDate } = getMonthRange(month, year);
    const monthRecords = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    const present = monthRecords.filter(r => r.status === 'present').length;
    const late = monthRecords.filter(r => r.status === 'late').length;
    const halfDay = monthRecords.filter(r => r.status === 'half-day').length;
    const totalHours = parseFloat(monthRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0).toFixed(2));

    // Calculate absent days
    const passedWorkingDays = getPassedWorkingDays(year, month, now);
    const absent = Math.max(0, passedWorkingDays - monthRecords.length);

    // Last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const record = monthRecords.find(r => r.date === dateStr);
      last7Days.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        status: record ? record.status : (d.getDay() === 0 || d.getDay() === 6 ? 'weekend' : 'absent'),
        totalHours: record?.totalHours || 0
      });
    }

    res.json({
      success: true,
      data: {
        today: todayRecord || { status: 'not-checked-in', date: today },
        monthly: { present, absent, late, halfDay, totalHours, workingDays: passedWorkingDays },
        recentAttendance: last7Days
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get manager dashboard stats
// @route   GET /api/dashboard/manager
exports.getManagerDashboard = async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayRecords = await Attendance.find({ date: today }).populate('userId', 'name employeeId department');
    const presentToday = todayRecords.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'half-day').length;
    const lateToday = todayRecords.filter(r => r.status === 'late').length;
    const absentToday = totalEmployees - presentToday;

    // Absent employees today
    const presentUserIds = todayRecords.map(r => r.userId?._id?.toString());
    const absentEmployees = await User.find({
      role: 'employee',
      _id: { $nin: presentUserIds }
    }).select('name employeeId department');

    // Weekly attendance trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRecords = await Attendance.countDocuments({ date: dateStr });
      weeklyTrend.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        present: dayRecords,
        absent: totalEmployees - dayRecords
      });
    }

    // Department-wise attendance today
    const departments = await User.distinct('department', { role: 'employee' });
    const departmentStats = [];
    for (const dept of departments) {
      const deptEmployees = await User.countDocuments({ role: 'employee', department: dept });
      const deptUsers = await User.find({ role: 'employee', department: dept }).select('_id');
      const deptUserIds = deptUsers.map(u => u._id);
      const deptPresent = await Attendance.countDocuments({
        date: today,
        userId: { $in: deptUserIds }
      });
      departmentStats.push({
        department: dept,
        total: deptEmployees,
        present: deptPresent,
        absent: deptEmployees - deptPresent
      });
    }

    res.json({
      success: true,
      data: {
        totalEmployees,
        todayStats: { present: presentToday, absent: absentToday, late: lateToday },
        absentEmployees,
        weeklyTrend,
        departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function getPassedWorkingDays(year, month, today) {
  const endDay = (today.getFullYear() == year && today.getMonth() + 1 == month)
    ? today.getDate()
    : new Date(year, month, 0).getDate();

  let count = 0;
  for (let d = 1; d <= endDay; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}
