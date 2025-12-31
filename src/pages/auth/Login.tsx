import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isConfigured } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (user && isRedirecting) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, isRedirecting, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured || !supabase) {
      setError('Service unavailable.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) throw signInError;

      if (data.session) {
        setIsRedirecting(true);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white/90 backdrop-blur-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white rounded-[2rem] w-full max-w-[440px] p-8 md:p-10 flex flex-col items-center text-center transition-colors duration-300">

        {/* Icon */}
        <div className="mb-6 bg-sky-50 p-3 rounded-2xl shadow-sm border border-sky-100">
          <LogIn className="text-[#0ea5e9] w-8 h-8" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Sign in to your Voice Agent
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-xs">
          Manage calls, phone numbers, and AI voice agents for your business.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-6 w-full p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="w-full space-y-4" onSubmit={handleLogin}>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="text-slate-400 w-5 h-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Business email"
              required
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 shadow-sm"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-slate-400 w-5 h-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 shadow-sm"
            />
          </div>

          {/* Forgot password */}
          <div className="flex justify-end w-full pt-1">
            <a
              href="#"
              className="text-xs font-medium text-slate-500 hover:text-[#0ea5e9]"
            >
              Forgot your password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium py-3 rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-[0.98] flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center justify-between my-8">
          <div className="h-px bg-slate-200 w-full opacity-70 border-t border-dashed"></div>
          <span className="px-3 text-xs text-slate-400 whitespace-nowrap">
            Or continue with
          </span>
          <div className="h-px bg-slate-200 w-full opacity-70 border-t border-dashed"></div>
        </div>

        {/* Social login (optional) */}
        <div className="flex gap-4 w-full">
          <button className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 flex items-center justify-center shadow-sm">
            <img
              alt="Google"
              className="w-5 h-5"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWrXZN0ZqF-MDIXgvHF2xR2kyXRNEgBdPsHMf6itoREYSKDNshI7Tq_gyFtmdPjIye3krTqBOAwE81OcpHKJkS71Bn7Mw4Xj3-LAccEJfTW7626SrH_41M3YkXFQgFvZ15yhW7fdn1VnVG8GtkElYfnjZGjVb8EZY5viH_cqDGa8t4nI3Xv0Z_EMlZLJ5TpRdY_okFi6qk_PeiFIsuZcqnfRlxhVe0xcLPbHyh3rWCvxOmIH0p_5rcaRkKBEvlDzvjCkf1MWr0xBg"
            />
          </button>

          <button className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 flex items-center justify-center shadow-sm">
            <img
              alt="Facebook"
              className="w-5 h-5"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLtun_xQRZXgPtQRToZZ6iaDmhSt8K7WK_fmhYJ3Q8A0OEzl153kM7mjRSKFegXoY-zMLXzCDpw5X5K_HnsbuFVkx4BqgLaMX3LH66-Lt7Wcqq8P2n269RUXxYHdFWdmJbm0CRo7-zzcwn2vrEsXZ7vWAivNTYKVdU9jRvOmzdQDiIUkQXZ5a7Q-fr1Zqow1zGs4uvqEzUtvTFop9K6yuvhFNi2FZQJNbukESBURttYyopL12rqnMekiQ2NVya5VhaUBTjcHjMpHU"
            />
          </button>
        </div>

        {/* Signup */}
        <p className="text-center text-sm text-slate-600 mt-6">
          New to the platform?{' '}
          <Link to="/signup" className="text-[#0ea5e9] font-semibold hover:text-[#0284c7]">
            Create an account
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
};

export default Login;
