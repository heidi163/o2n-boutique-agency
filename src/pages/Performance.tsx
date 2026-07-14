import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Performance() {
  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['performance'],
    queryFn: () => api.get('/performance').then(res => res.data),
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const chartData = stats.map((s: any) => ({
    name: s.name.split(' ')[0],
    completed: s.completedTasks,
    total: s.totalTasks,
  }));

  return (
    <div className="flex flex-col h-full">
      <header className="mb-10">
        <h1 className="text-5xl font-medium text-[#154A37] leading-tight mb-2 font-display">Performance</h1>
        <p className="text-[#6B6B6B]">Analyze team productivity and task completion rates.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-[#E8E2D9] p-8 shadow-sm">
            <h2 className="text-2xl font-medium font-display mb-6">Tasks Completed by Team</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E2D9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B6B6B', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B6B6B', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#F5F1EA' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="total" fill="#E8F2EE" radius={[4, 4, 0, 0]} name="Total Tasks" />
                  <Bar dataKey="completed" fill="#154A37" radius={[4, 4, 0, 0]} name="Completed Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-medium font-display mb-4">Team Stats</h2>
          {stats.map((stat: any) => (
            <div key={stat.userId} className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm hover:border-[#C8BFB0] transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#154A37] text-white flex items-center justify-center font-medium text-lg">
                  {stat.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-[#1A1A1A]">{stat.name}</h3>
                  <p className="text-xs text-[#6B6B6B]">{stat.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-[#FDFBF7] p-3 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-[#A8A8A8] font-medium mb-1">Completion</p>
                  <p className="text-xl font-medium text-[#154A37]">{stat.completionRate}%</p>
                </div>
                <div className="bg-[#FDFBF7] p-3 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-[#A8A8A8] font-medium mb-1">Overdue</p>
                  <p className="text-xl font-medium text-[#E8756A]">{stat.overdueTasks}</p>
                </div>
                <div className="bg-[#FDFBF7] p-3 rounded-2xl col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-[#A8A8A8] font-medium mb-1">Avg Time to Complete</p>
                  <p className="text-lg font-medium text-[#1A1A1A]">{stat.avgCompletionHours} hours</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
