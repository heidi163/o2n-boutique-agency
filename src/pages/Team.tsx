import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Search, Plus, Calendar, Clock, TrendingUp, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Team() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(res => res.data), // Need to create this endpoint
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AVAILABLE': return 'bg-[#4CAF7D]';
      case 'BUSY': return 'bg-[#F59E0B]';
      case 'ON_LEAVE': return 'bg-[#E8756A]';
      default: return 'bg-[#A8A8A8]';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-xl tracking-tight tracking-tight font-normal text-[#154A37] leading-tight mb-2 ">Team</h1>
          <p className="text-[#6B6B6B]">Manage your agency team, availability, and performance.</p>
        </div>
        <div className="flex gap-4">
          <Button className="rounded-full px-6 bg-[#154A37] hover:bg-[#1E6B50] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[2rem] p-6 border border-[#E8E2D9]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#E8F2EE] text-[#154A37] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl tracking-tight font-normal text-[#1A1A1A] ">24</div>
              <div className="text-sm text-[#6B6B6B] font-normal">Total Members</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-[2rem] p-6 border border-[#E8E2D9]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF3E0] text-[#F59E0B] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl tracking-tight font-normal text-[#1A1A1A] ">85%</div>
              <div className="text-sm text-[#6B6B6B] font-normal">Avg. Utilization</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-[#E8E2D9]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#FDFBF7] border border-[#E8E2D9] text-[#154A37] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl tracking-tight font-normal text-[#1A1A1A] ">120h</div>
              <div className="text-sm text-[#6B6B6B] font-normal">Logged This Week</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#E8E2D9] p-8 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A8]" />
            <Input 
              placeholder="Search team members..." 
              className="pl-10 rounded-full bg-[#F5F1EA] border-transparent focus-visible:ring-[#154A37]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-[#6B6B6B]">Loading team...</div>
          ) : users?.map((user: any) => (
            <div key={user.id} className="group bg-[#FDFBF7] rounded-[2rem] p-6 border border-[#E8E2D9] hover:border-[#C8BFB0] transition-colors flex items-start gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-[#E8F2EE] text-[#154A37] flex items-center justify-center text-xl font-normal ">
                  {user.name.charAt(0)}
                </div>
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#FDFBF7] ${getStatusColor(user.status)}`}></div>
              </div>
              <div className="flex-1">
                <h3 className="font-normal text-lg text-[#1A1A1A] mb-1">{user.name}</h3>
                <p className="text-sm text-[#6B6B6B] mb-4">{user.jobTitle || 'Team Member'}</p>
                <div className="flex items-center gap-2 text-sm text-[#1A1A1A] font-normal">
                  <Calendar className="w-4 h-4 text-[#A8A8A8]" />
                  <span>{user.status === 'AVAILABLE' ? 'Available' : user.status === 'BUSY' ? 'Busy' : 'On Leave'}</span>
                </div>
              </div>
            </div>
          ))}
          {(!users || users.length === 0) && !isLoading && (
            <div className="col-span-full text-center py-8 text-[#6B6B6B]">No team members found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
