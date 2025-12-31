import React, { useState } from 'react';
import { SetupContext } from './useSetup';

export const SetupProvider = ({ children }: { children: React.ReactNode }) => {
  const [voiceData, setVoiceData] = useState<Blob | File | null>(null);
  const [voiceType, setVoiceType] = useState<'record' | 'upload' | null>(null);
  const [aiVoiceBlob, setAiVoiceBlob] = useState<Blob | null>(null);

  const resetSetup = () => {
    setVoiceData(null);
    setVoiceType(null);
    setAiVoiceBlob(null);
  };

  return (
    <SetupContext.Provider value={{ 
      voiceData, setVoiceData, 
      voiceType, setVoiceType, 
      aiVoiceBlob, setAiVoiceBlob,
      resetSetup 
    }}>
      {children}
    </SetupContext.Provider>
  );
};
