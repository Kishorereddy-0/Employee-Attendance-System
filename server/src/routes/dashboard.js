const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getEmployeeDashboard, getManagerDashboard } = require('../controllers/dashboardController');

router.get('/employee', protect, getEmployeeDashboard);
router.get('/manager', protect, authorize('manager'), getManagerDashboard);

module.exports = router;
