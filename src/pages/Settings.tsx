import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-5xl font-medium text-[#154A37] leading-tight mb-2 font-display">Settings</h1>
        <p className="text-[#6B6B6B]">Manage your account preferences and system settings.</p>
      </header>

      <div className="space-y-8">
        <div className="bg-white rounded-[2rem] border border-[#E8E2D9] p-8 shadow-sm">
          <h2 className="text-2xl font-medium font-display mb-6">Profile Information</h2>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-[#154A37] border-4 border-[#E8F2EE] flex items-center justify-center text-white font-medium text-3xl shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <button className="px-4 py-2 bg-[#F5F1EA] hover:bg-[#E8E2D9] text-[#1A1A1A] rounded-full text-sm font-normal transition-colors">
                Change Avatar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Full Name</label>
              <input type="text" defaultValue={user?.name} className="w-full bg-[#FDFBF7] border border-[#E8E2D9] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#154A37] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Email Address</label>
              <input type="email" defaultValue={user?.email} disabled className="w-full bg-[#F5F1EA] border border-[#E8E2D9] rounded-xl px-4 py-3 text-[#6B6B6B] cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Job Title</label>
              <input type="text" defaultValue={user?.jobTitle} className="w-full bg-[#FDFBF7] border border-[#E8E2D9] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#154A37] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Role</label>
              <input type="text" defaultValue={user?.role} disabled className="w-full bg-[#F5F1EA] border border-[#E8E2D9] rounded-xl px-4 py-3 text-[#6B6B6B] cursor-not-allowed" />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="px-8 py-3 bg-[#154A37] hover:bg-[#1E6B50] text-white rounded-full font-medium transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-[#E8E2D9] p-8 shadow-sm">
          <h2 className="text-2xl font-medium font-display mb-6">Security</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-[#FDFBF7] border border-[#E8E2D9] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#154A37] focus:border-transparent transition-all max-w-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-[#FDFBF7] border border-[#E8E2D9] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#154A37] focus:border-transparent transition-all max-w-md" />
            </div>
            <button className="px-6 py-2 bg-[#F5F1EA] hover:bg-[#E8E2D9] text-[#1A1A1A] rounded-full text-sm font-normal transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
