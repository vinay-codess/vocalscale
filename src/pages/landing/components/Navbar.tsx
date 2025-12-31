import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center">
              <img src="/logo-icon1.2.png" alt="Vocal Scale Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Vocal Scale</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors text-[15px]">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors text-[15px]">
              How it Works
            </a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors text-[15px]">
              Pricing
            </a>
            <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors text-[15px]">
              Testimonials
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors text-[15px]">
              Sign In
            </Link>
            <Link to="/signup" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all hover:shadow-lg hover:shadow-indigo-600/30 text-[15px]">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
