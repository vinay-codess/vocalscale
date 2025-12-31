import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Building, Loader2, UserPlus } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { user, isConfigured } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    businessType: 'Restaurant'
  });
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (user && isRedirecting) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isRedirecting, navigate]);

  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return { score: 0, color: 'bg-gray-200' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { score, color: 'bg-red-500' };
    if (score === 2) return { score, color: 'bg-orange-400' };
    if (score === 3) return { score, color: 'bg-yellow-400' };
    return { score, color: 'bg-green-500' };
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured || !supabase) { setError('Service unavailable.'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: { data: { full_name: formData.fullName } },
      });
      if (authError) throw authError;
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ contact_phone: formData.phone, business_type: formData.businessType })
          .eq('id', data.user.id);
        if (profileError) console.error(profileError);
        if (data.session) {
          setIsRedirecting(true);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* 
        Card with max-h-[90vh] ensures it never goes outside the screen. 
        overflow-y-auto handles scrolling on small phones.
      */}
      <div className="bg-white/90 backdrop-blur-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white rounded-[2rem] w-full max-w-[440px] p-8 md:p-10 flex flex-col items-center text-center transition-colors duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Icon */}
        <div className="mb-6 bg-sky-50 p-3 rounded-2xl shadow-sm border border-sky-100">
          <UserPlus className="text-[#0ea5e9] w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-3">Create account</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-xs">
          Start your Vocal Scale journey today. For free.
        </p>

        {error && (
          <div className="mb-6 w-full p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form className="w-full space-y-4" onSubmit={handleSignup}>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="text-slate-400 w-5 h-5" />
            </div>
            <input 
              type="text" name="fullName" value={formData.fullName} onChange={handleChange}
              placeholder="Full Name" required disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="text-slate-400 w-5 h-5" />
            </div>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="Email" required disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 transition-all duration-200 shadow-sm"
            />
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-slate-400 w-5 h-5" />
            </div>
            <input 
              type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="Password" required disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
             <div className={`h-full ${passwordStrength.color} transition-all duration-300`} style={{ width: `${passwordStrength.score * 25}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="text-slate-400 w-4.5 h-4.5" />
              </div>
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="Phone" disabled={loading}
                className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 transition-all duration-200 shadow-sm"
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="text-slate-400 w-4.5 h-4.5" />
              </div>
              <select 
                name="businessType" value={formData.businessType} onChange={handleChange}
                disabled={loading}
                className="w-full pl-10 pr-8 py-3 bg-white border border-slate-200 focus:border-sky-400 focus:bg-white focus:ring-0 rounded-xl text-sm text-slate-700 appearance-none cursor-pointer transition-all duration-200 shadow-sm"
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Medical">Medical</option>
                <option value="Legal">Legal</option>
                <option value="Salon">Salon</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium py-3 rounded-xl shadow-lg shadow-sky-200 transition-all duration-200 transform active:scale-[0.98] mt-2 flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Get Started'}
          </button>
        </form>

        <div className="w-full flex items-center justify-between my-8">
          <div className="h-px bg-slate-200 w-full opacity-70 border-t border-dashed"></div>
          <span className="px-3 text-xs text-slate-400 whitespace-nowrap">Or sign up with</span>
          <div className="h-px bg-slate-200 w-full opacity-70 border-t border-dashed"></div>
        </div>

        <div className="flex gap-4 w-full">
          <button className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 flex items-center justify-center transition-colors shadow-sm">
             <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWrXZN0ZqF-MDIXgvHF2xR2kyXRNEgBdPsHMf6itoREYSKDNshI7Tq_gyFtmdPjIye3krTqBOAwE81OcpHKJkS71Bn7Mw4Xj3-LAccEJfTW7626SrH_41M3YkXFQgFvZ15yhW7fdn1VnVG8GtkElYfnjZGjVb8EZY5viH_cqDGa8t4nI3Xv0Z_EMlZLJ5TpRdY_okFi6qk_PeiFIsuZcqnfRlxhVe0xcLPbHyh3rWCvxOmIH0p_5rcaRkKBEvlDzvjCkf1MWr0xBg"/>
          </button>
          <button className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 flex items-center justify-center transition-colors shadow-sm">
             <img alt="Facebook" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLtun_xQRZXgPtQRToZZ6iaDmhSt8K7WK_fmhYJ3Q8A0OEzl153kM7mjRSKFegXoY-zMLXzCDpw5X5K_HnsbuFVkx4BqgLaMX3LH66-Lt7Wcqq8P2n269RUXxYHdFWdmJbm0CRo7-zzcwn2vrEsXZ7vWAivNTYKVdU9jRvOmzdQDiIUkQXZ5a7Q-fr1Zqow1zGs4uvqEzUtvTFop9K6yuvhFNi2FZQJNbukESBURttYyopL12rqnMekiQ2NVya5VhaUBTjcHjMpHU"/>
          </button>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0ea5e9] font-semibold hover:text-[#0284c7]">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;