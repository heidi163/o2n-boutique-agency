import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(res => res.data),
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(res => res.data),
  });

  if (tasksLoading || projectsLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const tasks = tasksData || [];
  const projects = projectsData || [];
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length;
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Top Header */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-medium text-[#154A37] leading-tight mb-2 font-display">Dashboard</h1>
          <p className="text-[#6B6B6B]">
            Welcome back, {user?.name?.split(' ')[0]}. You have <span className="text-[#154A37] font-normal">{tasks.filter((t: any) => t.status !== 'DONE').length} tasks</span> remaining.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 border border-[#E8E2D9] rounded-full text-sm font-medium hover:bg-white bg-transparent">Search...</button>
          <button className="p-2 bg-white border border-[#E8E2D9] rounded-full hover:bg-gray-50 text-[#154A37]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Left Stats & Projects Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
              <p className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-2 font-normal">Total Tasks</p>
              <h3 className="text-2xl font-medium text-[#154A37]">{totalTasks}</h3>
            </div>
            <div className="bg-[#154A37] p-6 rounded-3xl border border-[#154A37] shadow-sm">
              <p className="text-xs uppercase tracking-widest text-white/70 mb-2 font-normal">Completed</p>
              <h3 className="text-2xl font-medium text-white">{completionRate}%</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm">
              <p className="text-xs uppercase tracking-widest text-[#6B6B6B] mb-2 font-normal">Active Projects</p>
              <h3 className="text-2xl font-medium text-[#154A37]">{activeProjects}</h3>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-[#E8E2D9] p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium font-display">Active Projects</h2>
              <button className="text-sm font-normal text-[#154A37] underline underline-offset-4">View All</button>
            </div>
            
            <div className="space-y-4">
              {projects.length === 0 && (
                <div className="text-[#6B6B6B] text-sm py-4">No active projects found.</div>
              )}
              {projects.slice(0, 5).map((project: any) => (
                <div key={project.id} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-[#FDFBF7] transition-colors border border-transparent hover:border-[#E8E2D9]">
                  <div className="w-16 h-16 bg-[#E8F2EE] rounded-2xl flex items-center justify-center text-[#154A37] font-medium text-xl uppercase">
                    {project.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-base text-[#1A1A1A]">{project.name}</h4>
                    <p className="text-sm text-[#6B6B6B]">Client: {project.client?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-1 bg-[#4CAF7D]/10 text-[#4CAF7D] rounded-full text-xs font-medium inline-block mb-3">
                      {project.status.replace('_', ' ')}
                    </span>
                    <div className="w-32 h-1.5 bg-[#E8E2D9] rounded-full overflow-hidden">
                      <div className="bg-[#154A37] h-full" style={{ width: `${project.progress || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Activity Feed */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="bg-[#F5F1EA] rounded-[2.5rem] p-8 flex-1">
            <h2 className="text-base font-medium mb-6 font-display">Live Activity</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-[#5B8DEF]"></div>
                <div className="text-sm text-[#1A1A1A]">
                  <p className="font-normal">Sarah M. <span className="font-normal text-[#6B6B6B]">moved</span> "Logo Concepts" <span className="font-normal text-[#6B6B6B]">to</span> Review</p>
                  <span className="text-[10px] text-[#A8A8A8] uppercase tracking-wide">12 Minutes Ago</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-[#4CAF7D]"></div>
                <div className="text-sm text-[#1A1A1A]">
                  <p className="font-normal">David W. <span className="font-normal text-[#6B6B6B]">completed</span> "Client Discovery"</p>
                  <span className="text-[10px] text-[#A8A8A8] uppercase tracking-wide">1 Hour Ago</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-[#E8756A]"></div>
                <div className="text-sm text-[#1A1A1A]">
                  <p className="font-normal">Ahmed K. <span className="font-normal text-[#6B6B6B]">changed deadline for</span> Vogue Pitch</p>
                  <span className="text-[10px] text-[#A8A8A8] uppercase tracking-wide">3 Hours Ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
