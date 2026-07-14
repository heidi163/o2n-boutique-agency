import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle2, Circle, Clock, Calendar as CalendarIcon, User, Flag, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newSubTask, setNewSubTask] = useState('');

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => api.get(`/tasks/${id}`).then(res => res.data),
    enabled: !!id,
  });

  const toggleSubTaskMutation = useMutation({
    mutationFn: (data: { id: number, isCompleted: boolean }) => api.put(`/subtasks/${data.id}`, { isCompleted: data.isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    }
  });

  const createSubTaskMutation = useMutation({
    mutationFn: (data: { taskId: number, title: string, order: number }) => api.post('/subtasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setNewSubTask('');
    }
  });

  if (isLoading) return <div className="animate-pulse">Loading task...</div>;
  if (!task) return <div>Task not found</div>;

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTask.trim()) return;
    createSubTaskMutation.mutate({ taskId: parseInt(id!), title: newSubTask, order: task.subTasks?.length || 0 });
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'bg-[#E8756A]/10 text-[#E8756A] border-[#E8756A]/20';
      case 'HIGH': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
      case 'LOW': return 'bg-[#4CAF7D]/10 text-[#4CAF7D] border-[#4CAF7D]/20';
      default: return 'bg-[#E8E2D9] text-[#6B6B6B] border-[#C8BFB0]';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#154A37] font-normal mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Tasks
      </button>

      <div className="bg-white rounded-[2.5rem] p-10 border border-[#E8E2D9] shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8F2EE] rounded-bl-full -z-0 opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-4 py-1.5 rounded-full text-xs font-normal tracking-wide border ${getPriorityColor(task.priority)}`}>
              <Flag className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />
              {task.priority}
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-normal tracking-wide bg-[#F5F1EA] text-[#6B6B6B] border border-[#E8E2D9]">
              {task.status.replace('_', ' ')}
            </span>
          </div>

          <h1 className="text-lg tracking-tight tracking-tight font-normal  text-[#154A37] mb-4 leading-tight">{task.title}</h1>
          
          {task.project && (
            <div className="text-[#6B6B6B] font-normal text-lg mb-8">
              Project: <span className="text-[#1A1A1A] underline decoration-[#E8E2D9] underline-offset-4">{task.project.name}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-[#E8E2D9] mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FDFBF7] border border-[#E8E2D9] flex items-center justify-center text-[#6B6B6B]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-normal text-[#A8A8A8] mb-1">Assignee</p>
                <p className="font-normal text-[#1A1A1A]">{task.assignee?.name || 'Unassigned'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] flex items-center justify-center text-[#F59E0B]">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-normal text-[#A8A8A8] mb-1">Due Date</p>
                <p className="font-normal text-[#1A1A1A]">{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F2EE] border border-[#C2E0D4] flex items-center justify-center text-[#154A37]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-normal text-[#A8A8A8] mb-1">Estimated</p>
                <p className="font-normal text-[#1A1A1A]">{task.estimatedHours ? `${task.estimatedHours} hours` : 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-xl font-normal  mb-4 text-[#1A1A1A]">Description</h3>
            <div className="prose prose-p:text-[#6B6B6B] prose-p:leading-relaxed max-w-none">
              <p>{task.description || 'No description provided for this task.'}</p>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-normal  mb-6 text-[#1A1A1A] flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#154A37]" /> Checklist
            </h3>
            <div className="bg-[#FDFBF7] rounded-[2rem] border border-[#E8E2D9] p-6 space-y-2">
              {task.subTasks?.map((st: any) => (
                <div key={st.id} className="flex items-center gap-4 p-3 hover:bg-white rounded-xl transition-colors group">
                  <button
                    onClick={() => toggleSubTaskMutation.mutate({ id: st.id, isCompleted: !st.isCompleted })}
                    className={`shrink-0 transition-colors ${st.isCompleted ? 'text-[#4CAF7D]' : 'text-[#A8A8A8] group-hover:text-[#6B6B6B]'}`}
                  >
                    {st.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <span className={`text-[15px] font-normal transition-all ${st.isCompleted ? 'text-[#A8A8A8] line-through' : 'text-[#1A1A1A]'}`}>
                    {st.title}
                  </span>
                </div>
              ))}
              
              <form onSubmit={handleAddSubTask} className="flex gap-3 pt-4 border-t border-[#E8E2D9] mt-4">
                <input 
                  type="text"
                  value={newSubTask}
                  onChange={e => setNewSubTask(e.target.value)}
                  placeholder="Add a new checklist item..."
                  className="flex-1 bg-white border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#154A37] focus:border-transparent transition-all"
                />
                <button type="submit" disabled={createSubTaskMutation.isPending || !newSubTask.trim()} className="px-6 py-3 bg-[#154A37] hover:bg-[#1E6B50] text-white rounded-xl font-normal text-sm transition-colors disabled:opacity-50">
                  Add Item
                </button>
              </form>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-normal  mb-6 text-[#1A1A1A] flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#154A37]" /> Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="text-sm text-[#6B6B6B] italic p-4 bg-[#F5F1EA] rounded-2xl border border-[#E8E2D9]">
                Task created on {format(new Date(task.createdAt), 'MMMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
