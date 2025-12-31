import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, CheckCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, metadata: RecordingMetadata) => void;
  onQualityUpdate?: (quality: AudioQuality) => void;
  maxDuration?: number;
  minDuration?: number;
  isRecording?: boolean;
  disabled?: boolean;
  className?: string;
}

interface RecordingMetadata {

  duration: number;
  sampleRate: number;
  channels: number;
  fileSize: number;
  format: string;
  timestamp: number;
  quality?: AudioQuality;
}

interface AudioQuality {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
  recommendations: string[];
}

interface AudioLevels {
  peak: number;
  average: number;
  rms: number;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onQualityUpdate,
  maxDuration = 60,
  minDuration = 3,
  isRecording: externalIsRecording = false,
  disabled = false,
  className = ""
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<AudioLevels>({ peak: 0, average: 0, rms: 0 });
  const [quality, setQuality] = useState<AudioQuality | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  // Sync with external recording state
  useEffect(() => {
    if (externalIsRecording !== isRecording) {
      if (externalIsRecording) {
        startRecording();
      } else {
        stopRecording();
      }
    }
  }, [externalIsRecording]);

  const checkMicrophonePermission = async () => {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionStatus(status.state as 'prompt' | 'granted' | 'denied');
      
      status.addEventListener('change', () => {
        setPermissionStatus(status.state as 'prompt' | 'granted' | 'denied');
      });
    } catch (error) {
      console.log('Permission API not supported');
      setPermissionStatus('unknown');
    }
  };

  const initializeAudioContext = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  };

  const analyzeAudioLevels = useCallback(() => {
    if (!analyserRef.current || !isRecording || isPaused) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate audio levels
    let sum = 0;
    let peak = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i];
      sum += value;
      peak = Math.max(peak, value);
    }
    
    const average = sum / dataArray.length;
    const rms = Math.sqrt(sum / dataArray.length);

    setAudioLevels({
      peak: peak / 255, // Normalize to 0-1
      average: average / 255,
      rms: rms / 255
    });

    // Update duration
    if (startTimeRef.current) {
      const currentDuration = (Date.now() - startTimeRef.current) / 1000;
      setDuration(currentDuration);
      
      // Auto-stop if exceeds max duration
      if (currentDuration >= maxDuration) {
        stopRecording();
      }
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudioLevels);
  }, [isRecording, isPaused, maxDuration]);

  const assessQuality = useCallback(() => {
    if (!audioLevels || duration < minDuration) {
      setQuality({
        score: 0,
        level: 'poor',
        issues: duration < minDuration ? ['Recording too short'] : ['No audio data'],
        recommendations: duration < minDuration 
          ? [`Record at least ${minDuration} seconds`]
          : ['Check your microphone']
      });
      return;
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check recording duration
    if (duration < minDuration) {
      issues.push(`Recording too short: ${duration.toFixed(1)}s`);
      recommendations.push(`Record at least ${minDuration} seconds`);
      score -= 30;
    }

    // Check audio levels
    if (audioLevels.peak < 0.1) {
      issues.push('Audio level too low');
      recommendations.push('Speak louder or move closer to microphone');
      score -= 25;
    } else if (audioLevels.peak > 0.95) {
      issues.push('Audio level too high (possible clipping)');
      recommendations.push('Reduce volume or move away from microphone');
      score -= 20;
    }

    if (audioLevels.average < 0.05) {
      issues.push('Very quiet recording');
      recommendations.push('Ensure you are speaking clearly');
      score -= 15;
    }

    // Determine quality level
    let level: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 85) level = 'excellent';
    else if (score >= 70) level = 'good';
    else if (score >= 50) level = 'fair';
    else level = 'poor';

    const qualityData = { score: Math.max(0, score), level, issues, recommendations };
    setQuality(qualityData);
    onQualityUpdate?.(qualityData);
  }, [audioLevels, duration, minDuration, onQualityUpdate]);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });

      streamRef.current = stream;
      
      // Initialize audio analysis
      if (!initializeAudioContext(stream)) {
        throw new Error('Failed to initialize audio analysis');
      }

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        
        const metadata: RecordingMetadata = {
          duration: duration,
          sampleRate: audioContextRef.current?.sampleRate || 44100,
          channels: 1,
          fileSize: audioBlob.size,
          format: 'webm',
          timestamp: Date.now(),
          quality: quality || undefined
        };

        onRecordingComplete(audioBlob, metadata);
      };

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();
      
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      // Start audio level analysis
      analyzeAudioLevels();

      // Start timer
      timerRef.current = setInterval(() => {
        assessQuality();
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access.');
        setPermissionStatus('denied');
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError('Failed to start recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    startTimeRef.current = null;
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      analyzeAudioLevels();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (isPaused) {
        resumeRecording();
      } else {
        stopRecording();
      }
    } else {
      startRecording();
    }
  };

  const getQualityColor = () => {
    if (!quality) return 'text-gray-500';
    switch (quality.level) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
    }
  };

  const getQualityIcon = () => {
    if (!quality) return null;
    switch (quality.level) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-5 h-5" />;
      case 'fair':
      case 'poor':
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className={`voice-recorder ${className}`}>
      {/* Recording Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {isRecording ? (isPaused ? 'Recording Paused' : 'Recording...') : 'Ready to Record'}
          </span>
          <span className="text-sm text-gray-500">
            {duration.toFixed(1)}s / {maxDuration}s
          </span>
        </div>

        {/* Duration Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              duration < minDuration ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((duration / maxDuration) * 100, 100)}%` }}
          />
        </div>

        {/* Audio Levels */}
        {isRecording && (
          <div className="mb-4">
            <div className="text-xs text-gray-600 mb-1">Audio Levels</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ${
                    audioLevels.peak > 0.9 ? 'bg-red-500' : 
                    audioLevels.peak > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${audioLevels.peak * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 w-12">
                {Math.round(audioLevels.peak * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Quality Assessment */}
        {quality && (
          <div className={`mb-4 p-3 rounded-lg border ${
            quality.level === 'excellent' || quality.level === 'good' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {getQualityIcon()}
              <span className={`font-medium ${getQualityColor()}`}>
                Quality: {quality.level.charAt(0).toUpperCase() + quality.level.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                ({quality.score}/100)
              </span>
            </div>
            
            {quality.issues.length > 0 && (
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-1">Issues:</div>
                <ul className="list-disc list-inside space-y-1">
                  {quality.issues.map((issue, index) => (
                    <li key={index} className="text-xs">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Button */}
      <div className="flex justify-center">
        <button
          onClick={toggleRecording}
          disabled={disabled}
          className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 ${
            disabled 
              ? 'bg-gray-300 cursor-not-allowed' 
              : isRecording 
                ? isPaused 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRecording ? (
            isPaused ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <div className="flex items-center space-x-1">
                <Mic className="w-6 h-6" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              </div>
            )
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Additional Controls */}
      {isRecording && (
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={stopRecording}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Stop
          </button>
        </div>
      )}

      {/* Permission Status */}
      {permissionStatus === 'denied' && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Microphone access was denied. Please enable it in your browser settings.
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
