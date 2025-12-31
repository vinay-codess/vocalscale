import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AISummaryProps {
  summary?: string;
}

const AISummary: React.FC<AISummaryProps> = ({ summary }) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [displayedText, setDisplayedText] = useState('');
  
  const content = summary && summary.length > 10 
    ? summary 
    : "Unable to generate summary from this conversation transcript. The call may have been too short or no audio was recorded.";

  const handleGenerate = () => {
    setStatus('generating');
    setTimeout(() => {
      setStatus('completed');
    }, 1500);
  };

  useEffect(() => {
    setStatus('idle');
    setDisplayedText('');
  }, [summary]);

  useEffect(() => {
    if (status === 'completed') {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(content.slice(0, index));
        index++;
        if (index > content.length) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [status, content]);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleGenerate}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">Generate AI Summary</h3>
              </div>
            </div>
          </motion.div>
        )}

        {status === 'generating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={16} className="text-white" />
                </motion.div>
              </div>
              <div className="flex-1 pt-1">
                <motion.div
                  className="text-gray-500 text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Generating summary...
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="flex-1 text-gray-800 text-sm leading-6 whitespace-pre-wrap">
                {displayedText}
                {displayedText.length < content.length && (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 align-middle"
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AISummary;