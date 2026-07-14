import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Search, Plus, Calendar, LayoutGrid, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function Projects() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', clientId: '', status: 'PLANNING' });
  
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', search],
    queryFn: () => api.get(`/projects?search=${search}`).then(res => res.data),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then(res => res.data),
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => api.post('/projects', { ...data, clientId: parseInt(data.clientId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', clientId: '', status: 'PLANNING' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate(formData);
  };

  const statusColors: Record<string, string> = {
    'PLANNING': 'bg-[#E8E2D9] text-[#6B6B6B]',
    'ACTIVE': 'bg-[#4CAF7D]/10 text-[#4CAF7D]',
    'ON_HOLD': 'bg-[#F59E0B]/10 text-[#F59E0B]',
    'COMPLETED': 'bg-[#154A37] text-white',
    'CANCELLED': 'bg-[#E8756A]/10 text-[#E8756A]',
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-xl tracking-tight tracking-tight font-normal text-[#154A37] leading-tight mb-2 ">Projects</h1>
          <p className="text-[#6B6B6B]">Manage ongoing projects and track their progress.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-full px-6 bg-[#154A37] hover:bg-[#1E6B50] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-between mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A8]" />
          <Input 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-white border-[#E8E2D9] focus-visible:ring-[#154A37]"
          />
        </div>
        <div className="flex bg-white rounded-full p-1 border border-[#E8E2D9]">
          <button 
            onClick={() => setView('grid')}
            className={`p-2 rounded-full transition-colors ${view === 'grid' ? 'bg-[#F5F1EA] text-[#154A37]' : 'text-[#A8A8A8] hover:text-[#6B6B6B]'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('list')}
            className={`p-2 rounded-full transition-colors ${view === 'list' ? 'bg-[#F5F1EA] text-[#154A37]' : 'text-[#A8A8A8] hover:text-[#6B6B6B]'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="text-center text-[#6B6B6B]">Loading projects...</div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-12 text-[#6B6B6B] bg-white rounded-[2.5rem] border border-[#E8E2D9]">
            No projects found.
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project: any) => (
              <div key={project.id} className="bg-white rounded-[2rem] p-6 border border-[#E8E2D9] hover:border-[#C8BFB0] transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-normal ${statusColors[project.status]}`}>
                    {project.status.replace('_', ' ')}
                  </div>
                </div>
                <h3 className="text-xl font-normal text-[#1A1A1A] mb-1 group-hover:text-[#154A37] transition-colors">{project.name}</h3>
                <p className="text-[#6B6B6B] text-sm mb-6">{project.client?.name}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-normal text-[#6B6B6B]">
                    <span>Progress</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F5F1EA] rounded-full overflow-hidden">
                    <div className="bg-[#154A37] h-full" style={{ width: `${project.progress || 0}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#E8E2D9]">
                  <div className="flex items-center text-xs text-[#6B6B6B] font-normal">
                    <Calendar className="w-3 h-3 mr-1" />
                    {project.dueDate ? format(new Date(project.dueDate), 'MMM d, yyyy') : 'No due date'}
                  </div>
                  <div className="flex -space-x-2">
                    {/* Placeholder for team avatars */}
                    <div className="w-8 h-8 rounded-full bg-[#E8F2EE] border-2 border-white flex items-center justify-center text-[10px] font-normal text-[#154A37]">O2</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-[#E8E2D9] overflow-hidden">
             {/* List view logic could go here, simplified for now */}
             <div className="p-8 text-center text-[#6B6B6B]">List view selected.</div>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-6 border-[#E8E2D9]">
          <DialogHeader>
            <DialogTitle className=" text-lg tracking-tight text-[#154A37]">Create Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-normal text-[#1A1A1A]">Project Name</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                className="rounded-2xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-normal text-[#1A1A1A]">Client</label>
              <select 
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                required
                className="w-full rounded-2xl h-12 border border-[#E8E2D9] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#154A37]"
              >
                <option value="">Select a client...</option>
                {clients?.map((client: any) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-normal text-[#1A1A1A]">Description</label>
              <Input 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="rounded-2xl h-12"
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full">Cancel</Button>
              <Button type="submit" disabled={createProjectMutation.isPending} className="bg-[#154A37] hover:bg-[#1E6B50] rounded-full text-white">
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
