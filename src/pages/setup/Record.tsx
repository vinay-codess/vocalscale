import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AudioVisualizer } from '../../components/AudioVisualizer';
import { FileText, CheckCircle2, Play, Pause, Trash2, ArrowRight, BarChart2, VolumeX, Mic, Square, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSetup } from '../../context/useSetup';

export default function Record() {
  const navigate = useNavigate();
  const { setVoiceData, setVoiceType } = useSetup();
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      // 1. Request High-Quality Audio from Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1, // Mono is usually better for voice models
          sampleRate: 48000
        } 
      });

      // 2. Set MediaRecorder Options for clearer audio
      let options = {};
      // Backend validation is strict about mime types. 
      // We should use standard types without codec parameters in the Blob constructor later.
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm', bitsPerSecond: 128000 };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4', bitsPerSecond: 128000 };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Use a simpler mimeType for the final Blob to pass backend validation
        // The backend expects: audio/wav, audio/webm, audio/mpeg, audio/mp3, audio/ogg, audio/mp4
        // 'audio/webm;codecs=opus' might be rejected if strict checking is on.
        let mimeType = 'audio/webm';
        if (mediaRecorder.mimeType && mediaRecorder.mimeType.includes('mp4')) {
             mimeType = 'audio/mp4';
        }
        
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (audioBlob) {
      setVoiceData(audioBlob);
      setVoiceType('record');
      navigate('/dashboard/voice-model/processing');
    }
  };

  return (
    <DashboardLayout fullWidth>
      <div className="h-[calc(100vh-64px)] bg-gray-50/50 flex flex-col overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-6 py-6 h-full flex flex-col">
          <ProgressBar step={2} totalSteps={4} title="Voice Sample" progress={50} />

          <div className="flex gap-6 items-stretch mt-6 flex-1 min-h-0">
            
            {/* Main Recording Area */}
            <div className="flex-1 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-center mb-4 shrink-0">
                 <div 
                   className="flex items-center gap-2 text-slate-400 text-sm font-medium cursor-pointer hover:text-indigo-600 transition-colors"
                   onClick={() => navigate('/dashboard/voice-model/method')}
                 >
                   <ArrowRight size={16} className="rotate-180" /> Back
                 </div> 
                 <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-slate-600 text-xs font-bold tracking-wide uppercase">Script 1 of 1</span>
                 </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col flex-1 min-h-0 relative overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6 shrink-0 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Business Greeting</h3>
                      <p className="text-xs text-slate-500">Read the script clearly and naturally</p>
                    </div>
                  </div>
                  {audioBlob && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 shadow-sm animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 size={14} /> RECORDED
                    </div>
                  )}
                </div>

                {/* Dynamic Script Text */}
                <div className="flex-1 flex items-center justify-center text-center px-8 mb-6">
                   <div className="text-2xl md:text-4xl text-slate-800 leading-tight font-medium">
                    "Hi, thanks for calling <span className="text-indigo-600 bg-indigo-50 px-2 rounded-lg decoration-clone box-decoration-clone">Acme Corp</span>. My name is <span className="text-indigo-600 bg-indigo-50 px-2 rounded-lg decoration-clone box-decoration-clone">Sarah</span>, and I'm an AI assistant capable of handling your booking."
                   </div>
                </div>

                {/* Recording Controls / Visualizer Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shrink-0 relative z-10">
                  
                  {!audioBlob ? (
                    // Recording State
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="relative">
                          {isRecording && (
                              <span className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping"></span>
                          )}
                          <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform active:scale-95 ${
                              isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                          >
                          {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={28} />}
                          </button>
                      </div>
                      <p className={`mt-4 text-sm font-bold tracking-wide ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                        {isRecording ? `RECORDING · ${formatTime(recordingTime)}` : 'Click Mic to Start'}
                      </p>
                    </div>
                  ) : (
                    // Playback State
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-6">
                        <button 
                            onClick={togglePlayback}
                            className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 shadow-md transition-transform active:scale-95 shrink-0"
                          >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
                        </button>

                        <div className="flex-1">
                          <AudioVisualizer isPlaying={isPlaying} />
                        </div>
                        
                        <div className="font-mono text-slate-900 font-bold text-sm bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                          {formatTime(recordingTime)}
                        </div>
                      </div>

                      <div className="h-px bg-slate-200 w-full my-4"></div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                           <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle2 size={14} /></div>
                           Good Audio Quality
                        </div>
                        
                        <button 
                          onClick={deleteRecording}
                          className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-wide group"
                        >
                          <Trash2 size={14} className="group-hover:scale-110 transition-transform" /> Delete & Retry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4 shrink-0">
                 <button 
                   onClick={handleNext}
                   disabled={!audioBlob}
                   className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 shadow-lg text-base transition-all ${
                     audioBlob 
                       ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1' 
                       : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                   }`}
                 >
                   Save & Continue <ArrowRight size={18} />
                 </button>
              </div>
            </div>

            {/* Sidebar - Tips */}
            <div className="w-80 hidden xl:block shrink-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full shadow-sm sticky top-6">
                <div className="flex items-center gap-2 mb-6">
                   <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                      <Sparkles size={16} />
                   </div>
                   <h3 className="font-bold text-slate-900">Pro Tips</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                    <div className="flex gap-3 mb-2">
                      <div className="bg-white p-1.5 rounded-lg shadow-sm text-indigo-600 group-hover:text-indigo-700 group-hover:scale-110 transition-all"><BarChart2 size={18} /></div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">Speak Naturally</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pl-10">Imagine you're having coffee with a friend. Don't sound like you're reading.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                    <div className="flex gap-3 mb-2">
                      <div className="bg-white p-1.5 rounded-lg shadow-sm text-indigo-600 group-hover:text-indigo-700 group-hover:scale-110 transition-all"><VolumeX size={18} /></div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">Quiet Room</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pl-10">Echo and background noise ruin the AI model. Find a carpeted room if possible.</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                     <p className="text-xs font-medium text-blue-700 flex gap-2">
                        <span className="text-lg">💡</span> The AI clones your <strong>tone</strong>, not just your voice. Be expressive!
                     </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
