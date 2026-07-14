import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        setAuth(res.data.user, res.data.token);
      } else {
        const res = await api.post('/auth/register', { email, password, name });
        setAuth(res.data.user, res.data.token);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-sm border border-[#E8E2D9]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#154A37] rounded-xl flex items-center justify-center text-white font-medium text-2xl">O2</div>
          <span className="text-3xl font-medium tracking-tight text-[#154A37] font-display">O2N</span>
        </div>
        
        <h1 className="text-2xl font-medium text-[#1A1A1A] mb-2 font-display text-center">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-[#6B6B6B] text-center text-sm mb-8">
          {isLogin ? 'Enter your details to access your workspace.' : 'Join the boutique agency workspace.'}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-[#E8756A]/10 text-[#E8756A] text-sm rounded-2xl border border-[#E8756A]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-normal text-[#1A1A1A]">Full Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="Ahmed K." 
                className="rounded-2xl h-12"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-normal text-[#1A1A1A]">Email Address</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="ahmed@agency.com" 
              className="rounded-2xl h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-normal text-[#1A1A1A]">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••" 
              className="rounded-2xl h-12"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full rounded-full h-12 bg-[#154A37] hover:bg-[#1E6B50] text-white font-medium text-base mt-4"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm text-[#6B6B6B] hover:text-[#154A37] font-medium transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
