import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  HiOutlineHome,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineChartBar
} from 'react-icons/hi';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const employeeLinks = [
    { path: '/employee/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/employee/attendance', label: 'Mark Attendance', icon: HiOutlineClock },
    { path: '/employee/history', label: 'My History', icon: HiOutlineCalendar },
    { path: '/employee/profile', label: 'Profile', icon: HiOutlineUser }
  ];

  const managerLinks = [
    { path: '/manager/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/manager/attendance', label: 'All Attendance', icon: HiOutlineUsers },
    { path: '/manager/calendar', label: 'Team Calendar', icon: HiOutlineCalendar },
    { path: '/manager/reports', label: 'Reports', icon: HiOutlineDocumentReport },
    { path: '/manager/stats', label: 'Team Stats', icon: HiOutlineChartBar }
  ];

  const links = user?.role === 'manager' ? managerLinks : employeeLinks;
  const initials = (user?.name || '')
    .split(' ')
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src="/attendease-logo.svg" alt="AttendEase logo" className="w-10 h-10" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">AttendEase</h1>
                <p className="text-xs text-gray-500 capitalize">{user?.role} Panel</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {initials || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.employeeId}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <HiOutlineLogout size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
