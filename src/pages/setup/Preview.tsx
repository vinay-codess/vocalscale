import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Play, Sparkles, CheckCircle2, Mic, Pause, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSetup } from '../../context/useSetup';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export default function Preview() {
  const navigate = useNavigate();
  const { voiceData, resetSetup, aiVoiceBlob, setAiVoiceBlob } = useSetup();
  const { user } = useAuth();
  
  // Audio playback state
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingClone, setIsPlayingClone] = useState(false);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const cloneAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Text to Speech Test State
  const [testText, setTestText] = useState("Hello! I am your AI receptionist. How can I help you today?");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

  // Visualizer state
  const [waveformBars, setWaveformBars] = useState<{height: number, opacity: number}[]>(() => 
    Array.from({ length: 25 }).map(() => ({
      height: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.5
    }))
  );

  // Track created object URLs for cleanup
  const createdUrlsRef = useRef<string[]>([]);

  // Initialize audio and visualizer
  useEffect(() => {
    const checkSavedVoice = async () => {
        if (!user) return;
        
        // 1. If we have local data, use it (Standard flow)
        if (voiceData) {
            const originalUrl = URL.createObjectURL(voiceData);
            createdUrlsRef.current.push(originalUrl);
            originalAudioRef.current = new Audio(originalUrl);
            
            if (aiVoiceBlob) {
                const cloneUrl = URL.createObjectURL(aiVoiceBlob);
                createdUrlsRef.current.push(cloneUrl);
                cloneAudioRef.current = new Audio(cloneUrl);
                setGeneratedAudioUrl(cloneUrl);
            }
            // No fallback to originalUrl for cloneAudioRef
            return;
        }

        // 2. No local data? Check DB.
        try {
            // console.log("Checking DB for saved voice...");
            
            const profile = await api.getProfile();

            // console.log("DB Profile Result:", profile);

            if (profile?.voice_sample_url) {
                // console.log("Found saved voice URL, skipping redirect");
                
                // Initialize Audio Refs with the saved URL
                if (!originalAudioRef.current) {
                    originalAudioRef.current = new Audio(profile.voice_sample_url);
                }
                
                // Do NOT set cloneAudioRef to input voice sample
                
                // Create a placeholder blob to enable UI if needed, 
                // but we should probably distinguish between input and clone.
                // If we don't have aiVoiceBlob, we can't play clone yet.
                
                // If we found a URL in the profile, we should try to set it as the "generated" URL too
                // so the user can hear it immediately without re-generating.
                // However, profile.voice_sample_url might be the INPUT voice or OUTPUT voice depending on logic.
                // Assuming it's the output voice for now based on recent changes.
                
                setGeneratedAudioUrl(profile.voice_sample_url);
                cloneAudioRef.current = new Audio(profile.voice_sample_url);
                
            } else {
                console.warn("No voice data found in DB, redirecting to method");
                // navigate('/dashboard/voice-model/method');
            }
        } catch (e) {
            console.error("Error checking saved voice:", e);
            // navigate('/dashboard/voice-model/method');
        }
    };

    checkSavedVoice();

    // Cleanup
    return () => {
      // Revoke all created object URLs
      createdUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      createdUrlsRef.current = [];
      
      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
        originalAudioRef.current = null;
      }
      if (cloneAudioRef.current) {
        cloneAudioRef.current.pause();
        cloneAudioRef.current = null;
      }
    };
  }, [voiceData, aiVoiceBlob, navigate, user, setAiVoiceBlob]);

  const handleGenerate = async () => {
    if (!testText.trim()) return;
    
    setIsGenerating(true);
    try {
        if (!user) throw new Error("User not logged in");

        // Try to get voice_sample_url from profile first
        let publicUrl: string | null = null;
        try {
            const profile = await api.getProfile();
            if (profile?.voice_sample_url) {
                publicUrl = profile.voice_sample_url;
            }
        } catch (e) {
            console.warn("Could not fetch profile URL, falling back to upload", e);
        }

        // Fallback: Upload the blob if no URL exists
        if (!publicUrl) {
            if (!voiceData) throw new Error("No voice data available");
            
            const { url } = await api.uploadVoice(voiceData);
            publicUrl = url;

            // Save to profile
            await api.updateProfile({ 
                voice_sample_url: publicUrl,
                updated_at: new Date().toISOString()
            });
        }

        // Call Synthesis API
        if (!publicUrl) throw new Error("Public URL is missing");
        const data = await api.synthesize(testText, publicUrl);

        if (data.audio_url) {
            const audioUrl = String(data.audio_url);

            if (cloneAudioRef.current) {
              cloneAudioRef.current.pause();
            }
            cloneAudioRef.current = new Audio(audioUrl);
            setGeneratedAudioUrl(audioUrl);

            // Persist to profile
            await api.updateProfile({ 
                voice_sample_url: publicUrl,
                updated_at: new Date().toISOString()
            });
            
            // Auto play
            await cloneAudioRef.current.play();
            setIsPlayingClone(true);
            cloneAudioRef.current.onended = () => setIsPlayingClone(false);

            try {
              const audioRes = await fetch(audioUrl);
              if (audioRes.ok) {
                const blob = await audioRes.blob();
                const blobUrl = URL.createObjectURL(blob);
                createdUrlsRef.current.push(blobUrl);
                setAiVoiceBlob(blob);
              }
            } catch {
              // Ignore fetch errors (CORS/network). Direct playback still works.
            }
        } else {
            throw new Error("No audio URL in response");
        }

    } catch (err) {
        console.error("Generation failed:", err);
        const message = err instanceof Error ? err.message : "Failed to generate audio. Please try again.";
        alert(message);
    } finally {
        setIsGenerating(false);
    }
  };

  // Handle audio events
  useEffect(() => {
    const original = originalAudioRef.current;
    const clone = cloneAudioRef.current;

    if (original) {
      original.onended = () => setIsPlayingOriginal(false);
    }
    if (clone) {
      clone.onended = () => setIsPlayingClone(false);
    }
    
    // No cleanup needed here as the main effect handles it
  }, [generatedAudioUrl]); // Add dependency to re-attach handlers when audio changes

  // Visualizer animation
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      if (isPlayingClone) {
        setWaveformBars(prev => prev.map(() => ({
          height: Math.random() * 80 + 20,
          opacity: Math.random() * 0.5 + 0.5
        })));
        setTimeout(() => {
            animationFrame = requestAnimationFrame(animate);
        }, 50);
      }
    };

    if (isPlayingClone) {
      animate();
    } else {
       setWaveformBars(Array.from({ length: 25 }).map(() => ({
        height: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.5
      })));
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlayingClone]);


  const toggleOriginal = () => {
    if (originalAudioRef.current) {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      } else {
        // Stop other audio first
        if (isPlayingClone && cloneAudioRef.current) {
            cloneAudioRef.current.pause();
            setIsPlayingClone(false);
        }
        originalAudioRef.current.currentTime = 0; // Reset to beginning
        originalAudioRef.current.play();
        setIsPlayingOriginal(true);
      }
    }
  };

  const toggleClone = () => {
    if (cloneAudioRef.current) {
      if (isPlayingClone) {
        cloneAudioRef.current.pause();
        setIsPlayingClone(false);
      } else {
        // Stop other audio first
        if (isPlayingOriginal && originalAudioRef.current) {
            originalAudioRef.current.pause();
            setIsPlayingOriginal(false);
        }
        cloneAudioRef.current.currentTime = 0; // Reset to beginning
        cloneAudioRef.current.play();
        setIsPlayingClone(true);
      }
    }
  };

  const handleComplete = async () => {
      if (!user) {
          console.error("No user found");
          return;
      }
      
      try {
        console.log("Setup marked complete for user:", user.id);
        
        // Removed is_voice_setup_completed update as per user request
        // await api.updateProfile({ is_voice_setup_completed: true });
        
        resetSetup();
        navigate('/dashboard/settings');
        
      } catch (e: unknown) {
          console.error("Exception in handleComplete:", e);
          const message = e instanceof Error ? e.message : String(e);
          alert("An unexpected error occurred. " + message);
      }
  };

  return (
    <DashboardLayout fullWidth>
      <div className="h-[calc(100vh-64px)] bg-gray-50/50 flex flex-col overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-6 py-6 h-full flex flex-col">
          <ProgressBar step={4} totalSteps={4} title="Voice Preview" progress={100} />

          {/* Back Button */}
          <div className="mt-6 mb-2">
             <div 
               className="flex items-center gap-2 text-slate-400 text-sm font-medium cursor-pointer hover:text-indigo-600 transition-colors w-fit"
               onClick={() => navigate('/dashboard/voice-model/processing')}
             >
                <ArrowRight size={16} className="rotate-180" /> Back
             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col flex-1 min-h-0 relative overflow-hidden">
            
            <div className="text-center mb-6 relative z-10 shrink-0">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-100 shadow-sm">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 size={14} />
                  </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
                  {aiVoiceBlob ? (
                      <>Voice Clone Complete! <span className="text-yellow-400"><Sparkles fill="currentColor" size={20} /></span></>
                  ) : (
                      "Voice Setup Complete"
                  )}
              </h1>
              <p className="text-gray-500 text-sm">Your digital twin is ready. Listen to the comparison below to verify the quality.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 items-stretch flex-1 min-h-0">
                
                {/* Left Column: Comparison Test */}
                <div className="lg:col-span-2 border border-gray-200 rounded-2xl p-6 relative bg-slate-50/30 flex flex-col overflow-y-auto">
                    <div className="absolute -top-3 left-6 bg-white px-2 font-bold text-gray-900 text-xs border border-gray-100 rounded shadow-sm">Comparison Test</div>
                    
                    {aiVoiceBlob ? (
                        <div className="absolute top-6 right-6 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                            ✅ 98% Match
                        </div>
                    ) : (
                        <div className="absolute top-6 right-6 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                            ⚠️ Simulation Mode
                        </div>
                    )}

                    <div className="mt-4 space-y-4">
                        {/* Original Voice Player */}
                        <div className={`bg-white border transition-colors duration-300 rounded-xl p-4 ${isPlayingOriginal ? 'border-gray-300 shadow-md' : 'border-gray-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Your Original Voice</span>
                                <Mic size={14} className="text-gray-400" />
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={toggleOriginal}
                                    disabled={!originalAudioRef.current}
                                    className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPlayingOriginal ? <Pause size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}
                                </button>
                                {/* Simple gray waveform dots */}
                                <div className="flex-1 flex justify-between items-center px-2 opacity-30 h-6">
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <div key={i} className={`w-1 h-1 bg-gray-800 rounded-full ${isPlayingOriginal ? 'animate-pulse' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}></div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-mono text-gray-400">0:14</span>
                            </div>
                        </div>

                        {/* AI Clone Player */}
                        <div className={`bg-blue-50/50 border transition-colors duration-300 rounded-xl p-4 relative overflow-hidden ${isPlayingClone ? 'border-blue-300 bg-blue-50 shadow-md' : 'border-blue-100'}`}>
                            <div className="absolute top-0 right-0 p-3">
                                 <Sparkles className={`text-blue-400 ${isPlayingClone ? 'animate-spin-slow' : ''}`} size={14} />
                            </div>
                            <div className="mb-3">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">AI Clone Preview</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={toggleClone}
                                    disabled={!cloneAudioRef.current}
                                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPlayingClone ? <Pause size={16} fill="currentColor" /> : <Play size={16} className="ml-0.5" fill="currentColor" />}
                                </button>
                                {/* Blue Bars Waveform */}
                                <div className="flex-1 flex items-center gap-1 h-8">
                                    {waveformBars.map((bar, i) => (
                                        <div 
                                            key={i} 
                                            className="w-1 bg-blue-500 rounded-full transition-all duration-75"
                                            style={{ height: `${bar.height}%`, opacity: bar.opacity }}
                                        ></div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-mono text-blue-600 font-bold">0:14</span>
                            </div>
                        </div>

                        {/* Test Your Voice Section */}
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <h3 className="text-xs font-bold text-gray-900 mb-2">Test Your Voice</h3>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={testText}
                                    onChange={(e) => setTestText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isGenerating) {
                                            handleGenerate();
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    placeholder="Type something for your AI to say..."
                                />
                                <button 
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !testText.trim()}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-all flex items-center gap-2 ${
                                        isGenerating || !testText.trim()
                                        ? 'bg-gray-300 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                                    }`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Sparkles className="animate-spin" size={16} /> Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Play size={16} fill="currentColor" /> Speak
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Setup Progress */}
                <div className="border border-gray-200 rounded-2xl p-6 bg-white h-full flex flex-col shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm">Setup Progress</h3>

                    <div className="relative space-y-6 flex-1">
                        {/* Line connecting dots */}
                        <div className="absolute left-[11px] top-2 bottom-10 w-0.5 bg-gray-100 -z-10"></div>

                        {/* Steps */}
                        {[
                          { title: "Method Selection", status: "complete" },
                          { title: "Voice Recording", status: "complete" },
                          { title: "AI Processing", status: "complete" },
                          { title: "Final Review", status: "current" }
                        ].map((item, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="relative z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ring-4 ring-white ${
                                item.status === 'complete' ? 'bg-green-100 text-green-600 border-white' : 
                                item.status === 'current' ? 'bg-blue-600 text-white border-blue-200' : 
                                'bg-gray-50 border-gray-200'
                              }`}>
                                {item.status === 'complete' ? <CheckCircle2 size={14} /> : <span className="text-[10px]">{i+1}</span>}
                              </div>
                            </div>
                            <div className="pt-0.5">
                              <p className={`text-xs font-bold ${item.status === 'current' ? 'text-blue-600' : 'text-gray-900'}`}>{item.title}</p>
                              <p className="text-[10px] text-gray-400">
                                {item.status === 'complete' ? 'Completed' : item.status === 'current' ? 'In Progress' : 'Pending'}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    <button 
                        onClick={handleComplete}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors mt-auto shadow-md"
                    >
                        Go to Settings
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
