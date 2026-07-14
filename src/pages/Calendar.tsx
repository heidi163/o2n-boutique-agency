import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks-calendar'],
    queryFn: () => api.get('/tasks').then(res => res.data),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-medium text-[#154A37] font-display">
            {format(currentMonth, 'MMMM yyyy')}
          </h1>
          <p className="text-[#6B6B6B] mt-1">Manage your project deadlines and schedules.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-3 bg-white border border-[#E8E2D9] rounded-full hover:bg-gray-50 text-[#154A37] transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-6 py-2 bg-[#F5F1EA] text-[#154A37] rounded-full font-medium text-sm hover:bg-[#E8E2D9] transition-colors">
            Today
          </button>
          <button onClick={nextMonth} className="p-3 bg-white border border-[#E8E2D9] rounded-full hover:bg-gray-50 text-[#154A37] transition-colors shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEEE";
    const days = [];
    let startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Monday start

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-[#6B6B6B] text-xs uppercase tracking-widest py-4 bg-[#FDFBF7] border-b border-[#E8E2D9]">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const getPriorityColor = (priority: string) => {
      switch(priority) {
        case 'URGENT': return 'bg-[#E8756A] text-white';
        case 'HIGH': return 'bg-[#F59E0B] text-white';
        case 'LOW': return 'bg-[#4CAF7D] text-white';
        default: return 'bg-[#154A37] text-white';
      }
    };

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;

        // Find tasks for this day
        const dayTasks = tasks.filter((t: any) => t.dueDate && isSameDay(new Date(t.dueDate), cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] p-2 border-r border-b border-[#E8E2D9] transition-colors ${!isSameMonth(day, monthStart) ? 'bg-[#FDFBF7]/50 text-[#A8A8A8]' : isSameDay(day, new Date()) ? 'bg-[#E8F2EE]/30' : 'bg-white hover:bg-[#FDFBF7]'}`}
          >
            <div className={`flex justify-end mb-1`}>
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${isSameDay(day, new Date()) ? 'bg-[#154A37] text-white font-medium' : 'font-medium'}`}>
                {formattedDate}
              </span>
            </div>
            <div className="space-y-1">
              {dayTasks.slice(0, 3).map((task: any) => (
                <div key={task.id} className={`px-2 py-1 rounded text-xs truncate cursor-pointer shadow-sm ${getPriorityColor(task.priority)}`}>
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-xs text-[#6B6B6B] px-1 font-normal">+{dayTasks.length - 3} more</div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="flex flex-col border-l border-t border-[#E8E2D9] rounded-b-[2rem] overflow-hidden">{rows}</div>;
  };

  if (isLoading) return <div className="animate-pulse">Loading calendar...</div>;

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
      {renderHeader()}
      <div className="bg-white rounded-[2rem] shadow-sm border border-[#E8E2D9] overflow-hidden">
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
}
