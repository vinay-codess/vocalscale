import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Mic, Upload, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Method() {
  const navigate = useNavigate();

  return (
    <DashboardLayout fullWidth>
      <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50/50">
        <div className="max-w-5xl mx-auto w-full px-6 py-6 h-full flex flex-col">
          <ProgressBar step={1} totalSteps={4} title="Method Selection" progress={25} />

          <div className="flex-1 flex flex-col justify-center min-h-0 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">How would you like to create your voice?</h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                Choose the method that works best for you. Both methods produce high-quality AI clones.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 h-[420px]">
              {/* Card 1: Record */}
              <div className="group bg-white border border-slate-200 rounded-3xl p-8 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 relative flex flex-col h-full cursor-default">
                <span className="absolute top-6 right-6 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border border-indigo-100">
                  Fastest
                </span>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                    <Mic size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Record Now</h3>
                    <p className="text-sm text-slate-500">Use your microphone</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8 flex-1 overflow-y-auto">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Includes</p>
                  {[
                    "~5 minutes to complete",
                    "Guided script reading",
                    "Best for direct quality matching"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-600 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/dashboard/voice-model/record')}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-95 text-base flex items-center justify-center gap-2"
                >
                  <Mic size={18} /> Start Recording
                </button>
              </div>

              {/* Card 2: Upload */}
              <div className="group bg-white border border-slate-200 rounded-3xl p-8 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 relative flex flex-col h-full cursor-default">
                <span className="absolute top-6 right-6 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border border-slate-200">
                  Flexible
                </span>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform duration-300">
                    <Upload size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Upload Audio</h3>
                    <p className="text-sm text-slate-500">Use existing files</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1 overflow-y-auto">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</p>
                  {[
                    "Minimum 2 minutes of speech",
                    "No background music/noise",
                    "Supports MP3, WAV, M4A"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="bg-slate-200 rounded-full p-0.5"><CheckCircle2 size={12} className="text-white" /></div>
                      <span className="text-slate-600 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/dashboard/voice-model/upload')}
                  className="w-full py-3.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all transform active:scale-95 text-base flex items-center justify-center gap-2"
                >
                  <Upload size={18} /> Upload Files
                </button>
              </div>
            </div>
            
            <div className="mt-8 text-center">
               <div 
                className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => navigate('/dashboard/settings')}
              >
                <ArrowLeft size={16} /> Back to Settings
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
