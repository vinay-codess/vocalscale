import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Play, ThumbsUp, RefreshCw, Check, Sparkles, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSetup } from '../../context/useSetup';
import { api } from '../../lib/api';

// ============================================================================
// CONSTANTS (moved outside to prevent recreation)
// ============================================================================
const STEPS = [
  { threshold: 0, text: "Uploading voice sample..." },
  { threshold: 30, text: "Analyzing audio samples..." },
  { threshold: 60, text: "Building neural voice model..." },
  { threshold: 90, text: "Finalizing voice clone..." }
] as const;

const POLL_INTERVAL = 5000; // Increased to 5 seconds to reduce API load
const MAX_POLL_ATTEMPTS = 36; // 3 minutes total (36 * 5s)

// ============================================================================
// COMPONENT
// ============================================================================
export default function Processing() {
  const navigate = useNavigate();
  const { voiceData, setAiVoiceBlob, aiVoiceBlob } = useSetup();
  
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remoteAudioUrl, setRemoteAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const hasStartedRef = useRef(false);
  const isUploadingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Memoized current step calculation
  const currentStep = useMemo(() => {
    for (let i = STEPS.length - 1; i >= 0; i--) {
      if (progress >= STEPS[i].threshold) {
        return STEPS[i].text;
      }
    }
    return STEPS[0].text;
  }, [progress]);

  // Memoized waveform bars (prevents recalculation on every render)
  const waveformBars = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      height: Math.random() * 80 + 20,
      isEven: i % 2 === 0,
    })),
    []
  );

  // ============================================================================
  // CLEANUP HELPERS
  // ============================================================================
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // ============================================================================
  // AUDIO PLAYER INITIALIZATION
  // ============================================================================
  useEffect(() => {
    if (!isComplete) return;

    let url = "";
    let isBlob = false;

    if (aiVoiceBlob) {
      url = URL.createObjectURL(aiVoiceBlob);
      isBlob = true;
      blobUrlRef.current = url;
    } else if (remoteAudioUrl) {
      // Use the remote URL directly if blob is not available
      url = remoteAudioUrl;
    }

    if (!url) return;

    // Cleanup previous audio first
    cleanupAudio();

    // Create new audio element
    const audio = new Audio(url);
    
    audio.onended = () => {
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    };
    
    audio.onerror = (e) => {
      console.error("Audio playback error:", e);

      // Fallback: If blob failed, try remote URL if available
      // We check isBlob (local var) to ensure we only retry once (switching from blob -> remote)
      if (isBlob && remoteAudioUrl && isMountedRef.current) {
        console.warn("Blob playback failed, falling back to remote URL...");
        setAiVoiceBlob(null); // This will trigger the effect to re-run using remoteAudioUrl
        return;
      }

      if (isMountedRef.current) {
        setError("Failed to play audio sample.");
      }
    };

    audioRef.current = audio;

    // Store blob URL for cleanup
    if (isBlob) {
      blobUrlRef.current = url;
    }

    return cleanupAudio;
  }, [isComplete, aiVoiceBlob, remoteAudioUrl, cleanupAudio, setAiVoiceBlob]);

  // ============================================================================
  // MAIN PROCESSING EFFECT
  // ============================================================================
  useEffect(() => {
    // Track mounted state
    isMountedRef.current = true;

    // Prevent infinite loop if error occurs
    if (error) return;

    // If we already have the blob, skip processing
    if (aiVoiceBlob) {
      setIsComplete(true);
      setProgress(100);
      return;
    }

    // Redirect if no voice data
    if (!voiceData) {
      navigate('/dashboard/voice-model/method');
      return;
    }

    // Check if already complete
    if (isComplete || aiVoiceBlob) {
      // If we already have the blob, ensure the audioRef is updated with the URL from backend if available
      // The useEffect for audio player initialization will handle this if remoteAudioUrl is set.
      return;
    }

    // Check if we are running locally (development mode) to prevent double-firing in StrictMode
    // We can use a window property or just rely on the refs.
    // The refs are sufficient, but we need to be careful about strict mode unmounting/remounting.
    
    // Prevent running twice
    if (hasStartedRef.current || isUploadingRef.current) {
        // console.log("Already processing, skipping duplicate execution");
        return;
    }

    // Set flags synchronously to block any immediate subsequent calls
    hasStartedRef.current = true;
    isUploadingRef.current = true;

    const processVoice = async () => {
      console.log("🚀 STARTING VOICE PROCESSING...");
      
      try {
        if (!voiceData) return;

        // 1. Upload to Backend
        if (isMountedRef.current) setProgress(25);
        console.log("📤 Uploading voice sample...");

        let publicUrl = "";
        const uploaded = await api.uploadVoice(voiceData);
        publicUrl = uploaded.url;
        console.log("✅ Voice sample uploaded successfully:", publicUrl);

        if (!isMountedRef.current) return;
        setProgress(40);

        // 2. Process Voice
        console.log("⚙️ Starting voice cloning process...");
        const data = await api.processVoice(publicUrl);
        console.log("✅ Process started. Clone ID:", data.clone_id);

        if (!isMountedRef.current) return;
        setProgress(50);

        let finalAudioUrl = data.audio_url;

        // Poll if not immediately available
        if (!finalAudioUrl && data.clone_id) {
          console.log("⏳ Voice cloning in progress. Polling for status...");
          let attempts = 0;

          while (attempts < MAX_POLL_ATTEMPTS && isMountedRef.current) {
            attempts++;
            await new Promise(r => setTimeout(r, POLL_INTERVAL));

            if (!isMountedRef.current) return;

            try {
              const statusData = await api.getVoiceStatus(data.clone_id);
              console.log(`📊 Status check (${attempts}/${MAX_POLL_ATTEMPTS}):`, statusData.status);

              if (statusData.status === 'completed' && statusData.sample_url) {
                console.log("🎉 Voice cloning complete!");
                finalAudioUrl = statusData.sample_url;
                break;
              } else if (statusData.status === 'failed') {
                // Break loop on failure instead of throwing to catch block (which retries)
                setError("Voice cloning failed on server. Please try again.");
                break;
              }

              // Update progress based on real polling attempts
              // Map attempts (0-45) to progress (50-90)
              const pollProgress = 50 + Math.floor((attempts / MAX_POLL_ATTEMPTS) * 40);
              setProgress(pollProgress);

            } catch (pollErr) {
              console.warn("Poll failed, retrying...", pollErr);
            }
          }

          // If finalAudioUrl was not set (e.g. failed), don't try to download
          if (!finalAudioUrl && error) {
             // Stop here, error is already set
             return;
          }
          
          if (!finalAudioUrl && isMountedRef.current) {
            throw new Error("Processing timed out. Please try again.");
          }
        }

        // 3. Download Audio
        if (finalAudioUrl) {
          // If the URL is a blob: URL (local preview), we can't fetch it again easily if it was revoked.
          // But here finalAudioUrl comes from the backend, so it should be a remote URL.
          
          if (isMountedRef.current) {
            setProgress(95);
            setRemoteAudioUrl(finalAudioUrl);
          }

          try {
            // Check if it's a valid URL before fetching
            new URL(finalAudioUrl); 
            
            const audioResponse = await fetch(finalAudioUrl);
            
            if (audioResponse.ok) {
              const audioBlob = await audioResponse.blob();
              
              if (isMountedRef.current) {
                setAiVoiceBlob(audioBlob);
                setProgress(100);
                setIsComplete(true);
              }
            } else {
               // If fetch fails (e.g. 404), check if we can fallback to just playing the URL
               console.warn(`Failed to download blob (Status: ${audioResponse.status}), using direct URL`);
               if (isMountedRef.current) {
                 // Even if blob fails, we have setRemoteAudioUrl above, so the player will use that.
                 setProgress(100);
                 setIsComplete(true);
               }
            }
          } catch (fetchErr) {
            console.warn("⚠️ Failed to download blob (likely CORS or Access), using direct URL", fetchErr);
            
            if (isMountedRef.current) {
              // Even if blob fails, we have setRemoteAudioUrl above, so the player will use that.
              setProgress(100);
              setIsComplete(true);
            }
          }
        } else {
          throw new Error("No audio URL returned from backend.");
        }

      } catch (err: unknown) {
        console.error("Processing error:", err);
        
        if (isMountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
          setError(errorMessage);
        }
        
        // Reset flags on error so user can retry
        hasStartedRef.current = false;
        isUploadingRef.current = false;
      }
    };

    processVoice();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      // clearUploadTimer removed
    };
  }, [voiceData, navigate, aiVoiceBlob, isComplete, setAiVoiceBlob, error]); // clearUploadTimer removed from deps

  // ============================================================================
  // COMPONENT UNMOUNT CLEANUP
  // ============================================================================
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanupAudio();
    };
  }, [cleanupAudio]); // clearUploadTimer removed from deps

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => {
        console.error("Playback failed:", err);
        setError("Failed to play audio.");
      });
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleTryAgain = useCallback(() => {
    navigate('/dashboard/voice-model/record');
  }, [navigate]);

  const handleSoundsGreat = useCallback(() => {
    navigate('/dashboard/voice-model/preview');
  }, [navigate]);

  // ============================================================================
  // ERROR STATE RENDER
  // ============================================================================
  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-red-50 border border-red-200 rounded-xl text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Processing Failed</h2>
          <p className="text-red-600 mb-6">{error}</p>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleTryAgain}
              className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto w-full py-8">
        <ProgressBar step={3} totalSteps={4} title="Processing" progress={75} />

        <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-2xl shadow-slate-100/50 relative overflow-hidden">
            
            {/* Animated Background Blob */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-50/50 rounded-full blur-[100px] -z-10 animate-pulse-slow"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col items-center">
              {!isComplete ? (
                /* ============ LOADING STATE ============ */
                <div className="w-full">
                  <div className="relative w-40 h-40 mx-auto mb-10">
                    {/* Outer Rings */}
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                    <div className="absolute inset-4 border-4 border-slate-50 rounded-full" />

                    {/* Spinning Gradient Ring */}
                    <div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-l-indigo-500 animate-spin"
                      style={{ animationDuration: '1.5s' }}
                    />

                    {/* Inner Icon */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full m-2 shadow-inner">
                      <Sparkles className="text-indigo-500 animate-pulse" size={40} />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                    {Math.round(progress)}% Complete
                  </h2>
                  <p className="text-slate-500 text-lg animate-pulse font-medium">
                    {currentStep}
                  </p>

                  {/* Progress Bar Detail */}
                  <div className="w-64 mx-auto mt-8 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                /* ============ SUCCESS STATE ============ */
                <div className="animate-in zoom-in duration-500 w-full">
                  {/* Success Icon */}
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100/50 border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md animate-bounce-short">
                      <Check size={24} strokeWidth={4} />
                    </div>
                  </div>

                  <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                    Your Voice is Ready!
                  </h1>
                  <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                    We've successfully cloned your voice model. Listen to the sample below to verify the quality before proceeding.
                  </p>

                  {/* Audio Card */}
                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mb-10 text-left relative overflow-hidden group hover:border-indigo-200 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />

                    <div className="flex items-start gap-4 mb-6">
                      <div className="text-4xl">❝</div>
                      <p className="text-slate-700 text-lg font-medium italic leading-relaxed pt-2">
                        Hi there! I'm your new AI receptionist. I can handle your calls, schedule appointments, and answer questions just like you would. How does this sound?
                      </p>
                    </div>

                    <div className="flex items-center gap-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <button
                        onClick={togglePlay}
                        className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95 flex-shrink-0"
                        aria-label={isPlaying ? "Pause audio" : "Play audio"}
                      >
                        {isPlaying ? (
                          <Pause size={24} fill="currentColor" />
                        ) : (
                          <Play size={24} className="ml-1" fill="currentColor" />
                        )}
                      </button>

                      <div className="flex-1 h-12 flex items-center">
                        {/* Audio Waveform Visualization - Optimized */}
                        <div className="w-full flex items-center justify-between gap-1 h-8">
                          {waveformBars.map(({ id, height, isEven }) => (
                            <div
                              key={id}
                              className={`w-1.5 rounded-full transition-all duration-100 ${
                                isEven ? 'bg-indigo-400' : 'bg-indigo-200'
                              } ${isPlaying ? 'animate-music-bar' : ''}`}
                              style={{
                                height: isPlaying ? `${height}%` : '20%',
                                animationDelay: `${id * 0.05}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={handleTryAgain}
                      className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
                    >
                      <RefreshCw size={18} /> Record Again
                    </button>
                    <button
                      onClick={handleSoundsGreat}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1"
                    >
                      <ThumbsUp size={18} /> Sounds Great
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}