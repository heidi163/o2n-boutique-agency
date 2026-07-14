import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { format } from 'date-fns';

export default function ActivityLog() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () => api.get('/activity-logs').then(res => res.data),
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-5xl font-bold text-[#154A37] leading-tight mb-2 font-display">Activity Log</h1>
        <p className="text-[#6B6B6B]">Track all system changes and updates in real-time.</p>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-[#E8E2D9] p-8 flex-1 overflow-auto shadow-sm">
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E8E2D9] before:to-transparent">
          {logs.map((log: any) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#154A37] text-white font-bold text-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                {log.user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#FDFBF7] p-4 rounded-3xl border border-[#E8E2D9] shadow-sm hover:border-[#C8BFB0] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#1A1A1A]">{log.user?.name || 'System'}</span>
                  <span className="text-[10px] text-[#A8A8A8] uppercase tracking-wide font-semibold">
                    {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <div className="text-sm text-[#6B6B6B]">
                  <span className="font-medium text-[#1A1A1A]">{log.action}</span> on {log.entityType.toLowerCase()} #{log.entityId}
                </div>
                {log.changes && (
                  <div className="mt-2 text-xs bg-white p-2 rounded-xl border border-[#E8E2D9] text-[#6B6B6B] overflow-x-auto">
                    <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center text-[#6B6B6B] py-10">No activity recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
