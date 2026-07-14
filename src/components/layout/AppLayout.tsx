import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Users, FolderKanban, CheckSquare, Calendar as CalendarIcon, TrendingUp, Activity, Settings, LogOut, Bell } from 'lucide-react';
import { api } from '../../lib/api';
import VoiceRecorderFAB from '../VoiceRecorderFAB';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#FDFBF7] font-sans text-[#1A1A1A] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[#E8E2D9] flex flex-col p-8 bg-white">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#154A37] rounded-xl flex items-center justify-center text-white font-normal text-xl">O2</div>
          <span className="text-lg tracking-tight font-normal tracking-tight text-[#154A37] ">O2N</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-normal transition-colors ${isActive ? 'bg-[#E8F2EE] text-[#154A37]' : 'text-[#6B6B6B] hover:text-[#154A37]'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/clients" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-normal transition-colors ${isActive ? 'bg-[#E8F2EE] text-[#154A37]' : 'text-[#6B6B6B] hover:text-[#154A37]'}`}
          >
            <Users className="w-5 h-5" />
            Clients
          </NavLink>
          <NavLink 
            to="/projects" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-normal transition-colors ${isActive ? 'bg-[#E8F2EE] text-[#154A37]' : 'text-[#6B6B6B] hover:text-[#154A37]'}`}
          >
            <FolderKanban className="w-5 h-5" />
            Projects
          </NavLink>
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-normal transition-colors ${isActive ? 'bg-[#E8F2EE] text-[#154A37]' : 'text-[#6B6B6B] hover:text-[#154A37]'}`}
          >
            <CheckSquare className="w-5 h-5" />
            Tasks
          </NavLink>
          <NavLink 
            to="/team" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-normal transition-colors ${isActive ? 'bg-[#E8F2EE] text-[#154A37]' : 'text-[#6B6B6B] hover:text-[#154A37]'}`}
          >
            <Users className="w-5 h-5" />
            Team
          </NavLink>
          <NavLink 
            to="/calendar" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-normal transition-colors ${isActive ? 'bg-[#E8F2EE] text-[#154A37]' : 'text-[#6B6B6B] hover:text-[#154A37]'}`}
          >
            <CalendarIcon className="w-5 h-5" />
            Calendar
          </NavLink>
          <NavLink 
            to="/performance" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-normal transition-colors ${isActive ? 'bg-[#E8F2EE] text-[#154A37]' : 'text-[#6B6B6B] hover:text-[#154A37]'}`}
          >
            <TrendingUp className="w-5 h-5" />
            Performance
          </NavLink>
          <NavLink 
            to="/activity" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-normal transition-colors ${isActive ? 'bg-[#E8F2EE] text-[#154A37]' : 'text-[#6B6B6B] hover:text-[#154A37]'}`}
          >
            <Activity className="w-5 h-5" />
            Activity Log
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-normal transition-colors ${isActive ? 'bg-[#E8F2EE] text-[#154A37]' : 'text-[#6B6B6B] hover:text-[#154A37]'}`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
        </nav>

        <div className="mt-auto pt-4 border-t border-[#E8E2D9]">
          <div className="flex items-center gap-3 p-4 bg-[#F5F1EA] rounded-3xl mb-4">
            <div className="w-10 h-10 rounded-full bg-[#154A37] border-2 border-white shadow-sm flex items-center justify-center text-white font-normal text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-normal truncate">{user?.name}</span>
              <span className="text-xs text-[#6B6B6B] truncate">{user?.jobTitle || user?.role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-[#E8756A] hover:bg-red-50 rounded-full transition-colors text-sm font-normal"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar with Notification Bell */}
        <div className="absolute top-8 right-10 z-50">
          <button className="relative p-2 bg-white border border-[#E8E2D9] rounded-full hover:bg-gray-50 text-[#154A37] shadow-sm transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#E8756A] rounded-full border-2 border-white"></span>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-10 pt-20">
          {children}
        </div>
        
        <VoiceRecorderFAB />
      </main>
    </div>
  );
}
