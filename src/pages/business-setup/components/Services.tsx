import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Upload, Plus, Trash2, Edit2, Sparkles, 
  FileText, Check, X, ChevronDown, ChevronUp, Loader2,
  MoreHorizontal, Wand2, Volume2
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import type { Service as GlobalService } from '../../../types/business';

// --- Styled Components to match previous pages ---

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block transition-all ${props.className || ''}`}
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block resize-none transition-all ${props.className || ''}`}
  />
);

// --- Types & Logic ---

interface Service extends Omit<GlobalService, 'price'> {
  id: string;
  priceType: 'flat' | 'hourly' | 'starting';
  amount: number;
  duration?: string;
  isExpanded?: boolean;
}

export const Services: React.FC = () => {
  const { state, actions } = useBusinessSetup();
  const [localServices, setLocalServices] = useState<Service[]>([]);
  
  // AI Interaction States
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);

  // Audio Visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Sync with Global State on Mount
  useEffect(() => {
    if (state.data.services) {
      setLocalServices(prev => {
        const incoming = state.data.services || [];
        return incoming.map(s => {
          const existing = prev.find(p => p.id === s.id);
          return {
            id: s.id || Math.random().toString(),
            name: s.name,
            amount: s.price || 0,
            priceType: existing?.priceType || 'flat',
            duration: existing?.duration,
            description: s.description,
            isExpanded: existing?.isExpanded || false
          };
        });
      });
    }
  }, [state.data.services]);

  // Sync Back to Global State
  const syncToGlobal = (services: Service[]) => {
    const globalServices: GlobalService[] = services.map(s => ({
      id: s.id,
      name: s.name,
      price: s.amount,
      description: s.description
    }));
    actions.updateServices(globalServices);
  };

  // Timer for Recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Actions ---

  const startVisualizer = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = audioContext;
          
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
          
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const update = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              setAudioLevel(average / 255); 
              
              animationFrameRef.current = requestAnimationFrame(update);
          };
          
          update();
      } catch (err) {
          console.error("Error accessing microphone:", err);
      }
  };

  const stopVisualizer = () => {
      if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
      }
      setAudioLevel(0);
  };

  const handleStartRecording = async () => {
    await startVisualizer();
    setIsRecording(true);
    setAiQuestion("Please describe your services. You can say: 'I offer a 30-minute consultation for $50...'");
  };

  const handleStopRecording = () => {
    stopVisualizer();
    setIsRecording(false);
    setIsProcessing(true);
    setAiQuestion(null);
    
    // Simulate AI Processing
    setTimeout(() => {
      const newServices: Service[] = [
        {
          id: Date.now().toString(),
          name: "AI Voice Consultation",
          amount: 150,
          priceType: 'flat',
          duration: "60 min",
          description: "Extracted from voice input",
          isExpanded: true
        }
      ];
      
      const updated = [...localServices, ...newServices];
      setLocalServices(updated);
      syncToGlobal(updated);
      setIsProcessing(false);
    }, 3000); 
  };

  const handleCancelRecording = () => {
      stopVisualizer();
      setIsRecording(false);
      setAiQuestion(null);
  };

  const toggleExpand = (id: string) => {
    setLocalServices(prev => prev.map(s => 
      s.id === id ? { ...s, isExpanded: !s.isExpanded } : s
    ));
  };

  const updateService = (id: string, field: keyof Service, value: any) => {
    const updated = localServices.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    setLocalServices(updated);
    syncToGlobal(updated);
  };

  const removeService = (id: string) => {
    const updated = localServices.filter(s => s.id !== id);
    setLocalServices(updated);
    syncToGlobal(updated);
  };

  return (
    <div className="space-y-8">
      
      {/* AI Agent / Hero Section - Dark Mode Interface */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        {/* Ambient Background Glow */}
        <div className="absolute top-[-50%] left-[-20%] w-[70%] h-[200%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-indigo-400" />
                  Voice Extraction
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">Service Setup</h2>
              <p className="text-slate-400 text-sm md:text-base max-w-xl">
                Speak naturally or upload a document. I'll structure your pricing and duration automatically.
              </p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-1 w-fit mx-auto md:mx-0 border border-slate-700">
              <button 
                onClick={() => setShowUpload(false)}
                className={`p-2 rounded-md transition-all flex items-center gap-2 ${!showUpload ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Mic size={18} />
                <span className="text-sm font-medium">Voice</span>
              </button>
              <button 
                onClick={() => setShowUpload(true)}
                className={`p-2 rounded-md transition-all flex items-center gap-2 ${showUpload ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Upload size={18} />
                <span className="text-sm font-medium">File</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[180px]">
            <AnimatePresence mode="wait">
              {!showUpload ? (
                // Voice Interface
                <m.div 
                  key="voice"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center w-full max-w-lg"
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex gap-2 items-end h-12">
                        {[...Array(5)].map((_, i) => (
                           <m.div
                            key={i}
                            animate={{ height: [10, 30, 10] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                            className="w-2 bg-indigo-400 rounded-full"
                           />
                        ))}
                      </div>
                      <div className="text-center">
                        <p className="text-indigo-300 font-medium animate-pulse mb-1">Processing Audio...</p>
                        <p className="text-xs text-slate-500">Identifying services and prices</p>
                      </div>
                    </div>
                  ) : isRecording ? (
                    <div className="flex flex-col items-center gap-6 w-full">
                      {/* Visualizer Container */}
                      <div className="relative h-32 w-full flex items-center justify-center">
                         {/* Ripple Effects */}
                         <m.div 
                           animate={{ scale: [1, 1.5 + audioLevel], opacity: [0.6, 0] }}
                           transition={{ duration: 1.5, repeat: Infinity }}
                           className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"
                         />
                         <m.div 
                           animate={{ scale: [1, 1.2 + (audioLevel * 0.5)], opacity: [0.8, 0] }}
                           transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                           className="absolute inset-0 bg-red-500/30 rounded-full blur-lg"
                         />

                        {/* Stop Button */}
                        <button 
                          onClick={handleStopRecording}
                          className="relative z-10 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-105 transition-transform border-4 border-red-900"
                        >
                          <div className="w-8 h-8 bg-white rounded-md" />
                        </button>
                        
                        {/* Cancel Button */}
                        <button
                           onClick={handleCancelRecording}
                           className="absolute top-0 right-4 z-20 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                      </div>

                      {/* Timer & Prompt */}
                      <div className="text-center space-y-3 w-full px-4">
                        <AnimatePresence>
                            {aiQuestion && (
                                <m.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-slate-800/80 backdrop-blur border border-slate-700 px-4 py-3 rounded-xl"
                                >
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        "{aiQuestion}"
                                    </p>
                                </m.div>
                            )}
                        </AnimatePresence>
                        <p className="text-3xl font-mono font-bold text-white tracking-tighter">{formatTime(recordingTime)}</p>
                        <p className="text-xs text-red-400 font-medium flex items-center gap-1 justify-center">
                           <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                           Recording...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <button 
                        onClick={handleStartRecording}
                        className="group relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all duration-300"
                      >
                         <Mic size={32} className="text-white relative z-10" />
                         <div className="absolute inset-0 rounded-full border border-white/20" />
                      </button>
                      <div className="text-center">
                        <p className="text-white font-medium">Tap to start</p>
                        <p className="text-xs text-slate-500 mt-1">High quality audio required</p>
                      </div>
                    </div>
                  )}
                </m.div>
              ) : (
                // Upload Interface
                <m.div 
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md"
                >
                  <div className="border-2 border-dashed border-slate-700 bg-slate-800/50 rounded-xl p-8 text-center hover:bg-slate-800 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-slate-600 transition-all">
                      <FileText size={24} className="text-slate-300" />
                    </div>
                    <p className="font-medium text-white mb-1">Upload Price List</p>
                    <p className="text-xs text-slate-500">PDF, JPG, PNG or DOCX</p>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Extracted Services List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
            <Wand2 className="text-indigo-600 w-5 h-5" />
            Detected Services
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {localServices.length}
            </span>
          </h3>
          <button 
            onClick={() => {
                const newService: Service = {
                    id: Date.now().toString(),
                    name: "",
                    amount: 0,
                    priceType: 'flat',
                    isExpanded: true
                };
                const updated = [...localServices, newService];
                setLocalServices(updated);
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
          >
            <Plus size={16} className="bg-indigo-100 text-indigo-600 rounded-full p-0.5" />
            Add Manually
          </button>
        </div>

        <AnimatePresence>
          {localServices.length === 0 ? (
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Volume2 className="text-gray-400 w-5 h-5" />
              </div>
              <p className="text-gray-500 font-medium">No services detected</p>
              <p className="text-gray-400 text-sm mt-1">Use the AI extractor or add manually.</p>
            </m.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {localServices.map((service, index) => (
                <m.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white border rounded-xl overflow-hidden transition-all ${
                    service.isExpanded ? 'border-indigo-200 shadow-lg ring-1 ring-indigo-100' : 'border-gray-200 shadow-sm hover:border-gray-300'
                  }`}
                >
                  {/* Card Header */}
                  <div 
                    onClick={() => toggleExpand(service.id)}
                    className="p-4 md:p-5 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${service.isExpanded ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                        {service.isExpanded ? <Edit2 size={18} /> : <Check size={18} />}
                      </div>
                      <div>
                        <h4 className={`font-semibold text-base ${!service.name ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                          {service.name || 'New Service Item'}
                        </h4>
                        <div className="flex items-center gap-3 mt-0.5">
                           {service.duration && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                {service.duration}
                            </span>
                          )}
                          {service.description && (
                            <span className="text-xs text-gray-400 truncate max-w-[150px] hidden sm:block">
                                {service.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                       <span className="font-bold text-lg text-gray-900">
                         ${service.amount}
                       </span>
                       <div className={`p-1.5 rounded-full transition-colors ${service.isExpanded ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                        {service.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                       </div>
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  <AnimatePresence>
                    {service.isExpanded && (
                      <m.div 
                        layout
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 bg-gray-50/50 p-5"
                      >
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Name</label>
                                <Input 
                                    value={service.name}
                                    onChange={(e) => updateService(service.id, 'name', e.target.value)}
                                    placeholder="e.g. Initial Consultation"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Price ($)</label>
                                    <Input 
                                        type="number"
                                        value={service.amount}
                                        onChange={(e) => updateService(service.id, 'amount', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</label>
                                    <Input 
                                        value={service.duration || ''}
                                        onChange={(e) => updateService(service.id, 'duration', e.target.value)}
                                        placeholder="e.g. 30m"
                                    />
                                </div>
                            </div>
                         </div>
                         
                         <div className="mb-5 space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                            <TextArea 
                                value={service.description || ''}
                                onChange={(e) => updateService(service.id, 'description', e.target.value)}
                                rows={2}
                                placeholder="Brief description for the AI to use during calls..."
                            />
                         </div>

                         <div className="flex justify-end items-center pt-2 border-t border-gray-200">
                            <button 
                                onClick={() => removeService(service.id)}
                                className="mr-auto text-red-500 text-xs font-semibold uppercase tracking-wide hover:text-red-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                            <button 
                                onClick={() => toggleExpand(service.id)}
                                className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-wide px-6 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <Check size={14} /> Save Changes
                            </button>
                         </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </m.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Services;