const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to get today's date string
const getTodayDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getMonthRange = (month, year) => {
  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);
  const lastDay = new Date(normalizedYear, normalizedMonth, 0).getDate();

  return {
    startDate: `${normalizedYear}-${String(normalizedMonth).padStart(2, '0')}-01`,
    endDate: `${normalizedYear}-${String(normalizedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  };
};

// Helper to determine status based on check-in time
const getStatus = (checkInTime) => {
  const hours = new Date(checkInTime).getHours();
  const minutes = new Date(checkInTime).getMinutes();
  // Late if after 9:30 AM
  if (hours > 9 || (hours === 9 && minutes > 30)) {
    return 'late';
  }
  return 'present';
};

// ==================== EMPLOYEE ENDPOINTS ====================

// @desc    Check in
// @route   POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
  try {
    const today = getTodayDate();
    const now = new Date();

    // Check if already checked in today
    let attendance = await Attendance.findOne({ userId: req.user._id, date: today });
    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const status = getStatus(now);

    attendance = await Attendance.create({
      userId: req.user._id,
      date: today,
      checkInTime: now,
      status
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check out
// @route   POST /api/attendance/checkout
exports.checkOut = async (req, res) => {
  try {
    const today = getTodayDate();
    const now = new Date();

    const attendance = await Attendance.findOne({ userId: req.user._id, date: today });
    if (!attendance) {
      return res.status(400).json({ success: false, message: 'You have not checked in today' });
    }
    if (attendance.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    attendance.checkOutTime = now;

    // Calculate total hours
    const diffMs = now - new Date(attendance.checkInTime);
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    attendance.totalHours = totalHours;

    // If worked less than 4 hours, mark as half-day
    if (totalHours < 4 && attendance.status !== 'late') {
      attendance.status = 'half-day';
    }

    await attendance.save();
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my-history
exports.getMyHistory = async (req, res) => {
  try {
    const { month, year, page = 1, limit = 31 } = req.query;

    let query = { userId: req.user._id };

    if (month && year) {
      const { startDate, endDate } = getMonthRange(month, year);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      query.date = { $gte: `${year}-01-01`, $lte: `${year}-12-31` };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendance,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my monthly summary
// @route   GET /api/attendance/my-summary
exports.getMySummary = async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month || now.getMonth() + 1;
    const year = req.query.year || now.getFullYear();

    const { startDate, endDate } = getMonthRange(month, year);

    const records = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      present: records.filter(r => r.status === 'present').length,
      absent: 0,
      late: records.filter(r => r.status === 'late').length,
      halfDay: records.filter(r => r.status === 'half-day').length,
      totalHours: parseFloat(records.reduce((sum, r) => sum + (r.totalHours || 0), 0).toFixed(2)),
      totalDays: records.length
    };

    // Calculate working days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0 && day !== 6) workingDays++;
    }

    // Absent days = working days passed - total attendance days recorded
    const today = new Date();
    const passedWorkingDays = getPassedWorkingDays(year, month, today);
    summary.absent = Math.max(0, passedWorkingDays - summary.totalDays);
    summary.workingDays = workingDays;

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to count passed working days
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

// @desc    Get today's status
// @route   GET /api/attendance/today
exports.getTodayStatus = async (req, res) => {
  try {
    const today = getTodayDate();
    const attendance = await Attendance.findOne({ userId: req.user._id, date: today });

    res.json({
      success: true,
      data: attendance || { status: 'not-checked-in', date: today }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MANAGER ENDPOINTS ====================

// @desc    Get all employees attendance
// @route   GET /api/attendance/all
exports.getAllAttendance = async (req, res) => {
  try {
    const {
      date,
      startDate,
      endDate,
      status,
      employee,
      employeeId,
      department,
      page = 1,
      limit = 20
    } = req.query;

    let query = {};
    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    if (status) query.status = status;

    // If filtering by employee name or department, get user IDs first
    if (employee || department || employeeId) {
      let userQuery = {};
      if (employee) userQuery.name = { $regex: employee, $options: 'i' };
      if (department) userQuery.department = { $regex: department, $options: 'i' };
      if (employeeId && employeeId !== 'all') userQuery._id = employeeId;
      const users = await User.find(userQuery).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department role')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendance,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific employee attendance
// @route   GET /api/attendance/employee/:id
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { userId: req.params.id };

    if (month && year) {
      const { startDate, endDate } = getMonthRange(month, year);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    const user = await User.findById(req.params.id).select('name email employeeId department');

    res.json({ success: true, data: { user, attendance } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get team summary
// @route   GET /api/attendance/summary
exports.getTeamSummary = async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month || now.getMonth() + 1;
    const year = req.query.year || now.getFullYear();

    const { startDate, endDate } = getMonthRange(month, year);

    const employees = await User.find({ role: 'employee' }).select('name employeeId department');

    const summaryData = [];
    for (const emp of employees) {
      const records = await Attendance.find({
        userId: emp._id,
        date: { $gte: startDate, $lte: endDate }
      });

      summaryData.push({
        employee: emp,
        present: records.filter(r => r.status === 'present').length,
        late: records.filter(r => r.status === 'late').length,
        halfDay: records.filter(r => r.status === 'half-day').length,
        absent: Math.max(0, getPassedWorkingDays(year, month, now) - records.length),
        totalHours: parseFloat(records.reduce((sum, r) => sum + (r.totalHours || 0), 0).toFixed(2))
      });
    }

    res.json({ success: true, data: summaryData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export attendance to CSV
// @route   GET /api/attendance/export
exports.exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    if (employeeId && employeeId !== 'all') {
      query.userId = employeeId;
    }

    const records = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    const escapeCsv = (value) => {
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Build CSV
    let csv = 'Employee ID,Name,Email,Department,Date,Check In,Check Out,Status,Total Hours\n';
    records.forEach(r => {
      const user = r.userId;
      csv += `${escapeCsv(user?.employeeId)},${escapeCsv(user?.name)},${escapeCsv(user?.email)},${escapeCsv(user?.department)},${escapeCsv(r.date)},${escapeCsv(r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '')},${escapeCsv(r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '')},${escapeCsv(r.status)},${escapeCsv(r.totalHours)}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get today's status for all employees
// @route   GET /api/attendance/today-status
exports.getTodayAllStatus = async (req, res) => {
  try {
    const today = getTodayDate();
    const employees = await User.find({ role: 'employee' }).select('name employeeId department');
    const todayRecords = await Attendance.find({ date: today });

    const data = employees.map(emp => {
      const record = todayRecords.find(r => r.userId.toString() === emp._id.toString());
      return {
        employee: emp,
        status: record ? record.status : 'absent',
        checkInTime: record?.checkInTime || null,
        checkOutTime: record?.checkOutTime || null,
        totalHours: record?.totalHours || 0
      };
    });

    const present = data.filter(d => d.status === 'present' || d.status === 'late' || d.status === 'half-day').length;
    const absent = data.filter(d => d.status === 'absent').length;
    const late = data.filter(d => d.status === 'late').length;

    res.json({
      success: true,
      data: { employees: data, summary: { present, absent, late, total: employees.length } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
