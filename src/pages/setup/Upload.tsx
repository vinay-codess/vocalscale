import { useState, useRef } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { UploadCloud, Link, FileAudio, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSetup } from '../../context/useSetup';

export default function Upload() {
  const navigate = useNavigate();
  const { setVoiceData, setVoiceType } = useSetup();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Expanded validation to include more types
      const validTypes = ['audio/', 'video/webm', 'video/mp4'];
      const isValid = validTypes.some(type => selectedFile.type.startsWith(type)) || 
                      selectedFile.name.endsWith('.webm') || 
                      selectedFile.name.endsWith('.m4a');

      if (isValid) {
        setFile(selectedFile);
      } else {
        alert("Please upload a valid audio file (MP3, WAV, WebM, MP4, M4A).");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      const validTypes = ['audio/', 'video/webm', 'video/mp4'];
      const isValid = validTypes.some(type => selectedFile.type.startsWith(type)) || 
                      selectedFile.name.endsWith('.webm') || 
                      selectedFile.name.endsWith('.m4a');

      if (isValid) {
        setFile(selectedFile);
      } else {
        alert("Please upload a valid audio file (MP3, WAV, WebM, MP4, M4A).");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleNext = () => {
    if (file) {
      setVoiceData(file);
      setVoiceType('upload');
      navigate('/dashboard/voice-model/processing');
    }
  };

  return (
    <DashboardLayout fullWidth>
      <div className="h-[calc(100vh-64px)] bg-gray-50/50 flex flex-col overflow-hidden">
        <div className="max-w-4xl mx-auto w-full px-6 py-6 h-full flex flex-col">
          <ProgressBar step={2} totalSteps={4} title="Upload Audio" progress={50} />

          <div className="flex-1 flex flex-col justify-center min-h-0 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div 
               className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-4 cursor-pointer hover:text-indigo-600 transition-colors w-fit"
               onClick={() => navigate('/dashboard/voice-model/method')}
             >
               <ArrowRight size={16} className="rotate-180" /> Back
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm shadow-slate-100/50 max-h-full overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <UploadCloud size={24} />
                  </div>
                  <div>
                      <h1 className="text-2xl font-bold text-slate-900">Upload Voice Samples</h1>
                      <p className="text-sm text-slate-500">
                          To create a realistic clone, we need at least <span className="text-indigo-600 font-bold">2 minutes</span> of high-quality audio.
                      </p>
                  </div>
              </div>

              {/* Dropzone */}
              <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer mb-8 group relative"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*,.webm,.wav,.mp3,.m4a"
                  className="hidden"
                />
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all duration-300">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Drag audio files here</h3>
                <p className="text-slate-500 text-sm mb-6">or click to browse from your computer</p>
                
                <div className="flex justify-center gap-3">
                    {['MP3', 'WAV', 'M4A'].map(ext => (
                        <span key={ext} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500">{ext}</span>
                    ))}
                </div>
              </div>

              {/* URL Import */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2">Or Import from URL</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="flex gap-3 mb-10">
                <div className="relative flex-1">
                  <Link className="absolute left-4 top-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Paste a public link (e.g. Google Drive, Dropbox)..." 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                  />
                </div>
                <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 text-sm transition-all shadow-sm">
                  Import
                </button>
              </div>

              {/* Upload Queue */}
              {file && (
                  <div className="mb-8 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-slate-900 text-sm">Upload Queue</h3>
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full">1 File Selected</span>
                      </div>
                      <div className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                  <FileAudio size={20} />
                              </div>
                              <div>
                                  <p className="font-bold text-slate-900 text-sm">{file.name}</p>
                                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                  <CheckCircle2 size={12} /> Ready
                              </span>
                              <button 
                                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                              >
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button 
                   onClick={handleNext}
                   disabled={!file}
                   className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 shadow-lg text-base transition-all ${
                     file 
                       ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1' 
                       : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                   }`}
                 >
                   Next Step <ArrowRight size={18} />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

