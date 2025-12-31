import { createContext, useContext } from 'react';

export interface SetupContextType {
  voiceData: Blob | File | null;
  setVoiceData: (data: Blob | File | null) => void;
  voiceType: 'record' | 'upload' | null;
  setVoiceType: (type: 'record' | 'upload' | null) => void;
  aiVoiceBlob: Blob | null;
  setAiVoiceBlob: (data: Blob | null) => void;
  resetSetup: () => void;
}

export const SetupContext = createContext<SetupContextType>({
  voiceData: null,
  setVoiceData: () => {},
  voiceType: null,
  setVoiceType: () => {},
  aiVoiceBlob: null,
  setAiVoiceBlob: () => {},
  resetSetup: () => {},
});

export const useSetup = () => {
  return useContext(SetupContext);
};
