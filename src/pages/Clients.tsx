import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function Clients() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', notes: '' });
  
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => api.get(`/clients?search=${search}`).then(res => res.data),
  });

  const createClientMutation = useMutation({
    mutationFn: (data: any) => api.post('/clients', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', company: '', notes: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-5xl font-bold text-[#154A37] leading-tight mb-2 font-display">Clients</h1>
          <p className="text-[#6B6B6B]">Manage your agency's clients and their contact information.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-full px-6 bg-[#154A37] hover:bg-[#1E6B50] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-[#E8E2D9] p-8 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A8]" />
            <Input 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-full bg-[#F5F1EA] border-transparent focus-visible:ring-[#154A37]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-[#6B6B6B]">Loading clients...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8E2D9] hover:bg-transparent">
                  <TableHead className="text-[#6B6B6B] font-semibold">Client Name</TableHead>
                  <TableHead className="text-[#6B6B6B] font-semibold">Company</TableHead>
                  <TableHead className="text-[#6B6B6B] font-semibold">Contact</TableHead>
                  <TableHead className="text-[#6B6B6B] font-semibold">Added On</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-[#6B6B6B]">
                      No clients found.
                    </TableCell>
                  </TableRow>
                )}
                {clients?.map((client: any) => (
                  <TableRow key={client.id} className="border-[#E8E2D9] hover:bg-[#FDFBF7] cursor-pointer">
                    <TableCell className="font-semibold text-[#1A1A1A] py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E8F2EE] text-[#154A37] rounded-full flex items-center justify-center font-bold">
                          {client.name.charAt(0)}
                        </div>
                        {client.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-[#1A1A1A]">{client.company || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[#1A1A1A]">{client.email}</span>
                        <span className="text-sm text-[#6B6B6B]">{client.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#6B6B6B]">
                      {format(new Date(client.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-[#6B6B6B] rounded-full">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-6 border-[#E8E2D9]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-[#154A37]">Add New Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1A1A1A]">Name</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                className="rounded-2xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1A1A1A]">Email</label>
              <Input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                className="rounded-2xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1A1A1A]">Company</label>
              <Input 
                value={formData.company} 
                onChange={e => setFormData({...formData, company: e.target.value})} 
                className="rounded-2xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1A1A1A]">Phone</label>
              <Input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="rounded-2xl h-12"
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full">Cancel</Button>
              <Button type="submit" disabled={createClientMutation.isPending} className="bg-[#154A37] hover:bg-[#1E6B50] rounded-full text-white">
                {createClientMutation.isPending ? 'Saving...' : 'Save Client'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
