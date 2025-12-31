import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-32 px-6 bg-black relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/50 to-transparent" />
      
      <div className="max-w-2xl mx-auto text-center relative">
        <p className="text-indigo-400 text-sm font-medium mb-4 tracking-wide uppercase">
          Get Started
        </p>
        
        <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-6">
          Scale your voice today
        </h2>
        
        <p className="text-slate-400 text-lg mb-10">
          Join 2,000+ companies already using Vocal Scale.
        </p>

        <div className="flex items-center justify-center gap-6">
          <a 
            href="#" 
            className="group px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-all flex items-center gap-2"
          >
            Start Building
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          
          <a 
            href="#" 
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            Talk to Sales →
          </a>
        </div>
      </div>
    </section>
  );
}