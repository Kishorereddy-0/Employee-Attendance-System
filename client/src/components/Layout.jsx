import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import useTheme from '../hooks/useTheme';

const Layout = () => {
  const { isDark, setIsDark } = useTheme();

  return (
    <div className={`flex h-screen transition-colors ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <Sidebar />
      <main className={`flex-1 overflow-y-auto transition-colors ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <ThemeToggle
          isDark={isDark}
          onToggle={() => setIsDark((prev) => !prev)}
          className="fixed top-4 right-4 z-50"
        />
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
