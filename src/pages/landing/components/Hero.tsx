import { ArrowRight, Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 overflow-hidden relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white"></div>
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl"></div>
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-purple-200/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Content */}
        <div className="text-center max-w-5xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-full mb-8 shadow-sm">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            <span className="text-sm text-indigo-700">Now serving 1000+ businesses worldwide</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl md:text-8xl text-slate-900 mb-8 leading-[1.1] tracking-tight">
            Scale Your Business
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              With Vocal Scale
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Never miss a call again. Our AI receptionist handles customer inquiries 24/7, 
            schedules appointments, and delivers insights—all while you focus on growth.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all hover:shadow-2xl hover:shadow-indigo-600/30 hover:scale-105 flex items-center justify-center gap-2 group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-slate-300 hover:bg-white text-slate-900 rounded-xl transition-all hover:shadow-xl flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              View Demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 1.414l4 4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 1.414l4 4z" clipRule="evenodd" />
              </svg>
              <span>Setup in 5 minutes</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/50 shadow-2xl shadow-slate-900/10 bg-white/50 backdrop-blur-sm p-3">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-1">
              <img 
                src="dashboard.png"
                alt="Dashboard Preview"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
