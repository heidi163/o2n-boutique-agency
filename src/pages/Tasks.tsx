import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal, Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-[#F5F1EA]', ring: 'ring-[#E8E2D9]' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-[#E8F2EE]', ring: 'ring-[#C2E0D4]' },
  { id: 'IN_REVIEW', title: 'Review', color: 'bg-[#FFF3E0]', ring: 'ring-[#FFE0B2]' },
  { id: 'DONE', title: 'Done', color: 'bg-[#FDFBF7]', ring: 'ring-[#154A37]' }
];

export default function Tasks() {
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  
  const queryClient = useQueryClient();

  const { data: serverTasks = [], isLoading } = useQuery({
    queryKey: ['tasks', search],
    queryFn: () => api.get(`/tasks?search=${search}`).then(res => res.data),
  });

  const { data: taskDetails } = useQuery({
    queryKey: ['task', selectedTask?.id],
    queryFn: () => api.get(`/tasks/${selectedTask.id}`).then(res => res.data),
    enabled: !!selectedTask?.id,
  });

  const [localTasks, setLocalTasks] = useState<any[]>([]);

  useEffect(() => {
    setLocalTasks(serverTasks);
  }, [serverTasks]);

  const updateTaskMutation = useMutation({
    mutationFn: (data: { id: number, status: string }) => api.put(`/tasks/${data.id}`, { status: data.status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks', search]);
      
      setLocalTasks(prev => prev.map((t: any) => t.id === id ? { ...t, status } : t));
      
      return { previousTasks };
    },
    onError: (err, variables, context: any) => {
      setLocalTasks(context.previousTasks || []);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const createSubTaskMutation = useMutation({
    mutationFn: (data: { taskId: number, title: string, order: number }) => api.post('/subtasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', selectedTask?.id] });
      setNewSubTaskTitle('');
    }
  });

  const toggleSubTaskMutation = useMutation({
    mutationFn: (data: { id: number, isCompleted: boolean }) => api.put(`/subtasks/${data.id}`, { isCompleted: data.isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', selectedTask?.id] });
    }
  });

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const draggedTaskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    const newTasks = Array.from(localTasks);
    const taskIndex = newTasks.findIndex((t: any) => t.id === draggedTaskId);
    if (taskIndex !== -1) {
      newTasks[taskIndex] = { ...(newTasks[taskIndex] as any), status: newStatus };
      setLocalTasks(newTasks);
      updateTaskMutation.mutate({ id: draggedTaskId, status: newStatus });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'bg-[#E8756A]/10 text-[#E8756A]';
      case 'HIGH': return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      case 'LOW': return 'bg-[#4CAF7D]/10 text-[#4CAF7D]';
      default: return 'bg-[#E8E2D9] text-[#6B6B6B]';
    }
  };

  const openTaskModal = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim() || !selectedTask) return;
    const order = taskDetails?.subTasks?.length || 0;
    createSubTaskMutation.mutate({ taskId: selectedTask.id, title: newSubTaskTitle, order });
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-5xl font-bold text-[#154A37] leading-tight mb-2 font-display">Tasks</h1>
          <p className="text-[#6B6B6B]">Drag and drop to manage your workflow.</p>
        </div>
        <div className="flex gap-4">
          <Button className="rounded-full px-6 bg-[#154A37] hover:bg-[#1E6B50] text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </header>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A8]" />
          <Input 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-white border-[#E8E2D9] focus-visible:ring-[#154A37]"
          />
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {COLUMNS.map((col) => {
            const columnTasks = localTasks.filter(t => t.status === col.id);
            
            return (
              <div key={col.id} className="flex-1 min-w-[320px] flex flex-col bg-[#FDFBF7] rounded-[2rem] border border-[#E8E2D9] overflow-hidden">
                <div className={`p-5 pb-3 font-display font-bold text-lg text-[#1A1A1A] flex justify-between items-center ${col.color}`}>
                  <div className="flex items-center gap-2">
                    {col.title}
                    <span className="text-sm font-sans font-medium px-2 py-0.5 rounded-full bg-white/50 text-[#6B6B6B]">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button className="text-[#6B6B6B] hover:text-[#1A1A1A]">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-4 flex flex-col gap-4 overflow-y-auto min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                    >
                      {columnTasks.map((task, index) => {
                        // @ts-ignore
                        return (
                          // @ts-ignore
                          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                            {(provided: any, snapshot: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => openTaskModal(task)}
                                className={`bg-white p-5 rounded-3xl border ${snapshot.isDragging ? `shadow-2xl ring-2 ${col.ring} border-transparent scale-[1.02] z-50` : 'border-[#E8E2D9] shadow-sm hover:border-[#C8BFB0] cursor-pointer'} transition-all`}
                                style={provided.draggableProps.style}
                              >
                                <div className="flex justify-between items-start mb-3 gap-2">
                                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </div>
                                </div>
                                <h4 className="font-bold text-[#1A1A1A] text-lg leading-tight mb-2">{task.title}</h4>
                                {task.description && (
                                  <p className="text-sm text-[#6B6B6B] line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
                                )}
                                {task.project && (
                                  <div className="mt-auto pt-4 border-t border-[#F5F1EA] flex justify-between items-center">
                                    <span className="text-xs font-semibold text-[#154A37] truncate flex-1">
                                      {task.project.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white rounded-[2rem] p-8 border-[#E8E2D9]">
          {selectedTask && (
            <>
              <DialogHeader className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-[#F5F1EA] text-[#6B6B6B]">
                    {selectedTask.status.replace('_', ' ')}
                  </div>
                </div>
                <DialogTitle className="font-display text-3xl text-[#154A37] leading-tight">
                  {selectedTask.title}
                </DialogTitle>
                {selectedTask.project && (
                  <div className="text-sm font-semibold text-[#6B6B6B] mt-2">
                    Project: <span className="text-[#1A1A1A]">{selectedTask.project.name}</span>
                  </div>
                )}
              </DialogHeader>

              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-[#1A1A1A] mb-2">Description</h4>
                  <p className="text-[#6B6B6B] leading-relaxed">
                    {selectedTask.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1A1A1A] mb-4">Subtasks</h4>
                  <div className="space-y-3 mb-4">
                    {taskDetails?.subTasks?.map((st: any) => (
                      <div key={st.id} className="flex items-start gap-3 group">
                        <button
                          onClick={() => toggleSubTaskMutation.mutate({ id: st.id, isCompleted: !st.isCompleted })}
                          className={`mt-0.5 transition-colors ${st.isCompleted ? 'text-[#154A37]' : 'text-[#A8A8A8] group-hover:text-[#6B6B6B]'}`}
                        >
                          {st.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        <span className={`text-[15px] ${st.isCompleted ? 'text-[#A8A8A8] line-through' : 'text-[#1A1A1A]'}`}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                    {(!taskDetails?.subTasks || taskDetails.subTasks.length === 0) && (
                      <div className="text-sm text-[#6B6B6B]">No subtasks added yet.</div>
                    )}
                  </div>
                  <form onSubmit={handleAddSubTask} className="flex gap-2">
                    <Input 
                      value={newSubTaskTitle}
                      onChange={e => setNewSubTaskTitle(e.target.value)}
                      placeholder="Add a new subtask..."
                      className="rounded-full bg-[#F5F1EA] border-transparent focus-visible:ring-[#154A37]"
                    />
                    <Button type="submit" disabled={createSubTaskMutation.isPending || !newSubTaskTitle.trim()} className="rounded-full bg-[#154A37] hover:bg-[#1E6B50] text-white px-6">
                      Add
                    </Button>
                  </form>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E8E2D9]">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#154A37]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1A1A1A]">Created</div>
                      <div className="text-[#6B6B6B]">{format(new Date(selectedTask.createdAt), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3E0] flex items-center justify-center text-[#F59E0B]">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1A1A1A]">Due Date</div>
                      <div className="text-[#6B6B6B]">{selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'MMM d, yyyy') : 'No due date'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
